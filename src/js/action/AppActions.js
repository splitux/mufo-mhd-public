
const AppActions = {

  EARTH_MOVE: 'a.earth.move',
  EARTH_JUMP: 'a.earth.jump',

  MUFO_CREATE: 'a.mufo.create-mufo',
  MUFO_REMOVE: 'a.mufo.remove-mufo',
  MUFO_ENTER: 'a.mufo.enter-mufo',
  MUFO_EXIT: 'a.mufo.exit-mufo',
  MUFO_ADD_SONG: 'a.mufo.add-song',
  MUFO_REMOVE_SONG: 'a.mufo.remove-song',
  MUFO_ADD_REACTION: 'a.mufo.add-reaction',
  MUFO_START_PLAYSONG: 'a.mufo.start-playsong',
  MUFO_STOP_PLAYSONG: 'a.mufo.stop-playsong',
  MUFO_CHANGE_PLAYSONG: 'a.mufo.change-playsong',

  /** USER_LOGIN, logintype=['facebook'|'twitter'|'google'] */
  USER_LOGIN: 'a.user.login',
  USER_LOGOUT: 'a.user.logout',
  USER_CHANGE_PROFILE: 'a.user.change-profile',

  NOTIF_REQUEST: 'a.notif.request',
  NOTIF_WATCH_USER: 'a.notif.watch-user',
  NOTIF_MARK_OPENED: 'a.notif.mark-opened',

  INVI_ENABLE: 'a.invi.enable',
  INVI_DISABLE: 'a.invi.disable',
  INVI_REQUEST: 'a.invi.request',
  INVI_ANSWER: 'a.invi.answer',

  _LOG_ACTIONLOG: 'a.log.actionlog',

  _reverse: (val) => {
    let result;
    Object.keys(AppActions).forEach((key) => {
      if (AppActions[key] === val) { result = key }
    });
    return result;
  }
};

export default AppActions;
