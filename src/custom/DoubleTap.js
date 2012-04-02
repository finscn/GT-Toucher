
	Toucher.DoubleTap=Toucher.Tap.extend({

		delay : 800 ,
		limit : 10,

		prevTap : null ,

		end : function(wrapperList,event,touchController){
			var touchWrapper=wrapperList[0];

			if (this.enabled && wrapperList.length===1){

				//在屏幕上的手指是否在指定时间内抬起,太迟了会视为无效tap
				if ( this.checkMoveArea(touchWrapper) && this.checkEndTime(touchWrapper) ){

					var startTime=touchWrapper.startTime;
					var pageX=touchWrapper.pageX;
					var pageY=touchWrapper.pageY;

					// 有前一次tap 且 前一次tap的结束时间&点击位置在允许的范围内
					if (this.prevTap){
						
						if (startTime-this.prevTap.endTime<=this.delay
							&& Math.abs(pageX-this.prevTap.pageX)<=this.limit
							&& Math.abs(pageY-this.prevTap.pageY)<=this.limit ){
							this.onTap(wrapperList,event,touchController);
							this.prevTap=null;
							this.enabled=false;
							return;
						}else{

							console.log([startTime-this.prevTap.endTime,
										Math.abs(pageX-this.prevTap.pageX),
										Math.abs(pageY-this.prevTap.pageY)
											])

							this.prevTap.endTime=touchWrapper.endTime;
							this.prevTap.startTime=startTime;
							this.prevTap.pageX=pageX;
							this.prevTap.pageY=pageY;
						}

					}else{
						// 没有前一次tap的话, 则创建,并记录此次tap的相关信息
						this.prevTap={
							endTime : touchWrapper.endTime ,
							pageX : pageX ,
							pageY : pageY 
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
		isTrigger : function(touchWrapper,wrapperList,touchController){
			return false;
		},
		/* Implement by user */
		onTap : function(wrapperList,event,touchController){

		}


	});


