/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("const promise = __webpack_require__(/*! promise */ \"./node_modules/promise/index.js\");\n\nconsole.log('hello world!');\nconsole.log(promise.resolve(true));\n\n\n//# sourceURL=webpack://recurly-apple-observe-error/./index.js?");

/***/ }),

/***/ "./node_modules/asap/browser-asap.js":
/*!*******************************************!*\
  !*** ./node_modules/asap/browser-asap.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\n// rawAsap provides everything we need except exception management.\nvar rawAsap = __webpack_require__(/*! ./raw */ \"./node_modules/asap/browser-raw.js\");\n// RawTasks are recycled to reduce GC churn.\nvar freeTasks = [];\n// We queue errors to ensure they are thrown in right order (FIFO).\n// Array-as-queue is good enough here, since we are just dealing with exceptions.\nvar pendingErrors = [];\nvar requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);\n\nfunction throwFirstError() {\n    if (pendingErrors.length) {\n        throw pendingErrors.shift();\n    }\n}\n\n/**\n * Calls a task as soon as possible after returning, in its own event, with priority\n * over other events like animation, reflow, and repaint. An error thrown from an\n * event will not interrupt, nor even substantially slow down the processing of\n * other events, but will be rather postponed to a lower priority event.\n * @param {{call}} task A callable object, typically a function that takes no\n * arguments.\n */\nmodule.exports = asap;\nfunction asap(task) {\n    var rawTask;\n    if (freeTasks.length) {\n        rawTask = freeTasks.pop();\n    } else {\n        rawTask = new RawTask();\n    }\n    rawTask.task = task;\n    rawAsap(rawTask);\n}\n\n// We wrap tasks with recyclable task objects.  A task object implements\n// `call`, just like a function.\nfunction RawTask() {\n    this.task = null;\n}\n\n// The sole purpose of wrapping the task is to catch the exception and recycle\n// the task object after its single use.\nRawTask.prototype.call = function () {\n    try {\n        this.task.call();\n    } catch (error) {\n        if (asap.onerror) {\n            // This hook exists purely for testing purposes.\n            // Its name will be periodically randomized to break any code that\n            // depends on its existence.\n            asap.onerror(error);\n        } else {\n            // In a web browser, exceptions are not fatal. However, to avoid\n            // slowing down the queue of pending tasks, we rethrow the error in a\n            // lower priority turn.\n            pendingErrors.push(error);\n            requestErrorThrow();\n        }\n    } finally {\n        this.task = null;\n        freeTasks[freeTasks.length] = this;\n    }\n};\n\n\n//# sourceURL=webpack://recurly-apple-observe-error/./node_modules/asap/browser-asap.js?");

/***/ }),

