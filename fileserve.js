const Utils = require('./utils');
const fs = require('fs');
const path = require('path');

module.exports = class FileServe {

    constructor(servePath, port)
    {
        var express = require('express');
        var app = express();

        if (!fs.existsSync(servePath)) 
        {
            //fs.mkdirSync(servePath);
            this.mkDirByPathSync(servePath);
        }
        
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


    mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
        const sep = path.sep;
        const initDir = path.isAbsolute(targetDir) ? sep : '';
        const baseDir = isRelativeToScript ? __dirname : '.';
      
        return targetDir.split(sep).reduce((parentDir, childDir) => {
          const curDir = path.resolve(baseDir, parentDir, childDir);
          try {
            fs.mkdirSync(curDir);
          } catch (err) {
            if (err.code === 'EEXIST') { // curDir already exists!
              return curDir;
            }
      
            // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
            if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
              throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
            }
      
            const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
            if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
              throw err; // Throw if it's just the last created dir.
            }
          }
      
          return curDir;
        }, initDir);
    }
}
