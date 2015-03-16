(function() {
	/* Canvas */

	var canvas = document.getElementById('mycanvas');
	var ctx = canvas.getContext('2d');

	 
	ctx.strokeStyle = "black";
	ctx.lineWidth = '1';
	ctx.lineCap = ctx.lineJoin = 'round';

	/* Mouse events */
	canvas.addEventListener('mousedown', startDraw, false);
	canvas.addEventListener('mousemove', draw, false);
	canvas.addEventListener('mouseup', endDraw, false);

	/* PubNub */
	var channel = 'test';

	var pubnub = PUBNUB.init({
		publish_key     : 'pub-c-971c9df7-965f-4386-9f66-99b549f4a60e',
		subscribe_key   : 'sub-c-2dc024b4-c51f-11e4-b3c4-02ee2ddab7fe',
		leave_on_unload : true
	});

	pubnub.subscribe({
		channel: channel,
		message:drawFromStream
	});

	function publish(data) {
		pubnub.publish({
			channel: channel,
			message: data
		});
     }

    /* Draw on canvas */

    function drawOnCanvas(plots) {
		ctx.beginPath();
		ctx.moveTo(plots[0].x, plots[0].y);

    	for(var i=1; i<plots.length; i++) {
	    	ctx.lineTo(plots[i].x, plots[i].y);
	    }
	    ctx.stroke();
    }

    function drawFromStream(message) {
    	if(!message) return;
    	console.log(message)
		//if(!message || message.plots.length < 1) return;
		//drawOnCanvas(message.plots);
    }
    
    // Get Older and Past Drawings!
	pubnub.history({
	    	channel  : channel,
	    	count    : 1000,
	    	callback : function(messages) {
	    		pubnub.each( messages[0], drawFromStream );
			}
	    });
    var isActive = false;
    var plots = [];

	function draw(e) {
		if(!isActive) return;

		// cross-browser canvas coordinates
		var x = e.offsetX || e.layerX - canvas.offsetLeft;
		var y = e.offsetY || e.layerY - canvas.offsetTop;

		plots.push({x: x, y: y});
		
		drawOnCanvas(plots);

	}
	
	function startDraw(e) {
	  	e.preventDefault();
	  	isActive = true;
	}
	
	function endDraw(e) {
	  	e.preventDefault();
	  	isActive = false;
	  
	  	publish({
	  		plots: plots
	  	});

	  	plots = [];
	}
})();
