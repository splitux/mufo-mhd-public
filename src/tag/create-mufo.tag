<create-mufo>
  <div if={isTutorial == false} class="dialog" id="create-tutorial">
    <div class="dialog-inner">
      <h2 if={tutorialStep1} class="dialog-hdg">STEP1</h2>
      <h2 if={tutorialStep2} class="dialog-hdg">STEP2</h2>
      <div class="dialog-thum">
        <img if={tutorialStep1} src="img/create-tutorial-step-1.png" alt="">
        <img if={tutorialStep2} src="img/create-tutorial-step-2.png" alt="">
      </div>
      <div class="dialog-txt large-txt">
        <p if={tutorialStep1}>コノ MuFo ノ <strong>タイトル</strong> ヲ<br>入力セヨ !!</p>
        <p if={tutorialStep2}>タイトル ニ 合ワセテ<br><strong>色</strong> ト <strong>パターン</strong> ヲ選択セヨ !!</p>
      </div>
      <ul class="dialog-btn-list">
        <li>
          <a href="#" onClick={closeTutorial}>
            <svg class="icon type-2">
              <use xlink:href="/img/icons.svg#icon-close"></use>
            </svg>
          </a>
        </li>
        <li if={tutorialStep1}>
          <a href="#" onClick={goNextTutorial}>NEXT</a>
        </li>
        <li if={tutorialStep2}>
          <a href="#" onClick={closeTutorial}>START</a>
        </li>
      </ul>
    </div>
  </div>
  <div id="create-mufo" class="stage-inner scrollable mufo-grad-{mufoInterior.color} mufo-pattern-{mufoInterior.pattern}">
    <div class="mufo-hdg">
      <div class="mufo-hdg-inner">
        <!-- <h2 class="hdg">TITLE</h2> -->
        <input class="hdg" id="create-mufo-title" onInput={validateTitle} type="text" value="" placeholder="タイトル ヲ 入力セヨ !!">
      </div>
    </div>
    <div class="custom-mufo">
      <div class="custom-mufo-inner">
        <p class="custom-mufo-hdg">COLOR</p>
        <ul class="custom-mufo-list-1">
          <li>
            <input type="radio" id="custom-mufo-color-1" value="1" name="custom-mufo-color" onChange={changeMufoBg} checked>
            <label for="custom-mufo-color-1"></label>
          </li>
          <li>
            <input type="radio" id="custom-mufo-color-2" value="2" name="custom-mufo-color" onChange={changeMufoBg}>
            <label for="custom-mufo-color-2"></label>
          </li>
          <li>
            <input type="radio" id="custom-mufo-color-3" value="3" name="custom-mufo-color" onChange={changeMufoBg}>
            <label for="custom-mufo-color-3"></label>
          </li>
          <li>
            <input type="radio" id="custom-mufo-color-4" value="4" name="custom-mufo-color" onChange={changeMufoBg}>
            <label for="custom-mufo-color-4"></label>
          </li>
          <li>
            <input type="radio" id="custom-mufo-color-5" value="5" name="custom-mufo-color" onChange={changeMufoBg}>
            <label for="custom-mufo-color-5"></label>
          </li>
          <li>
            <input type="radio" id="custom-mufo-color-6" value="6" name="custom-mufo-color" onChange={changeMufoBg}>
            <label for="custom-mufo-color-6"></label>
          </li>
        </ul>
      </div>
      <div class="custom-mufo-inner">
        <p class="custom-mufo-hdg">PATTERN</p>
        <ul class="custom-mufo-list-2">
          <li>
            <input type="radio" id="custom-mufo-pattern-1" value="1" name="custom-mufo-pattern" onChange={changeMufoPattern} checked>
            <label for="custom-mufo-pattern-1"></label>
          </li>
          <li>
            <input type="radio" id="custom-mufo-pattern-2" value="2" name="custom-mufo-pattern" onChange={changeMufoPattern}>
            <label for="custom-mufo-pattern-2"></label>
          </li>
          <li>
            <input type="radio" id="custom-mufo-pattern-3" value="3" name="custom-mufo-pattern" onChange={changeMufoPattern}>
            <label for="custom-mufo-pattern-3"></label>
          </li>
          <li>
            <input type="radio" id="custom-mufo-pattern-4" value="4" name="custom-mufo-pattern" onChange={changeMufoPattern}>
            <label for="custom-mufo-pattern-4"></label>
          </li>
          <li>
            <input type="radio" id="custom-mufo-pattern-5" value="5" name="custom-mufo-pattern" onChange={changeMufoPattern}>
            <label for="custom-mufo-pattern-5"></label>
          </li>
          <li>
            <input type="radio" id="custom-mufo-pattern-6" value="6" name="custom-mufo-pattern" onChange={changeMufoPattern}>
            <label for="custom-mufo-pattern-6"></label>
          </li>
        </ul>
      </div>
    </div>
    <div class="mufo-dj-booth">
      <img src="img/dj-booth.svg" alt="">
    </div>
    <ul class="btn-list">
      <li><a href="/#/earth">CANCEL</a></li>
      <li><a href="#" class={disabled: isdisabled} onClick={saveMufo}>SAVE</a></li>
    </ul>
  </div>

  <script>

    // ローカルコントローラ
    const localApp = App.newLocalController();

    this.on('unmount', () => {
      // unmount時にまとめて解除
      localApp.offAll();
    });

    // SAVEボタンを非アクティブ化
    this.isdisabled = true;

    /* ログイン画面から遷移した場合、Mufoの位置取得 */
    let url = window.location.href;
    let center = url.split('/create-mufo/')[1] ? url.split('/create-mufo')[1] : '';
    let loginLatLng;
    if ( center ) {
      loginLatLng = {
        lat: Number(center.split('/')[1]),
        lng: Number(center.split('/')[2])
      };
      console.log( 'ログイン画面からcreate-mufo:' + loginLatLng.lat + '/' + loginLatLng.lng );
    }

    /*
      Mufo作成チュートリアル
    */

    // ユーザーの情報を取得
    const user = App.stores.userStore.currentUser;

    // チュートリアルフラグ
    this.isTutorial = user.ispassedtutorial;

    // 各ステップのフラグ
    this.tutorialStep1 = false;
    this.tutorialStep2 = false;

    // タイトルのバリデート。未入力の場合、SAVEボタンを非活性
    this.validateTitle = (e) => {
      e.preventDefault();
      if ( e.currentTarget.value.length !== 0 ) {
        if( this.isdisabled ) {
          this.isdisabled = false;
        }
      } else {
        if( !this.isdisabled ) {
          this.isdisabled = true;
        }
      }
    }

    // マウント時にフラグを見てチュートリアルを表示
    this.on('mount', () => {
      if (!this.isTutorial) {
        this.tutorialStep1 = true;
        this.update();
        setTimeout(function () {
          $('#create-tutorial').addClass('show');
        }, 500);
      }
    });

    // 次のチュートリアルを表示する
    this.goNextTutorial = (e) => {
      e.preventDefault();
      this.tutorialStep1 = false;
      this.tutorialStep2 = true;
      this.update();
    }

    // チュートリアルを終了して閉じる
    this.closeTutorial = (e) => {
      e.preventDefault();
      $('#create-tutorial').removeClass('show').on('webkitAnimationEnd', function () {
        this.isTutorial = true;
        this.tutorialStep1 = false;
        this.tutorialStep2 = false;
      });
      // // チュートリアルが終了フラグを送る
      user.ispassedtutorial = true;
      App.trigger(App.actions.USER_CHANGE_PROFILE, user, ['ispassedtutorial']);
    }

    /*
      Mufo内装プレビュー
    */

    this.mufoInterior = {
      color: 1,
      pattern: 1
    };

    // 色の変更
    this.changeMufoBg = (e) => {
      this.mufoInterior.color = e.target.value;
    };

    // パターンの変更
    this.changeMufoPattern = (e) => {
      this.mufoInterior.pattern = e.target.value;
    };

    /*
      Mufo作成
    */
    const mufo = new App.models.MufoModel();

    // Mufoの保存
    this.saveMufo = (e) => {
      e.preventDefault();
      // mufo情報をセット
      mufo.title = $('#create-mufo-title').val();
      mufo.color = this.mufoInterior.color|0;
      mufo.pattern = this.mufoInterior.pattern|0;
      mufo.authoruid = user.uid;
      mufo.authorname = user.name;
      mufo.authoravatar = user.avatar;
      if (center) {
        mufo.location = loginLatLng;
        console.error('loginLatLngの値')
      } else {
        mufo.location = App.stores.earthStore.center;
        console.error('earthStore.centerの値')
      }
      // mufo情報を送る
      App.trigger(App.actions.MUFO_CREATE, mufo);
    };

    // mufo作成されたら、mufoに乗る
    localApp.on(App.events.MUFO_CREATED, (mufoid) => {
      App.trigger(App.actions.MUFO_ENTER, mufoid);
    });

    // mufoに乗ったらページ遷移
    localApp.on(App.events.MUFO_ENTERED, (mufoid) => {
      window.location.href = '/#/mufo/' + mufoid;
    });

  </script>
</create-mufo>
