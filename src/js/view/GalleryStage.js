import BezierEasing from 'bezier-easing';

const CLASS_PLANE = 'player-box-plane';
const TRANSLATE_Z = '400px';
const DEFAULR_SCALE = 1.7;
const MAX_SCALE = 3.2;
/**
 * 手前側の見えないエリアにパネルを配置しない場合、その角度幅
 * 60の場合、150～180度と-150～-179度にはパネルが配置されなくなります。
 * （パネルは残りの領域に均等に配置されます）
 */
const DEAD_ANGLE = 130;
/**
 * パネルを表示（可視に）する範囲。
 * この範囲を外れたパネルは配置されますが非表示になります。
 * 240を設定した場合、正面奥から+-120度のパネルが表示されます。
 */
const VIEW_ANGLE = 260;
/**
 * パネル間の最小角
 */
const MIN_PANEL_ANGLE = 51.5;

/** スワイプ策度の調整（大きくするほど早くなる） */
const TOUCH_SCALE = 0.7;

/** DEAD_ANGLEを考慮した一周の角度 */
const ROUND_ANGLE = 360 - DEAD_ANGLE;
/** DEAD_ANGLEを考慮した半周の角度 */
const HALF_ROUND_ANGLE = ROUND_ANGLE / 2;

export default class GalleryStage{

  constructor(rootElem){
    // イベントを扱えるようにriotに登録
    riot.observable(this);

    this._root = rootElem;
    this._degree = 0;
    this._isReversed = true;

    this._initDragEvents(rootElem);
    this._setPlanesDeg(this._degree);
  }


  get panels(){
    return this._root.getElementsByClassName(CLASS_PLANE);
  }

  /**
   * 物理的に存在するパネルの枚数（domの要素数）
   * @type {number}
   */
  get panelCount(){
    return this._root.getElementsByClassName(CLASS_PLANE).length;
  }

  /**
   * 回転角の最大値を返します。
   * 全てのパネルが円周に収まっている場合、回転角は-180～+180からDEAD_ANGLEを除いた値の間です。
   * 最小角でならべても全てのパネルが円周に収まらない場合、回転角の最大値は180を超えます。
   * 例えば、最小角度が30でパネルが13枚の場合、maxDegreeは195になります。
   * @type {number}
   */
  get maxDegree(){
    return Math.max(HALF_ROUND_ANGLE, this.panelCount * MIN_PANEL_ANGLE/2);
  }

  /**
   * 回転角の最小値を返します。
   * 全てのパネルが円周に収まっている場合、回転角は-180～+180からDEAD_ANGLEを除いた値の間です。
   * 最小角でならべても全てのパネルが円周に収まらない場合、回転角の最小値は-180を下回ります。
   * 例えば、最小角度が30でパネルが13枚の場合、minDegreeは-195になります。
   * @type {number}
   */
  get minDegree(){
    return -this.maxDegree;
  }

  /**
   * パネル間の角度を返します。パネルの枚数が多い場合、角度は_minPanelAngle未満にならないよう調整されます。
   * @type {number}
   */
  get panelAngle(){
    return Math.max(ROUND_ANGLE/this.panelCount , MIN_PANEL_ANGLE);
  }

  /**
   * 上限と下限の間に収まるよう値を正規化します。
   * 上限を超えると下限につながり、下限を下回ると上限につながります
   * @param {number} val 正規化する値
   * @param {number} min 下限
   * @param {number} max 上限
   * @param {boolean} isBottomIncluded 上限と下限のどちらを範囲に含めるか。trueの場合には下限側が範囲に含まれます。
   * @return {number}
   */
  _wrapNumber(val,min,max,isBottomIncluded){
    const len = max-min;
    const dist = val-min;
    const zeroValue = isBottomIncluded ? min : max;
    return (dist%len)===0?zeroValue : ((dist<0? max : min) + (dist%len));
  }

