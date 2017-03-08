const baseUrl = 'http://webservices.nextbus.com/service/publicJSONFeed';
let agency = 'actransit';
let route='57';
let direction='57_23_1';

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
      //Manhattan distance should be good enough for these purposes
      let distance = Math.abs(stop.lat-position.coords.latitude)+
                     Math.abs(stop.lon-position.coords.longitude);
      if(distance< minDistance) {
        minDistance = distance;
        nearestStop = stop;
      }
    }
    return nearestStop;
  });
}

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
