import React, {Component} from 'react';
import {
  getPredictionsForStop,
  getDirectionForLine,
  getNearestStop,
} from './nextbus';

import './listing.css';
import clear from './clear.svg';

/**
 * Component for the list of different lines that
 * the user is tracking.
 *
 * props: a list of `LineModel`s, callbacks for
 *        removing lines from the main app.
 *
 * state: none.
 */
export class LineListing extends Component {
  render() {
    let lines = this.props.lines;
    if (lines.length === 0) {
      return (
        <h2>
          Welcome! To get started, click the "+" button above and add a route!
        </h2>
      );
    }
    let listing = [];
    let i = 0;
    for (let line of lines) {
      listing.push(
        <Line
          even={!!(i % 2 === 0)}
          key={JSON.stringify(line)}
          line={line}
          remove={id => {
            this.removeLine(id);
          }}
        />,
      );
      i++;
    }
    return <div className="LineListing">{listing}</div>;
  }

  /**
   * Tell the main app to remove a line.
   */
  removeLine(lineId) {
    this.props.removeLine(lineId);
  }
}

/**
 * Component for a single line entry.
 *
 * props: a `LineModel`, a callback from the line listing
 *        for removing this line, and `even` property used
 *        for background styling.
 *
 * state: a `StopModel` for the nearest stop, based on the
 *        user's location.
 */
export class Line extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stop: {
        id: '',
        displayId: 'Getting location...',
        distanceFromUser: undefined,
      },
    };
  }

  render() {
    let className;
    if (this.props.even === true) {
      className = 'Line Even';
    } else {
      className = 'Line Odd';
    }
    return (
      <div className={className}>
        <LineInfo line={this.props.line} stop={this.state.stop} />
        <Prediction line={this.props.line} stop={this.state.stop} />
        <img
          className="RemoveButton"
          src={clear}
          alt="Remove route"
          onClick={() => {
            this.props.remove(this.props.line.id);
          }}
        />
      </div>
    );
  }

  /**
   * Upon mounting, update the stop model, and set a timer
   * for updating it every thirty seconds in case the user is on
   * the move.
   */
  componentDidMount() {
    this.updateStop();
    this._timer = setInterval(() => {
      this.updateStop();
    }, 30000);
  }

  /**
   * Upon unmounting, clear the timer.
   */
  componentWillUnmount() {
    clearInterval(this._timer);
  }

  /**
   * Recalculate the nearest transit stop to the user for this line.
   */
  updateStop() {
    let direction = getDirectionForLine(this.props.line);
    getNearestStop(this.props.line, direction).then(stop => {
      this.setState({
        stop: stop,
      });
    });
  }
}

/**
 * A component for displaying some information about a line.
 *
 * props: a `LineModel`, a `StopModel`
 *
 * state: none.
 */
export class LineInfo extends Component {
  render() {
    let direction = getDirectionForLine(this.props.line);
    let displayDirection =
      direction.displayId.charAt(0).toLowerCase() +
      direction.displayId.slice(1);
    return (
      <div className="LineInfo">
        <div className="LineId">{this.props.line.id}</div>
        <div className="LineGeography">
          <div className="StopLocation">
            {this.props.stop.displayId + ' ' + displayDirection}
          </div>
        </div>
      </div>
    );
  }
}

/**
 * A component representing a listing of predictions for
 * a given transit line and stop.
 *
 * props: a `StopModel` and a `LineModel` for which we are
 *        getting predictions.
 *
 * state: a list of `PredictionModel`s.
 */
export class Prediction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      prediction: [
        {
          time: 'loading...',
          isReliable: false,
          isDelayed: false,
        },
      ],
    };
  }

  render() {
    let predictions = [];
    let count = 0;
    for (let prediction of this.state.prediction) {
      let c = 'Prediction';
      if (!prediction.isReliable) {
        c += ' Unreliable';
      }
      predictions.push(
        <div key={count++} className={c}>
          {prediction.time}
        </div>,
      );
      // Three predictions should be enough
      if (count === 3) {
        break;
      }
    }
    return <div className="PredictionList">{predictions}</div>;
  }

  /**
   * Upon mounting, update the predictions and set a timer
   * to do that every 30 seconds.
   */
  componentDidMount() {
    if (this.props.stop.id) {
      this.updatePrediction();
    }

    //Set a timer for 15 seconds between updates.
    this._timer = setInterval(() => {
      this.updatePrediction();
    }, 15000);
  }

  /**
   * If the props are updated, we probably are near to a
   * new stop, so get a new set of predictions.
   */
  componentDidUpdate(prevProps, prevState) {
    if (this.props.stop.id && prevProps.stop.id !== this.props.stop.id) {
      this.updatePrediction();
    }
  }

  /**
   * Get predictions for the current stop and line.
   */
  updatePrediction() {
    getPredictionsForStop(this.props.line, this.props.stop).then(pred => {
      this.setState({prediction: pred});
    });
  }

  /**
   * Upon unmounting, clear the timer.
   */
  componentWillUnmount() {
    clearInterval(this._timer);
  }
}