  /**
   * 入力角をminDegree<deg<=maxDegreeを満たすよう正規化します。
   * minDegree=-200, maxDegree=200の時に-250を与えると、結果は150になります。
   * @param {number} deg 任意の入力角
   * @return {number} 正規化された角度
   */
  normalizeDegree(deg){
    return this._wrapNumber(deg,this.minDegree,this.maxDegree,false);
  }

  /**
   * パネルのインデックスを0<=index<panelCountを満たすよう正規化します。
   * @param {number} index
   * @return {number} 正規化されたindex
   */
  normalizePanelIndex(index){
    return this._wrapNumber(index,0,this.panelCount,true);
  }

  /**
   * 回転角からパネルのインデックスを返します。
   * 戻り値は0以上panelCount未満の小数値になります。
   * @param {number} deg 任意の回転角
   * @return {number} panelIndex
   */
  getPanelIndexByDegree(deg){
    const ndeg = this.normalizeDegree(deg);
    const index = ndeg / this.panelAngle;
    return this.normalizePanelIndex(index * (this._isReversed?-1:1));
  }

  /**
   * パネルのインデックスから回転角を返します。
   * 戻り値はminDegreeからmaxDegreeの間になります。
   * @param {number} index
   * @return {number} 回転角
   */
  getDegreeByPanelIndex(index){
    const nIndex = this.normalizePanelIndex(index);
    const deg = nIndex * this.panelAngle;
    return this.normalizeDegree(deg * (this._isReversed?-1:1));
  }


  update(){
    this._setPlanesDeg(this._degree);
  }

  focus(panelIndex){
    let startDeg = this._degree;
    let endDeg = this.getDegreeByPanelIndex(panelIndex);
    if(Math.abs(endDeg - startDeg) < 1.0){return}

    // 180度の境界を超える側に回転させるべきか?
    const shouldOverEdge = Math.max(startDeg,endDeg)-Math.min(startDeg,endDeg) > HALF_ROUND_ANGLE;
    if(shouldOverEdge){
      // 境界を超える場合は、回転量を求め、開始角から回転角分だけ回すようにする
      // 終了角が境界値の上限or下限を超えても表示する際に正規化されるため問題なし
      // 例 : 回転角の上/下限が150/-150度で、120度から-120度まで回す場合、
      //      回転角 = 60度
      //      終了角 = 120 + 60 = 180度
      //      とする
      const len = this.maxDegree - this.minDegree - Math.abs(startDeg - endDeg);
      endDeg = (startDeg<0)? startDeg - len : startDeg + len;
    }

    const ease = BezierEasing(0.215, 0.61, 0.355, 1);
    const startTime = Date.now();
    const endTime = startTime + 1000;
    clearInterval(this.__focusTimerId);
    this.__focusTimerId = setInterval(()=>{
      const timeR = Math.min(1, (Date.now() - startTime) / (endTime - startTime));
      const degR  = ease(timeR);
      const deg = startDeg + (endDeg - startDeg)*degR;
      this._setPlanesDeg(deg);
      if(degR >= 1){
        clearInterval(this.__focusTimerId);
      }
    },25);
  }

  _angleBetween(a1,a2,siIncludingZero){

  }

  _setCssTrans(elem,props){
    let propStrs = [];
    Object.keys(props).forEach((key)=>{
      const val = props[key]||'';
      const valStr = (val.constructor===Array)?val.join(','):val.toString();
      propStrs.push(key+'('+valStr+')');
    });
    elem.style['-webkit-transform'] = elem.style['transform'] = propStrs.join(' ');
  }

  /**
   * 値が下限と上限で定められた範囲に含まれるか判定します。
   * 下限 < 上限の場合：下限 <= 判定値 <= 上限 ならtrue
   * 下限 >= 上限の場合：下限 <= 判定値 || 判定値 <= 上限 ならtrue
   * @param {number} val
   * @param {number} min
   * @param {number} max
   */
  _isInRange(val,min,max){
    if(min < max){
      return min <= val && val <= max;
    }else{
      return min <= val || val <= max;
    }
  }

