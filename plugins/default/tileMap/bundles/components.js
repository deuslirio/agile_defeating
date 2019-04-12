(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var TileLayerGeometry = (function (_super) {
    __extends(TileLayerGeometry, _super);
    function TileLayerGeometry(width, height, widthSegments, heightSegments) {
        _super.call(this);
        this.type = "TileLayerGeometry";
        var vertices = new Float32Array(widthSegments * heightSegments * 4 * 3);
        var normals = new Float32Array(widthSegments * heightSegments * 4 * 3);
        var uvs = new Float32Array(widthSegments * heightSegments * 4 * 2);
        uvs.fill(-1);
        var indices;
        if (vertices.length / 3 > 65535)
            indices = new Uint32Array(widthSegments * heightSegments * 6);
        else
            indices = new Uint16Array(widthSegments * heightSegments * 6);
        var verticesOffset = 0;
        var indicesOffset = 0;
        for (var iy = 0; iy < heightSegments; iy++) {
            var y = iy * height / heightSegments;
            for (var ix = 0; ix < widthSegments; ix++) {
                var x = ix * width / widthSegments;
                // Left bottom
                vertices[verticesOffset + 0] = x;
                vertices[verticesOffset + 1] = y;
                normals[verticesOffset + 2] = 1;
                // Right bottom
                vertices[verticesOffset + 3] = x + width / widthSegments;
                vertices[verticesOffset + 4] = y;
                normals[verticesOffset + 5] = 1;
                // Right top
                vertices[verticesOffset + 6] = x + width / widthSegments;
                vertices[verticesOffset + 7] = y + height / heightSegments;
                normals[verticesOffset + 8] = 1;
                // Left Top
                vertices[verticesOffset + 9] = x;
                vertices[verticesOffset + 10] = y + height / heightSegments;
                normals[verticesOffset + 11] = 1;
                var ref = (ix + iy * widthSegments) * 4;
                // Bottom right corner
                indices[indicesOffset + 0] = ref + 0;
                indices[indicesOffset + 1] = ref + 1;
                indices[indicesOffset + 2] = ref + 2;
                // Top left corner
                indices[indicesOffset + 3] = ref + 0;
                indices[indicesOffset + 4] = ref + 2;
                indices[indicesOffset + 5] = ref + 3;
                verticesOffset += 4 * 3;
                indicesOffset += 6;
            }
        }
        this.setIndex(new THREE.BufferAttribute(indices, 1));
        this.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
        this.addAttribute("normal", new THREE.BufferAttribute(normals, 3));
        this.addAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    }
    return TileLayerGeometry;
}(THREE.BufferGeometry));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileLayerGeometry;

},{}],3:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require("events");
var TileMap = (function (_super) {
    __extends(TileMap, _super);
    function TileMap(data) {
        _super.call(this);
        this.data = data;
    }
    TileMap.prototype.getWidth = function () { return this.data.width; };
    TileMap.prototype.getHeight = function () { return this.data.height; };
    TileMap.prototype.getPixelsPerUnit = function () { return this.data.pixelsPerUnit; };
    TileMap.prototype.getLayersDepthOffset = function () { return this.data.layerDepthOffset; };
    TileMap.prototype.getLayersCount = function () { return this.data.layers.length; };
    TileMap.prototype.getLayerId = function (index) { return this.data.layers[index].id; };
    TileMap.prototype.setTileAt = function (layer, x, y, value) {
        if (x < 0 || y < 0 || x >= this.data.width || y >= this.data.height)
            return;
        var index = y * this.data.width + x;
        this.data.layers[layer].data[index] = (value != null) ? value : 0;
        this.emit("setTileAt", layer, x, y);
    };
    TileMap.prototype.getTileAt = function (layer, x, y) {
        if (x < 0 || y < 0 || x >= this.data.width || y >= this.data.height)
            return 0;
        var index = y * this.data.width + x;
        return this.data.layers[layer].data[index];
    };
    return TileMap;
}(events_1.EventEmitter));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileMap;

},{"events":1}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;

