import AppEvents from '../event/AppEvents'

export default class StoreBase {
  constructor() {
    // イベントを扱えるようにriotに登録
    riot.observable(this);

  }

  /**
   * triggerと同じです。コンソールログに情報を出力します
   * @param {string} eventName
   * @param {any} 任意数の引数
   */
  triggerEvent(name, ...args) {
    if (!name) {
      console.error('INVALID Event!', args);
      return;
    }
    if (App.DEBUG) {
      console.log('event', AppEvents._reverse(name), ...args);
    }
    this.trigger(name, ...args);
  }

}
