
	/* 一个自定义的Tap事件 */
	// 在这个示例里,tap的定义是: 
	// 一根手指,按住屏幕,并在800毫秒内抬起,同时在按住屏幕期间手指的移动范围在3像素之内

	Toucher.Tap=Toucher.Listener.extend({

		delay : 800 ,
		limit : 3,

		enabled : false ,

		start : function(touchWrappers,event,touchController){
			// 只有一根手指时有效
			this.enabled=touchWrappers.length==1;
		},

		move : function(touchWrappers,event,touchController){
			var touchWrapper=touchWrappers[0];
			var dx=Math.abs(touchWrapper.moveAmountX);
			var dy=Math.abs(touchWrapper.moveAmountY);

			// 如果手指按在屏幕上时,有移动,且移动范围大于3像素,则无效
			if (dx>this.limit || dy>this.limit){
				this.enabled=false;
			}			
		},

		end : function(touchWrappers,event,touchController){
			var touchWrapper=touchWrappers[0];

			//手指在屏幕上抬起的太迟了, 也无效
			if ((touchWrapper.endTime-touchWrapper.startTime)>this.delay){
				this.enabled=false;
			}

			if (this.enabled){
				// tap事件要执行的动作
				this.onTap(touchWrappers,event,touchController);
			}

			this.enabled=false;
		},

		/* Implement by user */
		isTrigger : function(touchWrapper){
			return false;
		},
		/* Implement by user */
		onTap : function(touchWrappers,event,touchController){

		}


	});


