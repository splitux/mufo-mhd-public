<heading>
  <header if={headerVisible == true} id="header" class={show-btn: btnsVisible}>
    <h1 class="logo"><img src="img/logo.svg" alt=""></h1>
    <a if={backBtnVisible == false} href="#" class="btn-header btn-left" onClick={toggleMenu}>
      <svg if={menuVisible == false} class="icon type-1">
        <use xlink:href="/img/icons.svg#icon-menu"></use>
      </svg>
      <svg if={menuVisible == true} class="icon type-2">
        <use xlink:href="/img/icons.svg#icon-close"></use>
      </svg>
    </a>
    <a if={backBtnVisible == true} href="#" class="btn-header btn-left" onClick={switchLink}>
      <svg class="icon type-3">
        <use xlink:href="/img/icons.svg#icon-back"></use>
      </svg>
    </a>
    <a if={activityBtnVisible == true} href="#" class="btn-header btn-right" onClick={toggleActivity}>
      <svg if={activityVisible == false} class="icon type-1">
        <use xlink:href="/img/icons.svg#icon-ufo"></use>
      </svg>
      <svg if={activityVisible == true} class="icon type-2">
        <use xlink:href="/img/icons.svg#icon-close"></use>
      </svg>
      <div if={notifCount > 0} class="noif-count">{notifCount}</div>
    </a>
    <a if={isBeforeLogin == true} href="/#/login" class="btn-header btn-right">
      <svg class="icon type-3">
        <use xlink:href="/img/icons.svg#icon-login"></use>
      </svg>
    </a>
  </header>

  <script>

    // ローカルコントローラ
    const localApp = App.newLocalController();

    this.on('unmount', () => {
      // unmount時にまとめて解除
      localApp.offAll();
    });

    let user = App.stores.userStore.currentUser;
    if (user !== null) {
      if ( user.avatar === null || !user.isinited ) {
        // 【未利用規約同意、未プロフィール編集】
        window.location.href = '/#/prof-edit';
      }
    }

    // ボタンだし分け用ハッシュ
    let hash = window.location.hash;

    /*
      招待の有効無効制御
    */

    this.switchInvi = () => {
      if (this.activityVisible || this.menuVisible) {
        // 招待を無効にする
        App.trigger(App.actions.INVI_DISABLE);
      } else {
        // 招待を有効にする
        App.trigger(App.actions.INVI_ENABLE);
      }
    };



    /*
      ヘッダー、左右ボタン
    */

    // ヘッダー表示フラグ
    this.headerVisible = true;

    // 各ボタンの表示・非表示ステータス
    this.btnsVisible = true;

    /*
      右ボタン
    */

    // 右ボタンの表示・非表示ステータス
    this.activityBtnVisible = true;

    // コンテンツの表示・非表示ステータス
    this.activityVisible = false;

    /*
      左ボタン
    */

    // 左ボタンの表示・非表示ステータス
    this.backBtnVisible = false;

    // メニューコンテンツの表示・非表示
    this.menuVisible = false;

    // アクティビティコンテンツの表示・非表示
    this.toggleActivity = (e) => {
      e.preventDefault();
      if (this.activityVisible == true) {
        // 非表示
        this.activityVisible = false;
        this.switchInvi();
        $('#activity').removeClass('show');
      } else {
        // 表示
        this.activityVisible = true;
        $('#activity').addClass('show');
        // 通知全件を要求する
        App.trigger(App.actions.NOTIF_REQUEST);
        // 全ての通知を既読にする
        App.trigger(App.actions.NOTIF_MARK_OPENED);
        // メニューが開いていたら閉じる
        this.menuVisible = false;
        this.switchInvi();
        $('#menu').removeClass('show');
      }
      this.update();
    }

    /*
      未読通知
    */

    // 未読通知数
    this.notifCount = 0;

    // 未読通知数が変化したとき
    localApp.on(App.events.NOTIF_COUNT_CHANGED, (count) => {
      // 未読通知数を更新
      this.notifCount = count;
      this.update();
    });

    /*
      左ボタン
    */

    // 左ボタンの表示・非表示ステータス
    this.backBtnVisible = false;

    // メニューコンテンツの表示・非表示
    this.menuVisible = false;

    // ボタンの種類の出し分け
    this.switchBtns = () => {
      user = App.stores.userStore.currentUser;
      // ログイン後の場合
      if (user !== null) {
        if (hash.indexOf('/sorry') !== -1) {
          // ヘッダーごと非表示
          this.headerVisible = false;
          this.btnsVisible = false;
        } else if (hash.indexOf('/earth') !== -1) {
          this.headerVisible = true;
          this.btnsVisible = true;
          // 【左ボタン】メニューのトグル
          this.backBtnVisible = false;
          // メニューを隠しておく
          this.menuVisible = false;
          // 【右ボタン】通知パネルのトグル
          this.activityBtnVisible = true;
          // 通知パネルを隠しておく
          this.activityVisible = false;
          // ログインボタンを非表示
          this.isBeforeLogin = false;
        } else if (hash.indexOf('/login') !== -1) {
          // ヘッダーのみ表示
          this.headerVisible = true;
          this.btnsVisible = false;
        } else if (hash.indexOf('/create-mufo') !== -1) {
          this.headerVisible = true;
          this.btnsVisible = true;
          // 【左ボタン】戻る（→earth）
          this.backBtnVisible = true;
          // 【右ボタン】非表示
          this.activityBtnVisible = false;
        } else if (hash.indexOf('/add-song') !== -1) {
          this.headerVisible = true;
          this.btnsVisible = true;
          // 【左ボタン】戻る（→mufo）
          this.backBtnVisible = true;
          // 【右ボタン】非表示
          this.activityBtnVisible = false;
        } else if (hash.indexOf('/mufo/') !== -1) {
          this.headerVisible = true;
          this.btnsVisible = true;
          // 【左ボタン】戻る（→mufo）
          this.backBtnVisible = true;
          // 【右ボタン】非表示
          this.activityBtnVisible = false;
        } else if (hash.indexOf('/tos') !== -1) {
          // 初回プロフ入力、規約同意まではボタン非表示
          if (!user.avatar || !user.isinited) {
            // ヘッダーのみ表示、ボタン類を全て非表示
            this.headerVisible = true;
            this.btnsVisible = false;
          } else {
            this.headerVisible = true;
            this.btnsVisible = true;
            // 【左ボタン】戻る（→mufo）
            this.backBtnVisible = true;
            // 【右ボタン】非表示
            this.activityBtnVisible = false;
          }
        } else if (hash.indexOf('/prof-edit') !== -1) {
          // 初回プロフ入力、規約同意まではボタン非表示
          if (!user.avatar || !user.isinited) {
            // ヘッダーのみ表示、ボタン類を全て非表示
            this.headerVisible = true;
            this.btnsVisible = false;
          } else {
            this.headerVisible = true;
            this.btnsVisible = true;
            // 【左ボタン】戻る（→mufo）
            this.backBtnVisible = true;
            // 【右ボタン】非表示
            this.activityBtnVisible = false;
          }
        }
      // ログイン前の場合
      } else {
        if (hash.indexOf('/sorry') !== -1) {
          // ヘッダーごと非表示
          this.headerVisible = false;
          this.btnsVisible = false;
        } else if (hash.indexOf('/earth') !== -1) {
          this.headerVisible = true;
          this.btnsVisible = true;
          // 【左ボタン】非表示（暫定でnullで非表示）
          this.backBtnVisible = null;
          // 【右ボタン】ログインボタン
          this.isBeforeLogin = true;
          // ログインボタンを表示
        } else if (hash.indexOf('/login') !== -1) {
          // ヘッダーのみ表示
          this.headerVisible = true;
          this.btnsVisible = false;
        } else if (hash.indexOf('/mufo/') !== -1) {
          this.headerVisible = true;
          this.btnsVisible = true;
          // 【左ボタン】戻る（→mufo）
          this.backBtnVisible = true;
          // 【右ボタン】非表示
          this.activityBtnVisible = false;
        }
      }
      // マップ画面以外では戻るボタンのみを表示する
      if (hash.indexOf('/earth') == -1) {
        this.backBtnVisible = true;
        // ログインボタンを非表示
        this.isBeforeLogin = false;
        // メニューを閉じる
        this.menuVisible = false;
        $('#menu').removeClass('show');
        $('#activity').removeClass('show');
      }
      this.update();
    };

    // メニューボタンのトグル機能
    this.toggleMenu = (e) => {
      e.preventDefault();
      if (this.menuVisible == true) {
        // メニューを閉じる
        this.menuVisible = false;
        this.switchInvi();
        $('#menu').removeClass('show');
      } else {
        this.menuVisible = true;
        $('#menu').addClass('show');
        // アクティビティが開いていたら閉じる
        this.activityVisible = false;
        this.switchInvi();
        $('#activity').removeClass('show');
      }
      this.update();
    };

    // マウント時にボタンを切り替え
    this.on('mount', () => {
      // ボタン類の切り替え
      this.switchBtns();
    })

    // ハッシュ変更時
    window.onhashchange = () => {
      // ハッシュ更新
      hash = window.location.hash;
      // ボタン類の切り替え
      this.switchBtns();
    }

    // 戻るボタンのリンク先管理
    this.switchLink = (e) => {
      e.preventDefault();
      if (hash.indexOf('/add-song') !== -1) {
        // 曲追加画面の場合、該当のmufoに戻る
        window.location.href = `/#/mufo/${App.stores.mufoStore.currentMufo.mufoid}`;
      } else {
        // デフォルトではマップ画面に帰還
        window.location.href = '/#/earth';
        // Mufoから降りる
        App.trigger(App.actions.MUFO_EXIT);
      }
    }

    // ログインした場合
    localApp.on(App.events.USER_LOGGEDIN, () => {
      // ボタン類の切り替え
      this.switchBtns();
    });

    // 通知パネルから搭乗対策
    // MuFoに搭乗した場合、通知パネルを非表示
    localApp.on(App.events.MUFO_ENTERED, () => {
      // 通知パネル非表示
      this.activityVisible = false;
      $('#activity').removeClass('show');
      this.update();
    });

  </script>
</heading>
