
// TODO: check proejct specs for specific size of the canvas size
const width = 400
const height = 400

const MIN_VALUE = 0;
const MAX_VALUE = 99;

const NB_VALUES = 25;

var currRep = 0;
var currTrial = 0;
var finished = 0;
var my_p;



// Entire Generation of trials
function generateTrial() {
        
        //Default values 
        var numValues = 3;
        var Rep = "text"

        var trialsPerN = 10;
        var start = Date.now();

        var myDOM = document.getElementsByTagName('svg')[0]
        var my_svg = d3.select("body").select("svg");
       
        my_svg.selectAll("*").remove(); //Cleanup any prior trials
        
        if(currTrial<trialsPerN)
        {
                numValues = 3;
        }
        else if(currTrial>=trialsPerN && currTrial < 2*trialsPerN)
        {
                numValues = 5;
        }
        else if(currTrial>=2*trialsPerN && currTrial < 3*trialsPerN)
        {
                numValues = 9;
        }
        else if(currTrial >= 3*trialsPerN && currTrial <4*trialsPerN)
        {
                numValues = 25;
        }
        else if(currTrial >=4*trialsPerN)
        {
                currRep +=1;
                currTrial = 0;
        }
        else
        {
        console.log("Trial Counting Error...");
        }
        
        if(currRep==0 && oddEven ==0)
        {
                Rep = "text";
        }
        else if(currRep==0 && oddEven ==1)
        {
                Rep = "bar";
        }
        else if(currRep ==1 && oddEven ==0)
        {
                Rep = "bar";
        }
        else if(currRep ==1 && oddEven ==1)
        {
                Rep = "text";
        }
        else if(currRep ==2)
        {
                currTrial = 0;
                if(finished!=1)
                {
                        endExperiment();
                }
                finished = 1;
                return;
        }
        else
        {
                console.log("Representation handling Error...");
        }

        var svg = my_svg;

        // the randomly generated set of values between 0 and 99
        var values = d3.range(numValues).map(d => Math.floor(Math.random() * 100)) 
        console.log("Trial Values: ",values)
        var pad = 5 //padding for grid layout (text and bubble)
        var numCol, numRow; // number of columns, number of rows
        var bubble_min_radius, bubble_max_radius;
        var _w, _h;

        var font_size;

        if(numValues == 3)
        {
                numCol = 2;
                numRow = 2;
        }
        else if(numValues == 5)
        {
                numCol = 3;
                numRow = 3;
        }
        else if(numValues == 9)
        {
                numCol = 3;
                numRow = 3;
        }
        else if(numValues == 25)
        {
                numCol = 5;
                numRow = 5;
        }
        _w = width/numCol
        _h = height/numRow

        bubble_min_radius = 1;// arbitrary, could be 0, or something else
        bubble_max_radius = (_w/2 - pad*2);

        font_size = 18// arbitrary choice (shrinked from inital choice to potentially fit better in all the generated circles)

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

        var clicked_value = d.srcElement.__data__;
        var correct_value = d3.max(values);
        var trialError = Math.abs((correct_value-clicked_value)/(correct_value-d3.min(values)));
        
        document.getElementById('formID').value = userID
        document.getElementById('formTrial').value = currTrial
        document.getElementById('formNum').value = numValues
        document.getElementById('formRep').value = Rep
        document.getElementById('formArray').value = values
        document.getElementById('formValue').value = clicked_value
        document.getElementById('formTarget').value = correct_value
        document.getElementById('formTime').value = (end-start)
        document.getElementById('formError').value = trialError

        fetch(scriptURL, { method: 'POST', body: new FormData(form)})
        .then(response => console.log('Success!', response))
        .catch(error => console.error('Error!', error.message))

        console.log("Trial: ", currTrial, " of Representation: ", Rep, " clicked: ", clicked_value," with the target ", correct_value, " in ", (end-start), "ms") 
        generateTrial();
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

        currTrial +=1;
        return svg.node()
}


//Handling unique user IDs for each running of the experiment.
function uuidv4() 
{
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
}
      
var userID = uuidv4();
var oddEven = (Math.floor(Math.random()*100))%2;
console.log(oddEven);

function startExperiment()
{
        currTrial = 0;
        currRep = 0;
        generateTrial();
        var start= document.getElementById("startDIV");
        start.style.display = "none";
}
function endExperiment()
{
        var my_p = d3.select("#End").append("p").text("Here is the end of the experiment.\n Thank you for finishing the experiment!");
        my_p.style("font-size","25px");
        var intro = document.getElementById("Intro");
        intro.style.display = "none";
        
        var start= document.getElementById("startDIV");
        start.style.display = "none";

       var restart = document.getElementById("restartDIV");
        restart.style.display = "block";

        

}

function checkBrowser()
{
        if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) 
        {
                return 'Opera';
        }
        else if(navigator.userAgent.indexOf("Chrome") != -1 )
        {
                return 'Chrome';
        }
        else if(navigator.userAgent.indexOf("Safari") != -1)
        {
                return 'Safari';
        }
        else if(navigator.userAgent.indexOf("Firefox") != -1 ) 
        {
                return 'Firefox';
        }
        else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) //IF IE > 10
        {
                return 'IE'; 
        }  
        else 
        {
                return 'unknown';
        }     

}

        

      
      
      
      
      
      