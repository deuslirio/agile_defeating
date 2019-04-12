(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
function setupComponent(player, component, config) {
    component.setText(config.text);
    component.setOptions({ alignment: config.alignment, verticalAlignment: config.verticalAlignment, size: config.size, color: config.color });
    if (config.overrideOpacity)
        component.opacity = config.opacity;
    if (config.fontAssetId != null) {
        var font = player.getOuterAsset(config.fontAssetId).__inner;
        if (!config.overrideOpacity)
            component.opacity = font.opacity;
        component.setFont(font);
    }
}
exports.setupComponent = setupComponent;

},{}],2:[function(require,module,exports){
"use strict";
function loadAsset(player, entry, callback) {
    player.getAssetData("assets/" + entry.storagePath + "/asset.json", "json", function (err, data) {
        if (data.isBitmap) {
            var img_1 = new Image();
            img_1.onload = function () {
                data.texture = new SupEngine.THREE.Texture(img_1);
                data.texture.needsUpdate = true;
                if (data.filtering === "pixelated") {
                    data.texture.magFilter = SupEngine.THREE.NearestFilter;
                    data.texture.minFilter = SupEngine.THREE.NearestFilter;
                }
                callback(null, data);
            };
            img_1.onerror = function () { callback(null, data); };
            img_1.src = player.dataURL + "assets/" + entry.storagePath + "/bitmap.dat";
        }
        else {
            data.name = "Font" + entry.id;
            var font = void 0;
            try {
                font = new FontFace(data.name, "url(" + player.dataURL + "assets/" + fixedEncodeURIComponent(entry.storagePath) + "/font.dat)");
                document.fonts.add(font);
            }
            catch (e) { }
            if (font != null)
                font.load().then(function () { callback(null, data); }, function () { callback(null, data); });
            else
                callback(null, data);
        }
    });
}
exports.loadAsset = loadAsset;
function fixedEncodeURIComponent(str) {
    return str.split("/").map(function (part) {
        return encodeURIComponent(part).replace(/[!'()*]/g, function (c) { return ("%" + c.charCodeAt(0).toString(16)); });
    }).join("/");
}
function createOuterAsset(player, asset) { return new window.Sup.Font(asset); }
exports.createOuterAsset = createOuterAsset;

},{}],3:[function(require,module,exports){
"use strict";
var TextRenderer = require("./TextRenderer");
var font = require("./font");
SupRuntime.registerPlugin("TextRenderer", TextRenderer);
SupRuntime.registerPlugin("font", font);

},{"./TextRenderer":1,"./font":2}]},{},[3]);
