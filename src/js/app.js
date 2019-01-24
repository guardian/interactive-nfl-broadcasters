import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import {event as currentEvent} from 'd3-selection';
import * as d3Queue from 'd3-queue'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3Queue);

const dataURL = '<%= path %>/assets/EDITED Chief Executives MASTER final scores - ALL_VISUALS_EDITED_UNIQUE.csv';
const dropDownMenu = d3.select('.dropdown .dropdown-content')
const firstYear = 1998;
const lastYear = 2018;
const countries = ['Argentina','Armenia','Austria','Belarus','Bolivia','Brazil','Bulgaria','Canada','Chile','Colombia','Costa Rica','Croatia','Czech Republic','Dominican Republic','Ecuador','El Salvador','France','Germany','Guatemala','Honduras','Hungary','India','Italy','Latvia','Mexico','Moldova','Netherlands','Nicaragua','Norway','Panama','Paraguay','Peru','Poland','Romania','Russia','Slovakia','Spain','Sweden','Tajikistan','Turkey','UK','Ukraine','United States','Uruguay','Venezuela']

const mapEl = $(".interactive-wrapper");

let width = mapEl.getBoundingClientRect().width;
let height = 300;

let center = {x: width/2, y:height/2}

let populismCenters = {
'out':{x:width/2, y: -2000},
'NA':{x:width / 6, y:center.y},
'Not populist':{x:(width / 6) * 2, y:center.y},
'Somewhat populist':{x:(width / 6) * 3, y:center.y},
'Populist':{x:(width / 6) * 4, y:center.y},
'Very Populist':{x:(width / 6) * 5, y:center.y}
}

let forceStrength = 0.03;

let svg = null;
let bubbles = null;
let nodes = [];

let simulation = d3.forceSimulation()
.velocityDecay(0.2)
.force('x', d3.forceX().strength(forceStrength).x(center.x))
.force('y', d3.forceY().strength(forceStrength).y(center.y))
.force('charge', d3.forceManyBody().strength(charge))
// .on('tick', ticked);

simulation.stop();

svg = d3.select(".interactive-svg")
.append('svg')
.attr("width", width)
.attr("height", height)

Promise.all([
	d3.csv(dataURL)
	])
.then(ready)

function ready(csv){

	let data = csv[0];

	for (let i = lastYear; i >= firstYear; i--){

		dropDownMenu
		.datum(i)
		.append('a')
		.html(i)
		.on('click', d => console.log(d))
	}


	countries.forEach(c => {

		let speechCategory = null;

		let node =  {
        populist1998:speechCategory,
        populist1999:speechCategory,
        populist2000:speechCategory,
        populist2001:speechCategory,
        populist2002:speechCategory,
        populist2003:speechCategory,
        populist2004:speechCategory,
        populist2005:speechCategory,
        populist2006:speechCategory,
        populist2007:speechCategory,
        populist2008:speechCategory,
        populist2009:speechCategory,
        populist2010:speechCategory,
        populist2011:speechCategory,
        populist2012:speechCategory,
        populist2013:speechCategory,
        populist2014:speechCategory,
        populist2015:speechCategory,
        populist2016:speechCategory,
        populist2017:speechCategory,
        populist2018:speechCategory
      };

		let country = data.filter(d => d.country == c)
		console.log(country[0].country)
		let years = country.map(c => +c.yearbegin)
		let populism = country.map(c => c.speech_category)

		let localPopulism = speechCategory;

		for (var i = firstYear; i <= lastYear; i++) {

			if(years.indexOf(i) != -1){
				localPopulism = populism[years.indexOf(i)];
			}

			node['populist' + i] = localPopulism

		}

		console.log(node)


	})

	for(let i = 0; i < countries.length; i++){










		svg
		.append('circle')
		.attr('r', 5)
		.attr('cx', (22 * i) + 5)
		.attr('cy', height / 2)
		.attr('class', countries[i])

		svg
		.append('text')
		.attr('transform', 'translate(' + (22 * i) +','+ ((height / 2) + 20) + ')')
		.text(countries[i].substr(0,2))

		d3.select('.Spain')
		.attr('r', 0)

	}

	
}


function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
 }