
/**
 * 地図上の座標を表すためのモデルです。
 * 座標として不正な緯度・軽度は設定できません。
 * 初期値は(0,0)です。
 */

const wrapNumber = (val,min,max,isBottomIncluded)=>{
  const len = max-min;
  const dist = val-min;
  const zeroValue = isBottomIncluded ? min : max;
  return (dist%len)===0?zeroValue : ((dist<0? max : min) + (dist%len));
}


export default class LocationModel {
  constructor(dataObj) {
    this._data = {
      lng: 0
      , lat: 0

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

  /** @type {number} 経度。 */
  get lng() { return this._data.lng }
  /** @type {number} 緯度。 */
  get lat() { return this._data.lat }


  /** -180 〜 180の間のみ設定可。それ以外は無視します。
   * @type {number}
   */
  set lng(value) {
    if(!value && value !== 0){
      console.warn(`invalid value for lng : ${value}`);
    }
    this._data.lng = wrapNumber(value,-180,180,false);
  }

  /** -90 〜 90の間のみ設定可。それ以外は無視します。
   * @type {number}
   */
  set lat(value) {
    if (!(value >= -90 && value <= 90)) {
      console.warn(`invalid value for lat : ${value}`);
      return;
    }
    this._data.lat = value;
  }

  // Public メソッド
  clone() {
    const cp = new LocationModel();
    cp._data = JSON.parse(JSON.stringify(this._data));
    return cp;
  }

  toObj() {
    return this.clone()._data;
  }

  /**
   * 現在設定されている緯度経度に指定された範囲内の誤差を与え、位置情報を不正確にします。
   * 但し、緯度経度のそれぞれについて、与えられる誤差は1度未満になるよう調整されます。
   * （従って高緯度地域では指定された範囲の最大値よりもかなり小さな誤差しか与えられない場合があります）
   * 計算は赤道半径に基づき、地球を真球と見做した場合の概算です。
   * @param {number} rangeKm Km単位。1000未満の正の実数を指定。lng,latそれぞれについて±rangeKm/2の範囲でランダムに増減させます。
   */
  addNoise(rangeKm) {
    if(!rangeKm){throw 'rangeKm is required'}
    if(!(rangeKm > 0 && rangeKm < 1000)){throw 'invalid rangeKm. valid: 0 < rangeKm < 1000'}
    const angle2rad = (angle)=>{return angle * Math.PI / 180}
    const scale = Math.cos(angle2rad(Math.abs(this.lat)));
    const EARTH_RADIUS = 6378.137; // 赤道半径Km
    const UNIT_LENGTH = EARTH_RADIUS*2*Math.PI/360 //緯度1度、または赤道における経度1度の長さ
    const MAX_ERR = 1.0; // 緯度経度の誤差の最大値
    const latErr = Math.min(MAX_ERR, (Math.random()-0.5) * (rangeKm/UNIT_LENGTH)); // 緯度誤差（度）
    const lngErr = Math.min(MAX_ERR, (Math.random()-0.5) * (rangeKm/(UNIT_LENGTH*scale))); // 経度誤差（度）
    let latNew = this.lat + latErr;
    let lngNew = this.lng + lngErr;
    if(latNew > 90 || latNew < -90){
      latNew = (latNew < 0 ? -180:180)-latNew; // 極を回り込んで反対側
      lngNew += 180; // 経度も反転させる（正規化はsetterでやってくれるので単純に+180でよい）
    }
    this.lat = latNew;
    this.lng = lngNew;
  }

}
