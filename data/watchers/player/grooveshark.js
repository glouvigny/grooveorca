(function () {
    if (typeof ConditionalLoading !== 'undefined') {
        if (!ConditionalLoading.check('data/watchers/player/grooveshark.js')) {
            return;
        }
    }

    if (typeof MusicBridge !== 'undefined') {
        var mb = new MusicBridge('grooveshark');
        if (mb.scriptReloaded) {
            return;
        }
    }

    var _gs = function () {
        return window.GS || unsafeWindow.GS;
    };

    var _gshark = function () {
        return window.Grooveshark || unsafeWindow.Grooveshark;
    };

    var bridgeWatcher = new BridgeWatcher();
    var updateData = bridgeWatcher.updateData.grooveOrcaBind(bridgeWatcher);

    var nextRepeatMode = {0: 1, 1: 2, 2: 0};
    var repeatModes = {'none': 0, 'song': 2, 'all': 1};

    var updateTrack =  function (force) {
        if (!_gshark().getCurrentSongStatus().song) {
            return;
        }

        var raw = _gshark().getCurrentSongStatus().song;

        if (!raw) {
            return;
        }

        updateData('song', {
            artist: raw.artistName,
            track: raw.songName,
            album: raw.albumName,
            album_id: raw.albumName,
            track_id: raw.songID,
            artist_id: raw.artistID,
            duration: parseInt(raw.estimateDuration, 10),
            album_art: raw.artURL,
            disk_number: 0,
            track_number: raw.trackNum,
        }, force);
    };

    var updatePosition = function (force) {
        updateData('position', parseInt(0, 10), force); /* TODO */
    };

    var updateVolume = function (force) {
        updateData('volume', _gshark().getVolume() / 100, force);
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
        updateData('shuffle', false, force); /* TODO */
    };

    var updateRepeat = function (force) {
        var repeat = 'none';
        for (var i in repeatModes) {
            if (repeatModes.hasOwnProperty(i)) {
                if (repeatModes[i] === 'none') { /* TODO */
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
        'playpause': function () { _gshark().togglePlayPause(); },
        'next': function () { _gshark().next(); },
        'previous': function () { _gshark().previous(); },
        'volume': function (param) {
            _gshark().setVolume(param.volume);
        },
        'play': function () { _gshark().togglePlayPause(); /* TODO */ },
        'pause': function () { _gshark().pause(); },
        'seek': function (param) {
            _gshark().seekTo(param.position * 1000);
        },
        'repeat': function (param) { /* TODO */ },
        'update_track': function() { updateTrack(true); },
        'shuffle': function (param) { /* TODO */ },
    };

    bridgeWatcher.registerActions(actions);
    bridgeWatcher.registerElementsToWatch(eltsToWatch);
})();
