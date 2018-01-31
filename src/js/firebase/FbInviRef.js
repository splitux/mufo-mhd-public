import FbCustomeRefBase from './FbCustomeRefBase.js';
import InviModel from '../model/InviModel';

const USER_INVI_PATH = 'index/user-invis/';
const INVI_DATA_PATH = 'data/invis/';
const REQ_DATA_PATH  = 'data/invireqs/';

const ANS_ACCEPT = 'accept';
const ANS_DENY   = 'deny';
const ANS_CANCEL = 'cancel';

/**
 * @class FbInviRef
 * MuFoへの招待を管理するクラスです
 */
export default class FbInviRef extends FbCustomeRefBase {

  constructor(rootRef) {
    super(rootRef);
    this._defineCallback('invited'); // 招待された
    this._uid;
  }

  /**
   * 招待を監視するユーザーを設定する。
   * @param {string} uid
   */
  setUser(uid) {
    if(uid === this._uid){return}
    this._uid = null;
    this._handlers.removeAll(); // 既存の監視をクリア
    if (!uid){return}

    this._uid = uid;
    const onval = (snap)=>{
      const inviIndex = snap.val();
      if(!inviIndex || !inviIndex.inviid){return}
      const inviid = inviIndex.inviid;
      const inviRef = this.rootRef.child(`${INVI_DATA_PATH}/${inviid}`);
      inviRef.once('value').then((snap)=>{
        const inviModel = new InviModel(snap.val());
        this._trigger('invited',inviModel);
      });
    };
    this._handlers.regist(`${USER_INVI_PATH}/${uid}`, 'value', onval);

  }

  reqInvi() {
    if(!this._uid){return}
    const reqid = this.rootRef.child(`${REQ_DATA_PATH}`).push().key;
    this.rootRef.child(`${REQ_DATA_PATH}/${reqid}`).update({
       uid : this._uid
      ,requested : Date.now()
    });
  }

  ansInvi(inviid, uid, answer) {
    if(answer !== ANS_ACCEPT && answer !== ANS_DENY && answer !== ANS_CANCEL){
      throw `invalid answer : ${answer}`;
    }

    const inviRef = this.rootRef.child(`${INVI_DATA_PATH}/${inviid}`);
    inviRef.once('value').then((snap)=>{
      const invi = snap.val();
      if(!invi){throw `no invitation for inviid : ${inviid}`}
      if(!invi.users[uid]){throw `this invitation is not for uid ${uid}`}

      const updates = {};
      // 回答したらインデックスからは削除
      updates[`${USER_INVI_PATH}/${uid}`] = null;
      // 自身の回答を通知データ本体に追加
      updates[`${INVI_DATA_PATH}/${inviid}/users/${uid}`] = {
        answer,
        answered : Date.now()
      };

      this.rootRef.update(updates);
    });

  }


}
