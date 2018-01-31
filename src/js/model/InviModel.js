import MufoModel from './MufoModel';

const ANS_ACCEPT = 'accepted';
const ANS_DENY   = 'denied';
const ANS_CANCEL = 'canceled';

const CAUSE_USER = 'user';
const CAUSE_CLIENT = 'client';
const CAUSE_MUFO = 'mufo';
const CAUSE_SONG = 'song';

export default class InviModel {
  constructor(dataObj) {
    this._data = {

      inviid : null
      ,invited : null
      ,cause : null
      ,mufodata : null
      ,users : null

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
  /** この招待のキー。 @type {string} */
  get inviid() {return this._data.inviid}
  /** 招待先のMuFo。 @type {MufoModel} */
  get mufodata() {return this._data.mufodata}
  /** 招待の理由（定数参照）。 @type {string} */
  get cause() {return this._data.cause}
  /** 招待日時 @type {number} */
  get invited() {return this._data.invited}
  /** 招待ユーザと回答の一覧。取得した値の変更はできません。回答を書き換えたいときはsetUserAnsメソッドを使ってください。 @type {Object} */
  get users() {
    const cp = JSON.parse(JSON.stringify(this._data.users));
    return cp;
  }

  // Setter
  /**
   * @type {string}
   */
  set inviid(value) {
    this._data.inviid = value;
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

  /** 定数値以外を設定した場合無視します。 */
  set cause(value) {
    if(value !== CAUSE_USER && value !== CAUSE_CLIENT && value !== CAUSE_MUFO && value !== CAUSE_SONG){
      console.warn(`invalid value for cause: ${value}`);
      return;
    }
  }

  /**
   * nullまたは正の整数値のみ。0はnullとみなします。
   * @type {number}
   */
  set invited(value) {
    if(!value){
      this._data.invited = null;
      return;
    }
    if (!(value > 0) || Math.floor(value) !== value) { console.warn(`invalid value for invited : ${value}`); return }
    this._data.invited = value;
  }

  /**
   * ユーザ
   */
  set users(value) {
    this._data.users = {};
    if(!value){
      return;
    }

    const uids = Object.keys(value);
    for(let uid of uids){
      const answer  = value[uid]['answer'];
      const ansdate = value[uid]['ansdate'];
      if(answer && (answer !== ANS_ACCEPT && answer !== ANS_DENY && answer !== ANS_CANCEL)){
        console.warn(`invalid answer ${answer} for user ${uid}`);
        continue;
      }
      if(ansdate &&  (!(ansdate > 0) || Math.floor(ansdate) !== ansdate)){
        console.warn(`invalid ansdata ${ansdate} for user ${uid}`);
        continue;
      }
      this._data.users[uid] = {answer,ansdate};
    }
  }


  // Public Methods

  clone() {
    const cp = new InviModel();
    cp._data = JSON.parse(JSON.stringify(this._data));
    return cp;
  }

  toObj() {
    return this.clone()._data;
  }

}
