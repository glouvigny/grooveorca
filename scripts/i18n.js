var i18n = {
	init: function(source) {
		var domi18n = document.getElementsByClassName("i18n");
		
		for(var i = domi18n.length-1;i>=0;i--) {
			var elements = explode(' ',domi18n[i].innerHTML);
			var j = elements.length-1;
			if(j > 0) {
				for(; j>0; j--) {
					if(elements[j][0] == '+') {
						elements[j] = elements[i].substring(1);;
					} else {
						elements[j] = chrome.i18n.getMessage(elements[j]);
					}
				}
				switch(elements.length) {
					case 1:
						domi18n[i].innerHTML = chrome.i18n.getMessage(elements[0],elements[1]);
					break;
					case 2:
						domi18n[i].innerHTML = chrome.i18n.getMessage(elements[0],elements[1],elements[2]);
					break;
				}
			} else {
				domi18n[i].innerHTML = chrome.i18n.getMessage(elements[0]);
			}
		}
	}
}