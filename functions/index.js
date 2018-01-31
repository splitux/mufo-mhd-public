const functions = require('firebase-functions');

const NOTIFTYPE_ADDSONG = 'addsong';
const NOTIFTYPE_ADDREACTION = 'addreaction';
const MIN_INVI_INTERVAL_SEC = 60;
const ACTIVE_BAISIS_SEC = 60 * 10;

/**
 * 招待するユーザを取得します。以下の上限が考慮されます：
 * ・直近の一定時間内にアクセスがあること
 * ・前回の招待から一定の時間が経過していること
 * ・前回招待したMuFoが今回と異なること
 * 実際には、アクセス時刻が新しいユーザから一定数に対して上記を順次検査し、当てはまるユーザを指定人数以内で返します。
 * 条件に合致するユーザを一人も見つけられなかった場合、結果は空の配列になります。
 * @param {Reference} rootAdminRef
 * @param {number} countToInvite
 * @param {string} mufoid
 * @param {Array[string]} excludedUids オプション。除外するユーザ
 * @return {Promise} 後続の処理でuidの配列を受け取れます。
 */
const getInviUsers = (rootAdminRef,countToInvite,mufoid,excludedUids)=>{
    // アクティブユーザを取得
    const activesRef = rootAdminRef.child('/index/active-users').orderByChild('actived').limitToLast(countToInvite * 3);
    return activesRef.once('value').then((snap)=>{
      const now = Date.now();
      const inviUids = [];
      const users = snap.val();
      const uids = Object.keys(users);
      for(let uid of uids){
        const user = users[uid];
        const isRecentActived = (now - (user.actived || 0)) < ACTIVE_BAISIS_SEC*1000;
        const isRecentInvited = (now - (user.lastinvited || 0)) < MIN_INVI_INTERVAL_SEC;
        const isInvitedThisMufoLastTime = mufoid === user.lastinvitedmufoid;
        const isExcluedUid = excludedUids && excludedUids.includes(uid);
        if(isRecentActived && !isRecentInvited && !isInvitedThisMufoLastTime && !isExcluedUid){
          inviUids.push(uid);
          if(inviUids.length >= countToInvite){break}
        }
      }
      return inviUids;
    });
}

/**
 * 招待のIDを採番して返します。
 * @param {Reference} rootAdminRef
 */
const createInviid = (rootAdminRef)=>{
  return rootAdminRef.child('data/invis').push().key;
}

/**
 * 招待のデータを作成します。データの登録(ref.update)はしません。
 * @param {string} inviid
 * @param {Array[string]} uids
 * @param {Object} mufo
 * @param {string} cause
 * @param {string} reqId?
 */
const createInviData = (inviid,uids,mufo,cause,reqId)=>{
  const now = Date.now();
  const updates = {};

  // 招待データ本体
  const inviPath = `data/invis/${inviid}`;
  const inviData = {
    invited : now
    ,mufodata : mufo
    ,cause
    ,inviid
    ,users : {}
  };
  for(let uid of uids){
    inviData.users[uid] = {
      uid
    };

  }
  updates[inviPath] = inviData;

  // ユーザごとのインデックス
  for(let uid of uids){
    const indexPath = `index/user-invis/${uid}`;
    const inviIndexData = {
      invited : now
      ,inviid
    };
    const activeInvitedPath = `index/active-users/${uid}/lastinvited`;
    const activeInviMufoidPath = `index/active-users/${uid}/lastinvitedmufoid`;
    updates[indexPath] = inviIndexData;
    updates[activeInvitedPath] = now;
    updates[activeInviMufoidPath] = mufo.mufoid;
  }

  // （ユーザが呼び出した場合のみ）
  if(reqId){
    const reqInviidPath = `data/invireqs/${reqId}/inviid`;
    updates[reqInviidPath] = inviid;
  }

  return updates;

}

/**
 * 通知のキーを作成します
 * @param {string} type NOTIFTYPE_*定数から選択
 * @param {string} id typeがADDSONGの場合、mufoid。typeがADDREACTIONの場合、songid。
 */
const createNotifkey = (type,id)=>{
  if(type !== NOTIFTYPE_ADDREACTION && type !== NOTIFTYPE_ADDSONG){
    throw `invalid notif type : ${type}`;
  }
  return `${type}-${id}`;
}

const createNotifData = (type,notifkey,uid,mufo,song)=>{
  if(type !== NOTIFTYPE_ADDREACTION && type !== NOTIFTYPE_ADDSONG){
    throw `invalid notif type : ${type}`;
  }
  const notifPath = `/data/notifs/${notifkey}`;
  const userNotifPath = `/index/user-notifs/${uid}/${notifkey}`;
  const notifData = {
    type,
    uid,
    updated : Date.now(),
    mufodata : mufo,
    songdata : song
  };
  const userNotifData = {
    updated : Date.now(),
    opened : null
  };
  return {
    [notifPath] : notifData,
    [userNotifPath] : userNotifData
  };

}

/**
 * MuFo本体データを取得するPromiseを返します。後続処理ではmufoのスナップショットを受け取れます。
 * @param {Reference} rootRef
 * @param {string} mufoid
 * @return {Promise} <Function(snap)>
 */
const getMufo = (rootRef,mufoid)=>{
  const mufoRef = rootRef.child(`data/mufos/${mufoid}`);
  return mufoRef.once('value');
}

