var DeezerPlus = {
	onDomUnload: function(e) {
		chrome.extension.sendRequest({name: "unload"}, function(response) { return true; });
	},
	onDomLoad: function(e) {
		if (PlayerPlus.loaded != true) {
			PlayerPlus.loaded = true;
			document.getElementById('playerInfDom').setAttribute('site','Deezer');
			
			interfaceTweaks.init('page');
			
			if(document.getElementById('current-artist') != null) {
				if(document.getElementById('current-track') != null) {
				
				 // Fonction injectée via un location.href chargée de mettre les infos dans PlayerPlus.
				 location.href = "javascript:" +
					
					"function deezerQueueToExt(queue) {" +
						"var queue_out = [];" +
						"var i = queue.length;" +
						"while(i) {" +
							"i--;" +
							"queue_out[i] = {" +
								"artist: queue[i].ART_NAME," +
								"artistId: queue[i].ART_ID," +
								"albumId: queue[i].ALB_ID," +
								"album: queue[i].ALB_TITLE," +
								"song:  queue[i].SNG_TITLE," +
								"songId:  queue[i].SNG_ID," +
								"duration: queue[i].DURATION" +
							"};" +
						"}" +
						"return queue_out;" +
					"}" +

					"function updatePlayerPlus() {" +
							"playerInfDom = document.getElementById('playerInfDom');" +
							"playerInfDom.setAttribute('playing',dzPlayer.isPlaying());" +
							"playerInfDom.setAttribute('artist',dzPlayer.getArtistName());" +
							"playerInfDom.setAttribute('position',dzPlayer.getPosition());" +
							"playerInfDom.setAttribute('track',dzPlayer.getSongTitle());" +
							"playerInfDom.setAttribute('duration',dzPlayer.getDuration());" +
							"playerInfDom.setAttribute('songID',dzPlayer.getSongId());" +
							"playerInfDom.setAttribute('album',dzPlayer.getAlbumTitle());" +
							"playerInfDom.setAttribute('volume',dzPlayer.getVolume());" +
							"playerInfDom.setAttribute('paused',dzPlayer.isPaused());" +
							"playerInfDom.setAttribute('queue',JSON.stringify(deezerQueueToExt(dzPlayer.getTrackList())));" +
							"playerInfDom.setAttribute('queuePosition',dzPlayer.getNumSong());" +
							"document.getElementById('lastUpdate').removeAttribute('updated');" +
							"document.getElementById('lastUpdate').setAttribute('updated',Math.floor(new Date().getTime()));" +
					"};" +
					"document.getElementById('beggin-track').addEventListener('DOMSubtreeModified', updatePlayerPlus , false);" +
					"document.getElementById('h_play').addEventListener('DOMSubtreeModified', updatePlayerPlus , false);" +
					"document.getElementById('h_pause').addEventListener('DOMSubtreeModified', updatePlayerPlus , false);";
					document.getElementById('lastUpdate').addEventListener('DOMSubtreeModified', PlayerPlus.getInformations , false);
					window.onbeforeunload = function() {
						DeezerPlus.onDomUnload();
					};
				}
			}
		}
	},
	getUsername: function() {
		var username;
		var tmp = document.getElementsByTagName('DIV');
		for(var i = 0; i < tmp.length; i++) {
			if(tmp[i].getAttribute('class') == 'username') {
				username = tmp[i].innerText;
				break;
			}
		}
	return username;
	}
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	 switch (request.name) {
           case "controlPlayer":
				switch(request.action) {
					case "prev":
						location.href = "javascript:playercontrol.doAction('prev');";
					break;
					case "play":
						location.href = "javascript:playercontrol.doAction('play');";
					break;
					case "pause":
						location.href = "javascript:playercontrol.doAction('pause');";
					break;
					case "next":
						location.href = "javascript:playercontrol.doAction('next');";
					break;
					case "login":
						location.href = "javascript:loadBox('login.php', 'loading', 'general', '', '0', '0', '');";
					break;
					case "register":
						location.href = "javascript:loadBox('register.php', 'loading', 'general', '', '0', '0', '');";
					break;
					case "subscription":
						location.href = "javascript:loadBox('user/" + DeezerPlus.getUsername() + "/info', 'loading', 'general', '', '1', '0', '');";
					break;
					case "friends":
						location.href = "javascript:loadBox('user/" + DeezerPlus.getUsername() + "/feed', 'loading', 'general', '', '1', '0', '');";
					break;
					case "logout":
						location.href = "javascript:user.logout();";
					break;
					case "home":
						location.href = "javascript:loadBox('index.php', 'loading', 'general', '', '1', '0', '');";
					break;
					case "inbox":
						location.href = "javascript:loadBox('user/" + DeezerPlus.getUsername() + "/inbox/received/0', 'loading', 'general', '', '1', '0', '');";
					break;
					case "playAlbum":
						location.href = "javascript:dzPlayer.playAlbum(" + request.options.album +"," + request.options.index + ");";
					break;
					case "playQueue":
						location.href = "javascript:dzPlayer.playTrackAtIndex(" + request.options.index + ");";
					break;
					case "deleteQueueItem":
						location.href = "javascript:dzPlayer.removeTracks([" + request.options.index + "]);";
					break;
				}
		    break;
        }
     });

document.addEventListener('load', DeezerPlus.onDomLoad , true);

//var timerPlayerPlus = setInterval("location.href='javascript:updatePlayerPlus();';",7500);

