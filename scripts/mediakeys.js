document.addEventListener("keydown", function (e) {
	if(e.keyCode > 175 && e.keyCode < 180) {
		switch(e.keyCode) {
			case 176: //next
				chrome.extension.sendRequest({name: "control", action: "next"});
			break;
			case 177: //prev
				chrome.extension.sendRequest({name: "control", action: "prev"});
			break;
			case 178: //stop
				chrome.extension.sendRequest({name: "control", action: "stop"});
			break;
			case 179: //play/pause
				chrome.extension.sendRequest({name: "control", action: "play"});
			break;
		}
	}
});
