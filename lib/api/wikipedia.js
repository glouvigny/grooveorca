define(function (require, exports, module) {
    var HttpClient = require('../ext/caoutchouc/browser').get('http-client');
    var Dom = require('../ext/caoutchouc/browser').get('dom');
    var DomUtils = require('../ext/caoutchouc/dom-utils');

    var WikipediaApi = {};

    var regexpSpace = / /g;

    var article = {
        title: '',
        language: '',
        content: '',
    };

    var languages = [
        {
            '*' : 'Deutsch',
            'code': 'de',
        },
        {
            '*' : 'English',
            'code': 'en',
        },
        {
            '*' : 'Espa\xF1ol',
            'code': 'es',
        },
        {
            '*' : 'Fran\xE7ais',
            'code': 'fr',
        },
        {
            '*' : 'Italiano',
            'code': 'it',
        },
        {
            '*' : 'Nederlands',
            'code': 'nl',
        },
        {
            '*' : 'Polski',
            'code': 'pl',
        },
        {
            '*' : '\u0420\u0443\u0441\u0441\u043A\u0438\u0439',
            'code': 'ru',
        },
        {
            '*' : 'Sinugboanong Binisaya',
            'code': 'ceb',
        },
        {
            '*' : 'Svenska',
            'code': 'sv',
        },
        {
            '*' : 'Ti\u1EBFng Vi\u1EC7t',
            'code': 'vi',
        },
        {
            '*' : 'Winaray',
            'code': 'war',
        },
    ];

    WikipediaApi.getLanguages = function () {
        return Promise.resolve(languages);
    };

    WikipediaApi.getArticle = function (name, lang) {
        var url = 'https://' + lang + '.wikipedia.org/w/index.php';
        var url_name = name.replace(regexpSpace, '_');
        var ext_url = 'https://' + lang + '.wikipedia.org/wiki/' + url_name;

        if (article.title === name && article.language === lang) {
            return Promise.resolve({
                article: article.content,
                url: ext_url,
            });
        }

        return HttpClient.get(url, {
            action: 'render',
            title: url_name,
        })
        .then(function (res) {
            var doc = Dom.parse(res.body, 'text/html');
            doc = DomUtils.absoluteLinks(doc, 'https://');
            doc = DomUtils.newWindowLinks(doc);

            if (res.status !== 200) {
                return Promise.reject();
            }

            article = {
                title: name,
                language: lang,
                content: doc.documentElement.outerHTML,
            };

            return Promise.resolve({
                article: doc.documentElement.outerHTML,
                url: ext_url,
            });
        });
    };

    module.exports = WikipediaApi;
});