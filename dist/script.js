const educationDataUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const countyDataUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

Promise.all([
  d3.json(educationDataUrl),
  d3.json(countyDataUrl)
]).then(([educationData, countyData]) => {
  const w = 1000;
  const h = 600;

  const svg = d3.select("#choropleth-map")
                .attr("width", w)
                .attr("height", h);

  const path = d3.geoPath();

  const colorScale = d3.scaleThreshold()
                       .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
                       .range(d3.schemeBlues[9]);

  svg.selectAll("path")
     .data(topojson.feature(countyData, countyData.objects.counties).features)
     .enter()
     .append("path")
     .attr("d", path)
     .attr("class", "county")
     .attr("data-fips", d => d.id)
     .attr("data-education", d => {
       const county = educationData.find(item => item.fips === d.id);
       return county ? county.bachelorsOrHigher : 0;
     })
     .style("fill", d => {
       const county = educationData.find(item => item.fips === d.id);
       return county ? colorScale(county.bachelorsOrHigher) : "gray";
     })
     .on("mouseover", function(d) {
       const county = educationData.find(item => item.fips === d.id);
       tooltip.transition()
              .duration(200)
              .style("opacity", .9);
       tooltip.html(`${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`)
              .attr("data-education", county.bachelorsOrHigher)
              .style("left", (d3.event.pageX + 5) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
     })
     .on("mouseout", function() {
       tooltip.transition()
              .duration(500)
              .style("opacity", 0);
     });

  const legendColors = colorScale.range().map(color => {
    const value = colorScale.invertExtent(color)[0];
    return { color, value };
  });

  const legendWidth = 300;
  const legendHeight = 20;

  const legend = d3.select("#legend")
                   .append("svg")
                   .attr("width", legendWidth)
                   .attr("height", legendHeight);

  const legendGroup = legend.append("g")
                            .attr("transform", `translate(0,${legendHeight / 2})`);

  legendGroup.selectAll("rect")
             .data(legendColors)
             .enter()
             .append("rect")
             .attr("x", (d, i) => i * (legendWidth / legendColors.length))
             .attr("y", -10)
             .attr("width", legendWidth / legendColors.length)
             .attr("height", 20)
             .style("fill", d => d.color);

  const xScale = d3.scaleLinear()
                   .domain([0, 75])
                   .range([0, legendWidth]);

  const xAxis = d3.axisBottom(xScale)
                  .tickValues(colorScale.domain())
                  .tickFormat(d => `${d}%`);

  legend.append("g")
        .attr("transform", `translate(0,10)`)
        .call(xAxis);
});