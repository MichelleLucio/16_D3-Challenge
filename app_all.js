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
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//initial parameters
let chosenXAxis = "poverty";
let chosenYAxis = "obesity";


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

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftYAxis = d3.axisLeft(newYScale);
      yAxis.transition()
      .duration(1000)
      .call(leftYAxis);
      return yAxis;
  }

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      //.attr('transform', d => `translate(${newXScale(d[chosenXAxis])}, ${newYScale(d[chosenYAxis])})`);
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]))
      return circlesGroup;
  }

//function for updating text with new data
function getText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis){
  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]))
    .attr("text-anchor", "middle")
  return textGroup;
}

 // function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {
    let xLabel;
        if (chosenXAxis === "poverty") {
        xlabel = "In Poverty (%)";}
        else if (chosenXAxis === "age") {
            xlabel = "Age (median)"}
        else {xlabel = "Household Income(median)";}

    let yLabel;
        if (chosenYAxis === "obesity") {
        ylabel = "Obesity (%)";}
        else if (chosenYAxis === "smokes") {
            ylabel = "Smokes (%)"}
        else {ylabel = "Lacks Healthcare (%)";}
  
    let toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  } 

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(censusData, err) {
    if (err) throw err;
    console.log(censusData);
  
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
    let bottomXAxis = d3.axisBottom(xLinearScale);
    let leftYAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    let xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomXAxis);
  
    // append y axis
    let yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftYAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll(".stateCircle")
      // .append("g")
      // .selectAll("circle")
      .data(censusData)
      .enter()
      // .append("g")
      .append("circle")
      // .classed("circle", true)
      //.attr('transform', d => `translate(${xLinearScale(d[chosenXAxis])}, ${yLinearScale(d[chosenYAxis])})`);
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("class", "stateCircle")
      .attr("r", 15)
      .attr("opacity", ".7");

      // circlesGroup
      //   .append("circle")
      //   .attr("r", 10)
      //   .attr("fill", "purple")
      //   .attr("opacity", ".6");

      let textGroup = chartGroup.selectAll(".stateText")
        .data(censusData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("text-anchor", "middle")
        .text(d => d.abbr)
        .attr("font-size", "15px")
        .attr("fill", "black");

    // let circleText = chartGroup
    //   .append('text')
    //   .classed('circleText', true)
    //   .attr('dy', '0.35em')
    //   .attr('dx', -6)
    //   .text(d => d.abbr);
  
    // Create group for x-axis & y-axis labels
    let xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    let ylabelsGroup = chartGroup.append("g")
      .attr("transform", `rotate(-90 ${(margin.left/2)} ${(height/2)-60})`)
      .attr("dy", "1em")
      .classed("axis-text", true);
      //.attr("transform", `translate(${height / 2}, ${width + 10})`);

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
    let obesityLabel = ylabelsGroup.append("text")
        .attr("y", 10)
        .attr("x", 0)
        .attr("value", "obesity") // value to grab for event listener
        .classed("axis-text", true)
        .classed("active", true)
        .text("Obesity (%)");

    let smokesLabel = ylabelsGroup.append("text")
        .attr("y", 30)
        .attr("x", 0)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");
      
    let healthLabel = ylabelsGroup.append("text")
        .attr("y", 50)
        .attr("x", 0)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");


    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
  
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        let value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
            // replaces chosenXAxis with value
          chosenXAxis = value;
          console.log(chosenXAxis)
            // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(censusData, chosenXAxis);
            // updates x axis with transition
          xAxis = renderXAxis(xLinearScale, xAxis);
            // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          //update text with new info
          textGroup = getText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
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
          else if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        }
      });

  // y axis labels event listener
  ylabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    let value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {
        // replaces chosenYAxis with value
      chosenYAxis = value;
      console.log(chosenYAxis)
        // functions here found above csv import
      // updates y scale for new data
      yLinearScale = yScale(censusData, chosenYAxis);
        // updates y axis with transition
      yAxis = renderYAxis(yLinearScale, yAxis);
        // updates circles with new y values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
       //update text with new info
      textGroup = getText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        // changes classes to change bold text
      if (chosenYAxis === "obesity") {
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        healthLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        healthLabel
          .classed("active", true)
          .classed("inactive", false);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
      }
    }
  });
  }).catch(function(error) {
    console.log(error);
  });