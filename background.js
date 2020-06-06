chrome.runtime.onInstalled.addListener(function () {
  console.log("Google Meet PTT Installed");
});

chrome.commands.onCommand.addListener(function (command) {
  console.log("Command:", command);
  chrome.tabs.query({ url: "https://meet.google.com/*" }, function (tabs) {
    const firstMeetTab = tabs[0];
    console.log(firstMeetTab);
    chrome.tabs.sendMessage(firstMeetTab.id, { toggleMic: true });
  });
});

chrome.runtime.onMessage.addListener(function (request, sender) {
  console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
  if (request.micMuted) {
    chrome.notifications.create({
      title: "Google Meet PTT",
      type: "basic",
      iconUrl: `mic-${request.micMuted}.png`,
      message: `Mic is ${request.micMuted}`,
    });
  }
});
