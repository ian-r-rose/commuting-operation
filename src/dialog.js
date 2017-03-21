import React, { Component } from 'react';
import { getAgencyList, getLinesForAgency, getLineForId } from './nextbus';
import './dialog.css';

let agencyPreference = localStorage.getItem('agencyPreference');
if (!agencyPreference || !agencyPreference.id) {
  agencyPreference = {
    id: 'actransit',
    displayId: 'AC Transit'
  }
  localStorage.setItem('agencyPreference', agencyPreference);
}

let changeoverTimePreference = Number(localStorage.getItem('changeoverTimePreference'));
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
    if(this.state.currentLine && this.state.currentLine.direction) {
      directions = [];
      for (let direction of this.state.currentLine.direction) {
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
      times.push(<option key={i} value={i}>{hour}</option>);
      i++;
    }

    return (
        <div className="AddLineDialog">
          <div className="SelectionBlock">
            <p className="SelectionLabel">Transit agency:</p>
            <select onChange={(value)=>{this.handleAgencySelection(value);}} defaultValue={agencyPreference}>
              {agencies}
            </select>
          </div>

          <div className="SelectionBlock">
            <p className="SelectionLabel">Route:</p>
            <select onChange={(value)=>{this.handleLineSelection(value);}}>
              {lines}
            </select>
          </div>

          <div className="SelectionBlock">
            <p className="SelectionLabel">Inbound direction:</p>
            <select onChange={(value)=>{this.handleDirectionSelection(value);}}>
              {directions}
            </select>
          </div>

          <div className="SelectionBlock">
            <p className="SelectionLabel">Change directions at:</p>
            <select onChange={(value)=>{this.handleTimeSelection(value);}} defaultValue={changeoverTimePreference}>
              {times}
            </select>
          </div>
          <br/>
          <button onClick={()=>{this.props.onClose()}}>Cancel</button>
          <button onClick={()=>{this.handleOkButton()}}>Add Line</button>
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
    let agencies = this.state.agencyListing;
    let newAgency = agencies.find((a) => a.id === event.target.value);
    this.updateAgency(newAgency);
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
      this.updateLine(lines[0]);
    });
  }

  handleLineSelection(event) {
    let lines = this.state.lineListing;
    let newLine = lines.find((l) => l.id === event.target.value);
    this.updateLine(newLine);
  }

  updateLine(line) {
    getLineForId(this.state.currentAgency, line.id).then((line)=>{
      this.setState({
        currentLine: line,
      });
      this.updateDirectionPreference(line.direction[0].id);
    });
  }

  handleDirectionSelection(event) {
    this.updateDirectionPreference(event.target.value);
  }
    
  updateDirectionPreference(directionId) {
    let line = this.state.currentLine;
    let inbound = directionId;
    //choose the tag of the first one not matching inbound
    let outbound = line.direction.find((d) => d.id !== inbound).id;

    line.directionPreference = {
      inbound: inbound,
      outbound: outbound,
      toOutboundTime: this.state.currentChangeover
    }

    this.setState({
      currentLine: line
    });
  } 

  handleTimeSelection(event) {
    this.updateTime(event.target.value);
  }

  updateTime(hour) {

    //Cache the selected agency as the preferred one.
    localStorage.setItem('changeoverTimePreference', hour);
    changeoverTimePreference = hour;

    let line = this.state.currentLine;
    line.directionPreference.toOutboundTime = hour;

    this.setState({
      currentChangeover: hour,
      currentLine: line
    });
  }

  handleOkButton() {
    let line = this.state.currentLine;
    this.props.addLine(line);
    this.props.onClose()
  }
}

