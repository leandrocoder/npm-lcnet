const os = require('os');
const LOCAL_HOST = "localhost";
const dgram = require('udp');

module.exports = {


    getBroadcastIP : function()
    {
        var ip = this.getLocalIP();
        var parts = ip.split(".");
        parts[parts.length - 1] = "255";
        return parts.join(".");
    },

    getLocalIP : function()
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
    },

    _bufferToString : function(buf)
    {
        var ab = new ArrayBuffer(buf.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        while (ab.byteLength % 4 != 0) {
            ab = ab.slice(1, ab.byteLength);
        }
        return new Int32Array(ab).toString();
    },


    addListener : function(port, callback)
    {
        var self = this;
        let socket = dgram.createSocket('udp4');

        socket.on('listening', function () {
            console.log('UDP listening on ' + port);
        }.bind(this));
        
        socket.on('message', function (message, remote) {

            if (callback && message.byteLength > 0)
            {
                if (message[0] == 1)
                    message = this._bufferToString(message);
                else
                    message = message.toString().trim();

                callback(message, remote);
            }        

        }.bind(this));

        socket.bind(port);
    },

    send : function(message, host, port)
    {
        if (!message || !port || !host) return;
        if (typeof message === 'object') message = JSON.stringify(message);

        if (message.length < 1) return;

        var lastChar = message[message.length - 1];
        if (lastChar != '\n' || lastChar != '\0')
        {
            message += "\n";
        }

        var self = this;
        var client = dgram.createSocket('udp4');
        client.send(message, 0, message.length, port, host, function(err, bytes) {
            if (err) 
            {
                console.error(err);
                //throw err;
            }
            client.close();
        });
    }

};