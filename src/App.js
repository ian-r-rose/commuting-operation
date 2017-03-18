import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { Line, LineInfo, Prediction } from './components';

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

export default App;
