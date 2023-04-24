class WebView {
	messageHandlers = {};
	responseCallbacks = {};
	uniqueId = 1;
	/**
	 * webView: uni-app 的webview组件
	 * UniJsBridgeName: 前端挂载在window下的全局方法，是需要配合前端uni-js-bridge的npm包使用的，目前uni-js-bridge的npm包全局变量为UniJsBridge
	 */
	constructor(webView, UniJsBridgeName = 'UniJsBridge') {
		this.webViewRef = webView
		this.UniJsBridgeName = UniJsBridgeName
	}
	
	/**
	 * 调用前端JS,都需要通过此函数
	 * 
	 * @param {String} handlerName	前端注册的函数名
	 * @param {Object} data			给前端的回调的参数
	 * @param {Function} callback	调用完前端的回调
	 */
	callHandler(handlerName, data, responseCallback, responseId) {
		
		let messageJSON = {
			handlerName, 	// 前端注册的函数名
			responseId,		// 前端对应的自己的回调函数
			responseData: data, // 给前端的参数
		}
		
		/**
		 * 把回调函数存在集合中
		 * 等待H5来调用
		 * @param {Object} responseCallback
		 */
		if (responseCallback) {
			let callbackId = 'uni_app_cb_' + (this.uniqueId++) + '_' + new Date().getTime()
			this.responseCallbacks[callbackId] = responseCallback
			messageJSON.callbackId = callbackId
		}
		
		messageJSON = JSON.stringify(messageJSON)
		this.webViewRef.evalJs(`${this.UniJsBridgeName}._handleMessageFromNative(${messageJSON})`)
	}
	
	/**
	 * 注册线程 往数组里面添加值，被动的等待着H5调用的
	 * @param {Object} handlerName
	 * @param {Object} handler			
	 */
	registerHandler(handlerName, handler) {
		this.messageHandlers[handlerName] = handler;
	}
	
	/**
	 * 设置默认处理函数，如果前端用send函数给客户端发消息，就走此函数
	 * 其实和registerHandler是一样的，只不过可以省略一个参数
	 */
	setDefaultHandler(handler) {
		this.messageHandlers['send'] = handler;
	}
	
	/**
	 * 向H5发消息
	 * @param {Object} message
	 */
	send(message, responseCallback) {
		this.callHandler(null, message, responseCallback)
	}
}

export default WebView