var BridgeWatcher = function () {
    this.actions = {};
    this.bridge = document.querySelector('#playerplus-exchange');
    this.actionsWatcher();
};

var watched = {};

BridgeWatcher.prototype.timerWatcher = function (toWatch) {
    setInterval(function () {
        for (var i in toWatch) {
            if (toWatch.hasOwnProperty(i)) {
                toWatch[i]();
            }
        }
    }, 333);
};

BridgeWatcher.prototype.watchElt = function (elt, fct, rule) {
    if (watched[rule] !== undefined) {
        return;
    }

    watched[rule] = elt;

    console.info('Watching elt');
    var mutationHandler = function (cb, mutations) {
        cb();
    };

    var handler = mutationHandler.bind(null, fct);
    var obs = new MutationObserver(handler);

    obs.observe(elt, {attributes: true, subtree: true, childList: true});
};

BridgeWatcher.prototype.mutationWatcher = function (toWatch, root) {
    root = root || document;

    for (var i in toWatch) {
        if (toWatch.hasOwnProperty(i)) {
            var elt = root.querySelector(i);
            if (elt !== null) {
                this.watchElt(elt, toWatch[i], i);
            }
        }
    }
};

BridgeWatcher.prototype.actionsWatcher = function (actions) {
    var obs = new MutationObserver(function (mutations) {
        mutations.forEach(function(mut) {
            if (mut.type == 'attributes' &&
                typeof mut.attributeName === 'string' &&
                mut.attributeName == 'data-plpl-api-actions') {
                var json = JSON.parse(mut.target
                    .getAttribute('data-plpl-api-actions'));

                if (json.length === 0) {
                    return false;
                }

                var action = json[0];
                var new_actions = [];

                for (var i = 0; i < json.length - 1; i++) {
                    new_actions.push(json[i + 1]);
                }

                if (action.api_action &&
                    this.actions[action.api_action]) {
                    this.actions[action.api_action](action);
                }

                mut.target.setAttribute('data-plpl-api-actions',
                    JSON.stringify(new_actions));
            }
        }.bind(this));
    }.bind(this));

    obs.observe(this.bridge, {attributes: true});
};

BridgeWatcher.prototype.updateData = function (name, value, force) {
    value = JSON.stringify(value);

    currValue = this.bridge.getAttribute('data-plpl-' + name);

    if (!force && currValue === value) {
        return false;
    }

    this.bridge.setAttribute('data-plpl-' + name, value);
};

BridgeWatcher.prototype.newNodesWatcher = function (toWatch) {
    var obs = new MutationObserver(function (mutations) {
        mutations.forEach(function(mut) {
            for (var i in mut.addedNodes) {
                var parent = mut.addedNodes[i].parentNode;
                if (parent) {
                    this.mutationWatcher(toWatch, parent);
                }
            }
        }.bind(this));
    }.bind(this));

    obs.observe(document, {subtree: true, childList: true});
};

BridgeWatcher.prototype.registerElementsToWatch = function (toWatch, newElts) {
    if (toWatch instanceof Array) {
        this.timerWatcher(toWatch);
    } else {
        this.mutationWatcher(toWatch);

        if (newElts) {
            this.newNodesWatcher(toWatch);
        }
    }
};

BridgeWatcher.prototype.registerActions = function (actions) {
    this.actions = actions;
};

