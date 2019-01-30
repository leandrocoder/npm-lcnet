const fs = require('fs');
const http = require('http');

class Utils {

    checkPort(port, callback)
    {
        if (!callback) return;

        // node
        if (typeof window === 'undefined')
        {
            var net = require('net');
            var server = net.createServer();
            
            server.once('error', function(err) {
                if (err.code === 'EADDRINUSE') {
                    // port is currently in use
                }
                callback(false);
            });
            
            server.once('listening', function() {
                // close the server if listening doesn't fail
                server.close();
                callback(true);
            });
            
            server.listen(port);
        }
        else
        {
            // todo fix it
            callback(true);
        }
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
        if (from.indexOf("www") == 0 || from.indexOf("http") == 0)
        {
            // console log
            let file = fs.createWriteStream(to);
            http.get(from, (response) => {
                response.pipe(file);
                if (callback) callback();
            }).on("error", (e) => {
                console.error(`Got error: ${e.message}`);
                if (callback) callback(e);
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