let micButton;

window.addEventListener(
  "load",
  function () {
    micButton = document.querySelector(".sUZ4id").children[0];
    micButton.addEventListener("click", (e) => {
      this.setTimeout(() => {
        const micMuted = micButton.getAttribute("data-is-muted");
        console.log("Mic-muted: ", micMuted);
        chrome.runtime.sendMessage({ micMuted: micMuted === "true" ? "OFF" : "ON" });
      }, 0);
    });

    chrome.runtime.onMessage.addListener(function (request, sender) {
      console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
      if (request.toggleMic) {
        micButton.click();
      }
      return true;
    });
  },
  false
);
