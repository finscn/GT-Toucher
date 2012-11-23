

Toucher.Joystick=Toucher.Listener.extend({

	maxRadius : 100,
	moveX : 0,
	moveY : 0,
	moveDistance : 0,
	rotation : 0,

	RAD_TO_DEG : 180/Math.PI,

	move : function(wrappers,event,controller){
		var touchWrapper=wrappers[0];
		var dx=touchWrapper.moveAmountX;
		var dy=touchWrapper.moveAmountY;
		if ( this.touching && (dx || dy) ){

			var rad=Math.atan2(dy, dx);	
			var r= Math.min( this.maxRadius, Math.sqrt(dx*dx+dy*dy) );
			var x= r*Math.cos(rad);
			var y= r*Math.sin(rad);
			this.moveX=x;
			this.moveY=y;
			this.moveDistance=r;
			this.rotation=rad*this.RAD_TO_DEG;
			
			this.onMove(wrappers,event,controller);
		}
	},
	end : function(wrappers,event,controller){
		this.moveX=0;
		this.moveY=0;
		this.moveDistance=0;
		this.rotation=0;
		this.onEnd(wrappers,event,controller);
	},

	/* Implement by user */
	onMove : function(wrappers,event,controller){
	
	},
	/* Implement by user */
	onEnd : function(wrappers,event,controller){
		
	}

});


