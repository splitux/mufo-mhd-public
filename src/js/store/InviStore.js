import Actions from '../action/AppActions';
import Events  from '../event/AppEvents';
import StoreBase from './StoreBase';
import FbInviRef from '../firebase/FbInviRef';

export default class InviStore extends StoreBase {
  constructor() {
    super();

    // ストアのデータ
    this._data = {
      uid: null
      ,lastInvi: null
      ,isEnabled: false
    };

    // データソースを初期化
    const dataRef = new FbInviRef();
    this._dataRef = dataRef;

    // データソースのイベント
    dataRef.on('invited',(invi)=>{
      this._data.lastInvi = invi;
      this.triggerEvent(Events.INVI_INVITED, this.lastInvi);
    });


    // 以下、受信したい（自分が処理できる）イベントを登録 //
    this.on(Actions.INVI_ENABLE, () => {
      if(!App.uid){
        console.warn('failed to INVI_ENABLE. not loggedin.');
        return;
      }
      this._data.uid = App.uid;
      this._data.isEnabled = true;
      dataRef.setUser(this._data.uid);
    });
    this.on(Actions.INVI_DISABLE, () => {
      this._data.uid = null;
      this._data.isEnabled = false;
      dataRef.setUser(null);
    });
    this.on(Actions.INVI_REQUEST, (isSystemRequest) => {
      if(!this._data.uid){
        console.warn('Invitation not enabled.');
        return;
      }
      dataRef.reqInvi(isSystemRequest?'client':'system');
    });
    this.on(Actions.INVI_ANSWER, (inviid,answer) => {
      if(!App.uid){
        console.warn('failed to INVI_ANSWER. not loggedin.');
        return;
      }
      dataRef.ansInvi(inviid,App.uid,answer);
      this._data.lastInvi = null;
    });


  }

  // データを開示するためのgetter（参照型は全てコピーして返すこと）

  get lastInvi() {
    return this._data.lastInvi ? this._data.lastInvi.clone() : null;
  }

  get isEnabled() {
    return this._data.isEnabled;
  }

}
