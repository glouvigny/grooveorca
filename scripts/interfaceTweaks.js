var interfaceTweaks = {	blockTopBar: false,	blockFooter: false,	init: function(source) {		if(source != 'page') {			interfaceTweaks.blockTopBar = (localStorage.getItem('interfacesBlockTopBar') == 'true')?true:false;			interfaceTweaks.blockFooter = (localStorage.getItem('interfacesBlockFooter') == 'true')?true:false;			if(source == 'options') {					document.getElementById("activateInterfacesBlockTopBar").checked = interfaceTweaks.blockTopBar;				document.getElementById("activateInterfacseBlockFooter").checked = interfaceTweaks.blockFooter;			}		}		else {			chrome.extension.sendRequest({name: "getInfos", resource:"interfaceTweaks"}, function(response) { 				interfaceTweaks.blockTopBar = response.blockTopBar;				interfaceTweaks.blockFooter = response.blockFooter;				interfaceTweaks.cleanInterface();			});		}	},	toggleStatus: function() {		localStorage.setItem("interfacesBlockTopBar", document.getElementById("activateInterfacesBlockTopBar").checked);		localStorage.setItem("interfacesBlockFooter", document.getElementById("activateInterfacseBlockFooter").checked);	},	cleanInterface: function() {		if(interfaceTweaks.blockTopBar) {			var nodes = document.getElementById('header').getElementsByTagName('div');			for(var i = 0; i < nodes.length ; i++) {				if(nodes[i].getAttribute('class') == "bgheader bgrepeat") {					nodes[i].style.display = 'none';				}			}			var linksHidden = document.createElement('div');			linksHidden.id = "linksHidden";			linksHidden.style.width = "100%";			linksHidden.style.textAlign = "right";			linksHidden.style.padding = 0;			linksHidden.style.margin = 0;			linksHidden.style.color = "white";			document.getElementById("div_home_search").style.marginBottom = "3px";			linksHidden.innerHTML = "<a href=\"#index.php\"><img src=\"" + chrome.extension.getURL('res/page/go-home.png') + "\" alt=\"Icône\"/></a> <a href=\"#music/home\"><img src=\"" + chrome.extension.getURL('res/page/audio-x-generic.png') + "\" alt=\"Icône\"/></a>";			//linksHidden.innerHTML = "<a href=\"#index.php\"><img src=\"http://dummyimage.com/16x16/fff/000\" alt=\"Icône\"/></a> <a href=\"#music/home\"><img src=\"http://dummyimage.com/16x16/fff/000\" alt=\"Icône\"/></a> <a href=\"#premium\"><img src=\"http://dummyimage.com/16x16/fff/000\" alt=\"Icône\"/></a> ";			document.getElementById('dzSearch').appendChild(linksHidden);		}		if(interfaceTweaks.blockFooter) {			document.getElementById('footer').style.display = 'none';		}	},	}