var infoDom;
var infos = [];

var canvas;
var ctx;
var pixelRatio = 2;
var width = 600;
var height = 400;

var controller;

window.onload = function() {
    infoDom = $id("info");

    canvas = $id("canvas");
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "#DDDDDD";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    controller = new Toucher.Controller({
        preventDefaultMove: true,
        dom: canvas,
        pixelRatio: pixelRatio
    });
    controller.init();
    //把自定义事件注册到controller里
    controller.addListener(tap);
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


var tap = new Toucher.Tap({
    onTap: function(x, y, wrapper, event, controller) {
        var endTime = wrapper.endTime;
        log("Tap: pos " + x + "," + y + " ,  time " + endTime);
    }
});
