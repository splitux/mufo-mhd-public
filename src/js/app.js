import riot from 'riot';
import RiotControl from 'riotcontrol';
import AppEvents from './event/AppEvents';
import AppActions from './action/AppActions';
import EarthStore from './store/EarthStore';
import UserStore from './store/UserStore';
import MufoStore from './store/MufoStore';
import NotifStore from './store/NotifStore';
import InviStore from './store/InviStore';
import LogStore from './store/LogStore';
import router from './router.js';

import MufoModel from './model/MufoModel';
import LocationModel from './model/LocationModel';
import UserModel from './model/UserModel';
import SongModel from './model/SongModel';
import NotifModel from './model/NotifModel';
import InviModel from './model/InviModel';
import firebase from './firebase/firebase';

import AudioVisualizer from './view/audioVisualizer';
import StarManager from './view/starManager';
import CustomMarker from './view/customMarker';
import MapManager from './view/mapManager';
import FloatingMufo from './view/floatingMufo';
import CookieManager from './view/cookieManager';
import ListPlayer from './view/ListPlayer';
import GalleryStage from './view/GalleryStage';
import Shake from 'shake.js';
import Anime from 'animejs';

import SSL from './sys/SSLUrls';
import SysConfig from './sys/SysConfig';
import LocalController from './sys/RiotControlHandlerKeeper.js';

import testSongs from './testdata/songs.js';

class Application {
  constructor() {
    this.controller = RiotControl;
    this.events = AppEvents;
    this.actions = AppActions;
    this.router = router;
    this.DEBUG = true;

  }

  // アプリを初期化します
  // htmlのbody末尾または$(document).readyで呼び出すことを想定しています
  init() {
    SysConfig.init(()=>{
      if(SysConfig.sslfallback){
          console.warn('SSLFALLBACK enabled');
      }
      this.oninit();
    });
  }

  oninit() {

    // データストアの登録
    // データストアが増えた場合はここに追記します
    this.stores = Object.freeze({
      earthStore: new EarthStore()
      , userStore: new UserStore()
      , mufoStore: new MufoStore()
      , notifStore: new NotifStore()
      , inviStore: new InviStore()
      , logStore: new LogStore()
    });

    Object.keys(this.stores).forEach((key) => {
      const store = this.stores[key];
      this.controller.addStore(store);
    });

    // モデルの登録
    this.models = Object.freeze({
      MufoModel
      , LocationModel
      , UserModel
      , SongModel
      , NotifModel
      , InviModel
    });

    // ビューで利用するオブジェクトの登録
    this.views = Object.freeze({
      AudioVisualizer,
      StarManager,
      MapManager: new MapManager(),
      CustomMarker,
      FloatingMufo: new FloatingMufo(),
      CookieManager: new CookieManager(),
      Shake,
      Anime,
      ListPlayer,
      GalleryStage,
      testSongs
    });

    // システムツール・ユーティリティを登録
    this.sys = Object.freeze({
      SSL,
      SysConfig,
      LocalController
    });
    // appタグをマウント
    // html直下に置くのはappタグのみとすることを想定しているので、'*'にはしていません
    riot.mount('app');

    // ルーティングの監視をスタート
    this.router.start(true);

  }

  /**
   * アプリ（ストア）の状態変化イベントを受取ります。
   * @param eventName{string} App.eventsで定義されるイベント名
   * @param handler{function(stateData)} event発行時に呼び出したいコールバック関数
   */
  on(eventName, handler) {
    if (!eventName) { throw `invalid event name ${eventName}`; }
    this.controller.on(eventName, handler);
  }

  /**
   * riotcontroller.offのショートカットです
   * @param {ANY} params
   */
  off(...params) {
    this.controller.off(...params);
  }

  /**
   * アプリに対するアクションをトリガします。
   * @param actionName{string} App.actionsで定義されるアクション名
   * @param actionParam{Object} アクションに引き渡されるデータ。具体的な内容はアクションの定義またはドキュメントを参照
   */
  trigger(actionName, ...actionParam) {
    const actionKey = AppActions._reverse(actionName);
    if (!actionKey) { throw `invalid action name ${actionName}`; }
    if (this.DEBUG) { console.log('action', actionKey, ...actionParam) }
    this.controller.trigger(actionName, ...actionParam);
    this.controller.trigger(AppActions._LOG_ACTIONLOG, actionName, ...actionParam);
  }

  /**
   * 特定のタグやクラスで利用するためのローカルなコントローラを生成します。
   * Appと同様にonおよびtriggerが利用できます。
   * ローカルコントローラは上記に加えてoffAllメソッドを持ち、これを呼ぶことでこのローカルコントローラに
   * onメソッドで登録した全てのイベントハンドラを一括して解除できます。
   * @return {LocalController}
   */
  newLocalController() {
    return new App.sys.LocalController(this);
  }

  get uid() {
    return this.stores.userStore.uid;
  }

  /**
   * 端末毎にユニークなIDを返します。
   * このIDは未ログイン状態でも利用できますが、uidとは非互換です。
   * IDは端末のCookieに保存されるため、同じuidに対して複数のauidが存在するケーズがあります。
   */
  get auid() {
    let id = this.views.CookieManager.getCookie('auid');
    if(!id){
      id = 'au' + firebase.database().ref().push().key;
      this.views.CookieManager.setCookie('auid',id,365);
    }
    return id;
  }


}

// グローバルに利用する必要があるモジュールをエクスポートします
// 通常のjsはES2015でimportを利用して読み込みができるので、この方法でエクスポートが必要なのはriotタグ内で必要としているモジュールのみです
// npmでインストールした他のモジュールを追加する場合は、下のriotと同様にしてください
window.riot = riot;
window.App = new Application()
window.firebase = firebase; //for test
