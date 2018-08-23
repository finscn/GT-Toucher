"use strict";

var Toucher = Toucher || {};

(function(exports) {

    // var TouchWrapper = exports.TouchWrapper;

    var CONST = {};
    CONST.EVENT_LIST = ["touches", "changedTouches", "targetTouches"];
    CONST.touches = "touches";
    CONST.changedTouches = "changedTouches";
    CONST.targetTouches = "targetTouches";
    CONST.defaultTouchId = 1;

    var Controller = function(cfg) {
        this.initialize();

        for (var property in cfg) {
            this[property] = cfg[property];
        }

        this.wrapperClass = this.wrapperClass || exports.TouchWrapper;
    };

    var proto = {
        constructor: Controller,

        initialize: function() {
            this.wrapperClass = null;

            this.host = window;
            this.dom = document;

            this.pixelRatio = 1;
            this.offsetLeft = 0;
            this.offsetTop = 0;
            this.canvasWidth = 0;
            this.canvasHeight = 0;
            this.orientation = 0;

            this.offsetX = 0;
            this.offsetY = 0;

            this.supportMultiTouch = false;
            this.useMouse = null;
            this.useTouch = null;

            this.useCapture = true;
            this.usePassive = false;

            // is preventDefault All
            this.preventDefault = false;

            this.ignoreNativeGesture = true;

            this.preventDefaultStart = false;
            this.preventDefaultMove = false;
            this.preventDefaultEnd = false;
            this.preventDefaultCancel = false;


            this.touchKeepTime = 30;
            this.maxTouch = 5;
            this.startTouches = null;
            this.moveTouches = null;
            this.endTouches = null;

            this.moveTick = 0;
            this.moveInterval = 0;
            this.touchCount = 0;
            this.touchedCount = 0;
        },


        beforeInit: function() {},
        init: function() {

            this.listenerList = [];
            this.EVENT = {};

            this.reset();

            this.beforeInit();

            this.supportMultiTouch = "ontouchstart" in this.dom;
            if (this.supportMultiTouch && this.useTouch !== false) {
                this.useTouch = true;
            } else {
                this.useTouch = false;
            }
            if (!this.supportMultiTouch && this.useMouse !== false) {
                this.useMouse = true;
            } else {
                this.useMouse = false;
            }

            if (this.useTouch === false && this.useMouse === false) {
                return;
            }

            if (this.useMouse === true) {
                // this.EVENT.NOT_START = null;
                this.EVENT.START = "mousedown";
                this.EVENT.MOVE = "mousemove";
                this.EVENT.END = "mouseup";
                // no mouse cancel
                this.EVENT.CANCEL = null;
            } else {
                // this.EVENT.NOT_START = null;
                this.EVENT.START = "touchstart";
                this.EVENT.MOVE = "touchmove";
                this.EVENT.END = "touchend";
                this.EVENT.CANCEL = "touchcancel";
            }

            var dom = this.dom;

            this.pageWidth = dom.clientWidth;
            this.pageHeight = dom.clientHeight;

            var Me = this;

            var options = {
                capture: this.useCapture,
                passive: this.usePassive,
            };
            var passiveSupported = false;
            try {
                var options = Object.defineProperty({}, "passive", {
                    get: function() {
                        passiveSupported = true;
                    }
                });
                window.addEventListener("__test__", null, options);
            } catch (err) {}
            if (!passiveSupported) {
                options = this.useCapture;
            }

            this._startHook = function(event) {
                Me.touchCount++;
                var now = Date.now();
                if (Me.useMouse === true) {
                    Me.reset();
                }
                if (Me.beforeStart !== null && Me.beforeStart(event, now) === false) {
                    return;
                }
                Me.onStart(event, now);
                if (Me.preventDefaultStart || Me.preventDefault) {
                    event.preventDefault();
                }
            };
            dom.addEventListener(this.EVENT.START, this._startHook, options);

            this._moveHook = function(event) {
                var now = Date.now();
                if (now - Me.moveTick < Me.moveInterval || Me.beforeMove !== null && Me.beforeMove(event, now) === false) {
                    return;
                }
                Me.moveTick = now;
                Me.onMove(event, now);
                if (Me.preventDefaultMove || Me.preventDefault) {
                    event.preventDefault();
                }
            };
            dom.addEventListener(this.EVENT.MOVE, this._moveHook, options);

            this._endHook = function(event) {
                Me.touchCount--;
                var now = Date.now();
                if (Me.beforeEnd !== null && Me.beforeEnd(event, now) === false) {
                    return;
                }
                Me.onEnd(event, now);
                if (Me.preventDefaultEnd || Me.preventDefault) {
                    event.preventDefault();
                }
            };
            dom.addEventListener(this.EVENT.END, this._endHook, options);

            if (this.useMouse === true) {
                this._outHook = function(event) {
                    Me.touchCount--;
                    var from = event.relatedTarget || event.toElement;
                    if (!from || from.nodeName === "HTML") {
                        Me._endHook(event);
                    }
                    event.preventDefault();
                };
                // TODO:
                //   window / dom ?
                //   options.capture = true/false ?
                window.addEventListener("mouseout", this._outHook, options);
            } else {
                this._cancelHook = function(event) {
                    console.log("===== " + Me.EVENT.CANCEL + " =====");
                    Me.touchCount--;
                    var now = Date.now();
                    if (Me.beforeCancel !== null && Me.beforeCancel(event) === false) {
                        return;
                    }
                    // Me.reset();
                    Me.onCancel(event, now);
                    if (Me.preventDefaultCancel || Me.preventDefault) {
                        event.preventDefault();
                    }
                };
                dom.addEventListener(this.EVENT.CANCEL, this._cancelHook, options);
            }

            if (this.useMouse === false && this.ignoreNativeGesture) {
                // gesturestart, gesturechange, gestureend
                if ("ongesturestart" in window) {
                    this._gestureHook = function(event) {
                        event.preventDefault();
                    };
                    window.addEventListener("gesturestart", this._gestureHook, true);
                    window.addEventListener("gesturechange", this._gestureHook, true);
                    window.addEventListener("gestureend", this._gestureHook, true);
                }
            }

            this.updateDomOffset();

            this.onInit();
        },
        onInit: function() {},

        reset: function() {

            this.startTouches = [];
            this.moveTouches = [];
            this.endTouches = [];

            this.startTouches.lastTime = this.moveTouches.lastTime = this.endTouches.lastTime = 0;

            this.touched = {};
            this.touchedCount = 0;

            for (var i = 0, len = this.listenerList.length; i < len; i++) {
                var listener = this.listenerList[i];
                listener.reset();
            }
        },

        updateDomOffset: function(dom) {
            var dom = this.dom;
            var offsetLeft = 0,
                offsetTop = 0;
            if (dom === window || dom === document) {
                offsetLeft = window.pageXOffset || 0;
                offsetTop = window.pageYOffset || 0;
            } else if (dom.getBoundingClientRect !== undefined) {
                var x = window.pageXOffset,
                    y = 0;
                if (x || x === 0) {
                    y = window.pageYOffset;
                } else {
                    x = document.body.scrollLeft || 0;
                    y = document.body.scrollTop || 0;
                }
                var rect = dom.getBoundingClientRect();
                offsetLeft = rect.left + x;
                offsetTop = rect.top + y;
            } else {
                var left = dom.offsetLeft || 0,
                    top = dom.offsetTop || 0;
                while ((dom = dom.parentNode) && dom !== document.body && dom !== document) {
                    left += dom.offsetLeft || 0;
                    top += dom.offsetTop || 0;
                }
                offsetLeft = left;
                offsetTop = top;
            }
            this.offsetLeft = offsetLeft;
            this.offsetTop = offsetTop;
        },

        beforeStart: null,
        onStart: function(event, now) {
            var wrappers = this.getStartWrappers(event, now);
            this.dispatch("start", wrappers, event);
        },

        beforeMove: null,
        onMove: function(event, now) {
            var wrappers = this.getMoveWrappers(event, now);
            this.dispatch("move", wrappers, event);
        },

        beforeEnd: null,
        onEnd: function(event, now) {
            var wrappers = this.getEndWrappers(event, now);
            this.dispatch("end", wrappers, event);
        },

        beforeCancel: null,
        onCancel: function(event, now) {
            // this.dispatch("cancel",[],event);
            // console.log("cancel", this.listenerList.length)
            for (var i = 0, len = this.listenerList.length; i < len; i++) {
                var listener = this.listenerList[i];
                if (listener["cancel"]) {
                    if (listener["cancel"](null, event, this) === false) {
                        break;
                    }
                }
            }
        },

        addTouches: function(queue, item) {
            if (queue.length >= this.maxTouch) {
                queue.shift();
            }
            queue.push(item);
        },

        removeFromTouches: function(queue, item) {
            if (queue.length >= this.maxTouch) {
                queue.shift();
            }
            queue.push(item);
        },

        getStartWrappers: function(event, now) {
            var changedList = event[CONST.changedTouches] || [event];

            var startWrappers = [];
            for (var i = 0, len = changedList.length; i < len; i++) {
                var touch = changedList[i];
                var id = touch.identifier;
                var touchId = id || id === 0 ? id : CONST.defaultTouchId;

                var touchWrapper = this.touched[touchId];
                touchWrapper = new this.wrapperClass(touchId);
                touchWrapper.pixelRatio = this.pixelRatio;
                touchWrapper.orientation = this.orientation;

                touchWrapper.pageWidth = this.pageWidth;
                touchWrapper.pageHeight = this.pageHeight;

                touchWrapper.offsetX = this.offsetX;
                touchWrapper.offsetY = this.offsetY;
                touchWrapper.offsetLeft = this.offsetLeft;
                touchWrapper.offsetTop = this.offsetTop;

                touchWrapper.EVENT = this.EVENT;

                this.touched[touchId] = touchWrapper;
                this.touchedCount++;
                touchWrapper["start"](touch, event);
                startWrappers.push(touchWrapper);

                var _touches = this.startTouches;
                if (now - _touches.lastTime > this.touchKeepTime) {
                    _touches.length = 0;
                }
                _touches.lastTime = now;
                _touches.push(touchWrapper);
            }
            return startWrappers;
        },

        getMoveWrappers: function(event, now) {
            var changedList = event[CONST.changedTouches] || [event];

            var moveWrappers = [];
            for (var i = 0, len = changedList.length; i < len; i++) {
                var touch = changedList[i];
                var id = touch.identifier;
                var touchId = id || id === 0 ? id : CONST.defaultTouchId;

                var touchWrapper = this.touched[touchId];
                if (touchWrapper) {

                    if (!touchWrapper.moveTime) {
                        var _touches = this.moveTouches;
                        if (now - _touches.lastTime > this.touchKeepTime) {
                            _touches.length = 0;
                        }
                        _touches.lastTime = now;
                        _touches.push(touchWrapper);
                    }

                    touchWrapper["move"](touch, event);
                    moveWrappers.push(touchWrapper);
                }
            }
            return moveWrappers;
        },

        getEndWrappers: function(event, now) {
            var changedList = event[CONST.changedTouches] || [event];

            // var _touched = {};
            // if (this.useMouse === false) {
            //     // TODO : CONST.touches or CONST.targetTouches , it's a question!
            //     var _touchedList = event[CONST.touches];
            //     for (var j = _touchedList.length - 1; j >= 0; j--) {
            //         var t = _touchedList[j];
            //         _touched[t.identifier] = true;
            //     }
            // }

            var endWrappers = [];
            for (var i = 0, len = changedList.length; i < len; i++) {
                var touch = changedList[i];
                var id = touch.identifier;
                var touchId = id || id === 0 ? id : CONST.defaultTouchId;

                // if (_touched[touchId]) {
                //     continue;
                // }
                var touchWrapper = this.touched[touchId];
                if (touchWrapper) {

                    touchWrapper["end"](touch, event);

                    delete this.touched[touchId];
                    this.touchedCount--;

                    endWrappers.push(touchWrapper);

                    var _touches = this.endTouches;
                    if (now - _touches.lastTime > this.touchKeepTime) {
                        _touches.length = 0;
                    }
                    _touches.lastTime = now;
                    _touches.push(touchWrapper);
                    this.removeWrapper(this.startTouches, touchId);
                    this.removeWrapper(this.moveTouches, touchId);
                }
            }

            return endWrappers;
        },

        removeWrapper: function(list, id) {
            for (var i = list.length - 1; i >= 0; i--) {
                if (list[i].identifier === id) {
                    list.splice(i, 1);
                    return id;
                }
            }
            return false;
        },

        dispatch: function(type, wrappers, event) {
            for (var i = 0, len = this.listenerList.length; i < len; i++) {
                var listener = this.listenerList[i];
                if (listener[type]) {
                    var validWrappers = listener.filterWrappers(type, wrappers, event, this);
                    if (validWrappers === true) {
                        validWrappers = wrappers;
                    }
                    if (validWrappers && validWrappers.length > 0) {
                        if (listener[type](validWrappers, event, this) === false) {
                            break;
                        }
                    }
                }
            }
        },

        addListener: function(listener) {
            listener.controller = this;
            listener.init();
            this.listenerList.push(listener);
            // TODO : order by listener.order
            listener.order = listener.order || 0;
        },

        removeListener: function(listener) {
            for (var i = this.listenerList.length - 1; i >= 0; i--) {
                if (this.listenerList[i] === listener) {
                    this.listenerList.splice(i, 1);
                    listener.controller = null;
                    return listener;
                }
            }
            return null;
        },

        removeAllListeners: function() {
            for (var i = this.listenerList.length - 1; i >= 0; i--) {
                var listener = this.listenerList[i];
                listener.controller = null;
            }
            this.listenerList.length = 0;
        },

        destroy: function() {
            this.reset();
            this.removeAllListeners();
            var dom = this.dom;
            dom.removeEventListener(this.EVENT.START, this._startHook, this.useCapture);
            dom.removeEventListener(this.EVENT.MOVE, this._moveHook, this.useCapture);
            dom.removeEventListener(this.EVENT.END, this._endHook, this.useCapture);
            dom.removeEventListener(this.EVENT.CANCEL, this._cancelHook, this.useCapture);
            window.removeEventListener("mouseout", this._outHook, false);
            window.removeEventListener("gesturestart", this._gestureHook, false);
            window.removeEventListener("gesturechange", this._gestureHook, false);
            window.removeEventListener("gestureend", this._gestureHook, false);
        }

    };

    for (var p in proto) {
        Controller.prototype[p] = proto[p];
    }

    exports.Controller = Controller;
    exports.CONST = CONST;

}(Toucher));
