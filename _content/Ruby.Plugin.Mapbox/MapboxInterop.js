function AddStylesheet() {
    var link = document.createElement('link');
    link.rel = "stylesheet";
    link.href = "https://api.mapbox.com/mapbox-gl-js/v2.0.0/mapbox-gl.css";
    document.head.appendChild(link)
}

const instances = {};

var Mapbox = {
    create: function (accessToken, options, dotnetReference) {
        mapboxgl.accessToken = accessToken;

        var map = new mapboxgl.Map(options);
        instances[options.container] = map;

        map.on('load', function () {
            //console.log('on load:');
            dotnetReference.invokeMethodAsync("OnLoadCallback")
        });
        map.on('style.load', function () {
            //console.log('on style load:');
            dotnetReference.invokeMethodAsync("OnStyleLoadCallback")
        });
        map.on('zoom', () => {
            //const currentZoom = map.getZoom();
            //console.log('on zoom: ' + currentZoom);
        });
    },

    addLayer: function (container, layer, beforeId) {
        instances[container].addLayer(layer, beforeId);
        console.log('Layer added:' + JSON.stringify(layer));
    },
    getLayer: function (container, id) {
        return instances[container].getLayer(id);
    },
    removeLayer: function (container, id) {
        instances[container].removeLayer(id);
        console.log('Layer removed id:' + id);
    },

    addSource: function (container, id, source) {
        console.log('addSource id:' + id);
        console.log('addSource source:' + JSON.stringify(source));
        instances[container].addSource(id, source);
    },
    getSource: function (container, id) {
        console.log('getSource id:' + id);
        var source = instances[container].getSource(id);
        console.log('getSource source:' + JSON.stringify(source));
        return source;
        //return mapboxgl.getSource(id);
    },
    removeSource: function (container, id) {
        instances[container].removeSource(id);
        console.log('Source removed id:' + id);
    },
    setSourceData: function (container, sourceId, data) {
        console.log('setSourceData sourceId:' + JSON.stringify(sourceId));
        console.log('setSourceData data:' + JSON.stringify(data));

        //var source = instances[container].getSource(sourceId);
        //console.log('getSource source:' + JSON.stringify(source));
        //source.setData(data);

        instances[container].getSource(sourceId).setData(data);
    },

    fitBounds: function (container, bounds) {
        var llb = new mapboxgl.LngLatBounds(bounds.sw, bounds.ne);
        instances[container].fitBounds(llb);
    },
    getCenter: function (container) {
        return instances[container].getCenter();
    },
    project: function (container, coordinate) {
        return instances[container].project(coordinate);
    },
    resize: function (container) {
        instances[container].resize();
    },
    setFeatureState: function (container, feature, state) {
        instances[container].setFeatureState(feature, state);
    },

    setStyle: function (container, style) {
        console.log('Js setStyle : ' + style);
        instances[container].setStyle(style);
    },

    //on: (container, eventType, dotnetReference, args) => {
    //    if (args === undefined) {
    //        instances[container].on(eventType, function (e) {
    //            e.target = null; // Remove map to prevent circular references.
    //            const result = JSON.stringify(e);
    //            dotnetReference.invokeMethodAsync('Invoke', result)
    //        })
    //    }
    //    else {
    //        instances[container].on(eventType, args, function (e) {
    //            e.target = null; // Remove map to prevent circular references.
    //            const result = JSON.stringify(e);
    //            dotnetReference.invokeMethodAsync('Invoke', result)
    //        })
    //    }
    //},

    flyTo: function (container, options) {
        instances[container].flyTo(options);
    },
    loadImage: function (container, imageUrl) {
        instances[container].loadImage(
            imageUrl,
            (error, image) => {
                if (error) throw error;
                //console.log('loadImage : ' + image);
                return image;
            }
        );
    },
    addImage: function (container, name, image) {
        instances[container].addImage(name, image);
    },
    loadAndAddImage: function (container, name, imageUrl) {
        instances[container].loadImage(
            imageUrl,
            (error, image) => {
                if (error) {
                    console.error('loadAndAddImage ' + name + ' ' + imageUrl)
                    throw error;
                }
                if (!instances[container].hasImage(name)) {
                    instances[container].addImage(name, image);
                    //console.log('image ' + name + ' added.')
                }
                //else
                //    console.log('image ' + name + ' is already added.');
            }
        );
    },

    //**********************
    //****** Custom  *******
    //**********************

    addPoint: function (container, sourceId, title, icon, lat, lng) {
        //Remove source if exists
        if (instances[container].getSource(sourceId)) {
            Mapbox.removePoint(container, sourceId);
        }

        instances[container].addSource(sourceId, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [{
                    "type": "Feature",
                    "properties": { "name": title, "iconTag": icon },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat]
                    }
                }]
            }
        });

        instances[container].addLayer({
            id: sourceId + '-layer',
            source: sourceId,
            type: 'symbol',
            layout: {
                'text-field': ['get', 'name'],
                'icon-image': ['get', 'iconTag'],
                'text-offset': [0, 1.25]
            }
        });
    },
    removePoint: function (container, sourceId) {
        //Remove layer and source if exists
        let layerId = sourceId + '-layer';
        instances[container].removeLayer(layerId);
        instances[container].removeSource(sourceId);
    },
    movePoint: function (container, sourceId, title, icon, lat, lng) {
        //if exists
        if (instances[container].getSource(sourceId)) {
            const geojsonSource = instances[container].getSource(sourceId);
            // Update the data after the GeoJSON source was created
            geojsonSource.setData({
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": { "name": title, "iconTag": icon },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat]
                    }
                }]
            });
        }
        else {
            Mapbox.addPoint(container, sourceId, title, icon, lat, lng);
        }
    },

    removeCircle: function (container, sourceId) {
        //Remove layer and source if exists
        let layerId = sourceId + '-layercircle';
        instances[container].removeLayer(layerId);
        instances[container].removeSource(sourceId);
    },
    addCircle: function (container, sourceId, lat, lng, radius) {
        //Remove source if exists
        if (instances[container].getSource(sourceId)) {
            Mapbox.removeCircle(container, sourceId);
        }

        instances[container].addSource(sourceId, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat]
                    }
                }]
            }
        });

        instances[container].addLayer({
            id: sourceId + '-layercircle',
            source: sourceId,
            type: 'circle',
            paint: {
                //'circle-radius': radius,
                'circle-stroke-width': 0,
                //'circle-color': '#72DE13',
                'circle-stroke-color': '#000000',
                'circle-opacity': 0.5,
                "circle-radius": [
                    "interpolate", ["linear"], ["zoom"],
                    // zoom is 5 (or less) -> circle radius will be 1px
                    5, 10,
                    // zoom is 10 (or greater) -> circle radius will be 5px
                    15, 10,
                    20, 50
                ],
                "circle-color": [
                    "interpolate", ["linear"], ["zoom"],
                    10, '#72DE13',
                    15, '#131CDE',
                    20, '#DE2013'
                ]
            },
            //maxzoom: 12
        });
    },

    removeCirclePolygon: function (container, sourceId) {
        //Remove layer and source if exists
        let labelLayerId = sourceId + '-poi-labels';
        instances[container].removeLayer(labelLayerId);

        let layerId = sourceId + '-polygonlayer';
        instances[container].removeLayer(layerId);
        instances[container].removeSource(sourceId);
    },

    addCirclePolygon: function (container, sourceId, lat, lng, radiusInMeter, points, circleColor, circleOpacity, infoText) {
        //Remove source if exists
        if (instances[container].getSource(sourceId)) {
            Mapbox.removeCirclePolygon(container, sourceId);
        }

        if (!points) points = 64;

        var coords = {
            latitude: lat,
            longitude: lng
        };

        var km = radiusInMeter / 1000;

        //console.log('addCirclePolygon ' + sourceId + '  km:' + km + '  radiusInMeter:' + radiusInMeter);

        var ret = [];
        var distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
        var distanceY = km / 110.574;

        var theta, x, y;
        for (var i = 0; i < points; i++) {
            theta = (i / points) * (2 * Math.PI);
            x = distanceX * Math.cos(theta);
            y = distanceY * Math.sin(theta);

            ret.push([coords.longitude + x, coords.latitude + y]);
        }

        ret.push(ret[0]);

        instances[container].addSource(sourceId, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',

                features: [{
                    "type": "Feature",
                    'properties': {
                        'description': infoText,
                        //'icon': 'bicycle'
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [ret]
                    }
                }]
            }
        });

        //Add circle
        instances[container].addLayer({
            "id": sourceId + "-polygonlayer",
            "type": "fill",
            "source": sourceId,
            "layout": {},
            "paint": {
                "fill-color": circleColor,
                "fill-opacity": circleOpacity
            }
        });

        //Add Text
        instances[container].addLayer({
            'id': sourceId + '-poi-labels',
            'type': 'symbol',
            "source": sourceId,
            'layout': {
                'text-field': ['get', 'description'],
                'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                'text-radial-offset': 0.5,
                'text-justify': 'auto',
                //'icon-image': ['get', 'icon']
            }
        });
    },
}

