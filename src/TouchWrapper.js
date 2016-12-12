"use strict";

var Toucher = Toucher || {};

(function(exports) {

    var CONST = exports.CONST;

    var TouchWrapper = function(identifier) {
        this.identifier = identifier;
        this.id = identifier;
    };

    var proto = {
        constructor: TouchWrapper,

        pixelRatio: 1,
        offsetLeft: 0,
        offsetTop: 0,
        canvasWidth: 0,
        canvasHeight: 0,
        orientation: 0,


        offsetX: 0,
        offsetY: 0,

        start: function(rawTouch, rawEvent) {

            this.type = this.EVENT.START;

            this.update(rawTouch, rawEvent);

            this.startPageX = this.lastPageX = this.pageX;
            this.startPageY = this.lastPageY = this.pageY;
            this.startTarget = this.lastTarget = this.target;

            // this.startClientX = this.lastClientX = this.clientX;
            // this.startClientY = this.lastClientY = this.clientY;

            this.deltaX = 0;
            this.deltaY = 0;
            this.moveAmountX = 0;
            this.moveAmountY = 0;

            this.touching = true;
            this.startTime = this.endTime = this.moveTime = Date.now();

        },

        move: function(rawTouch, rawEvent) {

            this.type = this.EVENT.MOVE;

            this.lastMoveTime = this.moveTime;

            this.update(rawTouch, rawEvent);

            this.moveTime = Date.now();

        },

        end: function(rawTouch, rawEvent) {

            this.type = this.EVENT.END;

            var deltaX = this.deltaX;
            var deltaY = this.deltaY;

            this.update(rawTouch, rawEvent);

            this.deltaX = deltaX;
            this.deltaY = deltaY;
            this.endPageX = this.pageX;
            this.endPageY = this.pageY;
            this.endTarget = this.target;

            // this.endClientX = this.clientX;
            // this.endClientY = this.clientY;

            this.touching = false;
            this.endTime = Date.now();

        },


        update: function(rawTouch, rawEvent) {

            this.rawEvent = rawEvent;
            this.rawTouch = rawTouch;

            this.lastTarget = this.target;
            this.lastPageX = this.pageX;
            this.lastPageY = this.pageY;
            // this.lastClientX = this.clientX;
            // this.lastClientY = this.clientY;

            this.target = rawTouch.target;

            var x = (rawTouch.pageX - this.offsetLeft) * this.pixelRatio;
            var y = (rawTouch.pageY - this.offsetTop) * this.pixelRatio;
            if (this.orientation === 0) {
                this.pageX = x;
                this.pageY = y;
            } else if (this.orientation === -90) {
                y = y - this.canvasHeight;
                this.pageX = -y;
                this.pageY = x;
            } else if (this.orientation === 90) {
                x = x - this.canvasWidth;
                this.pageX = y;
                this.pageY = -x;
            } else if (this.orientation === 180) {
                x = x - this.canvasWidth;
                y = y - this.canvasHeight;
                this.pageX = -x;
                this.pageY = -y;
            }
            this.pageX -= this.offsetX;
            this.pageY -= this.offsetY;

            // this.clientX = rawTouch.clientX * this.pixelRatio;
            // this.clientY = rawTouch.clientY * this.pixelRatio;

            this.deltaX = this.pageX - this.lastPageX;
            this.deltaY = this.pageY - this.lastPageY;
            this.moveAmountX = this.pageX - this.startPageX;
            this.moveAmountY = this.pageY - this.startPageY;

        },
        getData: function() {
            var data = {};

            data.touching = this.touching;
            data.type = this.type;
            data.startTime = this.startTime;
            data.moveTime = this.moveTime;
            data.endTime = this.endTime;

            data.startPageX = this.startPageX;
            data.startPageY = this.startPageY;
            data.pageX = this.pageX;
            data.pageY = this.pageY;
            data.endPageX = this.endPageX;
            data.endPageY = this.endPageY;

            data.deltaX = this.deltaX;
            data.deltaY = this.deltaY;
            data.moveAmountX = this.moveAmountX;
            data.moveAmountY = this.moveAmountY;

            return data;
        }

    };

    for (var p in proto) {
        TouchWrapper.prototype[p] = proto[p];
    }

    exports.TouchWrapper = TouchWrapper;

})(Toucher);
