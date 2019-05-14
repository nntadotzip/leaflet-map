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
const dataset = [
    {key: "Glazed", value: 132},
    {key: "Jelly", value: 71},
    {key: "Holes", value: 337},
    {key: "Sprinkles", value: 93},
    {key: "Crumb", value: 78},
    {key: "Chocolate", value: 43},
    {key: "Coconut", value: 20},
    {key: "Cream", value: 16},
    {key: "Cruller", value: 30},
    {key: "Éclair", value: 8},
    {key: "Fritter", value: 17},
    {key: "Bearclaw", value: 21}
];


const yScale = d3.scale.linear()
    .domain([0, d3.max(dataset, function (d) {
        return d.value
    })])
    .range([height, 0]);

const xScale = d3.scale.ordinal()
    .domain(dataset.map(function (d) {
        return d.key
    }))
    .rangeBands([0, width]);

const linearColorScale = d3.scale.linear()
    .domain([0, dataset.length])
    .range(["#572500", "#F68026"]);

const ordinalColorScale = d3.scale.category20();

const xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

const yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");

const yGridLines = d3.svg.axis()
    .scale(yScale)
    .tickSize(-width, 0, 0)
    .tickFormat("")
    .orient("left");

const chartGroup = d3.select("body")
    .append("svg")
    .attr("id", "chart")
    .attr("height", h)
    .attr("width", w)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const controls = d3.select("body")
    .append("div")
    .attr("id", "control");

const sort_btn = controls.append("button")
    .attr("state", 0)
    .html("Sort data: Ascending");

function drawAxis(params) {
    if (params.initialize === true) {
        //Draw Gridlines
        this.append("g")
            .call(params.gridline)
            .classed('gridline', true);

        //Draw X Axis
        this.append("g")
            .classed("x axis", true)
            .attr("transform", "translate(" + 0 + " , " + height + ")")
            .call(params.axis.x)
            .selectAll("text")
            .classed("x-axis-label", true)
            .style("text-anchor", "end")
            .attr("dx", -8)
            .attr("dy", 8)
            .attr("transform", "translate(0, 0) rotate(-45)");

        //Draw Y Axis
        this.append("g")
            .classed("y axis", true)
            .attr("transform", "translate(" + 0 + "," + 0 + ")")
            .call(params.axis.y);

        //Draw Y Label
        this.select(".y.axis")
            .append("text")
            .attr("x", 0)
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(-50," + height / 2 + ") rotate(-90)")
            .text("Units Sold");

        //Draw X Label
        this.select(".x.axis")
            .append("text")
            .attr("x", 0)
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + width / 2 + ", 80)")
            .text("Donut Type");

    } else if (params.initialize === false) {
        this.selectAll("g.x.axis")
            .transition()
            .duration(500)
            .call(params.axis.x);
        this.selectAll(".x-axis-label")
            .style("text-anchor", "end")
            .attr("dx", -8)
            .attr("dy", 8)
            .attr("transform", "translate(0, 0) rotate(-45)");

        this.selectAll("g.y.axis")
            .transition()
            .duration(500)
            .call(params.axis.y);
    }

}
function plot(params) {
    yScale.domain([0, d3.max(params.data, function (d) {
        return d.value
    })]);
    xScale.domain(params.data.map(function (d) {
        return d.key
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
            d3.select(this).style("fill", ordinalColorScale(d.key));
        });


    this.selectAll(".bar-label")
        .data(dataset)
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
        .attr("x", function (d, i) {
            return xScale(d.key)
        })
        .attr("y", function (d, i) {
            return yScale(d.value)
        })
        .attr("width", function (d, i) {
            return xScale.rangeBand()
        })
        .attr("height", function (d, i) {
            return height - yScale(d.value)
        })
        //.style("fill", function(d, i) {return linearColorScale(i)});
        .style("fill", function (d, i) {
            return ordinalColorScale(d.key)
        });

    this.selectAll(".bar-label")
        .transition()
        .duration(500)
        .ease("linear")
        .delay(function (d, i) {
            return i * 5
        })
        .attr("x", function (d, i) {
            return xScale(d.key) + xScale.rangeBand() / 2
        })
        .attr("y", function (d, i) {
            return yScale(d.value)
        })
        .attr("dy", 15)
        .text(function (d, i) {
            return d.value
        })
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
    data: dataset,
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
        return a.value - b.value
    }
    const descending = function (a, b) {
        return b.value - a.value
    }
    let txt = "Sort data: ";
    if (state === 0) {
        dataset.sort(ascending);
        state = 1;
        txt += "Descending";
    } else if (state === 1) {
        dataset.sort(descending);
        state = 0;
        txt += "Ascending";
    }
    self.attr("state", state);
    self.html(txt);
    plot.call(chartGroup, {
        data: dataset,
        axis: {
            x: xAxis,
            y: yAxis
        },
        gridline: yGridLines,
        initialize: false
    });
});