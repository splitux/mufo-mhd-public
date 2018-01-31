import firebase from '../firebase/firebase.js';

const sysconfig = {
    sslfallback     :   false
    ,sslserver      :   ''
    ,maintenance    :   false
    ,maxreactions   :   0
    ,maxmufovisible :   50
};

export default {
    init : (oninit)=>{
        const confRef = firebase.database().ref('sys/public-config');
        confRef.once('value').then((snap)=>{
            const cf = snap.val() || {};
            sysconfig.sslfallback = !!cf['sslfallback'];
            sysconfig.sslserver = cf['sslserver'];
            sysconfig.maintenance = !!cf['maintenance'];
            sysconfig.maxreactions = cf['maxreactions'] || 100;
            sysconfig.maxmufovisible = cf['maxmufovisible'] || 50;
            oninit();
        });

    }
    ,get sslfallback(){return sysconfig.sslfallback}
    ,get sslserver(){return sysconfig.sslserver}
    ,get maintenance(){return sysconfig.maintenance}
    ,get maxreactions(){return sysconfig.maxreactions}
    ,get maxmufovisible(){return sysconfig.maxmufovisible}
  }
