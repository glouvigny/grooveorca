var mediakeys = {
	status: false,
	init: function(source) {
		if(typeof settings.lite != "undefined" && settings.lite == true) {
			mediakeys.status = false;
			return false;
		}
		if(source == "page") {
			document.addEventListener("keydown", function (e) {
				if(e.keyCode > 175 && e.keyCode < 180) {
					switch(e.keyCode) {
						case 176: //next
							chrome.extension.sendRequest({name: "control", action: "next", source: "mediakey"});
						break;
						case 177: //prev
							chrome.extension.sendRequest({name: "control", action: "prev", source: "mediakey"});
						break;
						case 178: //stop
							chrome.extension.sendRequest({name: "control", action: "stop", source: "mediakey"});
						break;
						case 179: //play/pause
							chrome.extension.sendRequest({name: "control", action: "play", source: "mediakey"});
						break;
					}
				}
			});
		} else {
			if(localStorage.getItem('activateMediaKeys') == 'false')
				mediakeys.status = false;
			else 
				mediakeys.status = true;
				
			if(source == 'options')
				document.getElementById("activateMediaKeys").checked = mediakeys.status;
		}
	},
	toggleStatus: function() {
		localStorage.setItem("activateMediaKeys", document.getElementById("activateMediaKeys").checked);
	},
	pushInformations: function() {

	},
	unload: function() {
		
	}
}

if(location.href != chrome.extension.getURL("options.html")) {
	mediakeys.init("page");
}
