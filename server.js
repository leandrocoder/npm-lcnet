const SocketServer = require('./src/net/socketserver');

//const PublicFolder = require('./src/publicfolder.js');
/*
const Request = require('./src/request');
const FolderWatch = require("./src/folderwatch.js");
const Path = require('path');
*/

module.exports = class Server {
	
	constructor(type, port, options) {

		this.type = type.toLowerCase().trim();
		this.server = null;
		this.options = options;
		if (!this.options) this.options = {};
		if (!this.options.onConnect) this.options.onConnect = function(client) {};
		if (!this.options.onClose) this.options.onClose = function(client) {};
		if (!this.options.onMessage) this.options.onMessage = function(message, sender) {};

		// Init Server by Type
		if (this.type == 'websocket') this.server = new SocketServer.WebSocket();
		if (this.type == 'socketio')  this.server = new SocketServer.SocketIO();

		if (this.server != null) {
			// Define callbacks
			this.server.on("connect", (client) => {
				this.options.onConnect(client);
			});
			this.server.on("close", (client) => {
				this.options.onConnect(client);
			});
			this.server.on("message", (data, sender) => { 
				this.options.onMessage(data, sender);
				if (this.options.forwardMessages == true)
				{
					this.send(data);
				}
			});

			this.server.init(port);
			this.server.startPing(5000);
		}
		else {
			console.error("Error: Server type unknow > ", this.type);
		}

		/*
		//this.publicFolder = new PublicFolder(Config.assets.path, Config.assets.port, Config.assets.alias);
		if (Config.folderWatch.enabled == true)
		{
			FolderWatch.StartWatchChangestWatch(Path.join(__dirname, Config.folderWatch.path), (filename) => {
				
				if (this.processor != null && typeof this.processor[Config.folderWatch.onChange] === 'function')
				{
					this.processor[Config.folderWatch.onChange](filename);
					return;
				}

				console.log("Error: 'processorClass' or 'folderWatch.onChange' callback not defined in 'config.json'");
				console.log("File changed:", filename);
			});
		}
		*/
	}

	send(data, clientID)
	{
		this.server.send(data, clientID);
	}
}

