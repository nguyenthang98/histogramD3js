(function(){
	//Confingure Histogram
	const Config = {
		svg: {Width: 600,Height: 500},
		margin: {top: 20,right: 20,bottom: 20,left: 40},
		numOfBars: 1000
	};
	var Width = Config.svg.Width - Config.margin.left - Config.margin.right;
	var Height = Config.svg.Height - Config.margin.top - Config.margin.bottom;

	//Setup things
	var barWidth = Width/Config.numOfBars;
	var svg,scaleX,scaleY,group,line;
	svg = d3.select('body')
			.append('svg')
			.attr('width',Config.svg.Width)
			.attr('height',Config.svg.Height)
	group = svg.append('g')
				.attr("id","histogram")
				.attr('transform',"translate("+Config.margin.left+","+Config.margin.top+")");
	scaleX = d3.scaleLinear().rangeRound([0,Width]);
	scaleY = d3.scaleLinear().rangeRound([Height,0]);
	line = d3.line()
			.x(function(d,i) { return i*barWidth + barWidth/2+1; })
    		.y(function(d) { return scaleY(d); });
    var maxValue,minValue;

	function count(dataset){
		maxValue = d3.max(dataset);
		minValue = d3.min(dataset);

		return new Promise(function(resolve,reject){
			dataset.sort(function(a,b){ return a-b;})
			var counts = []
			var countRange = (maxValue-minValue)/Config.numOfBars;
			var index = 0;
			for(let i=0; i<dataset.length; i++){
				if( dataset[i] >= (countRange*index+minValue) && dataset[i] <= (countRange*(index+1)+minValue)){
					if(!counts[index]) counts.push(1);
					else counts[index] ++;
				}else if(index<Config.numOfBars){
					if(!counts[index]) counts.push(0);
					index++;
					i--;
				}else{
					break;
				}
			}
			while(counts.length > Config.numOfBars) console.log(counts.pop());
			resolve(counts);
		});
	};
	window.Histogram = function(dataset){
		var numOfElements = dataset.length;
		count(dataset).then(function(counts){
			window.count = counts;
			scaleX.domain([Math.floor(minValue),Math.ceil(maxValue)]);
			scaleY.domain([0,d3.max(counts)]);
			//axis x
			group.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", "translate( 0," + Height + ")")
				.call(d3.axisBottom(scaleX).ticks(10));
			//axis y
			group.append("g")
				.attr("class", "axis axis--y")
				.call(d3.axisLeft(scaleY).ticks(5));
			//bar chart
		    group.selectAll(".bar")
			    .data(counts)
			    .enter().append("rect")
					.attr("class", "bar")
					.attr("fill",'none')
					.attr('stroke-width',0.1)
					.attr('stroke','none')
					.attr("x", function(d,i) { return i*barWidth+1; })
					.attr("y", function(d) { return scaleY(d); })
					.attr("width", barWidth)
					.attr("height", function(d,i) { return Height - scaleY(d); });
			// line Chart
			group.append("path")
					.attr('id','line')
					.datum(counts)
					.attr("fill", "none")
					.attr("stroke", "none")
					.attr("stroke-linejoin", "round")
					.attr("stroke-linecap", "round")
					.attr("stroke-width", 1.5)
					.attr("d", line);
		});
	};
	var barChartShowed = 0;
	var lineChartShowed = 0;
	window.showLineChart = function(){
		if(!lineChartShowed){
			d3.select('#histogram #line')
				.attr('fill','none')
				.attr('stroke','red');
		}else{
			d3.select('#histogram #line')
			.attr('fill','none')
			.attr('stroke','none');
		}
		lineChartShowed = !lineChartShowed;
	};
	window.showBarChart = function(){
		if(!barChartShowed){
			d3.selectAll("#histogram rect")
				.attr('fill','steelblue')
				.attr('stroke','black');
		}else{
			d3.selectAll("#histogram rect")
				.attr('fill','none')
				.attr('stroke','none');
		}
		barChartShowed = !barChartShowed;
	}
})();