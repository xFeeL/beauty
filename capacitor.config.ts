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
      "androidClientId": "1079825245656-ha5q3hdr5s6h3ocu8j1oem9e5g836j1n.apps.googleusercontent.com",//1079825245656-fig4fndpfrlg2jnqgu2us73evid5r66d.apps.googleusercontent.com" // Android client ID

      },
        "CapacitorUpdater": {
          "autoUpdate": false
        
      }
  },
  "server": {
    "cleartext": true
  }

};

export default config;
