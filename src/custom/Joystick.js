

Toucher.Joystick=Toucher.Listener.extend({

	maxRadius : 100,
	moveX : 0,
	moveY : 0,
	moveDistance : 0,
	rotation : 0,

	RAD_TO_DEG : 180/Math.PI,

	move : function(wrapperList,event,touchController){
		var touchWrapper=wrapperList[0];
		var dx=touchWrapper.moveAmountX;
		var dy=touchWrapper.moveAmountY;

		var rad=Math.atan2(dy, dx);	
		var r= Math.min( this.maxRadius, Math.sqrt(dx*dx+dy*dy) );
		var x= r*Math.cos(rad);
		var y= r*Math.sin(rad);
		this.moveX=x;
		this.moveY=y;
		this.moveDistance=r;
		this.rotation=rad*this.RAD_TO_DEG;
		if ( this.touching && (dx || dy) ){
			this.onMove(wrapperList,event,touchController);
		}
	},
	end : function(wrapperList,event,touchController){
		this.moveX=0;
		this.moveY=0;
		this.moveDistance=0;
		this.rotation=0;
		this.onEnd(wrapperList,event,touchController);
	},

	/* Implement by user */
	isTrigger : function(touchWrapper,wrapperList,touchController){
		return false;
	},
	/* Implement by user */
	onMove : function(wrapperList,event,touchController){
	
		
	},
	onEnd : function(wrapperList,event,touchController){
	
		
	}

});


