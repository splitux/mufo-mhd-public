
const firebaseapp = require('firebase/app');
require('firebase/auth');
require('firebase/database');

const config = {
  apiKey: '@@firebase.apiKey',
  authDomain: '@@firebase.authDomain',
  databaseURL: '@@firebase.databaseURL',
  projectId: '@@firebase.projectId',
  storageBucket: '@@firebase.storageBucket',
  messagingSenderId: '@@firebase.messagingSenderId'
};
firebaseapp.initializeApp(config);

export default firebaseapp;
