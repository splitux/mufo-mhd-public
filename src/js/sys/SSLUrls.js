import SysConfig from './SysConfig.js';

export default {

    toSSL   :   (url)=>{
        if(!url){return url;}
        if(SysConfig.sslfallback){return url;}
        if(url.startsWith('https:')){return url;}
        const proxy = SysConfig.sslserver;

        const matAudio  = url.match(/^http:\/\/audio\.itunes\.apple\.com\/(.*)$/);
        if(matAudio){
            const path = matAudio[1];
            return `${proxy}/song/audio/${path}`
        }

        const matVideo  = url.match(/^http:\/\/video\.itunes\.apple\.com\/(.*)$/);

        if(matVideo){
            const path = matVideo[1];
            return `${proxy}/song/video/${path}`
        }

        const matPhobos  = url.match(/^http:\/\/([a-zA-Z0-9]+)\.phobos\.apple\.com\/(.*)$/);
        if(matPhobos){
            const svr =  matPhobos[1];
            const path = matPhobos[2];
            return `${proxy}/song/${svr}/${path}`
        }

        const matImg  = url.match(/^http:\/\/is([0-9]+)\.mzstatic\.com\/(.*)$/);
        if(matImg){
            const svrNo =  matImg[1];
            const path = matImg[2];
            return `https://is${svrNo}-ssl.mzstatic.com/${path}`
        }

        console.warn(`想定外のURLパターンです : ${url}`);
        return url;

    }

}
