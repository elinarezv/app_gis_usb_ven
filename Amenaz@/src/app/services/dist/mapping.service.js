"use strict";
/// <reference path="../leaflet.pattern.d.ts"/>
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MappingService = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var L = require("leaflet");
require("leaflet.pattern");
var esri = require("esri-leaflet");
require("../../assets/js/leaflet-polygon.fillPattern");
var leaflet_1 = require("leaflet");
var leaflet_geosearch_1 = require("leaflet-geosearch");
var MappingService = /** @class */ (function () {
    function MappingService(authService, storage, env, androidPermissions, geolocation, locationAccuracy, http, events) {
        var _this = this;
        this.authService = authService;
        this.storage = storage;
        this.env = env;
        this.androidPermissions = androidPermissions;
        this.geolocation = geolocation;
        this.locationAccuracy = locationAccuracy;
        this.http = http;
        this.events = events;
        this.cities = [];
        this.nonThreadMaps = [];
        this.seismThreadMaps = [];
        this.landSlideThreadMaps = [];
        this.floodThreadMaps = [];
        if (this.env.USE_ESRI_BASEMAPS) {
            this.baseMap = esri.basemapLayer('DarkGray');
            this.baseMapLabels = esri.basemapLayer('DarkGrayLabels');
        }
        else {
            this.baseMap = leaflet_1.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                id: 'mapId',
                attribution: 'www.usb.ve Licencia GPLv3 y CC',
                maxZoom: 16
            });
            this.baseMapLabels = null;
        }
        this.baseMapName = 'esri-dark';
        // Fix Leaflet bug with markers
        this.iconRetinaUrl = 'assets/marker-icon-2x.png';
        this.iconUrl = 'assets/marker-icon.png';
        this.shadowUrl = 'assets/marker-shadow.png';
        var iconVar = leaflet_1.icon({
            iconRetinaUrl: this.iconRetinaUrl,
            iconUrl: this.iconUrl,
            shadowUrl: this.shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41]
        });
        // Define Cities for App
        this.initialView = {
            id: 0,
            name: 'País',
            location: [8.031, -65.346],
            marker: undefined,
            zoomLevel: 5,
            layers: [],
            schemaName: ''
        };
        this.searchProvider = new leaflet_geosearch_1.OpenStreetMapProvider();
        this.searchControl = new leaflet_geosearch_1.GeoSearchControl({
            provider: this.searchProvider,
            style: 'bar',
            autoComplete: true,
            autoCompleteDelay: 250
        });
        this.searchPlaces = [];
        this.isSearchMarkerSet = false;
        this.loadLocations().subscribe(function (result) {
            result.forEach(function (city) {
                if (!city.zoom) {
                    city.zoom = 13;
                }
                _this.cities.push({
                    id: city.id,
                    name: city.nombre,
                    schemaName: city.esquema,
                    location: [city.latitud, city.longitud],
                    marker: undefined,
                    layers: [],
                    zoomLevel: city.zoom
                });
                _this.loadLocationsLayers(city.id);
            });
        }, function (error) {
            console.log('error');
        }, function () {
            // Add Marker of City with GeoInformation
            _this.cities.forEach(function (city) {
                city.marker = leaflet_1.marker(city.location, { icon: iconVar }).bindPopup(city.name).openPopup();
            });
            _this.gotGeoposition = false;
            _this.getAllMaps();
            _this.events.publish('cities-loaded');
        });
        this.stripes = new L.StripePattern();
    }
    MappingService.prototype.downloadLocations = function () {
        var _this = this;
        return rxjs_1.from(this.storage.getItem('cities')).pipe(operators_1.catchError(function (error) { return _this.loadLocations(); }));
    };
    MappingService.prototype.loadLocations = function () {
        var _this = this;
        return this.http
            .get(this.env.API_URL + 'data/getlocations', {
            headers: {
                Authorization: 'Basic ' + this.authService.token,
                'x-access-token': this.authService.token.data.token
            }
        })
            .pipe(operators_1.tap(function (data) {
            _this.storage.setItem('cities', data)["catch"](function (error) {
                console.log('Error storing Item');
            });
            return data;
        }));
    };
    MappingService.prototype.setSearchMarker = function (x, y) {
        this.searchMarker = leaflet_1.marker([x, y], {
            icon: leaflet_1.icon({
                iconRetinaUrl: 'assets/icon/marker-icon-2-2x.png',
                iconUrl: 'assets/icon/marker-icon-2.png',
                shadowUrl: 'assets/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                tooltipAnchor: [16, -28],
                shadowSize: [41, 41]
            })
        });
        this.isSearchMarkerSet = true;
    };
    MappingService.prototype.getGeoJSON = function (schemaName, layerName) {
        var _this = this;
        var parameter = new http_1.HttpParams().set('cityName', schemaName).set('layerName', layerName);
        return this.http
            .get(this.env.API_URL + 'data/getlayer', {
            headers: {
                Authorization: 'Basic ' + this.authService.token,
                'x-access-token': this.authService.token.data.token
            },
            params: parameter
        })
            .pipe(operators_1.tap(function (data) {
            _this.storage.setItem(layerName, data)["catch"](function (error) {
                console.log('Error storing Item');
            });
            return data;
        }));
    };
    MappingService.prototype.getLayer = function (schemaName, layerName) {
        var _this = this;
        return rxjs_1.from(this.storage.getItem(layerName)).pipe(operators_1.catchError(function (error) { return _this.getGeoJSON(schemaName, layerName); }));
    };
    MappingService.prototype.onEachFeature = function (feature, layer) {
        if (feature.properties) {
            console.log(feature);
            layer.bindPopup(feature.properties);
        }
    };
    MappingService.prototype.downloadLocationsLayers = function (cityID) {
        var _this = this;
        return rxjs_1.from(this.storage.getItem('ciyLtayers-id' + String(cityID))).pipe(operators_1.catchError(function (error) { return _this.loadLocationsLayers(cityID); }));
    };
    MappingService.prototype.loadLocationsLayers = function (cityID) {
        var _this = this;
        var parameter = new http_1.HttpParams().set('cityID', cityID);
        console.log('*******************************  Downloading Layers for city:' + cityID);
        return this.http.get('assets/geojson/' + cityID + '.json').pipe(operators_1.tap(function (data) {
            _this.storage.setItem('ciyLtayers-id' + String(cityID), data)["catch"](function (error) {
                console.log('Error storing Item');
            });
            console.log('*******************************  Downloading Layers for city:' + cityID);
            console.log(data);
            return data;
        }));
    };
    MappingService.prototype.setIcon = function (fileName) {
        return new L.Icon({
            iconRetinaUrl: 'assets/icon/' + fileName,
            iconUrl: 'assets/icon/' + fileName,
            shadowUrl: 'assets/marker-shadow.png',
            iconSize: [12, 13],
            iconAnchor: [12, 13],
            popupAnchor: [1, -34],
            shadowSize: [20, 20]
        });
    };
    MappingService.prototype.getAllMaps = function () {
        var _this = this;
        var level1 = this.setIcon('level-1.png');
        var level2 = this.setIcon('level-2.png');
        var level3 = this.setIcon('level-3.png');
        var level4 = this.setIcon('level-4.png');
        var level5 = this.setIcon('level-5.png');
        var smallIcon = this.setIcon('marker-icon-4.png');
        this.cities.forEach(function (city) {
            _this.downloadLocationsLayers(city.id).subscribe(function (result) {
                result.forEach(function (layer) {
                    var geoJSONVar;
                    geoJSONVar = leaflet_1.geoJSON(layer.geojson, {
                        style: {
                            color: layer.color,
                            fill: false,
                            weight: 0.3,
                            opacity: 1
                        },
                        onEachFeature: function (feature, layer) {
                            var message = '';
                            var value = '';
                            var vals2Omit = ['Espesor', 'Color', 'ColorRelleno', 'Opacidad', 'Segmentada', 'Punteada'];
                            if (feature.properties) {
                                Object.keys(feature.properties).forEach(function (key) {
                                    if (vals2Omit.indexOf(key) == -1) {
                                        value = feature.properties[key] == 'null' ? 'Sin datos' : feature.properties[key];
                                        message += '<b>' + key + ':</b>' + '  ' + value + '<br />';
                                    }
                                });
                                if (message !== '') {
                                    layer.bindPopup(message);
                                }
                                if (feature.properties.Espesor) {
                                    layer.setStyle({ weight: feature.properties.Espesor });
                                }
                                if (feature.properties.Color) {
                                    layer.setStyle({ color: feature.properties.Color });
                                }
                                if (feature.properties.ColorRelleno) {
                                    layer.setStyle({ fillColor: feature.properties.ColorRelleno, fill: true });
                                }
                                if (feature.properties.Opacidad) {
                                    layer.setStyle({ fillOpacity: feature.properties.Opacidad });
                                }
                                if (feature.properties.Punteada) {
                                    // Layer segmentada
                                    layer.setStyle({ fill: true, fillPattern: _this.stripes });
                                    console.log('Entrada a FillPattern');
                                    console.log(layer);
                                }
                                if (feature.properties.Segmentada) {
                                    // Layer punteada
                                    layer.setStyle({ dashArray: '10 5' });
                                }
                            }
                        },
                        pointToLayer: function (feature, latlng) {
                            if (feature.properties.Afectacion === '1') {
                                return L.marker(latlng, {
                                    icon: level1
                                });
                            }
                            else if (feature.properties.Afectacion === '2') {
                                return L.marker(latlng, {
                                    icon: level2
                                });
                            }
                            else if (feature.properties.Afectacion === '3') {
                                return L.marker(latlng, {
                                    icon: level3
                                });
                            }
                            else if (feature.properties.Afectacion === '4') {
                                return L.marker(latlng, {
                                    icon: level4
                                });
                            }
                            else if (feature.properties.Afectacion === '5') {
                                return L.marker(latlng, {
                                    icon: level5
                                });
                            }
                            return L.marker(latlng, {
                                icon: smallIcon
                            });
                        }
                    });
                    var layerThreats = [];
                    if (layer.amenazas) {
                        layer.amenazas.forEach(function (amenaza) {
                            layerThreats.push(amenaza.nombre);
                        });
                    }
                    else {
                        layerThreats.push('Ninguna');
                    }
                    city.layers.push({
                        id: layer.id_capa,
                        layerName: layer.nombre,
                        queryName: layer.nom_tabla,
                        color: layer.color,
                        description: layer.descripcion,
                        gJSON: geoJSONVar,
                        datum: layer.datum,
                        type: layer.rel_asociacion,
                        downloaded: true,
                        threadType: layerThreats,
                        fixed: layer.fijar_capa
                    });
                });
            }, function (error) { }, function () { });
        });
    };
    MappingService.prototype.checkGPSPermission = function () {
        var _this = this;
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(function (result) {
            if (result.hasPermission) {
                _this.askToTurnOnGPS();
            }
            else {
                _this.requestGPSPermission();
            }
        }, function (err) {
            alert(err);
        });
    };
    MappingService.prototype.requestGPSPermission = function () {
        var _this = this;
        this.locationAccuracy.canRequest().then(function (canRequest) {
            if (canRequest) {
                console.log('4');
            }
            else {
                _this.androidPermissions.requestPermission(_this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(function () {
                    _this.askToTurnOnGPS();
                }, function (error) {
                    alert('requestPermission Error requesting location permissions ' + error);
                });
            }
        });
    };
    MappingService.prototype.askToTurnOnGPS = function () {
        var _this = this;
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(function () {
            _this.getGeolocation();
        }, function (error) { return alert('Error requesting location permissions ' + JSON.stringify(error)); });
    };
    MappingService.prototype.getGeolocation = function () {
        var _this = this;
        this.geolocation
            .getCurrentPosition({ maximumAge: 1000, timeout: 5000, enableHighAccuracy: true })
            .then(function (resp) {
            console.log(resp);
            _this.geoLatitude = resp.coords.latitude;
            _this.geoLongitude = resp.coords.longitude;
            _this.geoAccuracy = resp.coords.accuracy;
            _this.gotGeoposition = true;
        }, function (err) {
            // alert("error getting location")
            alert('Can not retrieve Location');
        })["catch"](function (error) {
            alert('Error getting location' + JSON.stringify(error));
        });
    };
    MappingService = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
    ], MappingService);
    return MappingService;
}());
exports.MappingService = MappingService;
