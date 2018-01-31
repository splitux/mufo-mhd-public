const config =  {
    data : {
        /* ビルドパスの設定 */
        'path' : {
            'dev' : {
                'dest' : 'dist'
            },
            'prd' : {
                'dest' : 'prod'
            }
        },
        /* ビルド時の一括置換設定 */
        /* この下に書いたものはビルド時に一括置換されます */
        /* html,jsには「@@key」のように「@@」を頭につけて記述してください */
        'replace' : {
            'dev' : {
                'firebase.apiKey': '',
                'firebase.authDomain': '',
                'firebase.databaseURL': '',
                'firebase.projectId': '',
                'firebase.storageBucket': '',
                'firebase.messagingSenderId': '',
                'common.fqdn':'' /* 独自ドメインまたはfirebase.authDomainの値を設定 */
            },
            'prd' : {
              'firebase.apiKey': '',
              'firebase.authDomain': '',
              'firebase.databaseURL': '',
              'firebase.projectId': '',
              'firebase.storageBucket': '',
              'firebase.messagingSenderId': '',
              'common.fqdn':'' /* 独自ドメインまたはfirebase.authDomainの値を設定 */
        }
        }
    },

    get replaceDev(){
        return replaceMap('dev');
    },

    get replacePrd(){
        return replaceMap('prd');
    }

};

const replaceMap = (type)=>{
    const def = config.data.replace[type];
    const maps = [];
    Object.keys(def).forEach((key)=>{
        maps.push({match : key , replacement : def[key]});
    });
    return maps;
}

export default config;