/***/ "./node_modules/asap/browser-raw.js":
/*!******************************************!*\
  !*** ./node_modules/asap/browser-raw.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\n// Use the fastest means possible to execute a task in its own turn, with\n// priority over other events including IO, animation, reflow, and redraw\n// events in browsers.\n//\n// An exception thrown by a task will permanently interrupt the processing of\n// subsequent tasks. The higher level `asap` function ensures that if an\n// exception is thrown by a task, that the task queue will continue flushing as\n// soon as possible, but if you use `rawAsap` directly, you are responsible to\n// either ensure that no exceptions are thrown from your task, or to manually\n// call `rawAsap.requestFlush` if an exception is thrown.\nmodule.exports = rawAsap;\nfunction rawAsap(task) {\n    if (!queue.length) {\n        requestFlush();\n        flushing = true;\n    }\n    // Equivalent to push, but avoids a function call.\n    queue[queue.length] = task;\n}\n\nvar queue = [];\n// Once a flush has been requested, no further calls to `requestFlush` are\n// necessary until the next `flush` completes.\nvar flushing = false;\n// `requestFlush` is an implementation-specific method that attempts to kick\n// off a `flush` event as quickly as possible. `flush` will attempt to exhaust\n// the event queue before yielding to the browser's own event loop.\nvar requestFlush;\n// The position of the next task to execute in the task queue. This is\n// preserved between calls to `flush` so that it can be resumed if\n// a task throws an exception.\nvar index = 0;\n// If a task schedules additional tasks recursively, the task queue can grow\n// unbounded. To prevent memory exhaustion, the task queue will periodically\n// truncate already-completed tasks.\nvar capacity = 1024;\n\n// The flush function processes all tasks that have been scheduled with\n// `rawAsap` unless and until one of those tasks throws an exception.\n// If a task throws an exception, `flush` ensures that its state will remain\n// consistent and will resume where it left off when called again.\n// However, `flush` does not make any arrangements to be called again if an\n// exception is thrown.\nfunction flush() {\n    while (index < queue.length) {\n        var currentIndex = index;\n        // Advance the index before calling the task. This ensures that we will\n        // begin flushing on the next task the task throws an error.\n        index = index + 1;\n        queue[currentIndex].call();\n        // Prevent leaking memory for long chains of recursive calls to `asap`.\n        // If we call `asap` within tasks scheduled by `asap`, the queue will\n        // grow, but to avoid an O(n) walk for every task we execute, we don't\n        // shift tasks off the queue after they have been executed.\n        // Instead, we periodically shift 1024 tasks off the queue.\n        if (index > capacity) {\n            // Manually shift all values starting at the index back to the\n            // beginning of the queue.\n            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {\n                queue[scan] = queue[scan + index];\n            }\n            queue.length -= index;\n            index = 0;\n        }\n    }\n    queue.length = 0;\n    index = 0;\n    flushing = false;\n}\n\n// `requestFlush` is implemented using a strategy based on data collected from\n// every available SauceLabs Selenium web driver worker at time of writing.\n// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593\n\n// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that\n// have WebKitMutationObserver but not un-prefixed MutationObserver.\n// Must use `global` or `self` instead of `window` to work in both frames and web\n// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.\n\n/* globals self */\nvar scope = typeof __webpack_require__.g !== \"undefined\" ? __webpack_require__.g : self;\nvar BrowserMutationObserver = scope.MutationObserver || scope.WebKitMutationObserver;\n\n// MutationObservers are desirable because they have high priority and work\n// reliably everywhere they are implemented.\n// They are implemented in all modern browsers.\n//\n// - Android 4-4.3\n// - Chrome 26-34\n// - Firefox 14-29\n// - Internet Explorer 11\n// - iPad Safari 6-7.1\n// - iPhone Safari 7-7.1\n// - Safari 6-7\nif (typeof BrowserMutationObserver === \"function\") {\n    requestFlush = makeRequestCallFromMutationObserver(flush);\n\n// MessageChannels are desirable because they give direct access to the HTML\n// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera\n// 11-12, and in web workers in many engines.\n// Although message channels yield to any queued rendering and IO tasks, they\n// would be better than imposing the 4ms delay of timers.\n// However, they do not work reliably in Internet Explorer or Safari.\n\n// Internet Explorer 10 is the only browser that has setImmediate but does\n// not have MutationObservers.\n// Although setImmediate yields to the browser's renderer, it would be\n// preferrable to falling back to setTimeout since it does not have\n// the minimum 4ms penalty.\n// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and\n// Desktop to a lesser extent) that renders both setImmediate and\n// MessageChannel useless for the purposes of ASAP.\n// https://github.com/kriskowal/q/issues/396\n\n// Timers are implemented universally.\n// We fall back to timers in workers in most engines, and in foreground\n// contexts in the following browsers.\n// However, note that even this simple case requires nuances to operate in a\n// broad spectrum of browsers.\n//\n// - Firefox 3-13\n// - Internet Explorer 6-9\n// - iPad Safari 4.3\n// - Lynx 2.8.7\n} else {\n    requestFlush = makeRequestCallFromTimer(flush);\n}\n\n// `requestFlush` requests that the high priority event queue be flushed as\n// soon as possible.\n// This is useful to prevent an error thrown in a task from stalling the event\n// queue if the exception handled by Node.js’s\n// `process.on(\"uncaughtException\")` or by a domain.\nrawAsap.requestFlush = requestFlush;\n\n// To request a high priority event, we induce a mutation observer by toggling\n// the text of a text node between \"1\" and \"-1\".\nfunction makeRequestCallFromMutationObserver(callback) {\n    var toggle = 1;\n    var observer = new BrowserMutationObserver(callback);\n    var node = document.createTextNode(\"\");\n    observer.observe(node, {characterData: true});\n    return function requestCall() {\n        toggle = -toggle;\n        node.data = toggle;\n    };\n}\n\n// The message channel technique was discovered by Malte Ubl and was the\n// original foundation for this library.\n// http://www.nonblocking.io/2011/06/windownexttick.html\n\n// Safari 6.0.5 (at least) intermittently fails to create message ports on a\n// page's first load. Thankfully, this version of Safari supports\n// MutationObservers, so we don't need to fall back in that case.\n\n// function makeRequestCallFromMessageChannel(callback) {\n//     var channel = new MessageChannel();\n//     channel.port1.onmessage = callback;\n//     return function requestCall() {\n//         channel.port2.postMessage(0);\n//     };\n// }\n\n// For reasons explained above, we are also unable to use `setImmediate`\n// under any circumstances.\n// Even if we were, there is another bug in Internet Explorer 10.\n// It is not sufficient to assign `setImmediate` to `requestFlush` because\n// `setImmediate` must be called *by name* and therefore must be wrapped in a\n// closure.\n// Never forget.\n\n// function makeRequestCallFromSetImmediate(callback) {\n//     return function requestCall() {\n//         setImmediate(callback);\n//     };\n// }\n\n// Safari 6.0 has a problem where timers will get lost while the user is\n// scrolling. This problem does not impact ASAP because Safari 6.0 supports\n// mutation observers, so that implementation is used instead.\n// However, if we ever elect to use timers in Safari, the prevalent work-around\n// is to add a scroll event listener that calls for a flush.\n\n// `setTimeout` does not call the passed callback if the delay is less than\n// approximately 7 in web workers in Firefox 8 through 18, and sometimes not\n// even then.\n\nfunction makeRequestCallFromTimer(callback) {\n    return function requestCall() {\n        // We dispatch a timeout with a specified delay of 0 for engines that\n        // can reliably accommodate that request. This will usually be snapped\n        // to a 4 milisecond delay, but once we're flushing, there's no delay\n        // between events.\n        var timeoutHandle = setTimeout(handleTimer, 0);\n        // However, since this timer gets frequently dropped in Firefox\n        // workers, we enlist an interval handle that will try to fire\n        // an event 20 times per second until it succeeds.\n        var intervalHandle = setInterval(handleTimer, 50);\n\n        function handleTimer() {\n            // Whichever timer succeeds will cancel both timers and\n            // execute the callback.\n            clearTimeout(timeoutHandle);\n            clearInterval(intervalHandle);\n            callback();\n        }\n    };\n}\n\n// This is for `asap.js` only.\n// Its name will be periodically randomized to break any code that depends on\n// its existence.\nrawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;\n\n// ASAP was originally a nextTick shim included in Q. This was factored out\n// into this ASAP package. It was later adapted to RSVP which made further\n// amendments. These decisions, particularly to marginalize MessageChannel and\n// to capture the MutationObserver implementation in a closure, were integrated\n// back into ASAP proper.\n// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js\n\n\n//# sourceURL=webpack://recurly-apple-observe-error/./node_modules/asap/browser-raw.js?");

