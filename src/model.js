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

class LineModel {
  id;

  displayId;

  agency;

  direction[];

  changeoverTime;
}

class PredictionModel {
  time;

  isReliable;

  isDelayed;
}
