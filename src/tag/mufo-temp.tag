<mufo-temp>
  <svg class="mufo-svg-parts">
    <use xlink:href="#mufo-parts-1"></use>
  </svg>
  <alien-temp data-alien="{alienParam}"></alien-temp>
  <svg class="mufo-svg-parts">
    <use xlink:href="#mufo-parts-2" class="mufo-svg-color-{mufoColor}"></use>
    <use xlink:href="#mufo-parts-3"></use>
  </svg>

  <script>
    this.mufoColor = this.opts.dataColor;
    this.alienParam = this.opts.dataAlien;
  </script>
</mufo-temp>
