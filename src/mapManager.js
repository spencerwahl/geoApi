'use strict';
const basemap = require('./basemap.js');

/**
  * @ngdoc module
  * @name mapManager
  * @description
  *
  * The `MapManager` module exports an object with the following properties:
  * - `Map` {type} of esri/map
  * - `OverviewMap` {type} of esri/dijit/OverviewMap
  * - `Scalebar` {type} of esri/dijit/Scalebar
  * - `setupMap` {function} interates over config settings and apply logic for any items present.
  */

// mapManager module, provides function to setup a map
module.exports = function (esriBundle) {
    // note: a decision was made to include esri/dijit/Scalebar here because
    // it has minimum interaction after creation, no need for the additional
    // scalebar.js
    const mapManager = {
        Map: esriBundle.Map,
        OverviewMap: esriBundle.OverviewMap,
        Scalebar: esriBundle.Scalebar,
        Extent: esriBundle.Extent,
        setupMap,
        setProxy
    };

    /**
     * @ngdoc method
     * @name setupMap
     * @memberof mapManager
     * @description
     * Setup map features with info provided by configuration
     * <div>
     * -- Demo: The follwoing is from description section of ngDoc --
     *
     * <h4>TODO</h4>
     * <p>Rename BasemapControl and ScalebarControl</p>
     * -- End of description section --
     * </div>
     *
     * @param {esriMap} map ESRI map object
     * @param {Object} settings JSON object of map configurations
     * @return {Object} with following properties:
     * <ul>
     *    <li>BasemapControl - an object with setBasemap function and a BasemapGallery object</li>
     *    <li>OverviewMapControl - a reference to the overviewMap control on the map</li>
     *    <li>ScalebarControl - a reference to the scalebar control on the map</li>
     * </ul>
     */
    function setupMap(map, settings) {

        let basemapCtrl;
        let scalebarCtrl;
        let overviewMapCtrl;

        // check to see if property exists in settings
        if ('basemaps' in settings) {

            // need to pass esriBundle to basemap module in order to use it
            // the alternative is to pass geoApi reference after creation, and then use the geoApi to
            // access the properly initialized modules.
            // or Is there an other way to do it?
            const lbasemap = basemap(esriBundle);

            // basemapCtrl is a basemap gallery object, should store this value for application use
            basemapCtrl = lbasemap.makeBasemaps(settings.basemaps, map);
        } else {
            console.warn('warning: basemaps setting does not exist');
        }

        // TODO: add code to setup scalebar
        if ('scalebar' in settings) {

            scalebarCtrl = new mapManager.Scalebar({
                map: map,
                attachTo: settings.scalebar.attachTo,
                scalebarUnit: settings.scalebar.scalebarUnit
            });

            scalebarCtrl.show();

        } else {
            console.warn('scalebar setting does not exists');
        }

        // TODO: add code to setup north arrow

        // Setup overview map
        // todo: add visible to setting
        if ('overviewMap' in settings && 'visible' in settings.overviewMap &&
            settings.overviewMap.visible === true) {
            overviewMapCtrl = mapManager.OverviewMap({
                map: map,
                visible: settings.overviewMap.visible
            });

            overviewMapCtrl.startup();
        } else {
            console.warn('info: overviewMap setting does not exist, or it\'s visible' +
                ' setting is set to false.');
        }

        // TODO: add code to setup mouse co-ordinates

        // return as object so we can use this in our geo section of fgpv
        return {
            BasemapControl: basemapCtrl,
            OverviewMapControl: overviewMapCtrl,
            ScalebarControl: scalebarCtrl
        };
    }

    /**
     * @ngdoc method
     * @name setProxy
     * @memberof mapManager
     * @description
     * Set proxy service URL to avoid same origin issues
     *
     * @param {string} proxyUrl should point to a proxy with an interface compatible with ESRI's resource proxy
     */
    function setProxy(proxyUrl) {
        esriBundle.esriConfig.defaults.io.proxyUrl = proxyUrl;
    }

    return mapManager;
};
