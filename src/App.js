import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { getPredictions, getDirectionForLine } from './commuting';

let line = {
  agency: 'actransit',
  id: '18',
  displayId: '18',
  direction: [{
    id: '18_9_0',
    displayId: 'To Montclair'
    }, {
    id: '18_9_0',
    displayId: 'To Montclair'
  }],
  changeoverTime: 12
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Commuting Operation</h2>
        </div>
        <div>
          <Line line={line} />
          <Line line={line} />
          <Line line={line} />
          <Line line={line} />
        </div>
      </div>
    );
  }
}

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

class LineInfo extends Component {
  render() {
    let direction = getDirectionForLine(this.props.line);
    return (
      <div className="LineInfo">
        <span>{line.displayId+' '}</span>
        <span>{direction.displayId}</span>
      </div>
    );
  }
}

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
    return (
      <div className="Prediction">
        <p>Prediction: {this.state.prediction[0].time}</p>
      </div>
    );
  }

  componentDidMount() {
    getPredictions('actransit', '18').then((pred)=>{
      this.setState({ prediction: pred });
    });
  }
}

export default App;
