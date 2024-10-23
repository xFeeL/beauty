// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // src/environments/environment.ts
  stripePublishableKey: 'pk_test_51QAWK4EQw15tXsM9QQsDAmfeW5iDTLvtVKLISVxs7ZCXQBkV3TCLA8eRtQuJEYMBnkzCNNGDjmqiG5ySsGD45QzC00pgbxIOq4'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdw5k1Avdg_6HWnU-pn7FRlRIKVnlr6XI",
  authDomain: "find-your-expert-407809.firebaseapp.com",
  projectId: "find-your-expert-407809",
  storageBucket: "find-your-expert-407809.appspot.com",
  messagingSenderId: "1079825245656",
  appId: "1:1079825245656:web:a530622a0afea0d327bead",
  measurementId: "G-PQN59RTL5B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);




