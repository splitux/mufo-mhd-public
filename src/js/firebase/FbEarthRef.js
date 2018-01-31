

import FbCustomeRefBase from './FbCustomeRefBase.js';
import FbGeoqueryRef from './FbGeoqueryRef';
import MufoModel from '../model/MufoModel';

const mufoMainPath = 'data/mufos';
const mufoLocationPath = 'index/mufo-locations';

export default class FbSFbEarthRef extends FbCustomeRefBase {
  constructor() {
    super();

    // リストの変更時に通知する
    this._defineCallback('mufo_added');
    this._defineCallback('mufo_removed');
    this._defineCallback('mufo_removed_all');
    this._defineCallback('area_changed');

    this._geoRef = new FbGeoqueryRef(this.rootRef, mufoLocationPath, mufoMainPath);
    this._geoRef.on('child_added', (snap, location, dist) => {
      const mufoData = snap.val();
      if(mufoData){
        this._trigger('mufo_added', new MufoModel(mufoData), location, dist);
      }
    });
    this._geoRef.on('child_removed', (key) => {
      this._trigger('mufo_removed', key);
    });
    this._geoRef.on('canceled', () => {
      this._trigger('mufo_removed_all');
    });
  }


  /**
   * 表示領域を変更します。
   * この変更により、MuFoの一覧が変更される場合があります
   * トリガするイベント：area_changed（同期）,mufo_removed_all（同期。キャンセル時）
   * @param {Object{lat,lng}} center 中心座標。nullを渡すと表示範囲なしとみなします
   * @param {number} radius 表示範囲
   */
  changeViewArea(center, radius) {
    const validCenter = center;
    if (!validCenter) {
      this._geoRef.cancel();
      this._trigger('mufo_removed_all');
      this._trigger('area_changed', null, 0);
      return;
    }
    this._geoRef.changeLocation(validCenter, radius);
    this._trigger('area_changed', validCenter, radius);
  }

  /**
   * 指定したMuFoの位置に表示領域を変更します
   * トリガするイベント：area_changed（同期）
   * @param {string} mufoid
   * @param {number} radius
   */
  jumpToMufo(mufoid, radius) {
    const mufoOuterRef = this.rootRef.child(`${mufoMainPath}/${mufoid}`);
    mufoOuterRef.once('value', (snap) => {
      const mufoOuter = snap.val();
      const location = mufoOuter.location;
      this.changeViewArea(location, radius);
    });
  }

}
