const WSClient = require('./src/net/websocketclient');
const stdin = require('./src/stdin');

let ws = null;

function createClient()
{
    ws = new WSClient();
    ws.on("message", function(data) {
        console.log("receive >", data);
    });
    ws.init('localhost', 5000);
}

function enableSTDInput()
{
    stdin.on("exit", function(cmd, args) { process.exit(); });
    stdin.on("*", function(cmd, args) { 
        ws.send(cmd) 
    });

}

createClient();
enableSTDInput();

