export default class HandlerKeeper {

  // firebaseのリアルタイムDBが返すハンドラーを保持するクラスです
  // 不要になったハンドラを一括でoffすることができます

  /**
   * DBへの参照を指定して、そのDBに対する巣ベントハンドラを管理・保持します。
   * @param {firebaseref} rootRef DBへのリファレンス
   */
  constructor(rootRef) {

    if(!rootRef){
      throw 'Err: no rootref for HandleKeeper';
    }
    this.ref = rootRef;
    this.fns = {};

  }

  /**
   * 指定のパス・イベント名にハンドラ関数を登録し、実際にrefに対してコールバックを設定します
   * 同一のパスとイベントの組合せに登録できるハンドラは一つだけです。
   * 2つ目を登録しようとするとエラーになります。
   * @param {string} path
   * @param {string} eventname
   * @param {function} fn
   * @return {function} 登録したハンドラを解除するための関数。引数なしで呼び出すと解除できます。
   */
  regist(path, eventname, fn) {
    const unregister = this.add(path, eventname, fn);
    if(unregister){
      this.ref.child(path).on(eventname, fn);
    }
    return unregister;
  }

  /**
   * 指定のパス・イベント名にハンドラ関数を登録します。refに対するコールバックの設定は行いません
   * 同一のパスとイベントの組合せに登録できるハンドラは一つだけです。
   * 2つ目を登録しようとするとエラーになります。
   * @param {string} path
   * @param {string} eventname
   * @param {function} fn
   * @return {function} 登録したハンドラを解除するための関数。引数なしで呼び出すと解除できます。
   */
  add(path, eventname, fn) {
    const key = path + ':' + eventname;
    if (this.fns[key]) {
      //重複登録はNGとする
      console.error('handler for [' + key + '] is already registed');
      return;
    }
    this.fns[key] = fn;
    return () => { this.remove(path, eventname) };
  }

  /**
   * 指定のパス・イベント名のハンドラを解除します
   * @param {string} path
   * @param {string} eventname
   */
  remove(path, eventname) {
    const key = path + ':' + eventname;
    const fn = this.fns[key];
    if (fn) {
      this.ref.child(path).off(eventname, fn);
      delete this.fns[key];
    }
  }

  /**
   * このHandleKeeperで登録された全てのハンドラを登録解除します
   */
  removeAll() {
    Object.keys(this.fns).forEach((key) => {
      const fn = this.fns[key];
      if (fn) {
        const arr = key.split(/:/);
        const eventname = arr.pop();
        const path = arr.join(':');
        this.ref.child(path).off(eventname, fn);
        delete this.fns[key];
      }
    });
  }

}
