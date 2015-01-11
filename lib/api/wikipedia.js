define(function (require, exports, module) {
    var HttpClient = require('../ext/caoutchouc/browser').get('http-client');
    var Dom = require('../ext/caoutchouc/browser').get('dom');
    var DomUtils = require('../ext/caoutchouc/dom-utils');

    var WikipediaApi = {};

    var regexpSpace = / /g;

    var article = {
        title: '',
        content: '',
    };

    WikipediaApi.getArticle = function (name, lang) {
        var url = 'https://' + lang + '.wikipedia.org/w/index.php';

        if (article.title === name) {
            return Promise.resolve(article.content);
        }

        return HttpClient.get(url, {
            action: 'render',
            title: name.replace(regexpSpace, '_'),
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
                content: doc.documentElement.outerHTML,
            };

            return Promise.resolve(doc.documentElement.outerHTML);
        });
    };

    module.exports = WikipediaApi;
});