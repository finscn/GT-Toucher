"use strict";

Toucher.TouchButton = Toucher.Listener.extend({

    touchId: null,
    disabled: false,
    touchRegion: null,
    floating: false,

    pressed: false,
    touched: false,

    x: 0,
    y: 0,
    width: 0,
    height: 0,
    enterDown: true,
    leaveUp: true,

    holdDuration: 0,

    visible: true,

    init: function() {
        this.beforeInit();
        this.anchorX = this.width >> 1;
        this.anchorY = this.height >> 1;

        this.updateAABB();

        this.touchRegion = this.touchRegion || this.aabb;

        this.onInit();
    },

    updateAABB: function() {
        this.aabb = [
            this.x - this.anchorX,
            this.y - this.anchorY,
            this.x + this.anchorX,
            this.y + this.anchorY
        ];
    },

    setScale: function(scale) {
        scale = this.scale = scale || 1;
        this.width *= scale;
        this.height *= scale;
        this.anchorX = this.width >> 1;
        this.anchorY = this.height >> 1;
        this.updateAABB();
    },

    filterWrapper: function(type, wrapper, event, controller) {
        return !this.disabled; //true;
    },

    isInTouchRegion: function(x, y) {
        var r = this.touchRegion;
        if (!r) {
            return true;
        }
        return r[0] < x && x < r[2] && r[1] < y && y < r[3];
    },

    checkPointInAABB: function(x, y) {
        var aabb = this.aabb;
        return aabb[0] < x && aabb[1] < y && x < aabb[2] && y < aabb[3];
    },

    enable: function() {
        this.reset();
        this.disabled = false;
    },
    disable: function() {
        this.reset();
        this.disabled = true;
    },
    reset: function() {
        this.disabled = false;
        this.touchId = null;
        this.pressed = false;
        this.touched = false;
        this.entered = false;
        this.holdDuration = 0;
        this.hold = false;
    },
    down: function(wrapper, event, controller) {
        this.realDown = true;
        this.pressed = true;
        this.holdDuration = 1;
        this.hold = true;
        this.onDown();
    },
    onDown: function() {},

    up: function(wrapper, event, controller, out) {
        this.realDown = false;
        this.pressed = false;
        this.onUp(this.holdDuration);
        this.holdDuration = 0;
        this.hold = false;
    },
    onUp: function(holdDuration) {},


    start: function(wrappers, event, controller) {
        if (this.disabled) {
            return;
        }
        for (var i = 0; i < wrappers.length; i++) {
            var w = wrappers[i];
            if (this.touchId === null && this.checkPointInAABB(w.pageX, w.pageY)) {
                this.touchId = w.id;
                this.touched = true;
                this.entered = true;
                break;
            }
        }
    },

    move: function(wrappers, event, controller) {
        if (this.disabled) {
            return;
        }
        if (this.touchId || this.touchId === 0) {
            for (var i = 0; i < wrappers.length; i++) {
                var w = wrappers[i];
                if (this.touchId === w.id) {
                    var hover = this.checkPointInAABB(w.pageX, w.pageY);
                    if (!this.touched && this.enterDown && hover) {
                        this.touched = true;
                        this.entered = true;
                    } else if (this.touched && this.leaveUp && !hover) {
                        this.touchId = null;
                        this.touched = false;
                        this.entered = false;
                    }
                    break;
                }
            }
        } else {
            for (var i = 0; i < wrappers.length; i++) {
                var w = wrappers[i];
                if (this.enterDown && this.checkPointInAABB(w.pageX, w.pageY)) {
                    this.touchId = w.id;
                    this.touched = true;
                    this.entered = true;
                    break;
                }
            }
        }
    },

    end: function(wrappers, event, controller) {
        if (this.disabled) {
            return;
        }
        for (var i = 0; i < wrappers.length; i++) {
            var w = wrappers[i];
            if (this.touchId === w.id) {
                // this.x = 0;
                // this.y = 0;
                this.touchId = null;
                this.touched = false;
                this.entered = this.checkPointInAABB(w.pageX, w.pageY);
                break;
            }
        }
    },

    update: function(timeStep, now) {
        if (this.disabled) {
            return;
        }
        var button = this.touched;
        this.updateButton(button, timeStep, now);
    },

    updateButton: function(button, timeStep, now) {
        var pressed = button;
        this.buttonDown = false;
        this.buttonUp = false;
        if (this.pressed && pressed) {
            this.holdDuration += timeStep;
            this.hold = true;
        } else if (!this.pressed && pressed && !this.realDown) {
            this.buttonDown = true;
            this.down();
        } else if ((this.pressed || this.realDown) && !pressed) {
            this.buttonUp = true;
            this.up();
        } else {
            this.pressed = false;
            this.holdDuration = 0;
            this.hold = false;
        }
    },

    render: function(context, timeStep, now) {
        if (!this.visible) {
            return;
        }
        var r = this.touchRegion;
        if (this.touched) {
            context.fillStyle = "rgba(0,0,0,0.5)";
        } else {
            context.fillStyle = "rgba(0,0,0,0.2)";
        }
        context.fillRect(r[0], r[1], r[2] - r[0], r[3] - r[1]);
    }

});
