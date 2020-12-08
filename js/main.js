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

      // temp values
      // dataset.push({ Time: '36:00' });
      // dataset.push({ Time: '40:00' });

      const minYear = new Date(String(d3.min(dataset, (d) => d.Year) - 1));
      const maxYear = new Date(
        String(Number(d3.max(dataset, (d) => d.Year)) + 1)
      );
      const xScale = d3
        .scaleTime()
        .domain([minYear, maxYear])

        .range([PADDING, WIDTH - 15]);

      const specifier = '%M:%S';
      console.log('d3 parsed time', d3.timeParse(specifier)('35:15'));
      // console.log('d3 parsed time', d3.timeParse('%M:%S')('35:15'));
      const timeExtent = d3
        .extent(dataset, (d) => d.Time)
        .map((d) => d3.timeParse(specifier)(d));
      console.log('extent', timeExtent);

      const yScale = d3
        .scaleUtc()
        // .scaleTime()
        .domain(timeExtent.reverse())
        // .nice()
        // .domain([minTime, maxTime])
        // .nice()
        .range([HEIGHT - PADDING, 10]);

      console.log(yScale('37:00'));
      const tooltip = d3
        .select('article')
        .append('div')
        .attr('id', 'tooltip')
        .attr('class', 'invisible');

      const svg = d3
        .select('article')
        .append('svg')
        .attr('id', 'title')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .attr('viewBox', '0 0 860 450');
      console.log(xScale(new Date('1999')));
      svg
        .selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
        .style('position', 'relative')
        // .attr('class', 'bar')
        .attr('cx', (d, i) => xScale(new Date(String(d.Year))))
        .attr('cy', (d) => {
          console.log(yScale(d3.timeParse(specifier)(d.Time)));
          return yScale(d3.timeParse(specifier)(d.Time));
        })
        .attr('r', 7)
        .attr('fill', (d) => (d.Doping.length ? 'steelblue' : 'orange'))
        .attr('data-date', (d) => d.date)
        .attr('data-gdp', (d) => d.gdp)
        .on('mouseover', (d, i) => {
          tooltip
            .html(`${d.Name}`)
            .style('left', 200)
            // .attr('data-date', d.date)
            // .attr('data-gdp', d.gdp)
            .attr('class', 'fade-in');
        })
        .on('mouseout', () => {
          tooltip.attr('class', 'invisible');
        });

      // add axis bars
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale).ticks(10);
      // .tickFormat((d) => {
      //   console.log(d);
      //   return `${d.getMinutes()}:${d.getSeconds()}`;
      // });

      console.log(d3);

      console.log('37:30 on yscale', yScale(d3.timeParse(specifier)('37:30')));
      console.log('14:30 on yscale', yScale(d3.timeParse(specifier)('39:00')));
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
    }
  });
})();
