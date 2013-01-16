
Toucher.DoubleTap=Toucher.Tap.extend({

	timeLag : 800 ,
	limit : 10,
	enabled : false ,
	prevTap : null ,

	end : function(wrappers,event,controller){

		if (this.enabled && wrappers.length===1){

			var t0=wrappers[0];

			//在屏幕上的手指是否在指定时间内抬起,太迟了会视为无效tap
			if ( this.checkMoveArea(t0) && this.checkTimeLag(t0) ){

				var startTime=t0.startTime;
				var x=t0.pageX;
				var y=t0.pageY;

				// 有前一次tap 且 前一次tap的结束时间&点击位置在允许的范围内
				if (this.prevTap){
					
					if (startTime-this.prevTap.endTime<=this.timeLag
						&& Math.abs(x-this.prevTap.pageX)<=this.limit
						&& Math.abs(y-this.prevTap.pageY)<=this.limit ){
						this.trigger(x, y, wrappers,event,controller);
						this.prevTap=null;
						this.enabled=false;
						return;
					}else{

						// console.log([startTime-this.prevTap.endTime,
						// 			Math.abs(pageX-this.prevTap.pageX),
						// 			Math.abs(pageY-this.prevTap.pageY)
						// 				])

						this.prevTap.endTime=t0.endTime;
						this.prevTap.startTime=startTime;
						this.prevTap.pageX=x;
						this.prevTap.pageY=y;
					}

				}else{
					// 没有前一次tap的话, 则创建,并记录此次tap的相关信息
					this.prevTap={
						endTime : t0.endTime ,
						pageX : x ,
						pageY : y 
					}
				}
			}else{
				this.prevTap=null;
			}	
		}else{
			this.prevTap=null;
		}

		this.enabled=false;
	},

	/* Implement by user */
	trigger : function(x,y, wrappers,event,controller){

	}


});


