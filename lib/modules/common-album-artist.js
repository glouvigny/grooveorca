define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Templating = require('../ext/caoutchouc/templating');
    var MetaMusicApi = require('../wrappers/meta-music-api');
    var I18n = require('../ext/caoutchouc/browser').get('i18n');

    var CommonAlbumArtist = function (router) {
        Abstract.call(this, router);
        this.enabled = true;
        this.context = {
            current_song: null,
            data: null,
            site: null,
        };

        this.template_file = '';
        this.template_not_found_file = '';
        this.stack_icon_class = '';
        this.stack_name = '';
        this.api_method = '';
        this.api_param = '';
    };

    CommonAlbumArtist.prototype = Object.create(Abstract.prototype);

    CommonAlbumArtist.prototype._reload = function () {
        this.router.dispatch({
            stack: this.stack_name,
            name: this.stack_name,
            action: 'replace-first',
        });
    };

    CommonAlbumArtist.prototype.routes = {};
    CommonAlbumArtist.prototype.routes.popup_page = function (options) {
        this.router.sendResponse(options, 'popup_tab', {
            'name': I18n.get(this.name),
            'icon': this.stack_icon_class,
            'view': this.stack_name,
            'action': 'replace-first',
        });

        this._reload(options);
    };

    CommonAlbumArtist.prototype.routes.player_song_changed = function (options) {
        if (!this.context.current_song ||
            (this.context.current_song[this.api_param] !=
            options.data[this.api_param] ||
            this.context.site != options.site)) {
            this.context.site = options.site;
            this.context.data = null;
        }

        this.context.current_song = options.data;

        this._reload(options);
    };

    CommonAlbumArtist.prototype.routes.player_unload = function (options) {
        this.context.current_song = null;
        this.context.data = null;
        this.context.site = null;

        this._reload(options);
    };

    CommonAlbumArtist.prototype.page = function(options) {
        if (!this.context.current_song) {
            this.context.data = false;
        }

        if (this.context.data === false) {
            return Templating.render(this.template_not_found_file, {})
                .then(function (view) {
                    this.router.sendResponse(options, 'view', view);
                }.bind(this))
                .catch(function (e) { console.error(e); });
        }

        if (this.context.data === null) {
            return MetaMusicApi[this.api_method](this.context.site,
                this.context.current_song[this.api_param])
                .catch(function (e) { console.error(e); })
                .then(function (data) {
                    if (!data) {
                        data = false;
                    }

                    this.context.data = data;
                    this._reload(options);
                }.bind(this))
                .catch(function (e) { console.error(e); });
        }

        return Templating.render(this.template_file, this.context)
            .then(function (view) {
                this.router.sendResponse(options, 'view', view);
            }.bind(this))
            .catch(function (e) { console.error(e); });
    };

    module.exports = CommonAlbumArtist;
});