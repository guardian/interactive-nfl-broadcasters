import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import {event as currentEvent} from 'd3-selection';
import * as d3Queue from 'd3-queue'
import * as d3Voronoi from 'd3-voronoi'
import { $ } from "./util"

console.log('hello')

let d3 = Object.assign({}, d3B, d3Select, d3Queue);

let allWidth = 280;
let smallWidth = 180;
let radius = 120;
let pointRadius = 5.5;
let phyllotaxisRadius = 8;
let smallPhyllotaxisRadius = 8;
let padding = 12;

let tooltip = d3.select('#nfl-tooltip')

let voronoi = d3.voronoi()
.extent([[-1, -1], [allWidth + 1, allWidth + 1]]);


let svgAll = d3.select("#all-broadcasters")
.append('svg')
.attr("width", allWidth)
.attr("height", allWidth)

let divAll = d3.select("#all-broadcasters")
.append('div')
.append('span')
.attr('class', 'sub-header')

let svgAnalysts = d3.select("#analyst-wrapper")
.append('svg')
.attr("width", smallWidth)
.attr("height", smallWidth)

let divAnalysts = d3.select("#analyst-wrapper")
.append('div')
.append('span')
.attr('class', 'sub-header')

let svgPBP = d3.select("#pbp-wrapper")
.append('svg')
.attr("width", smallWidth)
.attr("height", smallWidth)

let divPBP = d3.select("#pbp-wrapper")
.append('div')
.append('span')
.attr('class', 'sub-header')

let svgSideline = d3.select("#sideline-wrapper")
.append('svg')
.attr("width", smallWidth)
.attr("height", smallWidth)

let divSideline = d3.select("#sideline-wrapper")
.append('div')
.append('span')
.attr('class', 'sub-header')

Promise.all([
	d3.csv("<%= path %>/assets/broadcasters - Sheet1.csv")
	])
.then(ready)

