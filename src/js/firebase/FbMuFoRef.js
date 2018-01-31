import FbCustomeRefBase from './FbCustomeRefBase.js';
import GeoFire from 'geofire';
import MufoModel from '../model/MufoModel';
//import SongModel from '../model/SongModel';
import FbMufoSongRef from './FbMufoSongRef';

const mufoMainPath = 'data/mufos';
const mufoLocationPath = 'index/mufo-locations';
const LOADTYPE_MUFO = 'mufo';
const LOADTYPE_SONG = 'song';

export default class FbMufoRef extends FbCustomeRefBase {

  constructor(rootRef) {
    super(rootRef);
    this._defineCallback('mufo_changed');   // watchしているMuFoの内容に変更があった
    this._defineCallback('song_added');     // 曲が追加された
    this._defineCallback('song_removed');   // 曲が削除された
    this._defineCallback('watch_cleared');  // 監視が解除されたので、現在のMuFo及び曲は全てクリアされた
    this._defineCallback('mufo_prepared');  // MuFoと中の曲の初期ロードが完了した
    this._defineCallback('reaction_added');  // 曲にリアクションが追加された

    this._watchid = null;
    this._loadFlags = {};
    const songRef = new FbMufoSongRef(rootRef);
    this._songsRef = songRef;

    // Refからのイベント
    songRef.on('song_added',(sm)=>{
      // 監視対象MuFoの曲であることを確認
      if(sm.mufoid !== this._watchid){console.warn('invalid song for current mufo',this._watchid,sm);return}
      this._trigger('song_added',sm);
    });
    songRef.on('song_removed',(songid)=>{
      this._trigger('song_removed',songid);
    });
    songRef.on('initial_loaded',()=>{
      this._setLoaded(LOADTYPE_SONG);
    });
    songRef.on('reaction_added',(songid,count)=>{
      this._trigger('reaction_added',songid,count);
    });

  }

  /**
   * mufoデータの読み込み完了をセットします。
   * 全てが揃うと'mufo_prepared'をトリガします
   * @param {string} type LOADTYPE_MUFO | LOADTYPE_SONG
   */
  _setLoaded(type){
    if(this._loadFlags[LOADTYPE_MUFO] && this._loadFlags[LOADTYPE_SONG]){
      return;
    }
    this._loadFlags[type]=true;
    if(this._loadFlags[LOADTYPE_MUFO] && this._loadFlags[LOADTYPE_SONG]){
      this._trigger('mufo_prepared');
    }
  }
  _clearLoaded(){
    this._loadFlags={};
  }

  /**
   * 新たにMuFoを作成します。引数で渡されたMufoModelのデータの内、
   * 下記のプロパティのみを使用します。これらのプロパティがnullの場合は
   * エラーとなり、登録はされません。
   * title, author, color, pattern, location .
   * created, modifiedは現在時を自動で設定します。指定済みでも無視します
   * mufoidは未設定である必要があります
   * @param {MufoModel} mm 作成するMuFoのデータ
   * @param {function} [onsuccess] コールバック(オプション)
   * @return {MufoModel} 登録されたmufoのデータ。引数mmとは違うものが返ります
   */
  createMufo(mm, onsuccess) {

    // 引数チェック
    if (!mm || mm.constructor !== MufoModel) {
      throw 'not MufoModel instance';
    }
    const fields = ['title', 'color', 'pattern', 'location', 'authoruid', 'authorname', 'authoravatar'];
    for (let key of fields) {
      if (mm[key] === undefined || mm[key] === null) {
        throw `mufo prop ${key} is invalid`;
      }
    }

    // mufosへのref
    const mufoMainRef = this.rootRef.child(mufoMainPath);
    // mufoidの採番
    const mufoid = mufoMainRef.push().key;
    // 登録用MuFoデータ
    const mcp = mm.clone();
    mcp.mufoid = mufoid;
    mcp.modified = mcp.created = Date.now();

    this.updateMufo(mcp, ['mufoid', 'modified', 'created', ...fields], onsuccess);
    return mcp;

  }

