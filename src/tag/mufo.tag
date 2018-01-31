<mufo>
  <div id="fb-root"></div>
  <script>
    (function(d, s, id) {
    let js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = '//connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v2.8';
    fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  </script>

  <div id="mufo" class="stage-inner mufo-grad-{color} mufo-pattern-{pattern} {play:isPlay, no-song:noSong}">
    <div class="mufo-hdg">
      <div class="mufo-hdg-inner">
        <div id="mufo-hdg-title-scroll">
          <div class="scroller">
            <h2 class="hdg" id="scrollable-title">{mufoTitle}</h2>
          </div>
        </div>
      </div>
    </div>

    <div id="visualizer-wrap">
      <canvas id="visualizer"></canvas>
    </div>

    <div id="mufo-player-wrap">
      <mufo-player></mufo-player>
    </div>

    <div class="mufo-dj-booth">
      <img src="img/dj-booth.svg" alt="">
    </div>

    <a class="mufo-btn-add-song {focus:noSong}" onClick={addSong}>
      <img src="img/btn-add-song.svg">
    </a>

    <ul class="mufo-list-sns">
      <li>
        <a href="{ facebookShareUrl }" target="_blank">
          <img src="img/btn-fb.svg" alt="facebookシェア">
        </a>
      </li>
      <li>
        <a href="{ twitterShareUrl }">
          <img src="img/btn-tw.svg" alt="twitterシェア">
        </a>
      </li>
    </ul>

    <div if={!noSong} class="mufo-utility">
      <div class="mufo-song-detail">
        <div class="mufo-song-detail-inner">
          <div class="mufo-song-detail-scroller">
            <p class="mufo-song-detail-title">{songTitle}</p>
            <p class="mufo-song-detail-artist">{artistName}</p>
          </div>
        </div>
      </div>
      <div id="mufo-star-gauge">
        <button class="mufo-star-gauge-btn" type="button" onClick={starPlus}><img src="img/star.svg" alt="Add Star"></button>
        <div class="mufo-star-gauge-inner">
          <div class="mufo-star-gauge-bar">
            <div class={mufo-star-amount:true, full:isGaugefull}></div>
          </div>
          <div class="mufo-star-gauge-number">{reaction}</div>
        </div>
        <div id="star-effect-wrap">
          <canvas id="star-effect"></canvas>
        </div>
      </div>
      <div class="mufo-utility-inner">
        <div class="mufo-utility-avatar">
          <alien-temp data-alien={authorAvatar}></alien-temp>
        </div>
        <a href="https://www.apple.com/jp/itunes/download/" target="_blank" class="mufo-utility-banner">
          <img src="img/banner-itunes.svg" alt="Get it on itunes">
          <p>provided courtesy<br>of iTunes</p>
        </a>
        <a class="mufo-song-purchase" href="{songPurchase}?app=itunes">
          <svg class="icon">
            <use xlink:href="/img/icons.svg#icon-purchase"></use>
          </svg>
          <span>BUY</span>
        </a>
      </div>
    </div>
    <div if={noSong} class="mufo-utility">
      <div class="mufo-no-song">
        <p>「{mufoTitle}」にはまだ音楽がありません。<br>曲を追加してMufoに音楽を流してみましょう！</p>
      </div>
    </div>
  </div>
  <script>

    // ローカルコントローラ
    const localApp = App.newLocalController();

    this.on('unmount', () => {
      // unmount時にまとめて解除
      localApp.offAll();
    });

    /*
      SNSシェアＵＲＬ作成
    */
    this.createShareUrl = () => {
      const shareTitle = `今注目のMuFo「${App.stores.mufoStore.currentMufo.title}」に搭乗しました`;
      const shareUrl = encodeURIComponent (window.location.href);
      this.facebookShareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + shareUrl;
      this.twitterShareUrl = 'http://twitter.com/share?url=' + shareUrl + '&text=' + shareTitle + '&hashtags=Mufo';
    };

    /*
     * ログイン画面から遷移した場合、mufoへ搭乗
     */
    if ( !App.stores.mufoStore.currentMufo) {
      let url = window.location.href;
      let refPathMufoId = url.split('/mufo/')[1] ? url.split('/mufo/')[1] : '';
      App.trigger(App.actions.MUFO_ENTER, refPathMufoId);
    }

    /*
      MuFoへ搭乗後、Mufo、Songデータの反映
    */

    // Mufoデータの反映
    this.updateMufo = () => {
      let mufo = App.stores.mufoStore.currentMufo;
      if (mufo) {
        this.color = mufo.color;
        this.pattern = mufo.pattern;
        this.mufoTitle = mufo.title;
        this.update();
        // タイトルの長さチェック
        this.titleLenCheck();
        // マップに戻った際にどのmufoに戻るのか登録しておく
        App.trigger(App.actions.EARTH_JUMP, mufo.mufoid, 0);
      }
    }

    // リアクション（星）管理用
    let starManager = new App.views.StarManager();

    // リアクション数がmaxかチェックしてクラスを付与
    this.checkGauge = () => {
      if (this.reaction >= starManager.maxNum) {
        this.isGaugefull = true;
      } else {
        this.isGaugefull = false;
      }
      this.update();
    }

    // Songデータの反映
    this.updateSong = (SongModel) => {
      let songArr = App.stores.mufoStore.mufoSongs;
      // 曲がまだ追加されてない場合
      if (songArr.length == 0) {
        this.noSong = true;
      } else {
        this.noSong = false;
      }
      if (SongModel) {
        this.songTitle = SongModel.songtitle;
        this.artistName = SongModel.artistname;
        this.reaction = SongModel.reaction;
        this.songPurchase = SongModel.songpurchase;
        this.authorAvatar = SongModel.authoravatar;
        this.songId = SongModel.songid;
        // 未送信のリアクション数があったら
        if (starManager.isStacking) {
          // 貯めていた数値を送信
          App.trigger(App.actions.MUFO_ADD_REACTION, starManager.songId, starManager.starStack);
        }
        starManager.init(SongModel.reaction, App.sys.SysConfig.maxreactions);
        this.checkGauge();
        this.update();
        riot.mount('alien-temp');
      }
    }

    // 搭乗直後のデータ反映
    this.mufoInit = () => {
      // SNSシェアURL作成
      this.createShareUrl();
      // Mufoデータの反映
      this.updateMufo();
      // Songデータの反映
      const songs = App.stores.mufoStore.mufoSongs || [];
      const initialSong = songs.length ? songs[songs.length-1] : null ;
      this.updateSong(initialSong);
      this.update();
    }

    // MuFoへ搭乗後、Mufoデータの反映
    localApp.on(App.events.MUFO_PREPARED, () => {
      // 搭乗直後のデータ反映
      this.mufoInit();
    });

    /*
      オーディオビジュアライザ
    */

    let audioVisualizer = new App.views.AudioVisualizer();

    this.on('mount', () => {
      // canvasのセットアップ
      audioVisualizer.setCvs();
      starManager.setCvs();
      // マウント前にMUFO_PREPAREDが走ってしまったとき
      if (App.stores.mufoStore.isPrepared) {
        // 搭乗直後のデータ反映
        this.mufoInit();
      }
    });

    /*
      曲追加ボタン
    */
    this.addSong = (e) =>{

      // 【ログインしていない場合】
      let myUid;
      myUid = App.uid;
      if ( myUid === null ) {
        // mufoIDをパラメータとしてログイン画面へ遷移
        window.location.href = `/#/login/add-song/${App.stores.mufoStore.currentMufo.mufoid}`;
        return;
      }

      // 【ログイン済みの場合】
      window.location.href = '/#/add-song';
    }

    /*
      リアクション（星の追加）ボタン
    */

    this.starPlus = (e) => {
      e.preventDefault();
      // 最高値に達していなかったら
      if (this.reaction < starManager.maxNum) {
        // 数値を反映
        this.reaction++;
        this.update();
        // ゲージの長さを反映
        starManager.styleGauge(this.reaction);
        this.checkGauge();
        // エフェクトを出す
        starManager.effect();
        // songIdを登録（）
        // 格納先はriotの変数（this）を使わない
        starManager.songId = this.songId;
        // 最後にボタンを押されてから1秒間押されなければ、
        // それまで貯めた数値をまとめて送る
        starManager.stack((starNum) => {
          App.trigger(App.actions.MUFO_ADD_REACTION, starManager.songId, starNum);
        });
      }
    }

    /*
      リアクションが追加された時
    */

    localApp.on(App.events.MUFO_REACTION_ADDED, (songid, count) => {
      // songIdが同じなら即時反映
      if (this.songId == songid) {
        this.reaction = count;
        starManager.styleGauge(count);
        this.update();
      }
    });

    /*
      プレイヤーの曲が変わったとき
    */

    localApp.on(App.events.MUFO_PLAYSONG_CHANGED, (SongModel) => {
      this.updateSong(SongModel);
    });
    localApp.on(App.events.MUFO_SONG_ADDED, (SongModel) => {
      if(!App.stores.mufoStore.isPrepared){return}// 準備長段階のADDSONGは準備完了時に一括処理するので無視
      if(App.stores.mufoStore.mufoSongs.length === 1){
        //最初の曲なら表示更新
        this.updateSong(SongModel);
      }
    });

    /*
      プレイヤーが再生されたとき
    */

    localApp.on(App.events.MUFO_PLAYSONG_STARTED, () => {
      // オーディオビジュアライザを表示
      audioVisualizer.start();
      this.isPlay = true;
      this.update();
    });

    /*
      プレイヤーが停止されたとき
    */

    localApp.on(App.events.MUFO_PLAYSONG_STOPPED, () => {
      // オーディオビジュアライザを表示
      audioVisualizer.pause();
      this.isPlay = false;
      this.update();
    });

    /*
      mufoタイトルが長かったらスクロールアニメーションさせる
    */

    this.titleLenCheck = () => {
      let $area = $('#mufo-hdg-title-scroll');
      let ttlMargin = 50;
      let areaW = $area.innerWidth() - ttlMargin;
      let $ttl = $('#scrollable-title');
      //架空のcanvas上で文字サイズを測る
      let ttlCvs = document.createElement('canvas');
      let ttlStr = this.mufoTitle;
      if (ttlCvs.getContext) {
        let ttlCtx = ttlCvs.getContext('2d');
        let ttlWPlane = ttlCtx.measureText(ttlStr);
        ttlCtx.fillText(ttlStr, 0, 0);
        ttlCtx.fillText(ttlWPlane.width, 0, 0);
        ttlCtx.font = '16px "Noto Sans CJK JP"';
        let ttlW = ttlCtx.measureText(ttlStr);
        // 表示領域を越えていたらアニメーションクラス付与
        if (ttlW.width > areaW) {
          $area.addClass('scroll-on');
        } else {
          $area.removeClass('scroll-on');
        }
      }
      ttlCvs = null;
    }


  </script>
</mufo>
