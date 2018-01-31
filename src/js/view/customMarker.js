/*
  CustomMarkerを生成、アニメーション、削除するクラス
*/

export default class CustomMarker extends google.maps.OverlayView {

  constructor(opts) {
    super();
    // color, authoravatar, mufoid, location, size, areascale
    this.setValues(opts);
    // map表示domの取得
    const $map = $('#map');
    // mufoの表示範囲
    this.invasionW = $map.innerWidth();
    this.invasionH = $map.innerHeight();
    this.floatingAnimTime = {
      min: 5000,
      max: 7000
    }
  }

  // min～maxまでの整数のランダム値を返す
  randNumInRange (min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
  }

  // ランダムな位置へアニメーションを繰り返す
  floatingAnim (div) {
    App.views.Anime({
      autoplay: true,
      targets: div.childNodes[1],
      translateY: (this.randNumInRange(0, this.invasionH) - this.invasionH / 2) * this.areascale,
      translateX: (this.randNumInRange(0, this.invasionW) - this.invasionW / 2) * this.areascale,
      duration: this.randNumInRange(this.floatingAnimTime.min, this.floatingAnimTime.max),
      easing: 'easeInOutQuad',
      delay: this.randNumInRange(0,1000),
      complete: () => {
        // 再帰的に繰り返す
        this.floatingAnim(div);
      }
    });
  }

  // mufoのdomの生成
  draw () {
    const mufoSize = this.size;
    const avatarArr = this.authoravatar.split(',');
    let div = this.div;
    if (!div) {
      div = this.div = $(`
        <div class="mufo-abs-anchor" id="mufo-${this.mufoid}">
          <div class="mufo-moving">
            <a href="/#/mufo/${this.mufoid}" class="mufo-floating">
              <svg class="mufo-svg-parts">
                <use xlink:href="#mufo-parts-1"></use>
              </svg>
              <svg class="alien-svg-parts">
                <use xlink:href="#alien-body-${avatarArr[0]}" class="alien-color-${avatarArr[1]}"></use>
                <use xlink:href="#alien-eye-${avatarArr[3]}"></use>
                <use xlink:href="#alien-mouth-${avatarArr[2]}"></use>
              </svg>
              <svg class="mufo-svg-parts">
                <use xlink:href="#mufo-parts-2" class="mufo-svg-color-${this.color}"></use>
                <use xlink:href="#mufo-parts-3"></use>
              </svg>
            </a>
          </div>
        </div>
      `)[0];
      div.style.position = 'absolute';
      div.style.width = mufoSize + 'px';
      div.style.height = mufoSize + 'px';
      const panes = this.getPanes();
      panes.overlayImage.appendChild(div);
      console.log(`${this.mufoid}が侵略しにやってきました。`);
      // map上の移動アニメーション開始
      this.floatingAnim(div);
    }
    const point = this.getProjection().fromLatLngToDivPixel(this.location);
    if (point) {
      div.style.left = point.x - mufoSize / 2 + 'px';
      div.style.top = point.y - mufoSize / 2 + 'px';
    }
  }

  // mufoのdomを消去
  remove () {
    if (this.div) {
      // フェードアウトしてから消える
      $(this.div).fadeOut('1000', () => {
        this.div.parentNode.removeChild(this.div);
        this.div = null;
        console.log(`${this.mufoid}は星に帰りました。`);
      });
    }
  }

}
