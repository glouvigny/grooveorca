var MusicBridge ;

(function () {
    if ((typeof safari === 'object' && typeof safari.self === 'undefined') ||
        (typeof chrome === 'object' && typeof chrome.i18n === 'undefined')) {
        return;
    }


    // Bridge from the unprivileged page script.
    MusicBridge = function (site, whitelist) {
        this.site = site;
        this.elt = this.initExchangeElt(this.bridgeData);

        document.querySelector('body').appendChild(this.elt);

        Messaging.addRecv(function (data) {
            if (!data || !data.api_action) {
                return false;
            }

            this.addAction(data);
        }.bind(this));

        this.watcher();
        this.scriptReloaded = this.loadChromeScript();

        window.onunload = function () {
            Messaging.send({
                name: 'player_unload',
            });
        };
    };

    MusicBridge.prototype.bridgeData = {
        'song': ['song_changed', '{}'],
        'position': ['position_changed', '0'],
        'api-result': ['api_result', '{}'],
        'state': ['state_changed', 'stopped'],
        'volume': ['volume_changed', '1'],
        'shuffle': ['shuffle_changed', 'false'],
        'repeat': ['repeat_changed', 'none'],
        'queue': ['queue_changed', '[]'],
    };

    MusicBridge.prototype.initExchangeElt = function () {
        var elt = document.createElement('div');
        elt.id = 'playerplus-exchange';
        elt.setAttribute('data-plpl-api-actions', '[]');

        for (var i in this.bridgeData) {
            if (this.bridgeData.hasOwnProperty(i)) {
                elt.setAttribute('data-plpl-' + i, this.bridgeData[1]);
            }
        }

        return elt;
    };

    MusicBridge.prototype.addAction = function (action) {
        var json = this.elt.getAttribute('data-plpl-api-actions');
        var actions = JSON.parse(json);

        actions.push(action);

        this.elt.setAttribute('data-plpl-api-actions', JSON.stringify(actions));
    };

    MusicBridge.prototype.dataChanged = function (name, data) {
        Messaging.send({
            site: this.site,
            name: 'player_' + name,
            data: data,
        });
    };

    MusicBridge.prototype.watcher = function () {
        var obs = new MutationObserver(function(mutations) {
            mutations.forEach(function(mut) {
                if (mut.type == 'attributes' &&
                    typeof mut.attributeName === 'string' &&
                    mut.attributeName.substring(0, 10) == 'data-plpl-') {
                    var key = mut.attributeName.substring(10);

                    if (this.bridgeData[key] === undefined) {
                        return;
                    }

                    var data = mut.target.getAttribute(mut.attributeName);
                    if (data !== 'undefined') {
                        data = JSON.parse(data);

                        this.dataChanged(this.bridgeData[key][0], data);
                    }
                }
            }.bind(this));
        }.bind(this));

        obs.observe(this.elt, {attributes: true});
    };

    MusicBridge.prototype.loadChromeScript = function() {
        var scripts = ['bridge-watcher.js', 'player/' + this.site + '.js'];

        if (typeof safari !== 'undefined' &&
            typeof safari.self !== 'undefined') {
            scripts = [safari.extension.baseURI + 'data/content_scripts.js'];

        } else if (typeof chrome !== 'undefined' &&
            typeof chrome.i18n !== 'undefined') {
            scripts = scripts.map(
                function (script) {
                    return chrome.extension.getURL('data/watchers/' + script);
                });
        } else {
            scripts = [];
        }

        if (scripts.length > 0) {
            scripts.map(function (url) {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = url;
                document.getElementsByTagName('*')[0].appendChild(script);
            });

            return true;
        }

        return false;
    };

    try {
        if (chrome !== undefined && chrome.i18n === undefined) {
            MusicBridge = undefined;
        }
    } catch (e) {
    }

    try {
        if (typeof safari !== 'undefined' &&
            typeof safari.self === 'undefined') {
            MusicBridge = undefined;
        }
    } catch (e) {
    }
})();
