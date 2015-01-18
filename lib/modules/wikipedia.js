define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Templating = require('../ext/caoutchouc/templating');
    var WikipediaApi = require('../api/wikipedia');

    var Wikipedia = function (router) {
        Abstract.call(this, router);
        this.id = 'wikipedia';
        this.name = 'Wikipedia';
        this.enabled = true;
        this.context = {
            artist: null,
            article: null,
            settings: {
                language: 'en',
            }
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
            'name': 'Wikipedia',
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

    Wikipedia.prototype.showArticle = function(options, artist, article) {
        if (this.context.artist === artist) {
            this.context.article = article;
        }

        return Templating.render('templates/wikipedia-article.mst',
            this.context)
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
                this.context.article);
        }

        return WikipediaApi.getArticle(this.context.artist,
            this.context.settings.language)
            .then(function (article) {
                return this.showArticle(options, this.context.artist, article);
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