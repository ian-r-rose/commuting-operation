const baseUrl = 'http://webservices.nextbus.com/service/publicJSONFeed';
let agency = 'actransit';
let route='6';

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
        latitude: 37.8179231,
        longitude: -122.2477552
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
    let minDistance = 1.e99; //Should be big enough :)
    let nearestStop = result.route.stop[0];
    for(let stop of result.route.stop) {
      //Manhattan distance should be good enough for these purposes
      let distance = Math.abs(stop.lat-position.latitude)+
                     Math.abs(stop.lon-position.longitude);
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

getNearestStop(agency, route).then((stop)=>{
  getPredictionForStop(route, stop).then((prediction)=>{
    console.log(prediction);
  });
});
