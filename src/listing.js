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
    let i = 0;
    for (let line of lines) {
      listing.push(<Line even={!!(i%2 === 0)} key={JSON.stringify(line)} line={line} remove={(id)=>{this.removeLine(id);}} />);
      i++;
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
    let className;
    if(this.props.even === true) {
      className = "Line Even";
    } else {
      className = "Line Odd";
    }
    return (
      <div className={className}>
        <LineInfo line={this.props.line} stop={this.state.stop} />
        <Prediction line={this.props.line} stop={this.state.stop} />
        <img className="RemoveButton" src={clear} alt="Remove route" onClick={()=>{this.props.remove(this.props.line.id)}}/>
      </div>
    );
  }

  componentDidMount() {
    this.updateStop();
    this._timer = setInterval(()=>{this.updateStop();}, 120000);
  }

  componentWillUnmount() {
    clearInterval(this._timer);
  }

  updateStop() {
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
    let displayDirection = direction.displayId.charAt(0).toLowerCase()
      + direction.displayId.slice(1);
    return (
      <div className="LineInfo">
        <div className="LineId">{this.props.line.displayId}</div>
        <div className="LineGeography">
          <div className="StopLocation">{this.props.stop.displayId+' '+displayDirection}</div>
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

    //Set a timer for 30 seconds between updates.
    this._timer = setInterval(()=>{this.updatePrediction();}, 30000);
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

  componentWillUnmount() {
    clearInterval(this._timer);
  }
}
