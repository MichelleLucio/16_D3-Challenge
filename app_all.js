//create chart area
let svgWidth = 960;
let svgHeight = 500;

let margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//initial parameters
let chosenXAxis = "poverty";
let chosenYAxis = "obesity";
// let obeseYAxis = "obesity";
// let smokesYAxis = "smokes";
// let healthcareYAxis = "healthcare";
// let povertyXAxis = "poverty";
// let ageXAxis = "age";
// let incomeXAxis = "income";

//function for updating x-scale variable with click on xaxis
function xScale(censusData, chosenXAxis){
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) *0.8,
        d3.max(censusData, d => d[chosenXAxis]) *1.2])
        .range([0, width]);
    return xLinearScale;
}

//function for updating y-scale variable with click on yaxis
function yScale(censusData, chosenYAxis){
    let yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) *0.8,
        d3.max(censusData, d => d[chosenYAxis]) *1.2])
        .range([height, 0]);
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  let bottomXAxis = d3.axisBottom(newXScale);
    xAxis.transition()
    .duration(1000)
    .call(bottomXAxis);
  return xAxis;
}

// function used for updating xAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var bottomYAxis = d3.axisBottom(newYScale);
      yAxis.transition()
      .duration(1000)
      .call(bottomYAxis);
      return xAxis;
  }

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
      return circlesGroup;
  }

 // function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    let xLabel;
        if (chosenXAxis === "poverty") {
        label = "In Poverty (%)";}
        if (chosenXAxis === "age") {
            label = "Age (median)"}
        else {label = "Household Income";}

    let yLabel;
        if (chosenYAxis === "obesity") {
        label = "Obese (%)";}
        if (chosenYAxis === "smokes") {
            label = "Smokes (%)"}
        else {label = "Lacks Healthcare (%)";}
  
    let toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]} "%"<br>${ylabel} ${d[chosenYAxis]} "%"`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  } 

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(censusData, err) {
    if (err) throw err;
  
    // parse data
    censusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });
  
    // xLinearScale function above csv import
    let xLinearScale = xScale(censusData, chosenXAxis);
  
    // xLinearScale function above csv import
    let yLinearScale = yScale(censusData, chosenYAxis);

    // Create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    let xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    chartGroup.append("g")
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("fill", "blue")
      .attr("opacity", ".75");
  
    // Create group for two x-axis labels
    let xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    let ylabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${height / 2}, ${width + 20})`);

// append x axis
    let povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    let ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (median)");
    
    let incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (median)");
  
// append y axis
    let obeseLabel = ylabelsGroup.append("text")
        .attr("y", 0)
        .attr("x", 20)
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", true)
        .text("Obese (%)");

    let smokesLabel = ylabelsGroup.append("text")
        .attr("y", 0)
        .attr("x", 40)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");
      
    let healthLabel = ylabelsGroup.append("text")
        .attr("y", 0)
        .attr("x", 60)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");


    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        let value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
            // replaces chosenXAxis with value
          chosenXAxis = value;
           // console.log(chosenXAxis)
            // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(censusData, chosenXAxis);
            // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);
            // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
            // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
            // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        //   if (chosenXAxis === "age") {
        //     ageLabel
        //       .classed("active", true)
        //       .classed("inactive", false);
        //     povertyLabel
        //       .classed("active", false)
        //       .classed("inactive", true);
        //     incomeLabel
        //       .classed("active", false)
        //       .classed("inactive", true);
        //   }
          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  }).catch(function(error) {
    console.log(error);
  });