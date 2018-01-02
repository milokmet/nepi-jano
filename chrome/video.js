/**
 * Some utils
 */
var utils = {};

/**
 * Detect Piano video
 */
utils.isPianoVideo = function() {
	return document.querySelector('.tvpiano');
};

/**
 * Get article ID from URL
 */
utils.articleId = function() {
	return document.location.pathname.split('/')[2];
};

/**
 * Get video resolution from URL
 */
utils.isHD = function() {
	return (document.location.pathname.split('/')[1] == 'vhd') ? 1 : 0;
};

/**
 * Recreate unblocked version of Piano video
 */
utils.getVideo = function(url) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.onload = function() {
		if (request.status == 200) {
			var image    = request.responseText.match(/<image>(http.*)<\/image>/)[1];
			var location = request.responseText.match(/<location>(http.*)<\/location>/)[1];

			if (html = document.querySelector('div.video')) {
				var source = document.createElement('source');
				source.setAttribute('src', location);

				var video = document.createElement('video');
				video.setAttribute('controls', 'controls');
				video.setAttribute('poster', image);
				video.appendChild(source);

				// replace the old video
				while (html.firstChild) {
					html.removeChild(html.firstChild);
				}
				html.appendChild(video);

				// remove Piano add
				var promo = document.querySelector('div.sme_piano_art_promo');
				promo.parentNode.removeChild(promo);

				// workaround to prevent HD switch button overlaping the video
				document.querySelector('.v-podcast-box').style.marginTop = '25px';
			}
		}
	};
	request.send();
};

if (/tv\.sme\.sk\/v(hd)?\/\d+\/.*/.test(document.location) && utils.isPianoVideo()) {
	utils.getVideo('https://www.sme.sk/storm/mmdata_get.asp?id=' + utils.articleId() + '&hd1=' + utils.isHD());
}