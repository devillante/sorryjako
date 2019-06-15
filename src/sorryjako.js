var background = {
  insertAction : function(action, tabId, host) {
    if (!action) {
      action = "transparent";
    }
    chrome.tabs.executeScript(tabId, {code: 'var sorryjakoAction = "' + action + '";'});
    chrome.tabs.executeScript(tabId, {code: 'var sorryjakoHost = "' + host + '";'});
    chrome.tabs.executeScript(tabId, {file: 'settings.js'});
    chrome.tabs.executeScript(tabId, {file: 'products.js'});
    chrome.tabs.insertCSS(tabId, {file: 'sorryjako.css'});
    chrome.tabs.executeScript(tabId, {file: 'process_products.js'});  
  },
  
  runSavedProductAction : function(url, tabId, callback) {
    chrome.storage.sync.get('productActions', (items) => {
      var savedAction;
      try {
        savedAction = items['productActions'][url];
      } catch (err) {
        savedAction = null;
      }   
      callback(savedAction, tabId, url);
    });
  }  
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlMatches: sorryjakoSettingsHelper.availableSites() },
          })
        ],
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
    var host = new URL(tab.url).host.replace('www.','');
    if (sorryjakoSettings.sites.indexOf(host) > -1) {
      background.runSavedProductAction(host, tabId, background.insertAction);         
    }     
  }
});