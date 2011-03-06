/***

"Patch"
	-- Un homme qui a honte.

***/

var deezerControl = function(action) {
	chrome.windows.getAll({populate : true},function(windows) {
		for(var i = 0; i < windows.length; i++) {
			var j = 0;
			for(var dumb in windows[i].tabs) {
				chrome.tabs.sendRequest(windows[i].tabs[j].id, {name: "controlDeezer", action: action}, function(response) { closeNotif(); return true; });
				j++;
			}
		}
	});	
}


var songData = {
	songInf: {
		paused: null,
		currentSong: null,
		currentArtist: null,
		currentAlbum: null,
		currentSongId: null,
		currentDuration: null,
		currentPosition: null,
		lastUpdate:null,
		firstSeen:null,
		firstSeenPlaying:null,
		coverURL:"",
		currentVolume:null
	}
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse)
     {
        switch (request.name) {
           case "pushInfos":
			  songData.songInf = request.content;
			  if(songData.songInf.paused != true) {
				  // request from the content script to get the preferences.
				  lastfm.init('dispatch');
				  notifications.init('dispatch');
				  wikipedia.init('dispatch');
				  nowplaying.init('dispatch');
				  //omnibox.init('dispatch');
				  //lyrics.init('dispatch');
				  //deezerAPI.init('dispatch');
				  
				  
				  if(lastfm.status == true &&
					((lastfm.lastNotification != songData.songInf.firstSeen) ||
						(lastfm.lastScrobble != songData.songInf.firstSeen
							&& (songData.songInf.currentPosition > (songData.songInf.currentDuration/2)
								|| songData.songInf.currentPosition > 240)
							&& songData.songInf.currentDuration >= 30))) {
					lastfm.pushInformations();
				  }
				  
				  if(notifications.status == true) {
					notifications.pushInformations();
				  }
				  
				  //store.pushInformations();
				  if(wikipedia.lastArtist != songData.songInf.currentArtist)
					wikipedia.pushInformations();
					
				  if(lyrics.lastArtist != songData.songInf.currentArtist
					|| lyrics.lastSong != songData.songInf.currentSong)
				  lyrics.pushInformations();
				  
				  deezerAPI.pushInformations();
				  
			  }
			  if(nowplaying.status == true) {
					nowplaying.pushInformations();
			  }
			  chrome.extension.sendRequest({name: "updatePopup", content: false}, function(response) { return true; });
			  sendResponse(true);
              break;
		   case "pushTime":
		      songData.songInf.currentPosition = request.currentPosition;
		      songData.songInf.currentDuration = request.currentDuration;
			  
			  break;
           case "unload":
				  lastfm.unload();
				  notifications.unload();
				  wikipedia.unload();
				  nowplaying.unload();
				  lyrics.unload();
				  songData.songInf = {
					paused: null,
					currentSong: null,
					currentArtist: null,
					currentAlbum: null,
					currentDuration: null,
					currentSongId: null,
					currentPosition: null,
					lastUpdate:null,
					firstSeen:null,
					firstSeenPlaying:null,
					coverURL:"",
					currentVolume:null
				}
			  break;
		   
           case "getInfos":
              // request from the content script to get the preferences.
			  switch(request.resource) {
				case "wikipedia":
					sendResponse(
					   {content: wikipedia.wikiArticle, 
						currentArtist: songData.songInf.currentArtist});
					break;
				case "popup":
					sendResponse(
					   {currentArtist: songData.songInf.currentArtist, 
						currentSong: songData.songInf.currentSong,
						currentSongId: songData.songInf.currentSongId,
						paused: songData.songInf.paused});
					break;
				case "lyrics":
					sendResponse(
					   {content: lyrics.contents, 
					    currentArtist: songData.songInf.currentArtist, 
						currentSong: songData.songInf.currentSong});
					break;
				
				case "deezerapi-plus":
					switch(request.details.method) {
						case "album":
							deezerAPI.getArtistDetails(request.details.artistid, false);
							deezerAPI.getAlbumDetails(request.details.albumid, false);
							sendResponse(deezerAPI.artists[request.details.artistid].albums[request.details.albumid]);
						break;
						case "artist":
							deezerAPI.getArtistDetails(request.details.artistid, false);
							sendResponse(deezerAPI.artists[request.details.artistid]);
						break;
					}
					break;
				case "deezerapi":
					var deezerArtistId = deezerAPI.tracks[songData.songInf.currentSongId].artist;
					var deezerAlbumId = deezerAPI.tracks[songData.songInf.currentSongId].album;
					var i = deezerAPI.artists[deezerArtistId].related.length;
					var related = {};
					while(i) {
						i--;
						related[i] = deezerAPI.artists[deezerAPI.artists[deezerArtistId].related[i]];
					}
					
					sendResponse(
					   {related: related, 
					    artist: deezerAPI.artists[deezerArtistId], 
						currentSongId: songData.songInf.currentSongId,
						currentAlbumId: deezerAlbumId,
						currentArtistId: deezerArtistId});
					break;

				case "interfaceTweaks":
					interfaceTweaks.init('dispatch');
					if(interfaceTweaks.singlePlayer)
						interfaceTweaks.killDeezer();
					sendResponse(
					   {blockTopBar: interfaceTweaks.blockTopBar, 
						blockFooter: interfaceTweaks.blockFooter,
						expandPlayer: interfaceTweaks.expandPlayer});
					break;
			  }
              break;
			  case "control":
				deezerControl(request.action);
			  break;
        }
     });
	 
	 

