import React, { Component } from 'react';
import logo from './logo.svg';
import clear from './clear.svg';
import add from './add.svg';
import './app.css';
import './components.css';

import { LineListing } from './components';
import { AddLineDialog } from './dialog';

let lineIds = ['12', '57', '6', '18', '72']


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      agencyPreference: props.agencyPreference,
      changeoverTimePreference: props.changeoverTimePreference,
      modalOpen: false
    };
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h1>Commuting Operation</h1>
          <img height="50px" src={clear} alt="Remove route" onClick={()=>{this.closeModal()}}/>
          <img height="50px" src={add} alt="Add route" onClick={()=>{this.openModal()}} />
        </div>
        <AddLineDialog isOpen={this.state.modalOpen} onClose={()=>{this.closeModal()}} />
        <LineListing lineIds={lineIds} />
      </div>
    );
  }

  openModal() {
    this.setState( {
      modalOpen: true
    });
  }

  closeModal() {
    this.setState( {
      modalOpen: false
    });
  }
}

export default App;
