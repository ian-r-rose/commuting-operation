//Copyright (c) Ian Rose, 2017.

/**
 * Models for the various objects used by
 * Commuting Operation. These are not
 * enforced in the code base, and this
 * file is intended as a reference.
 */

/**
 * Model describing the physical position of something.
 */
class PositionModel {
  /**
   * Latitude.
   */
  lat;

  /**
   * Longitude.
   */
  lon;

  /**
   * If we are using location services,
   * the distance from the user may
   * also be useful. Assumed to be in meters.
   */
  distanceFromUser;
}

/**
 * Model describing a transit stop.
 */
class StopModel {
  /**
   * Unique string id for the stop.
   */
  id;

  /**
   * String id meant for user displays.
   */
  displayId;

  /**
   * `PositionModel` for the stop.
   */
  position;
}

/**
 * Object describing a direction that a line
 * can travel in.
 */
class DirectionModel {
  /**
   * A unique string id for the direction.
   */
  id;

  /**
   * String id meant for user displays.
   */
  displayId;
}

/**
 * Object describing a transit agency.
 */
class AgencyModel {
  /**
   * A unique string id for the agency.
   */
  id;

  /**
   * String id meant for user displays.
   */
  displayId;

  /**
   * String description of the geographic
   * region of the agency.
   */
  region;
}

/**
 * A model for a user's preferred directions
 * to be travelling in.
 */
class DirectionPreferenceModel {
  /**
   * String id for an inbound direction
   * (i.e., to work, school, etc).
   */
  inbound;

  /**
   * String id for an outbound direction
   * (i.e., from work, school, etc).
   */
  outbound;

  /**
   * Hour of the day (from 0-23) at which we
   * should start showing the outbound time
   * instead of the inbound time.
   */
  toOutboundTime;
}

class LineModel {
  /**
   * A unique string id for the line.
   */
  id;

  /**
   * String id meant for user displays.
   */
  displayId;

  /**
   * The `AgencyModel` for this line.
   */
  agency;

  /**
   * A list of `DirectionModels` for the line.
   * In most cases this will be two entries long,
   * but not in every case.
   */
  direction;

  /**
   * A user's `DirectionPreferenceModel` for
   * this line.
   */
  directionPreference;
}

/**
 * A model for arrival time predictions.
 */
class PredictionModel {
  /**
   * The amount of time, in minutes, before
   * the arrival is predicted.
   */
  time;

  /**
   * Whether this prediction is considered reliable.
   */
  isReliable;

  /**
   * Whether this prediction is considered delayed.
   */
  isDelayed;
}
