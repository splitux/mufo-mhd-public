<earth-dialog>
  <div id="dialog-invitation" class="dialog">
    <div class="dialog-inner">
      <h2 class="dialog-hdg">INVITATION !</h2>
      <div class="dialog-thum">
        <div class="mufo-svg-container">
          <mufo-temp data-color={inviMufoColor} data-alien={inviMufoAvatar}></mufo-temp>
        </div>
      </div>
      <div class="dialog-txt">
        <p><strong>{inviMufoTitle}</strong>があなたを呼んでいます。</p>
      </div>
      <ul class="dialog-btn-list">
        <li>
          <a href="#" onClick={denyKidnap}>
            <svg class="icon type-2">
              <use xlink:href="/img/icons.svg#icon-close"></use>
            </svg>
          </a>
        </li>
        <li>
          <a href="#" onClick={acceptKidnap}>ACCEPT</a>
        </li>
      </ul>
    </div>
  </div>

  <div id="dialog-confirm" class="dialog">
    <div class="dialog-inner">
      <div class="dialog-txt">
        <p><strong>現在地へワープします</strong><br>よろしいですか？</p>
      </div>
      <ul class="dialog-btn-list">
        <li>
          <a href="#" onClick={closeDialog}>
            <svg class="icon type-2">
              <use xlink:href="/img/icons.svg#icon-close"></use>
            </svg>
          </a>
        </li>
        <li>
          <a href="#" onClick={moveCurrentPosiotion}>OK</a>
        </li>
      </ul>
    </div>
  </div>

  <div id="dialog-tutorial" class="dialog">
    <div class="dialog-inner">
      <h2 class="dialog-hdg">HOW TO PLAY</h2>
      <div class="dialog-thum">
        <img if={tutorialStep == 1} src="img/dialog-tutorial-step-1.png" alt="">
        <img if={tutorialStep == 2} src="img/dialog-tutorial-step-2.png" alt="">
        <img if={tutorialStep == 3} src="img/dialog-tutorial-step-3.png" alt="">
        <img if={tutorialStep == 4} src="img/dialog-tutorial-step-4.png" alt="">
        <img if={tutorialStep == 5} src="img/dialog-tutorial-step-5.png" alt="">
      </div>
      <div class="dialog-txt">
        <p if={tutorialStep == 1}><strong>MuFoとは</strong><br>ユーザー同士が自由にプレイリストを作成し<br>音楽を楽しむための空飛ぶDJブースです</p>
        <p if={tutorialStep == 2}><strong>MuFoに乗りこんでみましょう</strong><br>好きなMuFoをタップすると<br>MuFoがあなたを吸い上げてくれます</p>
        <p if={tutorialStep == 3}><strong>MuFoを増殖させてみましょう</strong><br>新規MuFoボタンをタップすると<br>MuFoを作成して飛ばすことができます</p>
        <p if={tutorialStep == 4}><strong>MuFoを召喚してみましょう</strong><br>端末を振ると遠くのエリアにいるMuFoを<br>呼び出すことができます</p>
        <p if={tutorialStep == 5}><strong>位置情報をONにしてもっと楽しく</strong><br>あなたの周辺エリアが表示され<br>位置情報とリンクした音楽体験が可能です</p>
      </div>
      <p if={tutorialStep == 1} class="dialog-btn"><a href="#" onClick={goNextTutorial}>NEXT</a></p>
      <ul if={tutorialStep != 1} class="dialog-btn-list">
        <li>
          <a href="#" onClick={goBackTutorial}>
            <svg class="icon type-2">
              <use xlink:href="/img/icons.svg#icon-arrow"></use>
            </svg>
          </a>
        </li>
        <li>
          <a href="#" if={tutorialStep != 5} onClick={goNextTutorial}>NEXT</a>
          <a href="#" if={tutorialStep == 5} onClick={tutorialEnd}>START</a>
        </li>
      </ul>
    </div>
  </div>

  <script>
    // 一括解除用にローカルなコントローラを生成
    const locApp = App.newLocalController();
    // シェイクイベントが有効か
    let _isShakeEnabled = false;
    // シェイクイベント取得ライブラリのインスタンスを生成。timeoutを設定して頻繁なイベントの発動を抑止する
    const shake = new App.views.Shake({ timeout: 5000 });
    /*
      クッキーによるチュートリアル、招待表示制御
    */
    let cookieManager = App.views.CookieManager;

    /*
    *  オプションのmountFlagがfalseならマウント解除
    *  このタグ内のイベントは/#/earth内のみで発動
    */

    this.on('mount', () => {
      if (!this.opts.mountFlag) {
        // 親タグを残してこのタグをunmountする
        this.unmount(true);
        // 招待を無効にする
        App.trigger(App.actions.INVI_DISABLE);
      }else{
        // 即unmountしない場合だけ、shakeを有効化する
        this.enableShake();
      }
    });

    this.on('mount', () => {
      // クッキーを取得
      let cookie = cookieManager.getCookie('earthTutorial');
      // 指定したクッキーがなかったら
      if (cookie == null) {
        // チュートリアル中の招待を無効にする
        App.trigger(App.actions.INVI_DISABLE);
        // チュートリアルを表示
        $('#dialog-tutorial').addClass('show');
      }
      // マップ画面でユーザidを持っていたら招待を有効
      let hash = window.location.hash;
      if (App.uid && hash.indexOf('/earth') != -1) {
        // 招待を有効にする
        App.trigger(App.actions.INVI_ENABLE);
      } else {
        // 招待を無効にする
        App.trigger(App.actions.INVI_DISABLE);
      }
      // 初回表示時はログイン完了より前にマウントが呼ばれるため、ログイン成立を検知した時点で招待を有効化する
      locApp.on(App.events.USER_LOGGEDIN, ()=>{App.trigger(App.actions.INVI_ENABLE)});
      locApp.on(App.events.INVI_INVITED, this.onInvited);
    });

    this.on('unmount', () => {
      // locApp.onでで登録した全てのイベントハンドラを解除
      locApp.offAll();
    });

    /**
    * shakeを有効にする。アンマウント時に自動的に無効になります。
    */
    this.enableShake = () => {
      if(_isShakeEnabled){return} //多重起動を防止
      console.log('shake enabled');
      _isShakeEnabled = true;
      shake.start();
      // shakeイベントが発生した場合、招待を要求
      window.addEventListener('shake', this.onShaked, false);
      this.on('unmount', () => {
        console.log('shake disabled');
        _isShakeEnabled = false;
        shake.stop();
        window.removeEventListener('shake', this.onShaked, false);
      });

    }

    /*
      招待が通知された場合、連れ去りダイアログを表示
    */
    this.onInvited = (invi) => {
      // ダイアログ表示中は招待を無効にする
      App.trigger(App.actions.INVI_DISABLE);
      // 交信中アニメーション停止
      $('#earth-signal').removeClass('show');
      // 招待したmufoのデータを反映
      this.inviMufoId = invi.mufodata._data.mufoid;
      this.inviMufoColor = invi.mufodata._data.color;
      this.inviMufoAvatar = invi.mufodata._data.authoravatar;
      this.inviMufoTitle = invi.mufodata._data.title;
      this.update();
      riot.mount('mufo-temp');
      // 招待Idを取得
      this.inviId = invi.inviid;
      // 招待ダイアログを表示
      $('#dialog-invitation').addClass('show');
    }

  this.onShaked = () => {
    if(!App.stores.inviStore.isEnabled){return} //招待機能が有効になっていない
    App.trigger(App.actions.INVI_REQUEST);
    // 交信中アニメーション開始
    $('#earth-signal').addClass('show');
  }

    /*
      ダイアログを閉じる
    */

    this.closeDialog = (e) => {
      if (e) {
        e.preventDefault();
      }
      // 招待を有効にする
      App.trigger(App.actions.INVI_ENABLE);
      // ダイアログを閉じる
      $('.dialog').removeClass('show');
    }

    /*
      拐われることを許可する
    */

    this.acceptKidnap = (e) => {
      e.preventDefault();
      // mufoに搭乗
      App.trigger(App.actions.MUFO_ENTER, this.inviMufoId);
      // 招待に応答する（許可）
      App.trigger(App.actions.INVI_ANSWER, this.inviId, 'accept');
      // mufoのデータロード後、dialogを非表示
      locApp.on( App.events.MUFO_PREPARED, () => {
        // ダイアログを閉じる
        $('.dialog').removeClass('show');
      });
    }

    /*
      拐われることを拒否する
    */

    this.denyKidnap = (e) => {
      e.preventDefault();
      // 招待に応答する（拒否）
      App.trigger(App.actions.INVI_ANSWER, this.inviId, 'deny');
      // 招待を再び有効にする
      App.trigger(App.actions.INVI_ENABLE);
      // ダイアログを閉じる
      $('.dialog').removeClass('show');
    }

    /*
      チュートリアルダイアログ
    */

    this.tutorialStep = 1;

     // 次のチュートリアルを表示する
    this.goNextTutorial = (e) => {
      e.preventDefault();
      switch (this.tutorialStep) {
        case 1:
          this.tutorialStep = 2;
          break;
        case 2:
          this.tutorialStep = 3;
          break;
        case 3:
          this.tutorialStep = 4;
          break;
        case 4:
          this.tutorialStep = 5;
          break;
      }
      this.update();
    }

    // 前のチュートリアルを表示する
    this.goBackTutorial = (e) => {
      e.preventDefault();
      switch (this.tutorialStep) {
        case 2:
          this.tutorialStep = 1;
          break;
          case 3:
          this.tutorialStep = 2;
          break;
          case 4:
          this.tutorialStep = 3;
          break;
          case 5:
          this.tutorialStep = 4;
          break;
      }
      this.update();
    }

    /*
      チュートリアル完了、完了後の位置処理
    */

    let mapManager = App.views.MapManager;

    this.tutorialEnd = (e) => {
      if (e) {
        e.preventDefault();
      }
      // クッキーをセット（以降チュートリアルを表示させない）
      cookieManager.setCookie('earthTutorial', 'done', 365);

      let focusedMufoId = App.stores.earthStore.focusedMufoId;
      // フォーカスされたmufoがなかったら
      if (focusedMufoId == null) {
        // 現在位置を取得
        mapManager.getPos((currentLatLng) => {
          // 取得できた場合
          // 取得できなかったら何もしない
          if (currentLatLng != null) {
            console.log('現在地取得成功、現在位置周辺に移動');
            // 現在位置周辺に移動
            mapManager.moveLocation(currentLatLng);
            // 表示範囲変更のアクション
            App.trigger(App.actions.EARTH_MOVE, mapManager.getCenter(), mapManager.getRadius());
          } else {
            console.log('現在地取れず、移動なし');
          }
        });
      // フォーカスされたmufoがあったら
      } else {
        mapManager.getPos((currentLatLng) => {
          console.log('現在地取得要求のみ、移動なし');
        });
      }
      // 確認ダイアログ表示中は招待を無効にする
      App.trigger(App.actions.INVI_DISABLE);
      // ダイアログを閉じる
      this.closeDialog();
    }

    /*
      現在地に移動する確認ダイアログ
    */

    this.moveCurrentPosiotion = (e) => {
      e.preventDefault();
      // 確認ダイアログ表示中は招待を無効にする
      App.trigger(App.actions.INVI_DISABLE);
      // 現在位置周辺の地図を表示する
      mapManager.getPos((currentLatLng) => {
        // 取得できた場合
        if (currentLatLng != null) {
          console.log('現在地取得成功、現在地付近へ移動');
          // 現在地付近へ移動
          mapManager.moveLocation(currentLatLng);
          // 表示範囲変更のアクション
          App.trigger(App.actions.EARTH_MOVE, mapManager.getCenter(), mapManager.getRadius());
        // 取得できなかった場合
        } else {
          console.log('現在地取れず、移動なし');
        }
      });
      // ダイアログを閉じる
      this.closeDialog();
    }

  </script>

</earth-dialog>
