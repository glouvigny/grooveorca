// Element dom pour récupérer plus de données. 
var deezerPlusDom = document.createElement('div');
deezerPlusDom.id = "deezerPlus";
deezerPlusDom.style.display = 'none';
var lastUpdateDom = document.createElement('div');
lastUpdateDom.id = "lastUpdate"
deezerPlusDom.appendChild(lastUpdateDom);
document.getElementById('body').appendChild(deezerPlusDom);

var DeezerPlus = {
	deezerPage: null,
	loaded:false,
	localLastUpdate:0,
	songInf: {
		paused: null,
		currentSong: null,
		currentArtist: null,
		currentAlbum: null,
		currentSongId: null,
		currentDuration: null,
		currentPosition: null,
		currentVolume:null,
		lastUpdate:null,
		firstSeen:null,
		firstSeenPlaying:null,
		coverURL:""
	},
	getInformations: function() {
		// !Album, Artiste, Piste = nouvelle piste, on note la date de 1ère apparition
		if(DeezerPlus.songInf.currentArtist != document.getElementById('deezerPlus').getAttribute('artist') ||
			DeezerPlus.songInf.currentAlbum != document.getElementById('deezerPlus').getAttribute('album') || 
			DeezerPlus.songInf.currentSong != document.getElementById('deezerPlus').getAttribute('track')) {
			
			DeezerPlus.songInf.currentArtist	= document.getElementById('deezerPlus').getAttribute('artist');
			DeezerPlus.songInf.currentAlbum 	= document.getElementById('deezerPlus').getAttribute('album');
			DeezerPlus.songInf.currentSong 		= document.getElementById('deezerPlus').getAttribute('track');
			
			// Evite les scrobbles chiants.
			DeezerPlus.songInf.currentPosition 	= 0;
			
			DeezerPlus.songInf.firstSeen = Math.floor(new Date().getTime()/1000);
			DeezerPlus.songInf.firstSeenPlaying = null;
			
			// On push pas, certaines infos seront peut-être modifiées de nouveau
			return false;
		}		
		DeezerPlus.songInf.coverURL			= document.getElementById('deezerPlus').getAttribute('coverurl');
		DeezerPlus.songInf.currentSongId	= parseInt(document.getElementById('deezerPlus').getAttribute('songid'));
		DeezerPlus.songInf.currentDuration	= parseInt(document.getElementById('deezerPlus').getAttribute('duration'));
		DeezerPlus.songInf.currentPosition	= parseInt(document.getElementById('deezerPlus').getAttribute('position'));
		
		if(document.getElementById('deezerPlus').getAttribute('playing') == 'false')
			DeezerPlus.songInf.paused = true;
		else
			DeezerPlus.songInf.paused = false;
		DeezerPlus.songInf.currentVolume	= parseInt(document.getElementById('deezerPlus').getAttribute('volume'));
		DeezerPlus.songInf.lastUpdate 		= Math.floor(new Date().getTime()/1000);
		
		// Piste en lecture récup. de l'heure de début
		if((DeezerPlus.songInf.firstSeenPlaying == null && !isNaN(DeezerPlus.songInf.currentPosition) && DeezerPlus.songInf.currentPosition != 0))
			DeezerPlus.songInf.firstSeenPlaying = Math.floor(new Date().getTime()/1000);
		
		//console.log(DeezerPlus.localLastUpdate);
		if(DeezerPlus.localLastUpdate + 100 < (new Date().getTime())) {
			DeezerPlus.localLastUpdate = new Date().getTime();
			chrome.extension.sendRequest({name: "pushInfos", content: DeezerPlus.songInf}, function(response) { return true; });
		}
		
		return true;
	},		
	onDomUnload: function(e) {
		chrome.extension.sendRequest({name: "unload"}, function(response) { return true; });
	},
	onDomLoad: function(e) {
		
		if (DeezerPlus.loaded != true) {
			DeezerPlus.loaded = true;
			interfaceTweaks.init('page');
			if(document.getElementById('artName') != null) {
				if(document.getElementById('songTitle') != null) {
				
				 // Fonction injectée via un location.href chargée de mettre les infos dans deezerPlus.
				 location.href = "javascript:" +
					"function updateDeezerPlus() {" +
						//"if(((parseInt(document.getElementById('lastUpdate').getAttribute('updated') + 300)) < (new Date().getTime())) || document.getElementById('lastUpdate').innerHTML == '') {" +
							"document.getElementById('deezerPlus').setAttribute('playing',dzPlayer.isPlaying());" +
							"document.getElementById('deezerPlus').setAttribute('artist',dzPlayer.getArtistName());" +
							"document.getElementById('deezerPlus').setAttribute('position',dzPlayer.getPosition());" +
							"document.getElementById('deezerPlus').setAttribute('track',dzPlayer.getSongTitle());" +
							"document.getElementById('deezerPlus').setAttribute('duration',dzPlayer.getDuration());" +
							"document.getElementById('deezerPlus').setAttribute('songID',dzPlayer.getSongId());" +
							"document.getElementById('deezerPlus').setAttribute('album',dzPlayer.getAlbumTitle());" +
							"document.getElementById('deezerPlus').setAttribute('volume',dzPlayer.getVolume());" +
							"document.getElementById('deezerPlus').setAttribute('paused',dzPlayer.isPaused());" +
							"document.getElementById('lastUpdate').removeAttribute('updated');" +
							"document.getElementById('lastUpdate').setAttribute('updated',Math.floor(new Date().getTime()));" +
						//"};" +
					"};" +
					"document.getElementById('songPosition').addEventListener('DOMSubtreeModified', updateDeezerPlus , false);" +
					"document.getElementById('play').addEventListener('DOMSubtreeModified', updateDeezerPlus , false);" +
					"document.getElementById('pause').addEventListener('DOMSubtreeModified', updateDeezerPlus , false);";
					document.getElementById('lastUpdate').addEventListener('DOMSubtreeModified', DeezerPlus.getInformations , false);
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
           case "controlDeezer":
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
				}
		    break;
        }
     });

document.addEventListener('load', DeezerPlus.onDomLoad , true);
var timerDeezerPlus = setInterval("location.href='javascript:updateDeezerPlus();';",7500);

//var timerDeezerPlus = setInterval("location.href = \"javascript:document.getElementById('deezerPlus').setAttribute('album',dzPlayer.albumTitle);document.getElementById('deezerPlus').setAttribute('playing',dzPlayer.isPlaying());\";", 333);


