
	/* 一个自定义的Tap事件 */
	// 在这个示例里,tap的定义是: 
	// 一根手指,按住屏幕,并在800毫秒内抬起,同时在按住屏幕期间手指的移动范围在3像素之内

	Toucher.Tap=Toucher.Listener.extend({

		delay : 800 ,
		limit : 5,

		enabled : false ,

		checkMoveArea : function(touchWrapper){
			var dx=Math.abs(touchWrapper.moveAmountX);
			var dy=Math.abs(touchWrapper.moveAmountY);

			// 如果手指按在屏幕上时,有移动,且移动范围大于3像素,则无效
			return dx<=this.limit && dy<=this.limit;
		},
		checkEndTime : function(touchWrapper){
			return (touchWrapper.endTime-touchWrapper.startTime)<=this.delay;
		},

		start : function(wrapperList,event,touchController){
			// 只有一根手指时有效
			this.enabled=wrapperList.length==1;
		},

		end : function(wrapperList,event,touchController){

			if (this.enabled && wrapperList.length===1){
				//在屏幕上的手指是否在指定区域和时间范围内抬起,太迟了会视为无效tap
				if ( this.checkMoveArea(wrapperList[0]) && this.checkEndTime(wrapperList[0]) ){
					// tap事件要执行的动作
					this.onTap(wrapperList,event,touchController);
				}
			}

			this.enabled=false;
		},



		/* Implement by user */
		isTrigger : function(touchWrapper,wrapperList,touchController){
			return false;
		},
		/* Implement by user */
		onTap : function(wrapperList,event,touchController){

		}


	});