/***/ }),

/***/ "./node_modules/promise/index.js":
/*!***************************************!*\
  !*** ./node_modules/promise/index.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nmodule.exports = __webpack_require__(/*! ./lib */ \"./node_modules/promise/lib/index.js\")\n\n\n//# sourceURL=webpack://recurly-apple-observe-error/./node_modules/promise/index.js?");

/***/ }),

/***/ "./node_modules/promise/lib/core.js":
/*!******************************************!*\
  !*** ./node_modules/promise/lib/core.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar asap = __webpack_require__(/*! asap/raw */ \"./node_modules/asap/browser-raw.js\");\n\nfunction noop() {}\n\n// States:\n//\n// 0 - pending\n// 1 - fulfilled with _value\n// 2 - rejected with _value\n// 3 - adopted the state of another promise, _value\n//\n// once the state is no longer pending (0) it is immutable\n\n// All `_` prefixed properties will be reduced to `_{random number}`\n// at build time to obfuscate them and discourage their use.\n// We don't use symbols or Object.defineProperty to fully hide them\n// because the performance isn't good enough.\n\n\n// to avoid using try/catch inside critical functions, we\n// extract them to here.\nvar LAST_ERROR = null;\nvar IS_ERROR = {};\nfunction getThen(obj) {\n  try {\n    return obj.then;\n  } catch (ex) {\n    LAST_ERROR = ex;\n    return IS_ERROR;\n  }\n}\n\nfunction tryCallOne(fn, a) {\n  try {\n    return fn(a);\n  } catch (ex) {\n    LAST_ERROR = ex;\n    return IS_ERROR;\n  }\n}\nfunction tryCallTwo(fn, a, b) {\n  try {\n    fn(a, b);\n  } catch (ex) {\n    LAST_ERROR = ex;\n    return IS_ERROR;\n  }\n}\n\nmodule.exports = Promise;\n\nfunction Promise(fn) {\n  if (typeof this !== 'object') {\n    throw new TypeError('Promises must be constructed via new');\n  }\n  if (typeof fn !== 'function') {\n    throw new TypeError('Promise constructor\\'s argument is not a function');\n  }\n  this._U = 0;\n  this._V = 0;\n  this._W = null;\n  this._X = null;\n  if (fn === noop) return;\n  doResolve(fn, this);\n}\nPromise._Y = null;\nPromise._Z = null;\nPromise._0 = noop;\n\nPromise.prototype.then = function(onFulfilled, onRejected) {\n  if (this.constructor !== Promise) {\n    return safeThen(this, onFulfilled, onRejected);\n  }\n  var res = new Promise(noop);\n  handle(this, new Handler(onFulfilled, onRejected, res));\n  return res;\n};\n\nfunction safeThen(self, onFulfilled, onRejected) {\n  return new self.constructor(function (resolve, reject) {\n    var res = new Promise(noop);\n    res.then(resolve, reject);\n    handle(self, new Handler(onFulfilled, onRejected, res));\n  });\n}\nfunction handle(self, deferred) {\n  while (self._V === 3) {\n    self = self._W;\n  }\n  if (Promise._Y) {\n    Promise._Y(self);\n  }\n  if (self._V === 0) {\n    if (self._U === 0) {\n      self._U = 1;\n      self._X = deferred;\n      return;\n    }\n    if (self._U === 1) {\n      self._U = 2;\n      self._X = [self._X, deferred];\n      return;\n    }\n    self._X.push(deferred);\n    return;\n  }\n  handleResolved(self, deferred);\n}\n\nfunction handleResolved(self, deferred) {\n  asap(function() {\n    var cb = self._V === 1 ? deferred.onFulfilled : deferred.onRejected;\n    if (cb === null) {\n      if (self._V === 1) {\n        resolve(deferred.promise, self._W);\n      } else {\n        reject(deferred.promise, self._W);\n      }\n      return;\n    }\n    var ret = tryCallOne(cb, self._W);\n    if (ret === IS_ERROR) {\n      reject(deferred.promise, LAST_ERROR);\n    } else {\n      resolve(deferred.promise, ret);\n    }\n  });\n}\nfunction resolve(self, newValue) {\n  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure\n  if (newValue === self) {\n    return reject(\n      self,\n      new TypeError('A promise cannot be resolved with itself.')\n    );\n  }\n  if (\n    newValue &&\n    (typeof newValue === 'object' || typeof newValue === 'function')\n  ) {\n    var then = getThen(newValue);\n    if (then === IS_ERROR) {\n      return reject(self, LAST_ERROR);\n    }\n    if (\n      then === self.then &&\n      newValue instanceof Promise\n    ) {\n      self._V = 3;\n      self._W = newValue;\n      finale(self);\n      return;\n    } else if (typeof then === 'function') {\n      doResolve(then.bind(newValue), self);\n      return;\n    }\n  }\n  self._V = 1;\n  self._W = newValue;\n  finale(self);\n}\n\nfunction reject(self, newValue) {\n  self._V = 2;\n  self._W = newValue;\n  if (Promise._Z) {\n    Promise._Z(self, newValue);\n  }\n  finale(self);\n}\nfunction finale(self) {\n  if (self._U === 1) {\n    handle(self, self._X);\n    self._X = null;\n  }\n  if (self._U === 2) {\n    for (var i = 0; i < self._X.length; i++) {\n      handle(self, self._X[i]);\n    }\n    self._X = null;\n  }\n}\n\nfunction Handler(onFulfilled, onRejected, promise){\n  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;\n  this.onRejected = typeof onRejected === 'function' ? onRejected : null;\n  this.promise = promise;\n}\n\n/**\n * Take a potentially misbehaving resolver function and make sure\n * onFulfilled and onRejected are only called once.\n *\n * Makes no guarantees about asynchrony.\n */\nfunction doResolve(fn, promise) {\n  var done = false;\n  var res = tryCallTwo(fn, function (value) {\n    if (done) return;\n    done = true;\n    resolve(promise, value);\n  }, function (reason) {\n    if (done) return;\n    done = true;\n    reject(promise, reason);\n  });\n  if (!done && res === IS_ERROR) {\n    done = true;\n    reject(promise, LAST_ERROR);\n  }\n}\n\n\n//# sourceURL=webpack://recurly-apple-observe-error/./node_modules/promise/lib/core.js?");

