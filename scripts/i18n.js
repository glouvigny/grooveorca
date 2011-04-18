var i18n = {
	init: function(source) {
		var domi18n = document.getElementsByClassName("i18n");
		
		for(var i = domi18n.length-1;i>=0;i--) {
			var elements = explode(' ',domi18n[i].innerHTML);
			var params = [];
			
			var j = elements.length-1;
			if(j > 0) {
				for(; j>0; j--) {
					if(elements[j][0] == '+') {
						params[j-1] = elements[i].substring(1);
					} else if(elements[j][0] == '?') {
						params[j-1] = window[elements[j].substring(1)];
					} else {
						params[j-1] = chrome.i18n.getMessage(elements[j]);
					}
				}
				domi18n[i].innerHTML = chrome.i18n.getMessage(elements[0],params);
			} else {
				domi18n[i].innerHTML = chrome.i18n.getMessage(elements[0]);
			}
		}
	}
}