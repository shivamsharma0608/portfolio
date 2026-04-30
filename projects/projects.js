import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"
  : "/portfolio/";

const projects = await fetchJSON(`${BASE_PATH}lib/projects.json`);
const projectsContainer = document.querySelector('.projects');

const title = document.querySelector('.projects-title');
title.textContent = `Projects (${projects.length})`;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let selectedIndex = -1;
let currentQuery = '';  // track search query globally

// Apply both filters together
function getFilteredProjects() {
  return projects.filter((project) => {
    let matchesSearch = Object.values(project)
      .join('\n')
      .toLowerCase()
      .includes(currentQuery.toLowerCase());

    return matchesSearch;
  });
}

function renderPieChart(projectsGiven) {
  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();
  d3.select('.legend').selectAll('li').remove();

  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));

  newArcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;

        // Update wedge classes
        svg
          .selectAll('path')
          .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');

        // Update legend classes
        d3.select('.legend')
          .selectAll('li')
          .attr('class', (_, idx) =>
            idx === selectedIndex ? 'legend-item selected' : 'legend-item'
          );

        // Apply BOTH filters
        let searchFiltered = getFilteredProjects();
        if (selectedIndex === -1) {
          renderProjects(searchFiltered, projectsContainer, 'h2');
        } else {
          let yearFiltered = searchFiltered.filter(
            (p) => p.year === newData[selectedIndex].label
          );
          renderProjects(yearFiltered, projectsContainer, 'h2');
        }
      });
  });

  // Draw legend
  let legend = d3.select('.legend');
  newData.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(i)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// Initial render
renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);

// Search
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  currentQuery = event.target.value;  // update global query

  let searchFiltered = getFilteredProjects();

  // Pie chart updates to reflect only search-filtered projects
  renderPieChart(searchFiltered);

  // Apply year filter on top of search filter if a wedge is selected
  if (selectedIndex === -1) {
    renderProjects(searchFiltered, projectsContainer, 'h2');
  } else {
    // selectedIndex may be out of bounds after search narrows data
    // so reset it safely
    selectedIndex = -1;
    renderProjects(searchFiltered, projectsContainer, 'h2');
  }
});