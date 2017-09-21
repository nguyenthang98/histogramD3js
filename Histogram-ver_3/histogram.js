d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

(function(){
	const SVG_WIDTH = 600;
	const SVG_HEIGHT = 500;
	const MARGIN = { top: 20, right: 20, bottom: 20, left: 40};
	var svg, line;
	function Histogram(){
		this.width = SVG_WIDTH - MARGIN.left - MARGIN.right;
		this.height = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
		this.numOfBars = 20;
		this.barWidth = this.width/this.numOfBars;
		this.scaleX = d3.scaleLinear().range([0,this.width]);
		this.scaleY = d3.scaleLinear().range([this.height,0]);
		this.dataset = [];
		this.countResult = [];
		this.RangeMax = 0;
		this.RangeMin = 0;
		this.barRange = 0;
		this.updateScale = function(){
			this.scaleX.domain([this.RangeMin, this.RangeMax]);
			this.scaleY.domain([0,d3.max(this.countResult)]);
		}
		this.updateCountResult = function(){
			this.countResult = count(this.dataset, this.numOfBars, this.RangeMin, this.RangeMax);
		}
		this.updateNumOfBars = function(numOfBars){
			this.numOfBars = numOfBars;
			this.barWidth = this.width / this.numOfBars;
			this.barRange = (this.RangeMax - this.RangeMin) / this.numOfBars;
			this.updateCountResult();
			this.updateScale();
		};
		this.updateDataset = function(dataset,min,max){
			this.dataset = dataset;
			this.RangeMin = min;
			this.RangeMax = max;
			this.barRange = (this.RangeMax - this.RangeMin) / this.numOfBars;
			this.updateCountResult();
			this.updateScale();
		};
	}
	var count = function(dataset,numOfBars,min,max){
		var data = dataset;
		var maxValue = (max != undefined ? max:Math.ceil(d3.max(dataset)));
		var minValue = (min != undefined ? min:Math.floor(d3.min(dataset)));
		data.sort(function(a,b){ return a-b;})
		var counts = []
		var countRange = (maxValue-minValue)/numOfBars;
		var index = 0;
		for(let i=0; i<data.length; i++){
			if( data[i] >= (countRange*index+minValue) && data[i] <= (countRange*(index+1)+minValue)){
				/*
				* line commented below is only for debug
				* uncomment this if you want to debug
				*/
				// console.log('[',(countRange*index+minValue),(countRange*(index+1)+minValue),']');
				if(!counts[index]) counts.push(1);
				else counts[index] ++;
			}else if(index<numOfBars){
				if(!counts[index]) counts.push(0);
				index++;
				i--;
			}else{
				break;
			}
		}
		return counts;
	};

	var lineChartShowed = true,
		barChartShowed = true;
	window.showLineChart = function(){
		if(!lineChartShowed){
			d3.selectAll('.histogram .line')
				.attr('fill','none')
				.attr('stroke','red');
		}else{
			d3.selectAll('.histogram .line')
			.attr('fill','none')
			.attr('stroke','none');
		}
		lineChartShowed = !lineChartShowed;
	};
	window.showBarChart = function(){
		if(!barChartShowed){
			d3.selectAll(".histogram rect")
				.attr('fill','steelblue')
		}else{
			d3.selectAll(".histogram rect")
				.attr('fill','none')
		}
		barChartShowed = !barChartShowed;
	};

	var drawHistogram = function(histograms){
		svg = d3.selectAll('svg')
			.data(histograms)
			.enter()
				.append('svg')
				.attr('class','histogram')
				.attr('width',SVG_WIDTH)
				.attr('height',SVG_HEIGHT)
				.style('background-color','yellow')
					.append('g')
					.attr( 'transform','translate('+ MARGIN.left + ',' + MARGIN.top + ')' );
		
		svg.each(function(histogram){
			// X Axis
			svg.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", "translate( -1," + histogram.height + ")")
				.call(d3.axisBottom(histogram.scaleX).ticks(5));
			// Y Axis
			svg.append("g")
				.attr("class", "axis axis--y")
				.attr("transform", "translate( -1, 0)")
				.call(d3.axisLeft(histogram.scaleY).ticks(5));
			// Line Chart
			line = d3.line()
					.x(function(d,i){ return histogram.scaleX(i* histogram.barRange + histogram.RangeMin) + histogram.barWidth*0.75/2;})
					.y(function(d){ return histogram.scaleY(d);})
			svg.append('path')
				.attr('class','line')
		});
		updateHistogram(histograms);
	};

	window.updateHistogram = function(histograms){
		d3.selectAll('svg')
			.data(histograms)
			.each(function(histogram){
				var thisSVG = d3.select(this);
				// update X axis
				thisSVG.selectAll(".axis.axis--x")
					.transition().duration(500)
					.attr("transform", "translate( -1," + histogram.height + ")")
					.call(d3.axisBottom(histogram.scaleX).ticks(5))
				// update Y axis
				thisSVG.selectAll('.axis.axis--y')
					.transition().duration(500)
					.attr("transform", "translate( -1, 0)")
					.call(d3.axisLeft(histogram.scaleY).ticks(5));
				// update Bar Chart
				var bar = thisSVG.select('g').selectAll('rect')
					.data(function(){ return histogram.countResult;})
				// remove if not bound
				bar.exit()
					.remove();
				// append if not exist
				bar.enter()
					.append('rect')
					.attr('x',function(d,i){ return histogram.scaleX(i * histogram.barRange + histogram.RangeMin);})
					.attr('y',function(d){ return histogram.height;})
					.attr('height', 0)
				  .transition().duration(500)
					.attr('y',function(d){ return histogram.scaleY(d);})
					.attr('width',function(d){ return histogram.barWidth * 0.75;})
					.attr('height',function(d){ return histogram.height - histogram.scaleY(d);})
					.attr('fill','steelblue');
				// update status if existing
				bar.transition().duration(500)
					.attr('x',function(d,i){ return histogram.scaleX(i * histogram.barRange + histogram.RangeMin);})
					.attr('y',function(d){ return histogram.scaleY(d);})
					.attr('width',function(d){ return histogram.barWidth * 0.75;})
					.attr('height',function(d){ return histogram.height - histogram.scaleY(d);})
					.attr('steelblue');
				// update line Chart
				var path = thisSVG.select('path.line').moveToFront()
					.datum(function(){ return histogram.countResult;})
						.transition().duration(500)
						.attr('fill','none')
						.attr('stroke','red')
						.attr("stroke-linejoin", "round")
						.attr("stroke-linecap", "round")
						.attr("stroke-width", 1.5)
						.attr('d',line);
			})
	};
	window.histograms = [];
	window.createHistogram = function(dataset,config,minValue,maxValue){
		var histogram = new Histogram();

		// Set up the max and min value of data's Range
		if(maxValue != undefined) histogram.RangeMax = maxValue;
		else histogram.RangeMax = d3.max(dataset);
		if(minValue != undefined) histogram.RangeMin = minValue;
		else histogram.RangeMin = d3.min(dataset);

		//console.log('[',histogram.RangeMin,histogram.RangeMax,']');

		histogram.dataset = dataset;
		if(config){
			histogram.updateNumOfBars(config.numOfBars);
		}else histogram.updateNumOfBars(20);

		histograms.push(histogram);
		drawHistogram(histograms);

		return histogram;
	};
})();