import MufoModel from './MufoModel';
import SongModel from './SongModel';


const TYPE_ADDSONG = 'addsong';
const TYPE_ADDREACTION = 'addreaction';

export default class NotifModel {
  constructor(dataObj) {
    this._data = {

      notifkey : null
      ,mufodata : null
      ,songdata : null
      ,type : null
      ,uid : null
      ,updated : null
      ,opened : null

    }
    Object.seal(this); //誤代入を防止するためsealする

    // 初期値が指定されていたら、設定
    if (dataObj) {
      Object.keys(this._data).forEach((key) => {
        if (dataObj[key] !== undefined) {
          this[key] = dataObj[key];
        }
      });
    }

  }

  // Getter
  /** この通知のキー。 @type {string} */
  get notifkey() {return this._data.notifkey}
  /** この通知に関連するMuFo。 @type {MufoModel} */
  get mufodata() {return this._data.mufodata}
  /** この通知に関連する曲。 @type {SongModel} */
  get songdata() {return this._data.songdata}
  /** この通知の種類。[addsong|addreaction] @type {string} */
  get type() {return this._data.type}
  /** この通知の対象ユーザー。通常クライアント側では自分のUID以外は入りません @type {string} */
  get uid() {return this._data.uid}
  /** この通知の最終更新日のタイムスタンプ。
   * 同じMuFoに対する曲追加や同じ曲に対するリアクションの追加があると、
   * 同一の通知の最終更新日が更新されます。 @type {number} */
  get updated() {return this._data.updated}
  /** この通知の開封日。
   * 同じMuFoに対する曲追加や同じ曲に対するリアクションの追加があると、
   * この通知の開封日もnullに戻ります。 @type {number} */
  get opened() {return this._data.opened}



  // Setter
  /**
   * @type {string}
   */
  set notifkey(value) {
    if(value && (value.startsWith(TYPE_ADDSONG) || value.startsWith(TYPE_ADDREACTION)) ){
      this._data.notifkey = value;
    }else{
      console.warn(`invalid notifkey: ${value}`);
    }
  }
  /**
   * @type {MufoModel}
   */
  set mufodata(value) {
    if(!value){
      this._data.mufodata = null;
      return;
    }
    if(value.constructor === MufoModel){
      this._data.mufodata = value.clone();
    }else if(value['mufoid']){
      this._data.mufodata = new MufoModel(value);
    }else{
      console.warn(`invalid mufo data: ${value}`);
    }
  }
  /**
   * @type {SongModel}
   */
  set songdata(value) {
    if(!value){
      this._data.songdata = null;
      return;
    }
    if(value.constructor === SongModel){
      this._data.songdata = value.clone();
    }else if(value['songid']){
      this._data.songdata = new SongModel(value);
    }else{
      console.warn(`invalid song data: ${value}`);
    }
  }

  /**
   * @type {string}
   */
  set type(value) {
    if(value && (value === TYPE_ADDSONG || value === TYPE_ADDREACTION) ){
      this._data.type = value;
    }else{
      console.warn(`invalid notif type: ${value}`);
    }
  }

  /**
   * @type {string}
   */
  set uid(value) {
    this._data.uid = value;
  }

  /**
   * nullまたは正の整数値のみ。0はnullとみなします。
   * @type {number}
   */
  set updated(value) {
    if(!value){
      this._data.updated = null;
      return;
    }
    if (!(value > 0) || Math.floor(value) !== value) { console.warn(`invalid value for opened : ${value}`); return }
    this._data.updated = value;
  }

  /**
   * nullまたは正の整数値のみ。0はnullとみなします。
   * @type {number}
   */
  set opened(value) {
    if(!value){
      this._data.opened = null;
      return;
    }
    if (!(value > 0) || Math.floor(value) !== value) { console.warn(`invalid value for opened : ${value}`); return }
    this._data.opened = value;
  }




  // Public Methods
  clone() {
    const cp = new NotifModel();
    cp._data = JSON.parse(JSON.stringify(this._data));
    return cp;
  }

  toObj() {
    return this.clone()._data;
  }

}
