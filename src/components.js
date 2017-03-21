import React, { Component } from 'react';
import { 
  getPredictions, 
  getDirectionForLine, getNearestStop
} from './nextbus';

import './components.css';
import './clear.svg';

export
class LineListing extends Component {
  render() {
    let lines = this.props.lines;
    let listing = [];
    for (let line of lines) {
      listing.push(<Line key={JSON.stringify(line)} line={line} />);
    }
    return (
      <div className="LineListing">
        {listing}
      </div>
    );
  }

  addLine(line) {
    this.props.addLine(line);
  }

  removeLine(lineId) {
    this.props.removeLine(lineId);
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
        c += " Unreliable";
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
    getPredictions(this.props.line).then((pred)=>{
      this.setState({ prediction: pred });
    });
  }
}
