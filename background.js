let previousMicState = "ON";

chrome.runtime.onInstalled.addListener(function () {
  console.log("Google Meet PTT Installed");
});

const toggleMicrophone = function () {
  chrome.tabs.query({ url: "https://meet.google.com/*" }, function (tabs) {
    if (tabs && tabs.length > 0) {
      const firstMeetTab = tabs[0];
      console.log(firstMeetTab);
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { toggleMic: true });
      });
    } else {
      chrome.browserAction.setIcon({ path: `/icons/meet_assist_default.png` });
    }
  });
};

chrome.commands.onCommand.addListener(function (command) {
  console.log("Command:", command);
  toggleMicrophone();
});

// chrome.tabs.onUpdated is called when a tab is updated in chrome
// For meet, when the user joins a call, chrome.tabs.onUpdated is called with the changeInfo as
// { 'audible': 'false' }
// Using that as a trigger send a message to content script, to start listening for click events
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("Tab updated", tabId, changeInfo, tab);
  if ((changeInfo.status === "complete" && tab.url !== "https://meet.google.com/") || changeInfo.audible === false) {
    chrome.tabs.query({ url: "https://meet.google.com/*" }, function (tabs) {
      if (tabs && tabs.length > 0) {
        const firstMeetTab = tabs[0];
        console.log(firstMeetTab);
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { listenToMicClick: true }, (response) => {
            if (response && response.currentMicStatus) {
              chrome.browserAction.setIcon({ path: `/icons/meet_assist_mic_${response.currentMicStatus}.png` });
            } else if (!response) {
              console.log("No response - onUpdated", chrome.runtime.lastError);
            }
          });
        });
      }
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender) {
  console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
  if (request.micMuted && request.micMuted !== previousMicState) {
    chrome.notifications.create({
      title: "Google Meet PTT",
      type: "basic",
      iconUrl: `icons/mic-${request.micMuted}.svg`,
      message: `Mic is ${request.micMuted}`,
      silent: true,
    });
    //update extension icon
    chrome.browserAction.setIcon({ path: `/icons/meet_assist_mic_${request.micMuted}.png` });
  }
  previousMicState = request.micMuted;
});

chrome.browserAction.onClicked.addListener(function callback() {
  toggleMicrophone();
});

chrome.tabs.onRemoved.addListener(function callback(tabId, removeInfo) {
  chrome.tabs.query({ url: "https://meet.google.com/*" }, function (tabs) {
    if (!tabs || tabs.length == 0) {
      chrome.browserAction.setIcon({ path: `/icons/meet_assist_default.png` });
    }
  });
});