  _setPlanesDeg(offset){
    const planes = $(this.panels);
    const minView = -VIEW_ANGLE/2;
    const maxView = VIEW_ANGLE/2;
    const nOffset = this.normalizeDegree(offset);
    //const minIndex = Math.ceil(this.getPanelIndexByDegree(minView + nOffset));
    //const maxIndex = Math.floor(this.getPanelIndexByDegree(maxView + nOffset));

    const degAdjFunc = BezierEasing(.16,.38,.7,.75);

    //console.log(`view area = ${minIndex} to ${maxIndex}`);
    planes.each((index)=>{
      const elem = planes[index];
      const deg = this.normalizeDegree(this.getDegreeByPanelIndex(index) - nOffset);

      let scale = DEFAULR_SCALE;
      let adjDeg = deg;
      // センターから左右1枚以内ならスケールを調整（少し拡大する）
      if(Math.abs(deg) < MIN_PANEL_ANGLE){
        const r = Math.abs(deg) / (MIN_PANEL_ANGLE);
        scale = DEFAULR_SCALE * (r) + MAX_SCALE * (1-r);
      }
      // センターから左右2枚以内は角度を調整
      if(Math.abs(deg) < MIN_PANEL_ANGLE*2){
        const r = Math.abs(deg) / (MIN_PANEL_ANGLE*2);//0-1
        adjDeg = degAdjFunc(r) * MIN_PANEL_ANGLE*2 * (deg>=0?1:-1);
      }
      //console.log(`panel ${index} = deg:${deg}`,adjDeg,this._isInRange(index,minIndex,maxIndex),minIndex,maxIndex);
      //!this._isInRange(index,minIndex,maxIndex) ||
      if(!this._isInRange(adjDeg,minView,maxView)){
        $(elem).hide();
        return;
      }
      $(elem).show();

      // パネルの枚数が極端に少ない場合に表示を中心に寄せる
      const centeringDegAdjScale = this.panelCount <= 2 ? 0.6 : 0.75;
      // CSSプロパティに変換して画面表示
      this._setCssTrans(elem,{rotateY:(adjDeg*centeringDegAdjScale+180)+'deg',translateZ:TRANSLATE_Z,scale});
      //$(elem).find('.debug').text(`${index}`);
    });
    this._degree = nOffset;
  }

  _initDragEvents(targetElem){
    let touchStartX;
    let touchStartY;
    let touchStartMs;
    let touchMoveX;
    let lastOffset = 0;

    const isSwiped = (x,y)=>{
      const maxTapMs = 500;
      const maxTapPx = 10;
      return (x-touchMoveX)^2 + (y-touchStartY)^2 > maxTapPx^2 || Date.now() - touchStartMs > maxTapMs;
    }

    // フリック開始時
    targetElem.addEventListener('touchstart', (e)=>{
      this.trigger('touchstart');
      e.preventDefault();
      // 座標の取得
      lastOffset = this._degree;
      touchStartX = e.touches[0].pageX;
      touchStartY = e.touches[0].pageY;
      touchStartMs = Date.now();
    }, false);

    // スワイプ移動時
    targetElem.addEventListener('touchmove', (e)=>{
      e.preventDefault();
      // 座標の取得
      touchMoveX = e.changedTouches[0].pageX;
      const deg = (touchMoveX-touchStartX)*TOUCH_SCALE;
      this._setPlanesDeg(deg + lastOffset);
      //console.log(deg + lastOffset);
    }, false);

      // スワイプ終了時
    targetElem.addEventListener('touchend', (e)=>{
      e.preventDefault();
      // 座標の取得
      touchMoveX = e.changedTouches[0].pageX;
      const deg = (touchMoveX-touchStartX)*TOUCH_SCALE;
      const index = Math.round(this.getPanelIndexByDegree(deg + lastOffset));
      this.focus(index);
      const eventName = isSwiped(e.changedTouches[0].pageX,e.changedTouches[0].pageY) ? 'swaiped' : 'taped';
      this.trigger(eventName,index);
    }, false);
  }

}
