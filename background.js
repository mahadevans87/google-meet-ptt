chrome.runtime.onInstalled.addListener(function (details) {
  // console.log("Google Meet PTT Installed");
  switch (details.reason) {
    case 'install':
      let previousMicState = "ON";
      let notifications = true;
      chrome.storage.local.set({previousMicState});
      chrome.storage.local.set({notifications});
       break;
    // case 'update':
    // case 'chrome_update':
    // case 'shared_module_update':
    default:
       break;
  }
});

const bringChromeTabToForeground = (tab) => {
  chrome.tabs.sendMessage(tab.id, { checkActiveMeetCall: true }, (response) => {
    if(response.shouldSwitchToThisTab){
      chrome.tabs.update(tab.id, {selected: true});
      chrome.windows.update(tab.windowId,{
        focused: true
      });
    }
  });
};

const toggleMicrophone = function () {
  chrome.tabs.query({ url: "https://meet.google.com/*" }, function (tabs) {
    if (tabs && tabs.length > 0) {
      tabs.forEach((tab) => {
        bringChromeTabToForeground(tab);
        chrome.tabs.sendMessage(tab.id, { toggleMic: true });
      });
    } else {
      chrome.action.setIcon({ path: `/icons/mic-default.png` });
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
      bringChromeTabToForeground(tab);
    });
  });
}

const toogleNotifications = () => {
  chrome.storage.local.get('notifications', function (val) {
    let currentEnabled = val.notifications === true || val.notifications === undefined;
    let notificationText = currentEnabled ? "Disabled" : "Enabled";
    chrome.storage.local.set({notifications: !currentEnabled });

    chrome.notifications.create({
      title: "Mute for Google Meet™",
      type: "basic",
      iconUrl: `icons/meet_assist_default.png`,
      message: `${notificationText} mic notifications`,
      silent: true,
    });
  });
}

chrome.commands.onCommand.addListener(function (command) {
  //console.log('Command', command);
  let notifications;
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
    case 'toogle-notifications':
      toogleNotifications();
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
              chrome.action.setIcon({ path: `/icons/mic-${response.currentMicStatus}.png` });
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

  chrome.storage.local.get(['previousMicState', 'notifications'], function (values) {
    if (request.micMuted && request.micMuted !== values.previousMicState) {
      if (values.notifications) {
        chrome.notifications.create({
          title: "Mute for Google Meet™",
          type: "basic",
          iconUrl: chrome.runtime.getURL(`icons/mic-${request.micMuted}.png`), //.svg dont work for me :(
          message: `Mic is ${request.micMuted}`,
          silent: true,
        });
        // console.log("Creating notification");
      }
      //update extension icon
      chrome.action.setIcon({ path: `/icons/mic-${request.micMuted}.png` });
    } else {
      // console.log("No need of creating notification");
    }
    let previousMicState = request.micMuted;
    chrome.storage.local.set({previousMicState});
  });
});

chrome.action.onClicked.addListener(function callback() {
  toggleMicrophone();
});

chrome.tabs.onRemoved.addListener(function callback(tabId, removeInfo) {
  chrome.tabs.query({ url: "https://meet.google.com/*" }, function (tabs) {
    if (!tabs || tabs.length == 0) {
      chrome.action.setIcon({ path: `/icons/mic-default.png` });
    }
  });
});
