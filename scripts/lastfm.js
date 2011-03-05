var lastfm = {
  /**
   * Errors code
   * TODO : Use it more.
   */
  err: {
	code0 : 'No error :D',
	code1 : 'Can\'t get a token, access denied',
	code2 : 'Can\'t get a token, HTTP error',
	code3 : 'Can\'t get a session, access denied',
	code4 : 'Can\'t get a session, HTTP error',
	code5 : 'Can\'t annonce track, access denied',
	code6 : 'Can\'t annonce track, HTTP error',
  },
  token: null, // Here goes the login token
  session: null, // Here goes the session id.
  user: null, // Username, only used on option page
  lastNotification: null, // Last notified track
  lastScrobble:null, // Last scrobbled track
  status: false, // Is last.fm scrobbling enabled
  api_key: "a0c592c65238b60549d2d9060c7b77ac", // My API Key
  api_sec: "3fad982f31d5fcff5fdcff2f4c7a3d26", // My API Secret
  /**
   * Submit a track to last.fm
   *	@param method either "track.updateNowPlaying" or "track.scrobble"
   */
  submit: function(method){
	var xhr = new XMLHttpRequest(); 
	  xhr.onreadystatechange = function() { 
		 if(xhr.readyState == 4) {
			if(xhr.status == 200) { 
				 var status = xhr.responseXML.getElementsByTagName('lfm');
				 status = status[0].getAttribute('status');
				 if(status == 'ok') {
				 }
			}
		}
	 }; 
	var args = {};
	if(method == "track.updateNowPlaying") {	
			args['method'] = method;
			args['artist'] = songData.songInf.currentArtist;
			args['album'] = songData.songInf.currentAlbum;
			args['track'] = songData.songInf.currentSong;
			args['api_key'] = lastfm.api_key;
			args['sk'] = lastfm.session;
	}
	else if(method == "track.scrobble") {
		args['method'] = method;
		args['artist[0]'] = songData.songInf.currentArtist;
		args['album[0]'] = songData.songInf.currentAlbum;
		args['track[0]'] = songData.songInf.currentSong;
		args['duration[0]'] = songData.songInf.currentDuration;
		args['timestamp[0]'] = songData.songInf.firstSeenPlaying;
		args['api_key'] = lastfm.api_key;
		args['sk'] = lastfm.session;
	}
	xhr.open("POST", "http://ws.audioscrobbler.com/2.0/?" + lastfm.serializeArgs(args), true);
	xhr.send(lastfm.serializeArgs(args)); 
  },
  /**
   * Log the user out (delete session identifiant)
   */
  destroySession: function() {
	delete localStorage['lastFmSession'];
	delete localStorage['lastFmUser'];
	lastfm.init('options');
  },
  /**
   * Serialize arguments for passing it to the API
   * Argument must be alphabetically ordered and 
   * a MD5 hash must be passed to the API
   * 	@param args associative array containing arguments passed to lastfm api
   *	@param returnsig append sig to result
   * 	@result ordered arguments in an URL friendly format
   */
  serializeArgs: function(args,returnsig) {
	if(isNaN(returnsig))
		returnsig = 0;
    args = ksort(args);
	var argsString = "";
	var sigString = "";
	for (key in args) {
		argsString += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(args[key]);
		sigString += key + args[key];
	}
	if(returnsig)
		return md5(sigString + lastfm.api_sec);
	argsString = argsString.substr(1) + '&api_sig=' + md5(sigString + lastfm.api_sec);
	return argsString;
  },
  /**
   * Start the Authentification process
   * Retrieves a token and open the login page
   */
  getAuth: function() {
	var xhr = new XMLHttpRequest(); 

	  xhr.onreadystatechange = function() { 
		 if(xhr.readyState == 4) {
			if(xhr.status == 200) { 
				 var status = xhr.responseXML.getElementsByTagName('lfm');
				 status = status[0].getAttribute('status');
				 if(status == 'ok') {
					 lastfm.token = xhr.responseXML.getElementsByTagName('token');
					 lastfm.token = lastfm.token[0].textContent;
					 window.open('http://www.last.fm/api/auth/?api_key=' + lastfm.api_key + '&token=' + lastfm.token,'lfm_login','location=yes,menubar=no,status=no,toolbar=no,resizable=yes,height=500,width=1000');
					 document.getElementById('LastFmVerifyLogin').removeAttribute('disabled');
				 }
				 else
					alert('ERR 001 : ' + this.err.code1);
			}
			else
				alert('ERR 002 : ' + this.err.code2);
		}
	 }; 

	 xhr.open("GET", "http://ws.audioscrobbler.com/2.0/?method=auth.gettoken&api_key=" + lastfm.api_key, true);                
	 xhr.send(null); 
  },
  /**
   * Finishes the login process
   * Saves the last.fm user and the session id to the localStorage
   */
  getSession: function() {
	var xhr = new XMLHttpRequest(); 
	  xhr.onreadystatechange = function() { 
		 if(xhr.readyState == 4) {
			if(xhr.status == 200) { 
				 var status = xhr.responseXML.getElementsByTagName('lfm');
				 status = status[0].getAttribute('status');
				 if(status == 'ok') {
					 lastfm.session = xhr.responseXML.getElementsByTagName('key');
					 lastfm.session = lastfm.session[0].textContent;
					 lastfm.user = xhr.responseXML.getElementsByTagName('name');
					 lastfm.user = lastfm.user[0].textContent;
					 localStorage.setItem("lastFmUser", lastfm.user);
					 localStorage.setItem("lastFmSession", lastfm.session);
					 lastfm.init('options');
				 }
				 else
					alert('ERR 003 : ' + lastfm.err.code3);
			}
			else
				alert('ERR 004 : ' + lastfm.err.code4);
		}
	 }; 
	var args = {};
	args['method'] = 'auth.getSession';
	args['api_key'] = lastfm.api_key;
	args['token'] = lastfm.token;

	xhr.open("GET", "http://ws.audioscrobbler.com/2.0/?" + lastfm.serializeArgs(args), true);                
	xhr.send(null); 
  },
  /**
   * Initalize the last.fm module
   * @param source : either "option" page or "dispatch"
   */
  init: function(source) {
	this.session = localStorage.getItem('lastFmSession');
	this.user = localStorage.getItem('lastFmUser');
	
	if(localStorage.getItem('lastFmStatus') == 'true')
		lastfm.status = true;
	else 
		lastfm.status = false;
	
	if(source == 'options') {	
		document.getElementById("activateScrobbling").checked = lastfm.status;
		
		if(this.isLogged()) {
			document.getElementById('LastFmLogin').setAttribute('disabled',true);
			document.getElementById('LastFmVerifyLogin').setAttribute('disabled',true);
			document.getElementById('LastFmLogout').removeAttribute('disabled');
			document.getElementById('lastffusername').textContent = this.user;
		}
		else {
			document.getElementById('LastFmLogin').removeAttribute('disabled');
			document.getElementById('LastFmVerifyLogin').setAttribute('disabled',true);
			document.getElementById('LastFmLogout').setAttribute('disabled',true);
			document.getElementById('lastffusername').textContent = '';
		}
	}
	else if(source == 'dispatch') {
		if(!this.isLogged()) {
			lastfm.status = false;
		}
	}
  },
  /**
   * Returns if the user is logged or not
   * @return boolean true if logged, false if not
   */
  isLogged: function() {
	if(this.session != null)
		return true;
	return false;
  },
  /**
   * When an option is changed this method is fired
   * Saves settings
   */
  toggleStatus: function() {
	localStorage.setItem("lastFmStatus", document.getElementById("activateScrobbling").checked);
  },
  /**
   * Fired each time the counter is updated
   * (in fact it's not, a check is done on the dispatcher)
   * Fires lastfm.submit() if necessary
   */
  pushInformations: function() {
	if(lastfm.lastNotification != songData.songInf.firstSeen) {
		lastfm.lastNotification = songData.songInf.firstSeen;
		lastfm.submit('track.updateNowPlaying');
	}
	else if (lastfm.lastScrobble != songData.songInf.firstSeen
	&& (songData.songInf.currentPosition > (songData.songInf.currentDuration/2)
		|| songData.songInf.currentPosition > 240)
	&& songData.songInf.currentDuration >= 30) {
		lastfm.lastScrobble = songData.songInf.firstSeen;
		lastfm.submit('track.scrobble');
	}
  },
  /**
   * Unloads vars from memory (maybe useless)
   */
  unload: function() {
	lastNotification = null;
	lastScrobble = null;
	status = false;
  }
}