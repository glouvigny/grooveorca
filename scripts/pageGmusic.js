var GroovesharkPlus = {
	onDomUnload: function(e) {
		chrome.extension.sendRequest({name: "unload"}, function(response) { return true; });
	},
	onDomLoad: function(e) {
		if (PlayerPlus.loaded != true) {
			PlayerPlus.loaded = true;
			document.getElementById('playerInfDom').setAttribute('site','Gmusic');
			
			
				
				 // Fonction injectée via un location.href chargée de mettre les infos dans PlayerPlus.
				 location.href = "javascript:" +
					"function updatePlayerPlus() {" +
							"playerInfDom = document.getElementById('playerInfDom');" +
							"playerInfDom.setAttribute('playing',GS.player.isPlaying);" +
							"playerInfDom.setAttribute('loved',GS.player.getCurrentSong().isFavorite);" +
							"playerInfDom.setAttribute('artist',GS.player.getPlaybackStatus().activeSong.ArtistName);" +
							"playerInfDom.setAttribute('position',GS.player.getPlaybackStatus().position/1000);" +
							"playerInfDom.setAttribute('track',GS.player.getPlaybackStatus().activeSong.SongName);" +
							"playerInfDom.setAttribute('duration',(GS.player.getPlaybackStatus().activeSong.EstimateDuration/1000));" +
							"playerInfDom.setAttribute('songID',GS.player.getPlaybackStatus().activeSong.SongID);" +
							"playerInfDom.setAttribute('albumID',GS.player.getPlaybackStatus().activeSong.AlbumID);" +
							"playerInfDom.setAttribute('userID',GS.user.UserID);" +
							"playerInfDom.setAttribute('artistID',GS.player.getPlaybackStatus().activeSong.ArtistID);" +
							"playerInfDom.setAttribute('album',GS.player.getPlaybackStatus().activeSong.AlbumName);" +
							"playerInfDom.setAttribute('volume',GS.player.getVolume());" +
							"playerInfDom.setAttribute('paused',GS.player.isPaused);" +
							"document.getElementById('lastUpdate').removeAttribute('updated');" +
							"document.getElementById('lastUpdate').setAttribute('updated',Math.floor(new Date().getTime()));" +
					"};" +
					"document.getElementById('player_elapsed').addEventListener('DOMSubtreeModified', updatePlayerPlus , false);" +
					"document.getElementById('player_play_pause').addEventListener('DOMSubtreeModified', updatePlayerPlus , false);";
					document.getElementById('lastUpdate').addEventListener('DOMSubtreeModified', PlayerPlus.getInformations , false);
					window.onbeforeunload = function() {
						GroovesharkPlus.onDomUnload();
					};
		}
	},
	getUsername: function() {
		return document.getElementsByClassName('user_username')[0].innerHTML;
	},
	getUserId: function() {
		return document.getElementById('playerInfDom').getAttribute('userID');
	},
	getSongId: function() {
		return document.getElementById('playerInfDom').getAttribute('songID');
	}
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	 switch (request.name) {
           case "controlPlayer":
				switch(request.action) {
					case "prev":
						document.getElementById('rew').onclick();
					break;
					case "play":
						//document.getElementById('playPause').onclick();
						var el = document.getElementById('playPause');
						el.onclick = function() { /*do something*/ };
						el.click();
					break;
					case "pause":
						document.getElementById('playPause').onclick();
					break;
					case "next":
						document.getElementById('ff').onclick();
					break;
					case "login":
					break;
					case "register":
					break;
					case "subscription":
					break;
					case "friends":
						window.open("https://plus.google.com/");
					break;
					case "logout":
						document.getElementById('gb_71').onclick();
					break;
					case "home":
						location.href = "#start_pl";
					break;
					case "inbox":
						window.open("https://mail.google.com/");
					break;
					case "playAlbum":
					break;
					case "love":
						document.getElementById("thumbsUpPlayer").onclick();
					break;
					case "unlove":
						document.getElementById("thumbsDownPlayer").onclick();
					break;
					case "check":
					break;
					case "uncheck":
					break;
				}
		    break;
        }
     });

document.addEventListener('load', GroovesharkPlus.onDomLoad , true);
//var timerPlayerPlus = setInterval("location.href='javascript:updatePlayerPlus();';",7500);

