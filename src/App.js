import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { LineListing } from './components';

let lineIds = ['12', '57', '6', '18', '72']


class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" style={{display: 'inline-block'}}/>
          <h1 style={{display: 'inline-block'}}>Commuting<br/>Operation</h1>
        </div>
        <LineListing lineIds={lineIds} />
      </div>
    );
  }
}

export default App;
