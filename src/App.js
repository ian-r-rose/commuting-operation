import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { getPredictions } from './commuting';

let line = {
  id: '18',
  displayId: '18',
  direction: '18_9_0',
  displayDirection: ''
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
              <Prediction line={line} />
              <Prediction line={line} />
              <Prediction line={line} />
              <Prediction line={line} />
        </div>
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
        <p>Line: {this.props.line.displayId}</p>
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
