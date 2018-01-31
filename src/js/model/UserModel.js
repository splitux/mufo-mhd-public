/**
 * ユーザのデータを表すモデルです。
 * 不正な値は設定できないよう代入時にチェックします。したがって、プロパティから読み出したデータはnullでない限り、
 * 妥当な形式であることが保証されます。
 */

export default class UserModel {
  constructor(dataObj) {
    this._data = {

      uid: null
      , name: null
      , avatar: null
      , isinited: false
      , ispassedtutorial: false
      , registdate: null
      , logindate: null
      , activedate: null

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

  /** ユーザID @type {string} */
  get uid() { return this._data.uid }
  /** ユーザ名 @type {string} */
  get name() { return this._data.name }
  /** アバターパターン:"n,n,n,n"形式の文字列。 @type {string} */
  get avatar() { return this._data.avatar }
  /** 規約同意済みか @type {boolean} */
  get isinited() { return this._data.isinited }
  /** チュートリアルクリア済みか @type {boolean} */
  get ispassedtutorial() { return this._data.ispassedtutorial }
  /** ユーザ登録日時のタイムスタンプ値 @type {number} */
  get registdate() { return this._data.registdate }
  /** 最終ログイン日時のタイムスタンプ値 @type {number} */
  get logindate() { return this._data.logindate }
  /** 最終アクセス日時のタイムスタンプ値 @type {number} */
  get activedate() { return this._data.activedate }


  // Setter

  /** 未設定の場合に限り変更可 @type {string} */
  set uid(value) {
    if (this._data.uid || !value) { console.warn(`invalid value for uid ${value}`); return }
    this._data.uid = value.toString();
  }
  /** @type {string} */
  set name(value) {
    this._data.name = value ? value.toString() : null;
  }
  /**  @type {string} */
  set avatar(value) {
    if (value) {
      if (!value.toString().match(/^[1-4],[1-5],[1-5],[1-5]$/)) { console.warn(`invalid value for avatar ${value}`); return }
    }
    this._data.avatar = value ? value.toString() : null;
  }
  /** false->trueの変更のみ可 @type {boolean} */
  set isinited(value) {
    if (this._data.isinited && !value) { console.warn(`invalid value for isinited ${value}`); return }
    this._data.isinited = this._data.isinited || !!value;
  }
  /** false->trueの変更のみ可 @type {boolean} */
  set ispassedtutorial(value) {
    if (this._data.ispassedtutorial && !value) { console.warn(`invalid value for ispassedtutorial ${value}`); return }
    this._data.ispassedtutorial = this._data.ispassedtutorial || !!value;
  }
  /** @type {number} */
  set registdate(value) {
    if (!(value > 0)) { console.warn(`invalid value for registdate ${value}`); return }
    this._data.registdate = value;
  }
  /** @type {number} */
  set logindate(value) {
    if (!(value > 0)) { console.warn(`invalid value for logindate ${value}`); return }
    this._data.logindate = value;
  }
  /** @type {number} */
  set activedate(value) {
    if (!(value > 0)) { console.warn(`invalid value for activedate ${value}`); return }
    this._data.activedate = value;
  }

  // Public メソッド

  clone() {
    const cp = new UserModel();
    cp._data = JSON.parse(JSON.stringify(this._data));
    return cp;
  }

  toObj() {
    return this.clone()._data;
  }

}
