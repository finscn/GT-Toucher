
	Toucher.TwoTap=Toucher.Tap.extend({

		timeLag : 100 ,
		limit : 5,

		anotherTap : null ,
		
		start : null ,
		end : function(wrappers,event,controller){
			
			var t0=wrappers[0];
			var enabled= this.checkMoveArea(t0) &&  this.checkTimeLag(t0);

			if (wrappers.length==2){
				var t1=wrappers[1];
				var enabled2= this.checkMoveArea(t1) &&  this.checkTimeLag(t1);
				if ( enabled && enabled2 ){
					this.trigger(wrappers,event,controller);
					this.anotherTap=null;
				}
				return;
			}

			if (enabled && wrappers.length==1){
				var startTime=t0.startTime;
				if (this.anotherTap){
					if (startTime-this.anotherTap.startTime<=this.timeLag ){
						this.trigger(wrappers,event,controller);
						this.anotherTap=null;
						return;
					}
					this.anotherTap.startTime=startTime;
				}else{
					this.anotherTap={
						startTime : startTime,
						endTime : t0.endTime,
						pageX : t0.pageX ,
						pageY : t0.pageY 
					}
				}
			}else{
				this.anotherTap=null;
			}
		},

		/* Implement by user */
		trigger : function(wrappers,event,controller){

		}


	});


