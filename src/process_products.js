var sorryjakoProcessHelper = {
  removeDots : function(text) {
    return text.replace(/\./g,'');    
  },
  removeDiacritics : function(text) {
    var result = '';
    var chars1 = "ÁÄČÇĎÉĚËÍŇÓÖŘŠŤÚŮÜÝŽáäčçďéěëíňóöřšťúůüýž()";
    var chars2 = "AACCDEEEINOORSTUUUYZaaccdeeeinoorstuuuyz  ";
    for(var i = 0; i < text.length; i++) { 
      if (chars1.indexOf(text[i]) != -1) { 
        result += chars2[chars1.indexOf(text[i])];       
      } else {
       result += text[i];
      }
    }
    return result;
  }, 
  containsWord : function(haystack, needle) {
    haystack = sorryjakoProcessHelper.stripHtml(haystack);
    var haystackArray = haystack.split(/\s+/);
    for (var i = 0; i < haystackArray.length; i++) {
      if (haystackArray[i].replace(/\s|\u200B/g,'') == needle) {
        return true;
      }
    }
    return false;
  },
  stripHtml : function(html){
    var temporalDivElement = document.createElement("div");
    temporalDivElement.innerHTML = html;
    return temporalDivElement.textContent || temporalDivElement.innerText || "";
  }  
}

var productsProcessing = {
  processProduct : function (product) { 
    switch(sorryjakoAction) {      
      case "transparent":
          product.className += " sorryjakoTransparent";
          break;
      case "mark":
          product.className += " sorryjakoMark";
          break;        
      case "hide":
          product.className += " sorryjakoHide";
          break;
      case "befascist":
          break;         
    }
  },
  neverSkip: function() {
    for (var key in sorryjakoSettings.neverSkip) {
      if (window.location.href.indexOf(key) > -1) {
        return true;
      }
    }
    return false;
  },
  sorryjakoFilterProducts: function() {

    var locationChanged = false;
    if (window.location.href != productsProcessing.currentUrl) {
      locationChanged = true;
      productsProcessing.currentUrl = window.location.href; 
    } 

    var markupHost = sorryjakoProcessHelper.removeDots(sorryjakoHost);
    var products = Object.assign(sorryjakoSettings.products, sorryjakoSettings.productsShops[markupHost]);
    var listOfProducts = productsProcessing.getProducts(); 
    for (var i = 0; i < listOfProducts.length; i++) {
      if (listOfProducts[i].product.className.indexOf('sorryjakoClass') > -1 && (!productsProcessing.neverSkip() || locationChanged == false)) {
        continue;
      }
      var classes = listOfProducts[i].product.className;
      classes = classes.replace(' sorryjakoClass','');
      classes += " sorryjakoClass";
      classes = classes.replace('sorryjakoMark','');
      classes = classes.replace('sorryjakoHide','');
      classes = classes.replace('sorryjakoTransparent','');
      listOfProducts[i].product.className = classes;
      if (productsProcessing.isBabisovo(listOfProducts[i].productName, products)) {
        productsProcessing.processProduct(listOfProducts[i].product);
      }
    }
  },
 isBabisovo : function(productName, searchTree) {
    for (var key in searchTree) {
      if (typeof(searchTree[key]) == 'boolean') {
        if (sorryjakoProcessHelper.containsWord(productName, key)) {
          return searchTree[key];
        }     
      } else {
        if (sorryjakoProcessHelper.containsWord(productName, key)) {
          return productsProcessing.isBabisovo(productName, searchTree[key]);
        }              
      }
    }
    return false;  
  },
  parseProducts : function(element, settings) {
    var select;
    if (settings.idType == 'class') {
      select = element.getElementsByClassName(settings.id);
    }
    if (settings.idType == 'tag') {
      select = element.getElementsByTagName(settings.id);
    }
    if (settings.idType == 'id') {
      select = [element.getElementById(settings.id)];
      if (select[0] == null) {
        select = [];
      }
    }
    if (settings.nodeType == 'product') {
      for (var i = 0; i < select.length; i++) {
        productsProcessing.lastProduct.product = select[i];
        productsProcessing.parseProducts(select[i], settings.subNode);
      }
    }
    if (settings.nodeType == 'id') {      
      for (var i = 0; i < select.length; i++) {
        productsProcessing.parseProducts(select[i], settings.subNode);
      }
    }
    if (settings.nodeType == 'name') {    
      for (var i = 0; i < select.length; i++) {
        productsProcessing.lastProduct.productName = sorryjakoProcessHelper.removeDiacritics(select[i].innerHTML).toLowerCase();
        productsProcessing.products.push({
          productName: productsProcessing.lastProduct.productName,
          product: productsProcessing.lastProduct.product
        });
      }
    }         
  },
  getProducts : function() {
    var markupHost = sorryjakoProcessHelper.removeDots(sorryjakoHost);
    productsProcessing.products = [];
    for(var i = 0 ; i < sorryjakoSettings.markup[markupHost].length; i++) {
      productsProcessing.parseProducts(document, sorryjakoSettings.markup[markupHost][i]);
    }
    return productsProcessing.products;
  },    
  lastProduct : {},
  products : [],
  currentUrl : ''      
}

var sorryjakoObserver = {
  setObserver : function() {
    var observerSetting = sorryjakoSettings.observer[sorryjakoProcessHelper.removeDots(sorryjakoHost)];
    if (observerSetting == 'observer') {
      sorryjakoObserver.observer = new MutationObserver(function(mutations) {
        productsProcessing.sorryjakoFilterProducts();      
      });
      sorryjakoObserver.observer.observe(document.getElementsByTagName('body')[0], { attributes: true, childList: true, characterData: true });    
    } else {
      window.setInterval(function(){ productsProcessing.sorryjakoFilterProducts(); }, observerSetting);
    }    
  }
}

productsProcessing.sorryjakoFilterProducts();
sorryjakoObserver.setObserver();
