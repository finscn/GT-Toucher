
Toucher.Scale=Toucher.Listener.extend({

	scale : 1 ,
	minScale : 0.5,
	maxScale : 2,

	filterWrappers : function(wrappers,event,controller){
		return !controller.useMouse && event.targetTouches.length==2;
	},

	start : function(wrappers,event,controller){

	},

	move : function(wrappers,event,controller){
		if (wrappers.length==2){
			var t0=wrappers[0], t1=wrappers[1];
			var disX= (t0.startPageX-t1.startPageX);
			var disY= (t0.startPageY-t1.startPageY);

			var cx=t0.startPageX+(disX>>1), 
				cy=t0.startPageY+(disY>>1);

			var dis=Math.sqrt(disX*disX+disY*disY);

			disX= (t1.pageX-t0.pageX);
			disY= (t1.pageY-t0.pageY);
			var newDis=Math.sqrt(disX*disX+disY*disY);

			var scale=newDis/dis;
			this.trigger(scale,cx,cy,wrappers,event,controller);
		}

	},

	end : function(wrappers,event,controller){

	},

	/* Implement by user */
	trigger : function(scale,cx,cy,wrappers,event,controller){
	
	}


});