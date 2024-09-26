import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  "appId": "com.fyx.beauty",
  "appName": "Fyx for Beauty",
  "webDir": "www",
  "bundledWebRuntime": false,
  "plugins": {
    "GoogleAuth": {
      "scopes": ["profile", "email"],
      "serverClientId": "1079825245656-ha5q3hdr5s6h3ocu8j1oem9e5g836j1n.apps.googleusercontent.com", // Web client ID
      "androidClientId": "1079825245656-ha5q3hdr5s6h3ocu8j1oem9e5g836j1n.apps.googleusercontent.com", // Android client ID
      "iosClientId": "1079825245656-52e5o7ihigjqvce58vgbarebq2121rfj.apps.googleusercontent.com" // iOS client ID
    },
    "CapacitorUpdater": {
      "autoUpdate": false
    },
    "CapacitorCookies": {
      "enabled": true
    },
    "CapacitorHttp": {
      "enabled": true
    }
  },
  "server": {
    "hostname": "api-uat.fyx.gr"
  },
  "ios": {
    "limitsNavigationsToAppBoundDomains": true
  }
};

export default config;
