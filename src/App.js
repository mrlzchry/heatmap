import './App.css';
import * as d3 from 'd3';
import React, {useState, useEffect, useRef} from "react"
import { axisBottom, axisLeft } from 'd3';

function App() {
  const [dataset, setDataset] = useState([]);

  useEffect(() => {

  getData();

 }, [])

 async function getData() {
  try {
    await fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
    .then((response) => response.json())
    .then((data) => setDataset(data.monthlyVariance));
  }
  catch(error) {
    console.log(error);
  }
 }

 console.log(dataset)
  return (
    <div className="App">
      <header className="App-header">
        <div className="visHeader"> 
        <HeatMap title="Monthly Global Land-Surface Temperature" data={dataset}></HeatMap>
        </div>
      </header>
    </div>
  );
}

const HeatMap = ({title, data}) => {
 const svgRef = useRef();
 const dataVariance = data.map((item) => item);
 console.log(dataVariance);

 const dataYear = dataVariance.map((item) => new Date(Date.UTC(item.year, 1, 1)));
 const dataMonth = dataVariance.map((item) => new Date(Date.UTC(0, item.month - 1, 0, 0, 0, 0)));
 const dataTemp = dataVariance.map((item) => parseInt((item.variance + 8.66).toFixed(2)));
 const minMonth = new Date(0,-1,16,0,0,0);
 const maxMonth = new Date(0,11,16,0,0,0);
 console.log(dataYear);
 console.log(dataMonth);
 console.log(d3.max(dataMonth));
 console.log(d3.min(dataMonth));

 //parameters for heatmap
 const h = 700;
 const w = 1400;
 const topPadding = 20;
 const bottomPadding = 180;
 const leftPadding = 70;
 const rightPadding = 80;
 const usableHeight = h - topPadding - bottomPadding;
 const barWidth = w/263;
 const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
 const maxYear = new Date(d3.max(dataYear));
  //formattimg time for the axes
 const timeFormat = d3.timeFormat("%-B");

  //declaring x and y scale
 const yScale = d3.scaleTime().domain([maxMonth, minMonth ]).range([usableHeight, 0]);
//  const yScale = d3.scaleOrdinal().domain(['January', 'February', 'March', "April", "May", "June", "July", "August", "September", "October", "November", "December"]).range([usableHeight, 0]);
 const xScale = d3.scaleTime().domain([d3.min(dataYear), maxYear.setMonth(maxYear.getMonth() + 20)]).range([0, w - rightPadding]);
 const yAxis = axisLeft(yScale).tickFormat(timeFormat);
 const xAxis = axisBottom(xScale);

 //legend axis
 const legendScale = d3.scaleLinear().domain([3.1, d3.max(dataTemp) + 0.9]).range([0, 240]);
 const legendAxis = axisBottom(legendScale);
 console.log(d3.max(dataTemp));
 console.log(dataTemp);
 

 const tooltip = d3.select(".visHeader")
                      .append("div")
                      .attr("id", "tooltip")
                      .style("opacity", 0);

//  const svg = d3.select(svgRef.current)
//                 .attr("height", h)
//                 .attr("width", w)
//                 .style("background", "white")
//                 .style("margin", "auto");

const svg = d3.select('svg')
                .attr("height", h)
                .attr("width", w)
                .style("background", "white")
                .style("margin", "auto");
  
//  const svg2 = d3.select(svg2Ref.current)

        svg.append("g")
           .attr("id", "y-axis")
           .attr("transform", `translate(${leftPadding}, ${topPadding })`)
           .call(yAxis);
      
        svg.append("g")
           .attr("id", "x-axis")
           .attr("transform", `translate(${leftPadding}, ${h - bottomPadding})`)
           .call(xAxis);
        
        svg.append("g")
           .attr("id", "legend-axis")
           .attr("transform", `translate(${leftPadding + 79.5} , ${h - bottomPadding + 100})`)
           .call(legendAxis);

        svg.selectAll("rect")
           .data(data)
           .enter()
           .append("rect")
           .attr("class", "cell")
           .attr("x", (d, i) => leftPadding + xScale(dataYear[i]))
           .attr("y", (d, i) => yScale(dataMonth[i]))
           .attr("width",barWidth)
           .attr("height", usableHeight/11.9)
           .attr("data-month", (d, i) => d.month - 1)
           .attr("data-nameMonth", (d, i) => monthNames[d.month - 1])
           .attr("data-year", (d, i) => d.year)
           .attr("data-temp", (d) => (d.variance + 8.66).toFixed(2))
           .attr("data-variance", (d) => d.variance)
           .style("fill", (d) => {
            if (d.variance < -4) {
              return "#023e8a"
            }
            else if (d.variance < -3) {
              return "#00b4d8"
            }
            else if (d.variance < -2) {
              return "#bbdef0"
          }
            else if (d.variance < -1) {
              return "#ebf5df"
            }
            else if (d.variance < 0) {
              return "#eddea4"
            }
            else if (d.variance < 2) {
              return "#ffea00"
            }
            else if (d.variance < 3) {
              return "#ff9500"
            }
            else if (d.variance < 4) {
              return "#f25c54"
            }
            else if (d.variance > 4) {
              return "#f42b03"
            }})
            .on("mouseover", function(event) {
              tooltip.html(this.getAttribute("data-year") + " - " + this.getAttribute("data-nameMonth") + "<br> "
               + this.getAttribute("data-temp") + "°C <br> " + this.getAttribute("data-variance") + "°C")
                    .attr("data-year", this.getAttribute("data-year"))
                    .style('left', `${event.pageX - 60}px`)
                    .style('top', `${event.pageY}px`);
              tooltip.transition()
                    .duration(100)
                    .style("opacity", 0.9);
              
            })
          .on('mouseout', function() {
              tooltip.html('');
              tooltip.transition()
                  .duration(100)
                  .style('opacity', 0);
          }
            )

        svg.append("svg")
           .attr("id", "legend")

        svg.select("#legend")
           .append('rect')
           .attr("id", "legend")
           .attr("x", leftPadding + 100)
           .attr("y", h - bottomPadding + 80 )
           .attr("width", 22)
           .attr("height", 20)
           .style("fill", "#023e8a")

        svg.select("#legend")
           .append('rect')
           .attr("id", "legend")
           .attr("x", leftPadding + 122.2)
           .attr("y", h - bottomPadding + 80 )
           .attr("width", 22)
           .attr("height", 20)
           .style("fill", "#00b4d8")

        svg.select("#legend")
           .append('rect')
           .attr("id", "legend")
           .attr("x", leftPadding + 144.4)
           .attr("y", h - bottomPadding + 80 )
           .attr("width", 22)
           .attr("height", 20)
           .style("fill", "#bbdef0")
        
        svg.select("#legend")
           .append('rect')
           .attr("id", "legend")
           .attr("x", leftPadding + 166.6)
           .attr("y", h - bottomPadding + 80 )
           .attr("width", 22)
           .attr("height", 20)
           .style("fill", "#ebf5df")
        
        svg.select("#legend")
           .append('rect')
           .attr("id", "legend")
           .attr("x", leftPadding + 188.8)
           .attr("y", h - bottomPadding + 80 )
           .attr("width", 22)
           .attr("height", 20)
           .style("fill", "#eddea4")

        svg.select("#legend")
           .append('rect')
           .attr("id", "legend")
           .attr("x", leftPadding + 211)
           .attr("y", h - bottomPadding + 80 )
           .attr("width", 22)
           .attr("height", 20)
           .style("fill", "#ffea00")
        
        svg.select("#legend")
           .append('rect')
           .attr("id", "legend")
           .attr("x", leftPadding + 233.2)
           .attr("y", h - bottomPadding + 80 )
           .attr("width", 22)
           .attr("height", 20)
           .style("fill", "#ff9500")

        svg.select("#legend")
           .append('rect')
           .attr("id", "legend")
           .attr("x", leftPadding + 255.4)
           .attr("y", h - bottomPadding + 80 )
           .attr("width", 22)
           .attr("height", 20)
           .style("fill", "#f25c54")

        svg.select("#legend")
           .append('rect')
           .attr("id", "legend")
           .attr("x", leftPadding + 277.6)
           .attr("y", h - bottomPadding + 80 )
           .attr("width", 22)
           .attr("height", 20)
           .style("fill", "#f42b03")

  return (
    <React.Fragment>
      <title id="title">{title}</title>
      <h1>{title}</h1>
      <h3 id="description">1753 - 2015: base temperature 8.66℃</h3>
      <svg ref={svgRef}></svg>
      <h6><a href="">Source Code</a></h6>
    </React.Fragment>
  )
}

export default App;
