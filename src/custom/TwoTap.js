
	Toucher.TwoTap=Toucher.Tap.extend({

		delay : 800 ,
		limit : 5,

		lag : 100,

		anotherTap : null ,
		
		start : null ,
		end : function(wrapperList,event,touchController){
			
			var touchWrapper=wrapperList[0];
			var enabled= this.checkMoveArea(touchWrapper) &&  this.checkEndTime(touchWrapper);

			if (wrapperList.length==2){
				var touchWrapper2=wrapperList[1];
				var enabled2= this.checkMoveArea(touchWrapper2) &&  this.checkEndTime(touchWrapper2);
				if ( enabled && enabled2 ){
					this.onTap(wrapperList,event,touchController);
					this.anotherTap=null;
				}
				return;
			}

			if (enabled && wrapperList.length==1){
				var startTime=touchWrapper.startTime;
				if (this.anotherTap){
					if (startTime-this.anotherTap.startTime<=this.lag ){
						this.onTap(wrapperList,event,touchController);
						this.anotherTap=null;
						return;
					}
					this.anotherTap.startTime=startTime;
				}else{
					this.anotherTap={
						startTime : startTime,
						endTime : touchWrapper.endTime,
						pageX : touchWrapper.pageX ,
						pageY : touchWrapper.pageY 
					}
				}
			}else{
				this.anotherTap=null;
			}
		},

		/* Implement by user */
		isTrigger : function(touchWrapper,wrapperList,touchController){
			return false;
		},
		/* Implement by user */
		onTap : function(wrapperList,event,touchController){

		}


	});


