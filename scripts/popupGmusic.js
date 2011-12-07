var popupSite  = {
	checkSong: function() {
		// Want to uncheck ?
		if(document.getElementById('checkbutton').className == 'uncheckbutton') {
			chrome.extension.getBackgroundPage().playerControl('uncheck');
			document.getElementById('checkbutton').className = '';
		} else {
			chrome.extension.getBackgroundPage().playerControl('check');
			document.getElementById('checkbutton').className = 'uncheckbutton';
		}
	},
	init: function(source) {
		style = document.createElement("style");
		style.innerHTML = 
			  ".popup_nav_second, #album_infosLink, #siteLink  { display: none; } " +
			  " #popup_nav li { width: 90px;}" +
			  " #popup_nav li.selected { background-color:#191919;}" +
			  " #lovebutton { display:inline !important; }";
		document.getElementById('body').appendChild(style);
	}
}