var TileLayerGeometry_1 = require("./TileLayerGeometry");
var TileMapRendererUpdater_1 = require("./TileMapRendererUpdater");
var TileMapRenderer = (function (_super) {
    __extends(TileMapRenderer, _super);
    function TileMapRenderer(actor) {
        var _this = this;
        _super.call(this, actor, "TileMapRenderer");
        this.castShadow = false;
        this.receiveShadow = false;
        this.materialType = "basic";
        this.onSetTileAt = function (layerIndex, x, y) { _this.refreshTileAt(layerIndex, x, y); };
    }
    TileMapRenderer.prototype.setTileMap = function (asset, materialType, customShader) {
        if (this.layerMeshes != null)
            this._clearLayerMeshes();
        this.tileMap = asset;
        if (materialType != null)
            this.materialType = materialType;
        this.customShader = customShader;
        if (this.tileSet == null || this.tileSet.data.texture == null || this.tileMap == null)
            return;
        this._createLayerMeshes();
    };
    TileMapRenderer.prototype.setTileSet = function (asset) {
        if (this.layerMeshes != null)
            this._clearLayerMeshes();
        this.tileSet = asset;
        if (this.tileSet == null || this.tileSet.data.texture == null)
            return;
        this.tilesPerRow = this.tileSet.data.texture.image.width / this.tileSet.data.grid.width;
        this.tilesPerColumn = this.tileSet.data.texture.image.height / this.tileSet.data.grid.height;
        if (this.tileMap != null)
            this._createLayerMeshes();
    };
    TileMapRenderer.prototype._createLayerMeshes = function () {
        this.layerMeshes = [];
        this.layerMeshesById = {};
        this.layerVisibleById = {};
        for (var layerIndex = 0; layerIndex < this.tileMap.getLayersCount(); layerIndex++) {
            var layerId = this.tileMap.getLayerId(layerIndex);
            this.addLayer(layerId, layerIndex);
        }
        this.setCastShadow(this.castShadow);
        this.tileMap.on("setTileAt", this.onSetTileAt);
    };
    TileMapRenderer.prototype._clearLayerMeshes = function () {
        for (var _i = 0, _a = this.layerMeshes; _i < _a.length; _i++) {
            var layerMesh = _a[_i];
            layerMesh.geometry.dispose();
            layerMesh.material.dispose();
            this.actor.threeObject.remove(layerMesh);
        }
        this.layerMeshes = null;
        this.layerMeshesById = null;
        this.layerVisibleById = null;
        this.tileMap.removeListener("setTileAt", this.onSetTileAt);
    };
    TileMapRenderer.prototype._destroy = function () {
        if (this.layerMeshes != null)
            this._clearLayerMeshes();
        this.tileMap = null;
        this.tileSet = null;
        _super.prototype._destroy.call(this);
    };
    TileMapRenderer.prototype.addLayer = function (layerId, layerIndex) {
        var width = this.tileMap.getWidth() * this.tileSet.data.grid.width;
        var height = this.tileMap.getHeight() * this.tileSet.data.grid.height;
        var geometry = new TileLayerGeometry_1.default(width, height, this.tileMap.getWidth(), this.tileMap.getHeight());
        var shaderData;
        var defaultUniforms;
        switch (this.materialType) {
            case "basic":
                shaderData = {
                    formatVersion: null,
                    vertexShader: { text: THREE.ShaderLib.basic.vertexShader, draft: null, revisionId: null },
                    fragmentShader: { text: "// Copied (and slightly adapted for Superpowers) from https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshbasic_frag.glsl\n\nuniform vec3 diffuse;\nuniform float opacity;\n\n#ifndef FLAT_SHADED\n\n\tvarying vec3 vNormal;\n\n#endif\n\n#include <common>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\n\nvoid main() {\n\t// Superpowers modification to discard empty tiles\n\tif (vUv.x < 0.0 && vUv.y < 0.0) discard;\n\n\t#include <clipping_planes_fragment>\n\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\n\tReflectedLight reflectedLight;\n\treflectedLight.directDiffuse = vec3( 0.0 );\n\treflectedLight.directSpecular = vec3( 0.0 );\n\treflectedLight.indirectDiffuse = diffuseColor.rgb;\n\treflectedLight.indirectSpecular = vec3( 0.0 );\n\n\t#include <aomap_fragment>\n\n\tvec3 outgoingLight = reflectedLight.indirectDiffuse;\n\n\t#include <normal_flip>\n\t#include <envmap_fragment>\n\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\n\t#include <premultiplied_alpha_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\n}", draft: null, revisionId: null },
                    uniforms: [{ id: null, name: "map", type: "t", value: "map" }],
                    attributes: [],
                    useLightUniforms: false
                };
                defaultUniforms = THREE.ShaderLib.basic.uniforms;
                break;
            case "phong":
                shaderData = {
                    formatVersion: null,
                    vertexShader: { text: THREE.ShaderLib.phong.vertexShader, draft: null, revisionId: null },
                    fragmentShader: { text: "// Copied (and slightly adapted for Superpowers) from https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshphong_frag.glsl\n\n#define PHONG\n\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform vec3 specular;\nuniform float shininess;\nuniform float opacity;\n\n#include <common>\n#include <packing>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars>\n#include <lights_phong_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\n\nvoid main() {\n\t// Superpowers modification to discard empty tiles\n\tif (vUv.x < 0.0 && vUv.y < 0.0) discard;\n\n\t#include <clipping_planes_fragment>\n\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\t#include <normal_flip>\n\t#include <normal_fragment>\n\t#include <emissivemap_fragment>\n\n\t// accumulation\n\t#include <lights_phong_fragment>\n\t#include <lights_template>\n\n\t// modulation\n\t#include <aomap_fragment>\n\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n\n\t#include <envmap_fragment>\n\n\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\n\n\t#include <premultiplied_alpha_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\n}", draft: null, revisionId: null },
                    uniforms: [{ id: null, name: "map", type: "t", value: "map" }],
                    attributes: [],
                    useLightUniforms: true
                };
                defaultUniforms = THREE.ShaderLib.phong.uniforms;
                break;
            case "shader":
                shaderData = this.customShader;
                break;
        }
        var material = SupEngine.componentClasses["Shader"].createShaderMaterial(shaderData, { map: this.tileSet.data.texture }, geometry, { defaultUniforms: defaultUniforms });
        material.map = this.tileSet.data.texture;
        material.alphaTest = 0.1;
        material.side = THREE.DoubleSide;
        material.transparent = true;
        var layerMesh = new THREE.Mesh(geometry, material);
        layerMesh.receiveShadow = this.receiveShadow;
        var scaleRatio = 1 / this.tileMap.getPixelsPerUnit();
        layerMesh.scale.set(scaleRatio, scaleRatio, 1);
        layerMesh.updateMatrixWorld(false);
        this.layerMeshes.splice(layerIndex, 0, layerMesh);
        this.layerMeshesById[layerId] = layerMesh;
        this.layerVisibleById[layerId] = true;
        this.actor.threeObject.add(layerMesh);
        for (var y = 0; y < this.tileMap.getHeight(); y++) {
            for (var x = 0; x < this.tileMap.getWidth(); x++) {
                this.refreshTileAt(layerIndex, x, y);
            }
        }
        this.refreshLayersDepth();
    };
    TileMapRenderer.prototype.deleteLayer = function (layerIndex) {
        this.actor.threeObject.remove(this.layerMeshes[layerIndex]);
        this.layerMeshes.splice(layerIndex, 1);
        this.refreshLayersDepth();
    };
    TileMapRenderer.prototype.moveLayer = function (layerId, newIndex) {
        var layer = this.layerMeshesById[layerId];
        var oldIndex = this.layerMeshes.indexOf(layer);
        this.layerMeshes.splice(oldIndex, 1);
        if (oldIndex < newIndex)
            newIndex--;
        this.layerMeshes.splice(newIndex, 0, layer);
        this.refreshLayersDepth();
    };
    TileMapRenderer.prototype.setCastShadow = function (castShadow) {
        this.castShadow = castShadow;
        for (var _i = 0, _a = this.layerMeshes; _i < _a.length; _i++) {
            var layerMesh = _a[_i];
            layerMesh.castShadow = castShadow;
        }
        if (!castShadow)
            return;
        this.actor.gameInstance.threeScene.traverse(function (object) {
            var material = object.material;
            if (material != null)
                material.needsUpdate = true;
        });
    };
    TileMapRenderer.prototype.setReceiveShadow = function (receiveShadow) {
        this.receiveShadow = receiveShadow;
        for (var _i = 0, _a = this.layerMeshes; _i < _a.length; _i++) {
            var layerMesh = _a[_i];
            layerMesh.receiveShadow = receiveShadow;
            layerMesh.material.needsUpdate = true;
        }
    };
    TileMapRenderer.prototype.refreshPixelsPerUnit = function (pixelsPerUnit) {
        var scaleRatio = 1 / this.tileMap.getPixelsPerUnit();
        for (var _i = 0, _a = this.layerMeshes; _i < _a.length; _i++) {
            var layerMesh = _a[_i];
            layerMesh.scale.set(scaleRatio, scaleRatio, 1);
            layerMesh.updateMatrixWorld(false);
        }
    };
    TileMapRenderer.prototype.refreshLayersDepth = function () {
        for (var layerMeshIndex = 0; layerMeshIndex < this.layerMeshes.length; layerMeshIndex++) {
            var layerMesh = this.layerMeshes[layerMeshIndex];
            layerMesh.position.setZ(layerMeshIndex * this.tileMap.getLayersDepthOffset());
            layerMesh.updateMatrixWorld(false);
        }
    };
    TileMapRenderer.prototype.refreshEntireMap = function () {
        for (var layerIndex = 0; layerIndex < this.tileMap.getLayersCount(); layerIndex++) {
            for (var y = 0; y < this.tileMap.getWidth(); y++) {
                for (var x = 0; x < this.tileMap.getHeight(); x++) {
                    this.refreshTileAt(layerIndex, x, y);
                }
            }
        }
        this.refreshLayersDepth();
    };
    TileMapRenderer.prototype.refreshTileAt = function (layerIndex, x, y) {
        var tileX = -1;
        var tileY = -1;
        var flipX = false;
        var flipY = false;
        var angle = 0;
        var tileInfo = this.tileMap.getTileAt(layerIndex, x, y);
        if (tileInfo !== 0) {
            tileX = tileInfo[0];
            tileY = tileInfo[1];
            flipX = tileInfo[2];
            flipY = tileInfo[3];
            angle = tileInfo[4];
        }
        var quadIndex = (x + y * this.tileMap.getWidth());
        var layerMesh = this.layerMeshes[layerIndex];
        var uvs = layerMesh.geometry.getAttribute("uv");
        uvs.needsUpdate = true;
        var uvsArray = uvs.array;
        if (tileX === -1 || tileY === -1 || tileX >= this.tilesPerRow || tileY >= this.tilesPerColumn) {
            for (var i = 0; i < 8; i++)
                uvsArray[quadIndex * 8 + i] = -1;
            return;
        }
        var image = this.tileSet.data.texture.image;
        var left = (tileX * this.tileSet.data.grid.width + 0.2) / image.width;
        var right = ((tileX + 1) * this.tileSet.data.grid.width - 0.2) / image.width;
        var bottom = 1 - ((tileY + 1) * this.tileSet.data.grid.height - 0.2) / image.height;
        var top = 1 - (tileY * this.tileSet.data.grid.height + 0.2) / image.height;
        if (flipX)
            _a = [left, right], right = _a[0], left = _a[1];
        if (flipY)
            _b = [bottom, top], top = _b[0], bottom = _b[1];
        switch (angle) {
            case 0:
                uvsArray[quadIndex * 8 + 0] = left;
                uvsArray[quadIndex * 8 + 1] = bottom;
                uvsArray[quadIndex * 8 + 2] = right;
                uvsArray[quadIndex * 8 + 3] = bottom;
                uvsArray[quadIndex * 8 + 4] = right;
                uvsArray[quadIndex * 8 + 5] = top;
                uvsArray[quadIndex * 8 + 6] = left;
                uvsArray[quadIndex * 8 + 7] = top;
                break;
            case 90:
                uvsArray[quadIndex * 8 + 0] = left;
                uvsArray[quadIndex * 8 + 1] = top;
                uvsArray[quadIndex * 8 + 2] = left;
                uvsArray[quadIndex * 8 + 3] = bottom;
                uvsArray[quadIndex * 8 + 4] = right;
                uvsArray[quadIndex * 8 + 5] = bottom;
                uvsArray[quadIndex * 8 + 6] = right;
                uvsArray[quadIndex * 8 + 7] = top;
                break;
            case 180:
                uvsArray[quadIndex * 8 + 0] = right;
                uvsArray[quadIndex * 8 + 1] = top;
                uvsArray[quadIndex * 8 + 2] = left;
                uvsArray[quadIndex * 8 + 3] = top;
                uvsArray[quadIndex * 8 + 4] = left;
                uvsArray[quadIndex * 8 + 5] = bottom;
                uvsArray[quadIndex * 8 + 6] = right;
                uvsArray[quadIndex * 8 + 7] = bottom;
                break;
            case 270:
                uvsArray[quadIndex * 8 + 0] = right;
                uvsArray[quadIndex * 8 + 1] = bottom;
                uvsArray[quadIndex * 8 + 2] = right;
                uvsArray[quadIndex * 8 + 3] = top;
                uvsArray[quadIndex * 8 + 4] = left;
                uvsArray[quadIndex * 8 + 5] = top;
                uvsArray[quadIndex * 8 + 6] = left;
                uvsArray[quadIndex * 8 + 7] = bottom;
                break;
        }
        var _a, _b;
    };
    TileMapRenderer.prototype.setIsLayerActive = function (active) {
        if (this.layerMeshes == null)
            return;
        for (var layerId in this.layerMeshesById)
            this.layerMeshesById[layerId].visible = active && this.layerVisibleById[layerId];
    };
    /* tslint:disable:variable-name */
    TileMapRenderer.Updater = TileMapRendererUpdater_1.default;
    return TileMapRenderer;
}(SupEngine.ActorComponent));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileMapRenderer;

},{"./TileLayerGeometry":2,"./TileMapRendererUpdater":5}],5:[function(require,module,exports){
"use strict";
var TileMap_1 = require("./TileMap");
var TileSet_1 = require("./TileSet");
var TileMapRendererUpdater = (function () {
    function TileMapRendererUpdater(client, tileMapRenderer, config, externalSubscribers) {
        var _this = this;
        this.client = client;
        this.tileMapRenderer = tileMapRenderer;
        this.externalSubscribers = externalSubscribers;
        this.onTileMapAssetReceived = function (assetId, asset) {
            _this.tileMapAsset = asset;
            _this.setTileMap();
            if (_this.tileMapAsset.pub.tileSetId != null)
                _this.client.subAsset(_this.tileMapAsset.pub.tileSetId, "tileSet", _this.tileSetSubscriber);
            var subscriber = _this.externalSubscribers.tileMap;
            if (subscriber.onAssetReceived != null)
                subscriber.onAssetReceived(assetId, asset);
        };
        this.onTileMapAssetEdited = function (assetId, command) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            if (_this.tileSetAsset != null || command === "changeTileSet") {
                var commandFunction = _this.onEditCommands[command];
                if (commandFunction != null)
                    commandFunction.apply(_this, args);
            }
            var subscriber = _this.externalSubscribers.tileMap;
            if (subscriber.onAssetEdited)
                subscriber.onAssetEdited.apply(subscriber, [assetId, command].concat(args));
        };
        this.onEditCommands = {
            changeTileSet: function () {
                if (_this.tileSetAssetId != null)
                    _this.client.unsubAsset(_this.tileSetAssetId, _this.tileSetSubscriber);
                _this.tileSetAsset = null;
                _this.tileMapRenderer.setTileSet(null);
                _this.tileSetAssetId = _this.tileMapAsset.pub.tileSetId;
                if (_this.tileSetAssetId != null)
                    _this.client.subAsset(_this.tileSetAssetId, "tileSet", _this.tileSetSubscriber);
            },
            resizeMap: function () { _this.setTileMap(); },
            moveMap: function () { _this.tileMapRenderer.refreshEntireMap(); },
            setProperty: function (path, value) {
                switch (path) {
                    case "pixelsPerUnit":
                        _this.tileMapRenderer.refreshPixelsPerUnit(value);
                        break;
                    case "layerDepthOffset":
                        _this.tileMapRenderer.refreshLayersDepth();
                        break;
                }
            },
            editMap: function (layerId, edits) {
                var index = _this.tileMapAsset.pub.layers.indexOf(_this.tileMapAsset.layers.byId[layerId]);
                for (var _i = 0, edits_1 = edits; _i < edits_1.length; _i++) {
                    var edit = edits_1[_i];
                    _this.tileMapRenderer.refreshTileAt(index, edit.x, edit.y);
                }
            },
            newLayer: function (layer, index) { _this.tileMapRenderer.addLayer(layer.id, index); },
            deleteLayer: function (id, index) { _this.tileMapRenderer.deleteLayer(index); },
            moveLayer: function (id, newIndex) { _this.tileMapRenderer.moveLayer(id, newIndex); }
        };
        this.onTileMapAssetTrashed = function (assetId) {
            _this.tileMapRenderer.setTileMap(null);
            var subscriber = _this.externalSubscribers.tileMap;
            if (subscriber.onAssetTrashed != null)
                subscriber.onAssetTrashed(assetId);
        };
        this.onTileSetAssetReceived = function (assetId, asset) {
            _this.prepareTexture(asset.pub.texture, function () {
                _this.tileSetAsset = asset;
                _this.tileMapRenderer.setTileSet(new TileSet_1.default(asset.pub));
                var subscriber = _this.externalSubscribers.tileSet;
                if (subscriber.onAssetReceived != null)
                    subscriber.onAssetReceived(assetId, asset);
            });
        };
        this.onTileSetAssetEdited = function (assetId, command) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var commandFunction = _this.onTileSetEditCommands[command];
            if (commandFunction != null)
                commandFunction.apply(_this, args);
            var subscriber = _this.externalSubscribers.tileSet;
            if (subscriber.onAssetEdited)
                subscriber.onAssetEdited.apply(subscriber, [assetId, command].concat(args));
        };
        this.onTileSetEditCommands = {
            upload: function () {
                var _this = this;
                this.prepareTexture(this.tileSetAsset.pub.texture, function () {
                    _this.tileMapRenderer.setTileSet(new TileSet_1.default(_this.tileSetAsset.pub));
                });
            },
            setProperty: function () {
                this.tileMapRenderer.setTileSet(new TileSet_1.default(this.tileSetAsset.pub));
            }
        };
        this.onTileSetAssetTrashed = function (assetId) {
            _this.tileMapRenderer.setTileSet(null);
            var subscriber = _this.externalSubscribers.tileSet;
            if (subscriber.onAssetTrashed)
                subscriber.onAssetTrashed(assetId);
        };
        this.onShaderAssetReceived = function (assetId, asset) {
            _this.shaderPub = asset.pub;
            _this.setTileMap();
        };
        this.onShaderAssetEdited = function (id, command) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            if (command !== "editVertexShader" && command !== "editFragmentShader")
                _this.setTileMap();
        };
        this.onShaderAssetTrashed = function () {
            _this.shaderPub = null;
            _this.setTileMap();
        };
        this.tileMapAssetId = config.tileMapAssetId;
        this.tileSetAssetId = config.tileSetAssetId;
        this.materialType = config.materialType;
        this.shaderAssetId = config.shaderAssetId;
        this.tileMapRenderer.receiveShadow = config.receiveShadow;
        if (this.externalSubscribers == null)
            this.externalSubscribers = {};
        if (this.externalSubscribers.tileMap == null)
            this.externalSubscribers.tileMap = {};
        if (this.externalSubscribers.tileSet == null)
            this.externalSubscribers.tileSet = {};
        this.tileMapSubscriber = {
            onAssetReceived: this.onTileMapAssetReceived,
            onAssetEdited: this.onTileMapAssetEdited,
            onAssetTrashed: this.onTileMapAssetTrashed
        };
        this.tileSetSubscriber = {
            onAssetReceived: this.onTileSetAssetReceived,
            onAssetEdited: this.onTileSetAssetEdited,
            onAssetTrashed: this.onTileSetAssetTrashed
        };
        this.shaderSubscriber = {
            onAssetReceived: this.onShaderAssetReceived,
            onAssetEdited: this.onShaderAssetEdited,
            onAssetTrashed: this.onShaderAssetTrashed
        };
        if (this.tileMapAssetId != null)
            this.client.subAsset(this.tileMapAssetId, "tileMap", this.tileMapSubscriber);
        if (this.shaderAssetId != null)
            this.client.subAsset(this.shaderAssetId, "shader", this.shaderSubscriber);
    }
    TileMapRendererUpdater.prototype.destroy = function () {
        if (this.tileMapAssetId != null)
            this.client.unsubAsset(this.tileMapAssetId, this.tileMapSubscriber);
        if (this.tileSetAssetId != null)
            this.client.unsubAsset(this.tileSetAssetId, this.tileSetSubscriber);
        if (this.shaderAssetId != null)
            this.client.unsubAsset(this.shaderAssetId, this.shaderSubscriber);
    };
    TileMapRendererUpdater.prototype.setTileMap = function () {
        if (this.tileMapAsset == null || (this.materialType === "shader" && this.shaderPub == null)) {
            this.tileMapRenderer.setTileMap(null);
            return;
        }
        this.tileMapRenderer.setTileMap(new TileMap_1.default(this.tileMapAsset.pub), this.materialType, this.shaderPub);
    };
    TileMapRendererUpdater.prototype.prepareTexture = function (texture, callback) {
        if (texture == null) {
            callback();
            return;
        }
        if (texture.image.complete)
            callback();
        else
            texture.image.addEventListener("load", callback);
    };
    TileMapRendererUpdater.prototype.config_setProperty = function (path, value) {
        switch (path) {
            case "tileMapAssetId":
                if (this.tileMapAssetId != null)
                    this.client.unsubAsset(this.tileMapAssetId, this.tileMapSubscriber);
                this.tileMapAssetId = value;
                this.tileMapAsset = null;
                this.tileMapRenderer.setTileMap(null);
                if (this.tileSetAssetId != null)
                    this.client.unsubAsset(this.tileSetAssetId, this.tileSetSubscriber);
                this.tileSetAsset = null;
                this.tileMapRenderer.setTileSet(null);
                if (this.tileMapAssetId != null)
                    this.client.subAsset(this.tileMapAssetId, "tileMap", this.tileMapSubscriber);
                break;
            // case "tileSetAssetId":
            case "castShadow":
                this.tileMapRenderer.setCastShadow(value);
                break;
            case "receiveShadow":
                this.tileMapRenderer.setReceiveShadow(value);
                break;
            case "materialType":
                this.materialType = value;
                this.setTileMap();
                break;
            case "shaderAssetId":
                if (this.shaderAssetId != null)
                    this.client.unsubAsset(this.shaderAssetId, this.shaderSubscriber);
                this.shaderAssetId = value;
                this.shaderPub = null;
                this.tileMapRenderer.setTileMap(null);
                if (this.shaderAssetId != null)
                    this.client.subAsset(this.shaderAssetId, "shader", this.shaderSubscriber);
                break;
        }
    };
    return TileMapRendererUpdater;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileMapRendererUpdater;

},{"./TileMap":3,"./TileSet":6}],6:[function(require,module,exports){
"use strict";
var TileSet = (function () {
    function TileSet(data) {
        this.data = data;
    }
    return TileSet;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileSet;

},{}],7:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var TileSetRendererUpdater_1 = require("./TileSetRendererUpdater");
var TileSetRenderer = (function (_super) {
    __extends(TileSetRenderer, _super);
    function TileSetRenderer(actor, asset) {
        _super.call(this, actor, "TileSetRenderer");
        this.material = new THREE.MeshBasicMaterial({ alphaTest: 0.1, side: THREE.DoubleSide, transparent: true });
        var gridActor = new SupEngine.Actor(this.actor.gameInstance, "Grid");
        gridActor.setLocalPosition(new THREE.Vector3(0, 0, 1));
        this.gridRenderer = new SupEngine.editorComponentClasses["GridRenderer"](gridActor, {
            width: 1, height: 1,
            direction: -1, orthographicScale: 10,
            ratio: { x: 1, y: 1 }
        });
        this.selectedTileActor = new SupEngine.Actor(this.actor.gameInstance, "Selection", null, { visible: false });
        new SupEngine.editorComponentClasses["FlatColorRenderer"](this.selectedTileActor, 0x900090, 1, 1);
        this.setTileSet(asset);
    }
    TileSetRenderer.prototype.setTileSet = function (asset) {
        this._clearMesh();
        this.asset = asset;
        if (this.asset == null)
            return;
        var geometry = new THREE.PlaneBufferGeometry(asset.data.texture.image.width, asset.data.texture.image.height);
        this.material.map = asset.data.texture;
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.actor.threeObject.add(this.mesh);
        this.refreshScaleRatio();
        this.selectedTileActor.threeObject.visible = true;
    };
    TileSetRenderer.prototype.select = function (x, y, width, height) {
        if (width === void 0) { width = 1; }
        if (height === void 0) { height = 1; }
        var ratio = this.asset.data.grid.width / this.asset.data.grid.height;
        this.selectedTileActor.setLocalPosition(new THREE.Vector3(x, -y / ratio, 2));
        this.selectedTileActor.setLocalScale(new THREE.Vector3(width, -height / ratio, 1));
    };
    TileSetRenderer.prototype.refreshScaleRatio = function () {
        var scaleX = 1 / this.asset.data.grid.width;
        var scaleY = 1 / this.asset.data.grid.height;
        this.mesh.scale.set(scaleX, scaleY, 1);
        var material = this.mesh.material;
        this.mesh.position.setX(material.map.image.width / 2 * scaleX);
        this.mesh.position.setY(-material.map.image.height / 2 * scaleY);
        this.mesh.updateMatrixWorld(false);
        this.select(0, 0);
    };
    TileSetRenderer.prototype._clearMesh = function () {
        if (this.mesh == null)
            return;
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.actor.threeObject.remove(this.mesh);
        this.mesh = null;
        this.selectedTileActor.threeObject.visible = false;
    };
    TileSetRenderer.prototype._destroy = function () {
        this._clearMesh();
        this.actor.gameInstance.destroyActor(this.gridRenderer.actor);
        this.actor.gameInstance.destroyActor(this.selectedTileActor);
        this.asset = null;
        _super.prototype._destroy.call(this);
    };
    TileSetRenderer.prototype.setIsLayerActive = function (active) { if (this.mesh != null)
        this.mesh.visible = active; };
    /* tslint:disable:variable-name */
    TileSetRenderer.Updater = TileSetRendererUpdater_1.default;
    return TileSetRenderer;
}(SupEngine.ActorComponent));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileSetRenderer;

},{"./TileSetRendererUpdater":8}],8:[function(require,module,exports){
"use strict";
var TileSet_1 = require("./TileSet");
var TileSetRendererUpdater = (function () {
    function TileSetRendererUpdater(client, tileSetRenderer, config, externalSubscriber) {
        var _this = this;
        this.client = client;
        this.tileSetRenderer = tileSetRenderer;
        this.externalSubscriber = externalSubscriber;
        this.onTileSetAssetReceived = function (assetId, asset) {
            _this.prepareTexture(asset.pub.texture, function () {
                _this.tileSetAsset = asset;
                if (asset.pub.texture != null) {
                    _this.tileSetRenderer.setTileSet(new TileSet_1.default(asset.pub));
                    _this.tileSetRenderer.gridRenderer.setGrid({
                        width: asset.pub.texture.image.width / asset.pub.grid.width,
                        height: asset.pub.texture.image.height / asset.pub.grid.height,
                        direction: -1,
                        orthographicScale: 10,
                        ratio: { x: 1, y: asset.pub.grid.width / asset.pub.grid.height }
                    });
                }
                if (_this.externalSubscriber.onAssetReceived != null)
                    _this.externalSubscriber.onAssetReceived(assetId, asset);
            });
        };
        this.onTileSetAssetEdited = function (assetId, command) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var callEditCallback = true;
            var commandFunction = _this.onEditCommands[command];
            if (commandFunction != null && commandFunction.apply(void 0, args) === false)
                callEditCallback = false;
            if (callEditCallback && _this.externalSubscriber.onAssetEdited != null) {
                (_a = _this.externalSubscriber).onAssetEdited.apply(_a, [assetId, command].concat(args));
            }
            var _a;
        };
        this.onEditCommands = {
            upload: function () {
                var texture = _this.tileSetAsset.pub.texture;
                _this.prepareTexture(texture, function () {
                    _this.tileSetRenderer.setTileSet(new TileSet_1.default(_this.tileSetAsset.pub));
                    var width = texture.image.width / _this.tileSetAsset.pub.grid.width;
                    var height = texture.image.height / _this.tileSetAsset.pub.grid.height;
                    _this.tileSetRenderer.gridRenderer.resize(width, height);
                    _this.tileSetRenderer.gridRenderer.setRatio({ x: 1, y: _this.tileSetAsset.pub.grid.width / _this.tileSetAsset.pub.grid.height });
                    if (_this.externalSubscriber.onAssetEdited != null) {
                        _this.externalSubscriber.onAssetEdited(_this.tileSetAsset.id, "upload");
                    }
                });
                return false;
            },
            setProperty: function (key, value) {
                switch (key) {
                    case "grid.width":
                    case "grid.height":
                        _this.tileSetRenderer.refreshScaleRatio();
                        var width = _this.tileSetAsset.pub.texture.image.width / _this.tileSetAsset.pub.grid.width;
                        var height = _this.tileSetAsset.pub.texture.image.height / _this.tileSetAsset.pub.grid.height;
                        _this.tileSetRenderer.gridRenderer.resize(width, height);
                        _this.tileSetRenderer.gridRenderer.setRatio({ x: 1, y: _this.tileSetAsset.pub.grid.width / _this.tileSetAsset.pub.grid.height });
                        break;
                }
            }
        };
        this.onTileSetAssetTrashed = function (assetId) {
            _this.tileSetRenderer.setTileSet(null);
            if (_this.externalSubscriber.onAssetTrashed != null)
                _this.externalSubscriber.onAssetTrashed(assetId);
        };
        this.client = client;
        this.tileSetRenderer = tileSetRenderer;
        this.tileSetAssetId = config.tileSetAssetId;
        if (this.externalSubscriber == null)
            this.externalSubscriber = {};
        this.tileSetSubscriber = {
            onAssetReceived: this.onTileSetAssetReceived,
            onAssetEdited: this.onTileSetAssetEdited,
            onAssetTrashed: this.onTileSetAssetTrashed
        };
        if (this.tileSetAssetId != null)
            this.client.subAsset(this.tileSetAssetId, "tileSet", this.tileSetSubscriber);
    }
    TileSetRendererUpdater.prototype.destroy = function () {
        if (this.tileSetAssetId != null) {
            this.client.unsubAsset(this.tileSetAssetId, this.tileSetSubscriber);
        }
    };
    TileSetRendererUpdater.prototype.changeTileSetId = function (tileSetId) {
        if (this.tileSetAssetId != null)
            this.client.unsubAsset(this.tileSetAssetId, this.tileSetSubscriber);
        this.tileSetAssetId = tileSetId;
        this.tileSetAsset = null;
        this.tileSetRenderer.setTileSet(null);
        this.tileSetRenderer.gridRenderer.resize(1, 1);
        if (this.tileSetAssetId != null)
            this.client.subAsset(this.tileSetAssetId, "tileSet", this.tileSetSubscriber);
    };
    TileSetRendererUpdater.prototype.prepareTexture = function (texture, callback) {
        if (texture == null) {
            callback();
            return;
        }
        if (texture.image.complete)
            callback();
        else
            texture.image.addEventListener("load", callback);
    };
    return TileSetRendererUpdater;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TileSetRendererUpdater;

},{"./TileSet":6}],9:[function(require,module,exports){
"use strict";
var TileMapRenderer_1 = require("./TileMapRenderer");
var TileSetRenderer_1 = require("./TileSetRenderer");
SupEngine.registerComponentClass("TileMapRenderer", TileMapRenderer_1.default);
SupEngine.registerEditorComponentClass("TileSetRenderer", TileSetRenderer_1.default);

},{"./TileMapRenderer":4,"./TileSetRenderer":7}]},{},[9]);
