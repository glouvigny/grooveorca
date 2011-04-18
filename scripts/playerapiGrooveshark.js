var playerAPI = {
	artists: {},
	tracks: {},
	currentTrack: 0,
	currentArtist: 0,
	currentAlbum: 0,
	
	init: function(source) {
		
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
			xhr.open('post','http://api.grooveshark.com/ws/2.0/', async);
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
		xhr.open('post','http://api.grooveshark.com/ws/2.0/', async);
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
		xhr.open('post','http://api.grooveshark.com/ws/2.0/', async);
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