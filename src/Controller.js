
;(function(scope,undefined){

	var NS=scope.Toucher=scope.Toucher||{};
	var CONST=NS.CONST=NS.CONST||{};

	CONST.touches="touches";
	CONST.changedTouches="changedTouches";
	CONST.targetTouches="targetTouches";
	CONST.defaultTouchId=1;

	var Controller=NS.Controller = function(cfg){	

		for (var property in cfg ){
			this[property]=cfg[property];
		}
	};


Controller.prototype={
	constructor : NS.Controller ,

	host : window ,
	dom : document,

	useMouse : false ,
	supportMultiTouch : false , 

	useCapture : true ,
	preventDefault : false ,  // is preventDefault All

	preventDefaultStart : false ,
	preventDefaultMove : false ,
	preventDefaultEnd : false ,
	preventDefaultCancel : false ,

	offsetLeft : 0 ,
	offsetTop : 0 ,

	beforeInit : function(){},
	init : function(){

		this.listenerList=[];
		this.moveListeners={};
		
		this.startTouchList={};
		this.moveTouchList={};
		this.endTouchList={};

		this.touched={};
		this.touchedCount=0;

		this.beforeInit();

		var dom=this.dom;
		this.updateOffset(dom);
		if (!("ontouchstart" in this.dom)){
			this.useMouse=true;
		}

		if ( this.useMouse ){
			CONST.NOT_START=null;
			CONST.START="mousedown";
			CONST.MOVE="mousemove";
			CONST.END="mouseup";
		}else{
			CONST.NOT_START=null;
			CONST.START="touchstart";
			CONST.MOVE="touchmove";
			CONST.END="touchend";
		}

		var Me=this;
		dom.addEventListener(CONST.START, function(event){			
			Me.start(event);
			if (Me.preventDefaultStart || Me.preventDefault){
				event.preventDefault();
			}
		}, this.useCapture );

		dom.addEventListener(CONST.MOVE, function(event){
			Me.move(event);	
			if (Me.preventDefaultMove|| Me.preventDefault){
				event.preventDefault();
			}		
		}, this.useCapture );

		dom.addEventListener(CONST.END, function(event){
			Me.end(event);
			if (Me.preventDefaultEnd|| Me.preventDefault){
				event.preventDefault();
			} 			
		}, this.useCapture );

		this.onInit();
	},
	onInit : function(){},

	updateOffset : function(dom){
		dom=dom||this.dom;
		if (dom.getBoundingClientRect){
			var rect=dom.getBoundingClientRect();
			this.offsetLeft=rect.left;
			this.offsetTop=rect.top;
			return;
		}
		var left = dom.offsetLeft, top = dom.offsetTop;
		while( (dom = dom.parentNode) 
				&& dom != document.body && dom != document ){
			left += dom.offsetLeft;
			top += dom.offsetTop;
		}
		this.offsetLeft=left;
		this.offsetTop=top;
	},



	start : function(event){

		var touchList=this.getStartTouchList(event);
		this._fire("start",touchList);

	},
	move : function(event){

		var touchList=this.getMoveTouchList(event);

		this._fire("move",touchList);

	},
	end : function(event){

		var touchList=this.getEndTouchList(event);

		this._fire("end",touchList);

	},

	getStartTouchList : function(event){	
		var startTouchList=[];
		var changedList=event[CONST.changedTouches]||[event];
		for (var i=changedList.length-1;i>=0;i--){
			var touch=changedList[i];
			var touchId=touch.identifier||CONST.defaultTouchId;

			var touchWrapper=this.touched[touchId];

			if ( !touchWrapper){
				touchWrapper=new NS.TouchWrapper(touch,event);
				touchWrapper.onStart(touch);			
				this.touched[ touchId ]=touchWrapper;
				this.touchedCount++;	
				startTouchList.push(touchWrapper);
			}else if (this.useMouse){
				touchWrapper.onStart(touch);
				this.touchedCount=1;
				startTouchList.push(touchWrapper);
			}
		}			
		return startTouchList;
	},

	getMoveTouchList : function(event){	
		var moveTouchList=[];
		var changedList=event[CONST.changedTouches]||[event];
		for (var i=changedList.length-1;i>=0;i--){
			var touch=changedList[i];
			var touchId=touch.identifier||CONST.defaultTouchId;

			var touchWrapper=this.touched[touchId];
			if (!touchWrapper && this.useMouse){
				touchWrapper=new NS.TouchWrapper(touch,event);
				touchWrapper.onStart(touch);	
				touchWrapper.touching=false;		
				this.touched[ touchId ]=touchWrapper;
			}
			if ( touchWrapper ){
				touchWrapper.onMove(touch);
				moveTouchList.push(touchWrapper);		
			}
		}
		return moveTouchList;
	},

	getEndTouchList : function(event){	
		var endTouchList=[];

		var changedList=event[CONST.changedTouches]||[event];
		
		var touched;
		if (!this.useMouse){
			touched={};
			var touchedList=event[CONST.touches];
			for (var j=touchedList.length-1;j>=0;j--){
				var t=touchedList[j];
				touched[t.identifier]=true;
			}
		}
		for (var i=changedList.length-1;i>=0;i--){
			var touch=changedList[i];
			var touchId=touch.identifier||CONST.defaultTouchId;

			var isEnd=this.useMouse || !touched[touchId];

			if (isEnd){
				var touchWrapper=this.touched[touchId];
				if ( touchWrapper ){
					touchWrapper.onEnd(touch);
					if (!this.useMouse){
						delete this.touched[touchId];
						this.touchedCount--;
					}else{
						this.touchedCount=0;
					}
					endTouchList.push(touchWrapper);
				}
			}
		}

		return endTouchList;
	},

	_fire : function(type,touchList){

		var touchLast=touchList.length-1;

		for (var i=this.listenerList.length-1;i>=0;i--){
			var listener=this.listenerList[i];
			if (listener[type]!=null){
				var list=[];
				for (var j=touchLast;j>=0;j--){
					var touchWrapper=touchList[j];
					if (listener.isTrigger(touchWrapper)){
						list.push(touchWrapper)
					}
				}
				if (list.length>0){
					if (this.useMouse){
						var touchWrapper=this.touched[CONST.defaultTouchId];
						listener.touching=touchWrapper.touching;
					}else{
						listener.touching=true;
					}
					listener[type](list,event,this);
					touchWrapper.rawTouch=null;
				}
			}
		}
	},



	addListener : function(listener){
		listener.offsetLeft=this.offsetLeft;
		listener.offsetTop=this.offsetTop;
		listener.init();
		this.listenerList.push(listener);
		// TODO : order by listener.order
	},

	removeListener : function(listener){
		for (var i=this.listenerList.length-1;i>=0;i--){
			if (this.listenerList[i]==listener){
				this.listenerList.splice(i, 1);
				return listener;
			}
		}
		return null;
	}

}






	
})(this);

