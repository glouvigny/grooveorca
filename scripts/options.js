var options = {
	switchView: function() {
		view = this.id.slice(0,-5);
		var views = document.getElementById("page").childNodes;
		for(var i = 0; i < views.length; i++ ) {
			if(views[i].nodeType == 1) {
				if(views[i].nodeName == "DIV" && views[i].id != view) {
					views[i].style.display = 'none';
				} else {
					views[i].style.display = 'block';
				}
			}
		}
		var views = document.getElementById("navigation").childNodes;
		for(var i = 0; i < views.length; i++ ) {
			if(views[i].nodeType == 1) {
				if(views[i].nodeName == "LI" && views[i].id != 'nav-' + view) {
					views[i].className = '';
				} else {
					views[i].className = 'selected';
				}
			}
		}
	},
	init: function(source) {
		lastfm.init('options');
		notifications.init('options');
		wikipedia.init('options');
		interfaceTweaks.init('options');
		nowplaying.init('options');
		mediakeys.init('options');
		
		document.getElementById('LastFmLogin').addEventListener('click',lastfm.getAuth,true);
		document.getElementById('LastFmVerifyLogin').addEventListener('click',lastfm.getSession,true);
		document.getElementById('LastFmLogout').addEventListener('click',lastfm.destroySession,true);
		document.getElementById('WikipediaLocale').addEventListener('input',wikipedia.changeLocale,true);
		document.getElementById('notificationsDuration').addEventListener('input',notifications.toggleStatus,true);
		
		document.getElementById('activateScrobbling').addEventListener('change',lastfm.toggleStatus,true);
		document.getElementById('activateNotifications').addEventListener('change',notifications.toggleStatus,true);
		document.getElementById('activateInterfacesBlockTopBar').addEventListener('change',interfaceTweaks.toggleStatus,true);
		document.getElementById('activateInterfacesBlockFooter').addEventListener('change',interfaceTweaks.toggleStatus,true);
		document.getElementById('activateInterfacesExpendPlayer').addEventListener('change',interfaceTweaks.toggleStatus,true);
		document.getElementById('activateInterfacesSinglePlayer').addEventListener('change',interfaceTweaks.toggleStatus,true);
		document.getElementById('activateNowPlaying').addEventListener('change',nowplaying.toggleStatus,true);
		document.getElementById('activateMediaKeys').addEventListener('change',mediakeys.toggleStatus,true);
		
		document.getElementById('lastfm-menu').addEventListener('click',options.switchView,true);
		document.getElementById('notifications-menu').addEventListener('click',options.switchView,true);
		document.getElementById('wikipedia-menu').addEventListener('click',options.switchView,true);
		document.getElementById('interface-menu').addEventListener('click',options.switchView,true);
		document.getElementById('mediakeys-menu').addEventListener('click',options.switchView,true);
		document.getElementById('wlm-menu').addEventListener('click',options.switchView,true);
		document.getElementById('donations-menu').addEventListener('click',options.switchView,true);
		document.getElementById('webstorelink').href = "http://chrome.google.com/webstore/detail/" + chrome.i18n.getMessage("@@extension_id");		
		
	}
}