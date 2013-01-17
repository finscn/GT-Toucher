
/* 一个自定义的Tap事件 */
// 在这个示例里,tap的定义是: 
// 一根手指,按住屏幕,并在800毫秒内抬起,同时在按住屏幕期间手指的移动范围在3像素之内

Toucher.Tap=Toucher.Listener.extend({

	timeLag : 800 ,
	limit : 10,
	enabled : false ,

	filterWrappers : function(wrappers,event,controller){
       return controller.useMouse || wrappers.length==1;
	},

	start : function(wrappers,event,controller){
		this.enabled=wrappers.length==1;
	},
	move : function(wrappers,event,controller){
		
	},
	end : function(wrappers,event, controller){

		if (this.enabled && wrappers.length===1){
			var t0=wrappers[0];
			if ( this.checkMoveArea(t0) && this.checkTimeLag(t0)){
				var x=t0.pageX;
				var y=t0.pageY;
				this.trigger(x, y, wrappers, event, controller);
			}
		}

		this.enabled=false;
	},

	checkMoveArea : function(wrapper){
		var dx=Math.abs(wrapper.moveAmountX);
		var dy=Math.abs(wrapper.moveAmountY);

		return dx<=this.limit && dy<=this.limit;
	},
	
	checkTimeLag : function(wrapper){
		return wrapper.endTime - wrapper.startTime < this.timeLag;
	},

	/* Implement by user */
	trigger : function(x, y, wrappers,event, controller){

	}

});


