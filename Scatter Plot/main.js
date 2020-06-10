const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
const tooltip = document.querySelector("#tooltip");

let promise = getData(url);
promise.then(function(dataset){
  //console.log(dataset[1])
  constructPlot(dataset);
  const dots = document.querySelectorAll("circle");
  dots.forEach(el => {
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
  const w = 800;
  const h = 500;
  const padding = 60;

  const xScale = d3.scaleLinear()
                     .domain([d3.min(dataset, d => d.Year-1), d3.max(dataset, d => d.Year+1)])
                     .range([padding, w - padding]);
                
  const timeFormat = d3.timeFormat("%M:%S");
  
  dataset.forEach(d => {
    var parsedTime = d.Time.split(':');
    //date object 0-indexed: (year, month, day, hour, minute, second)
    d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
  })
  
  const yScale = d3.scaleTime()
                    .domain(d3.extent(dataset, d => d.Time)) //extent returns both min and max
                    .range([padding, h - padding]);
  
  const svg = d3.select("#plot")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h);
  
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);
  
  svg.append("g")
         .attr("transform", "translate(0," + (h - padding) + ")")
         .attr("id","x-axis")
         .call(xAxis);
   svg.append("g")
         .attr("transform", "translate(" + padding + ",0)")
         .attr("id","y-axis")
         .call(yAxis)
  
  //-------------plot------------------------
  svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.Time))
        .attr("r", 5)
        .attr("data-xvalue", d => d.Year)
        .attr("data-yvalue", d => d.Time)
        .attr("class", d => { return d.Doping ? "dot dope" : "dot no-dope" })
        .attr("data-tip", d => {
          const timeFormat = d3.timeFormat("%M:%S");
          return d.Name+": "+d.Nationality+"<br>"+"Year: "+d.Year+", Time: "+timeFormat(d.Time)+"<br>"+d.Doping;
        })

 //---------------legend------------------------
  const legendContainer = svg.append("g")
        .attr("id", "legend")
   
  legendContainer.append("circle")
        .attr("cx", w-padding-220)
        .attr("cy", h/2-2*padding)
        .attr("r", 10)
        .attr("class", "dope")
  legendContainer.append("text")
        .attr("x", w-padding)
        .attr("y", h/2-2*padding)
        .text("Riders with Doping Allegations")
        .attr("text-anchor","end")
        .attr("alignment-baseline","middle")
  
    legendContainer.append("circle")
        .attr("cx", w-padding-220)
        .attr("cy", h/2-1.5*padding)
        .attr("r", 10)
        .attr("class", "no-dope")
    legendContainer.append("text")
        .attr("x", w-padding-204)
        .attr("y", h/2-1.5*padding)
        .text("No Doping Allegations")
        .attr("alignment-baseline","middle")
  
}

function showTip(e) {
  const x = e.pageX;
  const y = e.pageY;
  const dot = e.target;
  
  const year = dot.getAttribute("data-xvalue");
  tooltip.setAttribute("data-year", year);
  
  tooltip.style.setProperty("display", "block");
  tooltip.style.setProperty("left", x+10+"px");
  tooltip.style.setProperty("top", y+"px");
  
  tooltip.innerHTML = dot.getAttribute("data-tip");
}

function hideTip() {
  tooltip.style.setProperty("display", "none");
}