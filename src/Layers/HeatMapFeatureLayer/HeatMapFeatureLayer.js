L.esri.HeatMapFeatureLayer = L.esri.FeatureManager.extend({

  /**
   * Constructor
   */

  initialize: function (url, options) {
    L.esri.FeatureManager.prototype.initialize.call(this, url, options);

    this.index = L.esri._rbush();

    options = L.setOptions(this, options);

    this._cache = {};
    this._active = {};

    this._heat = new L.heatLayer([], options);
  },

  /**
   * Layer Interface
   */

  onAdd: function(){
    L.esri.FeatureManager.prototype.onAdd.call(this);
    this._map.addLayer(this._heat);
  },

  onRemove: function(){
    L.esri.FeatureManager.prototype.onRemove.call(this);
    this._map.removeLayer(this._heat);
  },

  /**
   * Feature Managment Methods
   */

  createLayers: function(features){
    var latlngs = [];

    for (var i = features.length - 1; i >= 0; i--) {
      var geojson = features[i];
      var id = geojson.id;
      var latlng = new L.LatLng(geojson.geometry.coordinates[1], geojson.geometry.coordinates[0]);
      this._cache[id] = latlng;

      // add the layer if it is within the time bounds or our layer is not time enabled
      if(!this._active[id] && (!this._timeEnabled || (this._timeEnabled && this._featureWithinTimeRange(geojson)))){
        this._active[id] = latlng;
        this._heat._latlngs.push(latlng);
      }
    }

    this._heat.redraw();
  },

  addLayers: function(ids){
    for (var i = ids.length - 1; i >= 0; i--) {
      var id = ids[i];
      if(!this._active[id]){
        var latlng = this._cache[id];
        this._heat._latlngs.push(latlng);
        this._active[id] = latlng;
      }
    }
    this._heat.redraw();
  },

  removeLayers: function(ids){
    var newLatLngs = [];
    for (var i = ids.length - 1; i >= 0; i--) {
      var id = ids[i];
      if(this._active[id]){
        delete this._active[id];
      }
    }

    for (id in this._active){
      newLatLngs.push(this._active[id]);
    }

    this._heat.setLatLngs(newLatLngs);
  }

});