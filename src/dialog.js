import React, {Component} from 'react';
import {getAgencyList, getLinesForAgency, getLineForId} from './nextbus';
import './dialog.css';

/*
 * In case the user has an established preference for
 * a given agency and changeover time (as they most likely do),
 * we cache these values in localStorage.
 */
//Cache agency preference
let agencyPreference = undefined;
try {
  agencyPreference = JSON.parse(localStorage.getItem('agencyPreference'));
} catch (err) {
  localStorage.clear();
}
if (!agencyPreference || !agencyPreference.id) {
  agencyPreference = {
    id: 'actransit',
    displayId: 'AC Transit',
  };
  localStorage.setItem('agencyPreference', JSON.stringify(agencyPreference));
}

// Cache changeover time.
let changeoverTimePreference = undefined;
try {
  changeoverTimePreference = Number(
    localStorage.getItem('changeoverTimePreference'),
  );
} catch (err) {
  localStorage.clear();
}
if (!changeoverTimePreference) {
  changeoverTimePreference = 12;
  localStorage.setItem('changeoverTimePreference', changeoverTimePreference);
}

/**
 * A rather large and complex component for a dialog box
 * that allows the user to add a new line to their listing.
 *
 * props: whether the dialog box is currently open, callbacks
 *        from the main app for closing the dialog and adding
 *        a new line.
 *
 * state: a currently active `AgencyModel`, `LineModel`, time
 *        for the changeover, a list of all possible `AgencyModel`s,
 *        a list of all `LineModels` for the current `AgencyModel`.
 */
