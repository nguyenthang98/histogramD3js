d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

var ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return Math.random().toString(36).substr(2, 9);
};

(function(){
	const SVG_WIDTH = 600;
	const SVG_HEIGHT = 500;
	const MARGIN = { top: 20, right: 20, bottom: 20, left: 40};
	var svg;

	window.Histogram = function(dataset,config){
		this.width = SVG_WIDTH - MARGIN.left - MARGIN.right;
		this.height = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
		this.numOfBars = 20;
		this.countTarget = null;
		this.dataset = dataset;
		this.condition = null;
		if(config){
			this.numOfBars = (config.numOfBars != undefined ? config.numOfBars : 20);
			/*
			this.RangeMin = (config.min != undefined ? config.min : Math.floor(d3.min(dataset)));
			this.RangeMax = (config.max != undefined ? config.max : Math.ceil(d3.max(dataset)));
			*/
			this.countTarget = config.target;
			if(!this.countTarget) {
				alert("Please enter count target!");
				return;
			}else if(dataset[0][config.target] == undefined){
				alert('undefined count target!');
				return;
			};
			this.condition = (config.condition != undefined ? config.condition : null);
		}
		/**
		* Range setup
		*/
		this.RangeMin = Math.floor(d3.min(this.dataset, function(d){ return +d[config.target];}) / 10)*10;
		this.RangeMax = Math.ceil(d3.max(this.dataset, function(d){ return +d[config.target];}) / 10)*10;
		this.barRange = (this.RangeMax - this.RangeMin) / this.numOfBars;
		this.barWidth = this.width/this.numOfBars;
		/**
		* Scale and count setup
		*/
		this.scaleX = d3.scaleLinear().range([0, this.width]);
		this.scaleY = d3.scaleLinear().range([this.height, 0]);
		this.countResult = [];
		/**
		* show bar and line chart configure
		*/
		this.lineChartShowed = true,
		this.barChartShowed = true;
		/**
		* Some utilities
		*/
		this.id = ID();
		this.line = null;
		this.setup();
	}

	function count(dataset, numOfBars, min, max, target, condition){
		var data = dataset.map(function(d){ return {x: d.x, y: d.y}});
		var compareFunc = function(a,b){ return a[target] - b[target];}

		data.sort(compareFunc);
		var counts = [];
		var countRange = (max - min) / numOfBars;
		var index = 0;
		/**
		* Set up condition to count
		*/
		var conditionTarget = null;
		if(condition){
			conditionTarget = condition[0];
			condition = condition.replace(new RegExp(conditionTarget, 'g'),'conFactor');
		} else {
			condition = "true";
		}
		for(var i = 0; i < data.length; ++i){
			var conFactor = undefined;
			if(conditionTarget){
				conFactor = data[i][conditionTarget];
			};
			if( data[i][target] >= (countRange * index + min) && data[i][target] <= (countRange * (index + 1) + min)){
				/*
				* line commented below is only for debug
				* uncomment this if you want to debug
				*/
				// console.log('[',(countRange*index+min),(countRange*(index+1)+min),']');
				if(!counts[index] && eval(condition))
					counts.push(1);
				else if(eval(condition)) 
					++counts[index];
			}else if(index < numOfBars){
				if(!counts[index]) counts.push(0);
				index++;
				i--;
			}else{
				break;
			}
		}
		if(index == numOfBars)
			counts[index - 1] += counts[index];
		counts.slice(index);
		return counts;
	};
	Histogram.prototype.draw = function(){
		svg = d3.select('body').data([this])/*.selectAll('svg')
			.data([this])
			.enter()*/
				.append('svg')
				.attr('class','histogram')
				.attr('id',function(d){ return d.id;})
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
			histogram.line = d3.line()
					.x(function(d,i){ return histogram.scaleX(i* histogram.barRange + histogram.RangeMin) + histogram.barWidth*0.95/2;})
					.y(function(d){ return histogram.scaleY(d);})
			svg.append('path')
				.attr('class','line')
		});
	};
	Histogram.prototype.updateDraw = function(){
		d3.select('svg#' + this.id)
			.data([this])
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
					.attr('width',function(d){ return histogram.barWidth * 0.95;})
					.attr('height',function(d){ return histogram.height - histogram.scaleY(d);})
					.attr('fill','steelblue');
				// update status if existing
				bar.transition().duration(500)
					.attr('x',function(d,i){ return histogram.scaleX(i * histogram.barRange + histogram.RangeMin);})
					.attr('y',function(d){ return histogram.scaleY(d);})
					.attr('width',function(d){ return histogram.barWidth * 0.95;})
					.attr('height',function(d){ return histogram.height - histogram.scaleY(d);})
					.attr('fill','steelblue');
				// update line Chart
				var path = thisSVG.select('path.line').moveToFront()
					.datum(function(){ return histogram.countResult;})
						.transition().duration(500)
						.attr('fill','none')
						.attr('stroke','red')
						.attr("stroke-linejoin", "round")
						.attr("stroke-linecap", "round")
						.attr("stroke-width", 1.5)
						.attr('d',histogram.line);
			});
	};
	Histogram.prototype.updateScale = function(){
		this.scaleX.domain([this.RangeMin, this.RangeMax]);
		this.scaleY.domain([0, d3.max(this.countResult)]);
	};
	Histogram.prototype.updateCountResult = function(){
		this.countResult = count(this.dataset, this.numOfBars, this.RangeMin, this.RangeMax, this.countTarget, this.condition);
	};
	Histogram.prototype.updateNumOfBars = function(numOfBars){
		this.numOfBars = numOfBars;
		this.barWidth = this.width / this.numOfBars;
		this.barRange = (this.RangeMax - this.RangeMin) / this.numOfBars;
		this.updateCountResult();
		this.updateScale();
	};
	Histogram.prototype.updateDataset = function(dataset){
		var his = this;
		this.dataset = dataset;
		this.RangeMin = Math.floor( d3.min( this.dataset, function(d){ return +d[his.countTarget];}) / 10) * 10;
		this.RangeMax = Math.ceil( d3.max( this.dataset, function(d){ return +d[his.countTarget];}) / 10) *10;
		this.barRange = (this.RangeMax - this.RangeMin) / this.numOfBars;
		this.updateCountResult();
		this.updateScale();
	};
	Histogram.prototype.updateCountTarget = function(newTarget){
		if(this.dataset[0][newTarget] == undefined){
			alert("undefined target! Try again.");
			return ;
		};
		this.countTarget = newTarget;
		this.RangeMin = Math.floor(d3.min(this.dataset, function(d){ return +d[newTarget];}) /10) * 10;
		this.RangeMax = Math.ceil(d3.max(this.dataset, function(d){ return +d[newTarget];}) /10) * 10;
		this.barRange = (this.RangeMax - this.RangeMin) / this.numOfBars;
		this.updateCountResult();
		this.updateScale();
	};
	Histogram.prototype.updateCondition = function(newCondition){
		if(newCondition == '' || newCondition == undefined)
			this.condition = null;
		else
			this.condition = newCondition;
		this.updateCountResult();
		this.updateScale();
	}
	Histogram.prototype.setup = function(){
		this.updateCountResult();
		this.updateScale();

		this.draw();
		this.updateDraw();
	}
	Histogram.prototype.showLineChart = function(){
		if(!this.lineChartShowed){
			d3.selectAll('.histogram .line')
				.attr('fill','none')
				.attr('stroke','red');
		}else{
			d3.selectAll('.histogram .line')
			.attr('fill','none')
			.attr('stroke','none');
		}
		this.lineChartShowed = !this.lineChartShowed;
	};
	Histogram.prototype.showBarChart = function(){
		if(!this.barChartShowed){
			d3.selectAll(".histogram rect")
				.attr('fill','steelblue')
		}else{
			d3.selectAll(".histogram rect")
				.attr('fill','none')
		}
		this.barChartShowed = !this.barChartShowed;
	};
})();