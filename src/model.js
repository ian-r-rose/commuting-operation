class PositionModel {
  lat;

  lon;

  distanceFromUser;
}

class StopModel {
  id;

  displayTitle;

  position;
}

class LineModel {
  id;

  displayId;

  direction;

  displayDirection;
}

class PredictionModel {
  time;

  isReliable;

  isDelayed;
}
