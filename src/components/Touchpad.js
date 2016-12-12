"use strict";

var Toucher = Toucher || {};

(function(exports) {

    var Touchpad = function(options) {
        for (var property in options) {
            this[property] = options[property];
        }
    };

    var proto = {

        controller: null,
        buttons: null,
        type: "touchpad",
        activated: false,

        useMouse: null,

        init: function() {
            if (this.beforeInit) {
                this.beforeInit();
            }

            this.connected = true;
            this.initButtons();

            if (this.onInit) {
                this.onInit();
            }
        },
        beforeInit: null,
        onInit: null,

        initButtons: function() {
            if (this.useMouse === false && !this.controller.supportMultiTouch) {
                this.disabled = true;
                return;
            }
            for (var name in this.buttons) {
                var button = this.buttons[name];
                button.name = button.name || name;
                button.init();
                this.controller.addListener(button);
            }
        },

        update: function(timeStep, now) {
            this.activated = false;
            if (this.disabled) {
                return;
            }
            for (var name in this.buttons) {
                var button = this.buttons[name];
                button.update(timeStep, now);
                this.activated = this.activated || button.pressed || button.buttonUp || button.moveRadius;
            }
        },

        enable: function() {
            this.disabled = false;
            for (var name in this.buttons) {
                var button = this.buttons[name];
                button.enable();
            }
        },
        disable: function() {
            this.activated = false;
            this.disabled = true;
            for (var name in this.buttons) {
                var button = this.buttons[name];
                button.disable();
            }
        },
        reset: function() {
            this.disabled = false;
            for (var name in this.buttons) {
                var button = this.buttons[name];
                button.reset();
            }
        },

        render: function(context, timeStep, now) {
            if (this.disabled || !this.visible) {
                return;
            }

            for (var name in this.buttons) {
                var button = this.buttons[name];
                button.render(context, timeStep, now);
            }
        },
    };

    for (var p in proto) {
        Touchpad.prototype[p] = proto[p];
    }

    exports.Touchpad = Touchpad;

})(Toucher);
