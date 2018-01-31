/*
  Map全般の挙動を管理するクラス
*/

export default class MapManager {
  constructor () {
    // google mapオブジェクト
    this.map = null;
    // mapが準備できているかどうかのフラグを変更
    this.mapReady = false;
    // mapのオプション
    this.opts = null;
    this.defaultLatLng = {
      lat: 43.0686606,
      lng: 141.3485666
    }
  }

  // ユーザの位置を取得、コールバックを返す
  getPos (callback) {
    navigator.geolocation.getCurrentPosition((position) => {
      let latLng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      callback (latLng);
    }, (err) => {
      // 位置情報の取得に失敗した場合
      callback (null);
      switch (err.code) {
        case 1:
          console.error('位置情報の利用が許可されていません');
          break;
        case 2:
          console.error('デバイスの位置が判定できません');
          break;
        case 3:
          console.error('タイムアウトしました');
          break;
      }
    });
  }

  // マップを作成する
  createMap (latLng, callback) {
    // マップのスタイル
    const earthStyle = [
      {
        'featureType': 'water',
        'elementType': 'geometry',
        'stylers': [{'color': '#193341'}]
      },{
        'featureType': 'landscape',
        'elementType': 'geometry',
        'stylers': [{'color': '#2c5a71'}]
      },{
        'featureType': 'road',
        'elementType': 'geometry',
        'stylers': [
          {'color': '#29768a'},
          {'lightness': -37}
        ]
      },{
        'featureType': 'poi',
        'elementType': 'geometry',
        'stylers': [{'color': '#406d80'}]
      },{
        'featureType': 'transit',
        'elementType': 'geometry',
        'stylers': [{'color': '#406d80'}]
      },{
        'elementType': 'labels.text.stroke',
        'stylers': [
          {'visibility': 'on'},
          {'color': '#3e606f'},
          {'weight': 2},
          {'gamma': 0.84}
        ]
      },{
        'elementType': 'labels.text.fill',
        'stylers': [{'color': '#ffffff'}]
      },{
        'featureType': 'administrative',
        'elementType': 'geometry',
        'stylers': [
          {'weight': 0.6},
          {'color': '#1a3541'}
        ]
      },{
        'elementType': 'labels.icon',
        'stylers': [{'visibility': 'off'}]
      },{
        'featureType': 'poi.park',
        'elementType': 'geometry',
        'stylers': [{'color': '#2c5a71'}]
      }
    ];

    const mapStyleOpts = {
      name: 'EarthMap'
    };

    // マップオブジェクトの生成
    this.map = new google.maps.Map(document.getElementById('map'));

    // マップオプション
    this.opts = {
      // ズームの値は暫定
      zoom: 17,
      // マップの中心を現在位置に合わせる
      center: new google.maps.LatLng(latLng.lat, latLng.lng),
      // デフォルトのUIを非表示にする
      disableDefaultUI: true,
      // 誤ってズームしないようにダブルタップによるズームを無効
      disableDoubleClickZoom: true,
      //マップタイプの指定
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'earthMap']
      }
    };
    // マップにオプションを適用
    this.map.setOptions(this.opts);
    // mapTypeIdの割り当て
    const earthMapType = new google.maps.StyledMapType(earthStyle, mapStyleOpts);
    this.map.mapTypes.set('earthMap', earthMapType);
    this.map.setMapTypeId('earthMap');

    // マップが準備できたら
    this.map.addListener('projection_changed', () => {
      // mapが準備できているかどうかのフラグを変更
      this.mapReady = true;
      // コールバックを返す
      callback();
    });
  }

  // 表示中のエリアの中心地点座標を返す
  getCenter () {
    let latLng = {
      lat: this.map.getCenter().lat(),
      lng: this.map.getCenter().lng()
    }
    return latLng;
  }

  // 表示中のエリアの半径を返す
  getRadius () {
    // 表示領域の北東の緯度経度を取得
    let bounds = this.map.getBounds();
    let latLngNE = bounds.getNorthEast();
    // 表示中のエリアの中心地点座標
    let center = this.getCenter();
    // 2点間の距離を取得（メートル単位）
    let distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(latLngNE.lat(), latLngNE.lng()),
      new google.maps.LatLng(center.lat, center.lng),
    );
    // km（小数点第一位まで）で返す
    return Math.ceil(distance / 100) / 10;
  }

  // 指定座標のエリアを表示させる
  moveLocation (latLng) {
    this.map.setCenter(new google.maps.LatLng(latLng.lat,latLng.lng));
  }

  // ユーザの現在位置付近に移動する
  moveCurrentLocation () {
    this.getPos((latLng) => {
      if (latLng != null) {
        this.map.setCenter(new google.maps.LatLng(latLng.lat,latLng.lng));
      }
    });
  }

}
