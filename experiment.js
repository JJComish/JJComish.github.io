
function diffTest(){
        console.log("dis works");
}

// TODO: check proejct specs for specific size of 
// TODO: should also be const?
// the canvas size
const width = 400
const height = 400

const MIN_VALUE = 0;
const MAX_VALUE = 99;

// TODO: replace with not using global consts but as parameters passed to the generation function
//toggle bubble chart or text representation
//const REPRESENTATION = "text";
//const REPRESENTATION = "bubble";
const REPRESENTATION = "bar";

const NB_VALUES = 25;

var currRep = 0;
var currTrial = 0;
var start = Date.now();

// keep a reference of the canvas
var svg = d3.select(document.getElementsByTagName('svg')[0])

//TODO: replace these with parameters to the function when that is working? If that's even how this is going to be      set, instead may just be variables that are part of the logic?
// var numValues = NB_VALUES;
// var Rep = REPRESENTATION;
// //Entire Generation of 
function generateTrial(numValues, Rep) {
        // the randomly generated set of values between 0 and 99
        var values = d3.range(numValues).map(d => Math.floor(Math.random() * 100)) 
        //TODO Remove debug console logs like this
        console.log(values)
        var pad = 5 //padding for grid layout (text and bubble)
        var numCol, numRow; // number of columns, number of rows
        var bubble_min_radius, bubble_max_radius;
        var _w, _h;

        var font_size;

        if(numValues == 25){
        numCol = 5;
        numRow = 5;
        _w = width/numCol
        _h = height/numRow

        bubble_min_radius = 1;// arbitrary, could be 0, or something else
        bubble_max_radius = (_w/2 - pad*2);

        font_size = 48// arbitrary choice
        }
        var sign = svg.selectAll('g') // create one group element to display each value, puts it at its position
        .data(values)
        .enter()
        .append('g')
        .attr('transform', function(d, i){
        switch(Rep){
        case 'text':
        case 'bubble':
                return 'translate(' + ((i%numCol)*_w + (pad/2)*-1) + ','+ ((Math.floor(i/numRow))*_h + (pad/2)*-1) +')'
        break;
        case 'bar':
                return 'translate(' + (i*width/numValues) + ','+ (height) +')'
        break;
        default: console.error('unknown representation',Rep);
        }

        }).on('click', function(d){
        var end = Date.now();
        //TODO: Trigger post to google sheet?
        console.log("clicked: ",d," with the target ", d3.max(values), " in ", Math.floor((end-start) / 1000)) 
        start = Date.now();
        // TODO: Figure out how to handle actually getting the d3 svg node to update on clicking...
        //return svg.node(NB_VALUES, REPRESENTATION)
        }).style('cursor','pointer')//make it a pointer on mouseover

        if(Rep == "bubble"){

        //that's to create a perceptual scaling by mapping square root of value to radius, but other scaling functions could be used
        var circleRadiusScale = d3.scaleLinear()
        .domain([Math.sqrt(MIN_VALUE), Math.sqrt(MAX_VALUE)])
        .range([bubble_min_radius, bubble_max_radius]);

        //create an 'invisible' circle of size half the max size of a bubble, simply to make it possible to click the smaller circles easily.
        sign.append('circle')
        .attr('cx', _w/2)
        .attr('cy', _w/2)
        .attr('r', bubble_max_radius/2)
        .style('fill', 'white')

        // then, for each cell we appends a circle
        sign.append('circle')
        .attr('cx', _w/2)
        .attr('cy', _w/2)
        .attr('r', d => circleRadiusScale(Math.sqrt(d)))
        .style('fill','black')
        }
        else if(Rep == "text"){

        //create an 'invisible' circle of size half the max size of a bubble, simply to make it possible to click the smaller circles easily.
        sign.append('circle')
        .attr('cx', _w/2)
        .attr('cy', _w/2)
        .attr('r', bubble_max_radius/2)
        .style('fill', 'white')

        sign.append('text')
        .attr('x', _w/2)
        .attr('y', _w/2)
        .attr('text-anchor','middle')
        .attr('font-size', font_size+"px")
        .text(d => d)
        }
        else if(Rep == 'bar'){

        var bar_scale = d3.scaleLinear()
        .domain([MIN_VALUE, MAX_VALUE])
        .range([0, height]);

        sign.append('rect')
        .attr('x', 0)
        .attr('y', d => -bar_scale(d))
        .attr('width', width/NB_VALUES)
        .attr('height', d => bar_scale(d))
        .style('fill','black')
        .style('stroke','white')
        }
        //TODO: check if the node needs te be returned if we've attached to the svg on the document?
        return svg.node()
}
        
// yield generateTrial(NB_VALUES, REPRESENTATION)

        

      
      
      
      
      
      