function ready(data){

	let nodes = data[0].map(d => {
		return {
			black: d.Black,
			class:d.Name.split("'").join('').split('.').join('') + ' ' + d.Black,
			r: pointRadius,
			name: d.Name,
			role: d.Role,
			network: d['Network/Team']
		}
	})
	nodes.sort((a,b) => (a.black > b.black) ? 1 : ((b.black > a.black) ? -1 : 0)); 
	nodes.reverse()

	let analysts = nodes.filter(d => d.role == 'Analyst')
	let pbp = nodes.filter(d => d.role == 'Play-by-play')
	let sidelines = nodes.filter(d => d.role == 'Sideline')

	let philoNodes = d3.range(nodes.length).map(phyllotaxis(phyllotaxisRadius));

	let s = makeSimulation();

	s.nodes(philoNodes)
	.on("tick", d => {
		phyllotaxisNode.attr("cx", d => d.x)
		phyllotaxisNode.attr("cy", d => d.y);
	})
	.on('end', d => {})

	let phyllotaxisNode = svgAll.selectAll("circle")
	.data(philoNodes)
	.enter()
	.append("circle")
	.attr("class", d => nodes[d.index].class)
	.attr("r", d => d.r )
	.attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('transform', 'translate(' + (allWidth /2 ) + ',' + (allWidth /2) + ')')

    let points = []

    philoNodes.map(d=> {
		points.push([+d.x + allWidth /2, +d.y + allWidth /2])
	})

	const polygons = voronoi(points).polygons();

    let cells = svgAll.selectAll(".cell")
	.data(polygons)
	.enter()
	.append("path")
	.attr("class", (d,i) => {return "cell" + i})
	.attr("opacity", 0)
	.attr("stroke", "black")
	.attr("d", (d,i) => {return "M" + d.join("L") + "Z"})
	.attr('clip-path', "url(#cut-off)")
	.on('mouseover', (d,i) => {printTooltip('over', svgAll, nodes[i])})
	.on('mouseout', (d,i) => {printTooltip('out', svgAll, nodes[i])})
    .on("mousemove", mousemove)


    let total = philoNodes.length;
    let totalBlacks = nodes.filter(d => d.black == 'Yes').length;
    let percentageTotal = Math.round(totalBlacks * 100 / total)

    divAll.html("<span id='nfl-bold'>Total</span><br><span id='nfl-bold'>" + totalBlacks + "</span>/" + total + " <span id='nfl-bold-black'>"+ percentageTotal + "% black</span>")

    let philoAnalysts = d3.range(analysts.length).map(phyllotaxis(smallPhyllotaxisRadius));

    let s1 = makeSimulation();

	s1.nodes(philoAnalysts)
	.on("tick", d => {
		phyllotaxisAnalyst.attr("cx", d => d.x)
		phyllotaxisAnalyst.attr("cy", d => d.y);
	})

    let phyllotaxisAnalyst = svgAnalysts.selectAll("circle")
	.data(philoAnalysts)
	.enter()
	.append("circle")
	.attr("class", d => analysts[d.index].class)
	.attr("r", d => d.r )
	.attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('transform', 'translate(' + (smallWidth /2) + ',' + (smallWidth /2) + ')')

    let points2 = []

    philoAnalysts.map(d=> {
		points2.push([+d.x + smallWidth /2, +d.y + smallWidth /2])
	})

	const polygons2 = voronoi(points2).polygons();

    let cells2 = svgAnalysts.selectAll(".cell")
	.data(polygons2)
	.enter()
	.append("path")
	.attr("class", (d,i) => {return "cell" + i})
	.attr("opacity", 0)
	.attr("stroke", "black")
	.attr("d", (d,i) => {return "M" + d.join("L") + "Z"})
	.attr('clip-path', "url(#cut-off)")
	.on('mouseover', (d,i) => {printTooltip('over', svgAnalysts, analysts[i])})
	.on('mouseout', (d,i) => {printTooltip('out', svgAnalysts, analysts[i])})
    .on("mousemove", mousemove)

    let totalBlackAnalysts = analysts.filter(d => d.black == 'Yes').length;
    let percentageAnalysts = Math.round(totalBlackAnalysts * 100 / philoAnalysts.length)

    divAnalysts.html("<span id='nfl-bold'>Analysts</span><br><span id='nfl-bold'>" + totalBlackAnalysts + "</span>/" + philoAnalysts.length + " <span id='nfl-bold-black'>"+ percentageAnalysts + "%</span>")

    let philoPBP = d3.range(pbp.length).map(phyllotaxis(smallPhyllotaxisRadius));

    let s2 = makeSimulation();

	s2.nodes(philoPBP)
	.on("tick", d => {
		phyllotaxisPBP.attr("cx", d => d.x)
		phyllotaxisPBP.attr("cy", d => d.y);
	})

    let phyllotaxisPBP = svgPBP.selectAll("circle")
	.data(philoPBP)
	.enter()
	.append("circle")
	.attr("class", d => pbp[d.index].class)
	.attr("r", d => d.r )
	.attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('transform', 'translate(' + (smallWidth /2) + ',' + (smallWidth /2) + ')')

    let points3 = []

    philoPBP.map(d=> {
		points3.push([+d.x + smallWidth /2, +d.y + smallWidth /2])
	})

	const polygons3 = voronoi(points3).polygons();

    let cells3 = svgPBP.selectAll(".cell")
	.data(polygons3)
	.enter()
	.append("path")
	.attr("class", (d,i) => {return "cell" + i})
	.attr("opacity", 0)
	.attr("stroke", "black")
	.attr("d", (d,i) => {return "M" + d.join("L") + "Z"})
	.attr('clip-path', "url(#cut-off)")
	.on('mouseover', (d,i) => {printTooltip('over', svgPBP, pbp[i])})
	.on('mouseout', (d,i) => {printTooltip('out', svgPBP, pbp[i])})
    .on("mousemove", mousemove)

    let totalBlackPBP = pbp.filter(d => d.black == 'Yes').length;
    let percentagePBP = Math.round(totalBlackPBP * 100 / philoPBP.length)

    divPBP.html("<span id='nfl-bold'>Play-by-play</span><br><span id='nfl-bold'>" + totalBlackPBP + "</span>/" + philoPBP.length + " <span id='nfl-bold-black'>"+ percentagePBP + "%</span>")

    let philoSideline = d3.range(sidelines.length).map(phyllotaxis(smallPhyllotaxisRadius));

    let s3 = makeSimulation();

	s3.nodes(philoSideline)
	.on("tick", d => {
		phyllotaxisSideline.attr("cx", d => d.x)
		phyllotaxisSideline.attr("cy", d => d.y);
	})

    let phyllotaxisSideline = svgSideline.selectAll("circle")
	.data(philoSideline)
	.enter()
	.append("circle")
	.attr("class", d => sidelines[d.index].class)
	.attr("r", d => d.r )
	.attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('transform', 'translate(' + (smallWidth /2) + ',' + (smallWidth /2) + ')')

    let points4 = []

    philoSideline.map(d=> {
		points4.push([+d.x + smallWidth /2, +d.y + smallWidth /2])
	})

	const polygons4 = voronoi(points4).polygons();

    let cells4 = svgSideline.selectAll(".cell")
	.data(polygons4)
	.enter()
	.append("path")
	.attr("class", (d,i) => {return "cell" + i})
	.attr("opacity", 0)
	.attr("stroke", "black")
	.attr("d", (d,i) => {return "M" + d.join("L") + "Z"})
	.attr('clip-path', "url(#cut-off)")
	.on('mouseover', (d,i) => {printTooltip('over', svgSideline, sidelines[i])})
	.on('mouseout', (d,i) => {printTooltip('out', svgSideline, sidelines[i])})
    .on("mousemove", mousemove)


    let totalBlackSideline = sidelines.filter(d => d.black == 'Yes').length;
    let percentageSideline = Math.round(totalBlackSideline * 100 / philoSideline.length)

    divSideline.html("<span id='nfl-bold'>Sidelines</span><br><span id='nfl-bold'>" + totalBlackSideline + "</span>/" + philoSideline.length + " <span id='nfl-bold-black'>"+ percentageSideline + "%</span>")

    function mousemove(event) {
    	 
    	let posX = document.getElementById('nfl-graphics').getBoundingClientRect().x
    	let posY = document.getElementById('nfl-graphics').getBoundingClientRect().y
    	
		tooltip.style('left', (currentEvent.clientX  - posX) + padding+ 'px')
		tooltip.style('top', (currentEvent.clientY  - posY) + padding + 'px')

		let tWidth = +tooltip.style("width").split('px')[0]
		let tLeft = +tooltip.style("left").split('px')[0]

		if(tLeft + tWidth > width - padding)
		{
			tooltip.style('left', width - tWidth - padding + 'px')
		}
	}

	window.resize()
}


function phyllotaxis(radius) {
  let theta = Math.PI * (3 - Math.sqrt(5));
  return function(i) {
    let r = radius * Math.sqrt(i);
    let a = theta * i;
    return {
      x: r * Math.cos(a),
      y: r * Math.sin(a),
      r: pointRadius
    };
  };
}

function makeSimulation(){
	let simulation = d3.forceSimulation()
	.force("collide", d3.forceCollide()
	.radius(d => d.r))

	return simulation
}

function printTooltip(event,enviroment, node){

	

	if(event == 'over')
	{
		let circle = enviroment.select('.' + node.class.split(' ').join("."));
		circle.style('stroke','black')
		circle.style('stroke-width','3px')

		tooltip.classed(" over", true);
		tooltip.select('#tooltip-name').html(node.name.replace('"', " "))
	}
	else{

		enviroment.selectAll('circle').style('stroke-width','0px')
		tooltip.classed(" over", false);
		
	}

	
}