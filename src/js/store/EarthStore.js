import Actions from '../action/AppActions';
import FbEarthRef from '../firebase/FbEarthRef';
import StoreBase from './StoreBase';
import LocationModel from '../model/LocationModel';
import SysConfig from '../sys/SysConfig';

export default class EarthStore extends StoreBase {
  constructor() {
    super();

    // ストアのデータ
    this._data = {
      center: {
        lat: 0
        , lng: 0
      }
      , mufos: []
      , omittedMufos : {} // mufoid -> mufo
      , radius: 1
      , focusedMufoId: null
      , maxMufoCount: 50
    };

    // 初期設定をシステムから取得
    this._data.maxMufoCount = SysConfig.maxmufovisible;

    // データソースを初期化
    const dataRef = new FbEarthRef();
    this._dataRef = dataRef;

    // データを操作するためのユーティリティメソッド
    const removeMufoFromData = (mufoid) => {
      const mufos = this._data.mufos;
      for (let i = mufos.length - 1; i >= 0; i--) {
        if (mufos[i].mufoid === mufoid) {
          return mufos.splice(i, 1)[0];
        }
      }
    }

    // データソースのイベント
    dataRef.on('area_changed', (location, radius) => {
      this._data.center.lat = location.lat;
      this._data.center.lng = location.lng;
      this._data.radius = radius;
      this.triggerEvent(App.events.EARTH_MOVED, { center: this.center, radius: this.radius });
    });
    dataRef.on('mufo_removed_all', () => {
      const removedMufos = this.mufos;
      this._data.mufos = [];
      this._data.omittedMufos = {};
      this.triggerEvent(App.events.EARTH_MUFOS_CHANGED, this.mufos, [], removedMufos);
    });
    dataRef.on('mufo_removed', (key) => {
      // 削除されたMuFoが表示MuFoのリストにあれば削除した上で通知する
      // 無い場合、省略されたMuFoのリストにあればここから削除する。この場合は通知はしない
      const removedMufo = removeMufoFromData(key);
      if(!removedMufo){
        if(this._data.omittedMufos[key]){
          delete this._data.omittedMufos[key];
        }else{
          console.log(`no mufo found in store to mufo_removed : ${key}`);
        }
      }else{
        this.triggerEvent(App.events.EARTH_MUFOS_CHANGED, this.mufos,[] , [removedMufo]);
      }
    });
    dataRef.on('mufo_added', (mufo) => {
      // 表示上限数未満ならリストに追加して通知
      // 上限数を超えるなら省略リストに追加して通知はしない
      if(this._data.mufos.length < this._data.maxMufoCount){
        this._data.mufos.push(mufo);
        this.triggerEvent(App.events.EARTH_MUFOS_CHANGED, this.mufos, [mufo.clone()], []);
      }else{
        this._data.omittedMufos[mufo.mufoid] = mufo;
      }
    });


    // 以下、受信したい（自分が処理できる）イベントを登録 //

    this.on(App.actions.EARTH_MOVE, (center, radius) => {
      if(!center || center.lat===undefined || center.lng===undefined){return}
      const locModel = (center.constructor === LocationModel) ? center : new LocationModel(center);
      this._data.center = locModel.toObj();
      this._data.radius = radius;
      dataRef.changeViewArea(this._data.center , radius); // -> area_changed
    });

    this.on(Actions.EARTH_JUMP, (mufoId, radius) => {
      this._data.focusedMufoId = mufoId;
      this._dataRef.jumpToMufo(mufoId, radius); // -> area_changed
    });

  }

  // データを開示するためのgetter（参照型は全てコピーして返すこと）

  get center() {
    return { lat: this._data.center.lat, lng: this._data.center.lng };
  }
  get radius() {
    return this._data.radius;
  }

  get mufos() {
    const mfs = [];
    const org = this._data.mufos;
    for(let mufo of org){
      mfs.push(mufo.clone());
    }
    return mfs;
  }

  get focusedMufoId() {
    return this._data.focusedMufoId;
  }


}
