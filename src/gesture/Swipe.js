"use strict";
Toucher.Swipe = Toucher.Listener.extend({

    minDistance: 50,
    maxTime: 1000,

    filterWrappers: function(type, wrappers, event, controller) {
        return wrappers.length == 1;
    },

    start: function(wrappers, event, controller) {

    },

    move: function(wrappers, event, controller) {

    },

    end: function(wrappers, event, controller) {
        var index = 0;
        var count = Math.min(wrappers.length, this.multi);
        for (var i = 0; i < count; i++) {
            var wrapper = wrappers[i];
            var time = (wrapper.endTime - wrapper.startTime);

            // var disX = (wrapper.endPageX - wrapper.startPageX);
            // var disY = (wrapper.endPageY - wrapper.startPageY);
            // console.log(time, this.maxTime, "----", disX, disY, this.minDistance);

            if (time > this.maxTime) {
                if (this.onTouchEnd != null) {
                    this.onTouchEnd(wrapper, event, controller);
                }
                continue;
            }
            var disX = (wrapper.endPageX - wrapper.startPageX);
            var disY = (wrapper.endPageY - wrapper.startPageY);
            // var dis=Math.sqrt(disX*disX+disY*disY);
            // if (dis<this.minDistance){
            //  return;
            // }
            if (Math.abs(disX) < this.minDistance && Math.abs(disY) < this.minDistance) {
                if (this.onTouchEnd != null) {
                    this.onTouchEnd(wrapper, event, controller);
                }
                continue;
            }
            var velX = disX / time;
            var velY = disY / time;
            this.onSwipe(velX, velY, wrapper, event, controller);
        }
    },
    onTouchEnd: null,

    /* Implement by user */
    onSwipe: function(velX, velY, wrapper, event, controller) {

    }

});
