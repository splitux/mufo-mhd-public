<login>
  <div id="login" class="stage-inner">
    <div class="login-inner">
      <h2 class="login-hdg">LOGIN WITH</h2>
      <ul class="login-list">
        <li>
          <a href="#" onClick={googleLogin}>
            <svg class="icon">
              <use xlink:href="/img/icons.svg#icon-google"></use>
            </svg>
          </a>
        </li>
        <li>
          <a href="#" onClick={facebookLogin}>
            <svg class="icon">
              <use xlink:href="/img/icons.svg#icon-facebook"></use>
            </svg>
          </a>
        </li>
        <li>
          <a href="#" onClick={twitterLogin}>
            <svg class="icon">
              <use xlink:href="/img/icons.svg#icon-twitter"></use>
            </svg>
          </a>
        </li>
      </ul>
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
      各ログインボタンの挙動
    */

    this.googleLogin = (e) => {
      e.preventDefault();
      App.trigger(App.actions.USER_LOGIN,'google');
    }

    this.facebookLogin = (e) => {
      e.preventDefault();
      App.trigger(App.actions.USER_LOGIN, 'facebook');
    }

    this.twitterLogin = (e) => {
      e.preventDefault();
      App.trigger(App.actions.USER_LOGIN, 'twitter');
    }

    /*
      ログイン時の処理
    */
    localApp.on(App.events.USER_LOGGEDIN, () => {

      // 遷移元ＵＲＬ取得
      let url = window.location.href;
      let refPath = url.split('/login')[1] ? url.split('/login')[1] : '';

      // 【初回】  プロフィール編集なし ⇒ 初回ログインと判定
      if ( App.stores.userStore.currentUser.avatar === null ){
        window.location.href = '/#/prof-edit' + refPath;
        return;
      }

      // 【2回目以降】遷移元のページへ移動
      if ( refPath ) {
        window.location.href = '/#' + refPath;
      } else {
        // リファラがない場合、earthへ遷移
        window.location.href = '/#/earth';
      }

    });


  </script>
</login>
