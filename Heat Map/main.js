const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const tooltip = document.querySelector("#tooltip");

let promise = getData(url);
promise.then(function(dataset){
  //console.log(dataset)
  document.querySelector("#base").innerHTML = dataset.baseTemperature;
  constructPlot(dataset)
  const rects = document.querySelectorAll(".cell");
  rects.forEach(el => {
    el.addEventListener("mouseover", showTip);
    el.addEventListener("mouseout", hideTip);
  })
})

async function getData(url){
  try {
    const response = await fetch(url);
    const dataset = await response.json();
    return dataset;
  } catch(error) {
    console.log(error)
  }
}

function constructPlot(dataset){
  const w = 1200;
  const h = 500;
  const padding = 60;
  
  const xScale = d3.scaleLinear()
                     .domain(d3.extent(dataset.monthlyVariance, d => d.year))
                     .range([padding, w - padding]);
    
  const yScale = d3.scaleBand()
                    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) 
                    .range([padding, h - padding]);
  
   const svg = d3.select("#plot")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h);
    
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale).tickFormat(month => {
    let date = new Date(0);
    date.setUTCMonth(month);
    return d3.timeFormat("%B")(date);
  });
  
  svg.append("g")
         .attr("transform", "translate(0," + (h - padding) + ")")
         .attr("id","x-axis")
         .call(xAxis);
  svg.append("g")
         .attr("transform", "translate(" + padding + ",0)")
         .attr("id","y-axis")
         .call(yAxis)
  
  //-------------------plot---------------------------
  const barWidth = (w-2*padding)/(dataset.monthlyVariance.length/12);
  const barHeight = (h-2*padding)/12;
  
  const variance = dataset.monthlyVariance.map(obj => obj.variance);
  const theme = d3.interpolateRainbow;
  const colorScale = d3.scaleSequential()
                       .domain([d3.max(variance), d3.min(variance)]) //invert color scale
                       .interpolator(theme);
   
  svg.selectAll("rect")
        .data(dataset.monthlyVariance)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.month))
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("fill", d => colorScale(d.variance))
        .attr("class","cell")
        .attr("data-month", d => d.month-1)//to pass test
        .attr("data-year", d => d.year)
        .attr("data-temp", d => d.variance)
  
  //--------------------create legend---------------------------
  const legendScale = d3.scaleLinear()
                     .domain(d3.extent(variance))
                     .range([padding, (w - padding)/2]);
  const legendAxis = d3.axisBottom(legendScale);
  svg.append("g")
         .attr("transform", "translate(0," + (h-20) + ")")
         .call(legendAxis);
  
  const legendWidth = (w-padding)/2;
  const numColors = 12;
  legendData = [];
  for (i=0; i<=numColors-1; i++){
    legendData.push(d3.min(variance)+(d3.max(variance)-d3.min(variance))/numColors*i);
  }
  
svg.append("g")
        .attr("id","legend")
        .selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", d => legendScale(d))
        .attr("y", h-30)
        .attr("width", legendWidth/numColors)
        .attr("height", 10)
        .attr("fill", d => colorScale(d))
}

function showTip(e) {
  const x = e.pageX;
  const y = e.pageY;
  const rect = e.target;
  
  const year = rect.getAttribute("data-year");
  const month = rect.getAttribute("data-month");
  const temp = rect.getAttribute("data-temp");
  tooltip.setAttribute("data-year", year);
  
  tooltip.style.setProperty("display", "block");
  tooltip.style.setProperty("left", x+10+"px");
  tooltip.style.setProperty("top", y+"px");
  
  let date = new Date(0);
  let input = parseInt(month)+1;
  date.setUTCMonth(input);
  let month_name = d3.timeFormat("%B")(date);  
  tooltip.innerHTML = month_name+", "+year+"<br>"+"Variance: "+temp+"&#8451;";
}

function hideTip() {
  tooltip.style.setProperty("display", "none");
}