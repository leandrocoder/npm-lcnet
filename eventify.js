function eventify(object, contract) {
    contract = contract || [];
    var listeners = {};
    object.on = function (eventName, listener, ctx) {
        if (!listeners.hasOwnProperty(eventName)) {
            listeners[eventName] = [];
        }
        listeners[eventName].push({
            callback: listener,
            ctx: ctx
        });
        return object;
    };

    object.emit = function (eventName) {
        var callbacksData = listeners[eventName];
        if (callbacksData) {
            for (var i = 0; i < callbacksData.length; ++i) {
                var cd = callbacksData[i];
                cd.callback.apply(cd.ctx, Array.prototype.slice.call(arguments, 1));
            }
        }
        return object;
    };
    var createEmitHandler =  function (contractName) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(contractName);
            return object.emit.apply(null, args);
        };
    };
    var createOnHandler = function (contractName) {
        return function (listener, ctx) {
            return object.on(contractName, listener, ctx);
        };
    };

    for (var i = 0; i < contract.length; ++i) {
        var contractName = contract[i];
        object['on' + contractName] = createOnHandler(contractName);
        object['emit' + contractName] = createEmitHandler(contractName);
    }
    return object;
};

module.exports = eventify;