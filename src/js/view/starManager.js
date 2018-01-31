/*
  スター追加時のゲージ、エフェクトの管理
*/

export default class StarManager {
  constructor () {
    // ゲージの最高値
    this.maxNum = null;
    // タイマー管理用
    this.starTimer;
    // データ送信までに貯まった数値
    this.starStack = 0;
    // 未送信データがあればtrue
    this.isStacking = false;
    // ボタン押下時のsongId
    this.songId = null;
    // canvasを取得
    this.cvs = null;
    // 2Dコンテキスト
    this.ctx = null;
    // wrap要素
    this.wrap = null;
    // エフェクト用スプライトシート
    this.sprite = new Image();
    this.sprite.src = 'img/star-effect-sprite.png';
    // パーティクル数
    this.particulesLen = 10;
    // エフェクトの時間
    this.effectTime = 500;
  }
  // ゲージの初期読み込み時
  init (initNum, maxNum) {
    this.maxNum = maxNum;
    this.starStack = 0;
    this.styleGauge(initNum);
    this.isStacking = false;
  }
  stack (callback) {
    // callbackされるまで数値を貯める
    this.starStack++;
    this.isStacking = true;
    // 最初に呼び出してから1秒間呼び出されなかったらコールバック
    clearTimeout(this.starTimer);
    this.starTimer = setTimeout(() => {
      // たまった数値を返す
      callback(this.starStack);
      this.starStack = 0;
      this.isStacking = false;
    }, 1000);
  }
  // ゲージの幅に反映
  styleGauge (num) {
    const $gaugeArea = $('#mufo-star-gauge');
    const $gauge = $gaugeArea.find('.mufo-star-amount');
    if (this.maxNum <= num) {
      // max値を越えていたら100%に留める
      $gauge.css('width', '100%');
    } else {
      // ゲージの幅を%で反映
      $gauge.css('width', (num / this.maxNum * 100) + '%');
    }
  }
  setCvs () {
    // canvasを取得
    this.cvs = document.getElementById('star-effect');
    // 2Dコンテキスト
    this.ctx = this.cvs.getContext('2d');
    // wrap要素
    this.wrap = document.getElementById('star-effect-wrap');
    // canvasのサイズをwrap要素に合わせる
    this.cvs.width = this.wrap.clientWidth;
    this.cvs.height = this.wrap.clientHeight;
  }
  createParticule () {
    const spriteSize = 20;
    let spriteType = App.views.Anime.random(0, 3);
    let spawnX = App.views.Anime.random(0, this.cvs.width);
    let spawnY = App.views.Anime.random(80, 85);
    let p = {};
    p.x = spawnX;
    p.y = spawnY;
    p.scale = 0.5;
    p.time = App.views.Anime.random(500, 800);
    p.endPos = {
      x: spawnX,
      y: App.views.Anime.random(30, 50),
      scale: App.views.Anime.random(10, 15) / 10,
    }
    p.draw = () => {
      // 元の画像の (sx, sy) から、横幅 sw、縦幅 sh の領域をトリミング。
      // Canvasの座標 (dx, dy) に、横幅 dw、縦幅 dh のサイズに伸縮して描画
      this.ctx.drawImage(this.sprite, 0, 20 * spriteType, spriteSize, spriteSize, p.x, p.y, spriteSize / 2 * p.scale, spriteSize / 2 * p.scale);
    }
    return p;
  }
  renderParticule (anim) {
    let i;
    for (i = 0; i < anim.animatables.length; i++) {
      anim.animatables[i].target.draw();
    }
  }
  animateParticules() {
    let particules = [];
    let i;
    for (i = 0; i < this.particulesLen; i++) {
      particules.push(this.createParticule());
    }
    App.views.Anime({
      targets: particules,
      x: (p) => { return p.endPos.x; },
      y: (p) => { return p.endPos.y; },
      scale: (p) => { return p.endPos.scale; },
      easing: 'easeOutBack',
      duration: this.effectTime,
      update: this.renderParticule,
      complete: () => {
        this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
      }
    });
  }
  // ボタン押下時のエフェクト
  effect () {
    let render = App.views.Anime({
      update: () => {
        this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
      }
    });
    render.play();
    this.animateParticules();
  }
}
