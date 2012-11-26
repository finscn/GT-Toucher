
	Toucher.Scale=Toucher.Listener.extend({

		delay : 800 ,
		limit : 5,

		lag : 100,


		move : function(wrappers,event,controller){
			if (wrappers.length==2){
				var t1=wrappers[0], t2=wrappers[1];
				var disX= (t1.startPageX-t2.startPageX);
				var disY= (t1.startPageY-t2.startPageY);
				var dis=Math.sqrt(disX*disX+disY*disY);

				disX= (t1.pageX-t2.pageX);
				disY= (t1.pageY-t2.pageY);
				var newDis=Math.sqrt(disX*disX+disY*disY);

				var scale=newDis/dis;
				this.onScale(scale,wrappers,event,controller);
				event.preventDefault();
			}

		},

		/* Implement by user */
		filterWrapper : function(touchWrapper,event,controller){
			return false;
		},
		/* Implement by user */
		onScale : function(scale,wrappers,event,controller){

		}


	});


