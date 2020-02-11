import * as L from 'leaflet';

export namespace ZoomHome {
  interface ZoomHomeOptions extends L.Control.ZoomOptions {
    zoomHomeText?: string;
    zoomHomeTitle?: string;
  }

  class ZommHome extends L.Control.Zoom {
    options: ZoomHomeOptions;
    constructor(options?: ZoomHomeOptions) {
      if (!options) {
        options = {
          position: 'topright',
          zoomInText: '+',
          zoomInTitle: 'Zoom in',
          zoomOutText: '-',
          zoomOutTitle: 'Zoom out',
          zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
          zoomHomeTitle: 'Zoom home'
        };
      }
      super(options);
    }
    // onAdd(map: L.Map) {
    // var controlName = 'gin-control-zoom',
    //     container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
    //     options = this.options;
    // this._zoomInButton = this. (options.zoomInText, options.zoomInTitle,
    //     controlName + '-in', container, this._zoomIn);
    // this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
    //     controlName + '-home', container, this._zoomHome);
    // this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
    //     controlName + '-out', container, this._zoomOut);
    // this._updateDisabled();
    // map.on('zoomend zoomlevelschange', this._updateDisabled, this);
    // return container;
    // }
  }
}