//https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup

const popups = {};

var MapboxPopup = {
    create: function (popupId, options) {
        var popup = new mapboxgl.Popup(options);
        popups[popupId] = popup;
    },
    addClassName: function (popupId, className) {
        popups[popupId].addClassName(className);
    },
    addTo: function (popupId, mapId) {
        var map = instances[mapId];
        popups[popupId].addTo(map);
    },
    getLngLat: function (popupId) {
        return popups[popupId].getLngLat();
    },
    getMaxWidth: function (popupId) {
        return popups[popupId].getMaxWidth();
    },
    isOpen: function (popupId) {
        return popups[popupId].isOpen();
    },
    remove: function (popupId) {
        popups[popupId].remove();
    },
    removeClassName: function (popupId, className) {
        popups[popupId].removeClassName(className);
    },
    setLngLat: function (popupId, lnglat) {
        popups[popupId].setLngLat(lnglat);
    },
    setText: function (popupId, text) {
        popups[popupId].setText(text);
    },
    setHTML: function (popupId, html) {
        popups[popupId].setHTML(html);
    },
    toggleClassName: function (popupId, className) {
        return popups[popupId].toggleClassName(className);
    },
    on: (popupId, eventType, dotnetReference) => {
        popups[popupId].on(eventType, function () {
            dotnetReference.invokeMethodAsync('InvokeWithoutArgs')
        })
    }
}

