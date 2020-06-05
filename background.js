chrome.runtime.onInstalled.addListener(function () {
  console.log("hello");
  chrome.commands.onCommand.addListener(function (command) {
    console.log("Command:", command);

    chrome.tabs.query(
      {
        url: "https://meet.google.com/*",
      },
      (tabs) => {
        console.log(tabs);
        const firstMeetTab = tabs[0];
        chrome.tabs.executeScript(firstMeetTab.id, {
          file: "togglemic.js",
        }),
          (result) => {
            console.log("result");
          };
        chrome.notifications.create({
          title: "qweqe",
          type: "basic",
          iconUrl: "mute-icon.png",
          message: "qwqwe12354",
        });
      }
    );
  });
});
