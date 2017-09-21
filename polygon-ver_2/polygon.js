const Size = 1000;
const numOfVertices = 10;
var svg = d3.select('body')
			.append('svg')
			.attr('width',Size)
			.attr('height',Size)
			.attr('fill','#333');

// var data = d3.range(numOfVertices).map(function(d,i){ return {x: Math.random()*Size, y: Math.random()*Size}});
var data = [{x: 0, y: 0}, {x: 400,y:  600}, {x: 800,y:  000}, {x: 000,y:  400},{x: 800,y:  400}];

// check if q is on Segment p1p2 when p1,p2,q are colinear
function onSegment(p1,q,p2){
	if (q.x <= Math.max(p1.x, p2.x) && q.x >= Math.min(p1.x, p2.x) &&
        q.y <= Math.max(p1.y, p2.y) && q.y >= Math.min(p1.y, p2.y))
       return true;
    return false;
}
//Huong quay
function orientations(p1,q,p2){
	var val = (q.y - p1.y) * (p2.x - q.x) - (q.x - p1.x) * (p2.y - q.y);
	if(val === 0) return 0;
	else return (val>0) ? 1:2;
}
//do intersect bettween p1p2 and q1q2
function doIntersect(p1,p2,q1,q2){
	var o1 = orientations(p1,p2,q1);
	var o2 = orientations(p1,p2,q2);
	var o3 = orientations(q1,q2,p1);
	var o4 = orientations(q1,q2,p2);
	// general case
	if(o1 != o2 && o3 != o4) return true;
	//special cases
	//p1,p2,q1 are colinear and q1 is on Segment p1p2
	if(o1==0 && onSegment(p1,q1,p2)) return true;
	//p1,p2,q2 are colinear and q2 is on Segment p1p2
	if(o2==0 && onSegment(p1,q2,p2)) return true;
	//q1,q2,p1 are colinear and p1 is on Segment q1q2
	if(o3==0 && onSegment(q1,p1,q2)) return true;
	//q1,q2,p2 are colinear and p2 is on Segment q1q2
	if(o4==0 && onSegment(q1,p2,q2)) return true;
	//ortherwise is false;
	return false;
}
function getIntersection(p1,p2,p3,p4){
	var x1 = p1.x, y1 = p1.y;
	var x2 = p2.x, y2 = p2.y;
	var x3 = p3.x, y3 = p3.y;
	var x4 = p4.x, y4 = p4.y;
	var x0=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
	var y0=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
	return {x: x0,y: y0};
};
function isInside(point, polygon){
	var INF = {x: Size+100, y: point.y};
	var index = 0,count = 0;
	do{
		var next = (index+1)% polygon.length;
		if(doIntersect(polygon[index],polygon[next],point,INF)){
			if (orientations(polygon[index], point, polygon[next]) == 0)
               return onSegment(polygon[index], point, polygon[next]);
			count++;
		}
		index = next;
	}while(index != 0);

	return (count%2);
};
var line = d3.line()
			.x(function(d){ return d.x;})
			.y(function(d){ return d.y;});

svg.append('path')
	.datum(data)
	.attr('fill','steelblue')
	.attr('stroke','none')
	.attr('d',line);
svg.on('mousemove',function(){
	var m = d3.mouse(this);
	svg.append('circle')
		.attr('cx',m[0])
		.attr('cy',m[1])
		.attr('r',1)
		.attr('fill',()=>{ return (isInside({x: m[0],y: m[1]},data) ? 'green':'red');});
})