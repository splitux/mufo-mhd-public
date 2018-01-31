import riot from 'riot';
import route from 'riot-route';

/* PCからアクセスされた場合、sorryページを表示 */
if( !isMobile() ){
  window.location.href = '/#/sorry';
}

/* ルートにアクセスされた場合、earthへ遷移 */
if( !window.location.hash || window.location.hash === '#/') {
  window.location.href = '/#/earth';
}

route('/sorry', () => {
  riot.mount('stage', 'sorry');
  dialogContent(false);
});

route('/earth..', () => {
  warpStageContent('earth');
  slideContent(false);
  dialogContent(true);
});

route('/login..', () => {
  riot.mount('stage', 'login');
  slideContent(false);
  dialogContent(false);
});

route('/init', () => {
  // riot.mount('stage', 'init');
  // slideContent(false);
});

route('/create-mufo..', () => {
  assertLoggedin();
  warpStageContent('create-mufo');
  slideContent(false);
  dialogContent(false);
});

route('/add-song..', () => {
  assertLoggedin();
  slideContent('add-song');
  dialogContent(false);
});

route('/mufo..', () => {
  warpStageContent('mufo');
  slideContent(false);
  dialogContent(false);
});

route('/prof-edit..', () => {
  assertLoggedin();
  slideContent('prof-edit');
  dialogContent(false);
});

/*
  横スライドコンテンツの管理
  引数にtag名で表示・falseで非表示
*/

function slideContent (tag) {
  if (tag == false) {
    $('#slide-content').removeClass('show');
  } else {
    riot.mount('slide-content', tag);
    $('#slide-content').addClass('show');
  }
}

/*
  ステージコンテンツの管理
  引数にtag名を入れてホワイトアウトトランジションする
*/

function warpStageContent (tag) {
  // stageのタグが変更されない場合、トランジションを挟まない
  if ($('stage').attr('data-is') == tag) {
    riot.mount('stage', tag);
    return;
  }
  // mufoの作成、乗り降りの際、トランジションを挟んでから遷移
  $('#stage').addClass('warp').animate({
    opacity: 0
  }, 850, 'swing', function () {
    riot.mount('stage', tag);
    $(this).removeClass('warp').animate({
      opacity: 1
    }, 350, 'swing');
  });
}

/*
  ダイアログの管理
  引数にbooleanを入れてマウントの有無を指定
*/

function dialogContent (bool) {
  riot.mount('dialog-content', 'earth-dialog', {mountFlag:bool});
}

/*
  UA判定
  モバイル端末判定、PCから接続された場合false
*/
function isMobile(){
    const ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('iphone') > 0 || ua.indexOf('ipod') > 0 || ua.indexOf('android') > 0 || ua.indexOf('ipad') > 0) {
      return true;
    } else {
      return false;
  }
}

/**
 * ログインしていない状態で表示することのない画面に直接遷移された場合に強制的にメインページにリダイレクトします
 */
function assertLoggedin(){
  if(!App || !App.uid){
    console.warn('ログインしていません');
    window.location.href = '/';
  }
}

export default route;
