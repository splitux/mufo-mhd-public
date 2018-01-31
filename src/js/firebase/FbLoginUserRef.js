import firebase from './firebase.js';
import FbCustomeRefBase from './FbCustomeRefBase.js';
import FbUserRef from './FbUserRef';

export default class FbLoginUserRef extends FbCustomeRefBase {

  constructor(rootRef) {
    super(rootRef);
    this._defineCallback('loggedin');//um
    this._defineCallback('loggedout');
    this._defineCallback('loginstarted');
    this._defineCallback('profilechanged');
    this._userRef = new FbUserRef(this.rootRef);
    this._activeUpdateTimer = null;

    // Refのイベント
    this._userRef.on('changed', (um) => {
      this._trigger('profilechanged', um);
    })

  }


  // ログアウト
  logout() {
    clearInterval(this._activeUpdateTimer);
    firebase.auth().signOut().then(() => {
      this._trigger('loggedout');
      this._userRef.watchUser(null);
    }, (error) => {
      console.warn('Logout failed');
    });
  }

  // googleでログイン
  loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  }

  // facebookでログイン
  loginWithFacebook() {
    const provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  }

  // Twitter
  loginWithTwitter() {
    const provider = new firebase.auth.TwitterAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  }


  /**
   * ログイン状況の初期化
   * @param {boolean} autoLogin セッションが無い場合にログインを試行するか
   * @param {string} provider ログインを試行する場合に利用するSNS名
   */
  initLoginState(autoLogin, provider) {

    // 初期化中の可能性があるので、変更監視
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // セッションを確立できたら、そのまま利用
        console.log('onAuthStateChanged: logged in', user);
        // ユーザ情報を取得（未登録なら自動的に新規登録される）
        this._userRef.getUserOnce(user.uid, (um) => {
          this._trigger('loggedin', um);
          um.logindate = Date.now();
          // ログイン日時を更新
          this._userRef.setUser(um, ['logindate'])
          // ユーザ情報変更を監視
          this._userRef.watchUser(user.uid);
          // アクティブ日時の更新をセット
          this._setActiveUpdater(user.uid);
        }, true);
      } else {
        // セッションを確立できなければ、ログイン要求
        if (!autoLogin) {
          console.log('not logged in');
          //this.userData.setLoginData({ state: this.NOT_LOGGEDIN });
          //this.trigger(App.events.USER.LOGIN_STATE_CHANGED, this.NOT_LOGGEDIN);
          return;
        }
        switch (provider) {
          case 'google':
            console.log('try to login : google');
            this.loginWithGoogle();
            this._trigger('loginstarted', 'google');
            break;

          case 'facebook':
            console.log('try to login : facebook');
            this.loginWithFacebook();
            this._trigger('loginstarted', 'facebook');
            break;

          case 'twitter':
            console.log('try to login : twitter');
            this.loginWithTwitter();
            this._trigger('loginstarted', 'twitter');
            break;

          default:
            console.error('unknown auth provider', provider);
            break;
        }
      }
    })
  }

  /**
   * 最終アクセス日時の自動更新をセットします。
   * アプリを使っている間ログアウトするまで、1分ごとに最終アクセス日時を更新します。
   */
  _setActiveUpdater(uid){
    clearInterval(this._activeUpdateTimer);
    this._activeUpdateTimer = setInterval(()=>{
      this._userRef.updateActived(uid);
    },60*1000);
    this._userRef.updateActived(uid); //即時実行
  }

  get userRef() { return this._userRef }


}
