# Sample code for handling Piwik and GA events without framework


This client will fire page view and other tracking events to different tracker services simultaneously.
Current supported services:

- Google Analytics
- Piwik

The client does not depends on any Javascript framework.

## Usage

Include the following scripts between `<head></head>`

```html
<script src="library/piwik.min.js"></script>
<script src="https://www.googletagmanager.com/gtag/js"></script>
<script src="src/trackerClient.js"></script>
```

#### Initialize the tracker client

For signal GA tracking ID

```js
var myTracker = new trackerClient({
  GA: {
      trackingId: "UA-123456-2"  // replace with your tracking ID
    },
    Piwik: {
      trackingUrl: "https://localhost/piwik.php",  // replace with your piwik tracking url
      siteId: 5,  // replace with your piwik site ID
      userId: "user-ID", // replace with user ID, should be same as MEMBER_ID/ANONYMOUS_ID
      isSPA: true // if the page is single page application
    }
}, false);
```

For multiple GA tracking ID

```js
var myTracker = new trackerClient({
  GA: {
      trackingId: ["UA-123456-2", "UA-123456-3", "UA-123456-4"]  // replace with your tracking ID
    },
    Piwik: {
      trackingUrl: "https://localhost/piwik.php",  // replace with your piwik tracking url
      siteId: 5,  // replace with your piwik site ID
      userId: "user-ID", // replace with user ID, should be same as MEMBER_ID/ANONYMOUS_ID
      isSPA: true // if the page is single page application
    }
}, false);
```

#### Send Page View 

```js
/* send page view with additional custom dimensions */
myTracker.pageView(
  {
    GA: true,
    Piwik: true
  },
  {
    [DIMENSION_ARTICLE_AUTHOR]: "Eric"
  }
);

/* send page view without additional custom dimensions */
myTracker.pageView({
  GA: true,
  Piwik: true
});

/* send page view with customize url */
myTracker.pageView({
  GA: true,
  Piwik: true
}, {}, "your-url-here", "your-path-here");
```
#### Fire events

```js
myTracker.fire(
  {
    GA: true,
    Piwik: true
  },
  {
    category: "access",
    action: "login",
    label: "google",
    nonInteraction: false,
    customDimensions: {
      [DIMENSION_ARTICLE_AUTHOR]: "Eric"
    }
  }
);
```

#### Set the userId in later stage

```js
myTracker.setUserId('new_user_id');
```

#### Disable specific GA profile in PV / events

When we want to disable specific profile in GA, for example, disable `UA-123456-2` and `UA-123456-4`, the following action should be done before PV / events: 

```js
myTracker.disableGA({
  'UA-123456-2': true,
  'UA-123456-3': false,
  'UA-123456-4': true,
});
```

And reset the action after the PV / events:

```js
myTracker.resetGAFlags();
```

However, if all GA profiles are disabled, please set `GA: false` in event or PV.

#### Test the page by creating local http server

Use the library `http.server` in *Python 3* to create local http server. The GA event will not fire when the webpage protocol is `file://`

```sh
python3 -m http.server
```