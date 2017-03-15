const baseUrl = 'http://webservices.nextbus.com/service/publicJSONFeed';
const proxyUrl = 'https://commuting-operation-proxy.herokuapp.com/proxy/?url='

let agency = 'actransit';
let line = {
  id: '57',
  displayId: '57',
  direction: '57_22_0',
  displayDirection: 'To Emeryville Public Market'
}

line = {
  id: '18',
  displayId: '18',
  direction: '18_9_0',
  displayDirection: ''
}
line = {
  id: '6',
  displayId: '6',
  direction: '6_19_1',
  displayDirection: ''
}


function assembleRequestUrl (args) {
  return proxyUrl+baseUrl+'?'+args.join('&');
}

function makeRequest (method, url) {
  return new Promise( (resolve, reject)=>{
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = ()=>{
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = ()=>{
      reject({
        status: xhr.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
  });
}

//compute dot prodcut between the two position vectors
//as a measure of distance.
export
function distance( pos1, pos2 ) {
  const radius = 6371.e3;
  const d2r = Math.PI/180
  let dotProduct =
    //X component
    Math.cos(pos1.lat*d2r) * Math.cos(pos1.lon*d2r) *
    Math.cos(pos2.lat*d2r) * Math.cos(pos2.lon*d2r)
    //Y component
    + Math.cos(pos1.lat*d2r) * Math.sin(pos1.lon*d2r) *
    Math.cos(pos2.lat*d2r) * Math.sin(pos2.lon*d2r)
    //Z component
    + Math.sin(pos1.lat*d2r) * Math.sin(pos2.lat*d2r);
  let angularDistance = Math.acos(dotProduct);
  return angularDistance * radius;
}

export
function getCurrentPosition() {
  return new Promise((resolve,reject)=>{
    navigator.geolocation.getCurrentPosition((position)=>{
      resolve({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        distanceFromUser: undefined
      });
    }, (err)=>{
      reject(new Error('Cannot get user position'));
    });
  });
}

export
function getNearestStop(agency, line) {
  let nextBusRequest = makeRequest('GET', assembleRequestUrl([
    'command=routeConfig',
    'a='+agency,
    'r='+line.id
  ]));
  let locationRequest = getCurrentPosition();
  return Promise.all([nextBusRequest, locationRequest]).then( ([result, position])=>{
    //Get the list of stop tags for the given
    //direction, since they may not be the same
    //both ways.
    let stopsForDirection = undefined;
    for(let dir of result.route.direction) {
      if(dir.tag === line.direction) {
        stopsForDirection = dir.stop;
      }
    }
    if(!stopsForDirection) {
      throw new Error('Cannot find the route direction');
    }

    //Only choose the stop if it is in the direction
    //we are interested in
    let stops = result.route.stop.filter((stop)=>{
      return stopsForDirection.findIndex((el)=>{
        return el.tag===stop.tag
      }) !== -1});

    //Find the stop that is closest to the user's position.
    let minDistance = 1.e99; //Should be big enough :)
    let nearestStop = result.route.stop[0];
    for(let stop of stops) {
      let dist = distance(
        {lon: stop.lon, lat: stop.lat},
        position
      );

      if(dist< minDistance) {
        minDistance = dist;
        nearestStop = stop;
      }
    }
    //Return the stop model.
    return {
      id: nearestStop.tag,
      displayTitle: nearestStop.title,
      position: {
        lon: Number(nearestStop.lon),
        lat: Number(nearestStop.lat),
        distanceFromUser: minDistance
      }
    }
  });
}

export
function getPredictionsForStop(line, stop) {
  return makeRequest('GET', assembleRequestUrl([
    'command=predictions',
    'a='+agency,
    'r='+line.id,
    's='+stop.id
  ])).then((result)=>{
    //If there are no predictions, return an empty array
    if(result.predictions.dirTitleBecauseNoPredictions) {
      return [];
    }
    //Get the predictions, and make them an array if necessary
    let predictions = result.predictions.direction.prediction;
    if(!Array.isArray(predictions)) {
      predictions = [predictions];
    }
    //Assemble the prediction models
    let predictionArray = [];
    for(let prediction of predictions) {
      predictionArray.push({
        time: prediction.minutes,
        isReliable: !prediction.affectedByLayover && !prediction.isScheduleBased,
        isDelayed: !!prediction.delayed
      });
    }
    return predictionArray;
  });
}

export
function getPredictions() {
  return getNearestStop(agency, line).then((stop)=>{
    return getPredictionsForStop(line, stop);
  });
}
