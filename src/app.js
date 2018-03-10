import React, {Component} from 'react';
import logo from './logo.svg';
import add from './add.svg';
import './app.css';
import './listing.css';

import {LineListing} from './listing';
import {AddLineDialog} from './dialog';

/**
 * The toplevel component for Commuting Operation.
 *
 * props: none.
 *
 * state: A list of `LineModels` selected by the user,
 *        and whether the `AddLine` dialog is open.
 */
class App extends Component {
  constructor(props) {
    super(props);

    let lines = this.getStoredLines();

    this.state = {
      modalOpen: false,
      lines: lines,
    };
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>&nbsp; Commuting Operation &nbsp;</h1>
          <img
            className="AddLineButton"
            height="50px"
            src={add}
            alt="Add route"
            onClick={() => {
              this.openModal();
            }}
          />
        </div>
        <AddLineDialog
          isOpen={this.state.modalOpen}
          onClose={() => {
            this.closeModal();
          }}
          addLine={line => {
            this.addLine(line);
          }}
        />
        <LineListing
          lines={this.state.lines}
          removeLine={line => {
            this.removeLine(line);
          }}
        />
      </div>
    );
  }

  openModal() {
    this.setState({
      modalOpen: true,
    });
  }

  closeModal() {
    this.setState({
      modalOpen: false,
    });
  }

  /**
   * Add a new `LineModel` to the app state.
   */
  addLine(line) {
    //Don't add duplicate lines, which would be
    //redundant, and makes it tricky to set up
    //React keys.
    if (this.isDuplicate(line)) {
      return;
    }
    let lines = this.state.lines;
    lines.push(line);
    this.setState({
      lines: lines,
    });
    //update the cache
    localStorage.setItem('lines', JSON.stringify(lines));
  }

  /**
   * Remove a `LineModel` from the app state, based
   * on the lineId.
   */
  removeLine(line) {
    let lines = this.state.lines;
    lines = lines.filter(l => l !== line);
    this.setState({
      lines: lines,
    });
    //update the cache
    localStorage.setItem('lines', JSON.stringify(lines));
  }

  /**
   * Get any lines that have been cached in the
   * user's localStorage.
   */
  getStoredLines() {
    // Load the stored lines, if any.
    let storedLines = JSON.parse(localStorage.getItem('lines'));
    if (!storedLines) {
      storedLines = [];
    }

    return storedLines;
  }

  /**
   * Check whether a givin `LineModel` is a duplicate
   * of an already existing one.
   */
  isDuplicate(line) {
    for (let l of this.state.lines) {
      if (JSON.stringify(l) === JSON.stringify(line)) {
        return true;
      }
    }
    return false;
  }
}

export default App;
