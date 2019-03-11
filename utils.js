const fs = require('fs');
const PATH = require('path');
const http = require('http');
const url = require('url');
const child_process = require('child_process');

class Utils {

    checkPort(port, callback)
    {
        if (!callback) return;


        // node
        if (typeof window === 'undefined')
        {
            let {nextAvailable} = require('node-port-check');
            nextAvailable(port, '0.0.0.0').then((nextAvailablePort) => {
                callback(nextAvailablePort);
            });
        }
        else
        {
            callback(false);
        }
    }


    getFreePorts(callback)
    {
        if (!callback) return;
        let {getFreePorts} = require('node-port-check');
        getFreePorts(30, '0.0.0.0').then((freePortsList) => {
 
            callback(freePortsList);
        });
    }


    getBroadcastIP()
    {
        var ip = this.getLocalIP();
        var parts = ip.split(".");
        parts[parts.length - 1] = "255";
        return parts.join(".");
    }

    getLocalIP(allInterfaces = false)
    {
        let ip = [];

        // node
        if (typeof window === 'undefined')
        {
            let os = require('os');
            let ifaces = os.networkInterfaces();
            
            Object.keys(ifaces).forEach(function (ifname) {
                let alias = 0;
                ifaces[ifname].forEach(function (iface) {
                    if ('IPv4' !== iface.family || iface.internal !== false) {
                        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                        return;
                    }
                    
                    ip.push(iface.address);
                });
            });
        }
        // browser
        else 
        {
            window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || false;

            if (window.RTCPeerConnection)
            {
                var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};
                pc.createDataChannel('');
                pc.createOffer(pc.setLocalDescription.bind(pc), noop);

                pc.onicecandidate = function(event)
                {
                    if (event && event.candidate && event.candidate.candidate)
                    {
                        var s = event.candidate.candidate.split('\n');
                        ip.push(s[0].split(' ')[4]);
                    }
                }
            }
        }

        let result = ip.length == 0 ? ['127.0.0.1'] : ip;
        return allInterfaces ? result : result[0];
    }


    downloadAndCheck(from, to, callback)
    {
        this.download(from, to, (e) => {
            if (e)
            {
                if (callback) callback(e);
                return;
            }

            setTimeout(() => {
                
                this.generateChecksum(to, (err, sum) => {
                    if (err)
                    {
                        if (callback) callback(err);
                        return;
                    }

                    if (callback) callback(null, sum);
                })

            }, 200);
        });
    }

    download(from, to, callback)
    {
        /*
        if (from.indexOf("www") == 0 || from.indexOf("http") == 0)
        {
            // https://www.hacksparrow.com/using-node-js-to-download-files.html

           var workerProcess = child_process.spawn('wget', ['-O', to, from]);

           workerProcess.stdout.on('data', function (data) {
             //console.log('stdout: ' + data);
           });
        
           workerProcess.stderr.on('data', function (data) {
             //console.log('stderr: ' + data);
           });
        
           workerProcess.on('close', function (code) {
              //console.log('Download Completed' + code);
              if (callback) callback();
           });
        }
        else
        {
            let _from = from.replace("file:///", "");
            try {
                fs.copyFile(_from, to, (err) => {
                    if (callback) callback(err);
                })
            } catch (err) {
                if (callback) callback(err);
            }
        } 
        */
       
       var download = require('download-file')
 
       var options = {
           directory: PATH.dirname(to),
           filename: PATH.basename(to)
       }
        
       download(from, options, function(err){
           if (err) throw err
           if (callback) callback();
       }) 
    }

    generateChecksum(filePath, callback)
    {       
        const md5File = require('md5-file')
        md5File(filePath, (err, hash) => {
            if (callback) callback(err, hash);
        })
    }

}

var instance = new Utils();

if (typeof module !== 'undefined')
{
    module.exports = instance;
}
else
{
    if (!window.lcnet) window.lcnet = {};
    if (!window.lcnet.utils) window.lcnet.utils = instance;
}