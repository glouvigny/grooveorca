var songData = {
	songInf: {
		paused: null,
		currentSong: null,
		currentArtist: null,
		currentAlbum: null,
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
				  lyrics.init('dispatch');
				  
				  
				  if(lastfm.status == true) {
					lastfm.pushInformations();
				  }
				  if(notifications.status == true) {
					notifications.pushInformations();
				  }
				  
				  store.pushInformations();
				  wikipedia.pushInformations();
				  lyrics.pushInformations();
				  
			  }
			  if(nowplaying.status == true) {
					nowplaying.pushInformations();
			  }
			  sendResponse(true);
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
					   {content: wikipedia.wikiArticle.innerHTML, 
						currentArtist: songData.songInf.currentArtist});
					break;
				case "popup":
					sendResponse(
					   {currentArtist: songData.songInf.currentArtist, 
						currentSong: songData.songInf.currentSong,
						paused: songData.songInf.paused});
					break;
				case "lyrics":
					sendResponse(
					   {content: lyrics.contents, 
					    currentArtist: songData.songInf.currentArtist, 
						currentSong: songData.songInf.currentSong});
					break;
				case "store":
					sendResponse(
					   {content: store.contents, 
					    currentArtist: songData.songInf.currentArtist, 
						currentSong: songData.songInf.currentSong});
					break;
				case "interfaceTweaks":
					interfaceTweaks.init('dispatch');
					sendResponse(
					   {blockTopBar: interfaceTweaks.blockTopBar, 
						blockFooter: interfaceTweaks.blockFooter});
					break;
			  }
              break;
        }
     });
	 
	 

