(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="../../../default/typescript/typescriptAPI/TypeScriptAPIPlugin.d.ts" />
"use strict";

SupCore.system.registerPlugin("typescriptAPI", "EventEmitter", {
    code: null,
    defs: "// Definitions for node.js v4.2.4\ndeclare class EventEmitter {\n  on(event: string, listener: Function): EventEmitter;\n  addListener(event: string, listener: Function): EventEmitter;\n  once(event: string, listener: Function): EventEmitter;\n  \n  removeListener(event: string, listener: Function): EventEmitter;\n  removeAllListeners(event?: string): EventEmitter;\n  \n  emit(event: string, ...args: any[]): boolean;\n\n  static defaultMaxListeners: number;\n  setMaxListeners(n: number): EventEmitter;\n  getMaxListener(): number\n\n  listeners(event: string): Function[];\n  listenerCount(event: string): number;  \n  static listenerCount(emitter: EventEmitter, event: string): number; // deprecated\n}\n"
});

},{}]},{},[1]);
