(function () {
    if (typeof MusicBridge !== 'undefined') {
        var mb = new MusicBridge('xboxmusic', ['*://music.xbox.com/*']);
        if (mb.scriptReloaded || !mb.loaded) {
            return;
        }
    }

    var _xboxMusic = function () {
        return (window.app || unsafeWindow.app).mainViewModel;
    };

    var _duration = function () {
        var dur = _xboxMusic().playerVM.duration();

        dur = parseInt(dur.substr(dur.indexOf(':') + 1), 10) +
            parseInt(dur.substr(0, dur.indexOf(':')), 10) * 60;

        return dur;
    };

    var bridgeWatcher = new BridgeWatcher();
    var updateData = bridgeWatcher.updateData.grooveOrcaBind(bridgeWatcher);

    var nextRepeatMode = {false: true, true: false};
    var repeatModes = {'none': false, 'song': true, 'all': true};

    var updateTrack =  function (force) {
        var raw = _xboxMusic().queueVM.currentQueueElement();

        if (!raw || !raw.track) {
            return;
        }

        raw = raw.track;

        updateData('song', {
            artist: raw.primaryArtist.Name,
            track: raw.name,
            album: raw.parentAlbum.Name,
            album_id: raw.parentAlbum.ZuneId,
            track_id: raw.zuneId,
            artist_id: raw.primaryArtist.ZuneId,
            duration: _duration(),
            album_art: 'https://musicimage.xboxlive.com/catalog/music.' +
                raw.parentAlbum.ImageId +
                '/image?locale=fr-FR&w=600&h=600',
            disk_number: 0,
            track_number: 0,
        }, force);
    };

    var updatePosition = function (force) {
        updateData('position', _xboxMusic().playerVM.currentTrackTime(),
            force);
    };

    var updateVolume = function (force) {
        updateData('volume', _xboxMusic().playerVM.currentVolume() / 100,
            force);
    };

    var updateState = function (force) {
        if (_xboxMusic().playerVM.isPlayingOrLoading()) {
            return updateData('state', 'playing', force);
        } else {
            return updateData('state', 'paused', force);
        }
    };

    var updateShuffle = function (force) {
        updateData('shuffle', _xboxMusic().queueVM.isShuffled(),
            force);
    };

    var updateRepeat = function (force) {
        updateData('repeat', _xboxMusic().queueVM.isRepeated() ?
            'all' : 'none', force);
    };

    var eltsToWatch = [
        updatePosition,
        updateTrack,
        updateVolume,
        updateState,
        updateShuffle,
        updateRepeat,
    ];

    var actions = {
        'playpause': function () {
            _xboxMusic().playerVM.togglePause();
        },
        'next': function () { _xboxMusic().playerVM.next(); },
        'previous': function () { _xboxMusic().playerVM.previous(); },
        'volume': function (param) {
            _xboxMusic().playerVM.changeVolume(0, param.volume * 100);
        },
        'play': function () {
            if (!_xboxMusic().playerVM.isPlayingOrLoading()) {
                _xboxMusic().playerVM.togglePause();
            }
        },
        'pause': function () {
            if (_xboxMusic().playerVM.isPlayingOrLoading()) {
                _xboxMusic().playerVM.togglePause();
            }
        },
        'seek': function (param) {
            _xboxMusic().playerVM.seek(param.position / _duration() * 100);
        },
        'repeat': function (param) {
            // TODO
        },
        'update_track': function() { updateTrack(true); },
        'shuffle': function (param) {
            // TODO
        },
    };

    bridgeWatcher.registerActions(actions);
    bridgeWatcher.registerElementsToWatch(eltsToWatch);
})();
