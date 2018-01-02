/**
 * For each request to sme.sk remove UA string
 */
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
	for (var i = 0; i < details.requestHeaders.length; ++i) {
		if (details.requestHeaders[i].name.toLowerCase() == 'user-agent') {
			details.requestHeaders.splice(i, 1);
			break;
		}
	}
	return {
		requestHeaders : details.requestHeaders
	};
}, {
	urls : ["https://artemis.sme.sk/api/v2/article/*"]
}, ["blocking", "requestHeaders"]);