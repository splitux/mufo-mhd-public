import FbCustomeRefBase from './FbCustomeRefBase.js';
import NotifModel from '../model/NotifModel';

const USER_NOTIF_PATH = 'index/user-notifs/';
const NOTIF_DATA_PATH = 'data/notifs/';

/**
 * @class FbNotifRef
 * ユーザに対する通知を監視・管理するクラスです
 */
export default class FbNotifRef extends FbCustomeRefBase {

  constructor(rootRef) {
    super(rootRef);
    this._defineCallback('count_changed'); // 通知数が変化した。常時監視します
    this._defineCallback('notif_changed'); // 通知内容が変化した。リクエストに応じて更新する

    this._uid;
  }

  /**
   * 通知を監視するユーザーを設定する。このユーザの通知数が増減した際にcount_changedイベントを発行します。
   * また、初期化処理として一週間以前の古い通知（index/user-notifyのインデックス情報）を削除します。
   * @param {string} uid
   */
  watchUser(uid) {
    if(uid === this._uid){return}
    this._uid = null;
    this._handlers.removeAll(); // 既存の監視をクリア
    if (!uid){return}

    this._uid = uid;
    let notifCount = 0;
    const myNotifPath = `${USER_NOTIF_PATH}/${uid}`;
    const notifCountRef = this.rootRef.child(myNotifPath);
    const onadd = ()=>{notifCount=notifCount+1;this._trigger('count_changed',notifCount)};
    const onrem = ()=>{notifCount=notifCount-1;this._trigger('count_changed',notifCount)};
    const queryRef = notifCountRef.orderByChild('opened').equalTo(null);
    queryRef.on('child_added',onadd);
    queryRef.on('child_removed',onrem);
    this._handlers.add(myNotifPath, 'child_added', onadd);
    this._handlers.add(myNotifPath, 'child_removed', onrem);

    // 古い通知を削除
    this._removeOldNotifIndex();
  }

  /**
   * 現在監視しているユーザーの全通知（一週間以内に更新があったもの全件）を取得する。
   * 取得が完了するとnotif_changedイベントに全件が渡されます。
   * 継続監視はしません。
   */
  requestNotifs(){
    const queryRef = this._notifsIndexQuery;
    if(!queryRef){return}
    queryRef.once('value').then((snap)=>{
      const indexes = snap.val();
      if(!indexes){
        this._trigger('notif_changed',[]);
        return;
      }
      const keys = Object.keys(indexes);
      const notifs = [];
      let waitCount = 0;
      const ongetnotif = (notif)=>{
        if(notif){notifs.push(notif)}
        waitCount = waitCount - 1;
        if(waitCount  === 0){
          this._trigger('notif_changed',notifs);
        }
      }
      keys.forEach((key)=>{
        const opened = indexes[key]['opened'];
        // 通知本体を取得
        waitCount = waitCount + 1;
        const notifRef = this.rootRef.child(`${NOTIF_DATA_PATH}/${key}`);
        notifRef.once('value').then((snap)=>{
          const notifData = snap.val();
          const notif = new NotifModel(notifData);
          notif.opened = opened; // インデックスにしかないデータを追加
          notif.notifkey = snap.key;
          ongetnotif(notif);
        });
      });

    });

  }

  /**
   * 現在監視しているユーザーの全通知を既読にします。
   * 事前にrequestNotifsを呼ぶ必要はありません。
   * 結果として未読から既読に変わった通知があった場合、count_changedイベントが発行されます。
   * notif_changedは発行されません。必要に応じてrequestNotifsで再取得してください。
   */
  markAsOpened(){
    const queryRef = this._notifsIndexQuery;
    if(!queryRef){return}
    const updates = {};
    queryRef.once('value').then((snap)=>{
      const indexes = snap.val();
      if(!indexes){return}
      const keys = Object.keys(indexes);
      if(!keys.length){return}
      const opened = Date.now();
      // 既読設定するパスをためる
      for(let notifkey of keys){
        updates[`${USER_NOTIF_PATH}/${this._uid}/${notifkey}/opened`] = opened;
      }
      // 一括で更新
      this.rootRef.update(updates);
    });
  }

  /**
   * 現在監視対象としているユーザの古い通知を削除します
   */
  _removeOldNotifIndex() {
    if(!this._uid){return}
    const oldNotifQuery = this._oldNotifsIndexQuery;
    oldNotifQuery.once('value').then((snap)=>{
      const oldNotifIndexes = snap.val();
      if(!oldNotifIndexes){return}
      const oldNotifIds = Object.keys(oldNotifIndexes);
      for(let notifid of oldNotifIds){
        const notifPath = `${USER_NOTIF_PATH}/${this._uid}/${notifid}`;
        this.rootRef.child(notifPath).remove();
      }
    });
  }

  /**
   * 通知のインデックス(/index/user-notifs/$uidの直近一週間分 or 一週間以前の物)を取得するクエリを返します。
   * @param {boolean} newer 一週間より新しいものを取得する場合、true。古いものを取得する場合、false
   */
  _getNotifIndexQuery(newer) {
    const myNotifPath = `${USER_NOTIF_PATH}/${this._uid}`;
    const notifIndexRef = this.rootRef.child(myNotifPath);
    const withinWeek = Date.now() - (7 * 24 * 3600 * 1000);
    const queryRef = newer ?
      notifIndexRef.orderByChild('updated').startAt(withinWeek)
      : notifIndexRef.orderByChild('updated').endAt(withinWeek);
    return queryRef;
  }

  /**
   * 通知のインデックス(/index/user-notifs/$uidの直近一週間分)を取得するクエリを返します。
   * @type {Query}
   */
  get _notifsIndexQuery(){
    return this._getNotifIndexQuery(true);
  }

  /**
   * 通知のインデックス(/index/user-notifs/$uidの直近一週間分より古いもの)を取得するクエリを返します。
   * 不要な古いインデックスを削除するために使用します。
   * @type {Query}
   */
  get _oldNotifsIndexQuery(){
    return this._getNotifIndexQuery(false);
  }

}
