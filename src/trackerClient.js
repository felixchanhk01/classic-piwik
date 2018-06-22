/*
  GA and Piwik wrapper for data tracking
  */

class trackerClient{
  constructor(configObj, sendPageView = true){
    if(configObj){
      if(configObj.GA){
        if(configObj.GA.trackingId){
          this.GAId = configObj.GA.trackingId;
        }else{
          throw("Please fill in Google Analytics Config");
        }
      }else{
        throw("Please fill in Google Analytics Config");
      }
    }else{
      throw("Please fill in the Config")
    }

    if(configObj.Piwik){
      if(configObj.Piwik.trackingUrl && configObj.Piwik.siteId && configObj.Piwik.userId){
        this.PiwikUrl = configObj.Piwik.trackingUrl;
        this.siteId = configObj.Piwik.siteId;
        this.isSPA = configObj.Piwik.isSPA?configObj.Piwik.isSPA:false;
        this.userId = configObj.Piwik.userId
      }else{
        throw("Please fill in Piwik Config");
      }
    }else{
      throw("Please fill in Piwik Config");
    }

    // Config trackers
    window.dataLayer = window.dataLayer || [];
    this.gtag = function(){
      window.dataLayer.push(arguments);
    }
    this.gtag("js", new Date());
    if(Array.isArray(this.GAId)){
      this.GAId.map(function(gid){
        this.gtag("config", gid, {
          send_page_view: sendPageView
        });
      }, this);
    }else{
      this.gtag("config", this.GAId, {
        send_page_view: sendPageView
      });
    }
    this.piwikTracker = window.Piwik.getTracker(this.PiwikUrl, this.siteId);
    this.piwikTracker.setUserId(this.userId);

    this.gaConfig = {};
  }

  setUserId(userId){
    this.piwikTracker.setUserId(userId);
    this.userId = userId;
  }

  setCustomDimension(customDimensions = {}) {
    var config = {};
    Object.keys(customDimensions).map(function(key, value) {
      config[`dimension${key}`] = customDimensions[key];
      this.piwikTracker.setCustomDimension(key, value);
    });
    if(Array.isArray(this.GAId)){
      this.GAId.map(function(gid){
        this.gtag(
          "config",
          gid,
          Object.assign({}, config, { send_page_view: false })
        );
      }, this);
    }else{
      this.gtag(
        "config",
        this.GAId,
        Object.assign({}, config, { send_page_view: false })
      );
    }
    this.gaConfig = config;
    this.currentPathname = '';
  }

  pageView(
    { GA, Piwik } = {},
    customDimensions = {},
    location,
    pathname
  ){
    var newLocation = location ? location : window.location.href;
    var newPathname = pathname ? pathname : window.location.pathname;

    var params = {};
    Object.keys(customDimensions).map(function(key, value) {
      params[`dimension${key}`] = customDimensions[key];
    });

    if(Piwik){
      if (this.isSPA) {
        if (this.currentPathname) {
          this.piwikTracker.setReferrerUrl(this.currentPathname);
        }
        if (newPathname) {
          this.piwikTracker.setCustomUrl(newPathname);
        }
        this.piwikTracker.setDocumentTitle(window.document.title);
        this.piwikTracker.setGenerationTimeMs(0);
      }

      this.piwikTracker.trackPageView(undefined, params);
      this.piwikTracker.enableLinkTracking(true);

      this.currentPathname = newPathname;
    }

    if(GA){
      this.gtag("set", { page_location: newLocation });
      if(Array.isArray(this.GAId)){
        this.GAId.map(function(gid){
          this.gtag(
            "config",
            gid,
            Object.assign({}, this.gaConfig , params, {
              page_title: window.document.title,
              page_path: newPathname
            })
          );
        }, this);
      }else{
        this.gtag(
          "config",
          this.GAId,
          Object.assign({}, this.gaConfig , params, {
            page_title: window.document.title,
            page_path: newPathname
          })
        );
      }
    }
    // Clear the old Dimension
    this.setCustomDimension();
  }
  
  fire({ GA, Piwik } = {}, event = {}) {
    if(event.category && event.action){
      var category = event.category;
      var action = event.action;
      var label = !(event.label === null)?event.label:null;
      var value = !(event.value === null)?event.value:null;
      var customDimensions = event.customDimensions?event.customDimensions:{};
      var nonInteraction = !(event.nonInteraction === null)?event.nonInteraction:false;

      var params = {};
      Object.keys(customDimensions).map(function(key, value){
        params[`dimension${key}`] = customDimensions[key];
      });
      if (GA) {
        var gaParam = Object.assign(params, {
          event_category: category,
          event_label: label,
          value: value,
          non_interaction: nonInteraction
        });
        this.gtag("event", action, gaParam);
      }
      if (Piwik) {
        this.piwikTracker.trackEvent(category, action, label, value, params);
      }
    }else{
      throw("Invalid GA / Piwik event");
    }
  }

  disableGA(ga_list = null){
    if(ga_list === null || ga_list === false || ga_list === true){
      var temp_stage = ga_list?ga_list:false;
      if(Array.isArray(this.GAId)){
        this.GAId.map(function(gid){
          window['ga-disable-'+gid] = temp_stage;
        }, this);
      }else if(this.GAId !== null){
        window['ga-disable-'+this.GAId] = temp_stage;
      }
    }else if(ga_list === Object(ga_list)){
      Object.keys(ga_list).map(function(gid){
        window['ga-disable-'+gid] = ga_list[gid]?true:false;
      });
    }
  }
}