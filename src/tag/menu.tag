<menu>
  <div id="menu">
    <div class="menu-inner">

      <div class="menu-user-alien">
        <div class="alien-svg">
          <alien-temp data-alien={alienDetail}></alien-temp>
        </div>
        <p class="alien-name">{alienName}</p>
      </div>

      <ul class="menu-btn-list">
        <li>
          <a href="/#/prof-edit" class="btn type-1">
            <svg class="icon">
              <use xlink:href="/img/icons.svg#icon-alien"></use>
            </svg>
            <span>プロフィール編集</span>
          </a>
        </li>
        <li>
          <a href="#" class="btn type-4" onClick={logout}>
            <svg class="icon">
              <use xlink:href="/img/icons.svg#icon-logout"></use>
            </svg>
            <span>ログアウト</span>
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

    // ユーザ情報を取得
    let user = App.stores.userStore.currentUser;

    /*
      ユーザーのアバターを反映
    */
    if ( user ) {
      this.alienDetail = user.avatar;
      this.alienName = user.name;
      this.update();
    }

    localApp.on(App.events.USER_PROFILE_CHANGED, () => {
      user = App.stores.userStore.currentUser;
      if ( user ) {
        this.alienDetail = user.avatar;
        this.alienName = user.name;
        this.update();
      }
    });

    /*
      ログアウト
    */

    this.logout = (e) => {
      e.preventDefault();
      // ログアウトする
      App.trigger(App.actions.USER_LOGOUT);
      // ログイン画面へ遷移
      window.location.href = '/#/login';
    };
  </script>
</menu>
