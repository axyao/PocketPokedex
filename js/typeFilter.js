class TypeFilter {

  constructor(_config, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 130,
      margin: {top: 10, right: 30, bottom: 10, left: 0},
      buttonWidth: 100,
      buttonHeight: 45,
      buttonPadding: 10,
      buttonPerRow: 9
    }
    this.data = data;
    this.initVis();
  }
  
  initVis() {
    // Create SVG area, initialize scales and axes
    let vis = this;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.chartArea = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales
    vis.xScale = d3.scaleLinear()
        .domain([0, vis.data.length / 2 - 1])
        .range([0, vis.width-vis.config.buttonWidth]);


    vis.chart = vis.chartArea.append('g');

    vis.updateVis()
  }

  updateVis() {
    // Prepare data
    let vis = this;

    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    let vis = this;

    let xPos = (d,i) => vis.xScale(i % vis.config.buttonPerRow);
    let yPos = (d,i) => (i < vis.config.buttonPerRow)? 0: vis.config.buttonHeight+vis.config.buttonPadding;

    let buttons = vis.chart.selectAll('.btn')
        .data(vis.data)
        .join('svg')
        .attr('class', 'btn')
        .attr('hover', 1)
        .on ("mouseover", function() {
          d3.select(this).select(".button")
              .style("stroke", d => d3.color(colorScale(d.toLowerCase())).darker());
        })
        .on('mouseleave', function() {
          d3.select(this).select(".button")
              .style("stroke", d => colorScale(d.toLowerCase()));
        })
        .on('click', function(event, d) {
          // Toggle 'active' class
          if (d3.select(this).classed('active')) {
            // was active, deactivated this
            d3.select(this).classed('active', !d3.select(this).classed('active'));

            typeSelect = null
          } else {
            // deactivate the other
            d3.selectAll('.btn.active').each(function () {
              d3.select(this).classed('active', !d3.select(this).classed('active'));
            });
            // activate this
            d3.select(this).classed('active', !d3.select(this).classed('active'));
            typeSelect = d.toLowerCase()
          }

          updateType();
        });

    buttons.append("rect")
        .attr('class', 'button')
        .attr("x", xPos)
        .attr("y", yPos)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("width", vis.config.buttonWidth)
        .attr("height", vis.config.buttonHeight)
        .attr("fill", d => colorScale(d.toLowerCase()));

    buttons.append('text')
        .attr('class', 'typeText')
        .attr('x', (d,i) => xPos(d,i) + 0.5 * vis.config.buttonWidth)
        .attr('y', (d,i) => yPos(d,i) + 0.5 * vis.config.buttonHeight)
        .text(d => d);
  }
}