/***/ }),

/***/ "./node_modules/promise/lib/done.js":
/*!******************************************!*\
  !*** ./node_modules/promise/lib/done.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar Promise = __webpack_require__(/*! ./core.js */ \"./node_modules/promise/lib/core.js\");\n\nmodule.exports = Promise;\nPromise.prototype.done = function (onFulfilled, onRejected) {\n  var self = arguments.length ? this.then.apply(this, arguments) : this;\n  self.then(null, function (err) {\n    setTimeout(function () {\n      throw err;\n    }, 0);\n  });\n};\n\n\n//# sourceURL=webpack://recurly-apple-observe-error/./node_modules/promise/lib/done.js?");

/***/ }),

/***/ "./node_modules/promise/lib/es6-extensions.js":
/*!****************************************************!*\
  !*** ./node_modules/promise/lib/es6-extensions.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\n//This file contains the ES6 extensions to the core Promises/A+ API\n\nvar Promise = __webpack_require__(/*! ./core.js */ \"./node_modules/promise/lib/core.js\");\n\nmodule.exports = Promise;\n\n/* Static Functions */\n\nvar TRUE = valuePromise(true);\nvar FALSE = valuePromise(false);\nvar NULL = valuePromise(null);\nvar UNDEFINED = valuePromise(undefined);\nvar ZERO = valuePromise(0);\nvar EMPTYSTRING = valuePromise('');\n\nfunction valuePromise(value) {\n  var p = new Promise(Promise._0);\n  p._V = 1;\n  p._W = value;\n  return p;\n}\nPromise.resolve = function (value) {\n  if (value instanceof Promise) return value;\n\n  if (value === null) return NULL;\n  if (value === undefined) return UNDEFINED;\n  if (value === true) return TRUE;\n  if (value === false) return FALSE;\n  if (value === 0) return ZERO;\n  if (value === '') return EMPTYSTRING;\n\n  if (typeof value === 'object' || typeof value === 'function') {\n    try {\n      var then = value.then;\n      if (typeof then === 'function') {\n        return new Promise(then.bind(value));\n      }\n    } catch (ex) {\n      return new Promise(function (resolve, reject) {\n        reject(ex);\n      });\n    }\n  }\n  return valuePromise(value);\n};\n\nvar iterableToArray = function (iterable) {\n  if (typeof Array.from === 'function') {\n    // ES2015+, iterables exist\n    iterableToArray = Array.from;\n    return Array.from(iterable);\n  }\n\n  // ES5, only arrays and array-likes exist\n  iterableToArray = function (x) { return Array.prototype.slice.call(x); };\n  return Array.prototype.slice.call(iterable);\n}\n\nPromise.all = function (arr) {\n  var args = iterableToArray(arr);\n\n  return new Promise(function (resolve, reject) {\n    if (args.length === 0) return resolve([]);\n    var remaining = args.length;\n    function res(i, val) {\n      if (val && (typeof val === 'object' || typeof val === 'function')) {\n        if (val instanceof Promise && val.then === Promise.prototype.then) {\n          while (val._V === 3) {\n            val = val._W;\n          }\n          if (val._V === 1) return res(i, val._W);\n          if (val._V === 2) reject(val._W);\n          val.then(function (val) {\n            res(i, val);\n          }, reject);\n          return;\n        } else {\n          var then = val.then;\n          if (typeof then === 'function') {\n            var p = new Promise(then.bind(val));\n            p.then(function (val) {\n              res(i, val);\n            }, reject);\n            return;\n          }\n        }\n      }\n      args[i] = val;\n      if (--remaining === 0) {\n        resolve(args);\n      }\n    }\n    for (var i = 0; i < args.length; i++) {\n      res(i, args[i]);\n    }\n  });\n};\n\nPromise.reject = function (value) {\n  return new Promise(function (resolve, reject) {\n    reject(value);\n  });\n};\n\nPromise.race = function (values) {\n  return new Promise(function (resolve, reject) {\n    iterableToArray(values).forEach(function(value){\n      Promise.resolve(value).then(resolve, reject);\n    });\n  });\n};\n\n/* Prototype Methods */\n\nPromise.prototype['catch'] = function (onRejected) {\n  return this.then(null, onRejected);\n};\n\n\n//# sourceURL=webpack://recurly-apple-observe-error/./node_modules/promise/lib/es6-extensions.js?");

