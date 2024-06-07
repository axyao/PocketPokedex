class RadarChart {

    constructor(_config, data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: 500,
        containerHeight: 600,
        margin: {top: 50, right: 50, bottom: 50, left: 50}
      }

      this.statTypes = ['Special Attack', 'Health', 'Speed', 'Special Defense', 'Defense', 'Attack'];
      this.data = data;
      this.initVis();
    }
    
    initVis() {
      // Create SVG area, initialize scales and axes
      let vis = this;
  
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
      
      // Initialize scales
      vis.radialScale = d3.scaleLinear()
          .domain([1,255])
          .range([0, vis.width / 2]);

      // Initialize axes
      vis.radialTicks = [51, 102, 153, 204, 255];
      
      vis.statsAxis = vis.statTypes.map((s, i) => {
        let angle = (Math.PI / 2) + (2 * Math.PI * i / 6);

        return {
            "name": s,
            "angle": angle,
            "line_coord": vis.getPointCoordinates(angle, 255),
            "label_coord": vis.getPointCoordinates(angle, 275)
        };
      });

      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);

      // Append chart
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  
      // Append circles
      vis.chart.selectAll("circle")
          .data(vis.radialTicks)
          .join(
              enter => enter.append("circle")
                  .attr("cx", vis.width / 2)
                  .attr("cy", vis.height / 2)
                  .attr("fill", "none")
                  .attr("stroke", "lightgray")
                  .attr("r", d => vis.radialScale(d))
          );
      
      // Append axis line
      vis.chart.selectAll("line")
          .data(vis.statsAxis)
        .join("line")
          .attr("x1", vis.width / 2)
          .attr("y1", vis.height / 2)
          .attr("x2", d => d.line_coord.x)
          .attr("y2", d => d.line_coord.y)
          .attr("stroke","lightgray")

      // Append axis label
      vis.chart.selectAll(".label")
          .data(vis.statsAxis)
        .join("text")
          .attr('font-family', 'Geneva')
          .attr('font-size', '13px')
          .attr('font-weight', 'lighter')
          .attr("x", d => d.label_coord.x - 20)
          .attr("y", d => d.label_coord.y)
          .text(d => d.name);

      // Append title
      vis.svg.append('text')
          .attr('class', 'chart-title')
          .attr('x', vis.width / 2 + vis.config.margin.left)
          .attr('y', 15)
          .attr("text-anchor", "middle")
          .text('Stat Distribution of Current Team');
          
      vis.updateVis()
    }
  
    updateVis() {
      // Prepare data
      let vis = this;

      vis.line = d3.line()
          .x(d => d.x)
          .y(d => d.y);
      
      vis.renderVis();
    }
  
    renderVis() {
      // Bind data to visual elements, update axes
      let vis = this;

      // the regular polygon in radar
      vis.chart.selectAll(".reg")
          .data(vis.data.filter(d => d.number != hovered))
          .join("path")
          .attr('class', 'reg')
          .attr("fill", d => colorScale(d.types[0]))
          .attr('opacity', 0.3)
          .datum(d => vis.getPathCoordinates(d))
          .attr("d", vis.line);

      // the one whose image card being hovered
      // using == to have type conversion
      vis.chart.selectAll(".hovered")
          .data(vis.data.filter(d => d.number == hovered))
          .join("path")
          .attr('class', 'hovered')
          .attr("fill", d => colorScale(d.types[0]))
          // using == to have types in common
          .attr('opacity', 0.9)
          .datum(d => vis.getPathCoordinates(d))
          .attr("d", vis.line);
    }

    // Get coordinates of a single point based on angle and length
    getPointCoordinates(angle, value) {
      let vis = this;
      
      let x = Math.cos(angle) * vis.radialScale(value);
      let y = Math.sin(angle) * vis.radialScale(value);
      
      return {"x": vis.width / 2 + x, "y": vis.height / 2 - y};
    }

    // Get coordinates of a group of points based on data
    getPathCoordinates(data){
      let vis = this;

      let coordinates = [];

      for (var i = 0; i < 6; i++){
          let angle = (Math.PI / 2) + (2 * Math.PI * i / 6);
          
          coordinates.push(vis.getPointCoordinates(angle, mapping[vis.statTypes[i]](data)));
      }
      
      return coordinates;
    }
  }