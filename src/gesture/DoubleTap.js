"use strict";

// TODO

Toucher.DoubleTap = Toucher.Tap.extend({

    maxTimeLag: 800,
    maxDistance: 10,
    prevTap: null,

    filterWrappers: function(type, wrappers, event, controller) {
        return wrappers.length == 1;
    },

    end: function(wrappers, event, controller) {
        var wrapper = wrappers[0];
        if (this.checkMoveDistance(wrapper) && this.checkTimeLag(wrapper)) {
            var startTime = wrapper.startTime;
            var endTime = wrapper.endTime;
            var x = wrapper.pageX;
            var y = wrapper.pageY;
            if (this.prevTap === null || endTime - this.prevTap.startTime > this.maxTimeLag || Math.abs(x - this.prevTap.pageX) > this.maxDistance || Math.abs(y - this.prevTap.pageY) > this.maxDistance) {
                this.prevTap = {
                    startTime: startTime,
                    endTime: endTime,
                    pageX: x,
                    pageY: y
                };
                this.onFirstTap(x, y, wrapper, event, controller);
            } else {
                this.tapped = true;
                this.onDoubleTap(x, y, wrapper, event, controller);
                this.prevTap = null;
                this.valid = false;
                this.tapped = false;
                return;
            }
        } else {
            this.prevTap = null;
        }
    },

    /* Implement by user */
    onFirstTap: function(x, y, wrapper, event, controller) {

    },
    onDoubleTap: function(x, y, wrapper, event, controller) {

    }


});
