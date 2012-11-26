
;(function(scope,undefined){

	var NS=scope.Toucher=scope.Toucher||{};
	var CONST=NS.CONST=NS.CONST||{};

	CONST.EVENT_LIST=["touches","changedTouches","targetTouches"];

	var Listener=NS.Listener = function(cfg){	

		for (var property in cfg ){
			this[property]=cfg[property];
		}

	};

	/* Use to create your custom-listener */
	// It's duck-type, GT-Toucher doesn't care the result of "instanceof" 
	Listener.extend=function(proto){
		var pl=this;
		var con=function(cfg){
			for (var property in cfg ){
				this[property]=cfg[property];
			}
		};
		var pt=pl.prototype;
		for (var property in pt ){
			con.prototype[property]=pt[property];
		}
		for (var property in proto ){
			con.prototype[property]=proto[property];
		}
		con.prototype.constructor=con;
		con.extend=pl.extend;
		return con;
	}

	Listener.prototype={

		constructor : Listener ,
		id : null,
		type : null ,

		offsetLeft : 0 ,
		offsetTop : 0 ,

		order : 1 ,

		beforeInit : function(){},
		init : function(){
			this.beforeInit();
			
			//TODO
			// ... ...
			
			this.onInit();
		},
		onInit : function(){},

		filterWrappers : function(wrappers,event,controller){
			var validWrappers=[];
			for (var j=wrappers.length-1;j>=0;j--){
				var touchWrapper=wrappers[j];
				if (this.filterWrapper(touchWrapper,event,controller)){
					validWrappers.push(touchWrapper)
				}
			}
			return validWrappers;

		},

		/* Implement by user */
		filterWrapper : function(touchWrapper,event,controller){
			return false;
		},

		/* Implement by user */
		// function(vaildWrappers, event, controller){ } 
		start : null , 

		// function(vaildWrappers, event, controller){ } 
		move : null ,

		// function(vaildWrappers, event, controller){ } 
		end : null 

	};






	
})(this);