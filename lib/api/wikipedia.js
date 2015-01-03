define(function (require, exports, module) {
    var HttpClient = require('../ext/caoutchouc/browser/browser')
        .get('http-client');
    var Dom = require('../ext/caoutchouc/browser/browser').get('dom');
    var DomUtils = require('../ext/caoutchouc/dom-utils');

    var WikipediaApi = {};

    var regexpSpace = / /g;

    var article = {
        title: '',
        content: '',
    };

    WikipediaApi.getArticle = function (name, lang, cb) {
        var url = 'https://' + lang + '.wikipedia.org/w/index.php';

        if (article.title === name) {
            return cb(article.content, false);
        }

        return HttpClient.get(url, {
            action: 'render',
            title: name.replace(regexpSpace, '_'),
        }, function (res) {
            var doc = Dom.parse(res.body, 'text/html');
            doc = DomUtils.absoluteLinks(doc, 'https://');
            doc = DomUtils.newWindowLinks(doc);

            if (res.status === 200) {
                article = {
                    title: name,
                    content: doc.documentElement.outerHTML,
                };
            }

            return cb(doc.documentElement.outerHTML, res.status !== 200);
        });
    };

    module.exports = WikipediaApi;
});