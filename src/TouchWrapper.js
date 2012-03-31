
;(function(scope,undefined){

	var NS=scope.Toucher=scope.Toucher||{};
	var CONST=NS.CONST=NS.CONST||{};

	var TouchWrapper=NS.TouchWrapper = function(rawTouch,rawEvent){	

		// no use
		this.rawTouch=rawTouch;
		this.rawEvent=rawEvent;

	};


	TouchWrapper.prototype={

		constructor : TouchWrapper ,
		id : null ,

		init : function(){

		},

		onStart : function(rawTouch){

			this.type=CONST.START;
			this.rawTouch=rawTouch;

			this.touching=true;
		
			this.onUpdate(rawTouch);

			this.startTime=this.endTime=Date.now();
			this.startPageX = this.lastPageX=this.pageX;
			this.startPageY = this.lastPageY=this.pageY;
			this.startTarget= this.lastTarget=this.target;
			this.moveAmountX=0;
			this.moveAmountY=0;

		},

		onMove : function(rawTouch){

			this.type=CONST.MOVE;
			this.rawTouch=rawTouch;

			this.onUpdate(rawTouch);

		},

		onEnd : function(rawTouch){
				
			this.type=CONST.END;
			this.rawTouch=rawTouch;

			this.onUpdate(rawTouch);

			this.endPageX = this.pageX;
			this.endPageY = this.pageY;
			this.endTarget= this.target;

			this.touching=false;

			this.endTime=Date.now();

			
		},


		onUpdate : function(rawTouch){

			this.lastPageX=this.pageX;
			this.lastPageY=this.pageY;
			this.lastTarget=this.target;

			this.pageX=rawTouch.pageX;
			this.pageY=rawTouch.pageY;
			this.target=rawTouch.target;

			this.moveAmountX = this.pageX - this.startPageX;
			this.moveAmountY = this.pageY - this.startPageY;

		}


	};






	
})(this);