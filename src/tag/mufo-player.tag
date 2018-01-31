<mufo-player>

<div id="player-stage">
  <div class="player-bg-1">
    <img src="img/bg-player-1.svg" alt="">
  </div>
  <div class="player-stage-inner">
    <div class="player-box" each={ songs }>
      <div class="player-box-plane"><div class="player-box-cont"><img src={ songthum }></div></div>
    </div>
  </div>
  <div class={player-controller:true, play:isPlay, pause:isPause}>
    <img class="icon start" src="img/player-play.svg" alt="play">
    <img class="icon stop" src="img/player-stop.svg" alt="stop">
  </div>
  <div class="player-bg-2">
    <img src="img/bg-player-2.svg" alt="">
  </div>
  <div class={player-loading: true, show: isLoadingNowsong}>
    <img src="img/loading.svg" alt="">
  </div>
</div>



  <script>
    // 案マウント時に一括でイベント解除するためのコントローラ
    this.localCont = new App.sys.LocalController(App);

    this.isPlay = false;
    this.isPause = false;
    this.isLoadingNowsong = false; //現在の再生対象曲がロード待ち状態か

    /// ユーティリティメソッド ///
    const getIndexBySong = (song)=>{
      if(!song || !song.songid){return -1}
      for(let i=0; i<this.songs.length; i++){
        if(this.songs[i] && this.songs[i].songid === song.songid){
          return i;
        }
      }
    }
    const getSongByIndex = (index)=>{
      return this.songs[index];
    }
    const isSameSong = (s1,s2)=>{
      if(!s1 || !s2){return false}
      return s1.songid === s2.songid;
    }

    /**
     *  ストアからロード完了イベントを受信した時
     **/
    const onMufoPrepared = ()=>{
      if(!App.stores.mufoStore.isPrepared){return}

      // 初期追加
      const songs = App.stores.mufoStore.mufoSongs.reverse();
      for(let song of songs){
        const songObj = song.toObj(); //riotはgetter/setterをプロパティとして認識しないので、生のObjectに変換する
        // 曲とジャケット画像をSSL版に置換
        songObj.songpreview = App.sys.SSL.toSSL(songObj.songpreview);
        songObj.songthum = App.sys.SSL.toSSL(songObj.songthum);
        this.songs.push(songObj);
        this.player.addSong(songObj.songpreview);
      }
      //if(!this.player.isPlaying){this.player.playIndex = 0} .. 自動再生OFF
      this.update();
      this.stage3d.update();
      this.stage3d._setPlanesDeg(90); // 初期表示時のアニメーションの為、90度ずらす（要調整）
      this.stage3d.focus(0);
    }

    /**
     *  ストアから曲追加イベントを受信した時
     **/
    const onSongAdded = (songs,songAdded)=>{
      if(!App.stores.mufoStore.isPrepared){return} // ロード完了前は無視して、MUFO_PREPARED時に一括で追加
      const songObj = songAdded.toObj();
      // 曲とジャケット画像をSSL版に置換
      songObj.songpreview = App.sys.SSL.toSSL(songObj.songpreview);
      songObj.songthum = App.sys.SSL.toSSL(songObj.songthum);

      this.songs.splice(this.player.playIndex+1,0,songObj);

      this.player.addSong(songObj.songpreview,this.player.playIndex+1);
      // リアルタイムで追加された場合の対策
      this.update();
      this.stage3d.update();
      if(this.songs.length === 1){ // 最初の曲なら
        this.stage3d._setPlanesDeg(90); // 初期表示時のアニメーションの為、90度ずらす（要調整）
        this.stage3d.focus(0);
      }else{
        this.stage3d.focus(this.player.playIndex);
      }
    }

    /**
     *  ストアから再生開始イベントを受信した時
     **/
     const onPlaysongStarted = (song)=>{
      // プレイヤーの状態と不一致なら再生開始
      if(this.player.isPlaying){return}
      const index = getIndexBySong(song);
      if(index < 0){return}
      this.player.playIndex = index;
    }

    /**
     *  ストアから再生停止イベントを受信した時
     **/
     const onPlaysongStopped = ()=>{
      // プレイヤーの状態と不一致なら再生停止
      if(!this.player.isPlaying){return}
      this.player.stop();
    }

    /**
     *  ストアから再生曲変更イベントを受信した時
     **/
     const onPlaysongChanged = (song)=>{
      // プレイヤーの状態と不一致なら変更
      const index = getIndexBySong(song);
      if(index < 0){
        this.player.stop();
        return;
      }
      if(index !== this.player.playIndex){
        this.player.playIndex = index;
      }
    }

    // マウント時の初期化とイベント設定
    this.on('mount',()=>{
      console.log('mounted');
      this.songs = [];
      this.playIndex = -1;
      this.loadingStatus = '';
      this.stage3d = new App.views.GalleryStage(document.getElementById('player-stage'));
      this.player = new App.views.ListPlayer();

      /// プレイヤーからのイベント ////////////////////////////////////
      this.player.on('song-changed',(index)=>{
        const song = getSongByIndex(index);
        this.playIndex = index;
        this.update();

        this.stage3d.focus(this.playIndex);
        const isSongChanged = !isSameSong(song, App.stores.mufoStore.currentSong);
        if(song && isSongChanged){
          this.localCont.trigger(App.actions.MUFO_CHANGE_PLAYSONG, song.songid);
        }
        if(!App.stores.mufoStore.isPlaying){
          this.localCont.trigger(App.actions.MUFO_START_PLAYSONG);
        }
      });
      this.player.on('load-started',(index)=>{
        this.loadingStatus = `loading ... ${index}`;
        this.update();
      });
      this.player.on('load-ended',(index)=>{
        this.loadingStatus = 'completed!';
        this.update();
      });
      this.player.on('load-nowsong-started',()=>{
        console.log('loading ... please wait a while.');
        this.isLoadingNowsong = true;
        this.update();
      });
      this.player.on('load-nowsong-ended',()=>{
        console.log('load completed!');
        this.isLoadingNowsong = false;
        this.update();
      });

      this.player.on('stopped',(index)=>{
        if(!App.stores.mufoStore.isPlaying){return}
        this.localCont.trigger(App.actions.MUFO_STOP_PLAYSONG);
        this.update();
      });

      /// 3Dステージからのイベント ////////////////////////////////////
      this.stage3d.on('touchstart',()=>{
        this.player.activeteForIOS(); //iOS用初期化処理
      });
      this.stage3d.on('swaiped',(index)=>{
        if(this.player.playIndex != index){
          console.log('swaiped',this.player.playIndex,index)
          this.player.activeteForIOS(); //iOS用初期化処理
          this.player.playIndex = index;
          this.isPlay = true;
          this.isPause = false;
          this.update();
        }
      });
      this.stage3d.on('taped',(index)=>{
        if(this.player.isPlaying){
          console.log('stop playing');
          this.player.stop();
          this.isPlay = false;
          this.isPause = true;
          this.update();
        }else{
          console.log('start playing');
          this.player.activeteForIOS(); //iOS用初期化処理
          this.player.playIndex = index;
          this.isPlay = true;
          this.isPause = false;
          this.update();
        }
      });

      /// ストアからのイベント ///////////////////////////////////////
      this.localCont.on(App.events.MUFO_PREPARED, onMufoPrepared);
      this.localCont.on(App.events.MUFO_SONG_ADDED, onSongAdded);
      this.localCont.on(App.events.MUFO_PLAYSONG_STARTED, onPlaysongStarted);
      this.localCont.on(App.events.MUFO_PLAYSONG_STOPPED, onPlaysongStopped);
      this.localCont.on(App.events.MUFO_PLAYSONG_CHANGED, onPlaysongChanged);
      onMufoPrepared(); // マウントした時点でPREPAREDなケースがあるため、明に実行

    });

    this.on('unmount',()=>{
      console.log('player unmounted');
      this.player.stop();
      this.player.cancelLoad();
      this.player = null;
      this.localCont.offAll();
    });


  </script>
</mufo-player>
