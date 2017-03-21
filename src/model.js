class PositionModel {
  lat;

  lon;

  distanceFromUser;
}

class StopModel {
  id;

  displayId;

  position;
}

class Direction {
  id;

  displayId;
}

class AgencyModel {
  id;

  displayId;

  region;
}

class DirectionPreference {
  inbound;

  outbound;

  toOutboundTime;
}

class LineModel {
  id;

  displayId;

  agency;

  direction[];

  directionPreference;
}

class PredictionModel {
  time;

  isReliable;

  isDelayed;
}
