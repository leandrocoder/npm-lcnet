const Server = require('../src/server.js');

function onConnect(client) {

}

function onClose(client)
{

}

function onMessage(data, sender)
{

}

let options = {
    onConnect: (client) => onConnect(client),
    onClose: (client) => onClose(client),
    onMessage: (data, sender) => onMessage(data, sender),
    forwardMessages: true
};

this.server = new Server("websocket", 5000, options);