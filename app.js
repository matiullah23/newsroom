// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

// When the browser loads, makeResponsive() is called.
makeResponsive();

// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // SVG wrapper dimensions are determined by the current width and
  // height of the browser window.
  // var svgWidth = 960;
  // var svgHeight = 500;

  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;

  // var margin = {
  //   top: 20,
  //   right: 100,
  //   bottom: 50,
  //   left: 100
  // };
  margin = {
    top: 20,
    bottom: 100,
    right:60,
    left: 100
  };

  var height = svgHeight - margin.top - margin.bottom;
  var width = svgWidth - margin.left - margin.right;

  // Append SVG element
  var svg = d3
    .select(".chart")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

  // Append group element
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    d3.csv("data.csv", function(err, dataSet) {

      // parse data
      dataSet.forEach(function(data) {
        data.state = data.state;
        data.obesity = +data.obesity;
        data.disability = +data.disability;

      });

      // create scales
      var xObesityScale = d3.scaleLinear()
        .domain(d3.extent(dataSet, d => d.obesity))
        .range([0, width]);

      var yDisabityScale = d3.scaleLinear()
        .domain([0, d3.max(dataSet, d => d.disability)])
        .range([height, 0]);

        var xAxis = d3.axisBottom(xObesityScale).ticks(10);
        var yAxis = d3.axisLeft(yDisabityScale).ticks(10);

        // append axes
        chartGroup.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(xAxis);

        chartGroup.append("g")
          .call(yAxis);

        var circlesGroup = chartGroup.selectAll("circle")
        .data(dataSet)
        .enter()
        .append("circle")
        .attr("cx", d => xObesityScale(d.obesity))
        .attr("cy", d => yDisabityScale(d.disability))
        .attr("r", "10")
        .attr("stroke-width", "1")
        .attr("stroke", "black")
        .style("fill", "white");


        circlesGroup.append("text")
        .text(d => d.state)
        .attr("x", d => xObesityScale(d.obesity))
        .attr("y", d => yDisabityScale(d.disability));










        // Step 6: Initialize tool tip
        // ==============================
        var toolTip = d3.tip()
          .attr("class", "tooltip")
          .offset([80, -60])
          .html(function(d) {
            return (`${d.state}<br>Disablilty Rate: ${d.disability}<br>Obesity Rate: ${d.obesity}`);
          });
          // Step 7: Create tooltip in the chart
          // ==============================
          chartGroup.call(toolTip);

          // Step 8: Create event listeners to display and hide the tooltip
          // ==============================
          circlesGroup.on("mouseover", function(data) {
            toolTip.show(data);
          })
          // onmouseout event
          .on("mouseout", function(data, index) {
            toolTip.hide(data);
          });




        chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Disabled and not in Workforce (%)")

        chartGroup.append("text")
          .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
          .attr("class", "axisText")
          .text("Obesity Rate (%)");

          // // line generator
          // svg.selectAll('circle').data(dataSet)
          //   .enter().append('circle')
          //     .attr('cx', d => xObesityScale(d.obesity))
          //     .attr('cx', d => yDisabityScale(d.disablity))
          //     .attr('r', 8);
      });
};
