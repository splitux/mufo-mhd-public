import FbCustomeRefBase from './FbCustomeRefBase.js';
import ActionLogModel from '../model/ActionLogModel';

const ACTION_LOG_PATH = 'logs/actions';

/**
 * @class FbNotifRef
 * ユーザに対する通知を監視・管理するクラスです
 */
export default class FbActionLogRef extends FbCustomeRefBase {

  constructor(rootRef) {
    super(rootRef);
  }

  pushLog(logm) {
    if(!logm || logm.constructor !== ActionLogModel ){
      console.warn('invalid log model',logm);
      return;
    }
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    const ref = this.rootRef.child(`${ACTION_LOG_PATH}/${y}/${m}/${d}`);
    const key = ref.push().key;
    ref.child(key).set(logm.toObj());
  }

}
