define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var _ = require('../ext/lodash/dist/lodash');

    var PlayerControls = function (router) {
        Abstract.call(this, router);
        this.name = 'Controls for music players';
        this.enabled = true;
    };

    var action = function (action, options) {
        options = _.assign({api_action: action}, options);
        this.router.sendResponse(options, 'player_control', 'next');
    };

    PlayerControls.prototype = Object.create(Abstract.prototype);
    PlayerControls.prototype.routes = {};

    PlayerControls.prototype.routes.controls_playlist = function (options) {
    };

    PlayerControls.prototype.routes.controls_album = function (options) {
    };

    PlayerControls.prototype.routes.controls_new_queue = function (options) {
    };

    PlayerControls.prototype.routes.controls_next = function (options) {
        action.bind(this)('next', options);
    };

    PlayerControls.prototype.routes.controls_previous = function (options) {
        action.bind(this)('previous', options);
    };

    PlayerControls.prototype.routes.controls_mute = function (options) {
        action.bind(this)('mute', options);
    };

    PlayerControls.prototype.routes.controls_play = function (options) {
        action.bind(this)('play', options);
    };

    PlayerControls.prototype.routes.controls_pause = function (options) {
        action.bind(this)('pause', options);
    };

    PlayerControls.prototype.routes.controls_playpause = function (options) {
        action.bind(this)('playpause', options);
    };

    PlayerControls.prototype.routes.controls_volume = function (options) {
    };

    PlayerControls.prototype.routes.controls_seek = function (options) {
        options = _.assign({
            api_action: 'seek',
            position: options.data.position,
        }, options);

        this.router.sendResponse(options, 'player_control', 'next');
    };

    module.exports = PlayerControls;
});