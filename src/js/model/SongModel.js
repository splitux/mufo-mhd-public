
export default class SongModel {
  constructor(dataObj) {
    this._data = {

      mufoid : null
      ,songid : null
      ,authoruid : null
      ,authorname : null
      ,authoravatar : null
      ,created : 0
      ,reaction : 0
      ,songcode : 0
      ,artistname : null
      ,songtitle : null
      ,songpreview : null
      ,songpurchase : null
      ,songthum : null

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
  /** この曲が収められているMuFoのID。 @type {string} */
  get mufoid() {return this._data.mufoid}
  /** この曲のID。 @type {string} */
  get songid() {return this._data.songid}
  /** 投稿者uid。 @type {string} */
  get authoruid() { return this._data.authoruid }
  /** 投稿者name。 @type {string} */
  get authorname() { return this._data.authorname }
  /** 投稿者avatar。 @type {string} */
  get authoravatar() { return this._data.authoravatar }
  /** 作成日時のタイムスタンプ値。@type {number}  */
  get created() { return this._data.created }
  /** リアクション数。@type {number}  */
  get reaction() { return this._data.reaction }
  /** 曲コード。@type {number}  */
  get songcode() { return this._data.songcode }
  /** アーティスト名。 @type {string} */
  get artistname() { return this._data.artistname }
  /** 曲名。 @type {string} */
  get songtitle() { return this._data.songtitle }
  /** 試聴ソースURL。 @type {string} */
  get songpreview() { return this._data.songpreview }
  /** 曲購入URL。 @type {string} */
  get songpurchase() { return this._data.songpurchase }
  /** 曲サムネURL。 @type {string} */
  get songthum() { return this._data.songthum }


  // Setter
  /**
   * @type {string}
   */
  set mufoid(value) {
    this._data.mufoid = value;
  }
  /**
   * @type {string}
   */
  set songid(value) {
    this._data.songid = value;
  }
  /**
   * @type {string}
   */
  set authoruid(value) {
    this._data.authoruid = value;
  }
  /**
   * @type {string}
   */
  set authorname(value) {
    this._data.authorname = value;
  }
  /**
   * @type {string} /^[1-4],[1-5],[1-5],[1-5]$/
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
  set reaction(value) {
    if (!(value >= 0) || Math.floor(value) !== value) { console.warn(`invalid value for reaction : ${value}`); return }
    this._data.reaction = value;
  }
  /**
   * @type {string}
   */
  set songcode(value) {
    this._data.songcode = value;
  }
  /**
   * @type {string}
   */
  set artistname(value) {
    this._data.artistname = value;
  }
  /**
   * @type {string}
   */
  set songtitle(value) {
    this._data.songtitle = value;
  }
  /**
   * @type {string}
   */
  set songpreview(value) {
    this._data.songpreview = value;
  }
  /**
   * @type {string}
   */
  set songpurchase(value) {
    this._data.songpurchase = value;
  }
  /**
   * @type {string}
   */
  set songthum(value) {
    this._data.songthum = value;
  }


  // Public Methods
  clone() {
    const cp = new SongModel();
    cp._data = JSON.parse(JSON.stringify(this._data));
    return cp;
  }

  toObj() {
    return this.clone()._data;
  }

}
