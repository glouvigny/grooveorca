define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var _ = require('../ext/lodash/dist/lodash');

    var PlayerControls = function (router) {
        Abstract.call(this, router);
        this.name = 'Controls for music players';
        this.enabled = true;
        this.context = {
            trackId: null,
        };
    };

    var action = function (action, options) {
        options = _.assign({api_action: action}, options);
        this.router.sendResponse(options, 'player_control', action);
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

    PlayerControls.prototype.routes.controls_shuffle = function (options) {
        action.bind(this)('shuffle', options);
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

    PlayerControls.prototype.routes.player_song_changed = function (options) {
        this.context.trackId = options.data.track_id;
    };

    PlayerControls.prototype.routes.player_position_changed =
        function (options) {
            if (this.context.trackId === null) {
                this.router.dispatch({
                    name: 'controls_update_track',
                });
            }
    };

    PlayerControls.prototype.routes.controls_update_track = function (options) {
        action.bind(this)('update_track', options);
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