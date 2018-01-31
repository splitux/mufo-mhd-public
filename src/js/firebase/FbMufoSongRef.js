import FbCustomeRefBase from './FbCustomeRefBase.js';
import SongModel from '../model/SongModel';

const songPath = 'data/songs';

export default class FbMufoRef extends FbCustomeRefBase {

  constructor(rootRef) {
    super(rootRef);
    this._defineCallback('song_added');
    this._defineCallback('song_removed');
    this._defineCallback('cleared');
    this._defineCallback('initial_loaded');
    this._defineCallback('reaction_added');

    this._watchMufoid = null;
  }

  addSong(sm, onsuccess) {
    // 引数チェック
    if (!sm || sm.constructor !== SongModel) {
      throw 'not SongModel instance';
    }
    if(!sm.mufoid){
      throw 'invalid mufoid for song';
    }
    // songid取得
    const songid = this.rootRef.child(`${songPath}`).push().key;

    // 登録用Songデータ
    const scp = sm.clone();
    scp.songid = songid;
    scp.created = Date.now();
    const songData = scp.toObj();

    // 一括登録するため、パスと登録内容のペアを保持
    const updates = {};
    updates[`${songPath}/${songid}`] = songData;

    // 登録
    this.rootRef.update(updates).then(()=>{
      if (onsuccess) { onsuccess(songid) }
    });

  }

  /**
   * Songを削除します。メンテ用です。
   * @param {string} songid
   * @param {function} [onsuccess] コールバック(オプション)
   */
  removeSong(songid, onsuccess) {
    if (!songid) { return }
    const updates = {
      [`${songPath}/${songid}`]: null
    }
    this.rootRef.update(updates).then(() => {
      if (onsuccess) { onsuccess(songid) }
    });

  }

  addSongReaction(songid,addCount){
    const songReactionPath = `${songPath}/${songid}/reaction`;
    this.rootRef.child(songReactionPath).transaction((val)=>{
      return (val || 0) + addCount;
    });
  }

  /**
   * 指定のMuFoに乗っている曲を監視します。
   * 変更を検知するとこのRefの'song_added','song_removed'がトリガされます。
   * また、既存の監視をクリアする際は'cleared'がトリガされます。
   * @param {string} mufoid
   */
  watchMufoSong(mufoid) {
    // 既存の監視をクリア
    if(this._watchMufoid){
      this._handlers.removeAll();
      this._trigger('cleared');
    }
    this._watchMufoid = mufoid;
    if(!mufoid){return}
    // 監視を開始
    const path = `${songPath}`;
    const ref = this.rootRef.child(path).orderByChild('mufoid').equalTo(mufoid);
    const onadd = (snap)=>{
      const sm = new SongModel(snap.val());
      this._trigger('song_added',sm);
      // 曲のリアクションを監視
      const songid = snap.key;
      const songReactionPath = `${songPath}/${songid}/reaction`;
      let isLoaded = false;
      const onreact = (snap)=>{
        if(!isLoaded){isLoaded = true;return} // 値の変更時だけ知りたいので、初回ロードは読み捨てる
        const reactionCount = snap.val();
        this._trigger('reaction_added',songid,reactionCount);
      };
      this._handlers.regist(songReactionPath,'value',onreact); //habdler.regist = ref.on + handler.add
    };
    const onrem = (snap)=>{
      this._trigger('song_removed',snap.key);
      // 曲のリアクション監視を解除
      const songid = snap.key;
      const songReactionPath = `${songPath}/${songid}/reaction`;
      this._handlers.remove(songReactionPath);
    };
    const onval = (snap)=>{
      this._trigger('initial_loaded');
    }
    ref.on('child_added',onadd);
    ref.on('child_removed',onrem);
    ref.once('value',onval);
    this._handlers.add(path,'child_added',onadd);
    this._handlers.add(path,'child_removed',onrem);

  }

}
