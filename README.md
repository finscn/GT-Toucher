**由于最近对项目做了较大的重构, 所以现在的example里, 只有joystick可正常使用.其他示例近期会更新.**

---------------


GT-Toucher -- A Multi Touch Tool for Browser
=========================

GT-Toucher 是对支持多点触控的浏览器(目前只测试了 iOS safari)中touch事件的一个底层封装.

由**Controller, Listener, TouchWrapper**构成.其思路和传统的"在响应事件的对象上注册事件"的方式不同,而是事件委托方式的一个变种.

最初构想这个工具主要是因为触控设备上"TouchEvent里包含若干TouchList,每个TouchList包含若干Touch对象"的三层结构,和传统的Mouse/Keyboard事件模型有较大差异,使用起来相对麻烦.
而且浏览器自带的touch事件对于游戏来说,太过底层,功能远远不够.



工作原理 : 
---------------------
* Controller 在外层元素(通常是document 或 document.body,也可以根据需求自定义)上监听touchstart touchmove touchend事件.
* 向Controller 上注册自定义Listener实例, Listener实例里定义了该Listener要接收哪些touch事件(规则),以及如何响应这些事件(动作)
* Controller会记录发生在外层元素上的所有的touch事件的信息,然后根据Listener定义的规则,去触发相应的Listener执行动作.
* 传递给Listener的touch事件已经经过controller筛选,只传递Listener需要的
* touch事件不是直接传递给Listener,而是会被包装成TouchWrapper后传递.
* TouchWrapper里包含了原生的touch对象,同时记录了一些辅助信息(详见源码)


为什么不选择传统事件模型 : 
---------------------
在传统的dom事件里,开发者通常使用形如下列形式的代码来实现事件的监听

	dom.addEventListener(EventType, callbackFn );


* (待补充)



示例
-----------------
下面举一个自定义touch事件的例子


	/* 一个自定义的Tap事件 */
	// 在这个示例里,tap的定义是: 
	// 一根手指,按住屏幕,并在800毫秒内抬起,同时在按住屏幕期间手指的移动范围在15像素之内

    "use strict";

    Toucher.Tap = Toucher.Listener.extend({

        maxTimeLag: 800,
        maxDistance: 15,

        filterWrappers: function(type, wrappers, event, controller) {
            if (wrappers.length == 1 && this.filterWrapper(type, wrappers[0], event, controller)) {
                return wrappers;
            }
            return false;
        },

        filterWrapper: function(type, wrapper, event, controller) {
            return true;
        },

        start: function(wrappers, event, controller) {
            if (this.onTouchStart != null) {
                this.onTouchStart(wrappers, event, controller);
            }
        },
        onTouchStart: null,

        move: function(wrappers, event, controller) {
            if (this.onTouchMove != null) {
                this.onTouchMove(wrappers, event, controller);
            }
        },
        onTouchMove: null,

        end: function(wrappers, event, controller) {
            var t0 = wrappers[0];
            var x = t0.pageX;
            var y = t0.pageY;
            if (this.checkMoveDistance(t0) && this.checkTimeLag(t0)) {
                this.tapped = true;
                this.onTap(x, y, wrappers, event, controller);
            }
            if (this.onTouchEnd != null) {
                this.onTouchEnd(x, y, wrappers, event, controller);
            }
            this.tapped = false;
        },
        onTouchEnd: null,

        checkMoveDistance: function(wrapper) {
            var dx = Math.abs(wrapper.moveAmountX);
            var dy = Math.abs(wrapper.moveAmountY);

            return dx <= this.maxDistance && dy <= this.maxDistance;
        },

        checkTimeLag: function(wrapper) {
            return wrapper.endTime - wrapper.startTime < this.maxTimeLag;
        },

        /* Implement by user */
        onTap: function(x, y, wrappers, event, controller) {

        }

    });



	
如何使用: (以下只是代码片段,详见demo源码)

    //创建一个tap listener的实例
    var tap=new Toucher.Tap({

        filterWrapper: function(type, wrapper, event, controller) {
            // 只有点击了 id==tapArea 的dom对象,才会触发这个事件
            // 条件可以是任意,不仅仅局限于dom的判断, 例如可以是点击的区域坐标 时间等等,
            // 甚至可以和点击事件无关
            return wrapper.target.id=="tapArea";
        },

        onTap: function(x, y, wrappers, event, controller) {
            // tap事件要执行的动作
            var wrapper=wrappers[0];
            var endTime=wrapper.endTime;
            // 判断是否在一个dom上, 通常不需要
            // if (wrapper.startTarget == wrapper.target) {
                $id("info").innerHTML="Tap: pos "+x+","+y+" ,  time "+endTime;
            // }
        }
    });

    // 创建一个 touch controller 的实例
        var controller=new Toucher.Controller({
        beforeInit : function(){
            this.dom=document.body;
        }
    });

    window.onload=function(){
        controller.init();
        //把自定义事件注册到controller里
        controller.addListener(tap);
    }
	


更多示例和文档 稍后奉上
--------------------



