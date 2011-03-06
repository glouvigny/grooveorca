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

chrome.omnibox.onInputChanged.addListener(
    function (text, suggest) {
        var suggestions = [{ content: "p", description: "play : Commencer la lecture (alternatives : p, lecture)" },
                            { content: "s", description: "stop : Stopper la lecture (alternatives : s, pause)" },
                            { content: "n", description: "suiv : Jouer la chanson suivante (alternatives : n, next, suite)" },
                            { content: "pp", description: "prec : Jouer la chanson précédente (alternatives : pp, prev, precedente)" }];
        suggest(suggestions);
    }
);

chrome.omnibox.onInputEntered.addListener(
    function (text) {
        switch(text.toLowerCase()) {
			case "play":
			case "lecture":
			case "p":
				deezerControl("play");
			break;
			case "pause":
			case "stop":
			case "s":
				deezerControl("pause");
			break;
			case "next":
			case "suite":
			case "suiv":
			case "n":
				deezerControl("next");
			break;
			case "prev":
			case "prec":
			case "precedente":
			case "pp":
				deezerControl("prev");
			break;
		}
    }
);
