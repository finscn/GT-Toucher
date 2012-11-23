
	Toucher.TwoTap=Toucher.Tap.extend({

		lag : 100 ,
		limit : 5,

		anotherTap : null ,
		
		start : null ,
		end : function(wrappers,event,controller){
			
			var touchWrapper=wrappers[0];
			var enabled= this.checkMoveArea(touchWrapper) &&  this.checkEndTime(touchWrapper);

			if (wrappers.length==2){
				var touchWrapper2=wrappers[1];
				var enabled2= this.checkMoveArea(touchWrapper2) &&  this.checkEndTime(touchWrapper2);
				if ( enabled && enabled2 ){
					this.onTap(wrappers,event,controller);
					this.anotherTap=null;
				}
				return;
			}

			if (enabled && wrappers.length==1){
				var startTime=touchWrapper.startTime;
				if (this.anotherTap){
					if (startTime-this.anotherTap.startTime<=this.lag ){
						this.onTap(wrappers,event,controller);
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
		wrapperFilter : function(touchWrapper,wrappers,controller){
			return false;
		},
		/* Implement by user */
		onTap : function(wrappers,event,controller){

		}


	});


