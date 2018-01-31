# MuFo Document : MufoStore仕様

## 概要

MufoStoreは現在搭乗しているMuFoとその中の曲・リアクション等の情報を管理します。

## プロパティ

ストアのプロパティは全て参照専用です。
参照型(オブジェクト)の中身を変更してもデータは反映されません。

### {MufoModel} currentMufo 搭乗しているMuFo

現在搭乗しているMuFoのデータを返します。未搭乗およびロード未完了(`MUFO_PREPARED`イベント発行前)の場合はnullです。また、存在しないMuFoに搭乗しようとした場合等、データが取得できない場合は中身が空のMufoModelオブジェクトになる場合があります。

**例**

```javascript
const mufo = App.stores.mufoStore.currentMufo;
if(mufo && mufo.mufoid){
    console.log(`「${mufo.title}」に搭乗中です`);
}
```

### {Array[SongModel]} mufoSongs MuFo内の曲リスト

搭乗中のMuFoの曲一覧です。
未搭乗の場合、一曲も登録されていない場合、ロード未完了(`MUFO_PREPARED`イベント発行前)の場合は要素数0の配列です。

**例**

```javascript
const songs = App.stores.mufoStore.mufoSongs;
if(songs.length){
    console.log(`最初の曲は「${songs[0].songTitle}」です`);
}
```

### {boolean} isPrepared 

現在搭乗しているMuFoのデータロードが完了しているかを返します。
このフラグは`MUFO_ENTER`アクションでMuFoに搭乗すると`false`になり、全ての初期データがロードされて`MUFO_PREPARED`イベントが発行される直前に`true`になります。


## アクション

### MUFO_CREATE 新規MuFo作成

MufoModelのインスタンスを渡して新しくMuFoを作成します。

**引数**

|  名前  |  型  |  必須?  |  説明  |
| --- | --- | --- | --- |
|  mufo  |  MufoModel  |  Y  |  作成するMuFoのデータ  |

MufoModelのインスタンスは下記の要領で作成できます。

```javascript
const mufo = new App.models.MufoModel();
```

作成したMufoModelのインスタンスには、`MUFO_CREATE`の前に必要なプロパティをセットしておく必要があります。下記のプロパティは設定必須です。未設定の場合アクション
はエラーになります。

|  プロパティ  |  型  |  説明  |
| --- | --- | --- |
|  title  |  string  |  タイトル  |
|  color  |  number  |  MuFo色  |
|  pattern  |  number  |  MuFo内装パターン  |
|  authoruid  |  string  |  自分のUID。他人のIDをセットした場合エラーになります  |
|  authorname  |  string  |  ユーザ名  |
|  authoravater  |  string  |  アバターのパターンを表す文字列  |
|  location  |  LocationModel またはObject{lat,lng}  |  MuFoを飛ばす位置  |

※詳細はMufoModelの定義を参照してください。

### MUFO_REMOVE MuFoを削除

MuFoのIDを指定してMuFoを削除します。
このアクションはメンテ用に利用することを意図しています。自分の作成したMuFo以外はエラーになります。

**引数**

|  名前  |  型  |  必須?  |  説明  |
| --- | --- | --- | --- |
|  mufoid  |  string  |  Y  |  削除するMuFoのID  |

### MUFO_ENTER MuFoに搭乗

MuFoのIDを指定してMuFoに搭乗します。

**引数**

|  名前  |  型  |  必須?  |  説明  |
| --- | --- | --- | --- |
|  mufoid  |  string  |  Y  |  搭乗するMuFoのID  |

このアクションを発行すると、即座に`MUFO_ENTERED`イベントが発行され、その後MuFoおよびMuFo内の曲データが順次ロードされます。必要なロードが全て完了すると`MUFO_PREPARED`イベントが発行されます。

### MUFO_EXIT MuFoから降りる

搭乗中のMuFoから下ります。

**引数**

|  名前  |  型  |  必須?  |  説明  |
| --- | --- | --- | --- |

このアクションを発行すると、即座に`MUFO_EXITED`イベントが発行されます。

### MUFO_ADD_SONG MuFoに曲を追加

SongModelのインスタンスを渡してMuFoに曲を追加します。

**引数**

|  名前  |  型  |  必須?  |  説明  |
| --- | --- | --- | --- |
|  song  |  SongModel  |  Y  |  追加する曲データ  |

SongModelのインスタンスは下記の要領で作成できます。

```javascript
const song = new App.models.SongModel();
```

作成したSongModelのインスタンスには、`MUFO_ADD_SONG`の前に必要なプロパティをセットしておく必要があります。

|  プロパティ  |  型  |  説明  |
| --- | --- | --- |
|  mufoid  |  string  |  搭乗中のMuFoのIDをセットしてください  |
|  authoruid  |  string  |  自分のUID。他人のIDをセットした場合エラーになります  |
|  authorname  |  string  |  ユーザ名  |
|  authoravater  |  string  |  アバターのパターンを表す文字列  |

その他のプロパティはSongModelの定義を参照してください。

### MUFO_REMOVE_SONG 曲を削除

