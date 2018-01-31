import FbCustomeRefBase from './FbCustomeRefBase.js';
import UserModel from '../model/UserModel';

const USER_PATH = 'data/users';
const ACTIVE_PATH = 'index/active-users';

/**
 * @class FbUserRef
 * ユーザ情報の参照・更新を行うクラスです。
 * 任意のuidを指定してメソッドを呼び出せますが、更新系の処理は自分自身以外を指定しても権限エラーで拒否されます。
 * また、参照系の処理にも未ログイン状態では利用できないものがあるので注意してください。
 */
export default class FbUserRef extends FbCustomeRefBase {

  constructor(rootRef) {
    super(rootRef);
    this._defineCallback('changed');
  }

  watchUser(uid) {
    console.log('start user watch', uid);
    this._handlers.removeAll();
    if (!uid) {
      this._trigger('changed', null);
      return;
    }
    this._handlers.regist(`${USER_PATH}/${uid}`, 'value', (snap) => {
      this._trigger('changed', new UserModel(snap.val()));
    });
  }

  /**
   * 指定したユーザの情報をまとめて登録/更新します。
   * このメソッドで登録/更新できるのはログインユーザ自身の情報のみです。
   * フィールドごとに更新の可否や更新できる条件が異なります。
   * 更新できない要求を行った場合、firebaseのDBアクセスはエラーとなり、
   * 全てのフィールドが更新されません。
   * @param {UserModel} userModel
   * @param {Array[string]} fields userModelの中で登録/更新したいプロパティの名前
   */
  setUser(userModel, fields, callback) {
    const updates = {};
    const uid = userModel.uid;
    if (!fields || !fields.length) { return }
    if (!uid) { return }

    for (let key of fields) {
      updates[key] = userModel[key];
    }

    this.rootRef.child(`${USER_PATH}/${uid}`).update(updates).then(() => {
      console.log('user updated', userModel, fields);
      if (callback) { callback() }
    });

  }

  /**
   * ユーザを新規に登録します。uidとregistdate,logindateのみ設定され、
   * その他は設定されません。
   * このメソッドは、初回ログイン時にユーザデータが未作成である場合に呼び出すことを期待しています。
   * @param {string} uid
   */
  createUser(uid, callback) {
    const um = new UserModel();
    um.uid = uid;
    um.registdate = Date.now();
    um.logindate = Date.now();
    this.setUser(um, ['uid', 'registdate', 'logindate'], callback);
  }

  getUserOnce(uid, callback, createIfNotExists) {
    this.rootRef.child(`${USER_PATH}/${uid}`).once('value', (snap) => {

      const val = snap.val() || {};
      if (!val.uid && createIfNotExists) {
        // 新規作成 作成完了後、もう一度同じメソッドをコールして再取得
        console.log(`userb ${uid} is not exists. create new user`);
        this.createUser(uid, () => { this.getUserOnce(uid, callback, false) });
        return;
      }

      const um = new UserModel(val);
      if (callback) { callback(um) }

    }, (err) => {
      console.warn(err);
    });
  }

  /**
   * ユーザの最終アクセス日時を更新します。ログインユーザ自身についてのみ有効です。
   * @param {string} uid
   */
  updateActived(uid) {
    const ref = this.rootRef.child(`${ACTIVE_PATH}/${uid}`);
    ref.update({actived: Date.now()});
  }
}
