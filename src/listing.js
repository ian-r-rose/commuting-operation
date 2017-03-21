import React, { Component } from 'react';
import { 
  getPredictionsForStop, 
  getDirectionForLine, getNearestStop
} from './nextbus';

import './listing.css';
import clear from './clear.svg';

export
class LineListing extends Component {
  render() {
    let lines = this.props.lines;
    let listing = [];
    for (let line of lines) {
      listing.push(<Line key={JSON.stringify(line)} line={line} remove={(id)=>{this.removeLine(id);}} />);
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
  constructor(props) {
    super(props);
    this.state = {
      stop: {
        id: '',
        displayId: 'Getting location...',
        distanceFromUser: undefined
      }
    };
  }

  render() {
    return (
      <div className="Line">
        <LineInfo line={this.props.line} stop={this.state.stop} />
        <Prediction line={this.props.line} stop={this.state.stop} />
        <img height="20px" src={clear} alt="Remove route" onClick={()=>{this.props.remove(this.props.line.id)}}/>
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
class LineInfo extends Component {
  render() {
    let direction = getDirectionForLine(this.props.line);
    return (
      <div className="LineInfo">
        <div className="LineId">{this.props.line.displayId}</div>
        <div className="LineGeography">
          <div className="LineDirection">{direction.displayId}</div>
          <div className="StopLocation">{this.props.stop.displayId}</div>
        </div>
      </div>
    );
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
    if(this.props.stop.id) {
      this.updatePrediction();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.props.stop.id && prevProps.stop.id !== this.props.stop.id) {
      this.updatePrediction();
    }
  }

  updatePrediction() {
    getPredictionsForStop(this.props.line, this.props.stop).then((pred) => {
      this.setState({ prediction: pred });
    });
  }
}
