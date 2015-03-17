(function() {
	/* Canvas */

	//drawFromStream('461:628,438:648,519:618,540:641,630:634,596:638,');

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

    	message = message.split(',');
    	message.splice(-1, 1);

    	coordinates = [];
    	messageLength = message.length;
    	for (var i = 0; i < messageLength; i++) {
    		coordinate = message[i].split(':');
    		coordinates.push([
    			parseFloat(coordinate[0]), parseFloat(coordinate[1])
    		]);
    	}
    	//console.log(coordinates);

    	var homo_mat = [
    		[-0.001042433086829, -1.689286706623189e-04, 0.999803466389050],
    		[1.997397384632626e-06, 0.001051583733664, -0.019664922506318],
    		[7.095613335978725e-08, -6.874736668895402e-07, 0.002024446296485]
    	];

    	//q = [];
    	plots = [];
    	for (var k = 0; k < messageLength; k++) {
    		var transf = [];
    		for (var a = 0; a < 3; a++) {
    			transf.push(
    				homo_mat[a][0] * coordinates[k][0] + homo_mat[a][1] * coordinates[k][1] + homo_mat[a][2]
    			);
    		}
    		//q.push(transf);
    		plots.push({x: parseInt(transf[0]/transf[2]), y: parseInt(transf[1]/transf[2])});
    	}

    	console.log(plots);
    	if(plots.length > 1) {
    		drawOnCanvas(plots);
    	}
		//if(!message || message.plots.length < 1) return;
		//console.log(message);
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
