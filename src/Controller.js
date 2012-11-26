
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

        this.wrapperClass=this.wrapperClass||NS.TouchWrapper;
    };

Controller.prototype={
    constructor : NS.Controller ,

    wrapperClass : null,

    host : window ,
    dom : document,

    supportMultiTouch : false , 

    useCapture : true ,
    preventDefault : false ,  // is preventDefault All

    preventDefaultStart : false ,
    preventDefaultMove : false ,
    preventDefaultEnd : false ,
    preventDefaultCancel : false ,

    offsetLeft : 0 ,
    offsetTop : 0 ,

    touchLag : 30,
    maxTouch : 5,
    startTouches : null,
    moveTouches : null,
    endTouches : null,

    beforeInit : function(){},
    init : function(){

        this.listenerList=[];

        this.startTouches=[];
        this.moveTouches=[];
        this.endTouches=[];

        this.startTouches.lastTime
            =this.moveTouches.lastTime
            =this.endTouches.lastTime=0;

        this.touched={};
        this.touchedCount=0;

        this.beforeInit();

        var dom=this.dom;
        this.updateOffset(dom);

        if (!("ontouchstart" in this.dom)){
            this.useMouse=true;
            this.supportMultiTouch=false;
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
            Me.onStart(event);
            if (Me.preventDefaultStart || Me.preventDefault){
                event.preventDefault();
            }
        }, this.useCapture );

        dom.addEventListener(CONST.MOVE, function(event){
            Me.onMove(event);   
            if (Me.preventDefaultMove|| Me.preventDefault){
                event.preventDefault();
            }       
        }, this.useCapture );

        dom.addEventListener(CONST.END, function(event){
            Me.onEnd(event);
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


    onStart : function(event){

        var wrappers=this.getStartWrappers(event);
        this._emit("start",wrappers,event);


    },
    onMove : function(event){

        var wrappers=this.getMoveWrappers(event);

        this._emit("move",wrappers,event);

    },
    onEnd : function(event){

        var wrappers=this.getEndWrappers(event);

        this._emit("end",wrappers,event);


    },

    addTouches : function(queue,item){
        if (queue.length>=this.maxTouch){
            queue.shift();
        }
        queue.push(item);
    },
    removeFromTouches : function(queue,item){
        if (queue.length>=this.maxTouch){
            queue.shift();
        }
        queue.push(item);
    },

    getStartWrappers : function(event){ 
        var _now=Date.now();
        var changedList=event[CONST.changedTouches]||[event];

        var startWrappers=[];
        for (var i=changedList.length-1;i>=0;i--){
            var touch=changedList[i];
            var touchId=touch.identifier||CONST.defaultTouchId;

            var touchWrapper=this.touched[touchId];

            touchWrapper=new this.wrapperClass(touchId);
            this.touched[ touchId ]=touchWrapper;
            this.touchedCount++;    
            touchWrapper.start(touch,event);            
            startWrappers.push(touchWrapper);

            var _touches=this.startTouches;
            if (_now-_touches.lastTime>this.touchLag){
                _touches.length=0;
            }
            _touches.lastTime=_now;
            _touches.push(touchWrapper);
        }           
        return startWrappers;
    },

    getMoveWrappers : function(event){  
        var _now=Date.now();
        var changedList=event[CONST.changedTouches]||[event];

        var moveWrappers=[];

        for (var i=changedList.length-1;i>=0;i--){
            var touch=changedList[i];
            var touchId=touch.identifier||CONST.defaultTouchId;

            var touchWrapper=this.touched[touchId];

            if ( touchWrapper ){

                if (!touchWrapper.moveTime){
                    var _touches=this.moveTouches;
                    if (_now-_touches.lastTime>this.touchLag){
                        _touches.length=0;
                    }
                    _touches.lastTime=_now;
                    _touches.push(touchWrapper);
                }

                touchWrapper.move(touch,event);
                moveWrappers.push(touchWrapper);    
                
            }
        }
        return moveWrappers;
    },

    getEndWrappers : function(event){   
        var _now=Date.now();
        var changedList=event[CONST.changedTouches]||[event];
    
    
        var _touched={};
        if (!this.useMouse){
            var _touchedList=event[CONST.touches];
            for (var j=_touchedList.length-1;j>=0;j--){
                var t=_touchedList[j];
                _touched[t.identifier]=true;
            }
        }

        var endWrappers=[];
        for (var i=changedList.length-1;i>=0;i--){
            var touch=changedList[i];
            var touchId=touch.identifier||CONST.defaultTouchId;

            if ( !_touched[touchId]){
                var touchWrapper=this.touched[touchId];
                if ( touchWrapper ){
                    touchWrapper.end(touch);
                    
                    delete this.touched[touchId];
                    this.touchedCount--;
                    
                    endWrappers.push(touchWrapper);

                    var _touches=this.endTouches;
                    if (_now-_touches.lastTime>this.touchLag){
                        _touches.length=0;
                    }
                    _touches.lastTime=_now;
                    _touches.push(touchWrapper);
                    this.removeWrapper(this.startTouches,touchId);
                    this.removeWrapper(this.moveTouches,touchId);
                }
            }
        }

        return endWrappers;
    },

    removeWrapper : function(list,id){
        for (var i=list.length-1;i>=0;i--){
            if (list[i].identifier==id){
                list.splice(i, 1);
                return id;
            }
        }
        return false;
    },
    _emit : function(type,wrappers,event){

        var touchWrapper;
        for (var i=this.listenerList.length-1;i>=0;i--){
            var listener=this.listenerList[i];
            if (listener[type]!=null){
                var validWrappers=listener.filterWrappers(wrappers,event,this);
                if (validWrappers.length>0){
                    listener.touching=true;
                    listener[type](validWrappers,event,this);
                }
            }
        }
    },

    addListener : function(listener){
        listener.controller=this;
        listener.offsetLeft=this.offsetLeft;
        listener.offsetTop=this.offsetTop;
        listener.init();
        this.listenerList.push(listener);
        // TODO : order by listener.order
        listener.order=listener.order||0;
    },

    removeListener : function(listener){
        for (var i=this.listenerList.length-1;i>=0;i--){
            if (this.listenerList[i]==listener){
                this.listenerList.splice(i, 1);
                listener.controller=null;
                return listener;
            }
        }
        return null;
    },

    removeAllListener : function(){
        for (var i=this.listenerList.length-1;i>=0;i--){
            listener.controller=null;
        }
        this.listenerList.length=0;
    }

}


    
})(this);

