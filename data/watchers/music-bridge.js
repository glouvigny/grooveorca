// Bridge from the unprivileged page script.
var MusicBridge = function (site) {
    if (site === undefined) {
        console.error('Couldn\'t initialize MusicBridge');
        return;
    }

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
    var actions = JSON.parse(this.elt.getAttribute('data-plpl-api-actions'));

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
                data = JSON.parse(data);

                this.dataChanged(this.bridgeData[key][0], data);
            }
        }.bind(this));
    }.bind(this));

    obs.observe(this.elt, {attributes: true});
};

MusicBridge.prototype.loadChromeScript = function() {
    if (typeof chrome !== 'undefined' &&
        typeof chrome.i18n !== 'undefined') {
        ['bridge-watcher.js', 'player/' + this.site + '.js'].map(function (i) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = chrome.extension.getURL('data/watchers/' + i);
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