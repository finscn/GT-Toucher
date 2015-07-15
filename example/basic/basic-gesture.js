var tapDom,
    panDom,
    swipeDom,
    pinchDom,
    rotateDom,
    infoDom;
var infos = [];
window.onload = function() {
    infoDom = $id("info");

    tapDom = $id("tapArea");
    pinchDom = $id("pinchArea");
    rotateDom = $id("rotateArea");

    tapDom.x = tapDom.offsetLeft;
    tapDom.y = tapDom.offsetTop;
    pinchDom.scale = 1;
    pinchDom.rotation = 1;
    rotateDom.scale = 1;
    rotateDom.rotation = 1;

    panDom = tapDom;
    swipeDom = rotateDom;

    controller.init();
    //把自定义事件注册到controller里
    controller.addListener(tap);
    controller.addListener(pan);
    controller.addListener(swipe);
    controller.addListener(pinch);
    controller.addListener(rotate);
}

var infoNo = 0;

function log(message) {
    infoNo++;
    infos.unshift(infoNo + ") " + message);
    if (infos.length > 3) {
        infos.length = 3;
    }
    infoDom.innerHTML = infos.join("<br>");
}

function $id(id) {
    return document.getElementById(id);
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

var controller = new Toucher.Controller({
    preventDefaultMove: true,
    beforeInit: function() {
        this.dom = document.body;
    }
});



var tap = new Toucher.Tap({

    filterWrapper: function(type, wrapper, event, controller) {
        // 只有原生触控事件发生在指定dom对象上时,才会触发本自定义事件
        // 条件可以是任意,不仅仅局限于基于dom的判断, 例如可以是点击的区域坐标 时间等等,
        // 甚至可以和点击事件无关
        return wrapper.target == tapDom;
    },

    onTap: function(x, y, wrapper, event, controller) {
        var endTime = wrapper.endTime;
        log("Tap: pos " + x + "," + y + " ,  time " + endTime);
    }
});


var pan = new Toucher.Pan({

    filterWrapper: function(type, wrapper, event, controller) {
        return wrapper.target == panDom;
    },

    onPan: function(dx, dy, x, y, wrapper, event, controller) {
        panDom.x += dx;
        panDom.y += dy;
        panDom.style.left = panDom.x + "px";
        panDom.style.top = panDom.y + "px";
        // log("Pan: pos " + x + "," + y + "");
    }
});


var swipe = new Toucher.Swipe({

    filterWrapper: function(type, wrapper, event, controller) {
        return wrapper.target == swipeDom;
    },

    onSwipe: function(velX, velY, wrapper, event, controller) {
        if(velX<0){
            swipeDom.style.left="0";
            swipeDom.style.right="auto";
        }else if(velX>0){
            swipeDom.style.left="auto";
            swipeDom.style.right="0";
        }
        log("Swipe vel:  " + velX.toFixed(4) + ", " + velY.toFixed(4) + "");
    }
});


var pinch = new Toucher.Pinch({

    filterWrapper: function(type, wrapper, event, controller) {
        return wrapper.target == pinchDom;
    },

    onPinch: function(currentDistance, startDistance, wrappers, event, controller) {
        var scale = currentDistance / startDistance;
        pinchDom.scale = scale;
        pinchDom.style.transform = "scale(" + pinchDom.scale + ")";
        pinchDom.style.webkitTransform = "scale(" + pinchDom.scale + ")";
        // log("Pinch:  " + currentDistance + "/" + startDistance + "");
    }
});



var rotate = new Toucher.Rotate({

    filterWrapper: function(type, wrapper, event, controller) {
        return wrapper.target == rotateDom;
    },

    onRotate: function(currentAngle, startAngle, wrappers, event, controller) {
        var da = currentAngle - startAngle;
        rotateDom.rotation = da;
        rotateDom.style.transform = "rotate(" + rotateDom.rotation + "rad)";
        rotateDom.style.webkitTransform = "rotate(" + rotateDom.rotation + "rad)";
        // log("Rotate: angle " + da + "");
    }
});
