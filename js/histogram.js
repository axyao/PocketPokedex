class Histogram {

  constructor(_config, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 1000,
      containerHeight: 400,
      sliderHeight: 20,
      margin: {top: 30, right: 50, bottom: 50, left: 30},
      padding: 15,
      size: 20
    }
    this.data = data;
    this.ticks = (range) => {
      let ticks = []
      for (let i = range[0];i < range[1]; i+=this.config.size) {
        let value = i - (i % 10)
        ticks.push(value)
      }
      return ticks;
    };
    this.initVis();
  }
  
  initVis() {
    // Create SVG area, initialize scales and axes
    let vis = this;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element
    vis.chartArea = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom - vis.config.sliderHeight;

    // define clip area
    vis.chartArea.append('defs')
        .append('clipPath').attr('id', 'chart-mask')
        .append('rect')
        .attr('width', vis.width)
        .attr('y', -vis.config.margin.top)
        .attr('height', vis.height + vis.config.margin.top);

    // initialize scales, axes.
    vis.xScale = d3.scaleLinear()
        .range([0, vis.width]);
    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.xScale)
        .tickSize(vis.config.sliderHeight)
        .tickPadding(vis.config.padding/2)
    vis.yAxis = d3.axisLeft()
        .scale(vis.yScale)
        .tickSize(-vis.width)
        .tickPadding(vis.config.padding)

    // append elements on the svg
    vis.x = vis.chartArea.append('g')
        .attr('class', 'hist x')
        .attr('transform', `translate(0,${vis.height})`);

    vis.y = vis.chartArea.append('g')
        .attr('class', 'hist y')

    vis.chart = vis.chartArea.append('g')
        .attr('clip-path', 'url(#chart-mask)')

    vis.bar = vis.svg.append('g')
        .attr('class', 'slider')
        .attr('transform', `translate(${vis.config.margin.left},${vis.height + vis.config.margin.top})`);

    vis.rect = vis.bar.append('rect')
        .attr('fill', '#2e5e91')
        .attr('y', 1)
        .attr('height', vis.config.sliderHeight)
        .attr('opacity', 0.7)

    vis.line = vis.bar.append('line')
        .attr('stroke', '#000')
        .attr('x1', 0)
        .attr('y1', vis.config.sliderHeight)
        .attr('x2', vis.width)
        .attr('y2', vis.config.sliderHeight)

    // append text labels
    vis.bar.append('text')
        .attr('class', 'tips')
        .attr('text-anchor', 'middle')
        .attr('fill', '#858585')
        .attr('font-family', 'Futura, sans-serif')
        .attr('font-size', '14px')
        .attr('transform', `translate(${vis.width/2},
        ${vis.config.sliderHeight+vis.config.margin.bottom-5})`)
        .text('Sum = Health + Attack + Defense + Special Attack + Special Defense + Speed')

    vis.bar.append('text')
        .attr('class', 'axis-title')
        .attr('text-anchor', 'start')
        .attr('transform', `translate(${vis.width+vis.config.padding}, 0)`)
        .text('Sum')
    vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('text-anchor', 'start')
        .attr('transform', `translate(5, 15)`)
        .text('Count')

    vis.updateVis()
  }

  updateVis() {
    // Prepare data
    let vis = this;

    // initialize helper variables
    let range = d3.extent(vis.data, d => d.sum)
    let ticks = vis.ticks(range)
    range = [ticks[0], ticks[ticks.length-1]+this.config.size]
    // the limit on slider bar
    vis.lower = range[0]
    vis.upper = range[1]
    // the initial value for the handlers
    vis.range = [{type: "w", value:range[0]}, {type: "e", value:range[1]}]

    vis.xScale.domain(range)

    // group data into bins
    let hist = d3.histogram()
        .value(d => d.sum)
        .domain(vis.xScale.domain())
        .thresholds(ticks)

    vis.bins = hist(vis.data)

    // update axes
    let num = d3.max(vis.bins, d => d.length)
    vis.yScale.domain([0, num])
    ticks.push(range[1])
    vis.xAxis.tickValues(ticks)
    vis.yAxis.ticks((num < 10)? num:null)
    vis.tick = ticks

    vis.x.call(vis.xAxis)
    vis.y.call(vis.yAxis)
        .select('.domain').remove();

    vis.rect
        .attr('x', 0)
        .attr('width', vis.width)

    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements,
    let vis = this;

    let marks = vis.chart.selectAll('.bin')
        .data(vis.bins)
        .join('g')
        .attr('class', 'bin')
        .attr('opacity', d => {
          let range = vis.getRange()
          return (d.x0 < range[0] || d.x1 > range[1])? 0.7: 1
        })
        .attr('transform', d => {
          let xPos = vis.xScale(d.x0 + vis.config.size / 2)
          return `translate(${xPos}, 0)`
        }).selectAll('.mark')
        .data(d => d)
        .join('circle')
        .attr("fill", d => colorScale(d.types[0]))
        .attr('class', 'mark')
        .attr("opacity", 0.7)
        .attr('r', 8)
        .attr('cy', (d,i) => vis.yScale(i+1));

    marks.on('mouseover', (event, d) => {
      // showing tooltip when mouse over the point mark
      d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY + 10) + 'px')
          .html(`
                    <div class="card" id="${d.number}">
                    <img class="card-image" src="${d.image}">
                    <div class="card-name">${d.name}</div>
                    <div class="card-number">#${d.number}</div>
                    <ul class="card-types">
                        ${d.types.map(type => `<li style="background-color: ${colorScale(type.toLowerCase())}">${type}</li>`).join("")}
                    </ul>
                    </div>
              `);
    }).on('mouseleave', () => {
      d3.select('#tooltip').style('display', 'none');
    });

    // slider handler behavior
    vis.slider = d3.drag()
        .on('drag', (event, d) => {
          let value = vis.xScale.invert(event.x)
          let type = d.type
          vis.value = (type === "w")?
              d3.min([d3.max([value, vis.lower]), vis.range[1].value-vis.config.size]):
              d3.min([d3.max([value, vis.range[0].value+vis.config.size]), vis.upper])

          // move the button when being drag
          vis.updateHandle(type)
        })
        .on('end', (event, d) => {
          // align the button when stopping dragging and update the chart
          let diff = (vis.value - vis.lower)
          let index = Math.round(diff / vis.config.size)
          vis.value = vis.tick[index]
          vis.updateHandle(d.type)
          vis.renderVis()
          // update other views linked
          updateFilter()
        });

    // add handler button
    vis.handle = vis.bar.selectAll(".handle")
        .data(vis.range)
        .join("circle")
        .attr("class", "handle")
        .attr("stroke", "#000")
        .attr("fill", '#a6d6ff')
        .attr("r", vis.config.sliderHeight/2)
        .attr("cy", vis.config.sliderHeight/2)
        .attr("cx", d => vis.xScale(d.value))
        .attr("cursor", "ew-resize")
        .call(vis.slider);
  }

  updateHandle(type) {
    let vis = this

    // update the handle buttons position
    vis.handle
        .attr("cx", d => (d.type === type)? vis.xScale(vis.value): vis.xScale(d.value))
    vis.range.map(d => {
      d.value = (d.type === type)? vis.value: d.value
    })

    let r = vis.getRange().map(vis.xScale)
    vis.rect
        .attr('x', r[0])
        .attr('width', r[1] - r[0])
  }

  getRange() {
    let vis = this

    // return the range filter from the slider bar
    return [vis.range[0].value, vis.range[1].value]
  }

}
