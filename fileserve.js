const Utils = require('./utils');

module.exports = class FileServe {

    constructor(servePath, port)
    {
        var express = require('express');
        var app = express();
        
        app.use(express.static(servePath));
        app.get('*', function(request, response) {
            let file = servePath + request.path;
            response.sendfile(file);
        });
        
        port = port || 5000;
        app.listen(port, function() {
            //console.log("FileServe @ " + port);
        });
        
        this.url = "http://" + Utils.getLocalIP() + ":" + port + "/";
    }
}
