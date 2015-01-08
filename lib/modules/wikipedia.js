define(function (require, exports, module) {
    var Abstract = require('../ext/caoutchouc/abstract-module');
    var Templating = require('../ext/caoutchouc/templating');
    var WikipediaApi = require('../api/wikipedia');

    var Wikipedia = function (router) {
        Abstract.call(this, router);
        this.name = 'Wikipedia';
        this.enabled = true;
        this.context = {
            artist: null,
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
            this._reload();
        }
    };

    Wikipedia.prototype.showArticle = function(options, artist, article) {
        console.log(arguments);
        return Templating.render('templates/wikipedia-article.mst', {
            artist: artist,
            article: article,
        }, function (view) {
            this.router.sendResponse(options, 'view', view);
        }.bind(this));
    };

    Wikipedia.prototype.routes.wikipedia_page = function (options) {
        if (this.context.artist === null) {
            return Templating.render('templates/wikipedia-default.mst', {},
                function (view) {
                    this.router.sendResponse(options, 'view', view);
                }.bind(this)
            );
        }

        return WikipediaApi.getArticle(this.context.artist, 'fr',
            function (article, error) {
                if (error) {
                    return Templating.render('templates/wikipedia-error.mst', {
                    }, function (view) {
                       this.router.sendResponse(options, 'view', view);
                    }.bind(this));
                }

                return this.showArticle(options, this.context.artist, article);
            }.bind(this));
    };

    module.exports = Wikipedia;
});