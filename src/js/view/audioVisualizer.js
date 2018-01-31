/*
  Mufo内部のスペクトラムバーっぽい表現をコントロールするクラス。
  canvasの幅は可変対応。
*/

export default class AudioVisualizer {
  constructor () {
    // wrap要素
    this.wrap = null;
    // canvas要素
    this.cvs = null;
    // コンテクスト
    this.ctx = null;
    // アニメーションフレームのID登録用
    this.reqId = null;
    // アニメーションのスピード
    this.speed = 0.16;
    // フレーム数管理用
    this.time = 0;
    // スペクトラムバーの幅
    this.barW = 8;
    // スペクトラムバーの高さの最低値
    this.barHLimit = 5;
    // スペクトラムバーの数
    this.len = null;
    // スペクトラムバーそれぞれのランダム値
    this.secondGear = [];
    // 1列に2つ目の四角形を出現させるしきい値
    this.threshold = 25;
    // アニメーション中かどうかのステータス
    this.isPlay = false;
  }
  setCvs () {
    // wrap要素
    this.wrap = document.getElementById('visualizer-wrap');
    // canvasを取得
    this.cvs = document.getElementById('visualizer');
    // 2Dコンテキスト
    this.ctx = this.cvs.getContext('2d');
    // canvasのサイズをwrap要素に合わせる
    this.cvs.width = this.wrap.clientWidth;
    this.cvs.height = this.wrap.clientHeight;
    // スペクトラムバーの数
    this.len = Math.floor(this.cvs.width / this.barW);
    let i;
    for (i = 0; i < this.len; i = (i + 1) | 0) {
      this.secondGear.push(Math.random() / 4);
    }
  }
  fitstGear (time) {
    // 時間軸に沿ってサイン波で0～100の値を返す
    return Math.sin(time * Math.PI / 2) * 50 + 50;
  }
  start () {
    if (!this.isPlay) {
      this.wrap.classList.add('play');
      this.isPlay = true;
    }
    // 再帰的に実行
    this.reqId = requestAnimationFrame(this.start.bind(this));
    // フレームを進める
    this.time += this.speed;
    // 前フレームのシェイプを削除
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
    // シェイプを描画
    let i;
    for (i = 0; i < this.len; i = (i + 1) | 0) {
      // シェイプのスタイルを定義
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      let barH = this.barHLimit + (this.fitstGear(this.time + i) * this.secondGear[i]);
      // 長方形バーを描画
      this.ctx.fillRect(
        this.barW * [i], //x
        0, //y
        this.barW, //w
        barH //h
      );
      // 一定以上の高さが出た場合、バーの下に四角形を描画
      if (barH > this.threshold) {
        this.ctx.fillRect(
        this.barW * [i], //x
        barH + 5, //y
        this.barW, //w
        this.barW //h
        );
      }
    }
  }
  pause () {
    // 描画一時停止
    cancelAnimationFrame(this.reqId);
    this.wrap.classList.remove('play');
    this.isPlay = false;
  }
  reset () {
    // 描画リセット
    cancelAnimationFrame(this.reqId);
    this.reqId = null;
    this.time = 0;
    // キャンバスのシェイプを削除
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
    // ランダム値を入れ替える
    this.secondGear = [];
    let i;
    for (i = 0; i < this.len; i = (i + 1) | 0) {
      this.secondGear.push(Math.random() / 4);
    }
  }
}
