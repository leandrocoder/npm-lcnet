const INet = require('./inet');
const dgram = require('udp');

module.exports = class UDP extends INet {

    constructor()
    {
        super();

    }

    addListener(port, callback)
    {
        let _bufferToString = function(buf)
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
        }

        var self = this;
        let socket = dgram.createSocket('udp4');

        socket.on('listening', function () {
            console.log('UDP listening on ' + port);
        }.bind(this));
        
        socket.on('message', function (message, remote) {

            if (callback && message.byteLength > 0)
            {
                if (message[0] == 1)
                    message = _bufferToString(message);
                else
                    message = message.toString().trim();

                callback(message, remote);
            }        

        }.bind(this));

        socket.bind(port);
    }

    requestConnection(serverName, port)
    {
        let obj = {type:'server', requestconnection:serverName};
        //let response = {type:'connectiondata',  data:{type:'websocket', host:'127.0.0.1', port:4321}};
        send(JSON.stringify(obj), this.getBroadcastIP(), port);
    }

    send(message, host, port)
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
}
