let previousMicState = "ON";

chrome.runtime.onInstalled.addListener(function () {
  // console.log("Google Meet PTT Installed");
});

const toggleMicrophone = function () {
  chrome.tabs.query({ url: "https://meet.google.com/*" }, function (tabs) {
    if (tabs && tabs.length > 0) {
      const firstMeetTab = tabs[0];
      // console.log(firstMeetTab);
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { toggleMic: true });
      });
    } else {
      chrome.browserAction.setIcon({ path: `/icons/mic-default.png` });
    }
  });
};

const redirectToMeetHome = () => {
  chrome.tabs.query({ url: "https://meet.google.com/*" }, function (tabs) {
    if (tabs && tabs.length > 0) {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { returnHome: true });
      });
    }
  });
}

const switchToActiveTab = () => {
  chrome.tabs.query({ url: "https://meet.google.com/*" }, function (tabs) {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, { checkActiveMeetCall: true }, (response) => {
        if(response.shouldSwitchToThisTab){
          chrome.tabs.update(tab.id, {selected: true});
          chrome.windows.update(tab.windowId,{
            drawAttention: true
          });
        }
      });
    });
  });
}

chrome.commands.onCommand.addListener(function (command) {
  // console.log('Command', command);
  switch (command) {
    case 'toggle-mic':  
      toggleMicrophone();
      break;
    case 'return-home':
      redirectToMeetHome();
      break;
    case 'switch-to-active-tab':
      switchToActiveTab();
      break;
    default:
      break;
  }
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
        // console.log(firstMeetTab);
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { listenToMicClick: true }, (response) => {
            if (response && response.currentMicStatus) {
              chrome.browserAction.setIcon({ path: `/icons/mic-${response.currentMicStatus}.png` });
            } else if (!response) {
              // console.log("No response - onUpdated", chrome.runtime.lastError);
            }
          });
        });
      }
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender) {
  // console.log("Request", sender.tab ? "from a content script:" + sender.tab.url : "from the extension", request);
  if (request.micMuted && request.micMuted !== previousMicState) {
    // console.log("Creating notification");
    chrome.notifications.create({
      title: "Mute for Google Meet™",
      type: "basic",
      iconUrl: `icons/mic-${request.micMuted}.svg`,
      message: `Mic is ${request.micMuted}`,
      silent: true,
    });
    //update extension icon
    chrome.browserAction.setIcon({ path: `/icons/mic-${request.micMuted}.png` });
  } else {
    // console.log("No need of creating notification");
  }
  previousMicState = request.micMuted;
});

chrome.browserAction.onClicked.addListener(function callback() {
  toggleMicrophone();
});

chrome.tabs.onRemoved.addListener(function callback(tabId, removeInfo) {
  chrome.tabs.query({ url: "https://meet.google.com/*" }, function (tabs) {
    if (!tabs || tabs.length == 0) {
      chrome.browserAction.setIcon({ path: `/icons/mic-default.png` });
    }
  });
});
