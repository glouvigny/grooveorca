var playerAPI = {
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
		chrome.extension.sendRequest({name: "getInfos", resource:"playerapi-plus", details: {method:"artist", artistid: idArtist}}, function(artist) {
			playerAPI.renderArtistDiscography(artist,document.getElementById('disco-foreign'),source);
			
			document.getElementById('disco-focus').style.display = 'none';
			document.getElementById('disco-foreign').style.display = 'block';
			document.getElementById('disco').style.display = 'none';
			document.getElementById('related').style.display = 'none';
				
		});
	},
	presentAlbum: function(idArtist,idAlbum, source) {
		chrome.extension.sendRequest({name: "getInfos", resource:"playerapi-plus", details: {method:"album", artistid: idArtist, albumid: idAlbum}}, function(album) {
			playerAPI.renderAlbumListing(album,document.getElementById('disco-focus'),source,idArtist);
			
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
					ctns += "<div class='backbutton' onclick='playerAPI.presentArtist(" + backToDisco + ")'>Retour</div>";
				break;
				case "artist-related":
					ctns += "<div class='backbutton' onclick='playerAPI.presentArtist(" + backToDisco + ",\"related\")'>Retour</div>";
				break;
				case "artist-search":
					ctns += "<div class='backbutton' onclick='playerAPI.presentArtist(" + backToDisco + ",\"search\")'>Retour</div>";
				break;
				case "search":
					ctns += "<div class='backbutton' onclick='popup.switchSecondView(\"site\",\"search\")'>Retour</div>";
				break;
			}
		}
		
		ctns += "<div class='artist'>" + album.artistName + "</div><div class='album'>" + album.name + "</div></div><ol>";
		
		var j = 0;
		for (var i in album.tracks) {
			ctns += "<li " + ((i == playerAPI.currentTrack)?"class='currentTrack'":"") + " onclick='popup.playerControl(\"playAlbum\",{album: " + album.id + ", index: " + j +  "})'>" + album.tracks[i].name + " <span class='duration'>" + displayLength(album.tracks[i].duration) + "</span></li>";
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
			ctns += "<li onclick='playerAPI.presentAlbum("+artist.id+","+ i +",\""+returnto+"\");'>";
				ctns += "<img src='" + artist.albums[i].img + "' alt='Pochette de " + artist.albums[i].name + "' >";
				ctns += "<div>" + artist.albums[i].name + "</div>";
				ctns += "<div><b>" + playerAPI.getTotalTracks(artist.albums[i]) + "</b> pistes </div>";
				ctns += "<div> Durée : <b>" + displayLength(playerAPI.getTotalLength(artist.albums[i])) + "</b> </div>";
			ctns += "</li>";
		}
		
		ctns += "</ul>";
		
		domElement.innerHTML = ctns;
	},
	renderRelatedArtists: function(artists,domElement) {
		var ctns = "<ul>";
		
		for (var i in artists) {
			ctns += "<li onclick='playerAPI.presentArtist(" + artists[i].id + ",\"related\");'>";
				ctns += "<img src='" + artists[i].img + "' alt='Image de " + artists[i].name + "' >";
				ctns += "<span>"+ artists[i].name + "</span>";
			ctns += "</li>";
		}
		
		ctns += "</ul>";
		domElement.innerHTML = ctns;
		
	},
	pushInformations: function() {
		if(playerAPI.currentTrack != songData.songInf.currentSongId
		&& songData.songInf.currentSongId != 0) {
			playerAPI.currentTrack = songData.songInf.currentSongId;
			playerAPI.getTrackDetails(songData.songInf.currentSongId);
		} else if(songData.songInf.currentSongId == 0){
			playerAPI.currentTrack = 0;
		}
	},
	refreshPopUp: function() {
		chrome.extension.sendRequest({name: "getInfos", resource:"playerapi"}, function(response) {
			if(playerAPI.currentTrack != response.currentSongId) {
				playerAPI.currentTrack = response.currentSongId;
				playerAPI.currentArtist = response.currentArtistId;
				playerAPI.currentAlbum = response.currentAlbumId;
				
				playerAPI.renderAlbumListing(response.artist.albums[response.currentAlbumId],document.getElementById('albumcontents'));
				playerAPI.renderArtistDiscography(response.artist,document.getElementById('disco'));
				playerAPI.renderRelatedArtists(response.related,document.getElementById('related'));
				
			}
		});
	},
	unload: function() {
		playerAPI.artists = {};
		playerAPI.tracks = {};
		playerAPI.currentTrack = 0;
	},
	getTrackDetails: function(trackId, async) {			
		if(playerAPI.tracks.length < trackId
		  || typeof playerAPI.tracks[trackId] === "undefined") {
			if(typeof async == "undefined")
				async = true;
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() { 
				if(xhr.readyState == 4) {
					if(xhr.status == 200) { 
						var infos = JSON.parse(xhr.responseText);
						
						playerAPI.pushArtist(infos.track.artist);
						playerAPI.pushAlbum(infos.track.album,infos.track.artist.id);
						playerAPI.pushTrack(infos.track,infos.track.artist.id,infos.track.album.id);
						playerAPI.getArtistDetails(infos.track.artist.id);
						playerAPI.getAlbumDetails(infos.track.album.id);
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
					
					playerAPI.pushArtist(infos.artist);
					var i = infos.artist.similar_artists.artist.length;
					
					while(i) {
						i--;
						playerAPI.pushArtist(infos.artist.similar_artists.artist[i]);
						playerAPI.pushSimilar(artistId, infos.artist.similar_artists.artist[i].id);
					}
					
					i = infos.artist.discography.album.length;
					
					while(i) {
						i--;
						playerAPI.pushAlbum(infos.artist.discography.album[i],artistId);
						var j = infos.artist.discography.album[i].tracks.track.length;
						while(j) {
							j--;
							playerAPI.pushTrack(infos.artist.discography.album[i].tracks.track[j],artistId,infos.artist.discography.album[i].id);
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
					// useless > delete playerAPI.artists[infos.album.artist.id].albums[albumId].tracks[playerAPI.currentTrack];
					var i = infos.album.tracks.track.length;
					while(i) {
						i--;
						playerAPI.pushTrack(infos.album.tracks.track[i],infos.album.artist.id,albumId);
					}
				}
			}
		}
		xhr.open('get','http://api-v3.deezer.com/1.0/lookup/album/?id=' + albumId + '&output=json&options=tracks', async);
		xhr.send(null);	
	},
	pushArtist: function(artist_array) {
		if(typeof playerAPI.artists[artist_array.id] === "undefined") {
			playerAPI.artists[artist_array.id] = {
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
		if(typeof playerAPI.artists[artist_id].albums[album_array.id] === "undefined") {
			playerAPI.artists[artist_id].albums[album_array.id] = {
				id: album_array.id,
				name: album_array.name,
				artistName: playerAPI.artists[artist_id].name,
				img: album_array.image,
				url: album_array.url,
				tracks: {}
			}
			return true;
		} else
			return false;
	},
	pushTrack: function(track_array,artist_id,album_id) {
		if(typeof playerAPI.artists[artist_id].albums[album_id].tracks[track_array.id] === "undefined") {
			
			playerAPI.artists[artist_id].albums[album_id].tracks[track_array.id] = {
				id:track_array.id,
				name:track_array.name,
				url:track_array.url,
				duration:track_array.duration,
				rank:track_array.rank
			}
			
			playerAPI.tracks[track_array.id] = {
				artist: artist_id,
				album: album_id
			}
		}
	},
	pushSimilar: function(artist_a, artist_b) {
		if(typeof playerAPI.artists[artist_a] !== "undefined"
		  && typeof playerAPI.artists[artist_b] !== "undefined") {
			if(!inArray(playerAPI.artists[artist_a].related,artist_b))
				playerAPI.artists[artist_a].related.push(artist_b);
			if(!inArray(playerAPI.artists[artist_b].related,artist_a))
				playerAPI.artists[artist_b].related.push(artist_a);
			return true;
		  }
		  return false;
	}
}