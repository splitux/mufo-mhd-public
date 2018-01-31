import LocationModel from './LocationModel';

/**
 * MuFoのデータを表すモデルです。
 * 不正な値は設定できないよう代入時にチェックします。したがって、プロパティから読み出したデータはnullでない限り、
 * 妥当な形式であることが保証されます。
 */
export default class MufoModel {
  /**
   * MufoModelのインスタンスを作ります。
   * @param {Object} dataObj 初期値
   */
  constructor(dataObj) {
    this._data = {
      mufoid: null
      , title: null
      , color: 0
      , pattern: 0
      , location: null
      , authoruid: null
      , authorname: null
      , authoravatar: null
      , created: 0
      , modified: 0
      , songcount: 0
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

  /** MuFoのID @type {number}  */
  get mufoid() { return this._data.mufoid }
  /** MuFoのタイトル @type {string} */
  get title() { return this._data.title }
  /** MuFoの外装/内装色。@type {number} */
  get color() { return this._data.color }
  /** MuFoの内装パターン。 @type {number} */
  get pattern() { return this._data.pattern }
  /** MuFoの位置。@type {LocationModel} */
  get location() { return this._data.location }
  /** 投稿者uid。 @type {string} */
  get authoruid() { return this._data.authoruid }
  /** 投稿者name。 @type {string} */
  get authorname() { return this._data.authorname }
  /** 投稿者avatar。 @type {string} */
  get authoravatar() { return this._data.authoravatar }
  /** 作成日時のタイムスタンプ値。@type {number}  */
  get created() { return this._data.created }
  /** 更新日時のタイムスタンプ値。@type {number}  */
  get modified() { return this._data.modified }
  /** MuFoの曲数。@type {number} */
  get songcount() { return this._data.songcount }

  // Setter

  /**
   * mufoidをセットします。既に値が入っている場合、変更は無視されます。
   * @type {string}
   */
  set mufoid(value) {
    if (this._data.mufoid) { return }
    if (!value) { return }
    this._data.mufoid = value.toString();
  }
  /**
   * @type {string}
   */
  set title(value) {
    this._data.title = value;
  }
  /**
   * 正の整数のみ
   * @type {number}
   */
  set color(value) {
    if (!(value > 0) || Math.floor(value) !== value) { console.warn(`invalid value for color : ${value}`); return }
    this._data.color = value;
  }
  /**
   * 正の整数のみ
   * @type {number}
   */
  set pattern(value) {
    if (!(value > 0) || Math.floor(value) !== value) { console.warn(`invalid value for pattern : ${value}`); return }
    this._data.pattern = value;
  }
  /**
   * null代入可
   * @type {LocationModel}
   */
  set location(value) {
    if (!value) { this._data.location = null; return }
    const locObj = (value.constructor === LocationModel) ? value.clone() : new LocationModel(value);
    this._data.location = locObj;
  }
  /**
   * null代入可
   * @type {string}
   */
  set authoruid(value) {
    this._data.authoruid = value;
  }
  /**
   * null代入可
   * @type {string}
   */
  set authorname(value) {
    this._data.authorname = value;
  }
  /**
   * null代入可
   * @type {string}
   */
  set authoravatar(value) {
    if (value) {
      if (!value.toString().match(/^[1-4],[1-5],[1-5],[1-5]$/)) { console.warn(`invalid value for authoravatar ${value}`); return }
    }
    this._data.authoravatar = value ? value.toString() : null;
  }
  /**
     * 正の整数のみ
     * @type {number}
     */
  set created(value) {
    if (!(value > 0) || Math.floor(value) !== value) { console.warn(`invalid value for created : ${value}`); return }
    this._data.created = value;
  }
  /**
   * 正の整数のみ
   * @type {number}
   */
  set modified(value) {
    if (!(value > 0) || Math.floor(value) !== value) { console.warn(`invalid value for modified : ${value}`); return }
    this._data.modified = value;
  }
  /**
   * 正の整数のみ
   * @type {number}
   */
  set songcount(value) {
    if (!(value > 0) || Math.floor(value) !== value) { console.warn(`invalid value for songcount : ${value}`); return }
    this._data.songcount = value;
  }

  // Public メソッド
  clone() {
    const cp = new MufoModel();
    cp._data = JSON.parse(JSON.stringify(this._data));
    cp.location = this.location ? this.location.clone() : null;
    return cp;
  }

  toObj() {
    return this.clone()._data;
  }

}
