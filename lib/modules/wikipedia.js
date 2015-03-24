define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Templating = require('../ext/caoutchouc/templating');
    var WikipediaApi = require('../api/wikipedia');
    var I18n = require('../ext/caoutchouc/browser').get('i18n');

    var Wikipedia = function (router) {
        Abstract.call(this, router);
        this.id = 'wikipedia';
        this.name = 'i18n_wikipedia';
        this.enabled = true;
        this.context = {
            artist: null,
            article: null,
            settings: {
                language: 'en',
            },
            url: null,
        };
    };

    Wikipedia.prototype = Object.create(Abstract.prototype);

    Wikipedia.prototype._reload = function () {
        this.router.dispatch({
            stack: 'wikipedia_page',
            name: 'wikipedia_page',
            action: 'replace-first',
        });
    };

    Wikipedia.prototype.routes = {};
    Wikipedia.prototype.routes.popup_page = function (options) {
        this.router.sendResponse(options, 'popup_tab', {
            'name': I18n.get(this.name),
            'icon': 'icon-wikipedia',
            'view': 'wikipedia_page',
            'action': 'replace-first',
        });

        this._reload();
    };

    Wikipedia.prototype.routes.player_song_changed = function (options) {
        if (this.context.artist != options.data.artist) {
            this.context.artist = options.data.artist;
            this.context.article = null;
            this._reload();
        }
    };

    Wikipedia.prototype.routes.player_unload = function (options) {
        this.context.artist = null;
        this.context.article = null;
        this.context.url = null;

        this._reload();
    };

    Wikipedia.prototype.showArticle = function(options, artist, article, url) {
        if (this.context.artist === artist) {
            this.context.article = article;
            this.context.url = url;
        }

        return Templating.render('templates/wikipedia-article.mst', {
                article: article,
                url: url,
            })
            .then(function (view) {
                this.router.sendResponse(options, 'view', view);
            }.bind(this));
    };

    Wikipedia.prototype.routes.wikipedia_page = function (options) {
        if (this.context.artist === null) {
            return Templating.render('templates/wikipedia-default.mst', {})
                .then(function (view) {
                    this.router.sendResponse(options, 'view', view);
                }.bind(this));
        }

        if (this.context.article !== null) {
            return this.showArticle(options, this.context.artist,
                this.context.article, this.context.url);
        }

        return WikipediaApi.getArticle(this.context.artist,
            this.context.settings.language)
            .then(function (data) {
                return this.showArticle(options, this.context.artist,
                    data.article, data.url);
            }.bind(this))
            .catch(function () {
                return Templating.render('templates/wikipedia-error.mst', {})
                    .then(function (view) {
                       this.router.sendResponse(options, 'view', view);
                    }.bind(this));
            }.bind(this));
    };

    Wikipedia.prototype.settingsPage = function () {
        return WikipediaApi.getLanguages()
            .then(function (languages) {
                return Templating.render('templates/settings-wikipedia.mst',
                    {
                        'context': this.context,
                        'languages': languages,
                    });
            }.bind(this));
    };


    module.exports = Wikipedia;
});