曲のIDを指定してMuFoから曲を削除します。
このアクションはメンテ用に利用することを意図しています。自分の追加した曲以外はエラーになります。搭乗しているMuFo以外の曲も削除可能です。

**引数**

|  名前  |  型  |  必須?  |  説明  |
| --- | --- | --- | --- |
|  songid  |  string  |  Y  |  削除する曲のID(SongModel.songid)  |

### MUFO_ADD_REACTION リアクションを追加

任意の曲のIDを指定してリアクションを追加します。

**引数**

|  名前  |  型  |  必須?  |  説明  |
| --- | --- | --- | --- |
|  songid  |  string  |  Y  |  リアクションを追加する曲のID(SongModel.songid)  |
|  addcount  |  number  |  N  |  追加するリアクションの数。1から100の間で指定。省略時は1  |


## イベント

### MUFO_CREATED (自分が)MuFoを作成した

自分がMuFoを作成した時に発行されるイベントです。通常、`MUFO_CREATE`アクションを発行すると、即座にこのイベントが発行されます。
(サーバ側処理の完了は待たないので、不正なデータを渡した場合等、サーバ側のチェックエラーで処理が失敗した場合にもこのイベントは呼び出されます)

mufoidが渡されるのでこの値を使って作成したMuFoに`EARTH_JUMP`で移動したり、`MUFO_ENTER`で搭乗したりできます。

**コールバックの引数**

|  名前  |  型  |  説明  |
| --- | --- | --- |
|  mufoid  |  string  |  作成したMuFoのID  |

### MUFO_REMOVED (自分が)MuFoを削除した

自分がMuFoを削除した時に発行されるイベントです。これといって使い道はないです。
(サーバ側処理の完了は待たないので、不正なデータを渡した場合等、サーバ側のチェックエラーで処理が失敗した場合にもこのイベントは呼び出されます)

**コールバックの引数**

|  名前  |  型  |  説明  |
| --- | --- | --- |
|  mufoid  |  string  |  削除したMuFoのID  |

### MUFO_ENTERED MuFoに搭乗した

`MUFO_ENTER`アクションによってMuFoに搭乗した際に発行されるイベントです。
この時点ではまだMuFoや曲のデータは未ロードの場合があります。
画面側では、このイベント受信時にMuFo画面に遷移して「loading...」等のメッセージを表示し、`MUFO_PREPARED`イベント受信時に内装等の表示や曲再生の開始等の処理を行ってください。

**コールバックの引数**

|  名前  |  型  |  説明  |
| --- | --- | --- |
|  mufoid  |  string  |  搭乗したMuFoのID  |

### MUFO_PREPARED 搭乗したMuFoのデータがロードされた

搭乗したMuFoのデータロードが完了した時点で呼び出されます。

**コールバックの引数**

|  名前  |  型  |  説明  |
| --- | --- | --- |

引数はありません。
必要なデータはMufoStoreのプロパティを参照してください。

### MUFO_EXITED MuFoから下りた

MuFoから下りた際に発行されるイベントです。
画面側ではマップに戻る等、必要な遷移を行ってください。

**コールバックの引数**

|  名前  |  型  |  説明  |
| --- | --- | --- |

### MUFO_CHANGED 搭乗しているMuFoが変更された

搭乗しているMuFoのデータに変更があった場合に発行されるイベントです。曲一覧・リアクションの変更は個別に通知される為、このイベントでは通知されません。

通常は、`MUFO_ENTERED`と`MUFO_PREPARED`の間に一度このイベントが発行されます。以降はMuFo内の曲数等が更新された場合に通知されます。
(`MUFO_REMOVE`で削除した場合にも通知されますが、メンテ用なので無視でも良いかと)

**コールバックの引数**

|  名前  |  型  |  説明  |
| --- | --- | --- |
|  mufo  |  MufoModel  |  現在のMuFoのデータ。削除された場合等、nullになる可能性があります  |


### MUFO_SONG_ADDED 曲が追加された

現在のMuFoに曲が追加された際に発行されるイベントです。
搭乗時の初期データのロード時と、ロード後に曲が追加された場合の両方でこのイベントが発行されます。初期ロードかどうかは`isPrepared`プロパティで判定できます。

**コールバックの引数**

|  名前  |  型  |  説明  |
| --- | --- | --- |
|  songs  |  Array[SongModel]  |  曲追加後の曲リスト  |
|  song  |  SongModel  |  追加された曲  |

### MUFO_SONG_REMOVED 曲が削除された

現在のMuFoから曲が削除された場合に発行されるイベントです。

**コールバックの引数**

|  名前  |  型  |  説明  |
| --- | --- | --- |
|  songs  |  Array[SongModel]  |  曲削除後の曲リスト  |
|  songid  |  string  |  削除された曲のID  |

### MUFO_REACTION_ADDED リアクションが追加された

現在のMuFoの曲にリアクションが追加された際に執行されるイベントです。

**コールバックの引数**

|  名前  |  型  |  説明  |
| --- | --- | --- |
|  songid  |  string  |  リアクションが追加された曲のID  |
|  count  |  number  |  リアクションの数  |
