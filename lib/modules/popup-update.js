define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var _ = require('../ext/lodash/dist/lodash');

    var PopupUpdate = function (router) {
        Abstract.call(this, router);
        this.name = 'Update Popup informations';
        this.enabled = true;
        this.context = {
            fragments: {},
            duration: 0,
        };
    };

    PopupUpdate.prototype = Object.create(Abstract.prototype);

    PopupUpdate.prototype.routes = {};
    PopupUpdate.prototype.routes.popup_page = function (options) {
        for (var i in this.context.fragments) {
            this.sendFragment(options, i, this.context.fragments[i]);
        }
    };

    PopupUpdate.prototype.sendFragment = function (options, name, data) {
        this.context.fragments[name] = _.cloneDeep(data);

        data.name = name;

        this.router.sendResponse(options, 'fragment', data);
    };

    PopupUpdate.prototype.routes.player_position_changed = function (options) {
        position = options.data;
        if (this.context.duration === 0 ||
            typeof this.context.duration !== 'number') {
            return false;
        }

        this.sendFragment(options, 'current-position', {
            attributes: {
                'data-time': position,
            }
        });

        this.sendFragment(options, 'current-progress', {
            attributes: {
                'data-progress': position / this.context.duration,
            }
        });
    };

    PopupUpdate.prototype.routes.player_song_changed = function (options) {
        var toUpdate = [
            'artist',
            'album',
            'track',
        ];

        this.context.duration = parseInt(options.data.duration, 10);
        if (isNaN(this.context.duration)) {
            this.context.duration = 0;
        }

        for (var i in toUpdate) {
            this.sendFragment(options, 'current-' + toUpdate[i], {
                text: options.data[toUpdate[i]],
            });
        }

        this.sendFragment(options, 'current-duration', {
            attributes: {
                'data-time': this.context.duration,
            }
        });
    };

    PopupUpdate.prototype.routes.player_state_changed = function (options) {
        this.sendFragment(options, 'current-state', {
            attributes: {
                'data-state': options.data,
            }
        });
    };

    module.exports = PopupUpdate;
});