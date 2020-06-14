const tooltip = document.querySelector("#tooltip");

const url = ['https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json', 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'];

Promise.all(url.map(url => d3.json(url))).then(function(results) {
  const education = results[0]; //array
  const us = results[1]; //object
  //console.log(education[0])
  //console.log(topojson.feature(us, us.objects.counties).features)
  
  constructPlot(education, us);
  const counties = document.querySelectorAll(".county");
  counties.forEach(el => {
    el.addEventListener("mouseover", showTip);
    el.addEventListener("mouseout", hideTip);
  })
});

function constructPlot(education, us){
  const w = 960;
  const h = 600;
  
  const percentage = education.map(obj => obj.bachelorsOrHigher);
  //const theme = d3.interpolateRainbow;
  //const theme = d3.interpolate("yellow", "red");
  //const theme = d3.scaleOrdinal(d3.schemeGreens[8]);
  const theme = d3.interpolateTurbo;
  const colorScale = d3.scaleSequential()
       .domain(d3.extent(percentage))
       .interpolator(theme);
       
  //-------------------------plot-------------------------------
  const svg = d3.select("#plot")
       .append("svg")
       .attr("width", w)
       .attr("height", h);
  
  svg.append("g")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter()
      .append("path")
      .attr("d", d3.geoPath()) //d3.geoPath() is a path generator
      .attr("class", "county")
      .attr("data-fips", d => d.id)
      .attr("data-education", d => {
        const result = education.filter(obj => obj.fips == d.id);
        if(result[0]){ //result should only contain one element
          return result[0].bachelorsOrHigher
        }
        //could not find a matching fips id in the data
        console.log('could find data for: ', d.id);
        return 0
      })
      .attr("data-location", d => {
        const result = education.filter(obj => obj.fips == d.id);
        if(result[0]){
          return result[0].area_name+", "+result[0].state
        }
        console.log('could find data for: ', d.id);
        return 0
      })
      .attr("fill", d => {
        const result = education.filter(obj => obj.fips == d.id);
        if(result[0]){
          return colorScale(result[0].bachelorsOrHigher)
        }
        //could not find a matching fips id in the data
        return colorScale(0)
      })
  
  //-------------------legend---------------------------
  const legendScale = d3.scaleLinear()
                     .domain(d3.extent(percentage))
                     .range([.75*w, w]);
  const legendAxis = d3.axisBottom(legendScale).tickFormat(d => d + "%");
  svg.append("g")
         .attr("transform", "translate(0," + 10 + ")")
         .call(legendAxis);
  
  const legendWidth = .25*w;
  const numColors = 7;
  legendData = [];
  for (i=0; i<=numColors-1; i++){
    legendData.push(d3.min(percentage)+(d3.max(percentage)-d3.min(percentage))/numColors*i);
  }
  
  svg.append("g")
        .attr("id","legend")
        .selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", d => legendScale(d))
        .attr("y", 0)
        .attr("width", legendWidth/numColors)
        .attr("height", 10)
        .attr("fill", d => colorScale(d))
}

function showTip(e) {
  const x = e.pageX;
  const y = e.pageY;
  const county = e.target;
  county.style.opacity = 0.2;
   
  tooltip.style.setProperty("display", "block");
  tooltip.style.setProperty("left", x+10+"px");
  tooltip.style.setProperty("top", y+"px");
  
  let location = county.getAttribute("data-location");
  let percent = county.getAttribute("data-education")
  tooltip.innerHTML = location + ": " + percent + "%";
  
  tooltip.setAttribute("data-education", percent);
}

function hideTip(e) {
  tooltip.style.setProperty("display", "none");
  const county = e.target;
  county.style.opacity = 1;
}