/*
  cookieを管理するクラス
*/

export default class CookieManager {
  constructor () {}
  // cookieをセットする
  // 引数は名前、値、保存期間
  setCookie (name, val, days) {
    let e = new Date();
    e.setTime(e.getTime() + 1000 * 3600 * 24 * days);
    let utc = e.toUTCString();
    const secure = (location.protocol === 'http:' ? '' : 'secure');
    document.cookie = `${name}=${val}; path=/; expires=${utc}; ${secure}`;
  }
  // 名前を指定してcookieを返す
  getCookie (name) {
    let r = null;
    let c = `${name}=`;
    let allcookies = document.cookie;
    let position = allcookies.indexOf(c);
    if(position != -1){
      let startIndex = position + c.length;
      let endIndex = allcookies.indexOf(';', startIndex);
      if(endIndex == -1){
        endIndex = allcookies.length;
      }
      r = decodeURIComponent(allcookies.substring(startIndex, endIndex));
    }
    return r;
  }
}
