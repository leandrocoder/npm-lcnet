console.warn("Warning: Standart import of lcnet only include client libs\nFor more options see the docs.");
module.exports = {
    websocket: require('./src/net/websocketclient'),
    utils: require('./utils')
}
