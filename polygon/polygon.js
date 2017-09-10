var SVG_Width = 600;
var SVG_Height = 600;

var svg = d3.select('body')
			.append('svg')
				.attr('width',SVG_Width)
				.attr('height',SVG_Height);
var dataset = d3.range(10).map(function(d,i){
	return {
		x: Math.random()*SVG_Width,
		y: Math.random()*SVG_Height
	}
})

var line = d3.line()
				.x(function(d){ return d.x;})
				.y(function(d){ return d.y;});
svg.append('path')
	.datum(dataset)
	.attr('fill','steelblue')
	.attr('stroke','black')
	.attr('d',line);

function checkInside(point){
	var isInside = false;
	var i,j;
	for(i=0,j = dataset.length-1; i<dataset.length; j=i++){
		if( ((dataset[i].y>point.y) !== (dataset[j].y>point.y)) &&
		(point.x < (dataset[j].x-dataset[i].x)*(point.y-dataset[i].y)/(dataset[j].y-dataset[i].y) + dataset[i].x)){
			isInside = !isInside;
		}
	}
	return isInside;
}

svg.on('mousemove',function(){
	var m = d3.mouse(this);
	var c = svg.append('circle')
		.attr('cx',m[0])
		.attr('cy',m[1])
		.attr('r',4);
	if(checkInside({x: m[0],y: m[1]})){
		c.attr('fill','lightgreen');
	}else{
		c.attr("fill",'red');
	}	
})