import Actions from '../action/AppActions';
import FbMufoRef from '../firebase/FbMufoRef';
import StoreBase from './StoreBase';

export default class MufoStore extends StoreBase {
  constructor() {
    super();

    // ストアのデータ
    this._data = {
      currentMufo: null
      ,mufoSongs: []
      ,isloaded: false
      ,currentSong: null
      ,isPlaying: false
    };

    // データを操作するためのユーティリティメソッド
    const removeSongFromData = (songid) => {
      const songs = this._data.mufoSongs;
      for (let i = songs.length - 1; i >= 0; i--) {
        if (songs[i].songid === songid) {
          songs.splice(i, 1);
        }
      }
    }
    // songidから保持しているsongModelを返す
    const getSongById = (songid)=>{
      const songs = this._data.mufoSongs;
      for (let i = songs.length - 1; i >= 0; i--) {
        if (songs[i].songid === songid) {
          return songs[i];
        }
      }
    }

    // データソースを初期化
    const mufoDataRef = new FbMufoRef();
    this._mufoDataRef = mufoDataRef;

    // データソースのイベント
    mufoDataRef.on('mufo_prepared', () => {
      this._data.isloaded = true;
      this.triggerEvent(App.events.MUFO_PREPARED);
    });
    mufoDataRef.on('mufo_changed', (mufo) => {
      this._data.currentMufo = mufo;
      this.triggerEvent(App.events.MUFO_CHANGED, this.currentMufo);
    });
    mufoDataRef.on('song_added', (song) => {
      this._data.mufoSongs.push(song);
      this.triggerEvent(App.events.MUFO_SONG_ADDED, this.mufoSongs, song);
    });
    mufoDataRef.on('song_removed', (songid) => {
      removeSongFromData(songid);
      this.triggerEvent(App.events.MUFO_SONG_REMOVED, this.mufoSongs, songid);
    });
    mufoDataRef.on('reaction_added', (songid,count) => {
      const song = getSongById(songid);
      if(!song){
        console.error(`reaction_added song id=${songid} does not exists in this mufo`,this.currentMufo);
        return;
      }
      song.reaction = count;
      this.triggerEvent(App.events.MUFO_REACTION_ADDED, songid, count);
    });
    mufoDataRef.on('watch_cleared', () => {
      this._data.currentMufo = null;
      this._data.mufoSongs = [];
      this._data.isloaded = false;
    });



    // 以下、受信したい（自分が処理できる）イベントを登録 //
    this.on(Actions.MUFO_CREATE, (mufo) => {
      const mufoCp = mufo.clone();
      if(mufoCp.location){
        // 位置情報に誤差を与える
        mufoCp.location.addNoise(0.4);
      }
      const retMufo = this._mufoDataRef.createMufo(mufoCp);
      if (retMufo) {
        this.triggerEvent(App.events.MUFO_CREATED, retMufo.mufoid);
      }
    });
    this.on(Actions.MUFO_REMOVE, (mufoid) => {
      this._mufoDataRef.removeMufo(mufoid);
      this.triggerEvent(App.events.MUFO_REMOVED, mufoid);
    });
    this.on(Actions.MUFO_ENTER, (mufoid) => {
      this._data.currentMufo = null;
      this._data.currentSong = null;
      this._data.isPlaying = false;
      this._mufoDataRef.watchMufo(mufoid);
      this.triggerEvent(App.events.MUFO_ENTERED, mufoid);
    });
    this.on(Actions.MUFO_EXIT, () => {
      this._data.currentMufo = null;
      this._data.currentSong = null;
      this._data.isPlaying = false;
      this._mufoDataRef.watchMufo(null);
      this.triggerEvent(App.events.MUFO_EXITED);
    });
    this.on(Actions.MUFO_ADD_SONG, (songModel) => {
      this._mufoDataRef.addSong(songModel);
    });
    this.on(Actions.MUFO_REMOVE_SONG, (songid) => {
      this._mufoDataRef.removeSong(songid);
    });
    this.on(Actions.MUFO_ADD_REACTION, (songid,count) => {
      this._mufoDataRef.addSongReaction(songid,count);
    });
    this.on(Actions.MUFO_START_PLAYSONG, () => {
      if(this._data.isPlaying){return}
      this._data.isPlaying = true;
      this.triggerEvent(App.events.MUFO_PLAYSONG_STARTED, this.currentSong);
    });
    this.on(Actions.MUFO_STOP_PLAYSONG, () => {
      if(!this._data.isPlaying){return}
      this._data.isPlaying = false;
      this.triggerEvent(App.events.MUFO_PLAYSONG_STOPPED);
    });
    this.on(Actions.MUFO_CHANGE_PLAYSONG, (songid) => {
      const song = getSongById(songid);
      if(!song){
        console.warn(`the song ${songid} is not exists in this MuFo`,this.currentMufo);
        return;
      }
      this._data.currentSong = song;
      this.triggerEvent(App.events.MUFO_PLAYSONG_CHANGED, this.currentSong);
    });



  }

  // データを開示するためのgetter（参照型は全てコピーして返すこと）

  /**
   * 現在乗っているMuFoのコピー。未搭乗の場合null。
   * @type {MufoModel}
   */
  get currentMufo() {
    return this._data.currentMufo ? this._data.currentMufo.clone() : null;
  }

  get mufoSongs() {
    const cps = [];
    const org = this._data.mufoSongs;
    for(let song of org){
      cps.push(song.clone());
    }
    return cps;
  }

  /**
   * 現在選択されている曲。初期ロード時はnull
   */
  get currentSong() {
    return this._data.currentSong ? this._data.currentSong.clone() : null;
  }

  /**
   * 再生中ならtrue
   */
  get isPlaying() {
    return this._data.isPlaying;
  }

  /**
   * このMuFoのロードが曲一覧も含めて完了しているか。
   * @type {boolean}
   */
  get isPrepared() {
    return this._data.isloaded;
  }

}
