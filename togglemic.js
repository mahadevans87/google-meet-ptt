let micButton;

function handleMicClick(event) {
  let micMuted;
  setTimeout(function () {
    if(document.querySelectorAll('.GKGgdd')[0].children[0].getAttribute('data-is-muted') != null){
      micMuted = document.querySelectorAll('.GKGgdd')[0].children[0].getAttribute('data-is-muted');
    } else {
      micMuted = document.querySelectorAll('.GKGgdd')[0].children[0].children[0].getAttribute('data-is-muted');
    }
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
        if(document.querySelectorAll('.GKGgdd')[0].children[0].getAttribute('data-is-muted')){
          micButton = document.querySelectorAll('.GKGgdd')[0].children[0];
        } else {
          micButton = document.querySelectorAll('.GKGgdd')[0].children[0].children[0];
        }
        micButton.click();
        return true;
      } else if (request.listenToMicClick) {
        // if(micButton != null){
        //   micButton.removeEventListener('click',handleMicClick);
        // }
        if(document.querySelectorAll('.GKGgdd')[0].children[0].getAttribute('data-is-muted')){
          micButton = document.querySelectorAll('.GKGgdd')[0].children[0];
        } else {
          micButton = document.querySelectorAll('.GKGgdd')[0].children[0].children[0];
        }
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
