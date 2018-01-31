<prof-edit>
  <div id="prof-edit" class="stage-inner scrollable">

    <div class="hdg-1 type-1">
      <svg class="icon">
        <use xlink:href="/img/icons.svg#icon-alien"></use>
      </svg>
      <h2 class="hdg">PROFILE</h2>
    </div>

    <form>
      <div class="prof-preview">
        <div class="prof-stage">
          <svg id="svg-alien">
            <use xlink:href="#alien-body-{alienDetail.body}" class="alien-color-{alienDetail.color}"></use>
            <use xlink:href="#alien-eye-{alienDetail.eye}"></use>
            <use xlink:href="#alien-mouth-{alienDetail.mouth}"></use>
          </svg>
        </div>
        <div class="prof-txtbox">
          <input class="txtbox" type="text" name="alien-name" value="{alienDetail.name}" onInput={validateTitle} onChange={changeAlienName} placeholder="名前を入れてください">
        </div>
      </div>
      <div class="prof-tab">
        <ul class="prof-tab-controller">
          <li>
            <a href="#" class="active" onclick={changeTab.bind(this, 1)}>
              <svg class="icon type-1">
                <use xlink:href="/img/icons.svg#icon-alien-body"></use>
              </svg>
              <span>BODY</span>
            </a>
          </li>
          <li>
            <a href="#" onclick={changeTab.bind(this, 2)}>
              <svg class="icon type-2">
                <use xlink:href="/img/icons.svg#icon-alien-mouth"></use>
              </svg>
              <span>MOUTH</span>
            </a>
          </li>
          <li>
            <a href="#" onclick={changeTab.bind(this, 3)}>
              <svg class="icon type-3">
                <use xlink:href="/img/icons.svg#icon-alien-eye"></use>
              </svg>
              <span>EYE</span>
            </a>
          </li>
        </ul>
        <div if={activeTab == 1} class="prof-tab-content">
          <ul class="prof-parts-list-1">
            <li>
              <input type="radio" id="prof-alien-body-1" value="1" name="prof-alien-body" onChange={changeAlienAppearance} checked={this.alienDetail.body == 1 ? true : false}>
              <label for="prof-alien-body-1">
                <svg>
                  <use xlink:href="#alien-body-1" class="alien-color-default"></use>
                </svg>
              </label>
            </li>
            <li>
              <input type="radio" id="prof-alien-body-2" value="2" name="prof-alien-body" onChange={changeAlienAppearance} checked={this.alienDetail.body == 2 ? true : false}>
              <label for="prof-alien-body-2">
                <svg>
                  <use xlink:href="#alien-body-2" class="alien-color-default"></use>
                </svg>
              </label>
            </li>
            <li>
              <input type="radio" id="prof-alien-body-3" value="3" name="prof-alien-body" onChange={changeAlienAppearance} checked={this.alienDetail.body == 3 ? true : false}>
              <label for="prof-alien-body-3">
                <svg>
                  <use xlink:href="#alien-body-3" class="alien-color-default"></use>
                </svg>
              </label>
            </li>
            <li>
              <input type="radio" id="prof-alien-body-4" value="4" name="prof-alien-body" onChange={changeAlienAppearance} checked={this.alienDetail.body == 4 ? true : false}>
              <label for="prof-alien-body-4">
                <svg>
                  <use xlink:href="#alien-body-4" class="alien-color-default"></use>
                </svg>
              </label>
            </li>
          </ul>
          <ul class="prof-parts-list-2">
            <li>
              <input type="radio" id="prof-alien-color-1" value="1" name="prof-alien-color" onChange={changeAlienAppearance} checked={this.alienDetail.color == 1 ? true : false}>
              <label for="prof-alien-color-1"></label>
            </li>
            <li>
              <input type="radio" id="prof-alien-color-2" value="2" name="prof-alien-color" onChange={changeAlienAppearance} checked={this.alienDetail.color == 2 ? true : false}>
              <label for="prof-alien-color-2"></label>
            </li>
            <li>
              <input type="radio" id="prof-alien-color-3" value="3" name="prof-alien-color" onChange={changeAlienAppearance} checked={this.alienDetail.color == 3 ? true : false}>
              <label for="prof-alien-color-3"></label>
            </li>
            <li>
              <input type="radio" id="prof-alien-color-4" value="4" name="prof-alien-color" onChange={changeAlienAppearance} checked={this.alienDetail.color == 4 ? true : false}>
              <label for="prof-alien-color-4"></label>
            </li>
            <li>
              <input type="radio" id="prof-alien-color-5" value="5" name="prof-alien-color" onChange={changeAlienAppearance} checked={this.alienDetail.color == 5 ? true : false}>
              <label for="prof-alien-color-5"></label>
            </li>
          </ul>
        </div>
        <div if={activeTab == 2} class="prof-tab-content">
          <ul class="prof-parts-list-3 type-1">
            <li>
              <input type="radio" id="prof-alien-mouth-1" value="1" name="prof-alien-mouth" onChange={changeAlienAppearance} checked={this.alienDetail.mouth == 1 ? true : false}>
              <label for="prof-alien-mouth-1">
                <svg>
                  <use xlink:href="#alien-mouth-1"></use>
                </svg>
              </label>
            </li>
            <li>
              <input type="radio" id="prof-alien-mouth-2" value="2" name="prof-alien-mouth" onChange={changeAlienAppearance} checked={this.alienDetail.mouth == 2 ? true : false}>
              <label for="prof-alien-mouth-2">
                <svg>
                  <use xlink:href="#alien-mouth-2"></use>
                </svg>
              </label>
            </li>
            <li>
              <input type="radio" id="prof-alien-mouth-3" value="3" name="prof-alien-mouth" onChange={changeAlienAppearance} checked={this.alienDetail.mouth == 3 ? true : false}>
              <label for="prof-alien-mouth-3">
                <svg>
                  <use xlink:href="#alien-mouth-3"></use>
                </svg>
              </label>
            </li>
            <li>
              <input type="radio" id="prof-alien-mouth-4" value="4" name="prof-alien-mouth" onChange={changeAlienAppearance} checked={this.alienDetail.mouth == 4 ? true : false}>
              <label for="prof-alien-mouth-4">
                <svg>
                  <use xlink:href="#alien-mouth-4"></use>
                </svg>
              </label>
            </li>
            <li>
              <input type="radio" id="prof-alien-mouth-5" value="5" name="prof-alien-mouth" onChange={changeAlienAppearance} checked={this.alienDetail.mouth == 5 ? true : false}>
              <label for="prof-alien-mouth-5">
                <svg>
                  <use xlink:href="#alien-mouth-5"></use>
                </svg>
              </label>
            </li>
          </ul>
        </div>
        <div if={activeTab == 3} class="prof-tab-content">
          <ul class="prof-parts-list-3 type-2">
            <li>
              <input type="radio" id="prof-alien-eye-1" value="1" name="prof-alien-eye" onChange={changeAlienAppearance} checked={this.alienDetail.eye == 1 ? true : false}>
              <label for="prof-alien-eye-1">
                <svg>
                  <use xlink:href="#alien-eye-1"></use>
                </svg>
              </label>
            </li>
            <li>
              <input type="radio" id="prof-alien-eye-2" value="2" name="prof-alien-eye" onChange={changeAlienAppearance} checked={this.alienDetail.eye == 2 ? true : false}>
              <label for="prof-alien-eye-2">
                <svg>
                  <use xlink:href="#alien-eye-2"></use>
                </svg>
              </label>
            </li>
            <li>
              <input type="radio" id="prof-alien-eye-3" value="3" name="prof-alien-eye" onChange={changeAlienAppearance} checked={this.alienDetail.eye == 3 ? true : false}>
              <label for="prof-alien-eye-3">
                <svg>
                  <use xlink:href="#alien-eye-3"></use>
                </svg>
              </label>
            </li>
            <li>
              <input type="radio" id="prof-alien-eye-4" value="4" name="prof-alien-eye" onChange={changeAlienAppearance} checked={this.alienDetail.eye == 4 ? true : false}>
              <label for="prof-alien-eye-4">
                <svg>
                  <use xlink:href="#alien-eye-4"></use>
                </svg>
              </label>
            </li>
            <li>
              <input type="radio" id="prof-alien-eye-5" value="5" name="prof-alien-eye" onChange={changeAlienAppearance} checked={this.alienDetail.eye == 5 ? true : false}>
              <label for="prof-alien-eye-5">
                <svg>
                  <use xlink:href="#alien-eye-5"></use>
                </svg>
              </label>
            </li>
          </ul>
        </div>
      </div>

    </form>

  </div>

  <ul class={btn-list: true, prof: true, only-save: isFirstProf}>
    <li><a href="/#/earth">CANCEL</a></li>
    <li><a href="#" class={disabled: isdisabled} onClick={saveAlien}>SAVE</a></li>
  </ul>

  <script>


    // SAVEボタンを非アクティブ化
    this.isdisabled = true;

    /*
      タブのコントロール
    */

    this.activeTab = 1;
    this.changeTab = (tabNum, e) => {
      e.preventDefault();
      $('.prof-tab-controller').find('a').removeClass('active');
      $(e.target).closest('a').addClass('active');
      this.activeTab = tabNum;
      this.update();
    };

    /*
      エイリアン作成プレビュー
    */
    // ユーザ情報を取得
    const user = App.stores.userStore.currentUser;
    const avatarArr = (user !== null && user.avatar) ? user.avatar.split(',') : [1,1,1,1];
    // 初回作成時にcancelボタンを非表示
    this.isFirstProf = (user !== null && user.avatar) ? false : true;

    this.alienDetail = {
      name: '',
      body: 1,
      color: 1,
      mouth: 1,
      eye: 1
    };

    // ユーザ情報の反映
    if ( user ) {
      this.alienDetail = {
        name: user.name,
        body: avatarArr[0],
        color: avatarArr[1],
        mouth: avatarArr[2],
        eye: avatarArr[3]
      };
      if (user.name != '' && user.name != null) {
        // SAVEボタンを活性化
        this.isdisabled = false;
      }
    }

    // ユーザ名のバリデート。未入力の場合、SAVEボタンを非活性
    this.validateTitle = (e) => {
      e.preventDefault();
      if ( e.currentTarget.value.length !== 0 ) {
        if( this.isdisabled ) {
          this.isdisabled = false;
        }
      } else {
        if( !this.isdisabled ) {
          this.isdisabled = true;
        }
      }
    }

    this.changeAlienName = (e) => {
      this.alienDetail.name = e.target.value;
      this.update();
    }

    this.changeAlienAppearance = (e) => {
      let target = e.target;
      let val = target.value;
      switch (target.name) {
        case 'prof-alien-body':
          this.alienDetail.body = val;
          break;
        case 'prof-alien-color':
          this.alienDetail.color = val;
          break;
        case 'prof-alien-mouth':
          this.alienDetail.mouth = val;
          break;
        case 'prof-alien-eye':
          this.alienDetail.eye = val;
          break;
        default:
          console.log('changeAlienAppearance is failed.')
      }
      this.update();
    };

    this.saveAlien = (e) => {
      e.preventDefault();


      // 名前とアバターの変更内容を送る
      user.name = this.alienDetail.name;
      user.avatar = `${this.alienDetail.body},${this.alienDetail.color},${this.alienDetail.mouth},${this.alienDetail.eye}`;
      App.trigger(App.actions.USER_CHANGE_PROFILE, user, ['name','avatar']);
      // エイリアンが跳ねたらマップ画面に戻る
      $('#svg-alien').addClass('alien-jumping').on('animationend', function () {
        window.location.href = '/#/earth';
      });
    }
  </script>

</prof-edit>