//https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker

const markers = {};

var MapboxMarker = {
    create: function (markerId, options) {
        var marker = new mapboxgl.Marker(options);
        markers[markerId] = marker;
    },
    addTo: function (markerId, mapId) {
        var map = instances[mapId];
        markers[markerId].addTo(map);
    },
    remove: function (markerId) {
        markers[markerId].remove();
    },
    getLngLat: function (markerId) {
        return markers[markerId].getLngLat();
    },
    setLngLat: function (markerId, lnglat) {
        markers[markerId].setLngLat(lnglat);
    },
    getElement: function (markerId) {
        return markers[markerId].getElement();
    },
    setPopup: function (markerId, popup) {
        return markers[markerId].setPopup(popup);
    },
    getPopup: function (markerId) {
        return markers[markerId].getPopup();
    },
    togglePopup: function (markerId) {
        return markers[markerId].togglePopup();
    },
    getOffset: function (markerId) {
        return markers[markerId].getOffset();
    },
    setOffset: function (markerId, offset) {
        return markers[markerId].setOffset(offset);
    },
    setDraggable: function (markerId, shouldBeDraggable) {
        return markers[markerId].setDraggable(shouldBeDraggable);
    },
    isDraggable: function (markerId) {
        return markers[markerId].isDraggable();
    },
    setRotation: function (markerId, rotation) {
        return markers[markerId].setRotation(rotation);
    },
    getRotation: function (markerId) {
        return markers[markerId].getRotation();
    },
    setRotationAlignment: function (markerId, alignment) {
        return markers[markerId].setRotationAlignment(alignment);
    },
    getRotationAlignment: function (markerId) {
        return markers[markerId].getRotationAlignment();
    },
    setPitchAlignment: function (markerId, alignment) {
        return markers[markerId].setPitchAlignment(alignment);
    },
    getPitchAlignment: function (markerId) {
        return markers[markerId].getPitchAlignment();
    }
}

export { Mapbox, MapboxPopup, MapboxMarker, AddStylesheet };