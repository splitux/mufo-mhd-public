<alien-temp>
  <svg class="alien-svg-parts">
    <use xlink:href="#alien-body-{alienBody}" class="alien-color-{alienColor}"></use>
    <use xlink:href="#alien-eye-{alienEye}"></use>
    <use xlink:href="#alien-mouth-{alienMouth}"></use>
  </svg>

  <script>
    let str, arr;
    let self = this;


    this.createAlien = () => {
      str = self.opts.dataAlien;
      if ( str ) {
        arr = str.split(',');
        self.alienBody = arr[0];
        self.alienColor = arr[1];
        self.alienMouth = arr[2];
        self.alienEye = arr[3];
      }
    };

    this.createAlien();

    this.on('update', () => {
      this.createAlien();
    })


  </script>
</alien-temp>
