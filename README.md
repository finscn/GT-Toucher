
GT-Toucher - A Multi Touch Tool for Browser
=========================


Gt-Toucher 是对支持多点触控的浏览器(目前只测试了 iOS safari)中touch事件的一个底层封装.

由**Controller, Listener, TouchWrapper**构成.其思路和传统的"在响应事件的对象上注册事件"的方式不同,而是事件委托方式的一个变种.

最初构想这个工具主要是因为触控设备上"TouchEvent里包含若干TouchList,每个TouchList包含若干Touch对象"的三层结构,和传统的Mouse/Keyboard事件模型有较大差异,使用起来相对麻烦.
而且浏览器自带的TouchEvent模型对与游戏来说,太过底层,功能远远不够.



工作原理 : 
---------------------

* Controller 在外层元素(通常是document 或 document.body,也可以根据需求自定义)上监听touchstart touchmove touchend事件.
* 向Controller 上注册自定义Listener实例, Listener实例里定义了该Listener要接收哪些touch事件(规则),以及如何响应这些事件(动作)
* Controller会记录发生在外层元素上的所有的touch事件的信息,然后根据Listener定义的规则,去触发相应的Listener执行动作.
* 传递给Listener的touch事件已经经过controller筛选,只传递Listener需要的
* touch事件不是直接传递给Listener,而是会被包装成TouchWrapper后传递.
* TouchWrapper里包含了原生的touch对象,同时记录了一些辅助信息(详见源码)

示例
-----------------
下面举一个自定义touch事件的例子


	/* 一个自定义的Tap事件 */
	// 在这个示例里,tap的定义是: 
	// 一根手指,按住屏幕,并在800毫秒内抬起,同时在按住屏幕期间手指的移动范围在3像素之内

	Toucher.Tap=Toucher.Listener.extend({

		delay : 800 ,
		limit : 3,

		enabled : false ,

		start : function(touchWrappers,event,touchController){
			// 只有一根手指时有效
			this.enabled=touchWrappers.length==1;
		},

		move : function(touchWrappers,event,touchController){
			var touchWrapper=touchWrappers[0];
			var dx=Math.abs(touchWrapper.moveAmountX);
			var dy=Math.abs(touchWrapper.moveAmountY);

			// 如果手指按在屏幕上时,有移动,且移动范围大于3像素,则无效
			if (dx>this.limit || dy>this.limit){
				this.enabled=false;
			}			
		},

		end : function(touchWrappers,event,touchController){
			var touchWrapper=touchWrappers[0];

			//手指在屏幕上抬起的太迟了, 也无效
			if ((touchWrapper.endTime-touchWrapper.startTime)>this.delay){
				this.enabled=false;
			}

			if (this.enabled){
				// tap事件要执行的动作
				this.onTap(touchWrappers,event,touchController);
			}

			this.enabled=false;
		},

		/* Implement by user */
		isTrigger : function(touchWrapper){
			return false;
		},
		/* Implement by user */
		onTap : function(touchWrappers,deltaInfo,event,tc){

		}

	});


	
如何使用: (一下只是代码片段,详见demo源码)

	//创建一个tap listener的实例	
	var testTap=new Toucher.Tap({

		isTrigger : function(touchWrapper){
			// 只有点击了 id==tap_area 的dom对象,才会触发这个事件
			return touchWrapper.target.id=="tap_area";
		},

		onTap : function(touchWrappers,deltaInfo,event,tc){
			// tap事件要执行的动作
			var touchWrapper=touchWrappers[0];
			var tapX=touchWrapper.startPageX;
			var tapY=touchWrapper.startPageY;
			var endTime=touchWrapper.endTime;
			$id("info").innerHTML="Tap pos ["+tapX+","+tapY+"], tap time:"+endTime;
		}
	});
	
	//把自定义事件注册到controller里
	controller.addListener(testTap);
	

更多示例和文档 稍后奉上



