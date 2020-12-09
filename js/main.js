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

    async function renderData() {
      // Private Function Declarations
      async function _fetchData() {
        try {
          const response = await fetch(URL);
          const data = await response.json();
          return data.data;
        } catch (err) {
          return [];
        }
      }
      const _tooltipHTML = (d) => `
        ${d.Name}, ${d.Nationality} 
        <br>
        Place: ${d.Place} Year: ${d.Year} Time: ${d.Time}
        
        ${d.Doping ? `<br><span class='warning'>${d.Doping}</span>` : ''}

      `;

      svgContainer.innerHTML = '';
      const dataset = await _fetchData();

      const minYear = new Date(String(d3.min(dataset, (d) => d.Year) - 1));
      const maxYear = new Date(
        String(Number(d3.max(dataset, (d) => d.Year)) + 1)
      );

      const x = d3
        .scaleTime()
        .domain([minYear, maxYear])
        .range([PADDING, WIDTH - 15]);

      const timeData = dataset.map((d) => new Date(d.Seconds * 1000));
      const [endTime, startTime] = d3.extent(timeData);

      const y = d3
        .scaleTime()
        .domain([startTime, endTime])
        .range([HEIGHT - PADDING, 10]);

      // add axis bars
      const timeFormat = d3.timeFormat('%M:%S');
      const xAxis = d3.axisBottom(x);
      const yAxis = d3.axisLeft(y).tickFormat(timeFormat);

      const tooltip = d3
        .select('article')
        .append('div')
        .attr('id', 'tooltip')
        .style('visibility', 'hidden');

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
        .attr('cx', (d, i) => x(new Date(String(d.Year))))
        .attr('cy', (d, i) => y(timeData[i]))
        .attr('r', 7)
        .attr('fill', (d) => (d.Doping.length ? 'orange' : 'green'))
        .attr('data-xvalue', (d) => new Date(String(d.Year)))
        .attr('data-yvalue', (d, i) => timeData[i]);

      svg
        .selectAll('.dot')
        .on('mouseover', (d, i) => {
          tooltip
            .html(`${_tooltipHTML(d)}`)
            .attr('data-year', `${new Date(String(d.Year))}`)
            .style('visibility', 'visible')
            .style('top', `${y(timeData[i])}px`)
            .style('left', `${x(new Date(String(d.Year))) + 8}px`)
            .style('background', `${d.Doping.length ? 'orange' : 'green'}`);
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
