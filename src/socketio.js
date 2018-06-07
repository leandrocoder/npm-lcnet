const socketClient = require('socket.io-client');
const socketServer = require('socket.io');

module.exports = class SocketIO
{
    constructor() {
        this.dispose();
    }

    initServer(port) {
        this.server - socketSetver();
        this.server.listen(port);
    }

    connect(ip, port)
    {
        this.client = socketClient("ws://" + ip + ":" + port);
    }

    addListener(type, callback)
    {
        if (this.client)
        {
            this.client.on(type, function(data) {
                if (callback) callback(data);
            }.bind(this));
        }

        if (this.server)
        {
            this.server.on(type, function(client) {
                if (callback) callback(client);
            }.bind(this));
        }
    }

    send(type, data, destinationSocket)
    {
        if (this.client) this.client.emit(type, data);

        if (this.server) {
            if (destinationSocket) destinationSocket.emit(type, data);
            else this.server.emit(type, data);
        } 
    }

    dispose()
    {
        if (this.client) this.client.close();
        if (this.server)  this.server.close();

        this.client = null;
        this.server = null;
    }

    disconnect() { this.dispose(); }
    close() { this.dispose(); }
}
