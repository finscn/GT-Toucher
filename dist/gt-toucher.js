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

    };

    var proto = {
        constructor: Controller,

        initialize: function() {
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
            this.useOnce = false;

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

            var passiveSupported = false;
            try {
                var options = Object.defineProperty({}, "passive", {
                    get: function() {
                        passiveSupported = true;
                    }
                });
                window.addEventListener("__test__", null, options);
            } catch (err) {}
            this.passiveSupported = passiveSupported;

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

            var options;
            if (this.passiveSupported) {
                options = {
                    capture: this.useCapture,
                    passive: this.usePassive,
                    once: this.useOnce,
                }
            } else {
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
                    Me.preventEventDefault(event);
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
                    Me.preventEventDefault(event);
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
                    Me.preventEventDefault(event);
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
                    Me.preventEventDefault(event);
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
                        Me.preventEventDefault(event);
                    }
                };
                dom.addEventListener(this.EVENT.CANCEL, this._cancelHook, options);
            }

            if (this.useMouse === false && this.ignoreNativeGesture) {
                // gesturestart, gesturechange, gestureend
                if ("ongesturestart" in window) {
                    this._gestureHook = function(event) {
                        Me.preventEventDefault(event);
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

        addEventListener: function(dom, type, listener, options) {
            if (!this.passiveSupported) {
                options = options.useCapture;
            }
            dom.addEventListener(type, listener, options);
        },
        removeEventListener: function(dom, type, listener, options) {
            if (!this.passiveSupported) {
                options = options.useCapture;
            }
            dom.removeEventListener(type, listener, options);
        },

        preventEventDefault: function(event) {
            if (event.cancelable || !("cancelable" in event)) {
                event.preventDefault();
                return true;
            }
            return false;
        },

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
            var TouchWrapper = exports.TouchWrapper;

            var changedList = event[CONST.changedTouches] || [event];
            var startWrappers = [];
            for (var i = 0, len = changedList.length; i < len; i++) {
                var touch = changedList[i];
                var id = touch.identifier;
                var touchId = id || id === 0 ? id : CONST.defaultTouchId;

                var touchWrapper = this.touched[touchId];
                touchWrapper = TouchWrapper.getInstance(touchId);
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

"use strict";

var Toucher = Toucher || {};

(function(exports) {

    var CONST = exports.CONST;

    var TouchWrapper = function(identifier) {
        this.init(identifier);
    };

    TouchWrapper.pool = [];
    TouchWrapper.poolCursor = 0;
    TouchWrapper.initPool = function(size) {
        TouchWrapper.pool.length = 0;
        for (var i = 0; i < size; i++) {
            TouchWrapper.pool[i] = new TouchWrapper(0);
        }
    };
    TouchWrapper.getInstance = function(identifier) {
        var item = TouchWrapper.pool[TouchWrapper.poolCursor];
        TouchWrapper.poolCursor++;
        if (TouchWrapper.poolCursor >= TouchWrapper.pool.length) {
            TouchWrapper.poolCursor = 0;
        }
        item.init(identifier)
        return item;
    };

    var proto = {
        constructor: TouchWrapper,

        init: function(identifier) {
            identifier = identifier || 0;

            this.pixelRatio = 1;
            this.offsetLeft = 0;
            this.offsetTop = 0;
            this.orientation = 0;

            this.offsetX = 0;
            this.offsetY = 0;

            this.identifier = identifier;
            this.id = identifier;

            this.updateTime = -1;
            this.startTime = -1;
            this.moveTime = -1;
            this.endTime = -1;
        },

        start: function(rawTouch, rawEvent) {

            this.type = this.EVENT.START;

            this.update(rawTouch, rawEvent);

            this.startPageX = this.lastPageX = this.pageX;
            this.startPageY = this.lastPageY = this.pageY;
            this.startTarget = this.lastTarget = this.target;

            // this.startClientX = this.lastClientX = this.clientX;
            // this.startClientY = this.lastClientY = this.clientY;

            this.deltaX = 0;
            this.deltaY = 0;
            this.moveAmountX = 0;
            this.moveAmountY = 0;

            this.touching = true;
            this.startTime = this.moveTime = this.endTime = this.updateTime;
        },

        move: function(rawTouch, rawEvent) {

            this.type = this.EVENT.MOVE;

            this.lastMoveTime = this.moveTime;

            this.update(rawTouch, rawEvent);

            this.moveTime = this.updateTime;
        },

        end: function(rawTouch, rawEvent) {

            this.type = this.EVENT.END;

            var deltaX = this.deltaX;
            var deltaY = this.deltaY;

            this.update(rawTouch, rawEvent);

            this.deltaX = deltaX;
            this.deltaY = deltaY;
            this.endPageX = this.pageX;
            this.endPageY = this.pageY;
            this.endTarget = this.target;

            // this.endClientX = this.clientX;
            // this.endClientY = this.clientY;

            this.touching = false;
            this.endTime = this.updateTime;
        },

        update: function(rawTouch, rawEvent) {

            this.rawEvent = rawEvent;
            this.rawTouch = rawTouch;

            this.lastTarget = this.target;
            this.lastPageX = this.pageX;
            this.lastPageY = this.pageY;
            // this.lastClientX = this.clientX;
            // this.lastClientY = this.clientY;

            this.target = rawTouch.target || rawEvent.target;

            var px = rawTouch.pageX;
            var py = rawTouch.pageY;

            var x, y;
            if (this.orientation === 0) {
                x = px - this.offsetLeft;
                y = py - this.offsetTop;
            } else if (this.orientation === -90) {
                x = this.pageHeight - py;
                y = px - this.offsetLeft;
            } else if (this.orientation === 90) {
                x = py - this.offsetTop;
                y = this.pageWidth - px;
            } else if (this.orientation === 180) {
                x = this.pageWidth - px;
                y = this.pageHeight - py;
            } else {
                // orientation === 0
                x = px - this.offsetLeft;
                y = py - this.offsetTop;
            }

            this.pageX = x * this.pixelRatio;
            this.pageY = y * this.pixelRatio;

            // if (this.type === this.EVENT.START) {
            //     console.log("controller ", this.orientation, this.pixelRatio, this.pageWidth, this.pageHeight);
            //     console.log("     ", px, py);
            //     console.log("  after ", this.pageX, this.pageY);
            //     console.log("     ", this.offsetX, this.offsetY);
            //     console.log("     ", this.offsetLeft, this.offsetTop);
            // }

            this.pageX -= this.offsetX;
            this.pageY -= this.offsetY;

            // this.clientX = rawTouch.clientX * this.pixelRatio;
            // this.clientY = rawTouch.clientY * this.pixelRatio;

            this.deltaX = this.pageX - this.lastPageX;
            this.deltaY = this.pageY - this.lastPageY;
            this.moveAmountX = this.pageX - this.startPageX;
            this.moveAmountY = this.pageY - this.startPageY;

            this.updateTime = Date.now();
        },

        getData: function() {
            var data = {};

            data.touching = this.touching;
            data.type = this.type;
            data.updateTime = this.updateTime;
            data.startTime = this.startTime;
            data.moveTime = this.moveTime;
            data.endTime = this.endTime;

            data.startPageX = this.startPageX;
            data.startPageY = this.startPageY;
            data.pageX = this.pageX;
            data.pageY = this.pageY;
            data.endPageX = this.endPageX;
            data.endPageY = this.endPageY;

            data.deltaX = this.deltaX;
            data.deltaY = this.deltaY;
            data.moveAmountX = this.moveAmountX;
            data.moveAmountY = this.moveAmountY;

            return data;
        }

    };

    for (var p in proto) {
        TouchWrapper.prototype[p] = proto[p];
    }

    TouchWrapper.initPool(20);

    exports.TouchWrapper = TouchWrapper;

})(Toucher);

"use strict";

var Toucher = Toucher || {};

(function(exports) {

    var CONST = exports.CONST;

    var Listener = function(options) {
        for (var property in options) {
            this[property] = options[property];
        }
    };

    // Use duck-type, GT-Toucher doesn't care the result of "instanceof"
    /* Use to create your custom-listener */
    Listener.extend = function(prototype) {
        var subclass = function(options) {
            for (var property in options) {
                this[property] = options[property];
            }
        };
        var cp = subclass.prototype;
        var sp = this.prototype;
        for (var p in sp) {
            cp[p] = sp[p];
        }
        for (var p in prototype) {
            cp[p] = prototype[p];
        }
        cp.constructor = subclass;
        subclass.extend = this.extend;
        subclass.$super = sp;
        subclass.superclass = this;
        return subclass;
    };

    var proto = {
        constructor: Listener,

        id: null,
        type: null,

        order: 1,
        multi: 1,

        beforeInit: function() {},
        init: function() {
            this.beforeInit();

            // ... ...

            this.onInit();
        },
        onInit: function() {},

        reset: function() {
            /* Implement by user */
        },

        // triggerEvent: function(eventName, wrappers, event, controller) {
        //     if (!this[eventName]) {
        //         return;
        //     }
        //     var index = 0;
        //     var count = Math.min(wrappers.length, this.multi);
        //     for (var i = 0; i < count; i++) {
        //         var wrapper = wrappers[i];
        //         var x = wrapper.pageX;
        //         var y = wrapper.pageY;
        //         wrapper.index = index++;
        //         this[eventName](x, y, wrapper, event, controller);
        //     }
        // },

        /* Could be overridden by user */
        filterWrappers: function(type, wrappers, event, controller) {
            var validWrappers = [];
            for (var i = 0, len = wrappers.length; i < len; i++) {
                var wrapper = wrappers[i];
                if (this.filterWrapper(type, wrapper, event, controller)) {
                    validWrappers.push(wrapper)
                }
            }
            return validWrappers;
        },

        /* Implement by user */
        filterWrapper: function(type, wrapper, event, controller) {
            return false;
        },

        /* Implement by user */

        // function(vaildWrappers, event, controller){ }
        "start": null,
        // function(x, y, wrapper, event, controller){ }
        onTouchStart: null,

        // function(vaildWrappers, event, controller){ }
        "move": null,
        // function(x, y, wrapper, event, controller){ }
        onTouchMove: null,

        // function(vaildWrappers, event, controller){ }
        "end": null,
        // function(x, y, wrapper, event, controller){ }
        onTouchEnd: null,

        "cancel": null,
        // function(null<wrapper>, event, controller){ }
        onTouchCancel: null,

    };


    for (var p in proto) {
        Listener.prototype[p] = proto[p];
    }

    exports.Listener = Listener;

})(Toucher);

"use strict";

Toucher.Any = Toucher.Listener.extend({

    filterWrapper: function(type, wrappers, event, controller) {
        return true;
    },

    "start": function(wrappers, event, controller) {

    },

    "move": function(wrappers, event, controller) {

    },

    "end": function(wrappers, event, controller) {

    },

    "cancel": function(wrappers, event, controller) {

    },

});

"use strict";

Toucher.Tap = Toucher.Listener.extend({

    maxTimeLag: 800,
    maxDistance: 15,

    /* Could be overridden by user */
    filterWrapper: function(type, wrapper, event, controller) {
        return true;
    },
    /* Implement by user */
    onTap: function(x, y, wrapper, event, controller) {

    },
    /* Implement by user */
    onTouchStart: null,
    /* Implement by user */
    onTouchEnd: null,

    checkMoveDistance: function(wrapper) {
        var dx = Math.abs(wrapper.moveAmountX);
        var dy = Math.abs(wrapper.moveAmountY);
        return dx <= this.maxDistance && dy <= this.maxDistance;
    },

    checkTimeLag: function(wrapper) {
        return wrapper.endTime - wrapper.startTime < this.maxTimeLag;
    },

    "start": function(wrappers, event, controller) {
        if (!this.onTouchStart) {
            return;
        }
        var count = Math.min(wrappers.length, this.multi);
        for (var i = 0; i < count; i++) {
            var wrapper = wrappers[i];
            var x = wrapper.pageX;
            var y = wrapper.pageY;
            this.onTouchStart(x, y, wrapper, event, controller);
        }
    },

    "end": function(wrappers, event, controller) {
        var index = 0;
        var count = Math.min(wrappers.length, this.multi);
        for (var i = 0; i < count; i++) {
            var wrapper = wrappers[i];
            var x = wrapper.endPageX;
            var y = wrapper.endPageY;
            if (this.checkMoveDistance(wrapper) && this.checkTimeLag(wrapper)) {
                wrapper.index = index++;
                this.onTap(x, y, wrapper, event, controller);
            }
            if (this.onTouchEnd) {
                this.onTouchEnd(x, y, wrapper, event, controller);
            }
        }
    },


});

"use strict";

Toucher.Pan = Toucher.Listener.extend({

    valid: false,

    /* Could be overridden by user */
    filterWrapper: function(type, wrapper, event, controller) {
        return true;
    },
    /* Implement by user */
    onPan: function(dx, dy, x, y, wrapper, event, controller) {

    },

    "move": function(wrappers, event, controller) {
        var index = 0;
        var count = Math.min(wrappers.length, this.multi);
        for (var i = 0; i < count; i++) {
            var wrapper = wrappers[i];
            var dx = wrapper.deltaX;
            var dy = wrapper.deltaY;
            var x = wrapper.pageX;
            var y = wrapper.pageY;
            wrapper.index = index++;
            this.onPan(dx, dy, x, y, wrapper, event, controller);
        }
    },


});

"use strict";

Toucher.Swipe = Toucher.Listener.extend({

    minDistance: 50,
    maxTime: 1000,

    /* Could be overridden by user */
    filterWrapper: function(type, wrapper, event, controller) {
        return true;
    },
    /* Implement by user */
    onSwipe: function(velX, velY, wrapper, event, controller) {

    },
    /* Implement by user */
    onTouchEnd: null,

    "end": function(wrappers, event, controller) {
        var index = 0;
        var count = Math.min(wrappers.length, this.multi);
        for (var i = 0; i < count; i++) {
            var wrapper = wrappers[i];
            var x = wrapper.endPageX;
            var y = wrapper.endPageY;

            var time = (wrapper.endTime - wrapper.startTime);
            if (time <= this.maxTime) {
                var disX = (x - wrapper.startPageX);
                var disY = (y - wrapper.startPageY);
                if (Math.abs(disX) >= this.minDistance || Math.abs(disY) >= this.minDistance) {
                    var velX = disX / time;
                    var velY = disY / time;
                    wrapper.index = index++;
                    this.onSwipe(velX, velY, wrapper, event, controller);
                }
            }

            if (this.onTouchEnd) {
                this.onTouchEnd(x, y, wrapper, event, controller);
            }
        }
    },


});

"use strict";

Toucher.Pinch = Toucher.Listener.extend({

    touchA: null,
    touchB: null,
    startDistance: null,

    /* Could be overridden by user */
    filterWrapper: function(type, wrapper, event, controller) {
        return true;
    },
    /* Implement by user */
    onPinch: function(distance, lastDistance, startDistance, centerPoint, wrappers, event, controller) {

    },
    onPinchEnd: null,

    "start": function(wrappers, event, controller) {
        for (var i = 0; i < wrappers.length; i++) {
            var wrapper = wrappers[i];
            if (!this.touchA) {
                this.touchA = wrapper;
            } else if (!this.touchB) {
                this.touchB = wrapper;
            } else {
                break;
            }
        }
        if (this.touchA && this.touchB) {
            var disX = (this.touchB.startPageX - this.touchA.startPageX);
            var disY = (this.touchB.startPageY - this.touchA.startPageY);
            this.startDistance = Math.sqrt(disX * disX + disY * disY);
            this.centerX = (this.touchA.startPageX + this.touchB.startPageX) >> 1;
            this.centerY = (this.touchA.startPageY + this.touchB.startPageY) >> 1;
        }
    },

    "move": function(wrappers, event, controller) {
        var touchA = this.touchA,
            touchB = this.touchB;
        if (!touchA || !touchB) {
            return;
        }

        var disX = (touchB.lastPageX - touchA.lastPageX);
        var disY = (touchB.lastPageY - touchA.lastPageY);
        var lastDistance = Math.sqrt(disX * disX + disY * disY);

        var disX = (touchB.pageX - touchA.pageX);
        var disY = (touchB.pageY - touchA.pageY);
        var distance = Math.sqrt(disX * disX + disY * disY);

        this.onPinch(distance, lastDistance, this.startDistance, [this.centerX, this.centerY], [touchA, touchB], event, controller);
    },

    "end": function(wrappers, event, controller) {
        for (var i = 0; i < wrappers.length; i++) {
            var wrapper = wrappers[i];
            if (this.touchA && this.touchA.id === wrapper.id) {
                this.touchA = null;
            } else if (this.touchB && this.touchB.id === wrapper.id) {
                this.touchB = null;
            } else {
                break;
            }
        }
        if (!this.touchA || !this.touchB) {
            this.startDistance = null;
            if (this.onPinchEnd) {
                this.onPinchEnd(wrappers, event, controller);
            }
        }
    },

    "cancel": function(wrappers, event, controller) {
        this.touchA = null;
        this.touchB = null;
        this.startDistance = null;
    },

});

"use strict";

Toucher.Rotate = Toucher.Listener.extend({

    touchA: null,
    touchB: null,
    startDistance: -1,

    /* Could be overridden by user */
    filterWrapper: function(type, wrapper, event, controller) {
        return true;
    },
    /* Implement by user */
    onRotate: function(currentDistance, startDistance, wrappers, event, controller) {

    },

    "start": function(wrappers, event, controller) {
        for (var i = 0; i < wrappers.length; i++) {
            var wrapper = wrappers[i];
            if (!this.touchA) {
                this.touchA = wrapper;
            } else if (!this.touchB) {
                this.touchB = wrapper;
            } else {
                break;
            }
        }
        if (this.touchA && this.touchB) {
            var disX = (this.touchB.startPageX - this.touchA.startPageX);
            var disY = (this.touchB.startPageY - this.touchA.startPageY);
            this.startAngle = Math.atan2(disY, disX);
        }
    },

    "move": function(wrappers, event, controller) {
        var touchA = this.touchA,
            touchB = this.touchB;
        if (!touchA || !touchB) {
            return;
        }

        var disX = (touchB.pageX - touchA.pageX);
        var disY = (touchB.pageY - touchA.pageY);
        var currentAngle = Math.atan2(disY, disX);

        this.onRotate(currentAngle, this.startAngle, [touchA, touchB], event, controller);
    },

    "end": function(wrappers, event, controller) {
        for (var i = 0; i < wrappers.length; i++) {
            var wrapper = wrappers[i];
            if (this.touchA && this.touchA.id === wrapper.id) {
                this.touchA = null;
            } else if (this.touchB && this.touchB.id === wrapper.id) {
                this.touchB = null;
            } else {
                break;
            }
        }
        if (!this.touchA || !this.touchB) {
            this.startAngle = null;
        }
    },

    "cancel": function(wrappers, event, controller) {
        this.touchA = null;
        this.touchB = null;
        this.startAngle = null;
    },


});

if(typeof module !== "undefined"&&module){module.exports = Toucher;}
