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
