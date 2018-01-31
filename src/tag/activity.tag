<activity>
  <div id="activity">
    <div class="activity-inner scrollable">
      <virtual each={item in items}>
        <a href="#" data-mufoId={item.mufodata._data.mufoid} onClick={kidnap} class="activity-link">
          <div class="activity-thum">
            <div if={item.type == 'addsong'} class="mufo-svg-container">
              <mufo-temp data-color="{item.mufodata._data.color}" data-alien="{item.mufodata._data.authoravatar}"></mufo-temp>
            </div>
            <div if={item.type == 'addreaction'} class="mufo-svg-container">
              <img src="{item.songdata._data.songthumssl}" alt="{item.songdata._data.songtitle}">
            </div>
          </div>
          <p if={item.type == 'addsong'} class="activity-txt">
            <span>「<strong>{item.mufodata._data.title}</strong>」に{item.mufodata._data.songcount}曲が登録されました。</span>
          </p>
          <p if={item.type == 'addreaction'} class="activity-txt">
            <span>「<strong>{item.mufodata._data.title}</strong>」の曲「<strong>{item.songdata._data.songtitle}</strong>」に{item.songdata._data.reaction}個のスターが集まりました。</span>
          </p>
        </a>
      </virtual>
      <p if={noNotif} class="activity-no-notif">通知はまだありません。</p>
    </div>
  </div>

  <script>

    // ローカルコントローラ
    const localApp = App.newLocalController();

    this.on('unmount', () => {
      // unmount時にまとめて解除
      localApp.offAll();
    });

    // ログイン時
    localApp.on(App.events.USER_LOGGEDIN, () => {
      // UIDをセットする
      App.trigger(App.actions.NOTIF_WATCH_USER, App.uid);
    });

    // ログアウト時
    localApp.on(App.events.USER_LOGGEDOUT, () => {
      // UIDをクリアする
      App.trigger(App.actions.NOTIF_WATCH_USER, null);
    });

    // ジャケット画像のSSL化
    function convArtworkToSSL (results) {
      if (!results || !results.length) {return results}
      results.forEach(function(item) {
        if(item.songdata._data.songthum) {
          item.songdata._data.songthumssl = App.sys.SSL.toSSL(item.songdata._data.songthum);
        }
      });
      return results;
    }

    // 通知全件が変更された時
    localApp.on(App.events.NOTIF_CHANGED, (arr) => {
      // 通知がなければメッセージを表示
      if (arr.length == 0) {
        this.noNotif = true;
      } else {
        this.noNotif = false;
      }
      this.items = convArtworkToSSL(arr);
      this.update();
    });

    // マップにもどって連れ去りアニメーション
    this.kidnap = (e) => {
      e.preventDefault();
      let mufoId = $(e.target).closest('a').attr('data-mufoId');
      // mufoに搭乗
      App.trigger(App.actions.MUFO_ENTER, mufoId);
    }

  </script>
</activity>
