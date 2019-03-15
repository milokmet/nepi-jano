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

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.query == "get") {
            console.log(request.url);
            var req = new XMLHttpRequest();
            req.open('GET', request.url, true);
            req.onload = function() {
                if (req.status == 200) {
                    sendResponse({"text": req.responseText});
                    return true;
                }
            };
            req.send();
            return true;
        }
    }
);