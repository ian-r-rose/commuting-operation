const baseUrl = 'http://webservices.nextbus.com/service/publicJSONFeed';
let agency = 'actransit';
let route='57';
let direction='57_22_0';

function assembleRequestUrl (args) {
  return baseUrl+'?'+args.join('&');
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
      resolve(position);
    }, (err)=>{
      resolve({
        coords: {
          latitude: 37.8179231,
          longitude: -122.2477552
        }
      });
      //console.log('Cannot get position: ', err);
    });
  });
}

export
function getNearestStop(agency, route, direction) {
  nextBusRequest = makeRequest('GET', assembleRequestUrl([
    'command=routeConfig',
    'a='+agency,
    'r='+route
  ]));
  locationRequest = getCurrentPosition();
  return Promise.all([nextBusRequest, locationRequest]).then( ([result, position])=>{
    //Get the list of stop tags for the given
    //direction, since they may not be the same
    //both ways.
    let stopsForDirection = undefined;
    for(let dir of result.route.direction) {
      if(dir.tag === direction) {
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
        {lon: position.coords.longitude, lat: position.coords.latitude}
      );

      if(dist< minDistance) {
        minDistance = dist;
        nearestStop = stop;
      }
    }
    console.log(minDistance);
    return nearestStop;
  });
}

export
function getPredictionForStop(route, stop) {
  return makeRequest('GET', assembleRequestUrl([
    'command=predictions',
    'a='+agency,
    'r='+route,
    's='+stop.tag
  ]));;
}

getNearestStop(agency, route, direction).then((stop)=>{
  getPredictionForStop(route, stop).then((prediction)=>{
    console.log(prediction);
  });
});
