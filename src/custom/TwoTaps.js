
	Toucher.TwoTaps=Toucher.Tap.extend({

		delay : 800 ,
		limit : 5,

		lag : 80,

		anotherTap : null ,

		start : function(wrapperList,event,touchController){
			var touchCount=wrapperList.length;
			this.enabled= 0<touchCount && touchCount<3;
		},
		 
		move : function(wrapperList,event,touchController){
			var touchCount=wrapperList.length;
			this.enabled= 0<touchCount && touchCount<3;
		},

		end : function(wrapperList,event,touchController){
			if (wrapperList.length===2){
				this.onTap(wrapperList,event,touchController);
				this.anotherTap=null;
				this.enabled=false;
				return;
			}

			console.log("end 1 "+[this.enabled,this.anotherTap])

			var touchWrapper=wrapperList[0];

			if (this.enabled){
				//在屏幕上的手指是否在指定时间内抬起,太迟了会视为无效tap
				if ( this.checkEndTime(touchWrapper) ){
					var startTime=touchWrapper.startTime;
					if (this.anotherTap){
						if (startTime-this.anotherTap.startTime<=this.lag ){
							this.onTap(wrapperList,event,touchController);
							this.anotherTap=null;
							this.enabled=false;
							return;
						}else{
							this.anotherTap.startTime=startTime;
						}
					}else{
						// 没有前一次tap的话, 则创建,并记录此次tap的相关信息
						this.anotherTap={
							startTime : startTime
						}
					}
				}else{
					this.anotherTap=null;
				}			
			}else{
				this.anotherTap=null;
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


