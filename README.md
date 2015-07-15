---------------

** example 已经可运行 **

---------------


GT-Toucher -- A Multi Touch Tool for Browser
=========================

GT-Toucher 是对支持多点触控的浏览器(目前只测试了 iOS safari)中touch事件的一个底层封装.

由**Controller, Listener, TouchWrapper**构成.其思路和传统的"在响应事件的对象上注册事件"的方式不同,而是事件委托方式的一个变种.

最初构想这个工具主要是因为触控设备上"TouchEvent里包含若干TouchList,每个TouchList包含若干Touch对象"的三层结构,和传统的Mouse/Keyboard事件模型有较大差异,使用起来相对麻烦.
而且浏览器自带的touch事件对于游戏来说,太过底层,功能远远不够.

而且游戏里经常遇到的场景是: 在一个巨大的dom上(例如一个全屏的canvas)处理各种复杂的事件.这种情况下传统的事件几乎帮不了我们什么忙.
你可以设想一下 双手操作的横屏动作游戏 (虚拟摇杆+各种按键, 或者是双虚拟摇杆)


工作原理 : 
---------------------
* Controller 在外层元素(通常是document 或 document.body,也可以根据需求自定义)上监听touchstart touchmove touchend事件.
* 向Controller 上注册自定义Listener实例, Listener实例里定义了该Listener要接收哪些touch事件(规则),以及如何响应这些事件(动作)
* Controller会记录发生在外层元素上的所有的touch事件的信息,然后根据Listener定义的规则,去触发相应的Listener执行动作.
* 传递给Listener的touch事件已经经过controller筛选,只传递Listener需要的
* touch事件不是直接传递给Listener,而是会把主要信息记录并包装成TouchWrapper后传递.
* TouchWrapper里包含了原生的touch对象,同时记录了一些触控事件的各种信息(详见源码)


为什么不选择传统事件模型 : 
---------------------
在传统的dom事件里,开发者通常使用形如下列形式的代码来实现事件的监听

	dom.addEventListener(EventType, callbackFn );


* (待补充)



示例
-----------------
下面举一个自定义touch事件的例子


```

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
            if (this.onTouchEnd != null) {
                this.onTouchEnd(x, y, wrapper, event, controller);
            }
            if (this.checkMoveDistance(wrapper) && this.checkTimeLag(wrapper)) {
                wrapper.index = index++;
                this.onTap(x, y, wrapper, event, controller);
            }
        }
    },


});

```



	
如何使用: (以下只是代码片段,详见demo源码)

```
    //创建一个tap listener的实例
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

    // 创建一个 touch controller 的实例
        var controller = new Toucher.Controller({
        beforeInit : function(){
            this.dom=document.body;
        }
    });

    window.onload = function(){
        controller.init();
        //把自定义事件注册到controller里
        controller.addListener(tap);
    }
	
```


更多示例和文档 稍后奉上
--------------------



