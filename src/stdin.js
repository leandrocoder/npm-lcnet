class STDIn {
    constructor() {
        this.events = [];
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', function (text) {
            text = text.trim();
            let parts = text.split(' ');
            if (parts.length > 0)
            {
                let cmd = parts.shift().toLowerCase();
                for (let i = 0; i < this.events.length; i++) {
                    let e = this.events[i];
                    if (e.event == "*") {
                        if (e.callback) e.callback(text);
                    }
                    else if(cmd == e.event) {
                        if (e.callback) e.callback(parts);
                    }
                }
            }
        }.bind(this));
    }

    on(event, callback) {
        this.events.push({event:event.toLowerCase(), callback:callback});
    }
}

const Instance = new STDIn();
module.exports = Instance;
