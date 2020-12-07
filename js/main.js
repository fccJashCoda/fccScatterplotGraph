(() => {
  window.addEventListener('DOMContentLoaded', async () => {
    // Constants
    const URL = 'http://localhost:5555/api';
    const WIDTH = 860;
    const HEIGHT = 450;
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

      const yearData = dataset.map((set) => String(set.Year));
      const timeData = dataset.map((set) => set.Time);
      console.log(timeData);
      console.log('yearData', yearData);
      console.log(d3.min(timeData), d3.max(timeData));
      console.log(d3.min(yearData), d3.max(yearData));

      const minYear = new Date(String(d3.min(dataset, (d) => d.Year) - 1));
      const maxYear = new Date(
        String(Number(d3.max(dataset, (d) => d.Year)) + 1)
      );
      const xScale = d3
        .scaleTime()
        .domain([minYear, maxYear])

        .range([PADDING, WIDTH - 15]);

      const min = d3.min(dataset, (d) => d.Time);
      console.log('min', min);
      const minTime = new Date(0, 0, 0, 0, min.slice(0, 2), min.slice(3));
      console.log(minTime);
      const maxTime = '';
      const yScale = d3
        .scaleTime()
        .domain([d3.min(timeData), d3.max(timeData)])
        .range([HEIGHT - PADDING, 0]);

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

      // svg
      //   .selectAll('rect')
      //   .data(dataset)
      //   .enter()
      //   .append('rect')
      //   .style('position', 'relative')
      //   .attr('class', 'bar')
      //   .attr('x', (d, i) => xScale(yearData[i]))
      //   .attr('y', (d) => yScale(d.gdp))
      //   .attr('width', WIDTH / dataset.length)
      //   .attr('height', (d) => yScale(0) - yScale(d.gdp))
      //   .attr('data-date', (d) => d.date)
      //   .attr('data-gdp', (d) => d.gdp)
      //   .on('mouseover', (d, i) => {
      //     tooltip
      //       .html(`${d.year} ${d.quarter} <br> $${d.gdp} Billion`)
      //       .style('left', `${xScale(yearData[i]) + 20}px`)
      //       .attr('data-date', d.date)
      //       .attr('data-gdp', d.gdp)
      //       .attr('class', 'fade-in');
      //   })
      //   .on('mouseout', () => {
      //     tooltip.attr('class', 'invisible');
      //   });

      // add axis bars
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

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
