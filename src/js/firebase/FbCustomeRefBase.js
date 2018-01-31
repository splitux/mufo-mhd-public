
import firebase from './firebase.js';
import HandleKeeper from './HandleKeeper.js';

export default class FbCustomeRefBase {
  constructor(rootRef) {
    this.rootRef = rootRef || firebase.database().ref();

    // 内部で生成するDBの変更監視ハンドラを保持するオブジェクト
    // クエリの変更等で不要になった際にまとめて破棄するために利用
    this._handlers = new HandleKeeper(this.rootRef);

    // リストの変更時に通知する
    this._callbacks = {
    };


  }

  /**
      内容の変更を監視するイベントハンドラをセットします
      @param eventName {string}
      @param handler {function}
      @param return {function} handlerをそのまま返します
  */
  on(eventName, handler) {
    if (!eventName || !handler) { throw 'invalid param' }
    if (!this._callbacks[eventName]) {
       throw 'unknown event name : ' + eventName
    }
    this._callbacks[eventName].push(handler);
    return handler;
  }


  /**
      onでセットした監視をクリアします
      @param eventName {string} child_added/child_removed
      @param handler {function}
  */
  off(eventName, handler) {
    const fns = this._callbacks[eventName];
    if (!fns || !fns.length) { return }
    const index = fns.indexOf(handler);
    if (index <= -1) { return }
    this._callbacks[eventName].splice(index, 1);
  }

  /**
   * onでセットされたハンドラを呼び出します
   */
  _trigger(eventName, ...params) {
    const fns = this._callbacks[eventName];
    if (!fns || !fns.length) { return }
    fns.forEach((fn) => {
      fn(...params);
    });
  }


  _defineCallback(eventName) {
    if (!this._callbacks[eventName]) {
      this._callbacks[eventName] = [];
    }
  }


}
