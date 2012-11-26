
	Toucher.Scroll=Toucher.Listener.extend({

		delay : 800 ,
		limit : 5,

		lag : 100,

		x : 0,
		y : 0,

		touchCount : 1 ,

		move : function(wrappers,event,controller){
			if (wrappers.length==this.touchCount){
				this.onScroll(wrappers,event,controller);
				event.preventDefault();
			}
		},
		end : function(wrappers, event, controller){ 
			
		} ,

		/* Implement by user */
		filterWrapper : function(touchWrapper,event,controller){
			return false;
		},
		/* Implement by user */
		onScroll : function(wrappers,event,controller){

		}


	});


