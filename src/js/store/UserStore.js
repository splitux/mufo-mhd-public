import Actions from '../action/AppActions';
import Events  from '../event/AppEvents';
import StoreBase from './StoreBase';
import FbLoginUserRef from '../firebase/FbLoginUserRef';

export default class UserStore extends StoreBase {
  constructor() {
    super();

    // ストアのデータ
    this._data = {
      user: null
    };

    // データソースを初期化
    const dataRef = new FbLoginUserRef();
    this._dataRef = dataRef;
    dataRef.initLoginState(false);

    // データソースのイベント
    dataRef.on('loggedin',(user)=>{
      this._data.user = user;
      this.triggerEvent(Events.USER_LOGGEDIN);
    });
    dataRef.on('loggedout',(user)=>{
      this._data.user = null;
      this.triggerEvent(Events.USER_LOGGEDOUT);
      // 強制的に再読み込み
      document.location = '/';
    });
    dataRef.on('profilechanged',(user)=>{
      this._data.user = (user&&user.uid)?user:null;
      this.triggerEvent(Events.USER_PROFILE_CHANGED);
    });

    // 以下、受信したい（自分が処理できる）イベントを登録 //
    this.on(Actions.USER_LOGIN, (logintype) => {
      const isGoLogin = !!logintype;
      dataRef.initLoginState(isGoLogin,logintype);
    });

    this.on(Actions.USER_LOGOUT, () => {
      dataRef.logout();
    });

    this.on(Actions.USER_CHANGE_PROFILE, (userModel,fields) => {
      if(this.uid !== userModel.uid){throw 'ERR: user update was rejected'}
      dataRef.userRef.setUser(userModel,fields);
    });


  }

  // データを開示するためのgetter（参照型は全てコピーして返すこと）

  get uid() {
    return this._data.user? this._data.user.uid : null;
  }

  get currentUser() {
    return this._data.user? this._data.user.clone() : null;
  }


}