/***/ }),

/***/ "./node_modules/promise/lib/finally.js":
/*!*********************************************!*\
  !*** ./node_modules/promise/lib/finally.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar Promise = __webpack_require__(/*! ./core.js */ \"./node_modules/promise/lib/core.js\");\n\nmodule.exports = Promise;\nPromise.prototype.finally = function (f) {\n  return this.then(function (value) {\n    return Promise.resolve(f()).then(function () {\n      return value;\n    });\n  }, function (err) {\n    return Promise.resolve(f()).then(function () {\n      throw err;\n    });\n  });\n};\n\n\n//# sourceURL=webpack://recurly-apple-observe-error/./node_modules/promise/lib/finally.js?");

/***/ }),

/***/ "./node_modules/promise/lib/index.js":
/*!*******************************************!*\
  !*** ./node_modules/promise/lib/index.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nmodule.exports = __webpack_require__(/*! ./core.js */ \"./node_modules/promise/lib/core.js\");\n__webpack_require__(/*! ./done.js */ \"./node_modules/promise/lib/done.js\");\n__webpack_require__(/*! ./finally.js */ \"./node_modules/promise/lib/finally.js\");\n__webpack_require__(/*! ./es6-extensions.js */ \"./node_modules/promise/lib/es6-extensions.js\");\n__webpack_require__(/*! ./node-extensions.js */ \"./node_modules/promise/lib/node-extensions.js\");\n__webpack_require__(/*! ./synchronous.js */ \"./node_modules/promise/lib/synchronous.js\");\n\n\n//# sourceURL=webpack://recurly-apple-observe-error/./node_modules/promise/lib/index.js?");

