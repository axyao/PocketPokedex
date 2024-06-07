class BarChart {

  constructor(_config, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 300,
      containerHeight: 360,
      margin: {top: 30, right: 30, bottom: 30, left: 30}
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


  }
}