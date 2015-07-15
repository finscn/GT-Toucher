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
    onPinch: function(currentDistance, startDistance, wrappers, event, controller) {

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
            this.startDistance = Math.sqrt(disX * disX + disY * disY);
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
        var currentDistance = Math.sqrt(disX * disX + disY * disY);

        this.onPinch(currentDistance, this.startDistance, [touchA, touchB], event, controller);
    },

    "end": function(wrappers, event, controller) {
        for (var i = 0; i < wrappers.length; i++) {
            var wrapper = wrappers[i];
            if (this.touchA && this.touchA.id == wrapper.id) {
                this.touchA = null;
            } else if (this.touchB && this.touchB.id == wrapper.id) {
                this.touchB = null;
            } else {
                break;
            }
        }
        if (!this.touchA || !this.touchB) {
            this.startDistance = null;
        }
    },

    "cancel": function(wrappers, event, controller) {
        this.touchA = null;
        this.touchB = null;
        this.startDistance = null;
    },

});
