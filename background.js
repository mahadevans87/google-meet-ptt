chrome.runtime.onInstalled.addListener(function () {
  console.log("Google Meet PTT Installed");
});

const toggleMicrophone = function () {
  chrome.tabs.query({ url: "https://meet.google.com/*" }, function (tabs) {
    if (tabs && tabs.length > 0) {
      const firstMeetTab = tabs[0];
      console.log(firstMeetTab);
      chrome.tabs.sendMessage(firstMeetTab.id, { toggleMic: true });
    } else {
      chrome.browserAction.setIcon({ path: `/mic-default-38x38.png` });
    }
  });
};

chrome.commands.onCommand.addListener(function (command) {
  console.log("Command:", command);
  toggleMicrophone();
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
    //update extension icon
    chrome.browserAction.setIcon({ path: `/mic-${request.micMuted}-38x38.png` });
  }
});

chrome.browserAction.onClicked.addListener(function callback() {
  toggleMicrophone();
});

chrome.tabs.onRemoved.addListener(function callback() {
  chrome.tabs.query({ url: "https://meet.google.com/*" }, function (tabs) {
    if (!tabs || tabs.length == 0) {
      chrome.browserAction.setIcon({ path: `/mic-default-38x38.png` });
    }
  });
});
