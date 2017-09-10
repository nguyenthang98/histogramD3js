const SvgWidth = 600, SvgHeight = 500;
var margin = {top: 20, right: 20, bottom: 20, left: 40};
var Width = SvgWidth - margin.left - margin.right;
var Height = SvgHeight - margin.top - margin.bottom;

var numOfBars = 100;
const NumOfElements = 1000000;
const MaxRange = 100000;
//generate randomData
var dataset = d3.range(NumOfElements).map(function(){ return Math.random()*MaxRange}).sort(function(a,b){ return a-b;});

var svg = d3.select('body')
			.append('svg')
			.attr('width',SvgWidth)
			.attr('height',SvgHeight)
			.style('background-color','white');
var g = svg.append('g')
			.attr("transform",'translate('+margin.left+","+margin.top+")");
var x = d3.scaleLinear().rangeRound([0,Width]),
	y = d3.scaleLinear().rangeRound([Height,0]);

var line = d3.line()
    .x(function(d,i) { return i*Width/numOfBars + Width/numOfBars/2; })
    .y(function(d) { return y(d); });

var count = function(){
	return new Promise(function(resolve,reject){
		var counts = []
		var countRange = MaxRange/numOfBars;
		var index = 0;
		for(let i=0; i<dataset.length; i++){
			// console.log('range: ['+countRange*index+","+countRange*(index+1)+"]");
			if(dataset[i]>=countRange*index && dataset[i]<=countRange*(index+1)){
				if(!counts[index]) counts.push(1);
				else counts[index] ++;
			}else if(index<numOfBars){
				index++;
				i--;
			}
		}
		resolve(counts);
	});
}
count().then(function(counts){
	x.domain([0,MaxRange]);
	y.domain([0,d3.max(counts)]);

	g.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + Height + ")")
		.call(d3.axisBottom(x).ticks(4));
	
	g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(5))

    g.selectAll(".bar")
	    .data(counts)
	    .enter().append("rect")
	      .attr("class", "bar")
	      .attr("fill",'steelblue')
	      .attr('stroke','none')
	      .attr("x", function(d,i) { return i*Width/numOfBars; })
	      .attr("y", function(d) { return y(d); })
	      .attr("width", function(){ return Width/numOfBars;})
	      .attr("height", function(d,i) { return Height - y(d); });
	g.append("path")
      .datum(counts)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
})