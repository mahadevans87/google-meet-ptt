let micButton;

function handleMicClick(event) {
  setTimeout(function () {
    micMuted = document.querySelector(".VfPpkd-Bz112c-LgbsSe").getAttribute("data-is-muted");
    // console.log("Mic-muted: ", micMuted);
    chrome.runtime.sendMessage({ micMuted: micMuted === "true" ? "OFF" : "ON" });
  }, 0);
}

window.addEventListener(
  "load",
  function () {
    // console.log("window load called");
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      // console.log("Message", sender.tab ? "from a content script:" + sender.tab.url : "from the extension", request);
      if (request.toggleMic) {
        micButton = document.querySelector(".VfPpkd-Bz112c-LgbsSe");
        micButton.click();
        return true;
      } else if (request.listenToMicClick) {
        // if(micButton != null){
        //   micButton.removeEventListener('click',handleMicClick);
        // }
        micButton = document.querySelector(".VfPpkd-Bz112c-LgbsSe");
        let micMuted = micButton.getAttribute("data-is-muted");
        micButton.addEventListener("click", handleMicClick);
        // Send response back to the extension so that
        // the extension can update the icon in chrome toolbar
        sendResponse({
          currentMicStatus: micMuted === "true" ? "OFF" : "ON",
        });
      }
      return true;
    });
  },
  false
);
