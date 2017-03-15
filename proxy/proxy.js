var express = require('express');
var request = require('request');

var app = express();


var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(allowCrossDomain);

app.use(function(err, req, res, next) {
    console.error(err.stack)
    res.status(500)
    res.render('error', {
        error: err
    })
})

//Proxy endpoint for accessing nextbus apis
app.use('/proxy', function(req, res) {
    var origin = req.get('origin');
    var host = req.get('host');

    //Only run on these hosts
    if(host!=='commuting-operation-proxy.herokuapp.com'
      && host.indexOf('localhost:5000') < 0) {
        res.send(null)
        return;
    }
    //Only run if the request is to NextBus
    if (req.url.indexOf('webservices.nextbus.com/service/publicJSONFeed') < 0) {
        res.send(null)
        return;
    } else {
        var url = req.url.replace('/?url=', '');
        req.pipe(request(url)).pipe(res);
    }
});


app.listen(process.env.PORT || 5000);
