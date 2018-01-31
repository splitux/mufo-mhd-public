import Actions from '../action/AppActions';
//import Events  from '../event/AppEvents';
import StoreBase from './StoreBase';
import FbActionLogRef from '../firebase/FbActionLogRef';
import ActionLogModel from '../model/ActionLogModel';
import LocationModel from '../model/LocationModel';

const LOG_LOC_NOISE = 1.0; // 1Km

export default class LogStore extends StoreBase {
  constructor() {
    super();

    // ストアのデータ
    this._data = {
    };

    // データソースを初期化
    const dataRef = new FbActionLogRef();
    this._dataRef = dataRef;

    // データソースのイベント

    // 以下、受信したい（自分が処理できる）イベントを登録 //
    this.on(Actions._LOG_ACTIONLOG, (actionName,...params) => {

      // 位置情報を含むログに誤差を与える
      let loc;
      let mufo;
      switch (actionName) {
      case Actions.EARTH_MOVE:
        if(params[0]){
          loc = new LocationModel(params[0]);
          loc.addNoise(LOG_LOC_NOISE);
          params[0] = loc.toObj();
        }
        break;
      case Actions.MUFO_CREATE:
        if(params[0] && params[0].location){
          mufo = params[0];
          mufo.location.addNoise(LOG_LOC_NOISE);
        }
        break;
      default:
        break;
      }

      // パラメタが1つの時は配列を外す
      let paramData = params;
      if(params && params.length===1){
        paramData = params[0];
      }

      // ログモデルの組み立てと登録
      const logm = new ActionLogModel();
      logm.uid = App.uid;
      logm.auid = App.auid;
      logm.ts = Date.now();
      logm.action = actionName;
      logm.data = paramData;
      dataRef.pushLog(logm);
    });


  }

  // データを開示するためのgetter（参照型は全てコピーして返すこと）


}
