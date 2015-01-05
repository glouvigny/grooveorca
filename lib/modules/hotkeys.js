define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var BrowserHotkeys = require('../ext/caoutchouc/browser').get('hotkeys');

    var Hotkeys = function (router) {
        Abstract.call(this, router);
        this.name = 'Hotkeys';
        this.enabled = true;

        [
            {evt: 'previous', action: 'controls_previous'},
            {evt: 'playpause', action: 'controls_playpause'},
            {evt: 'next', action: 'controls_next'},
        ].map(function (action) {
            BrowserHotkeys.register(action.evt,
                this.action.bind(this, action.action));
        }.bind(this));
    };

    Hotkeys.prototype = Object.create(Abstract.prototype);

    Hotkeys.prototype.action = function (action) {
        this.router.dispatch({name: action});
    };

    module.exports = Hotkeys;
});