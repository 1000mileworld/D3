const url = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
const tooltip = document.querySelector("#tooltip");

d3.json(url).then(dataset => {
  //console.log(dataset.children[0])
  constructPlot(dataset)
  const items = document.querySelectorAll(".tile");
  items.forEach(el => {
    el.addEventListener("mouseover", showTip);
    el.addEventListener("mouseout", hideTip);
  })
})

function constructPlot(dataset){
  const w = 960;
  const h = 570;
  
  //set up tree
  const root = d3.hierarchy(dataset)
        .sum(d => d.value) //determines size of leaf
        .sort(function(a, b) { return b.height - a.height || b.value - a.value; }); //sort from greatest to least
  
  const treemap = d3.treemap() //computes the position of each element of the hierarchy
        .size([w, h])
        .paddingInner(2);
  
  treemap(root);
  
  color = d3.scaleOrdinal(d3.schemeCategory10);
 //-------------------------plot-------------------------------
  const svg = d3.select("#plot")
       .append("svg")
       .attr("width", w)
       .attr("height", h);
  
  const cell = svg.selectAll("g")
       .data(root.leaves())
       .enter()
       .append("g")
       .attr("class", "group")
       .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

  const tile = cell.append("rect")
       .attr("id", function(d) { return d.data.id; })
       .attr("class", "tile")
       .attr("width", function(d) { return d.x1 - d.x0; })
       .attr("height", function(d) { return d.y1 - d.y0; })
       .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
       .attr("data-name", d => d.data.name)
       .attr("data-category", d => d.data.category)
       .attr("data-value", d => d.data.value)
  
  cell.append("text")
      .attr('class', 'tile-text')
      .selectAll("tspan")
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
      .enter().append("tspan") //tspan: break single into multi-line 
      .attr("x", 4)
      .attr("y", function(d, i) { return 13 + i * 10; })
      .text(d => d);
  
  //---------------------------legend--------------------------------
  const legend = d3.select("#legend");
  const unique = (value, index, self) => {
    return self.indexOf(value) === index //checks if current(self) value has occurred before; if index is the same as current, then this is the first occurrence
  }
  let categories = root.leaves().map(d => d.data.category)
  categories = categories.filter(unique);
  
  const legendWidth = +legend.attr("width");
  const LEGEND_OFFSET = 10;
  const LEGEND_RECT_SIZE = 15;
  const LEGEND_H_SPACING = 150;
  const LEGEND_V_SPACING = 10;
  const LEGEND_TEXT_X_OFFSET = 3;
  const LEGEND_TEXT_Y_OFFSET = -2;
  const legendElemsPerRow = Math.floor(legendWidth/LEGEND_H_SPACING);
  
  const legendElem = legend
    .append("g")
    .attr("transform", "translate(60," + LEGEND_OFFSET + ")")
    .selectAll("g")
    .data(categories)
    .enter()
    .append("g")
    .attr("transform", function(d, i) { 
      return 'translate(' + 
      ((i%legendElemsPerRow)*LEGEND_H_SPACING) + ',' + 
      ((Math.floor(i/legendElemsPerRow))*LEGEND_RECT_SIZE + (LEGEND_V_SPACING*(Math.floor(i/legendElemsPerRow)))) + ')';
    })
     
  legendElem.append("rect")                              
     .attr('width', LEGEND_RECT_SIZE)                          
     .attr('height', LEGEND_RECT_SIZE)     
     .attr('class','legend-item')                 
     .attr('fill', d => color(d))
     
  legendElem.append("text")                              
     .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)                 
     .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)                 
     .text(d => d);  
}

function showTip(e) {
  const x = e.pageX;
  const y = e.pageY;
  const item = e.target;
  item.style.opacity = 0.8;
   
  tooltip.style.setProperty("display", "block");
  tooltip.style.setProperty("left", x+10+"px");
  tooltip.style.setProperty("top", y+"px");
  
  let name = item.getAttribute("data-name");
  let category = item.getAttribute("data-category")
  let value = item.getAttribute("data-value")
  tooltip.innerHTML = "Name: " + name + "<br>"
  + "Category: " + category + "<br>"
  + "Value: " + value;
  
  tooltip.setAttribute("data-value", value);
}

function hideTip(e) {
  tooltip.style.setProperty("display", "none");
  const item = e.target;
  item.style.opacity = 1;
}