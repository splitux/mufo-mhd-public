<app>
  <div id="wrap">

    <svg-parts></svg-parts>

    <heading></heading>

    <menu></menu>

    <activity></activity>

    <main id="stage">
      <stage></stage>
    </main>

    <div id="slide-content">
      <slide-content></slide-content>
    </div>

    <dialog-content></dialog-content>

  </div>

  <script>
    // facebook webview対策
    $(function() {
      var _ua = (function (u) {
        return {
          Facebook:(u.indexOf('fban/fbios;fbav') != -1)
        }
      })(window.navigator.userAgent.toLowerCase());
      if (_ua.Facebook) {
        $('html').addClass('fb-viewer');
        $(window).scroll(function(){
            $('body,html').scrollTop(0);
        });
      }
    });
  </script>
</app>
