const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';
const tooltip = document.querySelector("#tooltip");

let promise = getData(url);
promise.then(function(data) {
  const dataset = convertData(data);
  constructPlot(dataset)
  
  const bars = document.querySelectorAll("rect");
  bars.forEach(el => {
    el.addEventListener("mouseover", showTip);
    el.addEventListener("mouseout", hideTip);
  })
});

async function getData(url){
  try {
    const response = await fetch(url);
    const info = await response.json();
    const dataset = [...info.data];
    return dataset;
  } catch(error) {
    console.log(error)
  }
}

function convertData(data){
  return data.map(element => {
     let year = parseInt(element[0].slice(0,4));
     let month = parseInt(element[0].slice(5,7));
     let gdp = parseFloat(element[1]);
     let date = element[0].slice(0,11);
    
     let fraction_yr;
     let quarter = "";
     
     switch(month){
       case 1:
         fraction_yr = 0;
         break;
       case 4:
         fraction_yr = 0.25;
         break;
       case 7:
         fraction_yr = 0.5;
         break;
       case 10:
         fraction_yr = 0.75;
         break;
       default:
         fraction_yr = 0;
     }
       
     switch(fraction_yr){
       case 0:
         quarter = "Q1";
         break;
       case 0.25:
         quarter = "Q2";
         break;
       case 0.5:
         quarter = "Q3";
         break;
       case 0.75:
         quarter = "Q4";
         break;
       default:
         quarter = "";
     }
     
     const xVal = year + fraction_yr;
     const toolTip = year + " " + quarter;
     return [xVal, gdp, toolTip, date];
   })
}

function constructPlot(data){
  const w = 800;
  const h = 500;
  const padding = 60;

  const xScale = d3.scaleLinear()
                     .domain([d3.min(data, (d) => d[0]), d3.max(data, (d) => d[0])])
                     .range([padding, w - padding]);

  const yScale = d3.scaleLinear()
                    .domain([0, d3.max(data, (d) => d[1])])
                    .range([h - padding, padding]);


  const svg = d3.select("#plot")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
         .attr("transform", "translate(0," + (h - padding) + ")")
         .attr("id","x-axis")
         .call(xAxis);
   svg.append("g")
         .attr("transform", "translate(" + padding + ",0)")
         .attr("id","y-axis")
         .call(yAxis)
  
  svg.append('text')
      .attr("class","x-label")
      .text('Year')
  
   svg.append('text')
      .attr("class","y-label")
      .text('GDP ($Billions)')

  //-----------------plot data-----------------------
  barWidth = 2;
  svg.selectAll("rect")
       .data(data)
       .enter()
       .append("rect")
         .attr("x", d => xScale(d[0]))
         .attr("y", d => yScale(d[1]))
         .attr("width", barWidth)
         .attr("height", d => h-yScale(d[1])-padding)
         .attr("class", "bar")
         .attr("data-date", d => d[3])
         .attr("data-gdp", d => d[1])
         .attr("data-quarter", d => d[2])
  /*
       .append("title")
         .attr("id","tooltip")
         .text(d => d[2]+"\n"+"$"+d[1]+" Billion")
         .attr("data-date", d => d[3])
  */
}

function showTip(e) {
  const x = e.pageX;
  const y = e.pageY;
  
  //const bar = document.elementFromPoint(x, y);
  const bar = e.target;
  const date = bar.getAttribute("data-date");
  const quarter = bar.getAttribute("data-quarter");
  const gdp = bar.getAttribute("data-gdp");
  
  
  tooltip.style.setProperty("display", "block");
  tooltip.style.setProperty("left", x+10+"px");
  tooltip.style.setProperty("top", y+"px");
  
  tooltip.setAttribute("data-date", date);
  tooltip.innerHTML = quarter+"<br>"+"$"+gdp+" Billion";
}

function hideTip() {
  tooltip.style.setProperty("display", "none");
}