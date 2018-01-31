import CrossfadePlayer from './CrossfadePlayer';

const ON_LOAD_STARTED = 'load-started';
const ON_LOAD_ENDED   = 'load-ended';
const ON_LOAD_NOWSONG_STARTED = 'load-nowsong-started';
const ON_LOAD_NOWSONG_ENDED   = 'load-nowsong-ended';
const ON_SONG_CHANGED = 'song-changed';
const ON_STOPPED      = 'stopped';

/**
 * @class ListPlayer
 * プレイリストを順次クロスフェードで再生する機能を持ったプレイヤークラスです。
 * プレイリストは再生中に追加・削除が可能です。
 * 曲の再生が終わると自動的に次の曲を再生します。
 * 常に次の一曲分のデータをプリロードします。
 */
export default class ListPlayer extends CrossfadePlayer {

  constructor(urls) {
    super();


    // 次に再生する曲のバッファ
    this._nextBuffer = null;
    // バッファに乗っている曲のインデックス
    this._bufferedIndex = -1;
    // プレイリスト（仮）
    this._playlist = urls ? [...urls] : [];
    // 現在再生中の曲のインデックス（設定にはsetterを使う）
    this._playIndex = -1;
    // ロード中？
    this._isLoading = false;

    // イベントハンドラの設定
    this.on('next',()=>{
      console.log('next song required');
      this.playIndex++;
    });
  }

  /**
   * 現在再生中の曲のインデックスです。値を変更すると再生する曲も切り替わります。
   */
  get playIndex(){return this._playIndex}
  set playIndex(v){
    const newIndex = this._wrapIndex(v);
    if(newIndex === -1){this.stop();return}

    this._playIndex = newIndex;

    if(newIndex === this._bufferedIndex){
      // バッファ済みの曲 = 即再生を開始
      this.play(this._nextBuffer);
      this._nextBuffer = null;
      this._bufferedIndex = -1;
      this._loadNext();
    }else{
      // バッファ済みではない = ロードしてから再生を開始
      this.loadSound(this._playlist[newIndex],(buf)=>{
        this._isLoading = false;
        this.trigger(ON_LOAD_NOWSONG_ENDED);
        this.play(buf);
        this._loadNext();
      },()=>{
        // キャンセルされた
        this._isLoading = false;
        this.trigger(ON_LOAD_NOWSONG_ENDED);
      });
      this._isLoading = true;
      this.trigger(ON_LOAD_NOWSONG_STARTED);
    }

    this.trigger(ON_SONG_CHANGED,newIndex,this._playlist[newIndex]);
  }

  /**
   * プレイリストの指定した位置に曲を追加します。現在再生中の曲の次に追加すると、読み込み済みのバッファが破棄され、新しく追加した曲のプリロードが即座に開始されることに注意してください。
   * 現在再生中の曲の位置に追加した場合、現在再生中の曲には影響を与えません。
   * @param {string} url 曲のURL
   * @param {number} [index] 追加位置。オプション。省略すると末尾に追加します。
   */
  addSong(url,index){
    const insertIndex = (!index && index!== 0) ? this._playlist.length : index % (this._playlist.length+1);
    console.log(`add song ${url} at ${insertIndex}`);
    // 指定位置に挿入
    this._playlist.splice(insertIndex, 0, url);
    if(insertIndex <= this.playIndex){
      // 現在の再生位置より前に挿入する場合
      // 再生位置とバッファ位置を+1
      this._playIndex = this._wrapIndex(this._playIndex+1);
      if(this._bufferedIndex >= 0){
        this._bufferedIndex = this._wrapIndex(this._bufferedIndex+1);
      }else{
        this._loadNext();
      }
    }else if(this.playIndex+1 === insertIndex){
      // 現在の再生位置の次に挿入する場合
      // バッファを破棄して新しい曲の読み込みを実行
      this._nextBuffer = null;
      this._bufferedIndex = -1; //バッファ済みインデックスが変わらないとロードがキャンセルされるので、明示的に一旦破棄
      this._loadNext();
    }
  }

  /**
   * 指定した曲を削除します。現在再生中の次の曲を削除すると、読み込み済みのバッファを破棄して、新たに次の曲をプリロードします。
   * 現在再生中の曲を削除した場合、playIndexが-1された上で、現在の曲の再生は最後まで行われます。
   * @param {number} index
   */
  removeSong(index){
    const removeIndex = index % (this._playlist.length);
    console.log(`remove song ${this._playlist[removeIndex]} at ${removeIndex}`);
    // 指定位置から削除
    this._playlist.splice(removeIndex, 1);
    if(removeIndex <= this.playIndex){
      // 現在の再生位置よりも前を削除する場合
      this._playIndex = this._wrapIndex(this._playIndex-1);
      if(this._bufferedIndex >= 0){
        this._bufferedIndex = this._wrapIndex(this._bufferedIndex-1);
      }
    }else if(this.playIndex+1 === removeIndex){
      // 現在の再生位置の次を削除する場合
      // バッファを破棄して新しい曲の読み込みを実行
      this._nextBuffer = null;
      this._bufferedIndex = -1; //バッファ済みインデックスが変わらないとロードがキャンセルされるので、明示的に一旦破棄
      this._loadNext();
    }
  }

  _loadNext(){
    const nextIndex = (this._playIndex+1) % this._playlist.length;
    if(nextIndex === this._bufferedIndex){return}
    this.trigger(ON_LOAD_STARTED,nextIndex,this._playlist[nextIndex]);
    this._isLoading = true;
    this._nextBuffer = null; //不要になったバッファは即削除
    this._bufferedIndex = -1;
    this.loadSound(this._playlist[nextIndex],(buf)=>{
      this.trigger(ON_LOAD_ENDED,nextIndex,this._playlist[nextIndex]);
      this._isLoading = false;
      this._nextBuffer = buf;
      this._bufferedIndex = nextIndex;
      console.log(`now buffered : ${nextIndex}`);
    });
  }

  /**
   * 任意の整数値に対してplayListのインデックス値として有効な値を返します。
   * playList.length === 3の時、
   * _wrapIndex(0) === 0
   * _wrapIndex(2) === 2
   * _wrapIndex(3) === 0
   * _wrapIndex(10) === 1
   * _wrapIndex(-1) === 2
   * となります。
   * @param {number} index
   */
  _wrapIndex(index){
    const len = this._playlist.length;
    if(len === 0){return -1}
    if(index < 0){
      return len - this._wrapIndex(-Math.floor(index));
    }else{
      return Math.floor(index) % len;
    }
  }

  stop() {
    super.stop();
    this.trigger(ON_STOPPED);
  }

}
