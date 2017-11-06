"use strict";

Toucher.TouchStick = Toucher.TouchButton.extend({

    rad: 0,
    cos: 1,
    sin: 0,

    x: 0,
    y: 0,
    defaultX: null,
    defaultY: null,

    moveX: 0,
    moveY: 0,
    moveRadius: 0,
    distance: 0,

    stickRadius: 35,
    minMoveRadius: 0, // scale
    maxMoveRadius: 100, // scale

    wayCount: 0, // 0 or null ==> full-ways

    followSpeed: 0, // scale
    followDistance: 0, // scale

    sensitive: false,
    strength: 0,
    scale: 1,

    touchRegion: null,

    warningEdge: 0,

    bgColor: "rgba(0,0,0,0.5)",
    centerColor: "rgba(255,100,100,0.2)",
    stickColor: "rgba(0,0,0,0.2)",

    init: function() {
        this.beforeInit();

        this.setScale(this.scale);

        this.onInit();
    },

    updateConfig: function() {
        if (this.wayCount) {
            this.wayRad = Math.PI * 2 / this.wayCount;
        }
        if (this.followSpeed) {
            this.followDistance = Math.max(this.maxMoveRadius, this.followDistance);
        }
    },

    setScale: function(scale) {
        scale = this.scale = scale || 1;
        this.stickRadius *= scale;
        this.minMoveRadius *= scale;
        this.maxMoveRadius *= scale;
        this.followSpeed *= scale;
        this.followDistance *= scale;
        this.updateConfig();
    },

    isInTouchRegion: function(x, y) {
        var r = this.touchRegion;
        if (!r) {
            return true;
        }
        return r[0] < x && x < r[2] && r[1] < y && y < r[3];
    },

    start: function(wrappers, event, controller) {
        if (this.disabled) {
            return;
        }
        for (var i = 0; i < wrappers.length; i++) {
            var w = wrappers[i];
            if (this.touchId === null && this.isInTouchRegion(w.pageX, w.pageY)) {
                this.touchId = w.id;
                this.touched = true;
                this.pageX = w.pageX;
                this.pageY = w.pageY;
                if (this.floating) {
                    this.x = w.startPageX;
                    this.y = w.startPageY;
                } else {
                    this.updateMove();
                }
                break;
            }
        }
    },

    move: function(wrappers, event, controller) {
        if (this.disabled || this.touchId === null) {
            return;
        }
        for (var i = 0; i < wrappers.length; i++) {
            var w = wrappers[i];
            if (this.touchId === w.id) {
                this.pageX = w.pageX;
                this.pageY = w.pageY;
                this.updateMove();
                break;
            }
        }
    },

    updateMove: function() {

        this.updateAxes(this.pageX - this.x, this.pageY - this.y);

        return true;
    },

    updateAxes: function(x, y, timeStep, now) {
        var dx = this.axesX = x;
        var dy = this.axesY = y;

        if (!dx && !dy) {
            this.strength = 0;
            this.distance = 0;
            this.moveX = this.moveY = this.moveRadius = 0;
            return false;
        }

        var r = this.distance = Math.sqrt(dx * dx + dy * dy);
        if (r < this.minMoveRadius) {
            this.moveX = this.moveY = this.moveRadius = this.strength = 0;
            return false;
        }

        var rad = Math.atan2(dy, dx);
        if (this.wayRad) {
            rad = Math.floor(rad / this.wayRad + 0.5) * this.wayRad;
        }

        this.rad = rad;
        this.cos = Math.cos(rad);
        this.sin = Math.sin(rad);

        if (r > this.maxMoveRadius) {
            r = this.maxMoveRadius;
            dx = r * this.cos;
            dy = r * this.sin;
        }
        this.moveX = dx;
        this.moveY = dy;
        this.moveRadius = r;
    },

    end: function(wrappers, event, controller) {
        if (this.disabled) {
            return;
        }
        for (var i = 0; i < wrappers.length; i++) {
            var wrapper = wrappers[i];
            if (this.touchId === wrapper.id) {
                this.reset();
                break;
            }
        }
    },

    reset: function() {
        this.touchId = null;
        this.touched = false;
        if (this.defaultX !== null) {
            this.x = this.defaultX;
        }
        if (this.defaultY !== null) {
            this.y = this.defaultY;
        }
        this.axesX = 0;
        this.axesY = 0;
        this.pageX = 0;
        this.pageY = 0;
        this.moveX = 0;
        this.moveY = 0;
        this.moveRadius = 0;
        this.distance = 0;
        this.rad = 0;
        this.cos = 1;
        this.sin = 0;
    },

    followTouch: function(timeStep) {
        if (this.disabled || !this.touched || !this.followSpeed || this.distance <= this.followDistance) {
            return;
        }
        var step = this.followSpeed * timeStep;
        if (!step) {
            return;
        }
        var dis = this.distance - this.followDistance;
        if (dis < step) {
            step = dis;
        }
        this.distance -= step;
        this.x += this.cos * step;
        this.y += this.sin * step;

    },

    update: function(timeStep, now) {
        if (this.disabled) {
            return;
        }

        if (this.moveRadius < this.minMoveRadius) {
            this.strength = 0;
            return;
        }

        this.followTouch(timeStep);

        if (this.sensitive) {
            this.strength = (this.moveRadius - this.minMoveRadius) / (this.maxMoveRadius - this.minMoveRadius);
        } else {
            this.strength = 1;
        }

    },

    render: function(context, timeStep, now) {
        if (!this.visible) {
            return;
        }
        if (!this.touched) {
            // return;
        }

        var x = this.x,
            y = this.y;

        context.strokeStyle = this.bgColor;
        context.beginPath();
        context.arc(x, y, this.maxMoveRadius, 0, Math.PI * 2);
        context.closePath();
        context.stroke();

        if (this.minMoveRadius > 0) {
            context.fillStyle = this.centerColor;
            context.beginPath();
            context.arc(x, y, this.minMoveRadius, 0, Math.PI * 2);
            context.closePath();
            context.fill();
        }

        context.fillStyle = this.stickColor;
        context.beginPath();
        context.arc(x + this.moveX, y + this.moveY, this.stickRadius, 0, Math.PI * 2);
        context.closePath();
        context.fill();

    },

});