  /**
   * MuFOを削除します。メンテ用です。
   * @param {string} mufoid
   * @param {function} [onsuccess] コールバック(オプション)
   */
  removeMufo(mufoid, onsuccess) {
    if (!mufoid) { return }
    const updates = {
      [`${mufoMainPath}/${mufoid}`]: null
      , [`${mufoLocationPath}/${mufoid}`]: null
    }
    this.rootRef.update(updates).then(() => {
      if (onsuccess) { onsuccess(mufoid) }
    });

  }

  /**
   * MuFoを更新します
   * @param {MuFoModel} mm 更新するMuFoのデータ
   * @param {Array[string]} fields 更新するフィールド。modifiedは自動的に更新します
   * @param {function} [onsuccess] コールバック(オプション)
   */
  updateMufo(mm, fields, onsuccess) {
    if (!mm || mm.constructor !== MufoModel) {
      throw 'not MufoModel instance';
    }
    // 引数チェック
    for (let key of fields) {
      if (mm[key] === undefined || mm[key] === null) {
        throw `mufo prop ${key} is invalid`;
      }
    }
    const mufoid = mm.mufoid;
    if (!mufoid) {
      throw 'mufoid is invalid';
    }

    // 登録用MuFoデータ
    const mcp = mm.clone();
    mcp.modified = Date.now();
    const mufoData = {
      modified: mcp.modified
    };
    if(fields.indexOf('modified') < 0){fields.push('modified')}
    for (let key of fields) {
      mufoData[key] = mcp[key];
    }
    if (mufoData.location) {
      mufoData.location = { lng: mufoData.location.lng, lat: mufoData.location.lat }
    }

    // 一括登録するため、パスと登録内容のペアを保持
    const updates = {};
    for (let key of fields) {
      updates[`${mufoMainPath}/${mufoid}/${key}`] = mufoData[key];
    }

    // ここまでのデータを一括登録後、追加の更新処理を実施
    this.rootRef.update(updates).then(() => {
      // 位置情報の登録
      if (fields.indexOf('location') >= 0) {
        const locRef = this.rootRef.child(mufoLocationPath);
        const geoFire = new GeoFire(locRef);
        geoFire.set(mufoid, [mcp.location.lat, mcp.location.lng]).then(() => {
          if (onsuccess) onsuccess(mcp);
        });
      } else {
        if (onsuccess) onsuccess(mcp);
      }
    });

  }

  /**
   * 指定のMuFoを監視対象にします。
   * 変更を検知するとこのRefの'mufo_changed'がトリガされます
   * @param {string} mufoid
   */
  watchMufo(mufoid) {
    // 既存の監視があればクリア
    if(this._watchid){
      // MuFo本体のデータ監視クリア
      this._handlers.removeAll();
      // Songデータ監視クリア
      this._songsRef.watchMufoSong(null);
      // クリアした旨をイベントで通知
      this._trigger('watch_cleared');
    }
    this._watchid = mufoid;
    this._clearLoaded();
    if(!mufoid){return}

    // 新しい監視をセット
    this._handlers.regist(`${mufoMainPath}/${mufoid}`,'value',(snap)=>{
      this._trigger('mufo_changed',new MufoModel(snap.val()));
      this._setLoaded(LOADTYPE_MUFO);
    });
    this._songsRef.watchMufoSong(mufoid);

  }

  /**
   * 指定のMuFoを取得します
   * @param {string} mufoid
   * @param {boolean} isdeep
   * @param {function} callback 引数にMufoModel
   */
  getMufoOnce(mufoid, isdeep, callback) {
    const mm = new MufoModel();
    this.rootRef.child(`${mufoMainPath}/${mufoid}`).once('value').then((span) => {
      const val = span.val();
      if (val) {
        mm.mufoid = val.mufoid;
        mm.authoravatar = val.authoravatar;
        mm.authorname = val.authorname;
        mm.authoruid = val.authoruid;
        mm.title = val.title;
        mm.color = val.color;
        mm.pattern = val.pattern;
        mm.location = val.location;
        mm.created = val.created;
        mm.modified = val.modified;
      }
    });
  }

  addSong(sm){
    this._songsRef.addSong(sm);
    const mufo = new MufoModel();
    mufo.mufoid = sm.mufoid;
    this.updateMufo(mufo,[]); //更新日のみアップデート
  }

  removeSong(songid){
    this._songsRef.removeSong(songid);
  }

  addSongReaction(songid,addCount){
    this._songsRef.addSongReaction(songid,addCount);
  }


}
