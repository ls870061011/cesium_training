var GLMapCoordSys = function (GLMap, api) {
  (this._GLMap = GLMap),
    (this.dimensions = ["lng", "lat"]),
    (this._mapOffset = [0, 0]),
    (this._api = api);
};

GLMapCoordSys.prototype.dimensions = ["lng", "lat"];

GLMapCoordSys.prototype.setMapOffset = function (mapOffset) {
  this._mapOffset = mapOffset;
};

GLMapCoordSys.prototype.getBMap = function () {
  return this._GLMap;
};

GLMapCoordSys.prototype.dataToPoint = function (data) {
  var e = [99999, 99999],
    i = Cesium.Cartesian3.fromDegrees(data[0], data[1]);
  if (!i) return e;
  var n = this._GLMap.cartesianToCanvasCoordinates(i);
  if (!n) return e;
  return (
    !(
      Cesium.Cartesian3.angleBetween(this._GLMap.camera.position, i) >
      Cesium.Math.toRadians(75)
    ) && [n.x - this._mapOffset[0], n.y - this._mapOffset[1]]
  );
};

GLMapCoordSys.prototype.pointToData = function (pt) {
  var mapOffset = this._mapOffset;
  pt = this._bmap.project([pt[0] + mapOffset[0], pt[1] + mapOffset[1]]);
  return [pt.lng, pt.lat];
};

GLMapCoordSys.prototype.getViewRect = function () {
  var api = this._api;
  return new echarts.graphic.BoundingRect(
    0,
    0,
    api.getWidth(),
    api.getHeight()
  );
};

GLMapCoordSys.prototype.getRoamTransform = function () {
  return echarts.matrix.create();
};

GLMapCoordSys.dimensions = GLMapCoordSys.prototype.dimensions;

GLMapCoordSys.create = function (ecModel, api) {
  var coordSys;

  ecModel.eachComponent("GLMap", function (GLMapModel) {
    var viewportRoot = api.getZr().painter.getViewportRoot();
    var GLMap = echarts.glMap;
    coordSys = new GLMapCoordSys(GLMap, api);
    coordSys.setMapOffset(GLMapModel.__mapOffset || [0, 0]);
    GLMapModel.coordinateSystem = coordSys;
  });

  ecModel.eachSeries(function (seriesModel) {
    if (seriesModel.get("coordinateSystem") === "GLMap") {
      seriesModel.coordinateSystem = coordSys;
    }
  });
};

var EchartsLayer = function (map, options) {
  this._map = map;
  this._overlay = this._createChartOverlay();
  if (options) {
    this._registerMap();
  }
  this._overlay.setOption(options || {});
};

EchartsLayer.prototype._registerMap = function () {
  if (!this._isRegistered) {
    echarts.registerCoordinateSystem("GLMap", GLMapCoordSys),
      echarts.registerAction(
        {
          type: "GLMapRoam",
          event: "GLMapRoam",
          update: "updateLayout",
        },
        function (t, e) {}
      ),
      echarts.extendComponentModel({
        type: "GLMap",
        getBMap: function () {
          return this.__GLMap;
        },
        defaultOption: { roam: !1 },
      }),
      echarts.extendComponentView({
        type: "GLMap",
        init: function (t, e) {
          (this.api = e),
            echarts.glMap.postRender.addEventListener(this.moveHandler, this);
        },
        moveHandler: function (t, e) {
          this.api.dispatchAction({ type: "GLMapRoam" });
        },
        render: function (t, e, i) {},
        dispose: function (t) {
          echarts.glMap.postRender.removeEventListener(this.moveHandler, this);
        },
      });

    this._isRegistered = true;
  }
};

EchartsLayer.prototype._createChartOverlay = function () {
  var scene = this._map.scene;
  scene.canvas.setAttribute("tabIndex", 0);
  const ele = document.createElement("div");
  return (
    (ele.style.position = "absolute"),
    (ele.style.top = "0px"),
    (ele.style.left = "0px"),
    (ele.style.zIndex = 999),
    (ele.style.width = scene.canvas.parentNode.offsetWidth + "px"),
    (ele.style.height = scene.canvas.parentNode.offsetHeight + "px"),
    (ele.style.pointerEvents = "none"),
    ele.setAttribute("id", "echarts"),
    ele.setAttribute("class", "echartMap"),
    this._map.container.appendChild(ele),
    (this._echartsContainer = ele),
    (echarts.glMap = scene),
    (this._chart = echarts.init(ele))
  );
  this.resize();
};

EchartsLayer.prototype.dispose = function () {
  this._echartsContainer &&
    (this._map.container.removeChild(this._echartsContainer),
    (this._echartsContainer = null)),
    this._overlay && (this._overlay.dispose(), (this._overlay = null));
};
EchartsLayer.prototype.updateOverlay = function (t) {
  this._overlay && this._overlay.setOption(t);
};
EchartsLayer.prototype.getMap = function () {
  return this._map;
};
EchartsLayer.prototype.getOverlay = function () {
  return this._overlay;
};
EchartsLayer.prototype.show = function () {
  this._echartsContainer &&
    (this._echartsContainer.style.visibility = "visible");
};
EchartsLayer.prototype.hide = function () {
  this._echartsContainer &&
    (this._echartsContainer.style.visibility = "hidden");
};

EchartsLayer.prototype.remove = function () {
  this._chart.clear();
  if (this._echartsContainer.parentNode)
    this._echartsContainer.parentNode.removeChild(this._echartsContainer);
  this._map = undefined;
};

EchartsLayer.prototype.resize = function () {
  const me = this;
  window.onresize = function () {
    const scene = me._map.scene;
    me._echartsContainer.style.width = scene.canvas.style.width;
    me._echartsContainer.style.height = scene.canvas.style.height;
    me._chart.resize();
  };
};
