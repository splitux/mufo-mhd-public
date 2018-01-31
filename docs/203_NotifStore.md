# MuFo Document : NotifStore仕様

## 概要

NotifStoreはログインユーザの通知に関連するデータを管理します。

## プロパティ

ストアのプロパティは全て参照専用です。
参照型(オブジェクト)の中身を変更してもデータは反映されません。

### {string} uid 通知監視対象のUID

通知を監視する対象のユーザIDです。ログインユーザのuidと同じです。


### {number} newNotifCount 未読通知の数

未読の通知数です。
uidを設定していない場合は常に0です。

### {Array[NorifModel]} notifs 通知全件

一週間以内の通知全件です。
このフィールドは`NOTIF_REQUEST`アクションで明示的に更新を要求した時しか最新化されません。

## アクション

### NOTIF_WATCH_USER 監視対象のユーザIDを設定する

通知の監視を開始するときに自身のユーザIDを設定します。監視を停止する場合はnullを設定します。
通常、ログイン時とログアウト時にこのアクションを呼んで下さい。


**引数**

|  名前  |  型  |  必須?  |  説明  |
| --- | --- | --- | --- |
|  uid  |  string  |  N  |  自身のUIDまたはnull  |

**例**

```javascript
// ログイン時にUIDをセットする
App.on(App.events.USER_LOGGEDIN,()=>{
  App.trigger(App.actions.NOTIF_WATCH_USER, App.uid);
});
// ログアウト時にUIDをクリアする
App.on(App.events.USER_LOGGEDOUT,()=>{
  App.trigger(App.actions.NOTIF_WATCH_USER, null);
});
```


### NOTIF_REQUEST 通知全件を要求する

通知の全件（一週間以内に更新のあったもの）の取得を要求します。
取得が完了すると`NOTIF_CHANGED`イベントが発行されます。

**引数**

|  名前  |  型  |  必須?  |  説明  |
| --- | --- | --- | --- |


### NOTIF_MARK_OPENED 通知を既読にする

全ての通知を既読にします。

**引数**

|  名前  |  型  |  必須?  |  説明  |
| --- | --- | --- | --- |


## イベント

### NOTIF_COUNT_CHANGED 未読通知数が変化した

監視中のユーザの未読通知数が変化した際のイベントです。

**コールバックの引数**

|  名前  |  型  |  説明  |
| --- | --- | --- |
| count | number | 未読通知数 |


### NOTIF_CHANGED 通知全件が変更された

`NOTIF_REQUEST`アクションの結果として通知全件がロードされた際に発行されるイベントです。

**コールバックの引数**

|  名前  |  型  |  説明  |
| --- | --- | --- |
|  notifs  |  Array[NotifModel]  |  通知データの配列  |

