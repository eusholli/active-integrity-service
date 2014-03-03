/*jshint indent:2 */
var restify = require('restify');
var bunyan = require('bunyan');
var fs = require('fs'), url = require('url');
var aidb = require('./aidb');

var xmlBodyParser = require('./xmlbodyparser');
var xmlresponder  = require('./xmlresponder');
var jsonresponder = require('./jsonresponder');

var appname = 'aidb';
var appver  = '0.0.1';

var conf = JSON.parse(fs.readFileSync(__dirname + '/config.json', encoding="utf8")); // may throw

var baseurl = conf.baseurl || '/ais/api/v1';


if (conf.apimod) {
  appver = appver + conf.apimod;
}

if (conf.timezone) {
  // override JSON.stringify formatting:
  process.env.TZ = conf.timezone;
  Date.prototype.toJSON = function(d) {return this.toLocaleString();};
}

var logger = bunyan.createLogger({name: appname,
                          level: conf.loglevel || 'warn',
                          stream: process.stdout,
                          serializers: bunyan.stdSerializers});

var server = restify.createServer({
  name:    appname,
  version: appver,
  log:      logger,
  formatters: {
    'application/xml': xmlresponder(),
    'application/json': jsonresponder()   //customized error handling
  }
});

server.use(restify.acceptParser(  // do not use embedded parsers
   [ 'application/json',
     'application/xml',
     'application/octet-stream',
     'text/plain' ]));
server.use(restify.queryParser());
server.use(restify.fullResponse());
server.use(restify.bodyParser());
server.use(xmlBodyParser());

aidb.init(conf, logger);

server.on('after', function (req, res, route, error) {
  var plah = {req: req,
          req_data: req._body,
          req_body: req.body,
          res: res,
          res_body: res._body instanceof Buffer ? "a Buffer" : res._body,
          res_data: res._data instanceof Buffer ? "a Buffer" : res._data};
  if (error) {
    req.log.error(error);
    req.log.error(plah, "after");
  } else
    req.log.info(plah, "after");
});

// more 'restful' interface for gereral consumption
server.get(baseurl + '/:hash/param',  aidb.param);
server.get(baseurl + '/:hash/download',  aidb.download);
server.get(baseurl + '/:hash/:hash2', aidb.strongVerify);
server.get(baseurl + '/:hash', aidb.verify);
server.put(baseurl + '/:hash', aidb.sign);


server.listen(process.env.PORT || conf.listenport || 8080, function () {
  logger.info('%s %s listening at %s', server.name, server.versions, server.url + baseurl);
});

module.exports = server;
