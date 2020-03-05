import { Component, OnInit } from '@angular/core';
import { City, DBCity, LayerType } from 'src/app/models/mapping';
import { MappingService } from 'src/app/services/mapping.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { withLatestFrom } from 'rxjs/operators';
import { ModalController, MenuController, PopoverController, Events } from '@ionic/angular';
import { InfoPageComponent } from 'src/app/components/info-page/info-page.component';
import { LegendComponent } from 'src/app/components/legend/legend.component';

@Component({
  selector: 'app-city',
  templateUrl: './city.page.html',
  styleUrls: ['./city.page.scss']
})
export class CityPage implements OnInit {
  public actualCity: City;
  private baseLayerMap: any;
  private actualCityThreats: any[] = [];
  private threatsLayers: any[] = [];
  public actualThreatName = '';

  constructor(
    private mappingService: MappingService,
    private route: ActivatedRoute,
    private router: Router,
    private modalController: ModalController,
    private menu: MenuController,
    private popoverController: PopoverController,
    private event: Events
  ) {
    this.actualCity = undefined;
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.actualCity = this.mappingService.cities.find(
          x => x.id === this.router.getCurrentNavigation().extras.state.actualCity
        );
      }
    });
  }
  ionViewDidEnter() {
    this.mainScreenMap();
  }
  ionViewWillLeave() {
    this.mappingService.map.remove();
  }
  mainScreenMap() {
    // Center Map on Venezuela
    this.mappingService.map = new L.Map('mapCityId', { zoomControl: false }).setView(
      this.actualCity.location,
      this.actualCity.zoomLevel
    );
    // Add all non-thread layers
    this.mappingService.baseMap.addTo(this.mappingService.map);
    // Home button
    L.easyButton('fa-home fa-lg', () => {
      this.mappingService.map.setView(this.actualCity.location, this.actualCity.zoomLevel);
    }).addTo(this.mappingService.map);
    L.easyButton('fa-search fa-lg', () => {
      this.mappingService.map.setView(this.actualCity.location, this.actualCity.zoomLevel);
    }).addTo(this.mappingService.map);
    L.control.locate({ setView: 'untilPanOrZoom', flyTo: true }).addTo(this.mappingService.map);
    let nodeList = document.querySelectorAll<HTMLElement>(
      '.leaflet-control-locate.leaflet-bar.leaflet-control .leaflet-bar-part.leaflet-bar-part-single span'
    );
    Array.from(nodeList).forEach(el => {
      el.classList.remove('fa-map-marker');
      el.classList.add('fa-crosshairs');
    });
    nodeList = document.querySelectorAll<HTMLElement>(
      '.easy-button-button.leaflet-bar-part.leaflet-interactive.unnamed-state-active'
    );
    Array.from(nodeList).forEach(el => {
      el.style.width = '30px';
      el.style.height = '30px';
    });
    this.centerOnCity();
  }
  async legendPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: LegendComponent,
      event: ev,
      componentProps: { page: 'Login' },
      cssClass: 'popover_class'
    });

    /** Sync event from popover component */
    this.event.subscribe('fromPopoverEvent', () => {
      // this.syncTasks();
      console.log('entro');
    });
    return await popover.present();
  }

  loadThreatLayers(layerType: string) {
    this.actualCity.layers.forEach(layer => {
      if (layer.fixed) {
        if (layerType !== 'Ninguna') {
          layer.gJSON.setStyle({ color: layer.color, fill: false });
          // layer.gJSON.setStyle({ color: '#000000', fill: false });
        } else {
          layer.gJSON.setStyle({ color: layer.color, fill: false });
        }
        layer.gJSON.addTo(this.mappingService.map);
      }
      layer.threadType.forEach(threat => {
        if (this.actualCityThreats.indexOf(threat) === -1 && threat !== 'Ninguna' && threat !== '') {
          this.actualCityThreats.push(threat);
          const tIcon = document.getElementById(threat) as HTMLImageElement;
          tIcon.src = tIcon.src.replace('_gris', '_rojo');
        }
        if (threat === layerType) {
          this.threatsLayers.push(layer.gJSON);
          layer.gJSON.addTo(this.mappingService.map);
        }
      });
    });
  }
  removeThreatLayers() {
    this.actualCity.layers.forEach(layer => {
      if (!layer.fixed) {
        this.mappingService.map.removeLayer(layer.gJSON);
      }
    });
  }
  centerOnCity() {
    this.mappingService.map.setView(this.actualCity.location, this.actualCity.zoomLevel);
    this.actualCity.layers.forEach(layer => {
      layer.threadType.forEach(threat => {
        if (threat === '') {
          this.baseLayerMap = layer;
          this.baseLayerMap.gJSON.addTo(this.mappingService.map);
        }
      });
    });
    this.loadThreatLayers('Ninguna');
  }
  loadThreat(threatName: string) {
    if (this.actualCityThreats.indexOf(threatName) > -1) {
      this.removeThreatLayers();
      this.actualCityThreats.forEach(threat => {
        const tIcon = document.getElementById(threat) as HTMLImageElement;
        if (threatName === threat) {
          if (threatName !== this.actualThreatName) {
            tIcon.src = tIcon.src.replace('_rojo', '_color');
            this.actualThreatName = threatName;
            this.loadThreatLayers(this.actualThreatName);
          } else {
            this.actualThreatName = '';
            tIcon.src = tIcon.src.replace('_color', '_rojo');
            this.loadThreatLayers('Ninguna');
          }
        } else {
          tIcon.src = tIcon.src.replace('_color', '_rojo');
        }
      });
    }
  }
  ngOnInit() {}
  async showInfo(titleString: string, bodyString: string) {
    const infoModal = await this.modalController.create({
      component: InfoPageComponent,
      componentProps: {
        title: titleString,
        body: bodyString
      },
      cssClass: 'info-custom-modal-css'
    });
    return await infoModal.present();
  }
  clickInfo() {
    let title = '',
      body = '';
    this.menu.enable(false);
    if (this.actualCity.name === 'Chacao') {
      if (this.actualThreatName === '') {
        title = 'Chacao';
        body = `<p style="text-align: justify;">Si bien el origen de los primeros asentamientos de Chacao data de 1768,
         el Chacao urbano que hoy conocemos es bastante reciente y su existencia como municipio nace apenas en el a&ntilde;o
          1989. Esto ha propiciado que las din&aacute;micas naturales que all&iacute; se dan no generaran anteriormente mayores
           da&ntilde;os, haciendo con ello que sus antecedentes de desastres sean enga&ntilde;osamente cortos.</p>
          <p style="text-align: justify;">A la hora de identificar los tipos de amenazas de desastres definidos para Chacao,
           se deben mencionar dos escenarios principales: El primero es el de su amenaza s&iacute;smica, cuya importancia
            qued&oacute; comprobada tras el importante n&uacute;mero de edificaciones que fueron severamente afectadas en
             Chacao luego del terremoto de 1967.</p>
          <p style="text-align: justify;">
          <img src="/assets/images/CH-1.jpg"
          alt="Fuente: Blog: rescate.com" /></p>
          <p style="text-align: justify;">El segundo tipo de amenaza urbana con el que tiene que convivir el municipio
           Chacao es con la potencial ocurrencia de aludes torrenciales que pudieran generarse en el macizo del &Aacute;vila
            y que pudieran arrastrar gran cantidad de materiales en las &aacute;reas de influencia de sus 4 principales
             cursos de agua: Qda Chacaito, Qda. Seca, Qda. Pajaritos y Qda. Sebuc&aacute;n.</p>
          <p style="text-align: justify;">El segundo tipo de amenaza urbana con el que tiene que convivir el municipio
           Chacao es con la potencial ocurrencia de aludes torrenciales que pudieran generarse en el macizo del &Aacute;vila
            y que pudieran arrastrar gran cantidad de materiales en las &aacute;reas de influencia de sus 4 principales cursos
             de agua: Qda Chacaito, Qda. Seca, Qda. Pajaritos y Qda. Sebuc&aacute;n.</p>
          <p style="text-align: justify;">Otros tipos de amenazas que se han identificado para ese municipio son las asociadas
           a inundaciones m&aacute;ximas del r&iacute;o Guaire que pudieran afectar los espacios de su l&iacute;mite sur y la
            ocurrencia de eventos tecnol&oacute;gicos asociados al uso, almacenamiento y/o la distribuci&oacute;n de materiales
             peligrosos.</p>`;
      } else if (this.actualThreatName === 'Aludes') {
        title = 'Aludes Torrenciales';
        body = `<p>El municipio Chacao cuenta con estudios y mapas muy completos de sus amenazas de aludes torrenciales e
         inundaciones que han sido desarrollados por el Instituto de Mec&aacute;nica de Fluidos de la Universidad Central
         de Venezuela.</p>
          <p><img src="/assets/images/CH-2.jpg"
          alt="Fuente: 300 Noticias" /></p>
          <p>Estas investigaciones permiten estimar las zonas que, ante la ocurrencia de lluvias extraordinarias, pudieran
           ser afectadas tanto por crecidas extraordinarias del r&iacute;o Guaire, como por aludes torrenciales que pudieran
            activarse desde la vertiente sur del macizo del &Aacute;vila.</p>`;
      } else if (this.actualThreatName === 'Inundaciones') {
        title = 'Inundaciones';
        body = `<p>El r&iacute;o Guaire ha registrado varias crecidas extraordinarias que han generado importantes niveles de
         afectaci&oacute;n en diversas &aacute;reas del valle de Caracas. Una de las m&aacute;s importantes fue la del
          a&ntilde;o 1892 y se recuerda por la importante cantidad de viviendas que destruy&oacute;.</p>
          <p>Otra crecida importante se registr&oacute; en el a&ntilde;o de 1900, siendo entonces un evento que caus&oacute;
           expectaci&oacute;n y angustia entre los habitantes de Caracas. Otras inundaciones posteriores importantes han sido
            las de 1949 y la de 1959</p>
          <p><img src="/assets/images/CH-3.jpg"
          alt="Fuente: twitter: El Nacional" /></p>
          <p>El Instituto de Mec&aacute;nica de Fluidos de la UCV ha desarrollado algunos modelos de simulaci&oacute;n que
           permiten estimar en la actualidad la mancha de inundaci&oacute;n que pudiera dejar una nueva crecida extraordinaria
            del r&iacute;o Guaire, as&iacute; como el nivel de espacios urbanos expuestos que pudieran ser afectados por este
             evento y que para el caso del Municipio Chacao se ubican en el &aacute;rea que se muestra en el mapa.</p>`;
      } else if (this.actualThreatName === 'Sismicidad') {
        title = 'Sismicidad';
        body = `<p> El municipio Chacao cuenta con estudios muy completos de microzonificación (FUNVISIS), que permiten estimar
           el comportamiento de sus suelos en caso de un terremoto. </p>
          <p> Se cuenta también para este municipio con modelos que sugieren las características estructurales que deberían
           tener el diseño de sus edificios (espectros de diseño) en función del lugar específico del municipio en que estos
            se encuentran localizados </p>
          <img src="/assets/images/CH-4.jpg"
          alt="Fuente: Diario El Nacional Fecha: 30-07-1967" />
          <p> Los estudios de Microzonificación Sísmica de la ciudad de Caracas identifican que en el Municipio Chacao
           existen siete microzonas, bien diferenciadas en función de las distintas respuestas que sus suelos, y los diversos
            tipos de edificaciones que en ellos se sostienen. </p>`;
      }
      this.showInfo(title, '<hr />' + body);
    } else if (this.actualCity.name === 'Cumaná') {
      if (this.actualThreatName === '') {
        title = 'Cumaná';
        body = `<p style="text-align: center;"><strong>GENERALIDADES DE LA CIUDAD</strong></p>
        <p style="text-align: justify;">Cuman&aacute; es una de las primeras ciudades fundadas por los espa&ntilde;oles en
         tierra firme americana, y a lo largo de su historia sus espacios han sido v&iacute;ctimas de importantes desastres
          asociados a la ocurrencia de terremotos, eventos clim&aacute;ticos (tormentas tropicales y huracanes), maremotos,
           inundaciones y derrumbes / deslizamientos.</p>
        <p style="text-align: justify;">La raz&oacute;n de la alta recurrencia hist&oacute;rica de eventos adversos en Cuman&aacute;
         est&aacute; asociada a su posici&oacute;n geogr&aacute;fica y a sus condiciones f&iacute;sico-naturales, que hacen que
          los habitantes de esta ciudad est&eacute;n obligados a saber c&oacute;mo convivir con amenazas naturales de tipo
           s&iacute;smico, hidrometeorol&oacute;gico y/o geomorfol&oacute;gicas.</p>`;
      } else if (this.actualThreatName === 'Mov. en masa') {
        title = 'Movimientos en masa';
        body = `<p style="text-align: justify;">La ciudad de Cuman&aacute; en general tiene una topograf&iacute;a bastante
         plana (altitud de 3 metros en promedio), sin embargo, producto de su actividad tect&oacute;nico-sedimentaria posee
          algunas unidades con relieve medianamente pronunciado, las cuales corresponden a unidades geol&oacute;gicas
           j&oacute;venes, en donde se pueden generar deslizamientos, flujos, derrumbes, etc.</p>
        <p style="text-align: justify;">Los deslizamientos y flujos son eventos recurrentes y que se dan en algunas &aacute;reas
         de la ciudad, y suelen estar asociados a la ocurrencia de fuertes precipitaciones como su detonante principal.
          La localizaci&oacute;n de este tipo de movimientos en masa se da principalmente en la cercan&iacute;a a los cerros
           Caig&uuml;ir&eacute;.</p>
        <p style="text-align: justify;">Las zonas urbanas susceptibles a generar movimientos en masa que aqu&iacute; se
         muestran han sido definidas muy someramente y en base a criterios topogr&aacute;ficos y al conocimiento que se
          tiene de la alta susceptibilidad que suelen tener formaciones geol&oacute;gicas similares. No se han ubicado
           hasta ahora estudios m&aacute;s rigurosos que validen esta delimitaci&oacute;n, por lo que se recomienda realizar
            estudios con mayor detalle.</p>`;
      } else if (this.actualThreatName === 'Inundaciones') {
        title = 'Inundaciones';
        body = `<p style="text-align: justify;">Las inundaciones fluviales y costeras en Cuman&aacute; ha sido una
         condici&oacute;n recurrente que se ha presentado desde la fundaci&oacute;n de la ciudad debido a su condici&oacute;n
          geogr&aacute;fica y topogr&aacute;fica. Esta ciudad ha crecido sobre una llanura fluvio-mar&iacute;tima, formada por
           el rio Manzanares, el golfo de Cariaco y el mar Caribe, y por grandes &aacute;reas de lagunas que fueron modificadas
            para dar paso al desarrollo y la ocupaci&oacute;n urbana de sus espacios.&nbsp;</p>
        <p style="text-align: justify;">Con el paso del tiempo el crecimiento urbano conllev&oacute; al desvi&oacute; del cauce
         de sus principales r&iacute;os y la construcci&oacute;n de aliviaderos, para disminuir las continuas inundaciones
          fluviales. Penosamente muchas de estas obras se hicieron sin los estudios base apropiados y ello hace que varios de
           sus espacios est&eacute;n expuestos a la amenaza de inundaciones asociados a las crecidas de sus cuencas urbanas,
            y que suelen agravarse ante las fallas detectadas en los sistemas de drenajes pluviales, los cuales colapsan con
             bastante regularidad.</p>
        <p style="text-align: justify;">Los estudios m&aacute;s recientes que se han elaborado sobre esta amenaza fueron
         desarrollados en el 2015 por el IDOM de la Universidad de Cantabria a solicitud del BID, y como parte de estos
          estudios se realizaron simulaciones para precipitaciones excepcionales que arrojaron manchas de inundaciones
           pluviales y fluviales urbanas con sus respectivas profundidades. De esos trabajos han sido tomados aqu&iacute;
            las &aacute;reas inundables estimadas para lluvias extraordinarias de periodos de 100 a&ntilde;os de retorno.</p>`;
      } else if (this.actualThreatName === 'Sismicidad') {
        title = 'Sismicidad';
        body = `<p style="text-align: justify;">El nivel de amenaza s&iacute;smica del estado Sucre ha sido definido como
         el m&aacute;s alto del pa&iacute;s (FUNVISIS) y ello es producto de la interacci&oacute;n que all&iacute; se da entre
          las placas tect&oacute;nicas del Caribe y Suram&eacute;rica.</p>
        <p style="text-align: justify;">Diversos esfuerzos se han realizado para caracterizar la amenaza s&iacute;smica de
         Cuman&aacute;, particularmente por el Centro de Sismolog&iacute;a &ldquo;Luis Daniel Beauperthuy Urich&rdquo;, de
          la Universidad de Oriente (UDO) y de la Fundaci&oacute;n Venezolana de Investigaciones Sismol&oacute;gicas (FUNVISIS).</p>
        <p style="text-align: justify;">Estos esfuerzos han permitido conocer la ubicaci&oacute;n tanto de las principales
         fallas geol&oacute;gicas que atraviesan a la ciudad en sentido oeste-este (Viete, 2012), como de sus posibles
          &aacute;reas de influencia, que corresponden a zonas potencialmente deformables por acci&oacute;n de un movimiento
           s&iacute;smico.</p>
        <p style="text-align: justify;">&nbsp;</p>
        <p style="text-align: justify;"><em>
        <img src="/assets/images/CU-1.jpg"
         alt="Fuente: Diario El Tiempo" /></em></p>
        <p style="text-align: justify;">Otro esfuerzo reciente y muy importante en este sentido son los progresos
         parciales alcanzados en la microzonificaci&oacute;n s&iacute;smica de la ciudad, y que fueron presentados por el
          Banco Interamericano de Desarrollo (2018), como parte de un estudio en el que caracterizaron siete (07) microzonas
           s&iacute;smicas dentro de la ciudad de Cumana, en las que conviene respetar algunos criterios t&eacute;cnicos de
            ingenier&iacute;a a la hora de dise&ntilde;ar nuevas edificaciones y/o evaluar-adecuar edificaciones existentes
            .</p>`;
      } else if (this.actualThreatName === 'Tsunami') {
        title = 'Tsunami';
        body = `<p style="text-align: justify;">Los tsunamis en Venezuela son fen&oacute;menos muy poco comunes, sin embargo,
         la historia ha registrado varios eventos de este tipo que han afectado de manera importante a Cumana, y la probabilidad
          de que se pueda repetir a futuro es latente.</p>
        <p style="text-align: justify;">Seg&uacute;n datos de O&acute;loughlin &amp; Lander (2003) Venezuela cuenta con un registro
         hist&oacute;rico (1498-1997) de 27 sismos que tuvieron el potencial de generar grandes olas (tsunamis). De estos, se
          cuenta con descripciones de 3 eventos que afectaron a la ciudad de Cumana en los a&ntilde;os de 1530, 1853 y 1929.</p>
        <p style="text-align: justify;">Diversos estudios se han realizado en torno a esta amenaza. Uno de los m&aacute;s
         recientes y completos son presentados por Guevara (2014), quien realiza la simulaci&oacute;n de 5 posibles escenarios
          de tsunamis en Cuman&aacute;, tomando como referencia el registrado tras el sismo del 17 de enero 1929.&nbsp; Esta
           investigaci&oacute;n sugiere las zonas de Cuman&aacute; que podr&iacute;an verse afectadas ante distintas estimaciones
            de alturas de olas, y de estas se ha tomado el escenario V (el menos favorable y con olas m&aacute;ximas de hasta 3
               metros de altura).</p>`;
      }
      this.showInfo(title, '<hr />' + body);
    }
    this.menu.enable(true);
  }
  clickRecomendations() {
    if (this.actualThreatName !== '') {
      let title = '',
        body = '';
      this.menu.enable(false);
      title = 'Recomendaciones';
      if (this.actualCity.name === 'Chacao') {
        if (this.actualThreatName === 'Aludes') {
          body =
            '<h6><strong>Amenazas por Aludes Torrenciales</strong></h6> \
            <h6>Nivel de amenaza: <strong>ALTA</strong></h6> \
          <p> <img src="/assets/one.png" style="padding: 0 15px; float: left; height: 32px;"/> \
          Se recomienda hacer seguimiento \
          permanente a servicios de pronóstico meteorológico y considerar el posible traslado temporal en caso \
          de declaración de alertas meteorológicas asociadas a lluvias de gran intensidad. Se recomienda que se \
          mantengan protocolos familiares y comunitarios de preparación y actuación en caso de aludes torrenciales. </p> \
          <h6>Nivel de amenaza: <strong>MEDIA</strong></h6> \
          <p> <img src="/assets/one.png" style="padding: 0 15px; float: left; height: 32px;"/> \
          Se recomienda hacer seguimiento \
          a servicios de pronóstico meteorológico y tomar previsiones en caso de declaración de alertas meteorológicas \
          asociadas a lluvias de gran intensidad. Conviene que se mantengan protocolos familiares y comunitarios de \
          preparación y actuación en caso de aludes torrenciales.</p> \
          <h6>Nivel de amenaza: <strong>BAJA</strong></h6> \
          <p> <img src="/assets/one.png" style="padding: 0 15px; float: left; height: 32px;"/> \
          Se recomienda hacer algún seguimiento \
          a servicios de pronóstico meteorológico y tomar algunas previsiones en caso de declaración de alertas \
          meteorológicas asociadas a lluvias de gran intensidad. Conviene que se mantengan protocolos familiares y \
          comunitarios de preparación y actuación en caso de aludes torrenciales. </p> \
          <h6>Nivel de amenaza: <strong>NULA</strong></h6> \
          <p> Son zonas de resguardo y seguridad ante este tipo de amenazas y donde no son necesarias recomendaciones \
          sobre este tipo de amenazas.</p> \
          <h6><strong>Si deseas mayor información sobre amenazas de aludes torrenciales locales, visita:</strong></h6> \
          <a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Chacao/QdasCHACAO.pdf"> \
          CIGIR (2009). “Material de socialización sobre amenazas asociadas a cuencas del municipio Chacao”; \
          adaptado de López JL. IMF-UCV (2004). Convenio CIGIR-IPCA </a></p> \
          <h6><strong>Sobre protocolos de actuación ante aludes torrenciales, visita:</strong></h6> \
          <a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Merida/Landslide_SPN.pdf"> \
          Recomendaciones de la Cruz Roja Americana ante deslizamientos.</a></p>';
        } else if (this.actualThreatName === 'Inundaciones') {
          body =
            '<h6><strong>Amenaza por inundación</strong></h6> \
            <h6>Nivel de amenaza: <strong>ALTA</strong></h6> \
            <p> <img src="/assets/one.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Se recomienda hacer seguimiento a servicios de pronóstico meteorológico y tomar previsiones en caso \
            de declaración de alertas meteorológicas asociadas a lluvias de gran intensidad. Conviene que se mantengan \
            protocolos familiares y comunitarios de preparación y actuación en caso de inundaciones </p> \
            <h6><strong>Si deseas mayor información sobre amenazas de inundaciones locales, visita:</strong></h6> \
            <a href="https://es.slideshare.net/MercedesMarrero/j-l-lpez-las-inundaciones-los-drenajes-de-caracas-y-las-obras-sobre-el-ro-valle"> \
            López J.L. (2003). Informe final de Estudio de Amenazas de Inundaciones y Aludes Torrenciales de Caracas. IMF-UCV </a></p> \
            <h6><strong>Sobre protocolos de actuación ante inundaciones, visita:</strong></h6> \
            <a href="https://www.youtube.com/watch?v=mFFRzIuD2Nw"> \
            Video: ¿Qué hacer en caso de inundación?</a></p>';
        } else if (this.actualThreatName === 'Sismicidad') {
          body =
            '<h6><strong>Microzonificación sísmica</strong></h6> \
            <h6>Microzona: <strong>3-1</strong></h6> \
            <p> <img src="/assets/one.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Evaluación sismorresistente de los edificios construidos antes de 1967. </p> \
            <p> <img src="/assets/two.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Inspección técnica de los edificios de columnas y vigas ≤ 15 pisos o de muros ≤ 25 \
            pisos de construidos entre 1967-1982. </p> \
            <p> <img src="/assets/three.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Diseño de nuevas edificaciones considerando el espectro de la microzona 3-1. </p> \
            <p> <img src="/assets/four.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Implementación de protocolos familiares y comunitarios de preparación y actuación en caso de terremotos. </p> \
            \
            <h6>Microzona: <strong>3-2</strong></h6> \
            <p> <img src="/assets/one.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Evaluación sismorresistente de los edificios construidos antes de 1967. </p> \
            <p> <img src="/assets/two.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Inspección técnica los edificios construidos entre 1967-1982. </p> \
            <p> <img src="/assets/three.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Diseño de nuevas edificaciones considerando el espectro de la microzona 3-2. </p> \
            <p> <img src="/assets/four.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Implementación de protocolos familiares y comunitarios de preparación y actuación en caso de terremotos. </p> \
            <p> Si deseas mayor información sobre amenazas de inundaciones locales, visita:</p> \
            \
            <h6>Microzona: <strong>4-1</strong></h6> \
            <p> <img src="/assets/one.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Evaluación sismorresistente de los edificios construidos antes de 1967. </p> \
            <p> <img src="/assets/two.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Inspección técnica de los edificios de columnas y vigas ≥ 4 pisos o de muros ≥ 7 pisos \
            construidos entre 1967-1982. </p> \
            <p> <img src="/assets/three.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Diseño de nuevas edificaciones considerando el espectro de la microzona 4-1. </p> \
            <p> <img src="/assets/four.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Implementación de protocolos familiares y comunitarios de preparación y actuación en caso de terremotos. </p> \
            \
            <h6>Microzona: <strong>4-2</strong></h6> \
            <p> <img src="/assets/one.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Evaluación sismorresistente de los edificios construidos antes de 1967. </p> \
            <p> <img src="/assets/two.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Inspección técnica de los edificios de columnas y vigas ≥ 4 pisos o de muros ≥ 7 pisos \
            construidos entre 1967-1982. </p> \
            <p> <img src="/assets/three.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Diseño de nuevas edificaciones considerando el espectro de la microzona 4-2. </p> \
            <p> <img src="/assets/four.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Implementación de protocolos familiares y comunitarios de preparación y actuación en caso de terremotos. </p> \
            \
            <h6>Microzona: <strong>5</strong></h6> \
            <p> <img src="/assets/one.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Evaluación sismorresistente de los edificios construidos antes de 1967 y de columnas y \
            vigas ≥ 4 pisos o de muros ≥ 7 pisos construidos entre 1967-1982. </p> \
            <p> <img src="/assets/two.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Inspección técnica de los edificios ≤ 3 pisos construidos entre 1967-1982 y de columnas \
            y vigas ≥ 8 pisos o de muros ≥ 15 pisos construidos entre 1982-2001. </p> \
            <p> <img src="/assets/three.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Diseño de nuevas edificaciones considerando el espectro de la microzona 5, especial \
            cuidado en edificaciones altas de columnas y vigas ≥ 8 pisos o de muros ≥ 15 pisos. </p> \
            <p> <img src="/assets/four.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Implementación de protocolos familiares y comunitarios de preparación y actuación en caso de terremotos. </p> \
            \
            <h6>Microzona: <strong>6</strong></h6> \
            <p> <img src="/assets/one.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Evaluación sismorresistente de los edificios construidos antes de 1967 y de columnas y \
            vigas ≥ 4 pisos o de muros ≥ 7 pisos construidos entre 1967-1982. </p> \
            <p> <img src="/assets/two.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Inspección técnica de los edificios ≤ 3 pisos construidos entre 1967-1982 y de columnas \
            y vigas ≥ 8 pisos o de muros ≥ 15 pisos construidos entre 1982-2001. </p> \
            <p> <img src="/assets/three.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Diseño de nuevas edificaciones considerando el espectro de la microzona 6, especial \
            cuidado en edificaciones altas de columnas y vigas ≥ 8 pisos o de muros ≥ 15 pisos. </p> \
            <p> <img src="/assets/four.png" style="padding: 0 15px; float: left; height: 32px;"/> \
            Implementación de protocolos familiares y comunitarios de preparación y actuación en caso de terremotos. </p> \
            \
            <h6><strong>Si deseas mayor información sobre riesgo sísmico de Chacao, visita:</strong></h6> \
            <a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Chacao/Schmitz.pdf"> \
            Shmitz et al. (2009). “Resultados y recomendaciones del proyecto de Microzonificación Sísmica de Caracas”. Caracas </a></p> \
            <h6><strong>Sobre protocolos de actuación ante riesgo sísmico, visita:</strong></h6> \
            <a href="https://www.youtube.com/watch?v=n_7lfodHSYI"> \
            Video: Riesgo Sísmico de la ciudad de Mérida </a></p>';
        }
      } else if (this.actualCity.name === 'Cumaná') {
        if (this.actualThreatName === 'Sismicidad') {
          body = `<h6><strong>Microzonificaci&oacute;n s&iacute;smica</strong></h6>
          <h6>Microzona: <strong>1C</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Evaluaci&oacute;n sismorresistente de los edificios construidos antes de 1967 y de columnas y vigas &le;
          4 pisos o de muros &le; 7 pisos de construidos entre 1967-1982.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Inspecci&oacute;n t&eacute;cnica de los dem&aacute;s edificios construidos entre 1967-1982.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Dise&ntilde;o de nuevas edificaciones considerando el espectro de la microzona 1C.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/four.png" /></p>
          <p>Implementaci&oacute;n de protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en
           caso de terremotos.</p>
          <h6>Microzona: <strong>2C</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Evaluaci&oacute;n sismorresistente de los edificios construidos antes de 1967 y de columnas y vigas &le;
           8 pisos o de muros &le; 15 pisos de construidos entre 1967-1982.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Inspecci&oacute;n t&eacute;cnica de los dem&aacute;s edificios construidos entre 1967-1982.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Dise&ntilde;o de nuevas edificaciones considerando el espectro de la microzona 2C.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/four.png" />Implementaci&oacute;n
           de protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en caso de terremotos.</p>
          <h6>Microzona: <strong>1D</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Evaluaci&oacute;n sismorresistente de los edificios construidos antes de 1967 y de columnas y vigas &le; 4
           pisos o de muros &le; 7 pisos de construidos entre 1967-1982.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Inspecci&oacute;n t&eacute;cnica de los dem&aacute;s edificios construidos entre 1967-1982.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Dise&ntilde;o de nuevas edificaciones considerando el espectro de la microzona 1D.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/four.png" />Implementaci&oacute;n de
           protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en caso de terremotos.</p>
          <h6>Microzona: <strong>2D</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Evaluaci&oacute;n sismorresistente de los edificios construidos antes de 1967 y de columnas y vigas &le; 8
           pisos o de muros &le; 15 pisos de construidos entre 1967-1982.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Inspecci&oacute;n t&eacute;cnica de los dem&aacute;s edificios construidos entre 1967-1982.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" />Dise&ntilde;o de nuevas
           edificaciones considerando el espectro de la microzona 2D.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/four.png" />Implementaci&oacute;n de
           protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en caso de terremotos.</p>
          <h6>Microzona: 3D</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Evaluaci&oacute;n sismorresistente de los edificios construidos antes de 1967 y de columnas y vigas &ge; 4
           pisos o de muros &ge; 7 pisos construidos entre 1967-1982.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Inspecci&oacute;n t&eacute;cnica de los edificios &le; 3 pisos construidos entre 1967-1982 y de columnas y
           vigas &ge; 8 pisos o de muros &ge; 15 pisos construidos entre 1982-2001.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Dise&ntilde;o de nuevas edificaciones considerando el espectro de la microzona 3D, especial cuidado en
           edificaciones altas de columnas y vigas &ge; 8 pisos o de muros &ge; 15 pisos.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/four.png" /></p>
          <p>Implementaci&oacute;n de protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n
           en caso de terremoto.</p>
          <h6>Microzona: 2E</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Evaluaci&oacute;n sismorresistente de los edificios construidos antes de 1967 y de columnas y vigas &ge;
           4 pisos o de muros &ge; 7 pisos construidos entre 1967-1982.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Inspecci&oacute;n t&eacute;cnica de los edificios &le; 3 pisos construidos entre 1967-1982 y de columnas
           y vigas &ge; 8 pisos o de muros &ge; 15 pisos construidos entre 1982-2001.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Dise&ntilde;o de nuevas edificaciones considerando el espectro de la microzona 2E, especial cuidado en
           edificaciones altas de columnas y vigas &ge; 8 pisos o de muros &ge; 15 pisos.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/four.png" /></p>
          <p>Implementaci&oacute;n de protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n
           en caso de terremoto.</p>
          <h6>Microzona: 3E</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Evaluaci&oacute;n sismorresistente de los edificios construidos antes de 1967 y de columnas y vigas &ge;
           4 pisos o de muros &ge; 7 pisos construidos entre 1967-1982.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Inspecci&oacute;n t&eacute;cnica de los edificios &le; 3 pisos construidos entre 1967-1982 y de columnas
           y vigas &ge; 8 pisos o de muros &ge; 15 pisos construidos entre 1982-2001.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Dise&ntilde;o de nuevas edificaciones considerando el espectro de la microzona 3E, especial cuidado en
           edificaciones altas de columnas y vigas &ge; 8 pisos o de muros &ge; 15 pisos.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/four.png" /></p>
          <p>Implementaci&oacute;n de protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n
           en caso de terremoto.</p>
          <h6>Microzona: M0</h6>
          <p>No aplica.</p>
          <p><strong>Si deseas mayor informaci&oacute;n sobre riesgo s&iacute;smico y la microzonificaci&oacute;n
           s&iacute;smica de Cuman&aacute; visita</strong></p>
          <p>Video: <a href="https://www.youtube.com/watch?reload=9&amp;v=rDCr0l47ags">Proyecto de Microzonificaci&oacute;n
           S&iacute;smica de Cuman&aacute;</a></p>`;
        } else if (this.actualThreatName === 'Sismicidad') {
          body = `<h6><strong>Zona de influencia de fallas geol&oacute;gicas</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Por ser una zona susceptible a deformarse, posee algunas limitaciones constructivas. Se sugiere seguir las
           especificaciones del caso, definidas en la norma COVENIN 1756 (2001) y su actualizaci&oacute;n (L&oacute;pez et
             al., 2019).</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>En el caso de que el sitio de la construcci&oacute;n o edificaci&oacute;n haya quedado dentro del &aacute;rea
           cubierta por una microzonificaci&oacute;n s&iacute;smica debidamente aprobada, se cumplir&aacute; con las pautas
            establecidas en ella al respecto de la cercan&iacute;a de fallas, junto a todas las prescripciones de la
             actualizaci&oacute;n de la norma COVENIN 1756-01 en L&oacute;pez et al. (2019).</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Debe evitarse en la medida de lo posible realizar nuevas edificaciones en estas &aacute;reas. Como &uacute;ltima
           instancia deben realizarse bajo el dise&ntilde;o y c&aacute;lculo definidas en L&oacute;pez et al., (2019).</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/four.png" /></p>
          <p>&nbsp;Para las edificaciones existentes en estas zonas, se sugiere la evaluaci&oacute;n por parte de un
           profesional especialista, para determinar si debe o no realizar modificaciones o adecuaciones a las mismas,
            en cualquiera de los casos, debe seguir las directrices de L&oacute;pez et al. (2019).</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/five.png" /></p>
          <p>Se recomienda que se implementen protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n
           en caso de terremotos.&nbsp;</p>`;
        } else if (this.actualThreatName === 'Tsunami') {
          body = `<h6><strong>Amenaza por tsunami</strong></h6>
          <h6>Altura de la ola: 3 m</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Posterior a la ocurrencia de un sismo de gran magnitud, se sugiere buscar una zona elevada superior a los 4 metros de altura para su resguardo, mientras la alerta de tsunami baja.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Se recomienda que se implementen protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en caso de tsunamis.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Participar en los simulacros propiciados por las autoridades gubernamentales o de programas internacionales como el Caribe Wave.&nbsp;</p>
          <h6>Altura de la ola: 2,5 m</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Posterior a la ocurrencia de un sismo de gran magnitud, se sugiere buscar una zona elevada superior a los 4 metros de altura para su resguardo, mientras la alerta de tsunami baja.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Se recomienda que se implementen protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en caso de tsunamis.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Participar en los simulacros propiciados por las autoridades gubernamentales o de programas internacionales como el Caribe Wave.</p>
          <h6>Altura de la ola: 2 m</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Posterior a la ocurrencia de un sismo de gran magnitud, se sugiere buscar una zona elevada superior a los 3 metros de altura para su resguardo, mientras la alerta de tsunami baja.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Se recomienda que se implementen protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en caso de tsunamis.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Participar en los simulacros propiciados por las autoridades gubernamentales o de programas internacionales como el Caribe Wave.&nbsp;</p>
          <h6>Altura de la ola: 1,5 m</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Posterior a la ocurrencia de un sismo de gran magnitud, se sugiere buscar una zona elevada superior a 2,5 metros de altura para su resguardo, mientras la alerta de tsunami baja.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Se recomienda que se implementen protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en caso de tsunamis.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Participar en los simulacros propiciados por las autoridades gubernamentales o de programas internacionales como el Caribe Wave.&nbsp;</p>
          <h6>Altura de la ola: 1 m</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Posterior a la ocurrencia de un sismo de gran magnitud, se sugiere buscar una zona elevada superior a 2 metros de altura para su resguardo, mientras la alerta de tsunami baja.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Se recomienda que se implementen protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en caso de tsunamis.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Participar en los simulacros propiciados por las autoridades gubernamentales o de programas internacionales como el Caribe Wave.&nbsp;</p>
          <h6>Altura de la ola: 0,5 m</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Se recomienda que se implementen protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en caso de tsunamis.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Participar en los simulacros propiciados por las autoridades gubernamentales o de programas internacionales como el Caribe Wave.&nbsp;</p>
          <h6>Si deseas mayor informaci&oacute;n sobre tsunamis de Cuman&aacute;, visita:</h6>
          <p><a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Cumana/52a_Guevara.pdf"> Guevara, M. (2014). Simulaci&oacute;n num&eacute;rica del tsunami asociado al terremoto del 17 de enero de 1929 en la ciudad de Cuman&aacute;, una contribuci&oacute;n a los estudios de riesgo en las costas venezolanas. Tesis de grado. Maestr&iacute;a en Geof&iacute;sica. Facultad de Ingenier&iacute;a, Universidad Central de Venezuela.&nbsp; (Hiperv&iacute;nculo a servidor: </a><strong><u>)</u></strong></p>
          <p><strong><u>&nbsp;</u></strong></p>
          <h6>Sobre ejercicios de preparaci&oacute;n para tsunami, visita:</h6>
          <p><a href="https://www.tsunamizone.org/espanol/caribewave/">The Tsunami Zone</a></p>`;
        } else if (this.actualThreatName === 'Inundaciones') {
          body = `<h6><strong>Amenaza por Inundaciones fluviales</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Se recomienda a quienes ocupan esos espacios a realizar seguimiento a los servicios de pron&oacute;stico meteorol&oacute;gico disponibles.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Tomar previsiones en caso de: incrementos de caudales y declaraci&oacute;n de alertas asociadas a lluvias locales de gran intensidad.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Conviene que se mantengan protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en caso de darse estos eventos.&nbsp;&nbsp;</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/four.png" /></p>
          <p>Apoyar procesos de limpieza permanentes de los canales de los drenajes y el desarrollo de obras de mitigaci&oacute;n de efectos de posibles inundaciones.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/five.png" /></p>
          <p>Vigilar y promover la conservaci&oacute;n de las capas de vegetaci&oacute;n aguas arriba.</p>
          <p>&nbsp;</p>
          <h6>Amenaza por Inundaciones pluviales</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Se recomienda a quienes ocupan esos espacios a realizar seguimiento a los servicios de pron&oacute;stico meteorol&oacute;gico disponibles.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Tomar previsiones en caso de: incrementos de caudales y declaraci&oacute;n de alertas asociadas a lluvias locales de gran intensidad.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Conviene que se mantengan protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en caso de darse estos eventos.&nbsp;&nbsp;</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/four.png" /></p>
          <p>Apoyar procesos de limpieza permanentes de los canales de los drenajes y el desarrollo de obras de mitigaci&oacute;n de efectos de posibles inundaciones.</p>
          <p>&nbsp;</p>
          <h6>Si deseas mayor informaci&oacute;n sobre inundaciones pluviales y fluviales de Cuman&aacute;, visita:</h6>
          <p><a href="https://issuu.com/ciudadesemergentesysostenibles/docs/cumana_sostenible_lr_compressed">Banco Interamericano de Desarrollo y IDOM/IH Cantabria. (2015). CUMAN&Aacute;: Estudio de riesgo y vulnerabilidad ante desastres naturales en el contexto de cambio clim&aacute;tico</a>&nbsp;</p>
          <p><strong><u>&nbsp;</u></strong></p>
          <h6>Sobre protocolos de actuaci&oacute;n ante inundaciones, visita:</h6>
          <p><a href="https://www.youtube.com/watch?v=mFFRzIuD2Nw">Video: &iquest;Qu&eacute; hacer en caso de inundaci&oacute;n? </a></p>`;
        } else if (this.actualThreatName === 'Mov. en masa') {
          body = `<h6><strong>Amenaza por Movimientos en masa</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Para el uso y la ocupaci&oacute;n adecuada de estos espacios, se recomienda realizar estudios t&eacute;cnicos m&aacute;s espec&iacute;ficos (geol&oacute;gicos, geomorfol&oacute;gicos, geot&eacute;cnicos, etc).</p>
          <p>Promover y practicar permanentemente protocolos comunitarios y familiares de actuaci&oacute;n en caso de deslizamientos. Es importante identificar las zonas seguras de su comunidad.</p>
          <h6>Si deseas mayor informaci&oacute;n sobre protocolos de actuaci&oacute;n ante movimientos en masa, visita:</h6>
          <p><a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Cumana/Landslide_SPN.pdf">Recomendaciones de la Cruz Roja Americana ante deslizamientos</a></p>`;
        }
      }
      this.showInfo(title, '<hr />' + body);
      this.menu.enable(true);
    }
  }
  clickMoreInfo() {
    console.log(this.actualThreatName);
    if (this.actualThreatName !== '') {
      let title = '',
        body = '';
      this.menu.enable(false);
      title = 'Más información';
      if (this.actualCity.name === 'Chacao') {
        if (this.actualThreatName === 'Aludes') {
          body = `<h2>Aludes Torrenciales</h2>
            <ul>
            <li><strong>A quien consultar en su localidad:</strong></li>
            </ul>
            <ol>
            <li><a title="Instituto de Mec&aacute;nica de Fluidos IMF-UCV"
            href="http://www.ucv.ve/organizacion/facultades/facultad-de-ingenieria/institutos/instituto-de-mecanica-de-fluido-imf.html">
            Instituto de Mec&aacute;nica de Fluidos IMF-UCV</a></li>
            <li>Protecci&oacute;n Civil del Municipio Chacao</li>
            </ol>
            <ul>
            <li><strong>Para dudas, comentarios y/o sugerencias sobre la informaci&oacute;n de amenaza por aludes torrenciales:
            </strong></li>
            </ul>
            <p style="padding-left: 30px;">
            <a title="Instituto de Mec&aacute;nica de Fluidos de la Universidad Central de Venezuela (IMF-UCV)"
            href="http://www.ucv.ve/organizacion/facultades/facultad-de-ingenieria/institutos/instituto-de-mecanica-de-fluido-imf.html">
             Instituto de Mec&aacute;nica de Fluidos de la Universidad Central de Venezuela (IMF-UCV)</a> &nbsp;</p>
            <ul>
            <li><strong>Autores consultados:</strong></li>
            </ul>
            <p style="padding-left: 30px;"><a title="CIGIR (2009). &ldquo;Material de socializaci&oacute;n sobre amenazas asociadas a
              cuencas del municipio Chacao&rdquo;; adaptado de L&oacute;pez JL. IMF-UCV (2004). Convenio CIGIR-IPCA.&nbsp;"
               href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Chacao/QdasCHACAO.pdf">
               CIGIR (2009). &ldquo;Material de socializaci&oacute;n sobre amenazas asociadas a cuencas del municipio Chacao&rdquo;;
               adaptado de L&oacute;pez JL. IMF-UCV (2004). Convenio CIGIR-IPCA.&nbsp;</a></p>`;
        } else if (this.actualThreatName === 'Inundaciones') {
          body = `<h2>Inundaciones</h2>
          <ul>
          <li><strong>A quien consultar en su localidad:</strong></li>
          </ul>
          <ol>
          <li><a title="Instituto de Mec&aacute;nica de Fluidos IMF-UCV"
          href="http://www.ucv.ve/organizacion/facultades/facultad-de-ingenieria/institutos/instituto-de-mecanica-de-fluido-imf.html">
          Instituto de Mec&aacute;nica de Fluidos IMF-UCV</a></li>
          <li>Protecci&oacute;n Civil del Municipio Chacao</li>
          </ol>
          <ul>
          <li><strong>Para dudas, comentarios y/o sugerencias sobre la informaci&oacute;n de amenaza por inundaci&oacute;n:</strong></li>
          </ul>
          <p style="padding-left: 30px;"><a title="Instituto de Mec&aacute;nica de Fluidos de la Universidad Central de Venezuela (IMF-UCV)"
          href="http://www.ucv.ve/organizacion/facultades/facultad-de-ingenieria/institutos/instituto-de-mecanica-de-fluido-imf.html">
          Instituto de Mec&aacute;nica de Fluidos de la Universidad Central de Venezuela (IMF-UCV)</a></p>
          <ul>
          <li><strong>Autores consultados:</strong></li>
          </ul>
          <p style="padding-left: 30px;">Fundaci&oacute;n Venezolana de Investigaciones Sismol&oacute;gicas (FUNVISIS). (2014).
          Microzonificaci&oacute;n s&iacute;smica de Caracas. Editores: Michael Schmitz y Andre Singer. Ministerio del Poder Popular
           para Educaci&oacute;n Universitaria, Ciencia y Tecnolog&iacute;a. Fondo Nacional de Ciencia, Tecnolog&iacute;a e
            Innovaci&oacute;n.</p>
          <p style="padding-left: 30px;">L&oacute;pez, O., Hern&aacute;ndez, J., J&aacute;come, J., Schmitz, M., Marinilli, A.,
           Coronel, G., Morillo, M. y M&aacute;rquez, B. (2017). Proyecto de actualizaci&oacute;n de la Norma para Construcciones
            Sismorresistentes, COVENIN 1756. Subcomit&eacute; T&eacute;cnico de Normalizaci&oacute;n de Sismorresistencia.
             Fundaci&oacute;n Centro Nacional de Investigaci&oacute;n y Certificaci&oacute;n en Vivienda, H&aacute;bitat y
              Desarrollo Urbano (CENVIH), Fundaci&oacute;n Venezolana de Investigaciones Sismol&oacute;gicas (FUNVISIS),
               Instituto de Materiales y Modelos Estructurales (IMME - UCV).
          <u> <a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Cumana/22a_Lopez.pdf" /></u></p>
          <p style="padding-left: 30px;">Singer, A., Zambrano, A., Oropeza, J., Tagliaferro, M. (2007). Mapa geol&oacute;gico
           del Cuaternario y de las fallas cuaternarias del valle de Caracas. Escala 1:25.000. Proyecto de Microzonificaci&oacute;n
            S&iacute;smica de Caracas. Fundaci&oacute;n Venezolana de Investigaciones Sismol&oacute;gicas (FUNVISIS).</p>`;
        } else if (this.actualThreatName === 'Sismicidad') {
          body = `<h2>Sismicidad</h2>
          <ul>
          <li><strong>A quien consultar en su localidad:</strong></li>
          </ul>
          <ol>
          <li><a title="Instituto de Materiales y Modelos Estructurales de la UCV" href="http://www.ing.ucv.ve/imme/">
          Instituto de Materiales y Modelos Estructurales de la UCV</a>.</li>
          <li><a title="Fundaci&oacute;n Venezolana de Investigaciones Sismol&oacute;gicas" href="http://www.funvisis.gob.ve/index.php">
          Fundaci&oacute;n Venezolana de Investigaciones Sismol&oacute;gicas</a>.</li>
          </ol>
          <ul>
          <li><strong>Para dudas, comentarios y/o sugerencias sobre la informaci&oacute;n de amenaza por sismicidad:</strong></li>
          </ul>
          <p style="padding-left: 30px;"><a title="Instituto de Materiales y Modelos Estructurales de la UCV"
          href="http://www.ing.ucv.ve/imme/">Instituto de Materiales y Modelos Estructurales de la UCV</a>.</p>
          <ul>
          <li><strong>Autores consultados:</strong></li>
          </ul>
          <p style="padding-left: 30px;">Shmitz et all. (2009). &ldquo;Resultados y recomendaciones del proyecto de
           Microzonificaci&oacute;n S&iacute;smica de Caracas&rdquo;. Caracas. <strong>Link adjunto:</strong>
           <a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Chacao/Schmitz.pdf"><strong>
           http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Chacao/Schmitz.pdf</strong></a></p>`;
        }
      } else if (this.actualCity.name === 'Cumaná') {
        if (this.actualThreatName === 'Inundaciones') {
          body = `<h2>Inundaciones</h2>
          <ul>
          <li><strong>A quien consultar en su localidad:</strong></li>
          </ul>
          <ol>
          <li>Protecci&oacute;n Civil del estado Sucre.</li>
          <li>Universidad de Oriente (UDO).</li>
          </ol>
          <ul>
          <li><strong>Para dudas, comentarios y/o sugerencias sobre la informaci&oacute;n de amenaza por aludes torrenciales:</strong></li>
          </ul>
          <p style="padding-left: 30px;">Banco Interamericano de Desarrollo e IDOM/IH Cantabria. (2015).</p>
          <ul>
          <li><strong>Autores consultados:</strong></li>
          </ul>
          <p style="padding-left: 30px;">Banco Interamericano de Desarrollo e IDOM/IH Cantabria. (2015). Estudio 2: Estudio de riesgo y vulnerabilidad ante desastres naturales en el contexto de cambio clim&aacute;tico.</p>`;
        } else if (this.actualThreatName === 'Mov. en masa') {
          body = `<h2>Movimientos en masa</h2>
          <ul>
          <li><strong>A quien consultar en su localidad:</strong></li>
          </ul>
          <ol>
          <li>Universidad de Oriente (UDO).</li>
          <li>Alcald&iacute;a de Cuman&aacute;.</li>
          <li>Protecci&oacute;n Civil del Estado Sucre.</li>
          </ol>
          <ul>
          <li><strong>Para dudas, comentarios y/o sugerencias sobre la informaci&oacute;n de amenaza por movimientos en masa:</strong></li>
          </ul>
          <p style="padding-left: 30px;"><a href="https://cigir.org.ve/inicio/">Centro de Investigaci&oacute;n en Gesti&oacute;n Integral del Riesgo (CIGIR), 2019. Ing. Jenny Moreno</a></p>
          <ul>
          <li><strong>Autores consultados:</strong></li>
          </ul>
          <p style="padding-left: 30px;">Centro de Investigaci&oacute;n en Gesti&oacute;n Integral del Riesgo (CIGIR), 2019.</p>`;
        } else if (this.actualThreatName === 'Tsunami') {
          body = `<ul>
          <li><strong>A quien consultar en su localidad:</strong></li>
          </ul>
          <ol>
          <li>Centro de Sismolog&iacute;a &ldquo;Luis Daniel Beauperthuy Urich&rdquo; de la Universidad de Oriente (UDO).</li>
          <li>Instituto de Oceanograf&iacute;a (UDO).</li>
          </ol>
          <ul>
          <li><strong>Para dudas, comentarios y/o sugerencias sobre la informaci&oacute;n de amenaza por tsunami:</strong></li>
          </ul>
          <p style="padding-left: 30px;">Orihuela Nuris (PhD) y Guevara Mireya (MSc). Escuela Geof&iacute;sica. Facultad de Ingenier&iacute;a, Universidad Central de Venezuela.</p>
          <ul>
          <li><strong>Autores consultados:</strong></li>
          </ul>
          <p style="padding-left: 30px;">Orihuela Nuris PhD y Guevara Mireya MSc. Escuela Geof&iacute;sica. Facultad de Ingenier&iacute;a, Universidad Central de Venezuela.</p>`;
        } else if (this.actualThreatName === 'Sismicidad') {
          body = `<ul>
          <li><strong>A quien consultar en su localidad:</strong></li>
          </ul>
          <ol>
          <li>Centro de Sismolog&iacute;a &ldquo;Luis Daniel Beauperthuy Urich&rdquo; de la Universidad de Oriente (UDO).</li>
          <li>Direcci&oacute;n de Protecci&oacute;n Civil y Administraci&oacute;n de Desastres, del estado Sucre.&nbsp;</li>
          </ol>
          <ul>
          <li><strong>Para dudas, comentarios y/o sugerencias sobre las recomendaciones para la amenaza por sismicidad:</strong></li>
          </ul>
          <ol>
          <li>Centro de Sismolog&iacute;a &ldquo;Luis Daniel Beauperthuy Urich&rdquo; de la Universidad de Oriente (UDO).</li>
          <li><a href="http://www.ing.ucv.ve/imme/">Instituto de Materiales y Modelos Estructurales de la UCV.</a></li>
          </ol>
          <ul>
          <li><strong>Autores consultados:</strong></li>
          </ul>
          <p style="padding-left: 30px;">Viete H. (2012). Evaluaci&oacute;n geol&oacute;gica con fines de Microzonificaci&oacute;n S&iacute;smica de la regi&oacute;n de Cuman&aacute;, edo. Sucre. Informe T&eacute;cnico. CEDI-FUNVISIS. Caracas.</p>`;
        }
      }
      this.showInfo(title, '<hr />' + body);
      this.menu.enable(true);
    }
  }
  async showLegend(titleString: string, bodyString: string) {
    const infoModal = await this.modalController.create({
      component: InfoPageComponent,
      componentProps: {
        title: titleString,
        body: bodyString
      },
      cssClass: 'legend-custom-modal-css'
    });
    return await infoModal.present();
  }
  mapLegend() {
    let title = '',
      body = '';
    this.menu.enable(false);
    if (this.actualCity.name === 'Chacao') {
      if (this.actualThreatName === '') {
        title = 'Chacao';
        body = `Leyenda Chacao`;
      } else if (this.actualThreatName === 'Aludes') {
        title = 'Aludes Torrenciales';
        body = `Leyenda Aludes Torrenciales`;
      } else if (this.actualThreatName === 'Inundaciones') {
        title = 'Inundaciones';
        body = `Leyenda Inundaciones`;
      } else if (this.actualThreatName === 'Sismicidad') {
        title = 'Sismicidad';
        body = `Leyenda Sismicidad`;
      }
      this.showLegend(title, '<hr />' + body);
    }
    this.menu.enable(true);
  }
}
