
period2000 = [
    {'district': 'District 1', 'houseSoldNum': 132},
    {'district': 'District 2', 'houseSoldNum': 71},
    {'district': 'District 3', 'houseSoldNum': 337},
    {'district': 'District 4', 'houseSoldNum': 93},
    {'district': 'District 5', 'houseSoldNum': 78},
    {'district': 'District 6', 'houseSoldNum': 43},
    {'district': 'District 7', 'houseSoldNum': 20},
    {'district': 'District 8', 'houseSoldNum': 16},
    {'district': 'District 9', 'houseSoldNum': 30},
    {'district': 'District 10', 'houseSoldNum': 8},
    {'district': 'District 11', 'houseSoldNum': 17},
    {'district': 'District 12', 'houseSoldNum': 21},
];
period2001 = [
    {'district': 'District 1', 'houseSoldNum': 113},
    {'district': 'District 2', 'houseSoldNum': 721},
    {'district': 'District 3', 'houseSoldNum': 37},
    {'district': 'District 4', 'houseSoldNum': 931},
    {'district': 'District 5', 'houseSoldNum': 738},
    {'district': 'District 6', 'houseSoldNum': 443},
    {'district': 'District 7', 'houseSoldNum': 520},
    {'district': 'District 8', 'houseSoldNum': 716},
    {'district': 'District 9', 'houseSoldNum': 230},
    {'district': 'District 10', 'houseSoldNum': 87},
    {'district': 'District 11', 'houseSoldNum': 177},
    {'district': 'District 12', 'houseSoldNum': 291},
];
period2002 = [
    {'district': 'District 1', 'houseSoldNum': 322},
    {'district': 'District 2', 'houseSoldNum': 131},
    {'district': 'District 3', 'houseSoldNum': 537},
    {'district': 'District 4', 'houseSoldNum': 933},
    {'district': 'District 5', 'houseSoldNum': 738},
    {'district': 'District 6', 'houseSoldNum': 423},
    {'district': 'District 7', 'houseSoldNum': 220},
    {'district': 'District 8', 'houseSoldNum': 126},
    {'district': 'District 9', 'houseSoldNum': 630},
    {'district': 'District 10', 'houseSoldNum': 78},
    {'district': 'District 11', 'houseSoldNum': 177},
    {'district': 'District 12', 'houseSoldNum': 621},
]
year = [period2000, period2001, period2002];

const N = 10;
const w = 800;
const h = 450;
const margin = {
    top: 20,
    bottom: 100,
    left: 80,
    right: 20
};
const width = w - margin.left - margin.right;
const height = h - margin.top - margin.bottom;

