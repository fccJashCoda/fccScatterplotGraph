(() => {
  window.addEventListener('DOMContentLoaded', async () => {
    // Constants
    const URL = 'http://localhost:5555/api';
    const WIDTH = 860;
    const HEIGHT = 500;
    const PADDING = 60;

    // DOM queries
    const svgContainer = document.getElementById('svgContainer');

    // Init
    renderData();

    // Function Declarations
    async function fetchData() {
      try {
        const response = await fetch(URL);
        const data = await response.json();
        return data.data;
      } catch (err) {
        return [];
      }
    }

    async function renderData() {
      svgContainer.innerHTML = '';
      const dataset = await fetchData();
      console.log(dataset);

      const minYear = new Date(String(d3.min(dataset, (d) => d.Year) - 1));
      const maxYear = new Date(
        String(Number(d3.max(dataset, (d) => d.Year)) + 1)
      );

      const xScale = d3
        .scaleTime()
        .domain([minYear, maxYear])
        .range([PADDING, WIDTH - 15]);

      const specifier = '%M:%S';

      const timeData = dataset.map((d) => new Date(d.Seconds * 1000));
      const parsedData = dataset.map((d) => d3.timeParse(specifier)(d.Time));

      // const startTime = d3.max(parsedData);
      // const endTime = d3.min(parsedData);
      const startTime = d3.max(timeData);
      const endTime = d3.min(timeData);

      console.log('starttime', startTime);
      console.log('endtime', endTime);

      const yScale = d3
        .scaleLinear()
        // .scaleTime()
        .domain([startTime, endTime])
        // .domain(d3.extent(parsedData).reverse())
        // .domain(timeExtent.reverse())
        .range([HEIGHT - PADDING, 10]);

      console.log('new ySCale', yScale(startTime));

      // add axis bars

      const timeFormat = d3.timeFormat('%M:%S');
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);

      console.log(d3.range(startTime, endTime, 15000));
      const tooltip = d3
        .select('article')
        .append('div')
        .attr('id', 'tooltip')
        .style('visibility', 'hidden');

      const tooltipHTML = (d) => `
        ${d.Name}, ${d.Nationality} 
        <br>
        Place: ${d.Place} Year: ${d.Year} Time: ${d.Time}
        
        ${d.Doping ? `<br><br>${d.Doping}` : ''}

      `;
      const svg = d3
        .select('article')
        .append('svg')
        .attr('id', 'title')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .attr('viewBox', '0 0 860 450');

      svg
        .selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
        .style('position', 'relative')
        .attr('class', 'dot')
        .attr('cx', (d, i) => xScale(new Date(String(d.Year))))
        .attr('cy', (d, i) => yScale(timeData[i]))
        // .attr('cy', (d) => yScale(d3.timeParse(specifier)(d.Time)))
        .attr('r', 7)
        .attr('fill', (d) => (d.Doping.length ? 'steelblue' : 'orange'))
        .attr('data-xvalue', (d) => new Date(String(d.Year)))
        // .attr('data-yvalue', (d) => new Date(String(d.Time)));
        // .attr('data-yvalue', (d) => yScale(d3.timeParse(specifier)(d.Time)));
        .attr('data-yvalue', (d, i) => timeData[i]);
      // .attr('data-yvalue', (d) => d3.timeParse(specifier)(d.Time));
      svg
        .selectAll('.dot')
        .on('mouseover', (d, i) => {
          tooltip
            .html(`${tooltipHTML(d)}`)
            .attr('data-year', `${new Date(String(d.Year))}`)
            // .attr('data-year', `${xScale(new Date(String(d.Year)))}`)
            .style('visibility', 'visible')
            .style('top', `${yScale(timeData[i])}px`)
            .style('left', `${xScale(new Date(String(d.Year))) + 8}px`);
        })
        .on('mouseout', () => {
          tooltip.style('visibility', 'hidden');
        });

      svg
        .append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(0,${HEIGHT - PADDING})`)
        .call(xAxis);

      svg
        .append('g')
        .attr('id', 'y-axis')
        .attr('transform', `translate(${PADDING}, 0)`)
        .call(yAxis);

      svg
        .append('text')
        .attr('x', -HEIGHT / 2 - 30)
        .attr('y', 15)
        .attr('transform', `rotate(-90)`)
        .text('Time to climb');

      svg
        .append('text')
        .attr('id', 'legend')
        .attr('x', WIDTH - 100)
        .attr('y', 100)
        .html('blue = Doping suspicion <br> orange = clean');
    }
  });
})();
