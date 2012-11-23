
	Toucher.Rotate=Toucher.Listener.extend({
		

		move : function(wrappers,event,controller){
			if (event.touches.length==2){
				var t1=wrappers[0], t2=wrappers[1];
				var disX= (t1.startPageX-t2.startPageX);
				var disY= (t1.startPageY-t2.startPageY);
				var ang=Math.atan2(disY,disX);

				disX= (t1.pageX-t2.pageX);
				disY= (t1.pageY-t2.pageY);
				var newAng=Math.atan2(disY,disX);

				var rotation=newAng-ang;
				this.onRotate(rotation,wrappers,event,controller);
				event.preventDefault();
			}

		},

		/* Implement by user */
		wrapperFilter : function(touchWrapper,wrappers,controller){
			return false;
		},
		/* Implement by user */
		onRotate : function(rotation,wrappers,event,controller){

		}


	});


