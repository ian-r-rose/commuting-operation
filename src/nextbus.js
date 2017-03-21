const baseUrl = 'http://webservices.nextbus.com/service/publicJSONFeed';
const proxyUrl = 'https://commuting-operation-proxy.herokuapp.com/proxy/?url='

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
function getAgencyList() {
  return makeRequest('GET', assembleRequestUrl([
    'command=agencyList'
  ])).then((result) => {
    let agencies = [];
    for (let agency of result.agency) {
      agencies.push({
        id: agency.tag,
        displayId: agency.title,
        region: agency.regionTitle
      });
    }
    return agencies;
  });
}

export
function getLinesForAgency(agency) {
  return makeRequest('GET', assembleRequestUrl([
    'command=routeList',
    'a='+agency.id
  ])).then((result) => {
    let lines = [];
    let routes = result.route;
    if(!Array.isArray(result.route)) {
      routes = [routes];
    }
    for (let line of routes) {
      lines.push({
        id: line.tag,
        displayId: line.title,
        agency: agency,
        direction: undefined,
        directionPreference: undefined
      });
    }
    return lines;
  });
}

export
function getLineForId(agency, id) {
  return makeRequest('GET', assembleRequestUrl([
    'command=routeConfig',
    'a='+agency.id,
    'r='+id
  ])).then((result)=> {
    let directions = [];
    let routeDir = result.route.direction;
    if(!Array.isArray(routeDir)) {
      routeDir = [routeDir];
    }
    for (let dir of routeDir) {
      directions.push({
        id: dir.tag,
        displayId: dir.title
      });
    }
    return {
      id: id,
      displayId: result.route.title,
      agency: agency,
      direction: directions,
      directionPreference: undefined
    }
  });
}


export
function getDirectionForLine(line) {
  let toOutbound;
  if(line.directionPreference) {
    toOutbound = line.directionPreference.toOutboundTime;
  } else {
    return line.direction[0];
  }
  let currentTime = new Date();
  let changeoverTime = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      Number(toOutbound));
  if (currentTime.getTime() < changeoverTime.getTime()) {
    return line.direction.find((d)=>
      d.id === line.directionPreference.inbound);
  } else {
    return line.direction.find((d)=>
      d.id === line.directionPreference.outbound);
  }
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
function getNearestStop(line, direction) {
  let nextBusRequest = makeRequest('GET', assembleRequestUrl([
    'command=routeConfig',
    'a='+line.agency.id,
    'r='+line.id
  ]));
  let locationRequest = getCurrentPosition();
  return Promise.all([nextBusRequest, locationRequest]).then( ([result, position])=>{
    //Get the list of stop tags for the given
    //direction, since they may not be the same
    //both ways.
    let stopsForDirection = undefined;
    for(let dir of result.route.direction) {
      if(dir.tag === direction.id) {
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
        {lon: stop.lon, lat: stop.lat, distanceFromUser: undefined},
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
      displayId: nearestStop.title,
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
    'a='+line.agency.id,
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
