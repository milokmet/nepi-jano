/**
 * Some utils
 */
var utils = {};

utils.whitelist = ['#text', 'A', 'ABBR', 'ADDRESS', 'AREA', 'ARTICLE', 'ASIDE', 'AUDIO', 'B', 'BDI', 'BDO', 'BLOCKQUOTE', 'BR', 'BUTTON', 'CAPTION', 'CITE', 'CODE', 'COL', 'COLGROUP', 'DATA', 'DATALIST', 'DD', 'DEL', 'DFN', 'DIV', 'DL', 'DT', 'EM', 'EMBED', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HR', 'I', 'IFRAME', 'IMG', 'INPUT', 'INS', 'KBD', 'KEYGEN', 'LABEL', 'LEGEND', 'LI', 'MAIN', 'MAP', 'MARK', 'METER', 'NAV', 'OBJECT', 'OL', 'OPTGROUP', 'OPTION', 'OUTPUT', 'P', 'PARAM', 'PRE', 'PROGRESS', 'Q', 'RB', 'RP', 'RT', 'RTC', 'RUBY', 'S', 'SAMP', 'SECTION', 'SELECT', 'SMALL', 'SOURCE', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TABLE', 'TBODY', 'TD', 'TEXTAREA', 'TFOOT', 'TH', 'THEAD', 'TIME', 'TR', 'TRACK', 'U', 'UL', 'VAR', 'VIDEO', 'WBR'];

/**
 * Remove elements from document using selector
 */
utils.removeSelector = function(doc, selector) {
	var elements = doc.querySelectorAll(selector);
	var i = elements.length;
	while (i--) {
		elements[i].parentNode.removeChild(elements[i]);
	}
	return doc;
};

/**
 * Get article ID from URL
 */
utils.articleId = function() {
	return document.location.pathname.split('/')[2];
};

/**
 * Detect Piano article
 */
utils.isPianoArticle = function() {
	return document.querySelector('.js-piano-teaser-standard');
};

/**
 * Copy only allowed HTML elements and their styles from the remote article
 */
utils.sanitizeContent = function(root, node) {
	for(var i = 0; i < node.childNodes.length; i++ ) {
		var child = node.childNodes[i];

		if (utils.whitelist.indexOf(child.nodeName) >= 0) {
			var element;

			if (child.nodeName == '#text') {
				element = document.createTextNode(child.textContent);
			}
			else {
				element = document.createElement(child.nodeName);
				if (child.className.length > 0) {
					element.className = child.className;
				}

				if (child.nodeName == 'A') {
					var match = child.href.match(/^https:\/\/artemis\.sme\.sk\/api\/v2\/article-header\/(\d+).*/);
					element.href = (match !== null && match.length >= 2) ? 'https://sme.sk/c/' + match[1] + '/' : child.href;
				}
				else if (child.nodeName == 'IFRAME') {
					element.src = child.src.replace(/^\/\//, 'http://');
				}
				else if (child.nodeName == 'IMG') {
					element.src = child.src.replace(/^http:/, 'https:');
					element.alt = child.alt;
				}

				if (child.childNodes.length > 0) {
					utils.sanitizeContent(element, child);
				}
			}

			root.appendChild(element);
		}
	}
}

/**
 * Replace the actual static image block with the real video
 */
utils.getArticleVideo = function(iosVideo, url) {
	var request = new XMLHttpRequest();
	request.iosVideo = iosVideo;
	request.open('GET', url, true);
	request.onload = function() {
		if (request.status == 200) {
			var image    = request.responseText.match(/<image>(http.*)<\/image>/)[1];
			var location = request.responseText.match(/<location>(http.*)<\/location>/)[1];

			var source = document.createElement('source');
			source.setAttribute('src', location);

			var video = document.createElement('video');
			video.setAttribute('controls', 'controls');
			video.setAttribute('width', 640);
			video.setAttribute('height', 360);
			video.setAttribute('poster', image);
			video.appendChild(source);

			// replace the static image block
			request.iosVideo.innerHTML = '';
			request.iosVideo.appendChild(video);
		}
	};
	request.send();
};

/**
 * Replace static images with real videos
 */
utils.getArticleVideos = function(html) {
	var iosVideos = html.querySelectorAll('div.iosvideo');
	var i = iosVideos.length;
	while (i--) {
		var iosVideoId = iosVideos[i].querySelector('a').href.match(/^https:\/\/artemis\.sme\.sk\/api\/ma\/v\/(\d+)/)[1];
		utils.getArticleVideo(iosVideos[i], 'https://www.sme.sk/storm/mmdata_get.asp?id=' + iosVideoId);
	}
};

/**
 * Get mobile version of the article
 */
utils.getArticle = function(url) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.onload = function() {
		if (request.status == 200) {
			var doc = (new DOMParser()).parseFromString(request.responseText, 'text/html');
			doc = utils.removeSelector(doc, 'article > br:first-of-type');
			doc = utils.removeSelector(doc, '.artemis-ad-position');
			doc = utils.removeSelector(doc, '.premium-banner');
			doc = utils.removeSelector(doc, '.button-bar');
			var node = doc.getElementsByClassName('is-hidden')[0];
			if (node) {
				node.replaceWith(...node.childNodes);
			}
			if (document.querySelector('.perex')) {
				doc = utils.removeSelector(doc, '.perex');
			}

			/* articles */
			var html;
			if (html = document.getElementsByTagName('article')[0]) {
				html.innerHTML = '';
				if (doc.querySelector('.articlewrap')) {
					utils.sanitizeContent(html, doc.querySelector('.articlewrap'));
				}
				else {
					utils.sanitizeContent(html, doc.getElementsByTagName('article')[0]);
				}
			}

			/* article videos */
			utils.getArticleVideos(html);
		}
	};
	request.send();
};

if (/\.sme\.sk\/c\/\d+\/.*/.test(document.location) && utils.isPianoArticle()) {
	utils.getArticle('https://artemis.sme.sk/api/v2/article/' + utils.articleId() + '?mid=10&fa=1&noAdverts=0&nightmode=0');
}