import React, { Component } from 'react';
import { getAgencyList, getLinesForAgency, getLineForId } from './nextbus';
import './dialog.css';

let agencyPreference = localStorage.getItem('agencyPreference');
if (!agencyPreference) {
  agencyPreference = 'actransit';
}

let changeoverTimePreference = localStorage.getItem('changeoverTimePreference');
if (!changeoverTimePreference) {
  changeoverTimePreference = 12;
}

export
class AddLineDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentAgency: agencyPreference,
      currentLine: undefined,
      currentDirection: undefined,
      currentChangeover: changeoverTimePreference,
      agencyListing: undefined,
      lineListing: undefined,
      directionListing: undefined
    }
  }

  render() {
    //Don't render if the dialog is closed.
    if(this.props.isOpen === false) {
      return null;
    }

    let agencies = undefined;
    if(this.state.agencyListing) {
      agencies = [];
      for (let agency of this.state.agencyListing) {
        agencies.push(<option key={agency.id} value={agency.id}>{agency.displayId}</option>);
      }
    }
    let lines = undefined;
    if(this.state.lineListing) {
      lines = [];
      for (let line of this.state.lineListing) {
        lines.push(<option key={line.id} value={line.id}>{line.displayId}</option>);
      }
    }
    let directions = undefined;
    if(this.state.directionListing) {
      directions = [];
      for (let direction of this.state.directionListing) {
        directions.push(<option key={direction.id} value={direction.id}>{direction.displayId}</option>);
      }
    }
    return (
        <div className="AddLineDialog">
          <p>Hello, world</p>
          <select onChange={(value)=>{this.handleAgencySelection(value);}} selected={this.state.currentAgency}>
            {agencies}
          </select>
          <br/>
          <select onChange={(value)=>{this.handleLineSelection(value);}}>
            {lines}
          </select>
          <br/>
          <select onChange={(value)=>{this.handleDirectionSelection(value);}}>
            {directions}
          </select>
        </div>
    );
  }

  componentDidMount() {
    getAgencyList().then((agencies)=>{
      this.setState({
        agencyListing: agencies,
      });
      this.updateAgency(this.state.currentAgency);
    });
  }

  handleAgencySelection(event) {
    this.updateAgency(event.target.value);
  }

  updateAgency(agency) {
    //Query for all the lines for this agency
    let lineListingPromise = getLinesForAgency(agency);

    //Cache the selected agency as the preferred one.
    localStorage.setItem('agencyPreference', agency);
    agencyPreference = agency;

    lineListingPromise.then((lines)=>{
      this.setState({
        lineListing: lines,
        currentAgency: agency
      });
      this.updateLine(lines[0].id);
    });
  }

  handleLineSelection(event) {
    this.updateLine(event.target.value);
  }

  updateLine(lineId) {
    getLineForId(this.state.currentAgency, lineId).then((line)=>{
      this.setState({
        currentLine: line.id,
        directionListing: line.direction
      });
      this.updateDirection(line.direction[0]);
    });
  }

  handleDirectionSelection(event) {
    this.updateDirection(event.target.value);
  }
    
  updateDirection(directionId) {
    this.setState({
      currentDirection: directionId
    });
  } 
}

