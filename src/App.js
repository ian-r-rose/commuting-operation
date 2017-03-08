import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { getPredictions } from './commuting';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Commuting Operation</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}


class PredictionComponent extends Component {
  constructor(props) {
    super(props);
  }
}

getPredictions().then((pred)=>{
  console.log(pred);
});

export default App;
