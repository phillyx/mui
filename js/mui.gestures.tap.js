/**
 * mui gesture tap and doubleTap
 * @param {type} $
 * @param {type} name
 * @returns {undefined}
 */
(function($, name) {
	//$.removeActionByHookName('gestures', 'tap');

	var lastTarget;
	var lastTapTime;
	/*mui没有提供类似于jq.data('events')获取事件列表的机制
	*使用getEventListeners,做测试。妈蛋，都只能在控制台使用
	*添加全局变量isLongTapAtived以区分longtap和tap,然而 mui.gesture.longtap.js以下写法，无论dom有无添加longtap事件，$.isLongTapAtived = false;都执行，这样区分longtap和tap是不行的
	* 	var handle = function(event, touch) {
		console.log(event.target);
		var session = $.gestures.session;
		var options = this.options;
		switch (event.type) {
			case $.EVENT_START:
				clearTimeout(timer);
				timer = setTimeout(function() {
					$.trigger(session.target, name, touch);
					$.isLongTapAtived = true;
				}, options.holdTimeout);
				break;
			case $.EVENT_MOVE:
				if (touch.distance > options.holdThreshold) {
					clearTimeout(timer);
				}
				break;
			case $.EVENT_END:
			case $.EVENT_CANCEL:
				clearTimeout(timer);
				break;
		}
	};
	*解决方案：1目前看来只能重写tap事件并对longtap再新增一个tapOld事件了,tapOld使用框架的代码
	* 2.$.isLongTapAtived依然添加，只是在每一次dom添加longtap事件时激活
	* 		document.querySelector("#btn").addEventListener('longtap',function(){
	* 		    mui.isLongTapAtived=true;
				console.log('你触发了longtap事件');
			});
	*目前使用第二种方案，代码重复量少，结构清晰，没有新增手势。
	*/
	var getEvents = function(obj) {
		console.log(getEventListeners(obj));
		return typeof(getEventListeners) == "function" && getEventListeners(obj);
	}
	var hasEventype = function(obj, e) {
		var es = getEvents(obj);
		console.log(es[e]);
		return es && !!es[e];
	}
	var handle = function(event, touch) {
		var session = $.gestures.session;
		var options = this.options;
		switch (event.type) {
			case $.EVENT_END:
				if (!touch.isFinal) {
					return;
				}
				var target = session.target;
				if (!target || (target.disabled || (target.classList && target.classList.contains($.className('disabled'))))) {
					return;
				}
				if (touch.distance < options.tapMaxDistance) {
					if (touch.deltaTime < options.tapMaxTime) {
						if ($.options.gestureConfig.doubletap && lastTarget && (lastTarget === target)) { //same target
							if (lastTapTime && (touch.timestamp - lastTapTime) < options.tapMaxInterval) {
								$.trigger(target, 'doubletap', touch);
								lastTapTime = $.now();
								lastTarget = target;
								return;
							}
						}
						$.trigger(target, name, touch);
					} else {
						//如果当前对象添加了长按侦听，略过，否则仍然视为tap事件
						//if (!hasEventype(target, 'longtap')) {
						if (!$.isLongTapAtived) {
							$.trigger(target, name, touch);
						}
						$.isLongTapAtived = false;
					}
					lastTapTime = $.now();
					lastTarget = target;
				}
				break;
		}
	};
	/**
	 * mui gesture tap
	 */
	$.addGesture({
		name: name,
		index: 30,
		handle: handle,
		options: {
			fingers: 1,
			tapMaxInterval: 300,
			tapMaxDistance: 5,
			tapMaxTime: 250
		}
	});
})(mui, 'tap');