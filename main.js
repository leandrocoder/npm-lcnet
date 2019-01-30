console.warn("Warning: Standart import of lcnet only include client libs\nFor more options see the docs.");
module.exports = {
    websocket: require('./src/websocketclient'),
    utils: require('./src/utils')
}
