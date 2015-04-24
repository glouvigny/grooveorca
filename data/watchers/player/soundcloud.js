(function () {
    if (typeof ConditionalLoading !== 'undefined') {
        if (!ConditionalLoading.check('data/watchers/player/soundcloud.js')) {
            return;
        }
    }

    if (typeof MusicBridge !== 'undefined') {
        var mb = new MusicBridge('soundcloud');
        if (mb.scriptReloaded) {
            return;
        }
    }

    var bridgeWatcher = new BridgeWatcher();
    var updateData = bridgeWatcher.updateData.grooveOrcaBind(bridgeWatcher);

    var clickSlider = function (elt, x, y, evt) {
            var event = new MouseEvent(evt, {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: x,
                offsetX: x,
                layerX: x,
                clientY: y,
                offsetY: y,
                layerY: y,
            });
            elt.dispatchEvent(event);
    };

    var SC_API_ID = 'dd8d7103e93deaa4cb9498b098a1ee64';
    var SC_API_EP = 'https://api.soundcloud.com/';

    var apiQueries = {};

    var fetchApi = function (path, cb) {
        if (apiQueries[path] !== undefined) {
            return (apiQueries[path] !== true) ? cb(apiQueries[path]) : false;
        }

        apiQueries[path] = true;

        var url = SC_API_EP + 'resolve.json?url=http://soundcloud.com' + path +
            '&client_id=' + SC_API_ID;

        var xhr = new XMLHttpRequest();

        xhr.addEventListener('load', function () {
            var json = JSON.parse(this.responseText);
            apiQueries[path] = json;
            return cb(json);
        }, false);

        xhr.addEventListener('error', function () {
            apiQueries[path] = undefined;
        }, false);

        xhr.open('get', url);
        xhr.send();
    };

    var getSongAndArtistName = function (raw) {
        var song = raw.title;
        var artist = raw.user.username;

        if (raw.label_name === raw.user.username) {
            if (song.indexOf(' - ') != -1) {
                artist = song.substr(0, song.indexOf(' - '));
                song = song.substr(song.indexOf(' - ') + 3);
            } else if (song.toLowerCase().indexOf(raw.genre) !== -1) {
                var start = song.toLowerCase().indexOf(raw.genre);
                var len = raw.genre.length;

                song = song.split('');
                artist = song.splice(start, len).join('');
                song = song.join('');
            }
        }

        if (song.substr(0, artist.length) == artist) {
            if (song.indexOf(' - ') !== -1) {
                song = song.substr(song.indexOf(' - ') + 3);
            } else {
                song = song.substr(artist.length + 1);
            }
        }

        return {
            'song': song,
            'artist': artist,
        };
    };

    var updateTrack = function (force) {
        var permalink = document.querySelector('.playbackSoundBadge__title');
        if (permalink === null) {
            return;
        }

        var path = permalink.getAttribute('href');

        fetchApi(path, function (raw) {
            songArtist = getSongAndArtistName(raw);

            updateData('song', {
                artist: songArtist.artist,
                track: songArtist.song,
                album: '',
                album_id: '',
                track_id: raw.id,
                artist_id: raw.user.id,
                duration: parseInt(raw.duration / 1000, 10),
                album_art: raw.artwork_url || raw.user.avatar_url,
                disk_number: 0,
                track_number: 0,
            }, force);
        });
    };

    var parseTime = function (elt) {
        if (elt === undefined || elt === null) {
            return 0;
        }

        var pos = elt.innerText;

        if (pos === '') {
            return 0;
        }

        return parseInt(pos.substr(0, pos.indexOf(':')), 10) * 60 +
            parseInt(pos.substr(pos.indexOf(':') + 1), 10);
    };

    var updatePosition = function (force) {
        if (document.querySelector('.playbackTimeline.is-dragging') !== null) {
            return;
        }

        var pos = parseTime(document
            .querySelector('.playControls .playbackTimeline__timePassed'));

        updateData('position', pos, force);
    };

    var updateVolume = function (force) {
        var slider = document.querySelector('.volume__sliderWrapper');

        updateData('volume',
            parseInt(slider.getAttribute('aria-valuenow'), 10) /
            parseInt(slider.getAttribute('aria-valuemax'), 10),
            force);
    };

    var updateState = function (force) {
        var play = document.querySelector('button.playControl.playing');

        if (play !== null) {
            return updateData('state', 'playing', force);
        }

        return updateData('state', 'paused', force);
    };

    var updateShuffle = function (force) {
        return updateData('shuffle', false, force);
    };

    var updateRepeat = function (force) {
        var repeat = document.querySelector('button.repeatControl.m-active');

        if (repeat !== null) {
            return updateData('repeat', 'song', force);
        }

        return updateData('repeat', 'none', force);
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
            document.querySelector('button.playControl').click();
        },
        'next': function () {
            document.querySelector('button.skipControl.skipControl__next')
                .click();
        },
        'previous': function () {
            document.querySelector('button.skipControl.skipControl__previous')
                .click();
        },
        'volume': function (param) { /* TODO */ },
        'play': function () {
            if (document.querySelector('button.playControl.playing') === null) {
                document.querySelector('#player [data-id="play-pause"]')
                    .click();
            }
        },
        'pause': function () {
            if (document.querySelector('button.playControl.playing') !== null) {
                document.querySelector('#player [data-id="play-pause"]')
                    .click();
            }
        },
        'seek': function (param) {
            var max = parseTime(document
                .querySelector('.playbackTimeline__duration'));
            var elt = document
                .querySelector('.playbackTimeline__progressWrapper');

            var posX = elt.getBoundingClientRect().left;
            var sizX = elt.getBoundingClientRect().width;

            var x = posX + parseInt((param.position / max) * sizX, 10);

            clickSlider(elt, x, 0, 'mousedown');
            clickSlider(elt, x, 0, 'mouseup');
        },
        'repeat': function (param) {
            document.querySelector('.repeatControl').click();
        },
        'update_track': function() { updateTrack(true); },
        'shuffle': function (param) { /* N/A */ },
    };

    bridgeWatcher.registerActions(actions);
    bridgeWatcher.registerElementsToWatch(eltsToWatch);
})();
