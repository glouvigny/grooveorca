(function () {
    if (typeof MusicBridge !== 'undefined') {
        var mb = new MusicBridge('grooveshark', ['*://*.grooveshark.com/*']);
        if (mb.scriptReloaded || !mb.loaded) {
            return;
        }
    }

    var _gs = function () {
        return window.GS || unsafeWindow.GS;
    };

    var bridgeWatcher = new BridgeWatcher();
    var updateData = bridgeWatcher.updateData.grooveOrcaBind(bridgeWatcher);

    var nextRepeatMode = {0: 1, 1: 2, 2: 0};
    var repeatModes = {'none': 0, 'song': 2, 'all': 1};

    var updateTrack =  function (force) {
        if (!_gs().Services.SWF.getPlaybackStatus()) {
            return;
        }

        var raw = _gs().Services.SWF.getPlaybackStatus().activeSong;

        if (!raw) {
            return;
        }

        updateData('song', {
            artist: raw.ArtistName,
            track: raw.SongName,
            album: raw.AlbumName,
            album_id: raw.AlbumName,
            track_id: raw.SongID,
            artist_id: raw.ArtistID,
            duration: parseInt(raw.EstimateDuration, 10),
            album_art: 'http://images.gs-cdn.net/static/albums/120_' +
                raw.CoverArtFilename,
            disk_number: 0,
            track_number: 0,
        }, force);
    };

    var updatePosition = function (force) {
        if (!_gs().Services.SWF.getPlaybackStatus()) {
            return;
        }

        updateData('position', parseInt(_gs().Services.SWF.getPlaybackStatus()
            .position / 1000, 10), force);
    };

    var updateVolume = function (force) {
        updateData('volume', _gs().Services.SWF.getVolume() / 100, force);
    };

    var updateState = function (force) {
        var state = _gs().getCurrentPlayStatus();

        if (state === 6 || state === 0) {
            return updateData('state', 'stopped', force);
        } else if (state === 4) {
            return updateData('state', 'paused', force);
        }

        return updateData('state', 'playing', force);
    };

    var updateShuffle = function (force) {
        updateData('shuffle', !!_gs().Services.SWF.getCurrentQueue()
            .shuffleEnabled, force);
    };

    var updateRepeat = function (force) {
        var repeat = 'none';
        for (var i in repeatModes) {
            if (repeatModes.hasOwnProperty(i)) {
                if (repeatModes[i] === _gs().Services.SWF.getCurrentQueue()
                    .repeatMode) {
                    repeat = i;
                }
            }
        }

        updateData('repeat', repeat, force);
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
        'playpause': function () { _gs().Services.SWF.togglePlay(); },
        'next': function () { _gs().Services.SWF.nextSong(); },
        'previous': function () { _gs().Services.SWF.previousSong(); },
        'volume': function (param) {
            _gs().Services.SWF.setVolume(param.volume * 100);
        },
        'play': function () { _gs().widgets.player.resume(); },
        'pause': function () { _gs().Services.SWF.resumeSong(); },
        'seek': function (param) {
            _gs().Services.SWF.seekTo(param.position * 1000);
        },
        'repeat': function (param) {
            if (param.mode === undefined) {
                param.mode = nextRepeatMode[_gs().Services.SWF.getCurrentQueue()
                    .repeatMode];
            } else {
                param.mode = repeatModes[param.mode];
            }

            if (param.mode !== undefined) {
                _gs().Services.SWF.setRepeat(param.mode);
            }
        },
        'update_track': function() { updateTrack(true); },
        'shuffle': function (param) {
            if (param.shuffle === undefined) {
                param.shuffle = !_gs().Services.SWF.getCurrentQueue()
                    .shuffleEnabled;
            }

            _gs().Services.SWF.setShuffle(param.shuffle);
        },
    };

    bridgeWatcher.registerActions(actions);
    bridgeWatcher.registerElementsToWatch(eltsToWatch);
})();