/***/ }),

/***/ "./node_modules/promise/lib/node-extensions.js":
/*!*****************************************************!*\
  !*** ./node_modules/promise/lib/node-extensions.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\n// This file contains then/promise specific extensions that are only useful\n// for node.js interop\n\nvar Promise = __webpack_require__(/*! ./core.js */ \"./node_modules/promise/lib/core.js\");\nvar asap = __webpack_require__(/*! asap */ \"./node_modules/asap/browser-asap.js\");\n\nmodule.exports = Promise;\n\n/* Static Functions */\n\nPromise.denodeify = function (fn, argumentCount) {\n  if (\n    typeof argumentCount === 'number' && argumentCount !== Infinity\n  ) {\n    return denodeifyWithCount(fn, argumentCount);\n  } else {\n    return denodeifyWithoutCount(fn);\n  }\n};\n\nvar callbackFn = (\n  'function (err, res) {' +\n  'if (err) { rj(err); } else { rs(res); }' +\n  '}'\n);\nfunction denodeifyWithCount(fn, argumentCount) {\n  var args = [];\n  for (var i = 0; i < argumentCount; i++) {\n    args.push('a' + i);\n  }\n  var body = [\n    'return function (' + args.join(',') + ') {',\n    'var self = this;',\n    'return new Promise(function (rs, rj) {',\n    'var res = fn.call(',\n    ['self'].concat(args).concat([callbackFn]).join(','),\n    ');',\n    'if (res &&',\n    '(typeof res === \"object\" || typeof res === \"function\") &&',\n    'typeof res.then === \"function\"',\n    ') {rs(res);}',\n    '});',\n    '};'\n  ].join('');\n  return Function(['Promise', 'fn'], body)(Promise, fn);\n}\nfunction denodeifyWithoutCount(fn) {\n  var fnLength = Math.max(fn.length - 1, 3);\n  var args = [];\n  for (var i = 0; i < fnLength; i++) {\n    args.push('a' + i);\n  }\n  var body = [\n    'return function (' + args.join(',') + ') {',\n    'var self = this;',\n    'var args;',\n    'var argLength = arguments.length;',\n    'if (arguments.length > ' + fnLength + ') {',\n    'args = new Array(arguments.length + 1);',\n    'for (var i = 0; i < arguments.length; i++) {',\n    'args[i] = arguments[i];',\n    '}',\n    '}',\n    'return new Promise(function (rs, rj) {',\n    'var cb = ' + callbackFn + ';',\n    'var res;',\n    'switch (argLength) {',\n    args.concat(['extra']).map(function (_, index) {\n      return (\n        'case ' + (index) + ':' +\n        'res = fn.call(' + ['self'].concat(args.slice(0, index)).concat('cb').join(',') + ');' +\n        'break;'\n      );\n    }).join(''),\n    'default:',\n    'args[argLength] = cb;',\n    'res = fn.apply(self, args);',\n    '}',\n    \n    'if (res &&',\n    '(typeof res === \"object\" || typeof res === \"function\") &&',\n    'typeof res.then === \"function\"',\n    ') {rs(res);}',\n    '});',\n    '};'\n  ].join('');\n\n  return Function(\n    ['Promise', 'fn'],\n    body\n  )(Promise, fn);\n}\n\nPromise.nodeify = function (fn) {\n  return function () {\n    var args = Array.prototype.slice.call(arguments);\n    var callback =\n      typeof args[args.length - 1] === 'function' ? args.pop() : null;\n    var ctx = this;\n    try {\n      return fn.apply(this, arguments).nodeify(callback, ctx);\n    } catch (ex) {\n      if (callback === null || typeof callback == 'undefined') {\n        return new Promise(function (resolve, reject) {\n          reject(ex);\n        });\n      } else {\n        asap(function () {\n          callback.call(ctx, ex);\n        })\n      }\n    }\n  }\n};\n\nPromise.prototype.nodeify = function (callback, ctx) {\n  if (typeof callback != 'function') return this;\n\n  this.then(function (value) {\n    asap(function () {\n      callback.call(ctx, null, value);\n    });\n  }, function (err) {\n    asap(function () {\n      callback.call(ctx, err);\n    });\n  });\n};\n\n\n//# sourceURL=webpack://recurly-apple-observe-error/./node_modules/promise/lib/node-extensions.js?");

