var deezerAPI = {
	artists: {},
	tracks: {},
	currentTrack: 0,
	currentArtist: 0,
	currentAlbum: 0,
	
	init: function(source) {
		
	},
	getTotalTracks: function(album) {
		var total = 0;
		for (var i in album.tracks) {
			total++;
		}
		return total;
	},
	getTotalLength: function(album) {
		var total = 0;
		for (var i in album.tracks) {
			total += parseInt(album.tracks[i].duration);
		}
		return total;
	},
	presentArtist: function(idArtist,source) {
		chrome.extension.sendRequest({name: "getInfos", resource:"deezerapi-plus", details: {method:"artist", artistid: idArtist}}, function(artist) {
			deezerAPI.renderArtistDiscography(artist,document.getElementById('disco-foreign'),source);
			
			document.getElementById('disco-focus').style.display = 'none';
			document.getElementById('disco-foreign').style.display = 'block';
			document.getElementById('disco').style.display = 'none';
			document.getElementById('related').style.display = 'none';
				
		});
	},
	presentAlbum: function(idArtist,idAlbum, source) {
		chrome.extension.sendRequest({name: "getInfos", resource:"deezerapi-plus", details: {method:"album", artistid: idArtist, albumid: idAlbum}}, function(album) {
			deezerAPI.renderAlbumListing(album,document.getElementById('disco-focus'),source,idArtist);
			
			document.getElementById('disco-focus').style.display = 'block';
			document.getElementById('disco-foreign').style.display = 'none';
			document.getElementById('disco').style.display = 'none';
			document.getElementById('related').style.display = 'none';
				
		});
	},
	renderAlbumListing: function(album, domElement, source, backToDisco) {
		var ctns = new String;
		ctns += "<img src='" + album.img + "' alt='Pochette de " + album.name + "' class='albumCover'/><div class='albumMeta'>";
		
		
		if(typeof source != "undefined") {
			switch(source) {
				case "artist":
					ctns += "<div class='backbutton' onclick='deezerAPI.presentArtist(" + backToDisco + ")'>Retour</div>";
				break;
				case "artist-related":
					ctns += "<div class='backbutton' onclick='deezerAPI.presentArtist(" + backToDisco + ",\"related\")'>Retour</div>";
				break;
				case "artist-search":
					ctns += "<div class='backbutton' onclick='deezerAPI.presentArtist(" + backToDisco + ",\"search\")'>Retour</div>";
				break;
				case "search":
					ctns += "<div class='backbutton' onclick='popup.switchSecondView(\"site\",\"search\")'>Retour</div>";
				break;
			}
		}
		
		ctns += "<div class='artist'>" + album.artistName + "</div><div class='album'>" + album.name + "</div></div><ol>";
		
		var j = 0;
		for (var i in album.tracks) {
			ctns += "<li " + ((i == deezerAPI.currentTrack)?"class='currentTrack'":"") + " onclick='popup.deezerControl(\"playAlbum\",{album: " + album.id + ", index: " + j +  "})'>" + album.tracks[i].name + " <span class='duration'>" + displayLength(album.tracks[i].duration) + "</span></li>";
			j++;
		}

		ctns += "</div></ol>";
		
		domElement.innerHTML = ctns;
	},
	renderArtistDiscography: function(artist, domElement, backToArtist) {
		var ctns = new String;
		var returnto = undefined;
		if(typeof backToArtist != "undefined")
			switch(backToArtist) {
				case "related":
					ctns += "<div class='backcont'><div class='backbutton' onClick=\"popup.switchSecondView('artist_infos','related')\">Retour</div></div>";
					returnto = "artist-related";
				break;
				case "search":
					ctns += "<div class='backcont'><div class='backbutton' onClick=\"popup.switchSecondView('site','search')\">Retour</div></div>";
					returnto = "artist-search";
				break;
			}
		else
			returnto = "artist";
		ctns += "<ul>";
		
		for (var i in artist.albums) {
			ctns += "<li onclick='deezerAPI.presentAlbum("+artist.id+","+ i +",\""+returnto+"\");'>";
				ctns += "<img src='" + artist.albums[i].img + "' alt='Pochette de " + artist.albums[i].name + "' >";
				ctns += "<div>" + artist.albums[i].name + "</div>";
				ctns += "<div><b>" + deezerAPI.getTotalTracks(artist.albums[i]) + "</b> pistes </div>";
				ctns += "<div> Durée : <b>" + displayLength(deezerAPI.getTotalLength(artist.albums[i])) + "</b> </div>";
			ctns += "</li>";
		}
		
		ctns += "</ul>";
		
		domElement.innerHTML = ctns;
	},
	renderRelatedArtists: function(artists,domElement) {
		var ctns = "<ul>";
		
		for (var i in artists) {
			ctns += "<li onclick='deezerAPI.presentArtist(" + artists[i].id + ",\"related\");'>";
				ctns += "<img src='" + artists[i].img + "' alt='Image de " + artists[i].name + "' >";
				ctns += "<span>"+ artists[i].name + "</span>";
			ctns += "</li>";
		}
		
		ctns += "</ul>";
		domElement.innerHTML = ctns;
		
	},
	pushInformations: function() {
		if(deezerAPI.currentTrack != songData.songInf.currentSongId
		&& songData.songInf.currentSongId != 0) {
			deezerAPI.currentTrack = songData.songInf.currentSongId;
			deezerAPI.getTrackDetails(songData.songInf.currentSongId);
		} else if(songData.songInf.currentSongId == 0){
			deezerAPI.currentTrack = 0;
		}
	},
	refreshPopUp: function() {
		chrome.extension.sendRequest({name: "getInfos", resource:"deezerapi"}, function(response) {
			if(deezerAPI.currentTrack != response.currentSongId) {
				deezerAPI.currentTrack = response.currentSongId;
				deezerAPI.currentArtist = response.currentArtistId;
				deezerAPI.currentAlbum = response.currentAlbumId;
				
				deezerAPI.renderAlbumListing(response.artist.albums[response.currentAlbumId],document.getElementById('albumcontents'));
				deezerAPI.renderArtistDiscography(response.artist,document.getElementById('disco'));
				deezerAPI.renderRelatedArtists(response.related,document.getElementById('related'));
				
			}
		});
	},
	unload: function() {
		deezerAPI.artists = {};
		deezerAPI.tracks = {};
		deezerAPI.currentTrack = 0;
	},
	getTrackDetails: function(trackId, async) {			
		if(deezerAPI.tracks.length < trackId
		  || typeof deezerAPI.tracks[trackId] === "undefined") {
			if(typeof async == "undefined")
				async = true;
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() { 
				if(xhr.readyState == 4) {
					if(xhr.status == 200) { 
						var infos = JSON.parse(xhr.responseText);
						
						deezerAPI.pushArtist(infos.track.artist);
						deezerAPI.pushAlbum(infos.track.album,infos.track.artist.id);
						deezerAPI.pushTrack(infos.track,infos.track.artist.id,infos.track.album.id);
						deezerAPI.getArtistDetails(infos.track.artist.id);
						deezerAPI.getAlbumDetails(infos.track.album.id);
					}
				}
			}
			xhr.open('get','http://api-v3.deezer.com/1.0/lookup/track/?id=' + trackId + '&output=json', async);
			xhr.send(null);
		}
	},
	getArtistDetails: function(artistId, async) {
		if(typeof async == "undefined")
			async = true;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() { 
			if(xhr.readyState == 4) {
				if(xhr.status == 200) { 
					var infos = JSON.parse(xhr.responseText);
					
					deezerAPI.pushArtist(infos.artist);
					var i = infos.artist.similar_artists.artist.length;
					
					while(i) {
						i--;
						deezerAPI.pushArtist(infos.artist.similar_artists.artist[i]);
						deezerAPI.pushSimilar(artistId, infos.artist.similar_artists.artist[i].id);
					}
					
					i = infos.artist.discography.album.length;
					
					while(i) {
						i--;
						deezerAPI.pushAlbum(infos.artist.discography.album[i],artistId);
						var j = infos.artist.discography.album[i].tracks.track.length;
						while(j) {
							j--;
							deezerAPI.pushTrack(infos.artist.discography.album[i].tracks.track[j],artistId,infos.artist.discography.album[i].id);
						}
					}					
				}
			}
		}
		xhr.open('get','http://api-v3.deezer.com/1.0/lookup/artist/?id=' + artistId + '&output=json&options=similar_artists,discography,discography_details', async);
		xhr.send(null);	
	},
	getAlbumDetails: function(albumId, async) {
		if(typeof async == "undefined")
			async = true;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() { 
			if(xhr.readyState == 4) {
				if(xhr.status == 200) { 
					var infos = JSON.parse(xhr.responseText);
					// useless > delete deezerAPI.artists[infos.album.artist.id].albums[albumId].tracks[deezerAPI.currentTrack];
					var i = infos.album.tracks.track.length;
					while(i) {
						i--;
						deezerAPI.pushTrack(infos.album.tracks.track[i],infos.album.artist.id,albumId);
					}
				}
			}
		}
		xhr.open('get','http://api-v3.deezer.com/1.0/lookup/album/?id=' + albumId + '&output=json&options=tracks', async);
		xhr.send(null);	
	},
	pushArtist: function(artist_array) {
		if(typeof deezerAPI.artists[artist_array.id] === "undefined") {
			deezerAPI.artists[artist_array.id] = {
				id: artist_array.id,
				name: artist_array.name,
				img: artist_array.image,
				url: artist_array.url,
				albums: {},
				related: []
			}
			return true;
		}
		return false;
	},
	pushAlbum: function(album_array,artist_id) {
		if(typeof deezerAPI.artists[artist_id].albums[album_array.id] === "undefined") {
			deezerAPI.artists[artist_id].albums[album_array.id] = {
				id: album_array.id,
				name: album_array.name,
				artistName: deezerAPI.artists[artist_id].name,
				img: album_array.image,
				url: album_array.url,
				tracks: {}
			}
			return true;
		} else
			return false;
	},
	pushTrack: function(track_array,artist_id,album_id) {
		if(typeof deezerAPI.artists[artist_id].albums[album_id].tracks[track_array.id] === "undefined") {
			
			deezerAPI.artists[artist_id].albums[album_id].tracks[track_array.id] = {
				id:track_array.id,
				name:track_array.name,
				url:track_array.url,
				duration:track_array.duration,
				rank:track_array.rank
			}
			
			deezerAPI.tracks[track_array.id] = {
				artist: artist_id,
				album: album_id
			}
		}
	},
	pushSimilar: function(artist_a, artist_b) {
		if(typeof deezerAPI.artists[artist_a] !== "undefined"
		  && typeof deezerAPI.artists[artist_b] !== "undefined") {
			if(!inArray(deezerAPI.artists[artist_a].related,artist_b))
				deezerAPI.artists[artist_a].related.push(artist_b);
			if(!inArray(deezerAPI.artists[artist_b].related,artist_a))
				deezerAPI.artists[artist_b].related.push(artist_a);
			return true;
		  }
		  return false;
	}
}