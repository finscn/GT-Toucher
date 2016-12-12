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

        for (var property in cfg) {
            this[property] = cfg[property];
        }

        this.wrapperClass = this.wrapperClass || exports.TouchWrapper;
    };

    var proto = {
        constructor: Controller,

        wrapperClass: null,

        host: window,
        dom: document,

        pixelRatio: 1,
        offsetLeft: 0,
        offsetTop: 0,
        canvasWidth: 0,
        canvasHeight: 0,
        orientation: 0,

        offsetX: 0,
        offsetY: 0,

        supportMultiTouch: false,
        useMouse: null,
        useTouch: null,
        useCapture: true,
        preventDefault: false, // is preventDefault All

        ignoreNativeGesture: true,

        preventDefaultStart: false,
        preventDefaultMove: false,
        preventDefaultEnd: false,
        preventDefaultCancel: false,


        touchKeepTime: 30,
        maxTouch: 5,
        startTouches: null,
        moveTouches: null,
        endTouches: null,

        moveTick: 0,
        moveInterval: 0,
        touchCount: 0,
        touchedCount: 0,


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

            var Me = this;
            dom.addEventListener(this.EVENT.START, function(event) {
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
            }, this.useCapture);

            dom.addEventListener(this.EVENT.MOVE, function(event) {
                var now = Date.now();
                if (now - Me.moveTick < Me.moveInterval || Me.beforeMove !== null && Me.beforeMove(event, now) === false) {
                    return;
                }
                Me.moveTick = now;
                Me.onMove(event, now);
                if (Me.preventDefaultMove || Me.preventDefault) {
                    event.preventDefault();
                }
            }, this.useCapture);

            var endFun = function(event) {
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
            dom.addEventListener(this.EVENT.END, endFun, this.useCapture);

            if (this.useMouse === true) {
                window.addEventListener("mouseout", function(event) {
                    Me.touchCount--;
                    var from = event.relatedTarget || event.toElement;
                    if (!from || from.nodeName === "HTML") {
                        endFun(event);
                    }
                    event.preventDefault();
                }, false);
            } else {
                dom.addEventListener(this.EVENT.CANCEL, function(event) {
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
                }, this.useCapture);
            }

            if (this.useMouse === false && this.ignoreNativeGesture) {
                // gesturestart, gesturechange, gestureend
                if ("ongesturestart" in window) {
                    window.addEventListener("gesturestart", function(event) {
                        event.preventDefault();
                    }, false);
                    window.addEventListener("gesturechange", function(event) {
                        event.preventDefault();
                    }, false);
                    window.addEventListener("gestureend", function(event) {
                        event.preventDefault();
                    }, false);
                }
            }

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
                if (listener["cancel"] != null) {
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

                touchWrapper.offsetX = this.offsetX;
                touchWrapper.offsetY = this.offsetY;
                touchWrapper.offsetLeft = this.offsetLeft;
                touchWrapper.offsetTop = this.offsetTop;

                touchWrapper.orientation = this.orientation;
                touchWrapper.canvasWidth = this.canvasWidth;
                touchWrapper.canvasHeight = this.canvasHeight;
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

            var _touched = {};
            if (this.useMouse === false) {
                // TODO : CONST.touches or CONST.targetTouches , it's a question!
                var _touchedList = event[CONST.touches];
                for (var j = _touchedList.length - 1; j >= 0; j--) {
                    var t = _touchedList[j];
                    _touched[t.identifier] = true;
                }
            }

            var endWrappers = [];
            for (var i = 0, len = changedList.length; i < len; i++) {
                var touch = changedList[i];
                var id = touch.identifier;
                var touchId = id || id === 0 ? id : CONST.defaultTouchId;

                if (!_touched[touchId]) {
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
                if (listener[type] != null) {
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
        }

    };

    for (var p in proto) {
        Controller.prototype[p] = proto[p];
    }

    exports.Controller = Controller;
    exports.CONST = CONST;

}(Toucher));
