
	Toucher.DoubleTap=Toucher.Listener.extend({

		delay : 800 ,
		limit : 3,

		enabled : false ,

		start : function(wrapperList,event,touchController){
			// 只有一根手指时有效
			this.enabled=wrapperList.length==1;
		},

		move : function(wrapperList,event,touchController){
			if (this.enabled){
				var touchWrapper=wrapperList[0];
				var dx=Math.abs(touchWrapper.moveAmountX);
				var dy=Math.abs(touchWrapper.moveAmountY);

				// 如果手指按在屏幕上时,有移动,且移动范围大于3像素,则无效
				if (dx>this.limit || dy>this.limit){
					this.enabled=false;
				}			
			}
		},

		end : function(wrapperList,event,touchController){
			var touchWrapper=wrapperList[0];

			//手指在屏幕上抬起的太迟了, 也无效
			if ((touchWrapper.endTime-touchWrapper.startTime)>this.delay){
				this.enabled=false;
			}

			if (this.enabled){

				var endTime=touchWrapper.endTime;
				var pageX=touchWrapper.pageX;
				var pageY=touchWrapper.pageY;

				// 有前一次tap 且 前一次tap的结束时间&点击位置在允许的范围内
				if (this.prevTap
					&& endTime-this.prevTap.endTime<=this.delay
					&& Math.abs(pageX-this.prevTap.pageX)<=this.limit
					&& Math.abs(pageY-this.prevTap.pageY)<=this.limit ){

					this.onTap(wrapperList,event,touchController);
					this.prevTap=null;
				}else{
					// 没有前一次tap的话, 则创建,并记录此次tap的相关信息
					this.prevTap={
						endTime : endTime ,
						pageX : pageX ,
						pageY : pageY 
					}
				}
				
			}

			this.enabled=false;
		},

		/* Implement by user */
		isTrigger : function(touchWrapper,wrapperList,touchController){
			return false;
		},
		/* Implement by user */
		onTap : function(wrapperList,event,touchController){

		}


	});


