var optionsSite = {
	init: function(source) {
		document.getElementById('siteLogo').src = "./res/options/groovesharkLogo.png";
		document.title = window.extName;
	
		style = document.createElement("style");
		style.innerHTML = 
			  "#nav-interface { display:none; }";
		document.getElementById('body').appendChild(style);
		
	}
}