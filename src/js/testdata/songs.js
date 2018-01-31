import SongModel from '../model/SongModel';

const source = [
{
  'artistname' : 'みゆはん',
  'color' : 1,
  'created' : 1493643014251,
  'songcode' : '1203185037',
  'songpreview' : 'http://audio.itunes.apple.com/apple-assets-us-std-000001/AudioPreview122/v4/50/52/44/5052447f-ecbc-6aa3-e856-3be131716f6d/mzaf_4515376839897477716.plus.aac.p.m4a',
  'songpurchase' : 'https://itunes.apple.com/jp/album/%E3%81%BC%E3%81%8F%E3%81%AE%E3%83%95%E3%83%AC%E3%83%B3%E3%83%89/id1203184978?i=1203185037&uo=4',
  'songthum' : 'https://is4-ssl.mzstatic.com/image/thumb/Music122/v4/e9/06/13/e90613c7-05e0-f161-88c3-18d9c171ccf4/source/100x100bb.jpg',
  'songtitle' : 'ぼくのフレンド',
  'usericon' : '4',
  'userid' : 'Dicp1t8PjZef0vyvFfq6qypakyx1',
  'username' : 'iPhone '
}, {
  'artistname' : 'きゃりーぱみゅぱみゅ',
  'color' : 4,
  'created' : 1494861278118,
  'songcode' : '969968874',
  'songpreview' : 'http://a1314.phobos.apple.com/us/r30/Music1/v4/08/ec/be/08ecbeca-f291-f0ba-598a-7239ee0e9dfc/mzaf_7834560337569556792.plus.aac.p.m4a',
  'songpurchase' : 'https://itunes.apple.com/jp/album/%E3%82%82%E3%82%93%E3%81%A0%E3%81%84%E3%82%AC%E3%83%BC%E3%83%AB/id969968873?i=969968874&uo=4',
  'songthum' : 'http://is2.mzstatic.com/image/thumb/Music1/v4/22/78/6b/22786b71-e2d4-56f1-3263-faad37ad8a43/source/100x100bb.jpg',
  'songtitle' : 'もんだいガール',
  'usericon' : '5',
  'userid' : 'VG4kMFAnTocx63UNI4w02rEByP93',
  'username' : 'myaaao'
}, {
  'artistname' : 'ディズニー',
  'color' : 1,
  'created' : 1494857194436,
  'songcode' : '316146606',
  'songpreview' : 'http://a492.phobos.apple.com/us/r30/Music/v4/39/7a/ff/397aff1c-3b27-2d5e-bed9-a3b6c0b4bd97/mzaf_2435111893712353297.aac.m4a',
  'songpurchase' : 'https://itunes.apple.com/jp/album/%E3%83%9B%E3%83%BC%E3%83%AB-%E3%83%8B%E3%83%A5%E3%83%BC-%E3%83%AF%E3%83%BC%E3%83%AB%E3%83%89/id316146394?i=316146606&uo=4',
  'songthum' : 'http://is1.mzstatic.com/image/thumb/Music/v4/db/8e/33/db8e3352-a189-87d2-aa00-2624e99ce283/source/100x100bb.jpg',
  'songtitle' : 'ホール・ニュー・ワールド',
  'usericon' : '5',
  'userid' : 'VG4kMFAnTocx63UNI4w02rEByP93',
  'username' : 'myaaao'
}, {
  'artistname' : 'PPP',
  'color' : 2,
  'created' : 1493643529364,
  'songcode' : '1207712571',
  'songpreview' : 'http://audio.itunes.apple.com/apple-assets-us-std-000001/AudioPreview111/v4/69/da/f5/69daf58f-cade-aea6-6da7-b68605bc50b4/mzaf_6181864319836792971.plus.aac.p.m4a',
  'songpurchase' : 'https://itunes.apple.com/jp/album/%E3%82%88%E3%81%86%E3%81%93%E3%81%9D%E3%82%B8%E3%83%A3%E3%83%91%E3%83%AA%E3%83%91%E3%83%BC%E3%82%AF%E3%81%B8-ppp-ver/id1207712569?i=1207712571&uo=4',
  'songthum' : 'http://is1.mzstatic.com/image/thumb/Music111/v4/bc/0b/84/bc0b84a2-2493-5df6-1a77-be669686e3ed/source/100x100bb.jpg',
  'songtitle' : 'ようこそジャパリパークへ(PPP ver.)',
  'usericon' : '4',
  'userid' : 'Dicp1t8PjZef0vyvFfq6qypakyx1',
  'username' : 'iPhone '
}, {
  'artistname' : 'Every Little Thing',
  'color' : 4,
  'created' : 1493643300078,
  'songcode' : '1159584402',
  'songpreview' : 'http://audio.itunes.apple.com/apple-assets-us-std-000001/AudioPreview71/v4/df/9a/9b/df9a9b2d-23bb-d652-14e2-d352d6b98eae/mzaf_1319054383136288596.plus.aac.p.m4a',
  'songpurchase' : 'https://itunes.apple.com/jp/album/%E3%81%82%E3%81%9F%E3%82%89%E3%81%97%E3%81%84%E6%97%A5%E3%80%85/id1159584330?i=1159584402&uo=4',
  'songthum' : 'http://is1.mzstatic.com/image/thumb/Music71/v4/8c/55/b8/8c55b871-9cc2-647d-2f95-9d9f60ce5b75/source/100x100bb.jpg',
  'songtitle' : 'あたらしい日々',
  'usericon' : '4',
  'userid' : 'Dicp1t8PjZef0vyvFfq6qypakyx1',
  'username' : 'iPhone '
}, {
  'artistname' : 'きゃりーぱみゅぱみゅ',
  'color' : 6,
  'created' : 1494861179532,
  'songcode' : '593338428',
  'songpreview' : 'http://a1474.phobos.apple.com/us/r30/Music/v4/d6/16/7d/d6167d06-524f-5cf3-cc12-9b85fac1b8c0/mzaf_2736032808264108435.aac.m4a',
  'songpurchase' : 'https://itunes.apple.com/jp/album/%E3%82%AD%E3%83%9F%E3%81%AB100%E3%83%91%E3%83%BC%E3%82%BB%E3%83%B3%E3%83%88/id593338427?i=593338428&uo=4',
  'songthum' : 'http://is3.mzstatic.com/image/thumb/Music/v4/07/2f/5e/072f5e8b-5bfd-0d8b-6a4d-e8dd665dc05c/source/100x100bb.jpg',
  'songtitle' : 'キミに100パーセント',
  'usericon' : '5',
  'userid' : 'VG4kMFAnTocx63UNI4w02rEByP93',
  'username' : 'myaaao'
}, {
  'artistname' : 'PPP',
  'color' : 1,
  'created' : 1493821725414,
  'songcode' : '1198924326',
  'songpreview' : 'http://audio.itunes.apple.com/apple-assets-us-std-000001/AudioPreview122/v4/24/45/b7/2445b775-1d22-884f-b8b2-eb32ee6b0c69/mzaf_4443517877840855004.plus.aac.p.m4a',
  'songpurchase' : 'https://itunes.apple.com/jp/album/%E5%A4%A7%E7%A9%BA%E3%83%89%E3%83%AA%E3%83%BC%E3%83%9E%E3%83%BC/id1198924234?i=1198924326&uo=4',
  'songthum' : 'http://is4.mzstatic.com/image/thumb/Music122/v4/ab/8c/8e/ab8c8e40-6a6d-0bb3-ddee-399ba5a66a77/source/100x100bb.jpg',
  'songtitle' : '大空ドリーマー',
  'usericon' : '6',
  'userid' : 'UKjavviyAGTzouDciXNhH3hvpgL2',
  'username' : '(no name)'
}, {
  'artistname' : 'きゃりーぱみゅぱみゅ',
  'color' : 1,
  'created' : 1494861528801,
  'songcode' : '489616945',
  'songpreview' : 'http://a1477.phobos.apple.com/us/r30/Music/62/03/9f/mzm.jvkfemek.aac.p.m4a',
  'songpurchase' : 'https://itunes.apple.com/jp/album/%E3%81%A4%E3%81%91%E3%81%BE%E3%81%A4%E3%81%91%E3%82%8B/id489616934?i=489616945&uo=4',
  'songthum' : 'http://is2.mzstatic.com/image/thumb/Music/v4/ee/71/7f/ee717f70-7454-e54e-72d0-2d889daa3d2d/source/100x100bb.jpg',
  'songtitle' : 'つけまつける',
  'usericon' : '5',
  'userid' : 'VG4kMFAnTocx63UNI4w02rEByP93',
  'username' : 'myaaao'
} ];

const songs = [];
for(let s of source){
  const song = new SongModel(s);
  songs.push(song);
}


export default songs;
