const UDP = require('./udp');
const EventEmitter = require('events');
const NetUtils = require('./utils');
const WebSocketServer = require('./websocketserver');

class Room  extends EventEmitter
{
    constructor(name)
    {
        super();
        this.name = name;
        this.clients = [];
    }

    addClient(client)
    {
        if (client.room != null) {
            client.room.removeClient(client);
        }
        
        for (let i = 0; i < this.clients.length; i++)
        {
            if (this.clients[i] != null && this.clients[i].id == client.id)
                return false;
        }

        client.room = this.name != 'all' ? this : null;
        this.clients.push(client);

        console.log(client.name, "join room", this.name);

        return true;
    }

    removeClient(client)
    {
        let index = -1;
        for (let i = 0; i < this.clients.length; i++)
        {
            if (this.clients[i].id == client.id)
            {
                index = i;
                break;
            }
        }

        if (index >= 0) this.clients.splice(index, 1);
        client.room = null;
        return index >= 0;
    }

    send(obj)
	{
        if (typeof obj !== 'string') obj = JSON.stringify(obj);
        for (let i = 0; i < this.clients.length; i++)
        {
            this.clients[i].send(obj);
        }
	}
}


class Server extends EventEmitter {
	
	constructor(type, port, forwardMessages) {

		super();

		this.type = type.toLowerCase().trim();
		this.port = port;
		this.forwardMessages = forwardMessages;
		this.server = null;
		
		// Init Server by Type
		if (this.type == 'websocket') this.server = new WebSocketServer();
		
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

	send(obj, clientID)
	{
        if (typeof obj !== 'string') obj = JSON.stringify(obj);
		this.server.send(obj, clientID);
	}
}



module.exports = class NetManager extends EventEmitter
{
    constructor(config)
    {
        super();
        this.server = [];

        if (config && config.server)
        {
            for (let i = 0; i < config.server.length; i++)
            {
                this.addServer(config.server[i]);
            }
        }
    }

    checkPort(port, callback)
    {
        if (!callback) return;

        var net = require('net');
        var server = net.createServer();
        
        server.once('error', function(err) {
            if (err.code === 'EADDRINUSE') {
                // port is currently in use
            }
            if (callback) callback(false);
        });
        
        server.once('listening', function() {
            // close the server if listening doesn't fail
            server.close();
            if (callback) callback(true);
        });

        server.listen(port);
    }

    addServer(_config)
    {
        let self = this;

        let __addServer = function(config)
        {
            if (config.type == 'udp')
            {
                let s = new UDP();
                s.config = config;
                s.id = self.server.length;
                s.clients = [];
                s.messageLog = [];
                s.rooms = [];
                s.name = s.config.name;
                s.server = {};
                s.server.type = 'udp';
                s.server.ip = s.getLocalIP();
                s.addListener(config.port, (data, sender) => {
                    console.log("remote:", sender);
                    self.onMessage(s, data, sender)
                })
                self.server.push(s);
            }
            else if (config.type == 'websocket')
            {
                let s = new Server(config.type, config.port);
                s.config = config;
                s.id = self.server.length;
                s.clients = [];
                s.messageLog = [];
                s.rooms = [];
                s.name = config.name;
                s.defaultRoom = new Room('all');
                s.getRoom = function(name)
                {
                    for (let j = 0; j < s.rooms.length; j++)
                    {
                        if (s.rooms[j].name == name)
                        {
                            return s.rooms[j];
                        }
                    }
                    return null;
                }
    
                for (let j = 0; j < config.rooms.length; j++)
                {
                    s.rooms.push(new Room(config.rooms[j].name));
                }       
    
                s.forwardMessages = config.forwardmessages
                s.on("connect", (client) => self.onConnect(s, client))
                s.on("close", (client) => self.onClose(s, client))
                s.on("message", (data, sender) => self.onMessage(s, data, sender))

                self.emit("create", s);
                self.server.push(s);
            }
        }

        

        let getNextFreePort = function(port, onFound)
        {
            self.checkPort(port, (isFree) => {
                if (isFree)
                {
                    onFound(port);
                }
                else
                {
                    getNextFreePort(port + 1, onFound);
                }
            });
        };

        getNextFreePort(_config.port, (port) => {
            _config.port = port;
            __addServer(_config);
        });

    }

    

    getServer(name)
    {
        for (let i = 0; i < this.server.length; i++)
        {
            if (this.server[i] != null && this.server[i].config.name == name)
            {
                return this.server[i];
            }
        }
        return null;
    }

    onConnect(server, client)
    {
        client.name = "Guest " + client.id;
        server.defaultRoom.addClient(client);
        console.log("connect: client", client.id);
        this.emit("connect", server, client);
    }
    
    onMessage(server, data, sender)
    {
        console.log(server.config.type, "message >", data);
        console.log("type of message = ", typeof data);

        let json = null;
        try {
            json = JSON.parse(data);
        } catch (err) {}

        if (json && json.type == "server")
        {
            if (json.whoami)
            {
                sender.name = json.whoami;
            }
            else if (json.joinroom)
            {
                let room = server.getRoom(json.joinroom);
                if (room) room.addClient(sender);
            }
            else if (json.leaveroom)
            {
                if (sender.room) sender.room.removeClient(sender);
            }
            else if (json.requestconnection)
            {
                // this one need to be passed to all servers created

                for (let i = 0; i < this.server.length; i++)   
                {
                    let s = this.server[i];
                    console.log('name???', s.name, json.requestconnection);
                    if (s.name == json.requestconnection)
                    {
                        let response = {
                            type:'connectiondata',  
                            data:{
                                type:s.type, 
                                host:s.ip, 
                                port:s.port
                            }
                        };
                        server.send(response);
                    }
                }
            }
        }
        
        let timestamp = Date.now();
        let time = new Date();
        time = time.getHours() + ":"  + time.getMinutes() + ":" + time.getSeconds();
        let messageData = {
            message:data,
            timestamp:timestamp,
            time:time
        }
        server.messageLog.push(messageData);
        this.emit("message", server, data, sender);
    }
    
    onClose(server, client)
    {
        if (client && client.room)
        {
            client.room.removeClient(client);
        }
        server.defaultRoom.removeClient(client);
        this.emit("close", server, client);
    }
}
