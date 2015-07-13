"use strict";

Toucher.Swipe = Toucher.Listener.extend({

    minDistance: 50,
    maxTime: 1000,

    filterWrapper: function(type, wrapper, event, controller) {
        return true;
    },

    "end": function(wrappers, event, controller) {
        var index = 0;
        var count = Math.min(wrappers.length, this.multi);
        for (var i = 0; i < count; i++) {
            var wrapper = wrappers[i];
            var x = wrapper.endPageX;
            var y = wrapper.endPageY;
            if (this.onTouchEnd != null) {
                this.onTouchEnd(x, y, wrapper, event, controller);
            }

            var time = (wrapper.endTime - wrapper.startTime);
            if (time > this.maxTime) {
                continue;
            }
            var disX = (x - wrapper.startPageX);
            var disY = (y - wrapper.startPageY);
            // var dis=Math.sqrt(disX*disX+disY*disY);
            // if (dis<this.minDistance){
            //  return;
            // }
            if (Math.abs(disX) < this.minDistance && Math.abs(disY) < this.minDistance) {
                continue;
            }
            var velX = disX / time;
            var velY = disY / time;
            wrapper.index = index++;
            this.onSwipe(velX, velY, wrapper, event, controller);
        }
    },
    onTouchEnd: null,

    /* Implement by user */
    onSwipe: function(velX, velY, wrapper, event, controller) {

    }

});
