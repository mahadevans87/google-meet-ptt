let micButton;

window.onload = function () {
  micButton = document.querySelector(".sUZ4id").children[0];
  micButton.addEventListener("click", (e) => {
    const micMuted = micButton.getAttribute("data-is-muted");
    chrome.runtime.sendMessage({ micMuted });
  });
};

chrome.runtime.onMessage.addListener(function (request, sender) {
  console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
  if (request.toggleMic) {
    micButton.click();
  }
  return true;
});
