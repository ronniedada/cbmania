
/*
 * Http request routes
 */

exports.register = function(app, nconf_in) {
    app.get("/", this.index);
    app.get("/doc", this.doc)
    app.get("/get", this.get)
    app.get("/set", this.set)
    app.get("/del", this.del)
    app.all("*", this.all)
    var driver = require('couchbase');
    cb = new driver.Couchbase(nconf_in.get("cb:host") + ":" + nconf_in.get("cb:port"),
                              nconf_in.get("cb:username"),
                              nconf_in.get("cb:password"),
                              nconf_in.get("cb:bucket"));
    nconf = nconf_in
    return app
}

// routes
exports.index = function(req, res){
    res.render('index', {
        version: nconf.get("version"),
        download: nconf.get("download"),
        port: nconf.get("http:port")
    });
};

exports.doc = function(req, res){
    res.send("Documentation is not avaialble at this time");
};

build_res = function(error, msg) {
    return {"error": error, "msg": msg};
}

exports.get = function(req, res) {
    var key_in = req.param("key", false);
    if (!key_in) {
        res.json(build_res(true, "invalid operation - get [key]"));
        return;
    }
    cb.get(
        key_in,
        undefined,
        function (data, error, key, cas, flags, value) {
            var msg;
            if (error) {
                msg = "error - " + error;
            } else {
                msg = "get " + key + " = " + value;
            }
            res.json(build_res(error, msg));
        },
        "");
}

exports.set = function(req, res) {
    var key_in = req.param("key", false)
    var val_in = req.param("val", false)
    if (!key_in || !val_in) {
        res.json(build_res(true, "invalid operation - set [key] [val]"));
        return;
    }
    cb.set(
        key_in,
        val_in,
        0,
        req.param("cas", undefined),
        function (data, error, key, cas) {
            console.log("error: " + error);
            if (key != key_in) {
                res.json(build_res(true, "server responded with key = " + key));
            } else {
                res.json(build_res(error, "set " + key + " = " + val_in));
            }
        },
        "");
}

exports.del = function(req, res) {
    key_in = req.param("key", false)
    if (!key_in) {
        res.json(build_res(true, "invalid operation - del [key]"));
        return;
    }
    cb.delete(
        key_in,
        0,
        function (data, error, key) {
            res.json(build_res(error, "del " + key))
        },
        "");
}

exports.all = function(req, res) {
      res.json(build_res(true, "unparsable command"))
}