# MuFo Document : Action一覧

App.triggerで発行できるアクションの一覧です。
引数や誘発されるイベントの詳細はストアのドキュメントを参照してください。

## Earth 関連

|  Action名  |  概要  |
| --- | --- |
|  EARTH_MOVE  |  表示範囲を変更します。表示範囲内のMuFoがイベントで監視・通知されます  |
|  EARTH_JUMP  |  指定したMuFoの位置に移動します  |

## MuFo関連

|  Action名  |  概要  |
| --- | --- |
|  MUFO_CREATE  |  MuFoを新規に作成します  |
|  MUFO_REMOVE  |  自分の作成したMuFoを削除します(メンテ用)  |
|  MUFO_ENTER  |  MuFoに搭乗します  |
|  MUFO_EXIT  |  MuFoを下ります  |
|  MUFO_ADD_SONG  |  搭乗しているMuFoに曲を追加します  |
|  MUFO_REMOVE_SONG  |  自分の追加した曲を削除します(メンテ用)  |
|  MUFO_ADD_REACTION  |  MuFoの曲にリアクションを追加  |
|  MUFO_START_PLAYSONG  |  MuFoの再生を開始  |
|  MUFO_STOP_PLAYSONG  |  MuFoの再生を停止  |
|  MUFO_CHANGE_PLAYSONG  |  MuFoの選択曲を変更  |

## User関連

|  Action名  |  概要  |
| --- | --- |
|  USER_LOGIN  |  ログインします  |
|  USER_LOGOUT  |  ログアウトします  |
|  USER_CHANGE_PROFILE  |  プロフィール情報を変更します  |

## Notif関連

|  Action名  |  概要  |
| --- | --- |
|  NOTIF_WATCH_USER  |  通知を受け取るユーザIDをセットします  |
|  NOTIF_REQUEST  |  通知全件の取得をリクエストします  |

## Invitation（MuFoへの招待）関連

|  Action名  |  概要  |
| --- | --- |
|  INVI_ENABLE  |  招待をONにします  |
|  INVI_DISABLE  |  招待をOFFにします  |
|  INVI_REQUEST  |  招待を要求します  |
|  INVI_ANSWER  |  招待に回答します  |
