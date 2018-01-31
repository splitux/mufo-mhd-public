
import GeoFire from 'geofire';
import FbCustomeRefBase from './FbCustomeRefBase.js';

export default class FbGeoqueryRef extends FbCustomeRefBase {
  constructor(rootRef, geoPath, dataPath) {
    super(rootRef);
    this._geoQuery = null;
    this._geoPath = geoPath;
    this._dataPath = dataPath;

    this._defineCallback('child_added');
    this._defineCallback('child_removed');
    this._defineCallback('canceled');
  }

  /**
   * 検索の中心点となる位置情報を変更します。
   * @param centerLoc{Object}  {lat,lng}形式の位置情報
   * @param radiusKm{number}  検索範囲[km]
   */
  changeLocation(centerLoc, radiusKm) {
    if (!centerLoc || centerLoc.lat === null || centerLoc.lat === undefined || centerLoc.lng === null || centerLoc.lng === undefined) {
      console.warn('invalid location :', centerLoc);
      return;
    }

    if (this._geoQuery) {
      // GeoQueryオブジェクトがあるなら、位置のみ更新
      this._geoQuery.updateCriteria({
        center: [centerLoc.lat, centerLoc.lng]
        , radius: radiusKm
      });
    } else {
      const geoFire = new GeoFire(this.rootRef.child(this._geoPath));
      const geoQuery = geoFire.query({
        center: [centerLoc.lat, centerLoc.lng]
        , radius: radiusKm
      });
      geoQuery.on('key_entered', (key, location, distance) => {
        // データの参照を作成
        const dPath = `${this._dataPath}/${key}`;
        const dRef = this.rootRef.child(dPath);
        const onVal = (snap) => {
          this._trigger('child_added', snap, location, distance);
        }
        dRef.once('value', onVal);
      });
      geoQuery.on('key_exited', (key, location, distance) => {
        this._trigger('child_removed', key, location, distance);
      });


      this._geoQuery = geoQuery;
    }
  }

  cancel() {
    if (this._geoQuery) {
      this._geoQuery.cancel();
      this._geoQuery = null;
      this._trigger('canceled');
    }
  }

}
