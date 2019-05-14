// import {select, csv, scaleLinear, min, max } from 'd3js';

//Bar chart

const svg = d3.select('svg#bar-chart');

const width = +svg.attr('width');
const height = +svg.attr('height');
// const xValue = d => d.noOfTransactions;
const xValue = d => d.noOfTransactions;
const yValue = d => d.district;
const margin = {top: 20, right: 20, bottom: 100, left: 150};
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const renderNumOfTransactions = data => {
    //Set the domain and range for x axis
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => xValue(d))])
        .range([0, innerWidth]);

    //Set the domain and range for y axis
    const yScale = d3.scaleBand()
        .domain(data.map(d => yValue(d)))
        .range([0, innerHeight])
        .padding(0.1);

    //Create y axis
    const yAxis = d3.axisLeft(yScale);
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('.2s'))
        .tickSize(-innerHeight);

    //create group elements
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    g.append('g').call(yAxis)
        .selectAll('#bar-chart .domain, #bar-chart .tick line').remove();
    g.append('g').call(xAxis)
        .attr('transform', `translate(0, ${innerHeight})`);

    //create rectangle bar charts
    g.selectAll('rect').data(data)
        .enter().append('rect')
        .attr('fill', 'grey')
        .attr('y', d => yScale(yValue(d)))
        .attr('width', d => xScale(xValue(d)))
        .attr('height', yScale.bandwidth())
        .on('mouseenter', function (actual, i) {
            d3.select(this).attr('opacity', 0.8);
        })
        .on('mouseleave', function (actual, i) {
            d3.select(this).attr('opacity', 1)
        });

    g.on('mouseenter', function (s, i) {
        d3.select(this.rect)
            .transition()
            .duration(300)
            .attr('opacity', 0.6)
            .attr('height', yScale.bandwidth() + 10);
    });
};

const averageCal = (data, request) => {
    let sum = 0;
    const codeToExecute = `sum += d.${request};`;
    data.forEach(d => {
        eval(codeToExecute);
    });
    return sum/data.length;
};

//Convert all numeric STRING in the dataset into NUMBER
const convertNumericString = data => {
    for (let i in data){
        for (let j in data[i]){

            //Check if the string does not contain any single word
            if (!data[i][j].match(/[a-z]/i)){

                //Remove space from string
                data[i][j] = data[i][j].replace(/\s/g, '');
            }

            //Check if numeric string and convert
            if(((data[i][j]).match(/^-{0,1}\d+$/)) ||
                ((data[i][j]).match(/^\d+\.\d+$/))){
                data[i][j] = parseFloat(data[i][j]);
            }
        };
    };
};

d3.csv('../data/test_data.csv').then(data => {
    convertNumericString(data);
    console.log(data);
    renderNumOfTransactions(data);
    console.log(averageCal(data, 'failRate'));
});

//Interaction
