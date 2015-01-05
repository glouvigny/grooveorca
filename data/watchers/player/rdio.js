(function () {
    if (typeof MusicBridge !== 'undefined') {
        var mb = new MusicBridge('rdio');
        if (mb.scriptReloaded) {
            return;
        }
    }

    var _r = function () {
        return window.R || unsafeWindow.R;
    };

    var bridgeWatcher = new BridgeWatcher();
    var updateData = bridgeWatcher.updateData.bind(bridgeWatcher);

    var updateTrack =  function () {
        var raw = _r().player._model.get('playingTrack').attributes;
        if (!raw) {
            return;
        }

        updateData('song', {
            artist: raw.artist,
            track: raw.name,
            album: raw.album,
            album_id: raw.albumKey,
            track_id: raw.key,
            artist_id: raw.albumArtistKey,
            duration: raw.duration,
            album_art: raw.bigIcon1200,
            disk_number: raw.disc,
            track_number: raw.number,
        });
    };

    var updatePosition = function () {
        updateData('position', _r().player.position());
    };

    var updateVolume = function () {
        updateData('volume', _r().player.volume());
    };

    var updateState = function () {
        if (_r().player.isPlaying()) {
            return updateData('state', 'playing');
        } else if (_r().player.playState() == _r().player.PLAYSTATE_PAUSED) {
            return updateData('state', 'paused');
        }

        return updateData('state', 'stopped');
    };

    var eltsToWatch = {
        '.player_bottom .time': updatePosition,
        '.text_metadata': updateTrack,
        '.Slider.volume': updateVolume,
        '.play_pause': updateState,
    };

    var actions = {
        'playpause': function () { _r().player.playPause(); },
        'next': function () { _r().player.next(); },
        'previous': function () { _r().player.previous(); },
        'volume': function (param) { _r().player.setVolume(param.volume); },
        'shuffle': function (param) { _r().player.setShuffle(param.shuffle); },
        'play': function () { _r().player.play(); },
        'pause': function () { _r().player.pause(); },
        'seek': function (param) { _r().player.seek(param.position); },
        'repeat': function (param) {
            var modes = {'none': 0, 'all': 2, 'song': 1};
            _r().player.setRepeat(modes[param.mode]);
        },
    };

    bridgeWatcher.registerActions(actions);
    bridgeWatcher.registerElementsToWatch(eltsToWatch, true);
})();