const closeButtonClassName = "ftJPW";
window.addEventListener(
  "load",
  function () {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.checkActiveMeetCall) {
        let callCloseButtonCount = document.getElementsByClassName(closeButtonClassName).length;
        if (callCloseButtonCount < 1) {
          return true;
        } else {
          sendResponse({
            shouldSwitchToThisTab: true,
          });
        }
      }
      return true;
    });
  },
  false
);
