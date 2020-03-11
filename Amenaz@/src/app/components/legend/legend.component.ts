import { Component, OnInit } from '@angular/core';
import { Events, NavParams, PopoverController } from '@ionic/angular';

interface Segment {}

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
export class LegendComponent implements OnInit {
  public threat: string;
  public city: string;

  constructor(private events: Events, private navParams: NavParams, private popoverController: PopoverController) {}

  ngOnInit() {
    // Get data from popover page
    this.threat = this.navParams.get('threat');
    this.city = this.navParams.get('city');
    this.selectLegend();
  }
  selectLegend() {
    let htmlContent = '';
    // .legend-item__quebrada {
    //
    // }
    if (this.city === 'Chacao') {
      if (this.threat === 'Aludes') {
        htmlContent += `<label style="font-weight: bold;">Hidrografía</label>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 1px; background: #ccc;
                            flex-shrink: 0; border: 0.5px; border-style: dashed none none; border-color: rgb(0, 112, 255);"></div>
                            <span style="padding-left: 8px;">Quebrada</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 1px; background: #ccc;
                            flex-shrink: 0; border: 0.5px; border-style: solid none none; border-color: rgb(0, 112, 255);"></div>
                            <span style="padding-left: 8px;">Río</span>
                        </div>
                        <br />`;
        htmlContent += `<label style="font-weight: bold;">Zona afectada por aludes torrenciales</label>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 85, 0);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: black;"></div>
                            <span style="padding-left: 8px;">Alta</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 211, 127);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: black;"></div>
                            <span style="padding-left: 8px;">Media</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 255, 190);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: black;"></div>
                            <span style="padding-left: 8px;">Baja</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 255, 255);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: black;"></div>
                            <span style="padding-left: 8px;">Nula</span>
                        </div>
                        <br />`;
      } else if (this.threat === 'Inundaciones') {
        htmlContent += `<label style="font-weight: bold;">Zona de inundación del río Guaire</label>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(151, 219, 242);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(64, 101, 235);"></div>
                            <span style="padding-left: 8px;">Alta</span>
                        </div>
                        <br />`;
      } else if (this.threat === 'Sismicidad') {
        htmlContent += `<label style="font-weight: bold;">Microzonificación sísmica</label>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(150, 191, 0);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(150, 191, 0);"></div>
                            <span style="padding-left: 8px;">3-1</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(56, 168, 0);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(56, 168, 0);"></div>
                            <span style="padding-left: 8px;">3-2</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 255, 190);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(255, 255, 190);"></div>
                            <span style="padding-left: 8px;">4-1</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 255, 0);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(255, 255, 0);"></div>
                            <span style="padding-left: 8px;">4-2</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 0, 0);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(255, 0, 0);"></div>
                            <span style="padding-left: 8px;">5</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(169, 0, 230);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(169, 0, 230);"></div>
                            <span style="padding-left: 8px;">6</span>
                        </div>
                        <br />`;
      }
      htmlContent += `<label style="font-weight: bold;">Municipio Chacao</label>
                      <div style="display: flex; align-items: center;">
                          <div style="width: 40px; height: 20px; background: transparent;
                          flex-shrink: 0; border: 1px; border-style: solid; border-color: rgb(255, 255, 0);"></div>
                      </div>`;
    } else if (this.city === 'Cumaná') {
      if (this.threat === 'Inundaciones') {
        htmlContent += `<label style="font-weight: bold;">Zonas de posible inundación pluvial y fluvial</label>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(151, 219, 242);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(64, 101, 235);"></div>
                            <span style="padding-left: 8px;">Inundación fluvial</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(115, 178, 255);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 112, 255);"></div>
                            <span style="padding-left: 8px;">Inundación pluvial</span>
                        </div>
                        <br />`;
      } else if (this.threat === 'Sismicidad') {
        htmlContent += `<label style="font-weight: bold;">Microzonificación sísmica</label>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 127, 127);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">3E</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 211, 127);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">2E</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 190, 232);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">3D</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 255, 115);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">2D</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(209, 255, 115);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">1D</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 235, 175);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">2C</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(137, 205, 102);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">1C</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 255, 255);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">M0</span>
                        </div>
                        <br />`;
      } else if (this.threat === 'Mov. en masa') {
        htmlContent += `<label style="font-weight: bold;">Movimientos en masa</label>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 170, 0);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">Movimientos en masa</span>
                        </div>
                        <br />`;
      } else if (this.threat === 'Tsunami') {
        htmlContent += `<label style="font-weight: bold;">Zonas de inundación por Tsunami</label>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(214, 214, 255);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">0,5 m</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(158, 164, 232);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">1 m</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(108, 125, 212);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">1,5 m</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(64, 93, 189);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">2 m</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(29, 73, 168);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">2,5 m</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(0, 57, 148);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">3 m</span>
                        </div>
                        <br />`;
      }
      htmlContent += `<label style="font-weight: bold;">Municipio Sucre</label>
                      <div style="display: flex; align-items: center;">
                          <div style="width: 40px; height: 20px; background: transparent;
                          flex-shrink: 0; border: 1px; border-style: solid; border-color: rgb(255, 255, 0);"></div>
                      </div>`;
    } else if (this.city === 'Mérida') {
      if (this.threat === 'Inundaciones') {
        htmlContent += `<label style="font-weight: bold;">Hidrografía</label>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 1px; background: transparent;
                                flex-shrink: 0; border: 0.5px; border-style: solid none none; border-color: rgb(10, 147, 252);"></div>
                            <span style="padding-left: 8px;"></span>
                        </div>
                        <br />`;
        htmlContent += `<label style="font-weight: bold;">Zona de protección de ríos y quebradas urbanas</label>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(151, 219, 242);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: rgb(64, 101, 235);"></div>
                            <span style="padding-left: 8px;">Zona de protección</span>
                        </div>
                        <br />`;
      } else if (this.threat === 'Mov. en masa') {
        htmlContent += `<label style="font-weight: bold;">Escarpe de terraza</label>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 1px; background: transparent;
                                flex-shrink: 0; border: 1px; border-style: solid none none; border-color: rgb(0, 0, 0);"></div>
                            <span style="padding-left: 8px;">Escarpe de terraza</span>
                        </div>
                        <br />`;
        htmlContent += `<label style="font-weight: bold;">Movimientos en masa</label>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 0, 0);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: black;"></div>
                            <span style="padding-left: 8px;">Muy Alta</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 170, 0);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: black;"></div>
                            <span style="padding-left: 8px;">Alta</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 255, 0);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: black;"></div>
                            <span style="padding-left: 8px;">Moderada</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(85, 255, 0);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: black;"></div>
                            <span style="padding-left: 8px;">Baja</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(211, 255, 190);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: black;"></div>
                            <span style="padding-left: 8px;">Muy Baja</span>
                        </div>
                        <br />`;
      } else if (this.threat === 'Sismicidad') {
        htmlContent += `<label style="font-weight: bold;">Zona de Influencia de fallas geológicas</label>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(0, 0, 0);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: black;"></div>
                            <span style="padding-left: 8px;">Zona de influencia</span>
                        </div>
                        <br />`;
        htmlContent += `<label style="font-weight: bold;">Microzonificación sísmica</label>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(211, 255, 190);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: black;"></div>
                            <span style="padding-left: 8px;">3-1</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 255, 190);
                                flex-shrink: 0; border: 0.5px; border-style: solid; border-color: black;"></div>
                            <span style="padding-left: 8px;">4-1</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 20px; background: rgb(255, 255, 255);
                            flex-shrink: 0; border: 0.5px; border-style: solid; border-color: black;"></div>
                            <span style="padding-left: 8px;">Por definir</span>
                        </div>
                        <br />`;
      }
      htmlContent += `<label style="font-weight: bold;">Municipio Libertador</label>
                      <div style="display: flex; align-items: center;">
                          <div style="width: 40px; height: 20px; background: transparent;
                          flex-shrink: 0; border: 1px; border-style: solid; border-color: rgb(255, 255, 0);"></div>
                      </div>`;
      htmlContent += `<label style="font-weight: bold;">Poligonal urbana</label>
                      <div style="display: flex; align-items: center;">
                          <div style="width: 40px; height: 20px; background: transparent;
                          flex-shrink: 0; border: 1px; border-style: solid; border-color: rgb(255, 0, 0);"></div>
                      </div>`;
    }

    const legendEl = document.getElementById('legend_content');
    legendEl.innerHTML = htmlContent;
  }

  logout() {
    // code for logout
  }

  eventFromPopover() {
    this.events.publish('fromPopoverEvent');
    this.popoverController.dismiss();
  }
}
