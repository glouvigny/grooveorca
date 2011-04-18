var GroovesharkPlus = {
	onDomUnload: function(e) {
		chrome.extension.sendRequest({name: "unload"}, function(response) { return true; });
	},
	onDomLoad: function(e) {
		if (PlayerPlus.loaded != true) {
			PlayerPlus.loaded = true;
			document.getElementById('playerInfDom').setAttribute('site','Grooveshark');
			
			
				
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
						location.href = "javascript:GS.player && GS.player.previousSong();GS.player && GS.player.previousSong();";
					break;
					case "play":
						//location.href = "javascript:if (GS.player && GS.player.queue && GS.player.queue.activeSong) GS.player.isPaused ? GS.player.resumeSong() : GS.player.playSong(GS.player.queue.activeSong.queueSongID);";
						location.href = "javascript:$('#player_play_pause').click();";
					break;
					case "pause":
						//location.href = "javascript:GS.player && GS.player.pauseSong();";
						location.href = "javascript:$('#player_play_pause').click();";
					break;
					case "next":
						location.href = "javascript:GS.player && GS.player.nextSong();";
					break;
					case "login":
						location.href = "javascript:document.getElementById('header_login').click();";
					break;
					case "register":
						location.href = "javascript:document.getElementById('session_btn_signup').click();";
					break;
					case "subscription":
						location.href = "#/user/" + GroovesharkPlus.getUsername() + "/" + GroovesharkPlus.getUserId();
					break;
					case "friends":
						location.href = "#/user/" + GroovesharkPlus.getUsername() + "/" + GroovesharkPlus.getUserId() + "/community/following"
					break;
					case "logout":
						location.href = "javascript:GS.auth.logout();";
					break;
					case "home":
						location.href = "#/";
					break;
					case "inbox":
						location.href = "#/";
					break;
					case "playAlbum":
						location.href = "javascript:$.publish(\"gs.album.play\", { albumID: " + request.options.album +", playOnAdd: true, getFeedback: false });" +
						"window.setTimeout(function() { i = " + request.options.index + "; while(i) { i--; javascript:GS.player && GS.player.nextSong(); } }, 1500);"
						;
					break;
					case "love":
						location.href = "javascript:GS.user.addToSongFavorites(" + GroovesharkPlus.getSongId() + ");";
					break;
					case "unlove":
						location.href = "javascript:GS.user.removeFromSongFavorites(" + GroovesharkPlus.getSongId() + ");";
					break;
					case "check":
						location.href = "javascript:GS.user.addToSongFavorites(" + GroovesharkPlus.getSongId() + ");";
					break;
					case "uncheck":
						location.href = "javascript:GS.user.removeFromSongFavorites(" + GroovesharkPlus.getSongId() + ");";
					break;
				}
		    break;
        }
     });

document.addEventListener('load', GroovesharkPlus.onDomLoad , true);
//var timerPlayerPlus = setInterval("location.href='javascript:updatePlayerPlus();';",7500);

