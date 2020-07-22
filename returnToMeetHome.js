window.addEventListener(
    "load",
    function () {
      chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if(request.returnHome){
            window.location.href = "https://meet.google.com";
        }
        return true;
      });
    },
    false
  );
  