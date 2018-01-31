// Webkit系はAudioContextクラスにプレフィックスがつく
const AudioContext = window.AudioContext || window.webkitAudioContext;
// フェード時間
const FADE_DUR_SEC = 3.0;

// iOSバグ対応 - 最初に作るAudioContextは音割れして使えないので捨てる
let sharedContext = new AudioContext();
sharedContext.close().then(()=>{
  sharedContext = new AudioContext();
});
let isIOSActivated = false;

/**
 * @class CrossfadePlayer
 * 音源の連続クロスフェード再生を行えるクラスです。
 * デコード済みのオーディオデータを指定してplayメソッドを呼ぶことで、
 * フェードイン/フェードアウト効果付きで音声が再生されます。
 * 再生中に次のオーディオデータを指定してplayメソッドを呼ぶと、クロスフェードで音源が切り替わります。
 * 再生中の音声の末尾でフェードアウトが開始されたタイミングでnextイベントが発火するため、
 * これを拾って次のオーディオデータを渡してやることで、切れ目のないクロスフェード再生が可能です。
 */

export default class CrossfadePlayer {

  constructor() {
    // イベントを扱えるようにriotに登録
    riot.observable(this);
    const context = sharedContext;
    this._context = context;

  }

  /** @type {AudioContext} */
  get context() { return this._context }
  /** 現在の曲の再生時間（秒） @type {number} */
  get duration() { return (this.source && this._source.buffer) ? this._source.buffer.duration : 0 }
  /** このコンテキストの再生開始からの時間（秒） @type {number} */
  get currentTime() { return this.context.currentTime }
  /** 現在のトラックの再生開始からの時間（秒） @type {number} */
  get currentTrackTime() { return this.context.currentTime - this.trackStartTime }
  /** ボリューム(0.0 - 1.0) @type {number} */
  get volume() { return this.gainNode ? this.gainNode.gain.value : 0 }
  set volume(v) { if (this.gainNode) { this._gainNode.gain.value = v } }
  /** 再生中か否か @type {boolean} */
  get isPlaying() { return this.duration > 0 }
  /** 現在の曲のソースバッファ @type {AudioSourceBuffer} */
  get source() { return this._source }
  /** 現在の曲ソースに接続されたGain */
  get gainNode() { return this._gainNode }

  /** 現在の曲をフェードインさせます */
  fadeIn() {
    this.volume = 0;
    //console.log(this.currentTime, this.currentTrackTime, 'FADE IN');
    this.gainNode.gain.linearRampToValueAtTime(0.0, this.currentTime); //Safatiでは開始値を明示しないとフェードしない
    this.gainNode.gain.linearRampToValueAtTime(0.7, this.currentTime + FADE_DUR_SEC);
  }
  /** 現在の曲をフェードアウトします。フェードアウトが完了した時点で曲データは破棄されます。
   * （フェードアウト=再生停止です。再生を再開することはできません）。このメソッドを実行した時点で、
   * source,gain等のメソッドで曲のデータにアクセスしたり再生をコントロールしたりすることはできなくなります。
   * requireNextを指定すると、'next'イベントを発火します。このイベントを受け取ったタイミングで次の曲データを指定して
   * playメソッドを呼ぶとクロスフェード再生になります。
   * @param {boolean} requireNext
   */
  fadeOut(requireNext) {
    clearTimeout(this.__volumeTimerId);
    //console.log(this.currentTime, this.currentTrackTime, 'FADE OUT');
    this.gainNode.gain.linearRampToValueAtTime(0.7, this.currentTime); //Safatiでは開始値を明示しないとフェードしない
    this.gainNode.gain.linearRampToValueAtTime(0.0, this.currentTime + FADE_DUR_SEC);
    // 古いsourceの破棄
    const oldSource = this._source;
    const oldGain = this._gainNode;
    setTimeout(() => {
      //console.log('disconnect old source');
      oldSource.stop(0);
      oldSource.disconnect();
      oldGain.disconnect();
    }, (FADE_DUR_SEC+1)*1000);
    this._source = null;
    this._gainNode = null;

    if(requireNext){
      this.trigger('next');
    }
  }
  /**
   * 現在の曲が終了する時にフェードアウトをかけるよう、予約します。
   */
  fadeOutAtEnd() {
    clearTimeout(this.__volumeTimerId);
    this.__volumeTimerId = setTimeout(() => {
      this.fadeOut(true);
    }, (this.duration - this.currentTrackTime - FADE_DUR_SEC) * 1000);
  }

  /**
   * AudioBufferを指定して再生を開始します。
   * 前の曲が再生中の場合、クロスフェードを掛けます。
   */
  play(buf) {
    // 現在再生中の曲がある場合、フェードアウト
    if(this.source){
      // フェードアウト
      this.fadeOut(false);
    }

    // BufferSourceの作成
    this._source = this.context.createBufferSource();
    // 音量調整用GainNodeの生成
    this._gainNode = this.context.createGain();
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
    this.source.buffer = buf;
    this.source.onended = () => {
      //this.source.stop();
      //this.play();
    };
    this.source.start(0); // 再生開始
    this.trackStartTime = this.currentTime;
    this.fadeIn();
    this.fadeOutAtEnd();
    console.log('play started');
  }

  stop() {
    if(this.source){
      this.fadeOut();
      console.log('play stopped');
    }
  }

  /**
   * ユーティリティメソッドです。
   * iOSの制限回避のため、無音のオーディオデータを生成して再生します。
   * 初回のplayメソッドの呼び出しをユーザイベントトリガで行えない場合に利用してください。
   * このメソッドはtouchendイベントをトリガとして、他の音声を再生するより前に一度だけ呼び出してください。
   * （2度目以降の呼び出しは単に無視されます）
   */
  activeteForIOS() {
    if(isIOSActivated){return}
    isIOSActivated = true;
    console.log('activete audio for ios.');

    const abuf = this._context.createBuffer(2, this._context.sampleRate*5.0, this._context.sampleRate);
    const buf = abuf.getChannelData(0);
    for (let i = 0; i < buf.length; i++) {
      buf[i] = 0.0;
    }
    console.log(abuf);
    this.play(abuf);
  }

  /**
   * ユーティリティメソッドです。
   * URLを指定してオーディオをロードし、正常にロードできたらデコードした上でコールバックを呼びます。
   * 現在再生している曲には何も影響を与えません。ロードした曲を再生したい場合は、デコードした曲データを指定してplayメソッドを呼んでください。
   * @param {string} url
   * @param {Function} onload function(buffer)
   * @param {Function} onerr function(err)
   */
  loadSound(url, onload, onerr) {
    this.cancelLoad();

    const req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.responseType = 'arraybuffer';
    const dlStartTime = Date.now();
    req.onload = () => {
      console.log(`DL end: time=${Date.now() - dlStartTime}ms`);
      const onDecodeSuccess = (buffer) => {
        if (onload) { onload(buffer) }
      }
      const onDecodeError = (err) => {
        if (onerr) { onerr(err) }
      }
      this.context.decodeAudioData(req.response, onDecodeSuccess, onDecodeError);
    }
    req.onerror = (err)=>{
      console.warn(`DL error end: ${err}`);
      if (onerr) { onerr(err) }
    }
    req.send();
    this.__loadReq = req; //キャンセルできるように保持
  }

  cancelLoad() {
    if(this.__loadReq){
      if(this.__loadReq.readyState < XMLHttpRequest.DONE){
        this.__loadReq.abort();
      }
    }
  }


}
