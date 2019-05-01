"use strict";

var Toucher = Toucher || {};

(function(exports) {

    var TouchButton = exports.TouchButton;
    var TouchStick = exports.TouchStick;

    var Touchpad = function(options) {
        for (var property in options) {
            this[property] = options[property];
        }
    };

    var proto = {

        name: "touchpad",
        type: "touchpad",
        buttons: null,
        activated: false,

        controller: null,

        visible: true,

        useMouse: null,

        init: function() {
            if (this.beforeInit) {
                this.beforeInit();
            }

            this.connected = true;
            this._buttons = this.buttons;
            this.initButtons(this._buttons);

            if (this.onInit) {
                this.onInit();
            }
        },
        beforeInit: null,
        onInit: null,

        initButtons: function(buttons) {
            this.buttons = {};
            if (this.useMouse === false && !this.controller.supportMultiTouch) {
                this.disabled = true;
                return;
            }
            for (var name in buttons) {
                var btn = buttons[name];
                btn.name = btn.name || name;
                var button;
                if (btn.stick){
                    button = new TouchStick(btn);
                }else{
                    button = new TouchButton(btn);
                }
                button.init();
                this.controller.addListener(button);
                this.buttons[button.name] = button;
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
            for (var name in this.buttons) {
                var button = this.buttons[name];
                button.enable();
            }
            this.disabled = false;
        },
        disable: function() {
            for (var name in this.buttons) {
                var button = this.buttons[name];
                button.disable();
            }
            this.activated = false;
            this.disabled = true;
        },
        reset: function() {
            this.disabled = false;
            for (var name in this.buttons) {
                var button = this.buttons[name];
                button.reset();
            }
        },

        getInputStatus: function() {
            return this.disabled ? null : this.buttons;
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
