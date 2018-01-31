# MuFo Document : Event一覧

App.onで購読できるイベントの一覧です。
発行される条件や引数の詳細はストアのドキュメントを参照してください。

## Earth 関連

|  Action名  |  概要  |
| --- | --- |
|  EARTH_MOVED  |  表示範囲が変更された  |
|  EARTH_MUFOS_CHANGED  |  表示範囲内のMuFoが変化(増減)した  |

## MuFo関連

|  Action名  |  概要  |
| --- | --- |
|  MUFO_CREATED  |  自分がMuFoを作成した  |
|  MUFO_REMOVED  |  自分がMuFoを削除した  |
|  MUFO_ENTER  |  MuFoに搭乗した  |
|  MUFO_EXITED  |  MuFoを下りた  |
|  MUFO_CHANGED  |  現在の搭乗MuFoの内容が変化した  |
|  MUFO_PREPARED |  MuFoに搭乗後、MuFoおよび曲等のロードが完了した  |
|  MUFO_SONG_ADDED  |  搭乗しているMuFoに曲が追加された  |
|  MUFO_SONG_REMOVED  |  搭乗しているMuFoから曲が削除された  |
|  MUFO_REACTION_ADDED  |  MuFoの曲からリアクションが削除された  |
|  MUFO_PLAYSONG_STARTED  |  MuFoの再生が開始された  |
|  MUFO_PLAYSONG_STOPPED  |  MuFoの再生が停止された  |
|  MUFO_PLAYSONG_CHANGED  |  MuFoの選択曲が変更された  |

## User関連

|  Action名  |  概要  |
| --- | --- |
|  USER_LOGGEDIN  |  ログインした  |
|  USER_LOGGEDOUT  |  ログアウトした  |
|  USER_PROFILE_CHANGED  |  プロフィール情報が変更された  |

## Notif関連

|  Action名  |  概要  |
| --- | --- |
|  NOTIF_COUNT_CHANGED  |  未読通知数が変化した  |
|  NOTIF_CHANGED  |  通知全件の内容が変化した  |


## Invitation（MuFoへの招待）関連

|  Action名  |  概要  |
| --- | --- |
|  INVI_INVITED  |  招待された  |

