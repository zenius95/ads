chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        for (var i = 0; i < details.requestHeaders.length; ++i) {

            if (details.requestHeaders[i].name === 'Origin') {
                details.requestHeaders[i].value = 'https://www.facebook.com'
                break
            }
        }
        return { requestHeaders: details.requestHeaders }
    },
    {urls: ['https://*.facebook.com/*']},
    ['blocking', 'requestHeaders', 'extraHeaders']
)