/**
 * 曲データを取得するPromiseを返します。後続処理ではsongのスナップショットを受け取れます。
 * @param {Reference} rootRef
 * @param {string} songid
 * @return {Promise} <Function(snap)>
 */
const getSong = (rootRef,songid)=>{
  const songRef = rootRef.child(`data/songs/${songid}`);
  return songRef.once('value');
}

/**
 * MuFoの曲数を更新します。後続処理では更新後の曲数を受け取れます。
 * @param {Reference} rootRef
 * @param {string} mufoid
 */
const updateMufoSongCount = (rootRef,mufoid)=>{
  const songsRef = rootRef.child('data/songs').orderByChild('mufoid').equalTo(mufoid);
  let count = 0;
  const promise = songsRef.once('value')
  .then((snap)=>{
    const songs = snap.val();
    return songs ? Object.keys(songs).length : 0 ;
  })
  .then((songcount)=>{
    count = songcount;
    return rootRef.child(`data/mufos/${mufoid}`).update({songcount});
  })
  .then(()=>{
    return count;
  });
  return promise;
}

// MuFo作成時 : 招待の発行
exports.onCreateMufo = functions.database.ref('/data/mufos/{mufoid}').onCreate(event => {
  const rootAdminRef = event.data.adminRef.root;
  const mufoid = event.data.key;
  const mufo   = event.data.val();
  return getInviUsers(rootAdminRef,5,mufoid,[mufo.authoruid]).then((uids)=>{
    if(!uids.length){
      console.log('no user to invite');
      return null;
    }
    const inviid = createInviid(rootAdminRef);
    const updates = createInviData(inviid,uids,mufo,'mufo',null);
    return rootAdminRef.update(updates);
  })
});

// 曲追加時 : MuFo作成者への通知 + 招待の発行
exports.onAddsong = functions.database.ref('/data/songs/{songid}').onCreate(event => {
  // Grab the current value of what was written to the Realtime Database.
  const rootRef = event.data.ref.root;
  const rootAdminRef = event.data.adminRef.root;
  const songid = event.data.key;
  const song   = event.data.val();
  const mufoid = song['mufoid'];
  let mufo = null;
  console.log('song added : ',songid);
  // mufoデータを取得
  const promise = updateMufoSongCount(rootRef,mufoid)
  .then(()=>{
    return getMufo(rootRef,mufoid);
  })
  .then((mufoSnap)=>{
    //通知
    mufo = mufoSnap.val();
    const uid = mufo['authoruid'];
    // 通知のキーを作成
    const notifkey = createNotifkey(NOTIFTYPE_ADDSONG,mufoid);
    const notifData = createNotifData(NOTIFTYPE_ADDSONG,notifkey,uid,mufo,song);
    return rootAdminRef.update(notifData);
  })
  .then(()=>{
    //招待
    return getInviUsers(rootAdminRef,3,mufoid,[mufo.authoruid]).then((uids)=>{
      if(!uids.length){
        console.log('no user to invite');
        return null;
      }
      const inviid = createInviid(rootAdminRef);
      const updates = createInviData(inviid,uids,mufo,'song',null);
      return rootAdminRef.update(updates);
    })

  });
  return promise;
});


// リアクション追加時の通知
exports.onAddreaction = functions.database.ref('/data/songs/{songid}/reaction')
.onWrite(event => {
  const songid = event.params.songid;
  const rootRef = event.data.ref.root;
  const rootAdminRef = event.data.adminRef.root;
  const count = event.data.val();
  if(!count){return null} //リアクション数=0ならなにもしない
  let song = null;
  let mufo = null;
  let mufoid = null;
  const promise = getSong(rootRef,songid)
  .then((snap)=>{
    song = snap.val();
    mufoid = song ? song.mufoid:null;
    if(!song){console.warn(`can not get song : ${songid}`);return null}
    return getMufo(rootRef,mufoid);
  })
  .then((snap)=>{
    mufo = snap.val();
    if(!mufo){console.warn(`can not get mufo : ${mufoid}`);return null}
    // songの作成者に通知を追加
    const uid = song['authoruid'];
    const notifkey = createNotifkey(NOTIFTYPE_ADDREACTION,songid);
    const notifData = createNotifData(NOTIFTYPE_ADDREACTION,notifkey,uid,mufo,song);
    return rootAdminRef.update(notifData);
  });
  return promise;
});

// 招待要求時の処理
exports.onInviReq = functions.database.ref('/data/invireqs/{reqid}')
.onCreate(event => {
  console.log(event.data.key, event.data.val());
  // 要求内容取得
  const eventVal = event.data.val();
  const reqUid = eventVal.uid;
  const reqId  = event.data.key;
  // MuFoをランダムに取得、招待を追加
  const rootRef = event.data.adminRef.root;
  const mufosRef = rootRef.child('data/mufos').orderByChild('modified').limitToLast(100);
  const promise = mufosRef.once('value').then((mufosSnap)=>{
    const mufos = mufosSnap.val();
    const mufoIds = Object.keys(mufos);
    const mufoid = mufoIds[Math.floor(Math.random()*mufoIds.length)];
    const targetMufo = mufos[mufoid];
    console.log(`mufoid = ${mufoid}`);

    const inviid = createInviid(rootRef);
    const updates = createInviData(inviid,[reqUid],targetMufo,'user',reqId);
    return rootRef.update(updates);

  });

  return promise;
});
