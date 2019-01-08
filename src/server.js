const SocketServer = require('./socketserver');
const NetUtils = require('./utils');

const EventEmitter = require('events');

module.exports = class Server extends EventEmitter {
	
	constructor(type, port, forwardMessages) {

		super();

		this.type = type.toLowerCase().trim();
		this.port = port;
		this.forwardMessages = forwardMessages;
		this.server = null;
		
		// Init Server by Type
		if (this.type == 'websocket') this.server = new SocketServer.WebSocket();
		if (this.type == 'socketio')  this.server = new SocketServer.SocketIO();
		
		if (this.server != null) {
			
			this.ip = this.server.ip = NetUtils.getLocalIP();
			// Define callbacks
			this.server.on("connect", (client) => {
				this.emit("connect", client);
			});
			this.server.on("close", (client) => {
				this.emit("close", client);
			});
			this.server.on("message", (data, sender) => { 
				this.emit("message", data, sender);
				if (this.forwardMessages == true) this.send(data);
			});

			this.server.init(port);
		}
		else {
			console.error("Error: Server type unknow > ", this.type);
		}
	}

	send(data, clientID)
	{
		this.server.send(data, clientID);
	}
}

