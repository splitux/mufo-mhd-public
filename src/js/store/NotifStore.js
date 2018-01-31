import Actions from '../action/AppActions';
import Events  from '../event/AppEvents';
import StoreBase from './StoreBase';
import FbNotifRef from '../firebase/FbNotifRef';

export default class NotifStore extends StoreBase {
  constructor() {
    super();

    // ストアのデータ
    this._data = {
      uid: null
      ,newNotifCount: 0
      ,notifs: []
    };

    // データソースを初期化
    const dataRef = new FbNotifRef();
    this._dataRef = dataRef;

    // データソースのイベント
    dataRef.on('count_changed',(count)=>{
      this._data.newNotifCount = count;
      this.triggerEvent(Events.NOTIF_COUNT_CHANGED,count);
    });
    dataRef.on('notif_changed',(notifs)=>{
      this._data.notifs = [...notifs];
      this.triggerEvent(Events.NOTIF_CHANGED, this.notifs);
    });


    // 以下、受信したい（自分が処理できる）イベントを登録 //
    this.on(Actions.NOTIF_WATCH_USER, (uid) => {
      this._data.uid = uid;
      dataRef.watchUser(uid);
    });

    this.on(Actions.NOTIF_REQUEST, () => {
      dataRef.requestNotifs();
    });

    this.on(Actions.NOTIF_MARK_OPENED, () => {
      dataRef.markAsOpened();
    });


  }

  // データを開示するためのgetter（参照型は全てコピーして返すこと）

  get uid() {
    return this._data.uid;
  }

  get newNotifCount() {
    return this._data.newNotifCount;
  }

  get notifs() {
    const cps = [];
    const org = this._data.notifs;
    for(let notif of org){
      cps.push(notif.clone());
    }
    return cps.sort((a,b)=>{return a.updated < b.updated});
  }


}
