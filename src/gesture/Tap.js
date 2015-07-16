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
            if (this.onTouchEnd != null) {
                this.onTouchEnd(x, y, wrapper, event, controller);
            }
        }
    },


});
