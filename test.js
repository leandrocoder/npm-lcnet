//*
const Server = require('./server.js');

class Test {

    onMessage(data, sender)
    {
        console.log("test::onMessage", data);
        //this.server.send(data);
    }

    onConnect(client)
    {
        console.log("test::onConnect");
    }

    onClose(client)
    {
        console.log("test::onClose");
    }

    constructor()
    {
        let options = {
            onConnect: (client) => this.onConnect(client),
            onClose: (client) => this.onClose(client),
            onMessage: (data, sender) => this.onMessage(data, sender),
            forwardMessages: true
        };
        
        this.server = new Server("websocket", 5000, options);
    }
}

let test = new Test();
//*/

//const Server = require('./server.js');
//new Server("websocket", 5000, {forwardMessages:true});
