<script type="text/javascript">
	var pubnub = PUBNUB.init({ 
		publish_key     : 'pub-c-857510c1-a4d1-4158-8dba-c67f767806cc',
		subscribe_key   : 'sub-c-c5a2bb34-8ed3-11e4-95ed-02ee2ddab7fe'
	}); 
	var channel = 'rtbs';
	pubnub.subscribe({
		channel: channel,
		callback: drawFromStream
	});
	
	 
	
	/* Draw on canvas */
	var canvas = document.getElementById('mycanvas');
	var ctx = canvas.getContext('2d');
	ctx.lineWidth = '1';
	canvas.addEventListener('mousedown', startDraw, false);
	canvas.addEventListener('mousemove', draw, false);
	canvas.addEventListener('mouseup', endDraw, false);
	
	// create a flag
	var isActive = false;

	// array to collect coordinates
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
		isActive = true;
	}

	function endDraw(e) {
		isActive = false;
		pubnub.publish({ 
			channel: channel, 
			message: { 
				plots: plots // your array goes here 
			} 
			});
		// empty the array
		plots = [];
	} 
    function drawOnCanvas(plots) {
    	ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.moveTo(plots[0].x, plots[0].y);

    	for(var i=1; i<plots.length; i++) {
	    	ctx.lineTo(plots[i].x, plots[i].y);
	    }
	    ctx.stroke();
    }

    function drawFromStream(message) {
		if(!message || message.plots.length < 1) return;
		drawOnCanvas(message.plots);
    }
	
</script>