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
      componentProps: {
        threat: this.actualThreatName,
        city: this.actualCity.name
      },
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
        title = 'Generalidades de la ciudad';
        body = `<p>Si bien el origen de los primeros asentamientos de Chacao data de 1768, el Chacao urbano que hoy
        conocemos es bastante reciente y su existencia como municipio nace apenas en el a&ntilde;o 1989. Esto ha propiciado
        que las din&aacute;micas naturales que all&iacute; se dan no generaran anteriormente mayores da&ntilde;os, haciendo
        con ello que sus antecedentes de desastres sean enga&ntilde;osamente cortos.</p>
        <p><img src="/assets/CH-0.jpg" alt="Chacao" />&nbsp;</p>
        <p>A la hora de identificar los tipos de amenazas de desastres definidos para Chacao, se deben mencionar dos
        escenarios principales: El primero es el de su amenaza s&iacute;smica, cuya importancia qued&oacute; comprobada
        tras el importante n&uacute;mero de edificaciones que fueron severamente afectadas en Chacao luego del terremoto
        de 1967.</p>
        <p>El segundo tipo de amenaza urbana con el que tiene que convivir el municipio Chacao es con la potencial ocurrencia
        de aludes torrenciales que pudieran generarse en el macizo del &Aacute;vila y que pudieran arrastrar gran cantidad de
        materiales en las &aacute;reas de influencia de sus 4 principales cursos de agua: Qda Chacaito, Qda. Seca, Qda.
        Pajaritos y Qda. Sebuc&aacute;n.</p>
        <p>&nbsp;<img src="/assets/CH-1.jpg" alt="Fuente: Blog rescate.com" /></p>
        <p>Otros tipos de amenazas que se han identificado para ese municipio son las asociadas a inundaciones m&aacute;ximas
        del r&iacute;o Guaire que pudieran afectar los espacios de su l&iacute;mite sur y la ocurrencia de eventos
        tecnol&oacute;gicos asociados al uso, almacenamiento y/o la distribuci&oacute;n de materiales peligrosos.</p>`;
      } else if (this.actualThreatName === 'Aludes') {
        title = 'Contexto de amenaza';
        body = `<p>El municipio Chacao cuenta con estudios y mapas muy completos de sus amenazas de aludes torrenciales e
         inundaciones que han sido desarrollados por el Instituto de Mec&aacute;nica de Fluidos de la Universidad Central
         de Venezuela.</p>
          <p><img src="/assets/images/CH-2.jpg"
          alt="Fuente: 300 Noticias" /></p>
          <p>Estas investigaciones permiten estimar las zonas que, ante la ocurrencia de lluvias extraordinarias, pudieran
           ser afectadas tanto por crecidas extraordinarias del r&iacute;o Guaire, como por aludes torrenciales que pudieran
            activarse desde la vertiente sur del macizo del &Aacute;vila.</p>`;
      } else if (this.actualThreatName === 'Inundaciones') {
        title = 'Contexto de amenaza';
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
        title = 'Contexto de amenaza';
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
    } else if (this.actualCity.name === 'Cumaná') {
      if (this.actualThreatName === '') {
        title = 'Generalidades de la ciudad';
        body = `<p>Cuman&aacute; es una de las primeras ciudades fundadas por los espa&ntilde;oles en tierra firme americana,
         y a lo largo de su historia sus espacios han sido v&iacute;ctimas de importantes desastres asociados a la ocurrencia
          de terremotos, eventos clim&aacute;ticos (tormentas tropicales y huracanes), maremotos, inundaciones y derrumbes /
          deslizamientos.</p>
        <p><img src="/assets/CU-0.jpg" alt="Cuman&aacute;" /></p>
        <p>La raz&oacute;n de la alta recurrencia hist&oacute;rica de eventos adversos en Cuman&aacute; est&aacute; asociada
         a su posici&oacute;n geogr&aacute;fica y a sus condiciones f&iacute;sico-naturales, que hacen que los habitantes de
          esta ciudad est&eacute;n obligados a saber c&oacute;mo convivir con amenazas naturales de tipo s&iacute;smico,
           hidrometeorol&oacute;gico y/o geomorfol&oacute;gicas.</p>`;
      } else if (this.actualThreatName === 'Mov. en masa') {
        title = 'Contexto de amenaza';
        body = `<p  >La ciudad de Cuman&aacute; en general tiene una topograf&iacute;a bastante
         plana (altitud de 3 metros en promedio), sin embargo, producto de su actividad tect&oacute;nico-sedimentaria posee
          algunas unidades con relieve medianamente pronunciado, las cuales corresponden a unidades geol&oacute;gicas
           j&oacute;venes, en donde se pueden generar deslizamientos, flujos, derrumbes, etc.</p>
        <p  >Los deslizamientos y flujos son eventos recurrentes y que se dan en algunas &aacute;reas
         de la ciudad, y suelen estar asociados a la ocurrencia de fuertes precipitaciones como su detonante principal.
          La localizaci&oacute;n de este tipo de movimientos en masa se da principalmente en la cercan&iacute;a a los cerros
           Caig&uuml;ir&eacute;.</p>
        <p  >Las zonas urbanas susceptibles a generar movimientos en masa que aqu&iacute; se
         muestran han sido definidas muy someramente y en base a criterios topogr&aacute;ficos y al conocimiento que se
          tiene de la alta susceptibilidad que suelen tener formaciones geol&oacute;gicas similares. No se han ubicado
           hasta ahora estudios m&aacute;s rigurosos que validen esta delimitaci&oacute;n, por lo que se recomienda realizar
            estudios con mayor detalle.</p>`;
      } else if (this.actualThreatName === 'Inundaciones') {
        title = 'Contexto de amenaza';
        body = `<p  >Las inundaciones fluviales y costeras en Cuman&aacute; ha sido una
         condici&oacute;n recurrente que se ha presentado desde la fundaci&oacute;n de la ciudad debido a su condici&oacute;n
          geogr&aacute;fica y topogr&aacute;fica. Esta ciudad ha crecido sobre una llanura fluvio-mar&iacute;tima, formada por
           el rio Manzanares, el golfo de Cariaco y el mar Caribe, y por grandes &aacute;reas de lagunas que fueron modificadas
            para dar paso al desarrollo y la ocupaci&oacute;n urbana de sus espacios.&nbsp;</p>
        <p  >Con el paso del tiempo el crecimiento urbano conllev&oacute; al desvi&oacute; del cauce
         de sus principales r&iacute;os y la construcci&oacute;n de aliviaderos, para disminuir las continuas inundaciones
          fluviales. Penosamente muchas de estas obras se hicieron sin los estudios base apropiados y ello hace que varios de
           sus espacios est&eacute;n expuestos a la amenaza de inundaciones asociados a las crecidas de sus cuencas urbanas,
            y que suelen agravarse ante las fallas detectadas en los sistemas de drenajes pluviales, los cuales colapsan con
             bastante regularidad.</p>
        <p  >Los estudios m&aacute;s recientes que se han elaborado sobre esta amenaza fueron
         desarrollados en el 2015 por el IDOM de la Universidad de Cantabria a solicitud del BID, y como parte de estos
          estudios se realizaron simulaciones para precipitaciones excepcionales que arrojaron manchas de inundaciones
           pluviales y fluviales urbanas con sus respectivas profundidades. De esos trabajos han sido tomados aqu&iacute;
            las &aacute;reas inundables estimadas para lluvias extraordinarias de periodos de 100 a&ntilde;os de retorno.</p>`;
      } else if (this.actualThreatName === 'Sismicidad') {
        title = 'Contexto de amenaza';
        body = `<p  >El nivel de amenaza s&iacute;smica del estado Sucre ha sido definido como
         el m&aacute;s alto del pa&iacute;s (FUNVISIS) y ello es producto de la interacci&oacute;n que all&iacute; se da entre
          las placas tect&oacute;nicas del Caribe y Suram&eacute;rica.</p>
        <p  >Diversos esfuerzos se han realizado para caracterizar la amenaza s&iacute;smica de
         Cuman&aacute;, particularmente por el Centro de Sismolog&iacute;a &ldquo;Luis Daniel Beauperthuy Urich&rdquo;, de
          la Universidad de Oriente (UDO) y de la Fundaci&oacute;n Venezolana de Investigaciones Sismol&oacute;gicas (FUNVISIS).</p>
        <p  >Estos esfuerzos han permitido conocer la ubicaci&oacute;n tanto de las principales
         fallas geol&oacute;gicas que atraviesan a la ciudad en sentido oeste-este (Viete, 2012), como de sus posibles
          &aacute;reas de influencia, que corresponden a zonas potencialmente deformables por acci&oacute;n de un movimiento
           s&iacute;smico.</p>
        <p  >&nbsp;</p>
        <p  ><em>
        <img src="/assets/images/CU-1.jpg"
         alt="Fuente: Diario El Tiempo" /></em></p>
        <p  >Otro esfuerzo reciente y muy importante en este sentido son los progresos
         parciales alcanzados en la microzonificaci&oacute;n s&iacute;smica de la ciudad, y que fueron presentados por el
          Banco Interamericano de Desarrollo (2018), como parte de un estudio en el que caracterizaron siete (07) microzonas
           s&iacute;smicas dentro de la ciudad de Cumana, en las que conviene respetar algunos criterios t&eacute;cnicos de
            ingenier&iacute;a a la hora de dise&ntilde;ar nuevas edificaciones y/o evaluar-adecuar edificaciones existentes
            .</p>`;
      } else if (this.actualThreatName === 'Tsunami') {
        title = 'Contexto de amenaza';
        body = `<p  >Los tsunamis en Venezuela son fen&oacute;menos muy poco comunes, sin embargo,
         la historia ha registrado varios eventos de este tipo que han afectado de manera importante a Cumana, y la probabilidad
          de que se pueda repetir a futuro es latente.</p>
        <p  >Seg&uacute;n datos de O&acute;loughlin &amp; Lander (2003) Venezuela cuenta con un registro
         hist&oacute;rico (1498-1997) de 27 sismos que tuvieron el potencial de generar grandes olas (tsunamis). De estos, se
          cuenta con descripciones de 3 eventos que afectaron a la ciudad de Cumana en los a&ntilde;os de 1530, 1853 y 1929.</p>
        <p  >Diversos estudios se han realizado en torno a esta amenaza. Uno de los m&aacute;s
         recientes y completos son presentados por Guevara (2014), quien realiza la simulaci&oacute;n de 5 posibles escenarios
          de tsunamis en Cuman&aacute;, tomando como referencia el registrado tras el sismo del 17 de enero 1929.&nbsp; Esta
           investigaci&oacute;n sugiere las zonas de Cuman&aacute; que podr&iacute;an verse afectadas ante distintas estimaciones
            de alturas de olas, y de estas se ha tomado el escenario V (el menos favorable y con olas m&aacute;ximas de hasta 3
               metros de altura).</p>`;
      }
    } else if (this.actualCity.name === 'Mérida') {
      if (this.actualThreatName === '') {
        title = 'Generalidades de la ciudad';
        body = `<p>La ciudad de M&eacute;rida ha sufrido a lo largo de su historia un n&uacute;mero importante de desastres
         particularmente asociados a terremotos, movimientos en masa, crecidas y aludes torrenciales, asociados principalmente
          las din&aacute;micas de sus cinco cauces urbanos principales: Milla, La Pedregosa, Albarregas, Mucuj&uacute;n y Chama.</p>
        <p><img src="/assets/ME-0.jpg" alt="M&eacute;rida" /></p>
        <p>Seg&uacute;n datos disponibles en el registro hist&oacute;rico &ldquo;Estudios y Desastres&rdquo;, se reconocen en
         esa regi&oacute;n un total de 548 eventos adversos, de los cuales un 65% est&aacute;n asociados a eventos de origen
          natural. Estos eventos a su vez se distribuyen en un 7% (44 eventos) asociados a terremotos, un 42% (312) asociados
           a crecidas y aludes torrenciales, y finalmente un 16% (117 eventos) asociados a movimientos en masa (derrumbes,
             deslizamientos, etc.). Tambi&eacute;n se se&ntilde;alan que un 35% (75 eventos) de sus eventos adversos urbanos
              est&aacute;n asociados a amenazas tecnol&oacute;gicas (incendios, fugas de materiales peligrosos, etc).</p>
        <p><img src="/assets/ME-1.jpg" alt="Fuente: Diario Frontera 03-11-2001" /></p>`;
      } else if (this.actualThreatName === 'Inundaciones') {
        title = 'Contexto de amenaza';
        body = `<p>El &aacute;rea metropolitana de M&eacute;rida es atravesada por diversos cursos de agua que desembocan en
        la cuenca media del r&iacute;o Chama. Entre estos afluentes h&iacute;dricos destacan hacia el flanco norte de la ciudad
        los r&iacute;os: Mucuj&uacute;n, Milla, Albarregas y La Pedregosa; y las quebradas El Pe&ntilde;&oacute;n, Gavidia,
        El Rinc&oacute;n, La Resbalosa y Carvajal. En el flanco sur se localizan las quebradas: El Volc&aacute;n, La Perla, San
        Jacinto, Cafetal, La Fr&iacute;a, Las Adjuntas y La Gavidia. Gran parte de estos r&iacute;os y quebradas se reconocen
        por presentar comportamientos peri&oacute;dicos de tipo torrencial, asociado a crecidas peri&oacute;dicas y excepcionales,
        y cuyos periodos de retorno han sido en muchos casos adecuadamente estimados.</p>
        <p><img src="/assets/ME-2.jpg" alt="Fuente: El informador" width="800" height="500" /></p>
        <p>Estos reg&iacute;menes de crecidas de los cauces urbanos que rodean a la ciudad deben invitar a sus pobladores a
        tomar precauciones, especialmente entre quienes ocupan los espacios ubicados en las manchas de inundaci&oacute;n en caso
        de crecidas excepcionales que han sido estimadas.</p>`;
      } else if (this.actualThreatName === 'Sismicidad') {
        title = 'Contexto de amenaza';
        body = `<p>La terraza de M&eacute;rida ha sido objeto de diversos estudios orientados a tratar de determinar sus
         niveles de amenaza s&iacute;smica. Inicialmente se han logrado identificar en ella varias fallas primarias y
          secundarias asociadas al sistema de Bocon&oacute;, y que atraviesan distintas zonas de la ciudad. Entre estas
           fallas tenemos: la Falla de Bocon&oacute; (segmentos 1, 2, 3, 4), Falla de la Mucuy, Falla de Albarregas,
            Falla de La Hechicera y la Falla de Jaji.</p>
        <p><img src="/assets/ME-4.jpg"
        alt="Fuente: Archivo Hist&oacute;rico de la Universidad de Los Andes" /></p>
        <p>Adicionalmente se han realizado algunos avances orientados a microzonificar s&iacute;smicamente la ciudad,
         a diferencia de otros mapas de amenaza urbanos, la Microzonificaci&oacute;n S&iacute;smica no sostiene que una
          zona es mejor o peor que otra, solo sugiere que en caso de un sismo los edificios de ciertas caracter&iacute;sticas
           (altura, tipolog&iacute;a constructiva, a&ntilde;o de construcci&oacute;n, etc) ser&aacute;n&nbsp;&nbsp; m&aacute;s
            vulnerables que otros, de all&iacute; la importancia de su adecuada evaluaci&oacute;n por parte de un ingeniero.</p>`;
      } else if (this.actualThreatName === 'Mov. en masa') {
        title = 'Contexto de amenaza';
        body = `<p>La ciudad de M&eacute;rida se ubica en un espacio con una geolog&iacute;a muy variada y din&aacute;mica,
         en la que se distinguen zonas de dep&oacute;sitos tipo terraza (limitada por los r&iacute;os: Chama, Albarregas,
           Milla y Mucuj&uacute;n), flancos integrados por zonas de deyecci&oacute;n y aluviones recientes, y &aacute;reas
            de relieve escarpado que bordea la ciudad. Este complejo escenario hace que en la ciudad sean frecuentes la
             presencia de derrumbes, deslizamientos y otros tipos de movimientos geol&oacute;gicos en masa.</p>
        <p><img src="/assets/ME-3.jpg"
        alt="Fuente: Diario Pico Bolivar 18-05-2005" /></p>
        <p>Este contexto hace que existan diversos niveles de amenaza de movimientos geol&oacute;gicos en masa y que han
         sido identificados en distintas investigaciones. Los resultados que se presentan obedecen a los mapas de
          Ram&iacute;rez (2014), quien basado en el cruce de diversas variables, caracteriza los niveles de susceptibilidad
           de los suelos a movimientos en masa.</p>`;
      }
    }
    this.showInfo(title, '<hr />' + body);
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
          sobre este tipo de amenazas.</p> <p>&nbsp;</p> \
          <p>&nbsp;</p> \
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
            protocolos familiares y comunitarios de preparación y actuación en caso de inundaciones </p> <p>&nbsp;</p> \
            <p>&nbsp;</p> \
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
            <p>&nbsp;</p> \
            <p>&nbsp;</p> \
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
          <p>No aplica.</p> <p>&nbsp;</p>
          <p>&nbsp;</p>
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
          <p>Posterior a la ocurrencia de un sismo de gran magnitud, se sugiere buscar una zona elevada superior a los 4
           metros de altura para su resguardo, mientras la alerta de tsunami baja.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Se recomienda que se implementen protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n
           en caso de tsunamis.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Participar en los simulacros propiciados por las autoridades gubernamentales o de programas internacionales como
           el Caribe Wave.&nbsp;</p>
          <h6>Altura de la ola: 2,5 m</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Posterior a la ocurrencia de un sismo de gran magnitud, se sugiere buscar una zona elevada superior a los 4 metros
           de altura para su resguardo, mientras la alerta de tsunami baja.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Se recomienda que se implementen protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n
           en caso de tsunamis.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Participar en los simulacros propiciados por las autoridades gubernamentales o de programas internacionales como
           el Caribe Wave.</p>
          <h6>Altura de la ola: 2 m</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Posterior a la ocurrencia de un sismo de gran magnitud, se sugiere buscar una zona elevada superior a los 3 metros
           de altura para su resguardo, mientras la alerta de tsunami baja.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Se recomienda que se implementen protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en
           caso de tsunamis.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Participar en los simulacros propiciados por las autoridades gubernamentales o de programas internacionales como
           el Caribe Wave.&nbsp;</p>
          <h6>Altura de la ola: 1,5 m</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Posterior a la ocurrencia de un sismo de gran magnitud, se sugiere buscar una zona elevada superior a 2,5 metros
           de altura para su resguardo, mientras la alerta de tsunami baja.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Se recomienda que se implementen protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en
           caso de tsunamis.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Participar en los simulacros propiciados por las autoridades gubernamentales o de programas internacionales como
           el Caribe Wave.&nbsp;</p>
          <h6>Altura de la ola: 1 m</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Posterior a la ocurrencia de un sismo de gran magnitud, se sugiere buscar una zona elevada superior a 2 metros de
           altura para su resguardo, mientras la alerta de tsunami baja.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Se recomienda que se implementen protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en
           caso de tsunamis.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Participar en los simulacros propiciados por las autoridades gubernamentales o de programas internacionales como
           el Caribe Wave.&nbsp;</p>
          <h6>Altura de la ola: 0,5 m</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Se recomienda que se implementen protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n
           en caso de tsunamis.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Participar en los simulacros propiciados por las autoridades gubernamentales o de programas internacionales como
           el Caribe Wave.&nbsp;</p>
           <p>&nbsp;</p>
          <p>&nbsp;</p>
          <h6>Si deseas mayor informaci&oacute;n sobre tsunamis de Cuman&aacute;, visita:</h6>
          <p><a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Cumana/52a_Guevara.pdf">
          Guevara, M. (2014). Simulaci&oacute;n num&eacute;rica del tsunami asociado al terremoto del 17 de enero de
           1929 en la ciudad de Cuman&aacute;, una contribuci&oacute;n a los estudios de riesgo en las costas venezolanas.
            Tesis de grado. Maestr&iacute;a en Geof&iacute;sica. Facultad de Ingenier&iacute;a, Universidad
             Central de Venezuela.&nbsp; </a><strong><u>)</u></strong></p>
          <p><strong><u>&nbsp;</u></strong></p>
          <h6>Sobre ejercicios de preparaci&oacute;n para tsunami, visita:</h6>
          <p><a href="https://www.tsunamizone.org/espanol/caribewave/">The Tsunami Zone</a></p>`;
        } else if (this.actualThreatName === 'Inundaciones') {
          body = `<h6><strong>Amenaza por Inundaciones fluviales</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Se recomienda a quienes ocupan esos espacios a realizar seguimiento a los servicios de pron&oacute;stico
           meteorol&oacute;gico disponibles.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Tomar previsiones en caso de: incrementos de caudales y declaraci&oacute;n de alertas asociadas a lluvias
           locales de gran intensidad.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Conviene que se mantengan protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en
           caso de darse estos eventos.&nbsp;&nbsp;</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/four.png" /></p>
          <p>Apoyar procesos de limpieza permanentes de los canales de los drenajes y el desarrollo de obras de mitigaci&oacute;n
           de efectos de posibles inundaciones.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/five.png" /></p>
          <p>Vigilar y promover la conservaci&oacute;n de las capas de vegetaci&oacute;n aguas arriba.</p>
          <p>&nbsp;</p>
          <h6>Amenaza por Inundaciones pluviales</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Se recomienda a quienes ocupan esos espacios a realizar seguimiento a los servicios de pron&oacute;stico
           meteorol&oacute;gico disponibles.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Tomar previsiones en caso de: incrementos de caudales y declaraci&oacute;n de alertas asociadas a lluvias
           locales de gran intensidad.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Conviene que se mantengan protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en
           caso de darse estos eventos.&nbsp;&nbsp;</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/four.png" /></p>
          <p>Apoyar procesos de limpieza permanentes de los canales de los drenajes y el desarrollo de obras de mitigaci&oacute;n
           de efectos de posibles inundaciones.</p>
          <p>&nbsp;</p><p>&nbsp;</p>
          <p>&nbsp;</p>
          <h6>Si deseas mayor informaci&oacute;n sobre inundaciones pluviales y fluviales de Cuman&aacute;, visita:</h6>
          <p><a href="https://issuu.com/ciudadesemergentesysostenibles/docs/cumana_sostenible_lr_compressed">Banco Interamericano
           de Desarrollo y IDOM/IH Cantabria. (2015). CUMAN&Aacute;: Estudio de riesgo y vulnerabilidad ante desastres naturales
            en el contexto de cambio clim&aacute;tico</a>&nbsp;</p>
          <p><strong><u>&nbsp;</u></strong></p>
          <h6>Sobre protocolos de actuaci&oacute;n ante inundaciones, visita:</h6>
          <p><a href="https://www.youtube.com/watch?v=mFFRzIuD2Nw">Video: &iquest;Qu&eacute; hacer en caso de inundaci&oacute;n? </a></p>`;
        } else if (this.actualThreatName === 'Mov. en masa') {
          body = `<h6><strong>Amenaza por Movimientos en masa</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Para el uso y la ocupaci&oacute;n adecuada de estos espacios, se recomienda realizar estudios t&eacute;cnicos
           m&aacute;s espec&iacute;ficos (geol&oacute;gicos, geomorfol&oacute;gicos, geot&eacute;cnicos, etc).</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Promover y practicar permanentemente protocolos comunitarios y familiares de actuaci&oacute;n en caso de
           deslizamientos. Es importante identificar las zonas seguras de su comunidad.</p><p>&nbsp;</p>
           <p>&nbsp;</p>
          <h6>Si deseas mayor informaci&oacute;n sobre protocolos de actuaci&oacute;n ante movimientos en masa, visita:</h6>
          <p><a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Cumana/Landslide_SPN.pdf">
          Recomendaciones de la Cruz Roja Americana ante deslizamientos</a></p>`;
        }
      } else if (this.actualCity.name === 'Mérida') {
        if (this.actualThreatName === 'Inundaciones') {
          body = `<h6><strong>Amenaza por Inundaciones</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Se recomienda a quienes ocupan esos espacios, realizar seguimiento a los servicios de pronóstico meteorológico disponibles.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Tomar previsiones en caso de: incrementos de caudales y declaración de alertas asociadas a lluvias locales de
           gran intensidad.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Conviene que se mantengan protocolos familiares y comunitarios de preparación y actuación en caso de darse estos eventos.</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <h6>Si deseas mayor informaci&oacute;n sobre inundaciones locales  , visita:</h6>
          <p><a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Merida/Linayo_Ferrer.pdf">
          Ferrer C., Linayo A. (2009). Mérida: Ciudad Segura. Mérida, Venezuela. Talleres Gráficos Universitarios</a>&nbsp;</p>
          <p><strong><u>&nbsp;</u></strong></p>
          <h6>Sobre protocolos de actuaci&oacute;n ante inundaciones, visita:</h6>
          <p><a href="https://www.youtube.com/watch?v=mFFRzIuD2Nw">Video: &iquest;Qu&eacute; hacer en caso de inundaci&oacute;n? </a></p>`;
        } else if (this.actualThreatName === 'Mov. en masa') {
          body = `<h6><strong>Amenaza por Movimientos en masa</strong></h6>
          <h6>Nivel de amenaza: <strong>MUY ALTA</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Se recomienda realizar monitoreo constante en periodos lluviosos o eventos de fuertes precipitaciones, as&iacute;
           como vigilar el uso de la tierra, la adecuada gesti&oacute;n de aguas servidas y la conservaci&oacute;n de las capas
            de vegetaci&oacute;n.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Mantener el monitoreo permanente de las edificaciones con el uso de reglas graduadas que permitan evaluar posibles
           desplazamientos, grietas o fisuras en paredes, columnas, etc.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Promover y practicar permanentemente protocolos comunitarios y familiares de actuaci&oacute;n en caso de deslizamientos.</p>
          <h6>Nivel de amenaza: <strong>ALTA</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Se recomienda realizar monitoreo en periodos lluviosos o eventos de fuertes precipitaciones, as&iacute; como vigilar
           el uso de la tierra, la adecuada gesti&oacute;n de aguas servidas y la conservaci&oacute;n de las capas de vegetaci&oacute;n.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Mantener el monitoreo de las edificaciones con el uso de reglas graduadas que permitan evaluar posibles desplazamientos,
           grietas o fisuras en paredes, columnas, etc.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Promover y practicar permanentemente protocolos comunitarios y familiares de actuaci&oacute;n en caso de deslizamientos.</p>
          <h6>Nivel de amenaza: <strong>MODERADA</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Se reconocen como zonas intermedias entre &aacute;reas de alta y muy alta, y de baja susceptibilidad, y en tal sentido
           sus habitantes deben conocer su ubicaci&oacute;n en relaci&oacute;n a zonas seguras e inseguras.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Por su condici&oacute;n de incertidumbre ante la ocurrencia de eventos que superan los escenarios normales, se debe
           promover el conocimiento de protocolos preparaci&oacute;n y respuesta comunitaria y sistemas de alerta temprana.</p>
          <h6>Nivel de amenaza: <strong>BAJA</strong></h6>
          <p>Se corresponden con posiciones geomorfol&oacute;gicas altas, sobresalientes y retiradas de las zonas de alta
           susceptibilidad, que no representan zonas de peligro ante movimientos de masa de grandes magnitudes.</p>
          <h6>Nivel de amenaza: <strong>MUY BAJA</strong></h6>
          <p>Por considerar que estos espacios no est&aacute;n comprometidos ante la ocurrencia de eventos hidrogeomorfol&oacute;gicos,
           se reconoce que son los m&aacute;s estables, seguros y apropiados para el desarrollo y consolidaci&oacute;n.</p>
           <p>&nbsp;</p>
           <p>&nbsp;</p>
          <h6>Si deseas mayor informaci&oacute;n sobre movimientos en masa locales, visita:</h6>
          <p><a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Merida/Linayo_Ferrer.pdf">
          Ferrer C., Linayo A. (2009). M&eacute;rida: Ciudad Segura. M&eacute;rida, Venezuela. Talleres Gr&aacute;ficos
          Universitarios</a></p>
          <h6>Sobre protocolos de actuaci&oacute;n ante movimientos en masa, visita:</h6>
          <p><a href="https://www.youtube.com/watch?v=2kTluSZeML8&amp;feature=youtu.be">Video: Prevenci&oacute;n y
           mitigaci&oacute;n. Deslizamientos y derrumbes. Colecci&oacute;n Defensa Civil Venezuela </a></p>
          <p><a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Cumana/Landslide_SPN.pdf">
          Recomendaciones de la Cruz Roja Americana ante deslizamientos</a></p>`;
        } else if (this.actualThreatName === 'Sismicidad') {
          body = `<h6><strong>Microzonificaci&oacute;n s&iacute;smica</strong></h6>
          <h6>Microzona: <strong>3-1</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Evaluaci&oacute;n sismorresistente de los edificios construidos antes de 1967.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Inspecci&oacute;n t&eacute;cnica de los edificios de columnas y vigas &le; 15 pisos o de muros &le;
          25 pisos de construidos entre 1967-1982.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Dise&ntilde;o de nuevas edificaciones considerando el espectro de la microzona 3-1.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/four.png" /></p>
          <p>Implementaci&oacute;n de protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n
          en caso de terremotos.</p>
          <h6>Microzona: <strong>4-1</strong></h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Evaluaci&oacute;n sismorresistente de los edificios construidos antes de 1967.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Inspecci&oacute;n t&eacute;cnica de los edificios de columnas y vigas &ge; 4 pisos o de muros &ge; 7
          pisos construidos entre 1967-1982.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Dise&ntilde;o de nuevas edificaciones considerando el espectro de la microzona 4-1.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/four.png" />Implementaci&oacute;n de
          protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n en caso de terremotos.</p>
          <p>&nbsp;</p>
          <h6>Zona de influencia de fallas geol&oacute;gicas</h6>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/one.png" /></p>
          <p>Por ser una zona susceptible a deformarse, posee algunas limitaciones constructivas. El dise&ntilde;o y
          c&aacute;lculo de edificaciones nuevas debe seguir las especificaciones del caso, definidas en la norma COVENIN 1756
           (2001) y su actualizaci&oacute;n (2019). Para las edificaciones existentes, se sugiere la evaluaci&oacute;n por
            parte de un ingeniero civil, para determinar si debe o no realizar modificaciones o adecuaciones.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/two.png" /></p>
          <p>Cotejar esta informaci&oacute;n con las sugerencias dadas en la microzonificaci&oacute;n s&iacute;smica.</p>
          <p><img style="padding: 0 15px; float: left; height: 32px;" src="/assets/three.png" /></p>
          <p>Se recomienda que se implementen protocolos familiares y comunitarios de preparaci&oacute;n y actuaci&oacute;n
          en caso de terremotos.</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p><strong>Si deseas mayor informaci&oacute;n sobre riesgo s&iacute;smico de M&eacute;rida, visita:</strong></p>
          <p><a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Merida/Lafaille.pdf">Laffaille J.
           (2009). M&eacute;rida: Ciudad de cuatro r&iacute;os y cuatro terremotos. M&eacute;rida, Venezuela.
           Talleres Gr&aacute;ficos Universitarios</a></p>
          <p><strong>Sobre protocolos de actuaci&oacute;n ante riesgo s&iacute;smico, visita:</strong></p>
          <p><a href="https://www.youtube.com/watch?v=n_7lfodHSYI">Video: Riesgo S&iacute;smico de la ciudad de M&eacute;rida</a></p>
          <p><a href="https://www.youtube.com/watch?v=4j7vsBCRvmE">Video: &iquest;Qu&eacute; debo hacer en caso de sismo?:
          antes, durante y despu&eacute;s </a></p>`;
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
          body = `<ul>
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
          body = `<ul>
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
          body = `<ul>
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
          <p style="padding-left: 30px;">
           <a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Chacao/Schmitz.pdf"><strong>
           Shmitz et all. (2009). &ldquo;Resultados y recomendaciones del proyecto de
           Microzonificaci&oacute;n S&iacute;smica de Caracas&rdquo;. Caracas. </strong></a></p>`;
        }
      } else if (this.actualCity.name === 'Cumaná') {
        if (this.actualThreatName === 'Inundaciones') {
          body = `<ul>
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
          body = `<ul>
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
      } else if (this.actualCity.name === 'Mérida') {
        if (this.actualThreatName === 'Inundaciones') {
          body = `<ul>
          <li><strong>A quien consultar en su localidad:</strong></li>
          </ul>
          <ol>
          <li>Centro de Sismolog&iacute;a &ldquo;Luis Daniel Beauperthuy Urich&rdquo; de la Universidad de Oriente (UDO).</li>
          <li>Direcci&oacute;n de Protecci&oacute;n Civil y Administraci&oacute;n de Desastres de Sucre.</li>
          <li><a href="http://www.fundapris.org.ve/">Fundaci&oacute;n para Prevenci&oacute;n del Riesgo S&iacute;smico</a></li>
          </ol>
          <p>&nbsp;</p>
          <ul>
          <li><strong>Para dudas, comentarios y/o sugerencias sobre la informaci&oacute;n de amenaza por inundaciones:</strong></li>
          </ul>
          <p style="padding-left: 30px;">Sub-Comisi&oacute;n de Caracterizaci&oacute;n de Riesgos Socionaturales de la
           Fundaci&oacute;n para la Prevenci&oacute;n del Riesgo S&iacute;smico (<a href="http://www.fundapris.org.ve/">
           FUNDAPRIS</a>)&nbsp;</p>
          <p>&nbsp;</p>
          <ul>
          <li><strong>Autores consultados:</strong></li>
          </ul>
          <p style="padding-left: 30px;"><a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Merida/Linayo_Ferrer.pdf">Ferrer C., Linayo A. (2009). M&eacute;rida: Ciudad Segura. M&eacute;rida, Venezuela. Talleres Gr&aacute;ficos Universitarios</a>.&nbsp;</p>`;
        } else if (this.actualThreatName === 'Sismicidad') {
          body = `<ul>
          <li><strong>A quien consultar en su localidad:</strong></li>
          </ul>
          <ol>
          <li>Sub-Comisi&oacute;n de Caracterizaci&oacute;n de Riesgos Socionaturales de la Fundaci&oacute;n para la
           Prevenci&oacute;n del Riesgo S&iacute;smico (<a href="http://www.fundapris.org.ve/">FUNDAPRIS</a>)</li>
          <li>Departamento Estructuras, Escuela Ingenier&iacute;a Civil de la Universidad de Los Andes (ULA).</li>
          <li>Laboratorio de Geof&iacute;sica de la ULA.</li>
          </ol>
          <p>&nbsp;</p>
          <ul>
          <li><strong>Para dudas, comentarios y/o sugerencias sobre la informaci&oacute;n y recomendaciones de amenaza por
           sismicidad: </strong></li>
          </ul>
          <ol>
          <li>Laboratorio de Geof&iacute;sica de la Universidad de Los Andes</li>
          <li>Instituto de Modelos y Materiales de la UCV</li>
          </ol>
          <p>&nbsp;</p>
          <ul>
          <li><strong>Autores consultados</strong></li>
          </ul>
          <p style="padding-left: 30px;">
          <a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Merida/Linayo_Ferrer.pdf">
          Ferrer C., Linayo A. (2009). M&eacute;rida: Ciudad Segura. M&eacute;rida, Venezuela. Talleres Gr&aacute;ficos
          Universitarios</a>.</p>
          <p style="padding-left: 30px;">Centro de Sismolog&iacute;a &ldquo;Luis Daniel Beauperthuy Urich&rdquo; de la
          Universidad de Oriente (UDO). NO EXISTE DOCUMENTO</p>
          <p style="padding-left: 30px;">Viete H. (2012). Evaluaci&oacute;n geol&oacute;gica con fines de Microzonificaci&oacute;n
           S&iacute;smica de la regi&oacute;n de Cuman&aacute;, edo. Sucre. Informe T&eacute;cnico. CEDI-FUNVISIS. Caracas.</p>
          <p style="padding-left: 30px;">
          <a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Cumana/52a_Guevara.pdf">
          Guevara, M. (2014). Simulaci&oacute;n num&eacute;rica del tsunami asociado al terremoto del 17 de enero de 1929 en
           la ciudad de Cuman&aacute;, una contribuci&oacute;n a los estudios de riesgo en las costas venezolanas. Tesis de
            grado. Maestr&iacute;a en Geof&iacute;sica. Facultad de Ingenier&iacute;a, Universidad Central de Venezuela</a></p>`;
        } else if (this.actualThreatName === 'Mov. en masa') {
          body = `<ul>
          <li><strong>A quien consultar en su localidad:</strong></li>
          </ul>
          <ol>
          <li>Fundaci&oacute;n para la Prevenci&oacute;n del Riesgo S&iacute;smico (<a href="http://www.fundapris.org.ve/">
          FUNDAPRIS</a>)</li><li><a href="http://www.ula.ve/ciencias-forestales-ambientales/igeo/">Instituto de Geograf&iacute;a
           de la Universidad de Los Andes</a></li>
          <li><a href="https://www.facebook.com/ImprademProteccioncivilMerida/">Protecci&oacute;n Civil del Estado M&eacute;rida</a></li>
          <li>Escuela de Ingenier&iacute;a Geol&oacute;gica ULA.</li>
          </ol>
          <p>&nbsp;</p>
          <ul>
          <li><strong>Para dudas, comentarios y/o sugerencias sobre la informaci&oacute;n de amenaza por movimientos en masa:</strong></li>
          </ul>
          <p style="padding-left: 30px;">Sub-Comisi&oacute;n de Caracterizaci&oacute;n de Riesgos Socionaturales de la
           Fundaci&oacute;n para la Prevenci&oacute;n del Riesgo S&iacute;smico (<a href="http://www.fundapris.org.ve/">
           FUNDAPRIS</a>)&nbsp;</p>
          <p><strong>&nbsp;</strong></p>
          <ul>
          <li><strong>Autores consultados:</strong></li>
          </ul>
          <p style="padding-left: 30px;">
          <a href="http://159.90.200.233/amenazasurbanas/DocumentosYFotos/Documentos/Merida/Linayo_Ferrer.pdf">
          Ferrer C., Linayo A. (2009). M&eacute;rida: Ciudad Segura. M&eacute;rida, Venezuela. Talleres Gr&aacute;ficos
           Universitarios.&nbsp;</a></p>`;
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
