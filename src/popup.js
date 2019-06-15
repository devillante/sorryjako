var popup = {
  getSavedProductAction : function(url, callback) {
    chrome.storage.sync.get('productActions', (items) => {
      var savedAction;
      try {
        savedAction = items['productActions'][url];
      } catch (err) {
        savedAction = null;
      }   
      callback(savedAction);
    });
  },
  saveProductAction : function(url, action) {
    var items = {};  
    items['productActions'] = { };
    items['productActions'][url] = action;
    chrome.storage.sync.set(items);  
  }, 
  getCurrentTabHost : function(callback) {
    var queryInfo = {
      active: true,
      currentWindow: true
    };

    chrome.tabs.query(queryInfo, (tabs) => {
      var tab = tabs[0];
      var url = tab.url;
      callback(new URL(url).host.replace('www.',''));
    });
  },
  loadAction: function(host) {
    var productActions = document.getElementById('productActions');
  
    popup.getSavedProductAction(host, (savedProductAction) => {
      if (savedProductAction) {
          productActions.value = savedProductAction;
      }
    });
    
    productActions.addEventListener('change', () => {
      popup.saveProductAction(host, productActions.value);   
    });
  }    
}
  
document.addEventListener('DOMContentLoaded', () => {
  popup.getCurrentTabHost(popup.loadAction);  
});