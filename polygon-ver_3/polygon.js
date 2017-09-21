const Size = 1000;
const numOfVertices = 10;
var svg = d3.select('body')
			.append('svg')
			.attr('width',Size)
			.attr('height',Size)
			.attr('fill','#333');

// var data = d3.range(numOfVertices).map(function(d,i){ return {x: Math.random()*Size, y: Math.random()*Size}});
var data = [{x: 0, y: 0}, {x: 400,y:  600}, {x: 800,y:  000}, {x: 000,y:  400},{x: 800,y:  400}];

var line = d3.line()
			.x(function(d){ return d.x;})
			.y(function(d){ return d.y;});
/*
function getIntersection(p1,p2,p3,p4){
	var x1 = p1.x, y1 = p1.y;
	var x2 = p2.x, y2 = p2.y;
	var x3 = p3.x, y3 = p3.y;
	var x4 = p4.x, y4 = p4.y;
	var x0=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
	var y0=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
	return {x: x0,y: y0};
};

function onSegment(p1,p2,point){
	if(Math.min(p1.x,p2.x) <= point.x && point.x <= Math.max(p1.x,p2.x)
		&& Math.min(p1.y,p2.y) <= point.y && point.y <= Math.max(p1.y,p2.y))
		return true;
	return false;
}
*/
function isUpwardEdge(p1,p2){
	var start = (p1.x<p2.x ? p1:p2);
	var end = (p1.x<p2.x ? p2:p1);
	if(start.y < end.y) return false;
	else return true;
}
/*
* intersection of two segments
*/
var eps = 0.0000001;
function between(a, b, c) {
    return a-eps <= b && b <= c+eps;
}
function segment_intersection(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!between(x2, x, x1)) {return false;}
        } else {
            if (!between(x1, x, x2)) {return false;}
        }
        if (y1>=y2) {
            if (!between(y2, y, y1)) {return false;}
        } else {
            if (!between(y1, y, y2)) {return false;}
        }
        if (x3>=x4) {
            if (!between(x4, x, x3)) {return false;}
        } else {
            if (!between(x3, x, x4)) {return false;}
        }
        if (y3>=y4) {
            if (!between(y4, y, y3)) {return false;}
        } else {
            if (!between(y3, y, y4)) {return false;}
        }
    }
    return {x: x, y: y};
}
/*
* implement winding number algorithm
*/

function getAngle(p1,p,p2){
	var v1 = {x: p1.x - p.x, y: p1.y - p.y};
	var v2 = {x: p2.x - p.x, y: p2.y - p.y};
	var absV1 = Math.sqrt((v1.x * v1.x) + (v1.y * v1.y));
	var absV2 = Math.sqrt((v2.x * v2.x) + (v2.y * v2.y));
	var cosin = (v1.x * v2.x + v1.y * v2.y)/(absV1 * absV2);
	return Math.acos(cosin);
}

function isInside(point, polygon){
	var INF = {x: Size+100, y: point.y};
	var index = 0, w = 0;
	var sumOfAngle = 0;
	do{
		var next = (index+1)% polygon.length;
		/*
		var intersect = getIntersection(polygon[index],polygon[next],point,INF);
		if(intersect.x <= point.x) continue;
		if(onSegment(polygon[index],polygon[next],intersect)){
			svg.append('circle').attr('cx',intersect.x).attr('cy',intersect.y).attr('r',2).attr('fill','purple');
			if(isUpwardEdge(polygon[index],polygon[next])){
				w --;
			}else{
				w ++;
			}
		}
		*/
		/*
		var intersection = segment_intersection(polygon[index].x, polygon[index].y,
												polygon[next].x, polygon[next].y,
												point.x, point.y,
												INF.x, INF.y);
		if(intersection){
			// svg.append('circle').attr('cx',intersection.x).attr('cy',intersection.y).attr('r',2).attr('fill','purple');
			if(isUpwardEdge(polygon[index],polygon[next])){
				w --;
			}else {
				w ++;
			}
		}*/
		sumOfAngle += getAngle(polygon[index],point,polygon[next]);
		index = next;
	}while(index != 0);
	w = sumOfAngle / (2*Math.PI);
	console.log(w);
	return w;
}

svg.append('path')
	.datum(data)
	.attr('fill','steelblue')
	.attr('stroke','black')
	.attr('d',line);

svg.on('mousemove',function(){
	var m = d3.mouse(this);
	svg.append('circle')
		.attr('cx',m[0])
		.attr('cy',m[1])
		.attr('r',1)
		.attr('fill',()=>{ return (isInside({x: m[0],y: m[1]},data) ? 'green':'red');});
})