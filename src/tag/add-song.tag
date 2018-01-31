<add-song>
  <div id="add-song" class="stage-inner scrollable">

    <div class="hdg-1 type-2">
      <svg class="icon">
        <use xlink:href="/img/icons.svg#icon-addsong"></use>
      </svg>
      <h2 class="hdg">ADD SONG</h2>
    </div>

    <form onsubmit={searchSongData}>
      <div id="song-search">
        <div class="song-search-textbox">
          <input type="search" id="add-song-search" value="" onkeyup={searchSongData}>
          <svg class="icon" onclick={searchSongData}>
            <use xlink:href="/img/icons.svg#icon-search"></use>
          </svg>
        </div>
        <div class="result-wrap">
          <virtual each={searchResult in searchResults}>
            <div class="result-song"
              onclick={songSelect}
              data-songCode="{searchResult.trackId}"
              data-songTitle="{searchResult.trackName}"
              data-artistName="{searchResult.artistName}"
              data-songThum="{searchResult.artworkUrl100}"
              data-songPreview="{searchResult.previewUrl}"
              data-songPurchase="{searchResult.trackViewUrl}">
              <div class="jacket">
                <img src="{searchResult.artworkUrl100ssl}" alt="">
              </div>
              <div class="song-detail">
                <div class="title">{searchResult.trackName}</div>
                <div class="artist">{searchResult.artistName}</div>
              </div>
            </div>
          </virtual>
          <p if={noResult} class="text-no-result">NO RESULTS</p>
          <button type="button" class="btn-reselect" onclick={songReSelect}>
            <svg class="icon">
              <use xlink:href="/img/icons.svg#icon-close"></use>
            </svg>
          </button>
        </div>
      </div>
    </form>

    <ul class="btn-list">
      <li><a href={mufoLink} onClick={searchCancel}>CANCEL</a></li>
      <li><a href="{mufoLink}" class={disabled: isdisabled} onClick={addSong}>POST</a></li>
    </ul>

  </div>

  <script>

  /* ログイン画面から遷移した場合、mufoへ搭乗 */
  let url = window.location.href;
  let refPathMufoId = url.split('/add-song/')[1] ? url.split('/add-song/')[1] : '';
  let mufoId;
  if ( refPathMufoId ) {
    console.log('ログインからadd-song:' + refPathMufoId);
    App.trigger( App.actions.MUFO_ENTER, refPathMufoId );
    mufoId = refPathMufoId;
  } else {
    mufoId = App.stores.mufoStore.currentMufo.mufoid;
  }

  /*
    戻り先パスの管理
  */

  // 搭乗中のmufoIDを取得

  // 戻り先パスに設定
  this.mufoLink = '/#/mufo/' + mufoId;

  // ユーザ情報を取得
  const userInfo = App.stores.userStore.currentUser;

  /*
    itunes search apiへのリクエスト
    データの取得からタグへの反映
  */

  // no Resultテキストを非表示
  this.noResult = false;
  // SAVEボタンを非アクティブ化
  this.isdisabled = true;

  // SongMo新規作成
  const song = new App.models.SongModel();
  // apiを叩いた際の戻り値を格納
  this.searchResults = [];
  // 曲情報の同時取得上限数（apiの上限は200）
  const limit = 50;

  let self = this;
  let searchTimerId;
  let xhr;

  this.searchSongData = (e) => {
    e.preventDefault();
    if(searchTimerId){
      window.clearTimeout(searchTimerId);
    }
    this.noResult = false;
    // 選択表示の切り替え
    searchTimerId = setTimeout(() => {
      // 既に選択されていた場合、未選択状態に戻す
      const $wrap = $('#song-search');
      $wrap.removeClass('selected');
      $wrap.find('.result-song').show();
      // 検索結果の表示
      const value = $('#add-song-search').val();
      const str = encodeURI(value.replace(/\s/g, '+'));
      if (value === '') {
        this.searchResults = [];
        this.update();
      } else {
        if (xhr) {
          xhr.abort();
        }
        const path = `https://itunes.apple.com/search?term=${str}&limit=${limit}&country=jp&media=music`;
        xhr = $.ajax({
          cache: false,
          url: path,
          type: 'GET',
          dataType: 'jsonp',
          crossDomain: true
        }).done((data) => {
          // プロキシサーバurlへ切り替え
          this.searchResults = convArtworkToSSL(data.results);
          // 検索結果が0件ならno Resultテキストを非表示
          if (this.searchResults.length == 0) {
            this.noResult = true;
          }
          this.update();
          // 取得データのバリデート
          searchResultValidate();
        }).fail((error) => {
          console.log('search failed')
        });
      }
    }, 500);
  }

  /*
    追加する曲の決定
  */

  this.songSelect = (e) => {
    const $wrap = $('#song-search');
    const $target = $(e.target).closest('.result-song');
    // ビューを選択状態にする
    $wrap.addClass('selected');
    $wrap.find('.result-song').not($target).hide();
    // SAVEボタンをアクティブ化
    this.isdisabled = false;
    this.update();
    // 曲のデータをセット
    song.songcode = $target.attr('data-songCode');
    song.songtitle = $target.attr('data-songTitle');
    song.artistname = $target.attr('data-artistName');
    song.songthum = $target.attr('data-songThum');
    song.songpreview = $target.attr('data-songPreview');
    song.songpurchase = $target.attr('data-songPurchase');
    // ユーザの情報をセット
    song.authoruid = userInfo.uid;
    song.authorname = userInfo.name;
    song.authoravatar = userInfo.avatar;
    // mufoの情報をセット
    song.mufoid = mufoId;
  }

  /*
    選択した曲のキャンセル（バツボタン）
  */

  this.songReSelect = () => {
    // ビューを未選択状態に戻す
    const $wrap = $('#song-search');
    $wrap.removeClass('selected');
    $wrap.find('.result-song').show();
    // SAVEボタンを非アクティブ化
    this.isdisabled = true;
    this.update();
    // セットされた曲のデータを初期化
    song.songcode = null;
    song.songtitle = null;
    song.artistname = null;
    song.songthum = null;
    song.songpreview = null;
    song.songpurchase = null;
    song.authoruid = null;
    song.authorname = null;
    song.authoravatar = null;
    song.mufoid = null;
    song.reaction = 0;
  }

  /*
    キャンセルボタン
  */

  this.searchCancel = () => {
    // 選択した曲のキャンセル
    this.songReSelect();
    // 検索結果を初期化
    this.searchResults = [];
    // no Resultテキストを非表示
    this.noResult = false;
    // SAVEボタンを非アクティブ化
    this.isdisabled = true;
    // 曲を追加せず該当のmufoに戻る
    window.location.href = `/#/mufo/${App.stores.mufoStore.currentMufo.mufoid}`;
  }

  /*
    検索結果のバリデート
  */

  function searchResultValidate () {
    const songArray = $('.result-song');
    let i;
    for(i = 0; i < songArray.length; i++){
      let $target = songArray[i];
      if (
        $target.getAttribute('data-songCode') == null ||
        $target.getAttribute('data-songTitle') == null ||
        $target.getAttribute('data-artistName') == null  ||
        $target.getAttribute('data-songThum') == null  ||
        $target.getAttribute('data-songPreview') == null  ||
        $target.getAttribute('data-songPurchase') ==  null ) {
          $target.style.display = 'none';
      }
    }
  }

  /*
    プロキシサーバurlに変換
  */

  function convArtworkToSSL (results) {
    if (!results || !results.length) {return results}
    results.forEach(function(item) {
      if(item['artworkUrl100']) {
        item['artworkUrl100ssl'] = App.sys.SSL.toSSL(item['artworkUrl100']);
      }
    });
    return results;
  }

  /*
    追加ボタンの挙動
  */

  this.addSong = (e) => {
    e.preventDefault();
    // SAVEボタンが非アクティブならここで終了
    if (this.isdisabled) {
      return;
    }
    // songオブジェクトを送る
    App.trigger(App.actions.MUFO_ADD_SONG, song);
    // 情報を送ってから該当のmufoへ戻る
    window.location.href = $(e.target).closest('a').attr('href');
  }

  </script>

</add-song>
