define(function (require, exports, module) {
    var cache = {};

    var Abstract = function (type, source, id) {
        this.type = type;
        this.source = source;
        this.id = id;

        if (cache[type] === undefined) {
            cache[type] = {};
        }

        if (cache[type][source] === undefined) {
            cache[type][source] = {};
        }

        cache[type][source][id] = this;
    };

    Abstract.prototype.completeData = function (data) {
    };

    Abstract.isComplete = function () {
        return true;
    };

    Abstract.isLoaded = function (type, source, id) {
        if (cache[type] === undefined) {
            return false;
        }

        if (cache[type][source] === undefined) {
            return false;
        }

        return (cache[type][source][id] !== undefined);
    };

    Abstract.getCache = function (type, source, id) {
        if (Abstract.isLoaded(type, source, id)) {
            return cache[type][source][id];
        }

        return false;
    };

    module.exports = Abstract;
});