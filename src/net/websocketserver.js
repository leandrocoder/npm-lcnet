const WebSocketServerClass = require('websocket').server;
const http = require('http');

module.exports = class WebSocketServer {

    constructor() {
        this.server = null;
        this.wsServer = null;
        this.events = [];
        this.clients = [];
        this.lastID = 0;
    }

    /**
     * 
     * @param {Int} port 
     */
    init(port) {
        this.clients = [];
		this.server = http.createServer(function(request, response) {
		  // process HTTP request. Since we're writing just WebSockets
		  // server we don't have to implement anything.
		}.bind(this));
		
		this.server.listen(port, function() { 
			console.log("websocket start listening port", port);
		}.bind(this));
		
		
		this.wsServer = new WebSocketServerClass({
		  httpServer: this.server
		});
		
		// WebSocket server
		this.wsServer.on('request', function(request) {
			
		  let connection = request.accept(null, request.origin);
      connection.id = this.lastID;
      this.lastID++;
		  
		  let index = this.clients.push(connection) - 1;
      let ip = connection.remoteAddresses[0];
		  
      for (let i = 0; i < this.events.length; i++)
      {
          let e = this.events[i];
          connection.on(e.event, function(message) {
            let data = null;

            if (message.type == 'binary')
            {
              data = message.binaryData.toString();
            }
            else
            {
                data = message.utf8Data;
            }
  
            if (e.callback != null && data != null) e.callback(data, connection);
          }.bind(this));

          if (e.event == "connect") {
            e.callback(connection);
          }
      }

		  connection.on('close', function(connection) {
		
        this.clients.splice(index, 1);
        for (let i = 0; i < this.events.length; i++)
        {
          let e = this.events[i];
          if (e.event == "close") e.callback(connection)
        }
        
        }.bind(this));
      }.bind(this));
    }

    /**
     * 
     * @param {String} event 
     * @param {Function} callback 
     */
    on(event, callback) {
        this.events.push({event:event, callback:callback});
    }

    /**
     * 
     * @param {Object} obj Object
     */
    send(obj, clientID) {
        // broadcast message to all connected clients
        let json = typeof obj === 'string' ? obj : JSON.stringify(obj);

        if (this.clients.length > 0)
        {
          for (let i = this.clients.length - 1; i >= 0; i--) {
            if (!clientID || (this.clients[i] != null && this.clients[i].id == clientID))
            {

              if (this.clients[i].connected == true)
              {
                this.clients[i].send(json);
              }
              else
              {
                console.log("nao conectado");
                this.clients[i].close();
                this.clients.splice(i, 1);
              }
            }
          }
        }
    }


    getAllMethods(object) {
      return Object.getOwnPropertyNames(object).filter(function(property) {
          return true;//typeof object[property] == 'function';
      });
    }

    /**
     * 
     * @param {Number} interval Interval in milisseconds
     */
    startPing(interval) {
      this.pingInterval = setInterval(function() {
        this.send({type:"ping"});
      }.bind(this), interval);
      clearInterval(this.pingInterval);
    }
}

