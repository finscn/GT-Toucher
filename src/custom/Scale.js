
	Toucher.Scale=Toucher.Listener.extend({

		delay : 800 ,
		limit : 5,

		lag : 100,


		move : function(wrapperList,event,touchController){
			if (wrapperList.length==2){
				var t1=wrapperList[0], t2=wrapperList[1];
				var disX= (t1.startPageX-t2.startPageX);
				var disY= (t1.startPageY-t2.startPageY);
				var dis=Math.sqrt(disX*disX+disY*disY);

				disX= (t1.pageX-t2.pageX);
				disY= (t1.pageY-t2.pageY);
				var newDis=Math.sqrt(disX*disX+disY*disY);

				var scale=newDis/dis;
				this.onScale(scale,wrapperList,event,touchController);
				event.preventDefault();
			}

		},

		/* Implement by user */
		isTrigger : function(touchWrapper,wrapperList,touchController){
			return false;
		},
		/* Implement by user */
		onScale : function(scale,wrapperList,event,touchController){

		}


	});


