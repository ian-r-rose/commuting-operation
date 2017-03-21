import React, { Component } from 'react';
import { getAgencyList, getLinesForAgency, getLineForId } from './nextbus';
import './dialog.css';

let agencyPreference = localStorage.getItem('agencyPreference');
if (!agencyPreference) {
  agencyPreference = 'actransit';
}

let changeoverTimePreference = Number(localStorage.getItem('changeoverTimePreference'));
if (!changeoverTimePreference) {
  changeoverTimePreference = 13;
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
    let hours = ['12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
                 '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
                 '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
                 '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'];
    let i = 0;
    let times = [];
    for(let hour of hours) {
      i++;
      times.push(<option key={i} value={i}>{hour}</option>);
    }

    return (
        <div className="AddLineDialog">
          <p>Hello, world</p>
          <select onChange={(value)=>{this.handleAgencySelection(value);}} defaultValue={agencyPreference}>
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
          <br/>
          <select onChange={(value)=>{this.handleTimeSelection(value);}} defaultValue={changeoverTimePreference}>
            {times}
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

  handleTimeSelection(event) {
    this.updateTime(event.target.value);
  }

  updateTime(hour) {

    //Cache the selected agency as the preferred one.
    localStorage.setItem('changeoverTimePreference', hour);
    changeoverTimePreference = hour;

    this.setState({
      currentChangeover: hour
    });
  }
}