export class AddLineDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentAgency: agencyPreference,
      currentLine: undefined,
      currentChangeover: changeoverTimePreference,
      agencyListing: undefined,
      lineListing: undefined,
    };
  }

  render() {
    //Don't render if the dialog is closed.
    if (this.props.isOpen === false) {
      return null;
    }

    //Populate the agencies select box.
    let agencies = undefined;
    if (this.state.agencyListing) {
      agencies = [];
      for (let agency of this.state.agencyListing) {
        agencies.push(
          <option key={agency.id} value={agency.id}>
            {agency.displayId}
          </option>,
        );
      }
    }

    //Populate the lines select box.
    let lines = undefined;
    if (this.state.lineListing) {
      lines = [];
      for (let line of this.state.lineListing) {
        lines.push(
          <option key={line.id} value={line.id}>
            {line.displayId}
          </option>,
        );
      }
    }

    //Populate the directions select box.
    let directions = undefined;
    if (this.state.currentLine && this.state.currentLine.direction) {
      directions = [];
      for (let direction of this.state.currentLine.direction) {
        directions.push(
          <option key={direction.id} value={direction.id}>
            {direction.displayId}
          </option>,
        );
      }
    }

    //Populate the changeover times select box.
    let hours = [
      '12:00 AM',
      '1:00 AM',
      '2:00 AM',
      '3:00 AM',
      '4:00 AM',
      '5:00 AM',
      '6:00 AM',
      '7:00 AM',
      '8:00 AM',
      '9:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '1:00 PM',
      '2:00 PM',
      '3:00 PM',
      '4:00 PM',
      '5:00 PM',
      '6:00 PM',
      '7:00 PM',
      '8:00 PM',
      '9:00 PM',
      '10:00 PM',
      '11:00 PM',
    ];
    let i = 0;
    let times = [];
    for (let hour of hours) {
      times.push(
        <option key={i} value={i}>
          {hour}
        </option>,
      );
      i++;
    }

    return (
      <div className="AddLineDialog">
        <div className="SelectionBlock">
          <p className="SelectionLabel">Transit agency:</p>
          <select
            onChange={value => {
              this.handleAgencySelection(value);
            }}
            value={agencyPreference.id}>
            {agencies}
          </select>
        </div>

        <div className="SelectionBlock">
          <p className="SelectionLabel">Route:</p>
          <select
            onChange={value => {
              this.handleLineSelection(value);
            }}>
            {lines}
          </select>
        </div>

        <div className="SelectionBlock">
          <p className="SelectionLabel">Inbound direction:</p>
          <select
            onChange={value => {
              this.handleInboundSelection(value);
            }}>
            {directions}
          </select>
        </div>

        <div className="SelectionBlock">
          <p className="SelectionLabel">Outbound direction:</p>
          <select
            onChange={value => {
              this.handleOutboundSelection(value);
            }}>
            {directions}
          </select>
        </div>

        <div className="SelectionBlock">
          <p className="SelectionLabel">Change directions at:</p>
          <select
            onChange={value => {
              this.handleTimeSelection(value);
            }}
            defaultValue={changeoverTimePreference}>
            {times}
          </select>
        </div>
        <br />
        <button
          onClick={() => {
            this.props.onClose();
          }}>
          Cancel
        </button>
        <button
          onClick={() => {
            this.handleOkButton();
          }}>
          Add Line
        </button>
      </div>
    );
  }

  /**
   * Upon mounting, update the currently selected agency.
   */
  componentDidMount() {
    getAgencyList().then(agencies => {
      this.setState({
        agencyListing: agencies,
      });
      this.updateAgency(this.state.currentAgency);
    });
  }

  /**
   * If we select a new agency from the list, update the state.
   */
  handleAgencySelection(event) {
    let agencies = this.state.agencyListing;
    let newAgency = agencies.find(a => a.id === event.target.value);
    this.updateAgency(newAgency);
  }

  /**
   * Given an `AgencyModel`, update the current agency,
   * as well as updating the list of `LineModel`s for that agency.
   */
  updateAgency(agency) {
    // Set the lines to an empty set until we get the listing.
    this.setState({
      lineListing: [],
      currentAgency: agency,
    });

    //Query for all the lines for this agency
    let lineListingPromise = getLinesForAgency(agency);

    //Cache the selected agency as the preferred one.
    localStorage.setItem('agencyPreference', JSON.stringify(agency));
    agencyPreference = agency;

    lineListingPromise.then(lines => {
      this.setState({
        lineListing: lines,
        currentAgency: agency,
      });
      this.updateLine(lines[0]);
    });
  }

  /**
   * If we select a new line, update the component.
   */
  handleLineSelection(event) {
    let lines = this.state.lineListing;
    let newLine = lines.find(l => l.id === event.target.value);
    this.updateLine(newLine);
  }

  /**
   * Given a new `LineModel`, update the `currentLine`, as well
   * as the listing for possible directions for that line.
   */
  updateLine(line) {
    // Set the current line, with missing direction data
    this.setState({
      currentLine: line,
    });
    getLineForId(this.state.currentAgency, line.id).then(line => {
      // Reset the line, but now with direction data.
      this.setState({
        currentLine: line,
      });
      this.updateDirectionPreference(line.direction[0].id);
    });
  }

  /**
   * Handle a selection of an inbound direction.
   */
  handleInboundSelection(event) {
    this.updateDirectionPreference(event.target.value, undefined);
  }

  /**
   * Handle a selection of an outbound direction.
   */
  handleOutboundSelection(event) {
    this.updateDirectionPreference(undefined, event.target.value);
  }

  /**
   * Given a direction id string,
   * update the `currentLine` state to have
   * that direction as the inbound direction in the
   * `directionPreference` field. The outbound direction
   * is selected by choosing the first non-`directionId` direction
   * of the possibilities. TODO: this is probably broken for
   * routes that only have one direction (e.g., loops).
   */
  updateDirectionPreference(inbound, outbound) {
    let line = this.state.currentLine;
    let defaultId = line.direction[0].id;

    line.directionPreference = {
      inbound: inbound || defaultId,
      outbound: outbound || defaultId,
      toOutboundTime: this.state.currentChangeover,
    };

    // Set the line, now with direction preference.
    this.setState({
      currentLine: line,
    });
  }

  /**
   * Handle a selection of a changeover time
   * in the select boxes.
   */
  handleTimeSelection(event) {
    this.updateTime(event.target.value);
  }

  /**
   * Given an hour for the changeover time,
   * update the `currentChangeover` preference
   * and the `DirectionPreferenceModel` for the `currentLine`.
   */
  updateTime(hour) {
    //Cache the selected agency as the preferred one.
    localStorage.setItem('changeoverTimePreference', hour);
    changeoverTimePreference = hour;

    let line = this.state.currentLine;
    line.directionPreference.toOutboundTime = hour;

    this.setState({
      currentChangeover: hour,
      currentLine: line,
    });
  }

  /**
   * Upon clicking the `Add Line` button, call the `addLine` callback
   * on the main app, and close the dialog.
   */
  handleOkButton() {
    let line = this.state.currentLine;
    this.props.addLine(line);
    this.props.onClose();
  }
}
