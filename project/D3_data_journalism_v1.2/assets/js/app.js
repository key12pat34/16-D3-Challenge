// ......................
// Setting up SVG area
var svgWidth = 1000;
var svgHeight = 500;

var Margin = {
    top: 20,
    right: 6,
    bottom: 80,
    left: 75
};

var width = svgWidth - Margin.left - Margin.right;
var height = width * 4/5;

// ......................
// Create an SVG wrapper, to hold scatter chart
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  
// ......................
// X and Y axix labels 
// ......................

let margin = Margin.right;
let labelArea = Margin.right * 24;
let padding = Margin.right * 8;

// x and y-axis label areas(Rectangle)
let botTextX =  (width - labelArea)/2 + labelArea;
let botTextY = height - margin - padding;

let lefttextX = margin + padding;
let leftTextY = (height + labelArea)/2 - labelArea;

// g tag for x-axis labels
let xAxisText = svg.append("g")
    .attr("class", "xAxisText")
    .attr("transform",`translate(${botTextX}, ${botTextY})`);

// appending text to the x-axis group
xAxisText.append("text")
    .attr("y", -19)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class","aText active x")
    .text("In Poverty (%)");

xAxisText.append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Age (Median)");

xAxisText.append("text")
    .attr("y", 19)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Household Income (Median)");

// g tag for y-axis labels
let yAxisText = svg.append("g")
    .attr("class", "yAxisText")
    .attr("transform",`translate(${lefttextX}, ${leftTextY}) rotate(-90)`);

// appending text to the y-axis group
yAxisText.append("text")
    .attr("y", -22)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    // .attr("onclick", "")
    .text("Obese (%)");

yAxisText.append("text")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");

yAxisText.append("text")
    .attr("y", 22)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Lacks Healthcare (%)");


// ......................
// Reading the data
d3.csv("assets/data/data.csv").then((data) => {
       
    // Initial x and y parameters
    let initX = "poverty";
    let initY = "healthcare";
    
    // Tool Tip box (state, selected X and selected Y)
    let toolTIP = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html((data) => {
            //tooltip text box
            let STATE = `<div>${data.state}</div>`;
            let yLine = `<div>${initY}: ${data[initY]}%</div>`;
            // let xLine;

            if (initX === "poverty") {
                  xLine = `<div>${initX}: ${data[initX]}%</div>`
            } 
            else {
                xLine = `<div>${initX}: ${parseFloat(data[initX]).toLocaleString("en")}</div>`;
            }

            return STATE + xLine + yLine  
    });
    
    // adding tooltip to svg
    svg.call(toolTIP);


   
    // Axis updater function (on click)
    function  labelUpdate(Axis, ClickedText) {
        // switches active label to inactive
        d3.selectAll(".aText")
            .filter("." + Axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);
        
        // switches text to active (on click)
        ClickedText.classed("inactive", false).classed("active", true);
    }
    
    // ......................
    // scatter plot line scaling

    // max and min varibles (x and y)
    let xMin;
    let xMax;
    let yMin;
    let yMax;
    
    // Finding the data max & min values for scaling 
    // (scaled each min and max by up to a factor of 2 total)
    function xaxisminmax() {
        xMin = d3.min(data, (item) => {
            return parseFloat(item[initX]) * 0.80;
        });
        
        xMax = d3.max(data,  (item) => {
            return parseFloat(item[initX]) * 1.2;
        });     
    }
    xaxisminmax();

    function yaxisminmax() {
        yMin = d3.min(data,  (item) => { 
            return parseFloat(item[initY]) * 0.80;
        });
        
        yMax = d3.max(data,  (item) => {
            return parseFloat(item[initY]) * 1.2;
        }); 
    }
    yaxisminmax();
    
    console.log(`xMin: ${xMin}`);
    console.log(`xMax: ${xMax}`);
    console.log(`yMin: ${yMin}`);
    console.log(`yMax: ${yMax}`);

    let XLinearScale = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin]);
    
    let YLinearScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin]);

    
    // ......................
    // Create scaled X and Y axis
    let XAxis = d3.axisBottom(XLinearScale);
    let YAxis = d3.axisLeft(YLinearScale);

    XAxis.ticks(10);
    YAxis.ticks(10);

  
    // append axis lines to the svg
    svg.append("g")
        .call(XAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(0, ${height - margin - labelArea})`
    );
    
    svg.append("g")
        .call(YAxis)
        .attr("class", "yAxis")
        .attr("transform", `translate(${margin + labelArea}, 0 )`
    );

    // ......................
    // Appending circles for each data row 
    let circles = svg.selectAll("g Circles").data(data).enter();
    
    circles
        .append("circle")
        .attr("cx", (data1) => {return XLinearScale(data1[initX]);})
        .attr("cy", (data2) => {return YLinearScale(data2[initY]);})
        .attr("r", 10)
        .attr("class",  (data3) => {return "stateCircle " + data3.abbr;})
        .on('mouseover', function(data4) { toolTIP.show(data4, this); }) 
        .on('mouseout', function(data5) { toolTIP.hide(data5, this); })     

    

    // ......................
    // Appending state text on circles 
    circles.append("text")
            .attr("font-size", 8)
            .attr("class", "stateText")
            .attr("dx", (data1) => {return XLinearScale(data1[initX]);})
            .attr("dy", (data2) => {return YLinearScale(data2[initY]) + 8/3;})
            .text( (data3) => {return data3.abbr;})
            .on('mouseover', function(data4) { toolTIP.show(data4, this); }) 
            .on('mouseout', function(data5) { toolTIP.hide(data5, this); }) 


    // ......................
    // Dynamic graph on click
    d3.selectAll(".aText").on("click", (datA) => {
        
    
        // If inactive selected
        if (d3.select(this).classed("inactive") = true) {
            
            var axis = d3.select(this).attr("data-axis")
            var name = d3.select(this).attr("data-name")

            // X axis updater 
            if (axis === "x") {
                
                defaultX = name;

                // min and max of x-range 
                xaxisminmax();
                XLinearScale.domain([xMin, xMax]);
    
                svg.select(".xAxis")
                   .transition().duration(900)
                   .call(XAxis);
                      
                // circle locations
                d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(900).attr("cx", (data1) => {
                          return XLinearScale(data1[initX])
                        })
                });
                
                d3.selectAll(".stateText").each(function() {
                    d3.select(this).transition().duration(900).attr("dx", (data2) => {
                        return XLinearScale(data2[initX])
                    })
                });
                labelUpdate(axis, d3.select(this));
            }
            
            // Y axis updater
            else {
                initY = name;

                // min and max of y-range 
                yaxisminmax();
                YLinearScale.domain([yMin, yMax]);
                
                svg.select(".yAxis").transition().duration(900).call(YAxis);

                // circle locations
                d3.selectAll("circle").each(function() {
                    d3.select(this).transition().duration(900).attr("cy", (data3) => {
                        return YLinearScale(data3[initY])                
                    });
                });

                d3.selectAll(".stateText").each(function() {
                    d3.select(this).transition().duration(900).attr("dy", (data4) => {
                        return YLinearScale(data4[initY]) + 7/3;                          
                    });
                });
                labelUpdate(axis, d3.select(this));
            }
        }
    });
});