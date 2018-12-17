const EventEmitter = require('events');
const os = require('os');
const LOCAL_HOST = "localhost";

module.exports = class IServer extends EventEmitter {

    constructor() {
        super();
    }

    getBroadcastIP()
    {
        var ip = this.getLocalIP();
        var parts = ip.split(".");
        parts[parts.length - 1] = "255";
        return parts.join(".");
    }

    getLocalIP()
    {
        var ifaces = os.networkInterfaces();
        var address = LOCAL_HOST;
        
        Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
            }
            
            address = iface.address;
        });
        });
        
        return address;
    }
}

