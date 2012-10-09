
/**
 * Module dependencies and application flow
 */
var express = require("express")
  , path = require("path")
  , http = require("http")
  , routes = require("./routes.js")
  , nconf = require("nconf")
  , proxy = require("http-proxy");

nconf.argv().env();
nconf.file({ file: "config.json" });
nconf.defaults({
    "version": "0.1",
    "download": "http://www.couchbase.com/couchbase-server/beta",
    "http": {
        "port": 5206,
        "proxy-port": 5207
    },
    "cb": {
        "host": "127.0.0.1",
        "port": 8091,
        "username": "Administrator",
        "password": "password",
        "bucket": "default"
    }
});

app = express();
cbProxy = proxy.createServer(nconf.get("cb:port"), nconf.get("cb:host"))
               .listen(nconf.get("http:proxy-port"))

app.configure(function(){
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
  app.use(express.favicon());
  app.use(express.logger("dev"));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require("stylus").middleware(__dirname + "/public"));
  app.use(express.static(path.join(__dirname, "public")));
});

app.configure("development", function(){
  app.use(express.errorHandler());
});

routes.register(app, nconf)

port = nconf.get("http:port")
server = http.createServer(app)
server.listen(port, function() {
    console.log("cbmania listening on port " + port);
})

var everyone = require("now").initialize(server);

everyone.now.distributeMessage = function(message){
  everyone.now.receiveMessage(this.now.name, message);
};