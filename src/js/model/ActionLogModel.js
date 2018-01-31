
export default class ActionLogModel {
  constructor(dataObj) {
    this._data = {

      ts : 0
      ,uid : null
      ,auid : null
      ,action : null
      ,data : null

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

  /** ログ日時 @type {number} */
  get ts() {return this._data.ts}
  /** UID @type {string} */
  get uid() {return this._data.uid}
  /** AUID @type {string} */
  get auid() {return this._data.auid}
  /** Action @type {string} */
  get action() {return this._data.action}
  /** パラメータ @type {Object} */
  get data() {
    const cp = JSON.parse(JSON.stringify(this._data.data));
    return cp;
  }


  /**
   * nullまたは正の整数値のみ。0はnullとみなします。
   * @type {number}
   */
  set ts(value) {
    if(!value){
      this._data.invited = null;
      return;
    }
    if (!(value > 0) || Math.floor(value) !== value) { console.warn(`invalid value for ts : ${value}`); return }
    this._data.ts = value;
  }

  set uid(value){
    this._data.uid = value;
  }
  set auid(value){
    this._data.auid = value;
  }
  set action(value){
    this._data.action = value;
  }
  set data(value){
    this._data.data = JSON.parse(JSON.stringify(value));
  }


  // Public Methods

  clone() {
    const cp = new ActionLogModel();
    cp._data = JSON.parse(JSON.stringify(this._data));
    return cp;
  }

  toObj() {
    return this.clone()._data;
  }

}
