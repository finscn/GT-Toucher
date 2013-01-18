
Toucher.Rotate=Toucher.Listener.extend({
	
	filterWrappers : function(wrappers,event,controller){
		return wrappers.length==2;
	},

	start : function(wrappers,event,controller){

	},

	move : function(wrappers,event,controller){
		if (controller.touchedCount==2){
			var t0=wrappers[0], t1=wrappers[1];
			var disX= (t1.startPageX-t0.startPageX);
			var disY= (t1.startPageY-t0.startPageY);

			var cx=t0.startPageX+(disX>>1), 
				cy=t0.startPageY+(disY>>1);

			var ang=Math.atan2(disY,disX);

			disX= (t1.pageX-t0.pageX);
			disY= (t1.pageY-t0.pageY);
			var newAng=Math.atan2(disY,disX);

			var rotation=newAng-ang;

			this.trigger(rotation,cx,cy,wrappers,event,controller);
		}

	},

	end : function(wrappers,event,controller){

	},

	/* Implement by user */
	trigger : function(rotation,cx,cy,wrappers,event,controller){

	}


});


