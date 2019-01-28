import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import {event as currentEvent} from 'd3-selection';
import * as d3Queue from 'd3-queue'
import * as d3Voronoi from 'd3-voronoi'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3Queue);

const mapEl = $(".interactive-wrapper");

let width = mapEl.getBoundingClientRect().width;

let allWidth = 300;
let smallWidth = 200;
let radius = 140;
let pointRadius = 5.5;
let phyllotaxisRadius = 9;
let smallPhyllotaxisRadius = 10;

const tooltip = d3.select('#nfl-tooltip')


if(width > 400){
	allWidth = 330;
	smallWidth = 180;
	radius = 150;
	phyllotaxisRadius = 10;
	smallPhyllotaxisRadius = 8.5;
}

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

let svgPBP = d3.select("#pbp-wraper")
.append('svg')
.attr("width", smallWidth)
.attr("height", smallWidth)

let divPBP = d3.select("#pbp-wraper")
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
	d3.csv("<%= path %>/assets/NFL Broadcasters - Sheet5.csv")
	])
.then(ready)

function ready(data){

	let nodes = data[0].map(d => {
		return {
			black: d.Black,
			class:d.Name + ' ' + d.Black,
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
	.on('end', d => {console.log(phyllotaxisNode)})

	let phyllotaxisNode = svgAll.selectAll("circle")
	.data(philoNodes)
	.enter()
	.append("circle")
	.attr("class", d => nodes[d.index].class)
	.attr("r", d => d.r )
	.attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('transform', 'translate(' + (allWidth /2 ) + ',' + (allWidth /2) + ')')
    .on('mouseover', (d,i) => {printTooltip(nodes[i])})


    divAll.html(nodes.filter(d => d.black == 'Yes').length + "/" +philoNodes.length)

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
    .on('mouseover', (d,i) => {printTooltip(nodes[i])})

    divAnalysts.html(analysts.filter(d => d.black == 'Yes').length + "/" +philoAnalysts.length)

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
    .on('mouseover', (d,i) => {printTooltip(nodes[i])})

    divPBP.html(pbp.filter(d => d.black == 'Yes').length + "/" +philoPBP.length)

    let philoSideline = d3.range(sidelines.length).map(phyllotaxis(smallPhyllotaxisRadius));

    let s3 = makeSimulation();

	s3.nodes(philoSideline)
	.on("tick", d => {
		phyllotaxisSideline.attr("cx", d => d.x)
		phyllotaxisSideline.attr("cy", d => d.y);
	})

    let phyllotaxisSideline = svgSideline.append('g')
    .selectAll("circle")
	.data(philoSideline)
	.enter()
	.append("circle")
	.attr("class", d => sidelines[d.index].class)
	.attr("r", d => d.r )
	.attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('transform', 'translate(' + (smallWidth /2) + ',' + (smallWidth /2) + ')')
    .on('mouseover', (d,i) => {printTooltip(nodes[i])})

    divSideline.html(sidelines.filter(d => d.black == 'Yes').length + "/" + philoSideline.length)

}


function phyllotaxis(radius) {
  let theta = 2.4;//Math.PI * (3 - Math.sqrt(5));
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

function printTooltip(node){
	tooltip.select('#tooltip-name').html(node.name)
	tooltip.select('#tooltip-ethnicity').html(node.black)
	tooltip.select('#tooltip-role').html(node.role)
	tooltip.select('#tooltip-network').html(node.network)
}