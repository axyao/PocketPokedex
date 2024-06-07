class ScatterPlot {

  constructor(_config, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 800,
      margin: {top: 40, right: 50, bottom: 30, left: 50}
    }
    this.xStat = 'Sum';
    this.yStat = 'Health';  // default values
    this.stats = ['Health', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed', 'Sum'];
    this.data = data;
    this.mapping = mapping;
    this.initVis();
  }
  
  initVis() {
    // Create SVG area, initialize scales and axes
    let vis = this;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // initialize scales, axes, static elements, etc.
    vis.xScale = d3.scaleLinear()
        .range([0, vis.width]);
    vis.yScale = d3.scaleLinear()
        .range([0, vis.height]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(7)
        .tickSize(0)
        .tickPadding(10);

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(7)
        .tickSize(0)
        .tickPadding(10);

    // Append axis groups
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);

    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    // prepare selection dropdown buttons
    vis.xSelect = d3.select('#xStatSelect');
    vis.ySelect = d3.select('#yStatSelect');

    // populate selection dropdown buttons with data
    vis.xSelect.selectAll('xStatSelect')
        .data(vis.stats)
        .enter()
        .append('option')
        .text(d => d)
        .attr('value', d => d);

    vis.ySelect.selectAll('yStatSelect')
        .data(vis.stats)
        .enter()
        .append('option')
        .text(d => d)
        .attr('value', d => d);

    // mean line
    vis.meanLineX = vis.chart.append('line').classed('mean-line-x', true);
    vis.meanLineY = vis.chart.append('line').classed('mean-line-y', true);

    // text labels
    vis.xLabel = vis.chart.append('text')
        .attr('class', 'axis-title')
        .attr('text-anchor', 'end')
        .attr('transform', `translate(${vis.config.margin.right+vis.width}, ${vis.height-10})`);
    vis.yLabel = vis.chart.append('text')
        .attr('class', 'axis-title')
        .attr('text-anchor', 'start')
        .attr('transform', `translate(${-vis.config.margin.left}, -10)`);
    vis.xAvg = vis.chart.append('text')
        .attr('class', 'info')
        .attr('text-anchor', 'middle');
    vis.yAvg = vis.chart.append('text')
        .attr('class', 'info')
        .attr('text-anchor', 'end');

    vis.updateVis();
  }

  updateVis() {
    // Prepare data
    let vis = this;

    // Specify x-axis accessor functions
    vis.xValue = vis.mapping[vis.xStat];
    vis.xLabel.text(vis.xStat);

    // Specify y-axis accessor functions
    vis.yValue = vis.mapping[vis.yStat];
    vis.yLabel.text(vis.yStat);

    // calculate mean
    vis.meanX = d3.mean(vis.data, vis.xValue);
    vis.meanY = d3.mean(vis.data, vis.yValue);

    // Set the scale input domains
    vis.xScale.domain([d3.max([0, (d3.min(vis.data, vis.xValue)-5)]), d3.max(vis.data, vis.xValue)]);
    vis.yScale.domain([d3.max(vis.data, vis.yValue), d3.max([0, (d3.min(vis.data, vis.yValue)-5)])]);

    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    let vis = this;

    // update attribute displayed when axis value changes
    vis.xSelect.on('change', d => {
      vis.xStat = d3.select('#xStatSelect').property('value')
      vis.updateVis();
    });

    vis.ySelect.on('change', d => {
      vis.yStat = d3.select('#yStatSelect').property('value')
      vis.updateVis();
    });

    // render mean line
    if (vis.data.length > 0) {
      vis.meanLineX
          .raise()
          .style('stroke', '#2e5e91')
          .style('stroke-dasharray', ('3, 3'))
          .style('stroke-width', 2)
          .style('stroke-opacity', 0.5)
          .attr('x1', vis.xScale(vis.meanX))
          .attr('y1', 0)
          .attr('x2', vis.xScale(vis.meanX))
          .attr('y2', vis.height);
      vis.xAvg
          .attr('transform', `translate(${vis.xScale(vis.meanX)}, -20)`)
          .style('font-family', 'Futura, sans-serif')
          .attr('font-size', '13px')
          .text(`Avg. ${vis.xStat}: ${Math.round(vis.meanX)}`);

      vis.meanLineY
          .raise()
          .style('stroke', '#2e5e91')
          .style('stroke-dasharray', ('3, 3'))
          .style('stroke-width', 2)
          .style('stroke-opacity', 0.5)
          .attr('x1', 0)
          .attr('y1', vis.yScale(vis.meanY))
          .attr('x2', vis.width)
          .attr('y2', vis.yScale(vis.meanY));
      vis.yAvg
          .attr('transform', `translate(${vis.width + vis.config.margin.left}, ${vis.yScale(vis.meanY) - 10})`)
          .style('font-family', 'Futura, sans-serif')
          .attr('font-size', '13px')
          .text(`Avg. ${vis.yStat}: ${Math.round(vis.meanY)}`);
    }

    // Add points
    const point = vis.chart.selectAll('.point')
        .data(vis.data)
        .join('circle')
        .attr('class', d => selected.includes(d)? 'point active': 'point')
        .attr('r', d => selected.includes(d)? 7: 6)
        .attr('cy', d => vis.yScale(vis.yValue(d)))
        .attr('cx', d => vis.xScale(vis.xValue(d)))
        .attr("fill", d => colorScale(d.types[0]))
        .on('click', (event, d) => {
          // add selected pokemon into team list; removed it if already picked
          (selected.includes(d))?
              selected = selected.filter(da => da !== d):
              (selected.length < 6)? selected.push(d):
                  // displaying a warning text when adding 7th Pokemon in team list
                  d3.select('#warning')
                     .style('display', 'block')
                     .style('left', (event.pageX + 10) + 'px')
                     .style('top', (event.pageY - 30) + 'px')
                     .html(`
                     <div class="warning-text">You can only select up to 6 Pokemons in your team!</div>
                     `);
          vis.updateVis()
          updateTeam()
        }).on('mouseover', (event, d) => {
          d3.select('#warning').style('display', 'none');
          // showing tooltip when mouse over the point mark
          d3.select('#tooltip')
              .style('display', 'block')
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY + 10) + 'px')
              .html(`
                    <div class="card" id="${d.number}">
                    <img class="card-image" src="${d.image}">
                    <div class="card-number">#${d.number}</div>
                    <div class="card-name">${d.name}</div>
                    <div class="card-stats">
                    <ul id="tooltip ul">
                        <li><b>${vis.yStat}</b>: ${vis.yValue(d)}</li>
                        <li><b>${vis.xStat}</b>: ${vis.xValue(d)}</li>
                    </ul>
                     <ul class="card-types">
                        ${d.types.map(type => `<li style="background-color: ${colorScale(type)}">${type}</li>`).join("")}
                    </ul>
                    </div>   
                    </div>
              `);
        }).on('mouseleave', () => {
          d3.select('#warning').style('display', 'none');
          d3.select('#tooltip').style('display', 'none');
        });

    // Update the axes/gridlines
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}