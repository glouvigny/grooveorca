// Element dom pour récupérer plus de données. 
var playerInfDom = document.createElement('div');
playerInfDom.id = "playerInfDom";
playerInfDom.style.display = 'none';
var lastUpdateDom = document.createElement('div');
lastUpdateDom.id = "lastUpdate"
playerInfDom.appendChild(lastUpdateDom);
document.getElementById('body').appendChild(playerInfDom);

var PlayerPlus = {
	playerPage: null,
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
		playerInfDom = document.getElementById('playerInfDom');
		// !Album, Artiste, Piste = nouvelle piste, on note la date de 1ère apparition
		if(PlayerPlus.songInf.currentArtist != playerInfDom.getAttribute('artist') ||
			PlayerPlus.songInf.currentAlbum != playerInfDom.getAttribute('album') || 
			PlayerPlus.songInf.currentSong != playerInfDom.getAttribute('track')) {
			
			PlayerPlus.songInf.currentArtist	= playerInfDom.getAttribute('artist');
			PlayerPlus.songInf.currentAlbum 	= playerInfDom.getAttribute('album');
			PlayerPlus.songInf.currentSong 		= playerInfDom.getAttribute('track');
			
			// Evite les scrobbles chiants.
			PlayerPlus.songInf.currentPosition 	= 0;
			
			PlayerPlus.songInf.firstSeen = Math.floor(new Date().getTime()/1000);
			PlayerPlus.songInf.firstSeenPlaying = null;
			
			// On push pas, certaines infos seront peut-être modifiées de nouveau
			return false;
		}		
		PlayerPlus.songInf.coverURL			= playerInfDom.getAttribute('coverurl');
		PlayerPlus.songInf.currentSongId	= parseInt(playerInfDom.getAttribute('songid'));
		PlayerPlus.songInf.currentDuration	= parseInt(playerInfDom.getAttribute('duration'));
		PlayerPlus.songInf.currentPosition	= parseInt(playerInfDom.getAttribute('position'));
		
		if(playerInfDom.getAttribute('playing') == 'false')
			PlayerPlus.songInf.paused = true;
		else
			PlayerPlus.songInf.paused = false;
		PlayerPlus.songInf.currentVolume	= parseInt(playerInfDom.getAttribute('volume'));
		PlayerPlus.songInf.lastUpdate 		= Math.floor(new Date().getTime()/1000);
		
		// Piste en lecture récup. de l'heure de début
		if((PlayerPlus.songInf.firstSeenPlaying == null && !isNaN(PlayerPlus.songInf.currentPosition) && PlayerPlus.songInf.currentPosition != 0))
			PlayerPlus.songInf.firstSeenPlaying = Math.floor(new Date().getTime()/1000);
		
		//console.log(PlayerPlus.localLastUpdate);
		if(PlayerPlus.localLastUpdate + 100 < (new Date().getTime())) {
			PlayerPlus.localLastUpdate = new Date().getTime();
			chrome.extension.sendRequest({name: "pushInfos", content: PlayerPlus.songInf}, function(response) { return true; });
		}
		
		return true;
	}
}
