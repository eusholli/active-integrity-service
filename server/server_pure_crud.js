var server = require('./main')

  // Get a persistence engine for the device
  // , deviceSave = require('save')('device')
  , mongoose = require('mongoose');

  var mongoUri = process.env.MONGOHQ_URL || 'mongodb://localhost/cas';

  mongoose.connect(mongoUri);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function callback () {
    console.log("mongoose %s connected: ", mongoUri);
  });

  var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectID;
  var Device = new Schema({
   name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  hash: {
    type: String,
    required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  timeStamp: {
    type: Date, 
    default: Date.now
  },
});
var Device = mongoose.model('Device', Device);

// Get all devices in the system
server.get('/api/v1/devices', function (req, res, next) {
  Device.find({}, function (error, devices) {
    res.send(devices)
  })
})

server.post('/api/v1/devices', function (req, res, next) {

  var name = req.params.name;
  var type = req.params.type;
  var hash = req.params.hash;

  if ((name === undefined) || (type === undefined) || (hash === undefined)) {

    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('name, type and hash must be supplied'))
  }

  var deviceData = {
    name: req.params.name,
    type: req.params.type,
    hash: req.params.hash
  }
  var device = new Device(deviceData);
  device.save(function (error, data) {
    if (error) {
     return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
   }
   else {
     res.json(data);
     res.send(201);
   }
 })
})

server.get('/api/v1/devices/:id', function (req, res, next) {
 Device.findOne({ _id: req.params.id }, function (error, device) {
  if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
    if (device) {
     res.send(device)
   } else {
     res.send(404)
   }
 })
})

server.put('/api/v1/devices/:id', function (req, res, next) {
  var name = req.params.name;
  var type = req.params.type;
  var hash = req.params.hash;

  if ((name === undefined) || (type === undefined) || (hash === undefined)) {

    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('name, type and hash must be supplied'))
  }

  var deviceData = {
   name: name,
   type: type,
   hash: hash
 }
 Device.update({ _id: req.params.id }, deviceData, {
  multi: false
  }, function (error, device) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
      res.send();
    })
  })

server.del('/api/v1/devices/:id', function (req, res, next) {
 Device.remove({ _id: req.params.id }, function (error, device) {
   if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
    res.send();
  })
})

server.post('/signup/check/devicename', function(req, res, next) {
  var devicename = req.body.devicename;
  // check if devicename contains non-url-safe characters
  if (devicename !== encodeURIComponent(devicename)) {
    res.json(403, {
      invalidChars: true
    });
    return;
  }
  // check if devicename is already taken - query your db here
  var devicenameTaken = false;
  // for (var i = 0; i < dummyDb.length; i++) {
  //   if (dummyDb[i].devicename === devicename) {
  //     devicenameTaken = true;
  //     break;
  //   }
  // }
  if (devicenameTaken) {
    res.json(403, {
      isTaken: true
    });
    return
  }
  // looks like everything is fine
  res.send(200);
});

module.exports = server;
