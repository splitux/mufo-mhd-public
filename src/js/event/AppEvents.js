
const AppEvents = {

  EARTH_MOVED: 'e.earth.moved',
  EARTH_MUFOS_CHANGED: 'e.earth.mufos-changed',

  MUFO_CREATED: 'e.mufo.mufo-created',
  MUFO_REMOVED: 'e.mufo.mufo-removed',
  MUFO_CHANGED: 'e.mufo.mufo-data-changed',
  MUFO_PREPARED: 'e.mufo.mufo-prepared',
  MUFO_SONG_ADDED : 'e.mufo.song-added',
  MUFO_SONG_REMOVED : 'e.mufo.song-removed',
  MUFO_ENTERED : 'e.mufo.mufo-entered',
  MUFO_EXITED : 'e.mufo.mufo-exited',
  MUFO_REACTION_ADDED : 'e.mufo.reaction-added',
  MUFO_PLAYSONG_STARTED : 'e.mufo.playsong-started',
  MUFO_PLAYSONG_STOPPED : 'e.mufo.playsong-stopped',
  MUFO_PLAYSONG_CHANGED : 'e.mufo.playsong-changed',

  USER_LOGGEDIN: 'e.user.loggedin',
  USER_LOGGEDOUT: 'e.user.loggedout',
  USER_PROFILE_CHANGED: 'e.user.profile-changed',

  NOTIF_CHANGED: 'e.notif.changed',
  NOTIF_COUNT_CHANGED: 'e.notif.count-changed',

  INVI_INVITED: 'e.invi.invited',

  _reverse: (val) => {
    let result;
    Object.keys(AppEvents).forEach((key) => {
      if (AppEvents[key] === val) { result = key }
    });
    return result;
  }


};

export default AppEvents;
