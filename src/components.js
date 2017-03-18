import React, { Component } from 'react';
import { 
  getLineForId, getPredictions, 
  getDirectionForLine, getNearestStop
} from './nextbus';

import './components.css';

let agency = 'actransit'

export
class LineListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lines: []
    }
  }
  render() {
    let lines = this.state.lines;
    let listing = [];
    for (let line of lines) {
      listing.push(<Line key={line.id} line={line} />);
    }
    return (
      <div className="LineListing">
        {listing}
      </div>
    );
  }

  componentDidMount() {
    this._getLines(this.props.lineIds).then((lines)=>{
      this.setState({ lines: lines });
    });
  }

  _getLines(lineIds) {
    // Load the stored lines, if any.
    let storedLines = JSON.parse(localStorage.getItem('lines'));
    if (!storedLines) {
      storedLines = [];
    }

    let promises = [];
    let lines = [];
    for (let lineId of this.props.lineIds) {
      let current = storedLines.find( (line)=> { return line.id === lineId; });
      if (current) {
        lines.push(current);
      } else {
        promises.push( getLineForId(agency, lineId));
      }
    }
    return Promise.all(promises).then((retrieved)=>{
      lines = lines.concat(retrieved);
      localStorage.setItem('lines', JSON.stringify(lines));
      return lines;
    });
  }
}

export
class Line extends Component {
  render() {
    return (
      <div className="Line">
        <LineInfo line={this.props.line} />
        <Prediction line={this.props.line} />
      </div>
    );
  }
}

export
class LineInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stop: {
        displayId: 'Getting location...'
      }
    }
  }

  render() {
    let direction = getDirectionForLine(this.props.line);
    return (
      <div className="LineInfo">
        <div className="LineId">{this.props.line.displayId}</div>
        <div className="LineGeography">
          <div className="LineDirection">{direction.displayId}</div>
          <div className="StopLocation">{this.state.stop.displayId}</div>
        </div>
      </div>
    );
  }



  componentDidMount() {
    let direction = getDirectionForLine(this.props.line);
    getNearestStop(this.props.line, direction).then((stop)=>{
      this.setState({
        stop: stop
      });
    });
  }
}


export
class Prediction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      prediction: [{
        time: 'loading...',
        isReliable: false,
        isDelayed: false
      }]
    }
  }

  render() {
    let predictions = [];
    let count = 0;
    for (let prediction of this.state.prediction) {
      let c = "Prediction";
      if (!prediction.isReliable) {
        c = c + " Unreliable";
      }
      predictions.push(<div key={count++} className={c}>{prediction.time}</div>);
    }
    return (
      <div className="PredictionList">
        {predictions}
      </div>
    );
  }

  componentDidMount() {
    getPredictions('actransit', this.props.line.id).then((pred)=>{
      this.setState({ prediction: pred });
    });
  }
}
