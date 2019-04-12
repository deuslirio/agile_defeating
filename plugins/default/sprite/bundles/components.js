(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var THREE = SupEngine.THREE;
var SpriteRendererUpdater_1 = require("./SpriteRendererUpdater");
var SpriteRenderer = (function (_super) {
    __extends(SpriteRenderer, _super);
    function SpriteRenderer(actor) {
        _super.call(this, actor, "SpriteRenderer");
        this.color = { r: 1, g: 1, b: 1 };
        this.hasFrameBeenUpdated = false;
        this.materialType = "basic";
        this.horizontalFlip = false;
        this.verticalFlip = false;
        this.castShadow = false;
        this.receiveShadow = false;
        this.playbackSpeed = 1;
    }
    SpriteRenderer.prototype.setSprite = function (asset, materialType, customShader) {
        this._clearMesh();
        this.asset = asset;
        if (materialType != null)
            this.materialType = materialType;
        if (customShader != null)
            this.shaderAsset = customShader;
        this.animationName = null;
        this.animationsByName = {};
        if (this.asset == null || this.asset.textures[this.asset.mapSlots["map"]] == null)
            return;
        this.frameToSecond = this.actor.gameInstance.framesPerSecond / this.asset.framesPerSecond;
        this.updateAnimationsByName();
        this.geometry = new THREE.PlaneBufferGeometry(this.asset.grid.width, this.asset.grid.height);
        if (this.materialType === "shader") {
            this.material = SupEngine.componentClasses["Shader"].createShaderMaterial(this.shaderAsset, this.asset.textures, this.geometry);
            this.material.map = this.asset.textures[this.asset.mapSlots["map"]];
        }
        else {
            var material = void 0;
            if (this.materialType === "basic")
                material = new THREE.MeshBasicMaterial();
            else if (this.materialType === "phong") {
                material = new THREE.MeshPhongMaterial();
                material.lightMap = this.asset.textures[this.asset.mapSlots["light"]];
            }
            material.map = this.asset.textures[this.asset.mapSlots["map"]];
            material.specularMap = this.asset.textures[this.asset.mapSlots["specular"]];
            material.alphaMap = this.asset.textures[this.asset.mapSlots["alpha"]];
            if (this.materialType === "phong")
                material.normalMap = this.asset.textures[this.asset.mapSlots["normal"]];
            material.alphaTest = this.asset.alphaTest;
            this.material = material;
            this.setOpacity(this.opacity);
        }
        this.material.side = THREE.DoubleSide;
        this.setColor(this.color.r, this.color.g, this.color.b);
        // TEMP
        // this.asset.textures["map"].wrapS = THREE.RepeatWrapping;
        // this.asset.textures["map"].wrapT = THREE.RepeatWrapping;
        this.threeMesh = new THREE.Mesh(this.geometry, this.material);
        this.setCastShadow(this.castShadow);
        this.threeMesh.receiveShadow = this.receiveShadow;
        this.setFrame(0);
        this.actor.threeObject.add(this.threeMesh);
        this.updateShape();
    };
    SpriteRenderer.prototype.setColor = function (r, g, b) {
        this.color.r = r;
        this.color.g = g;
        this.color.b = b;
        if (this.material == null)
            return;
        if (this.material instanceof THREE.ShaderMaterial) {
            var uniforms = this.material.uniforms;
            if (uniforms.color != null)
                uniforms.color.value.setRGB(r, g, b);
        }
        else
            this.material.color.setRGB(r, g, b);
        this.material.needsUpdate = true;
    };
    SpriteRenderer.prototype.updateShape = function () {
        if (this.threeMesh == null)
            return;
        var scaleRatio = 1 / this.asset.pixelsPerUnit;
        this.threeMesh.scale.set(scaleRatio, scaleRatio, scaleRatio);
        var x;
        if (this.horizontalFlip)
            x = this.asset.origin.x - 0.5;
        else
            x = 0.5 - this.asset.origin.x;
        var y;
        if (this.verticalFlip)
            y = this.asset.origin.y - 0.5;
        else
            y = 0.5 - this.asset.origin.y;
        this.threeMesh.position.setX(x * this.asset.grid.width * scaleRatio);
        this.threeMesh.position.setY(y * this.asset.grid.height * scaleRatio);
        this.threeMesh.updateMatrixWorld(false);
    };
    SpriteRenderer.prototype.setOpacity = function (opacity) {
        this.opacity = opacity;
        if (this.material == null)
            return;
        if (this.opacity != null) {
            this.material.transparent = true;
            this.material.opacity = this.opacity;
        }
        else {
            this.material.transparent = false;
            this.material.opacity = 1;
        }
        this.material.needsUpdate = true;
    };
    SpriteRenderer.prototype.setHorizontalFlip = function (horizontalFlip) {
        this.horizontalFlip = horizontalFlip;
        if (this.asset == null)
            return;
        this.updateShape();
        if (this.animationName == null)
            this.setFrame(0);
        else
            this.updateFrame(false);
    };
    SpriteRenderer.prototype.setVerticalFlip = function (verticalFlip) {
        this.verticalFlip = verticalFlip;
        if (this.asset == null)
            return;
        this.updateShape();
        if (this.animationName == null)
            this.setFrame(0);
        else
            this.updateFrame(false);
    };
    SpriteRenderer.prototype.updateAnimationsByName = function () {
        this.animationsByName = {};
        for (var _i = 0, _a = this.asset.animations; _i < _a.length; _i++) {
            var animation = _a[_i];
            this.animationsByName[animation.name] = animation;
        }
    };
    SpriteRenderer.prototype._clearMesh = function () {
        if (this.threeMesh == null)
            return;
        this.actor.threeObject.remove(this.threeMesh);
        this.threeMesh.geometry.dispose();
        this.threeMesh.material.dispose();
        this.threeMesh = null;
        this.material = null;
    };
    SpriteRenderer.prototype.setCastShadow = function (castShadow) {
        this.castShadow = castShadow;
        this.threeMesh.castShadow = castShadow;
        if (!castShadow)
            return;
        this.actor.gameInstance.threeScene.traverse(function (object) {
            var material = object.material;
            if (material != null)
                material.needsUpdate = true;
        });
    };
    SpriteRenderer.prototype._destroy = function () {
        this._clearMesh();
        this.asset = null;
        _super.prototype._destroy.call(this);
    };
    SpriteRenderer.prototype.setFrame = function (frame) {
        var map = this.material.map;
        var frameX, frameY;
        if (this.asset.frameOrder === "rows") {
            var framesPerRow = Math.floor(map.size.width / this.asset.grid.width);
            frameX = frame % framesPerRow;
            frameY = Math.floor(frame / framesPerRow);
        }
        else {
            var framesPerColumn = Math.floor(map.size.height / this.asset.grid.height);
            frameX = Math.floor(frame / framesPerColumn);
            frameY = frame % framesPerColumn;
        }
        var left = (frameX * this.asset.grid.width) / map.size.width;
        var right = ((frameX + 1) * this.asset.grid.width) / map.size.width;
        var bottom = (map.size.height - (frameY + 1) * this.asset.grid.height) / map.size.height;
        var top = (map.size.height - frameY * this.asset.grid.height) / map.size.height;
        if (this.horizontalFlip)
            _a = [right, left], left = _a[0], right = _a[1];
        if (this.verticalFlip)
            _b = [bottom, top], top = _b[0], bottom = _b[1];
        var uvs = this.geometry.getAttribute("uv");
        uvs.needsUpdate = true;
        var uvsArray = uvs.array;
        uvsArray[0] = left;
        uvsArray[1] = top;
        uvsArray[2] = right;
        uvsArray[3] = top;
        uvsArray[4] = left;
        uvsArray[5] = bottom;
        uvsArray[6] = right;
        uvsArray[7] = bottom;
        var _a, _b;
    };
    SpriteRenderer.prototype.setAnimation = function (newAnimationName, newAnimationLooping) {
        if (newAnimationLooping === void 0) { newAnimationLooping = true; }
        if (newAnimationName != null) {
            var animation = this.animationsByName[newAnimationName];
            if (animation == null)
                throw new Error("Animation " + newAnimationName + " doesn't exist");
            this.animationLooping = newAnimationLooping;
            if (newAnimationName === this.animationName && this.isAnimationPlaying)
                return;
            this.animation = animation;
            this.animationName = newAnimationName;
            if (this.playbackSpeed * animation.speed >= 0)
                this.animationTimer = 0;
            else
                this.animationTimer = this.getAnimationFrameCount() / this.frameToSecond - 1;
            this.isAnimationPlaying = true;
            this.updateFrame();
        }
        else {
            this.animation = null;
            this.animationName = null;
            this.setFrame(0);
        }
    };
    SpriteRenderer.prototype.getAnimation = function () { return this.animationName; };
    SpriteRenderer.prototype.setAnimationFrameTime = function (frameTime) {
        if (this.animationName == null)
            return;
        if (frameTime < 0 || frameTime > this.getAnimationFrameCount())
            throw new Error("Frame time must be >= 0 and < " + this.getAnimationFrameCount());
        this.animationTimer = frameTime * this.frameToSecond;
        this.updateFrame();
    };
    SpriteRenderer.prototype.getAnimationFrameTime = function () {
        if (this.animationName == null)
            return 0;
        return this.computeAbsoluteFrameTime() - this.animation.startFrameIndex;
    };
    SpriteRenderer.prototype.getAnimationFrameIndex = function () {
        if (this.animationName == null)
            return 0;
        return Math.floor(this.computeAbsoluteFrameTime()) - this.animation.startFrameIndex;
    };
    SpriteRenderer.prototype.getAnimationFrameCount = function () {
        if (this.animationName == null)
            return 0;
        return this.animation.endFrameIndex - this.animation.startFrameIndex + 1;
    };
    SpriteRenderer.prototype.playAnimation = function (animationLooping) {
        if (animationLooping === void 0) { animationLooping = true; }
        this.animationLooping = animationLooping;
        this.isAnimationPlaying = true;
        if (this.animationLooping)
            return;
        if (this.playbackSpeed * this.animation.speed > 0 && this.getAnimationFrameIndex() === this.getAnimationFrameCount() - 1)
            this.animationTimer = 0;
        else if (this.playbackSpeed * this.animation.speed < 0 && this.getAnimationFrameIndex() === 0)
            this.animationTimer = (this.getAnimationFrameCount() - 0.01) * this.frameToSecond;
    };
    SpriteRenderer.prototype.pauseAnimation = function () { this.isAnimationPlaying = false; };
    SpriteRenderer.prototype.stopAnimation = function () {
        if (this.animationName == null)
            return;
        this.isAnimationPlaying = false;
        this.animationTimer = 0;
        this.updateFrame();
    };
    SpriteRenderer.prototype.computeAbsoluteFrameTime = function () {
        var frame = this.animation.startFrameIndex;
        frame += this.animationTimer / this.frameToSecond;
        return frame;
    };
    SpriteRenderer.prototype.updateFrame = function (flagFrameUpdated) {
        if (flagFrameUpdated === void 0) { flagFrameUpdated = true; }
        if (flagFrameUpdated)
            this.hasFrameBeenUpdated = true;
        var frame = Math.floor(this.computeAbsoluteFrameTime());
        if (frame > this.animation.endFrameIndex) {
            if (this.animationLooping) {
                frame = this.animation.startFrameIndex;
                this.animationTimer = this.playbackSpeed * this.animation.speed;
            }
            else {
                frame = this.animation.endFrameIndex;
                this.animationTimer = (this.getAnimationFrameCount() - 0.01) * this.frameToSecond;
                this.isAnimationPlaying = false;
            }
        }
        else if (frame < this.animation.startFrameIndex) {
            if (this.animationLooping) {
                frame = this.animation.endFrameIndex;
                this.animationTimer = (this.getAnimationFrameCount() - 0.01) * this.frameToSecond + this.playbackSpeed * this.animation.speed;
            }
            else {
                frame = this.animation.startFrameIndex;
                this.animationTimer = 0;
                this.isAnimationPlaying = false;
            }
        }
        this.setFrame(frame);
    };
    SpriteRenderer.prototype.update = function () {
        if (this.material != null) {
            var uniforms = this.material.uniforms;
            if (uniforms != null)
                uniforms.time.value += 1 / this.actor.gameInstance.framesPerSecond;
        }
        if (this.hasFrameBeenUpdated) {
            this.hasFrameBeenUpdated = false;
            return;
        }
        this._tickAnimation();
        this.hasFrameBeenUpdated = false;
    };
    SpriteRenderer.prototype._tickAnimation = function () {
        if (this.animationName == null || !this.isAnimationPlaying)
            return;
        this.animationTimer += this.playbackSpeed * this.animation.speed;
        this.updateFrame();
    };
    SpriteRenderer.prototype.setIsLayerActive = function (active) { if (this.threeMesh != null)
        this.threeMesh.visible = active; };
    /* tslint:disable:variable-name */
    SpriteRenderer.Updater = SpriteRendererUpdater_1.default;
    return SpriteRenderer;
}(SupEngine.ActorComponent));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SpriteRenderer;

},{"./SpriteRendererUpdater":2}],2:[function(require,module,exports){
"use strict";
var SpriteRendererUpdater = (function () {
    function SpriteRendererUpdater(client, spriteRenderer, config, externalSubscriber) {
        var _this = this;
        this.client = client;
        this.spriteRenderer = spriteRenderer;
        this.externalSubscriber = externalSubscriber;
        this.looping = true;
        this.overrideOpacity = false;
        this.onSpriteAssetReceived = function (assetId, asset) {
            if (!_this.overrideOpacity)
                _this.spriteRenderer.opacity = asset.pub.opacity;
            _this.prepareMaps(asset.pub.textures, function () {
                _this.spriteAsset = asset;
                _this.setSprite();
                if (_this.externalSubscriber.onAssetReceived != null)
                    _this.externalSubscriber.onAssetReceived(assetId, asset);
            });
        };
        this.onSpriteAssetEdited = function (assetId, command) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var callEditCallback = true;
            var commandFunction = _this.onEditCommands[command];
            if (commandFunction != null && commandFunction.apply(_this, args) === false)
                callEditCallback = false;
            if (callEditCallback && _this.externalSubscriber.onAssetEdited != null) {
                (_a = _this.externalSubscriber).onAssetEdited.apply(_a, [assetId, command].concat(args));
            }
            var _a;
        };
        this.onEditCommands = {
            setMaps: function (maps) {
                // TODO: Only update the maps that changed, don't recreate the whole model
                _this.prepareMaps(_this.spriteAsset.pub.textures, function () {
                    _this.setSprite();
                    if (_this.externalSubscriber.onAssetEdited != null) {
                        _this.externalSubscriber.onAssetEdited(_this.spriteAsset.id, "setMaps");
                    }
                });
                return false;
            },
            setMapSlot: function (slot, name) { _this.setSprite(); },
            deleteMap: function (name) { _this.setSprite(); },
            setProperty: function (path, value) {
                switch (path) {
                    case "filtering":
                        break;
                    case "opacity":
                        if (!_this.overrideOpacity)
                            _this.spriteRenderer.setOpacity(value);
                        break;
                    case "alphaTest":
                        _this.spriteRenderer.material.alphaTest = value;
                        _this.spriteRenderer.material.needsUpdate = true;
                        break;
                    case "pixelsPerUnit":
                    case "origin.x":
                    case "origin.y":
                        _this.spriteRenderer.updateShape();
                        break;
                    default:
                        _this.setSprite();
                        break;
                }
            },
            newAnimation: function () {
                _this.spriteRenderer.updateAnimationsByName();
                _this.playAnimation();
            },
            deleteAnimation: function () {
                _this.spriteRenderer.updateAnimationsByName();
                _this.playAnimation();
            },
            setAnimationProperty: function () {
                _this.spriteRenderer.updateAnimationsByName();
                _this.playAnimation();
            }
        };
        this.onSpriteAssetTrashed = function (assetId) {
            _this.spriteAsset = null;
            _this.spriteRenderer.setSprite(null);
            if (_this.externalSubscriber.onAssetTrashed != null)
                _this.externalSubscriber.onAssetTrashed(assetId);
        };
        this.onShaderAssetReceived = function (assetId, asset) {
            _this.shaderPub = asset.pub;
            _this.setSprite();
        };
        this.onShaderAssetEdited = function (id, command) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            if (command !== "editVertexShader" && command !== "editFragmentShader")
                _this.setSprite();
        };
        this.onShaderAssetTrashed = function () {
            _this.shaderPub = null;
            _this.setSprite();
        };
        this.spriteAssetId = config.spriteAssetId;
        this.animationId = config.animationId;
        this.materialType = config.materialType;
        this.shaderAssetId = config.shaderAssetId;
        if (this.externalSubscriber == null)
            this.externalSubscriber = {};
        this.spriteRenderer.horizontalFlip = config.horizontalFlip;
        this.spriteRenderer.verticalFlip = config.verticalFlip;
        this.spriteRenderer.castShadow = config.castShadow;
        this.spriteRenderer.receiveShadow = config.receiveShadow;
        this.overrideOpacity = config.overrideOpacity;
        this.opacity = config.opacity;
        if (this.overrideOpacity)
            this.spriteRenderer.setOpacity(this.opacity);
        var hex = parseInt(config.color, 16);
        var r = (hex >> 16 & 255) / 255;
        var g = (hex >> 8 & 255) / 255;
        var b = (hex & 255) / 255;
        this.spriteRenderer.setColor(r, g, b);
        this.spriteSubscriber = {
            onAssetReceived: this.onSpriteAssetReceived,
            onAssetEdited: this.onSpriteAssetEdited,
            onAssetTrashed: this.onSpriteAssetTrashed
        };
        this.shaderSubscriber = {
            onAssetReceived: this.onShaderAssetReceived,
            onAssetEdited: this.onShaderAssetEdited,
            onAssetTrashed: this.onShaderAssetTrashed
        };
        if (this.spriteAssetId != null)
            this.client.subAsset(this.spriteAssetId, "sprite", this.spriteSubscriber);
        if (this.shaderAssetId != null)
            this.client.subAsset(this.shaderAssetId, "shader", this.shaderSubscriber);
    }
    SpriteRendererUpdater.prototype.destroy = function () {
        if (this.spriteAssetId != null)
            this.client.unsubAsset(this.spriteAssetId, this.spriteSubscriber);
        if (this.shaderAssetId != null)
            this.client.unsubAsset(this.shaderAssetId, this.shaderSubscriber);
    };
    SpriteRendererUpdater.prototype.prepareMaps = function (textures, callback) {
        var textureNames = Object.keys(textures);
        var texturesToLoad = textureNames.length;
        if (texturesToLoad === 0) {
            callback();
            return;
        }
        function onTextureLoaded() {
            texturesToLoad--;
            if (texturesToLoad === 0)
                callback();
        }
        textureNames.forEach(function (key) {
            var image = textures[key].image;
            if (!image.complete)
                image.addEventListener("load", onTextureLoaded);
            else
                onTextureLoaded();
        });
    };
    SpriteRendererUpdater.prototype.setSprite = function () {
        if (this.spriteAsset == null || (this.materialType === "shader" && this.shaderPub == null)) {
            this.spriteRenderer.setSprite(null);
            return;
        }
        this.spriteRenderer.setSprite(this.spriteAsset.pub, this.materialType, this.shaderPub);
        if (this.animationId != null)
            this.playAnimation();
    };
    SpriteRendererUpdater.prototype.playAnimation = function () {
        var animation = this.spriteAsset.animations.byId[this.animationId];
        if (animation == null)
            return;
        this.spriteRenderer.setAnimation(animation.name, this.looping);
    };
    SpriteRendererUpdater.prototype.config_setProperty = function (path, value) {
        switch (path) {
            case "spriteAssetId":
                if (this.spriteAssetId != null)
                    this.client.unsubAsset(this.spriteAssetId, this.spriteSubscriber);
                this.spriteAssetId = value;
                this.spriteAsset = null;
                this.spriteRenderer.setSprite(null);
                if (this.spriteAssetId != null)
                    this.client.subAsset(this.spriteAssetId, "sprite", this.spriteSubscriber);
                break;
            case "animationId":
                this.animationId = value;
                this.setSprite();
                break;
            case "looping":
                this.looping = value;
                if (this.animationId != null)
                    this.playAnimation();
                break;
            case "horizontalFlip":
                this.spriteRenderer.setHorizontalFlip(value);
                break;
            case "verticalFlip":
                this.spriteRenderer.setVerticalFlip(value);
                break;
            case "castShadow":
                this.spriteRenderer.setCastShadow(value);
                break;
            case "receiveShadow":
                this.spriteRenderer.receiveShadow = value;
                this.spriteRenderer.threeMesh.receiveShadow = value;
                this.spriteRenderer.threeMesh.material.needsUpdate = true;
                break;
            case "color":
                var hex = parseInt(value, 16);
                var r = (hex >> 16 & 255) / 255;
                var g = (hex >> 8 & 255) / 255;
                var b = (hex & 255) / 255;
                this.spriteRenderer.setColor(r, g, b);
                break;
            case "overrideOpacity":
                this.overrideOpacity = value;
                this.spriteRenderer.setOpacity(value ? this.opacity : (this.spriteAsset != null ? this.spriteAsset.pub.opacity : null));
                break;
            case "opacity":
                this.opacity = value;
                this.spriteRenderer.setOpacity(value);
                break;
            case "materialType":
                this.materialType = value;
                this.setSprite();
                break;
            case "shaderAssetId":
                if (this.shaderAssetId != null)
                    this.client.unsubAsset(this.shaderAssetId, this.shaderSubscriber);
                this.shaderAssetId = value;
                this.shaderPub = null;
                this.spriteRenderer.setSprite(null);
                if (this.shaderAssetId != null)
                    this.client.subAsset(this.shaderAssetId, "shader", this.shaderSubscriber);
                break;
        }
    };
    return SpriteRendererUpdater;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SpriteRendererUpdater;

},{}],3:[function(require,module,exports){
"use strict";
var SpriteRenderer_1 = require("./SpriteRenderer");
SupEngine.registerComponentClass("SpriteRenderer", SpriteRenderer_1.default);

},{"./SpriteRenderer":1}]},{},[3]);
