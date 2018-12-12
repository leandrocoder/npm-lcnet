const WSClient = require('../client.js');
const stdin = require('../src/stdin');

let ws = null;

function createClient()
{
    ws = new WSClient('localhost', 5000);
    ws.on("message", function(data) {
        console.log("receive >", data);
    });
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
