import CustomMarker from '../view/customMarker'

/*
  Map上のMufoを管理するクラス
*/

export default class FloatingMufo extends CustomMarker {

  constructor () {

    super();

    // google mapオブジェクト格納用
    this.googleMap = null;
    // mufoId格納用
    this.mufoIdArr = [];
    // マーカーオブジェクト格納用
    this.makerArr = [];
  }

  setMap (googleMap) {
    this.googleMap = googleMap;
  }

  // 表示されているMUfoの追加・削除のコントロール
  updateMufos (mufos, addedMufos, removedMufos) {
    // 追加するmufoの配列
    let newLen = addedMufos.length;
    // 削除するmufoの配列
    let delLen = removedMufos.length;
    // mufoを追加する
    if (newLen > 0) {
      let i;
      for (i = 0; i < newLen; i = (i + 1) | 0) {
        // クラス内mufoId配列に登録されていなかったら
        if (this.mufoIdArr.indexOf(addedMufos[i].mufoid) == -1) {
          // mufoを生成
          let newMufo = addedMufos[i];
          this.generate(newMufo.color, newMufo.authoravatar, newMufo.mufoid, newMufo.location);
        }
      }
    }
    // mufoを削除する
    if (delLen > 0) {
      let i;
      for (i = 0; i < delLen; i = (i + 1) | 0) {
        // クラス内mufoId配列に登録されていたら
        if (this.mufoIdArr.indexOf(removedMufos[i].mufoid) != -1) {
          // mufoを削除
          this.goBackToTheStar(removedMufos[i].mufoid);
        }
      }
    }
  }

  // mapスケールに応じてmufoのサイズ、行動範囲を返す
  getMufoScale () {
    let mapScale = this.googleMap.getZoom();
    let mufoScale = {
      size: null, // px
      areascale: null // scale
    };
    switch (true) {
      case (mapScale >= 15):
        mufoScale.size = 70;
        mufoScale.areascale = 1;
        break;
      case (mapScale >= 10 && mapScale < 15):
        mufoScale.size = 50;
        mufoScale.areascale = 0.5;
        break;
      case (mapScale < 10):
        mufoScale.size = 30;
        mufoScale.areascale = 0.2;
        break;
      default:
        mufoScale.size = 70;
        mufoScale.areascale = 1;
    }
    return mufoScale;
  }

  // mufoを指定座標位置に生成
  generate (color, avatar, mufoid, location) {
    // google map overlayを作成
    const overlay = new google.maps.OverlayView();
    overlay.setMap(this.googleMap);
    overlay.draw = function () {
      if (!this.ready) {
        this.ready = true;
        google.maps.event.trigger(this, 'ready');
      }
    };
    // mufo作成時のmufoサイズと移動範囲を取得
    let mufoScale = this.getMufoScale();
    // 新規svgマーカーを作成
    const newMarker = new CustomMarker({
      color: color,
      authoravatar: avatar,
      mufoid: mufoid,
      location: new google.maps.LatLng(location.lat, location.lng),
      size: mufoScale.size,
      areascale: mufoScale.areascale
    });
    // マップにマーカーをセット
    newMarker.setMap(this.googleMap);
    // クラス内mufoId配列に登録
    this.mufoIdArr.push(mufoid);
    // マーカーオブジェクトを表示中のmufo配列に登録
    this.makerArr.push(newMarker);
  }

  // mapに戻った時、MUFO_CHANGEDで取得できないmufoを再生成
  regenerate (mufoArr) {
    if (mufoArr.length > 0) {
      let i;
      for (i = 0; i < mufoArr.length; i = (i + 1) | 0) {
        let newMufo = mufoArr[i];
        // クラス内mufoId配列に登録されていなかったら
        if (this.mufoIdArr.indexOf(mufoArr[i].mufoid) == -1) {
          // mufoを再生成
          this.generate(newMufo.color, newMufo.authoravatar, newMufo.mufoid, newMufo.location);
        }
      }
    }
  }

  // 画面上のmufoを削除
  goBackToTheStar (mufoid) {
    // 引数がなければ全削除
    if (!mufoid) {
      // 画面上のすべて削除
      let i;
      for (i = 0; i < this.makerArr.length; i = (i + 1) | 0) {
        // 表示されているマーカーdomを削除
        this.makerArr[i].setMap(null);
        // 最後にクラス内に登録されたidとマーカーを一括削除
        if (i == this.makerArr.length - 1) {
          // クラス内に登録されているmufoIdを削除
          this.mufoIdArr = [];
          // クラス内に登録されているマーカーを削除
          this.makerArr = [];
        }
      }
    // mufoIdが一致するマーカーを削除
    } else {
      let i;
      for (i = 0; i < this.makerArr.length; i = (i + 1) | 0) {
        if (this.makerArr[i].mufoid == mufoid) {
          this.makerArr[i].setMap(null);
          // クラス内mufoId配列から削除
          this.mufoIdArr = this.mufoIdArr.filter((val) => {
            return (val != mufoid);
          });
          // クラス内marker配列から削除
          this.makerArr = this.makerArr.filter((val) => {
            if (val.mufoid != mufoid) {
              return val;
            }
          });
        }
      }
    }
  }

  // mapのzoomスケールが変わったらmufoサイズと移動範囲を調整
  manageScale () {
    this.googleMap.addListener('zoom_changed', () => {
      let mufoScale = this.getMufoScale();
      let i;
      for (i = 0; i < this.makerArr.length; i = (i + 1) | 0) {
        this.makerArr[i].div.style.width = `${mufoScale.size}px`;
        this.makerArr[i].div.style.height = `${mufoScale.size}px`;
        this.makerArr[i].areascale = mufoScale.areascale;
      }
    });
  }

}
