define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var _ = require('../ext/lodash/dist/lodash');

    var PopupUpdate = function (router) {
        Abstract.call(this, router);
        this.name = 'Update Popup informations';
        this.enabled = true;
    };

    var fragments = {};
    var duration = 0;

    PopupUpdate.prototype = Object.create(Abstract.prototype);

    PopupUpdate.prototype.routes = {};
    PopupUpdate.prototype.routes.popup_page = function (options) {
        for (var i in fragments) {
            this.sendFragment(options, i, fragments[i]);
        }
    };

    PopupUpdate.prototype.sendFragment = function (options, name, data) {
        fragments[name] = _.cloneDeep(data);

        data.name = name;

        this.router.sendResponse(options, 'fragment', data);
    };

    PopupUpdate.prototype.routes.player_position_changed = function (options) {
        position = options.data;
        if (duration === 0 || typeof duration !== 'number') {
            return false;
        }

        this.sendFragment(options, 'current-position', {
            attributes: {
                'data-time': position,
            }
        });

        this.sendFragment(options, 'current-progress', {
            attributes: {
                'data-progress': position / duration,
            }
        });
    };

    PopupUpdate.prototype.routes.player_song_changed = function (options) {
        var toUpdate = [
            'artist',
            'album',
            'track',
        ];

        duration = parseInt(options.data.duration, 10);
        if (isNaN(duration)) {
            duration = 0;
        }

        for (var i in toUpdate) {
            this.sendFragment(options, 'current-' + toUpdate[i], {
                text: options.data[toUpdate[i]],
            });
        }

        this.sendFragment(options, 'current-duration', {
            attributes: {
                'data-time': duration,
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