for (let i=0; i<year.length; i++){
    setInterval(function () {
        console.log(i);
        const yScale = d3.scale.ordinal()
            .domain(year[i].map(function (d) {
                return d.district
            }))
            .rangeBands([height, 0]);

        const xScale = d3.scale.linear()
            .domain([0, d3.max(year[i], function (d) {
                return d.houseSoldNum
            })])
            .range([0, width]);

        const linearColorScale = d3.scale.linear()
            .domain([0, year[i].length])
            .range(['#572500', '#F68026']);

        const ordinalColorScale = d3.scale.category20();

        const xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('top');

        const yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');

        const yGridLines = d3.svg.axis()
            .scale(yScale)
            .tickSize(-width, 0, 0)
            .tickFormat('')
            .orient('left');

        const chartGroup = d3.select('body>.container')
            .append('svg')
            .attr('id', 'dynamicBarchart')
            .attr('height', h)
            .attr('width', w)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        const controls = d3.select('body>.container')
            .append('div')
            .attr('id', 'control');

        const sort_btn = controls.append('button')
            .attr('state', 0)
            .html('Sort data: Ascending');

        function drawAxis(params) {
            if (params.initialize === true) {
                //Draw Gridlines
                this.append('g')
                    .call(params.gridline)
                    .classed('gridline', true);

                //Draw X Axis
                this.append('g')
                    .classed('x axis', true)
                    .attr('transform', 'translate(' + 0 + ' , ' + 0 + ')')
                    .call(params.axis.x);

                //Draw Y Axis
                this.append('g')
                    .classed('y axis', true)
                    .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
                    .call(params.axis.y)
                    .selectAll('text')
                    .classed('y-axis-label', true)
                    .style('text-anchor', 'end')
                    .attr('dx', -8)
                    .attr('dy', 8)
                    .attr('transform', 'translate(0, 0)');

                //Draw Y Label
                this.select('.y.axis')
                    .append('text')
                    .attr('x', 0)
                    .attr('y', 0)
                    .style('text-anchor', 'middle')
                    .attr('transform', 'translate(-50,' + height / 2 + ') rotate(-90)')
                    .text('District');

                //Draw X Label
                this.select('.x.axis')
                    .append('text')
                    .attr('x', 0)
                    .attr('y', 0)
                    .style('text-anchor', 'middle')
                    .attr('transform', 'translate(' + width / 2 + ', -30)')
                    .text('Number of sold houses');

            } else if (params.initialize === false) {
                this.selectAll('g.y.axis')
                    .transition()
                    .duration(500)
                    .call(params.axis.y);
                this.selectAll('.y-axis-label')
                    .style('text-anchor', 'end')
                    .attr('dx', -8)
                    .attr('dy', 8)
                    .attr('transform', 'translate(0, 0)');

                this.selectAll('g.x.axis')
                    .transition()
                    .duration(500)
                    .call(params.axis.x);
            }

        }

        function plot(params) {
            xScale.domain([0, d3.max(params.data, function (d) {
                return d.houseSoldNum
            })]);
            yScale.domain(params.data.map(function (d) {
                return d.district
            }));

            drawAxis.call(this, params);

            //Enter Phase
            this.selectAll(".bar")
                .data(params.data)
                .enter()
                .append("rect")
                .classed("bar", true)
                .on("mouseover", function (d, i) {
                    d3.select(this).style("fill", "yellow")
                })
                .on("mouseout", function (d, i) {
                    d3.select(this).style("fill", ordinalColorScale(d.district));
                });


            this.selectAll(".bar-label")
                .data(year[i])
                .enter()
                .append("text")
                .classed("bar-label", true);

            //Update Phase
            this.selectAll(".bar")
                .transition()
                .duration(500)
                .ease("linear")
                .delay(function (d, i) {
                    return i * 5
                })
                // .attr("x", function (d, i) {
                //     return xScale(d.houseSoldNum)
                // })
                .attr("x", 0)
                .attr("y", function (d, i) {
                    return yScale(d.district)
                })
                .attr("width", function (d, i) {
                    return xScale(d.houseSoldNum)
                })
                .attr("height", function (d, i) {
                    return yScale.rangeBand()
                })
                //.style("fill", function(d, i) {return linearColorScale(i)});
                .style("fill", function (d, i) {
                    return ordinalColorScale(d.district)
                });

            this.selectAll(".bar-label")
                .transition()
                .duration(500)
                .ease("linear")
                .delay(function (d, i) {
                    return i * 5
                })
                .attr("x", function (d, i) {
                    return xScale(d.houseSoldNum)
                })
                .attr("y", function (d, i) {
                    return yScale(d.district) + yScale.rangeBand() /2
                })
                .attr("dx", 15)
                .text(function (d, i) {
                    return d.houseSoldNum
                })
                .attr('dy', 5)
                .style("fill", "black")
                .style("text-anchor", "middle");

            //Exit Phase
            this.selectAll(".bar")
                .data(params.data)
                .exit()
                .remove();

            this.selectAll(".bar-label")
                .data(params.data)
                .exit()
                .remove();

        }

        plot.call(chartGroup, {
            data: year[i],
            axis: {
                x: xAxis,
                y: yAxis
            },
            gridline: yGridLines,
            initialize: true
        });

        sort_btn.on("click", function () {
            const self = d3.select(this);
            let state = +self.attr("state");
            const ascending = function (a, b) {
                return a.houseSoldNum - b.houseSoldNum
            }
            const descending = function (a, b) {
                return b.houseSoldNum - a.houseSoldNum
            }
            let txt = "Sort data: ";
            if (state === 0) {
                year[i].sort(ascending);
                state = 1;
                txt += "Descending";
            } else if (state === 1) {
                year[i].sort(descending);
                state = 0;
                txt += "Ascending";
            }
            self.attr("state", state);
            self.html(txt);
            plot.call(chartGroup, {
                data: year[i],
                axis: {
                    x: xAxis,
                    y: yAxis
                },
                gridline: yGridLines,
                initialize: false
            });
        });
    }, i*3000);
}
