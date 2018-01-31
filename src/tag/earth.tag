<earth>
  <div id="earth">
    <div id="map"></div>
    <button type="button" class="earth-btn type-1" onClick={moveCurrentLocation}>
      <svg class="icon">
        <use xlink:href="/img/icons.svg#icon-nowlocation"></use>
      </svg>
    </button>
    <button type="button" class="earth-btn type-2" onClick={createMufo}>
      <img src="img/btn-create-mufo.svg">
    </button>
    <div if={noPosInfo} class="earth-no-position-info">
      <svg class="icon">
        <use xlink:href="/img/icons.svg#icon-ufo"></use>
      </svg>
      <p>MuFoで遊ぶには<br><a href="#" onClick={initMap}>位置情報の利用を許可する</a><br>必要があります。</p>
    </div>
    <div id="earth-kidnapping">
      <img class="shape-ellipse" src="/img/kidnapping-effect-1.svg" alt="">
      <div if={alienDetail} class="user-avatar">
        <alien-temp data-alien={alienDetail}></alien-temp>
      </div>
      <div if={!alienDetail} class="no-avatar">
        <img src="img/human.svg" alt="">
      </div>
      <img class="shape-light" src="/img/kidnapping-effect-2.svg" alt="">
      <div class="mufo-kidnapping">
        <mufo-temp data-color={kidnappingMufoColor} data-alien={kidnappingAlienDetail}></mufo-temp>
      </div>
    </div>
    <div id="earth-new-mufo">
      <mufo-temp data-color="0" data-alien="0,0,0,0"></mufo-temp>
    </div>
    <div id="earth-signal">
      <div class="sig1"></div>
      <div class="sig2"></div>
      <div class="sig3"></div>
      <div class="sig4"></div>
      <p>交信中</p>
    </div>
  </div>

  <script>

  // ローカルコントローラ
  const localApp = App.newLocalController();

  this.on('unmount', () => {
    // unmount時にまとめて解除
    localApp.offAll();
  });

  // ユーザ情報を取得
  let user = App.stores.userStore.currentUser;

  /*
    ユーザーのアバターを反映
  */
  if ( user ) {
    this.alienDetail = user.avatar;
    this.update();
  }

  localApp.on(App.events.USER_PROFILE_CHANGED, () => {
    user = App.stores.userStore.currentUser;
    if ( user ) {
      this.alienDetail = user.avatar;
      this.update();
    }
  });

  // マップ管理クラスを代入
  let mapManager = App.views.MapManager;
  // mufo管理クラスを代入
  let floatingMufo = App.views.FloatingMufo;

  // 位置情報が取得できないとき
  this.noPosInfo = false;

  // マップの初期ロード
  this.initMap = (e) => {
    if (e) {
      e.preventDefault();
    }
    // フォーカスされたMufoId
    let focusedMufoId = App.stores.earthStore.focusedMufoId;
    // チュートリアル済かどうか
    let cookieManager = App.views.CookieManager;
    let cookie = cookieManager.getCookie('earthTutorial');
    // チュートリアルが済んでいたら
    if (cookie == 'done') {
      // フォーカスされたMufoがあったら
      if (focusedMufoId != null) {
        console.log('cookieあり、Mufoの位置でマップ生成');
        // Mufoの位置でマップ生成
        this.callMap(App.stores.earthStore.center);
      // フォーカスされたMufoがなかったら
      } else {
        // 現在地を取得
        mapManager.getPos((currentLatLng) => {
          // 取得できた場合
          if (currentLatLng != null) {
            console.log('cookieあり、現在地取得成功、現在地でマップ生成');
            // 現在地でマップ生成
            this.callMap(currentLatLng);
          // 取得できなかった場合
          } else {
            console.log('cookieあり、現在地取れず、初期ロード座標でマップ生成');
            // 初期ロード座標でマップ生成
            this.callMap(mapManager.defaultLatLng);
          }
        });
      }
    // チュートリアルが済んでいなかったら
    } else {
      // フォーカスされたMufoがあったら
      if (focusedMufoId != null) {
        console.log('cookieなし、Mufoの位置でマップ生成');
        // Mufoの位置でマップ生成（以降移動なし）
        this.callMap(App.stores.earthStore.center);
      // フォーカスされたMufoがなかったら
      } else {
        console.log('cookieなし、初期ロード座標でマップ生成');
        // 初期ロード座標でマップ生成（以降現在地が取得できれば現在地へ移動）
        this.callMap(mapManager.defaultLatLng);
      }
    }
  }

  // マップ生成
  this.callMap = (latLng) => {
    mapManager.createMap(latLng, () => {
      // マップ生成が終わったら
      // アニメーション用クラスにmapをセット
      floatingMufo.setMap(mapManager.map);
      // この時点でearthStoreにMufoが登録されていたら
      if (App.stores.earthStore.mufos.length > 0) {
        // floatingMufoクラスに登録されたIdを初期化
        floatingMufo.mufoIdArr = [];
        // MUFO_CHANGEDで取得できなかったmufoを再生成
        floatingMufo.regenerate(App.stores.earthStore.mufos);
      }
      // マップの表示位置の監視開始
      mapManager.map.addListener('idle', () => {
        // 表示範囲変更のアクション
        // 現在表示中の中心点と半径を登録
        App.trigger(App.actions.EARTH_MOVE, mapManager.getCenter(), mapManager.getRadius());
      });
      // mapスケールに応じてmufoサイズを常時調整
      floatingMufo.manageScale();
      this.bindMufoEvent();
    });
  }

  this.on('mount', () => {
    this.initMap();
  });

  /*
    mufo作成ボタン
  */

  this.createMufo = (e) => {
    e.preventDefault();
    if (this.noPosInfo) {
      // mapがまだ表示されていない場合
      this.initMap();
      return;
    }
    // mufo作成アニメーション中に遷移
    $('#earth-new-mufo').addClass('show');
    let animTimer;
    animTimer = setTimeout(() => {
      clearTimeout(animTimer);
      // 【ログインしていない場合】
      let myUid;
      myUid = App.uid;
      if ( myUid === null ) {
        const center = App.stores.earthStore.center;
        window.location.href = `/#/login/create-mufo/${center.lat}/${center.lng}`;
        return;
      }
      // 【ログイン済みの場合】
      window.location.href = '/#/create-mufo';
    }, 1200);
  }

  /*
    現在位置ボタン
  */

  this.moveCurrentLocation = () => {
    // mapが既に表示されている場合
    if (mapManager.mapReady) {
      // 確認ダイアログ画面を表示
      $('#dialog-confirm').addClass('show');
    }
  }

  /*
    表示範囲のMuFoが増減したとき
  */

  localApp.on(App.events.EARTH_MUFOS_CHANGED, (mufos, addedMufos, removedMufos) => {
    // 表示するmufoの更新
    floatingMufo.updateMufos(mufos, addedMufos, removedMufos);
  });

  /*
    MuFoをクリックしたとき
  */

  this.bindMufoEvent = (e) => {
    $('#earth').on('click', '.mufo-floating', (e) => {
      e.preventDefault();
      let mufoId = $(e.target).closest('a').attr('href').split('/#/mufo/')[1];
      // Mufo搭乗イベントをトリガー
      App.trigger(App.actions.MUFO_ENTER, mufoId);
    });
  };

  /*
    搭乗しているMuFoが変更された（クリック直後）とき
  */

  localApp.on(App.events.MUFO_CHANGED, (mufo) => {
    // 搭乗するmufoを取得
    if (mufo && mufo.mufoid) {
      // 表示中の全mufoを星に還す
      floatingMufo.goBackToTheStar();
      // 攫うアニメーションに利用するmufoタグを更新
      this.kidnappingMufoColor = mufo.color;
      this.kidnappingAlienDetail = mufo.authoravatar;
      this.update();
      riot.mount('mufo-temp');
      // 攫うアニメーション開始
      let animTimer;
      $('#earth-kidnapping').addClass('show');
      // 攫うアニメーション中に遷移（ホワイトアウトアニメーション開始）
      animTimer = setTimeout(() => {
        // timerを解除
        clearTimeout(animTimer);
        // mufoへ遷移
        window.location.href = `/#/mufo/${mufo.mufoid}`;
      }, 2500);
    }
  });

  </script>
</earth>