/***/ }),

/***/ "./node_modules/promise/lib/synchronous.js":
/*!*************************************************!*\
  !*** ./node_modules/promise/lib/synchronous.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nvar Promise = __webpack_require__(/*! ./core.js */ \"./node_modules/promise/lib/core.js\");\n\nmodule.exports = Promise;\nPromise.enableSynchronous = function () {\n  Promise.prototype.isPending = function() {\n    return this.getState() == 0;\n  };\n\n  Promise.prototype.isFulfilled = function() {\n    return this.getState() == 1;\n  };\n\n  Promise.prototype.isRejected = function() {\n    return this.getState() == 2;\n  };\n\n  Promise.prototype.getValue = function () {\n    if (this._V === 3) {\n      return this._W.getValue();\n    }\n\n    if (!this.isFulfilled()) {\n      throw new Error('Cannot get a value of an unfulfilled promise.');\n    }\n\n    return this._W;\n  };\n\n  Promise.prototype.getReason = function () {\n    if (this._V === 3) {\n      return this._W.getReason();\n    }\n\n    if (!this.isRejected()) {\n      throw new Error('Cannot get a rejection reason of a non-rejected promise.');\n    }\n\n    return this._W;\n  };\n\n  Promise.prototype.getState = function () {\n    if (this._V === 3) {\n      return this._W.getState();\n    }\n    if (this._V === -1 || this._V === -2) {\n      return 0;\n    }\n\n    return this._V;\n  };\n};\n\nPromise.disableSynchronous = function() {\n  Promise.prototype.isPending = undefined;\n  Promise.prototype.isFulfilled = undefined;\n  Promise.prototype.isRejected = undefined;\n  Promise.prototype.getValue = undefined;\n  Promise.prototype.getReason = undefined;\n  Promise.prototype.getState = undefined;\n};\n\n\n//# sourceURL=webpack://recurly-apple-observe-error/./node_modules/promise/lib/synchronous.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./index.js");
/******/ 	
/******/ })()
;