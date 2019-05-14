function dashboard(id, fData){
    const barColor = 'steelblue';
    function segColor(c){ return {fail:"#caccce", pending:"#e08214",success:"#41ab5d"}[c]; }

    // compute total for each state.
    fData.forEach(function(d){d.total=d.status.fail+d.status.pending+d.status.success;});

    // function to handle histogram.
    function histoGram(fD){
        let hG={},
            hGDim = {t: 60, r: 0, b: 30, l: 0};
        hGDim.w = 900 - hGDim.l - hGDim.r,
            hGDim.h = 300 - hGDim.t - hGDim.b;

        //create svg for histogram.
        const hGsvg = d3.select(id).append("svg")
            .attr("width", hGDim.w + hGDim.l + hGDim.r)
            .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
            .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

        // create function for x-axis mapping.
        const x = d3.scaleBand().rangeRound([0, hGDim.w])
            .domain(fD.map(function(d) { return d[0]; }))
            .padding(0.1);

        // Add x-axis to the histogram svg.
        const xAxis = d3.axisBottom().scale(x);
        hGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + hGDim.h + ")")
            .call(xAxis)
            .selectAll('.domain, .tick line').remove();

        // Create function for y-axis map.
        const y = d3.scaleLinear().range([hGDim.h, 0])
            .domain([0, d3.max(fD, function(d) { return d[1]; })]);

        // Create bars for histogram to contain rectangles and status labels.
        const bars = hGsvg.selectAll(".bar").data(fD).enter()
            .append("g").attr("class", "bar");

        //create the rectangles.
        bars.append("rect")
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return hGDim.h - y(d[1]); })
            .attr('fill',barColor)
            .on("mouseover",mouseover)// mouseover is defined befail.
            .on("mouseout",mouseout);// mouseout is defined befail.

        //Create the statusuency labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(",")(d[1])})
            .attr("x", function(d) { return x(d[0])+x.bandwidth()/2; })
            .attr("y", function(d) { return y(d[1])-5; })
            .attr("text-anchor", "middle");

        function mouseover(d){  // utility function to be called on mouseover.
            // filter for selected state.
            const st = fData.filter(function(s){ return s.district == d[0];})[0],
                nD = d3.keys(st.status).map(function(s){ return {type:s, status:st.status[s]};});

            // call update functions of pie-chart and legend.
            pC.update(nD);
            leg.update(nD);
        }

        function mouseout(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.
            pC.update(tF);
            leg.update(tF);
        }

        // create function to update the bars. This will be used by pie-chart.
        hG.update = function(nD, color){
            // update the domain of the y-axis map to reflect change in statusuencies.
            y.domain([0, d3.max(nD, function(d) { return d[1]; })]);

            // Attach the new data to the bars.
            const bars = hGsvg.selectAll(".bar").data(nD);

            // transition the height and color of rectangles.
            bars.select("rect").transition().duration(500)
                .attr("y", function(d) {return y(d[1]); })
                .attr("height", function(d) { return hGDim.h - y(d[1]); })
                .attr("fill", color);

            // transition the statusuency labels location and change value.
            bars.select("text").transition().duration(500)
                .text(function(d){ return d3.format(",")(d[1])})
                .attr("y", function(d) {return y(d[1])-5; });
        }
        return hG;
    }

    // function to handle pieChart.
    function pieChart(pD){
        let pC ={},    pieDim ={w:250, h: 250};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

        // create svg for pie chart.
        const piesvg = d3.select(id).append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");

        // create function to draw the arcs of the pie slices.
        const arc = d3.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        // create a function to compute the pie slice angles.
        const pie = d3.pie().sort(null).value(function(d) { return d.status; });

        // Draw the pie slices.
        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
            .on("mouseover",mouseover).on("mouseout",mouseout);

        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        }
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d){
            // call the update function of histogram with new data.
            hG.update(fData.map(function(v){
                return [v.district,v.status[d.data.type]];}),segColor(d.data.type));
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
            // call the update function of histogram with all data.
            hG.update(fData.map(function(v){
                return [v.district,v.total];}), barColor);
        }
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            const i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }
        return pC;
    }

    // function to handle legend.
    function legend(lD){
        let leg = {};

        // create table for legend.
        const legend = d3.select(id).append("table").attr('class','legend');

        // create one row per segment.
        const tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");

        // create the first column for each segment.
        tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
            .attr("width", '16').attr("height", '16')
            .attr("fill",function(d){ return segColor(d.type); });

        // create the second column for each segment.
        tr.append("td").text(function(d){ return d.type;});

        // create the third column for each segment.
        tr.append("td").attr("class",'legendstatus')
            .text(function(d){ return d3.format(",")(d.status);});

        // create the fourth column for each segment.
        tr.append("td").attr("class",'legendPerc')
            .text(function(d){ return getLegend(d,lD);});

        // Utility function to be used to update the legend.
        leg.update = function(nD){
            // update the data attached to the row elements.
            let l = legend.select("tbody").selectAll("tr").data(nD);

            // update the statusuencies.
            l.select(".legendstatus").text(function(d){ return d3.format(",")(d.status);});

            // update the percentage column.
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});
        }

        function getLegend(d,aD){ // Utility function to compute percentage.
            return d3.format("%")(d.status/d3.sum(aD.map(function(v){ return v.status; })));
        }

        return leg;
    }

    // calculate total statusuency by segment for all state.
    const tF = ['fail','pending','success'].map(function(d){
        return {type:d, status: d3.sum(fData.map(function(t){ return t.status[d];}))};
    });

    // calculate total statusuency by state for all segment.
    const sF = fData.map(function(d){return [d.district,d.total];});

    const hG = histoGram(sF), // create the histogram.
        pC = pieChart(tF), // create the pie-chart.
        leg= legend(tF);  // create the legend.
}

var data=[
    {district:'Quận 1',status:{fail:2, pending:11, success:81}}
    ,{district:'Quận 2',status:{fail:14, pending:12, success:11}}
    ,{district:'Quận 3',status:{fail:6, pending:7, success:27}}
    ,{district:'Quận 4',status:{fail:9, pending:13, success:111}}
    ,{district:'Quận 5',status:{fail:3, pending:10, success:215}}
    ,{district:'Quận 6',status:{fail:4, pending:13, success:11}}
    ,{district:'Quận 7',status:{fail:15, pending:11, success:13}}
    ,{district:'Quận 8',status:{fail:6, pending:7, success:71}}
    ,{district:'Quận 9',status:{fail:1, pending:11, success:13}}
    ,{district:'Quận 10',status:{fail:6, pending:7, success:71}}
    ,{district:'Quận 11',status:{fail:2, pending:17, success:16}}
    ,{district:'Quận 12',status:{fail:4, pending:13, success:81}}
    ,{district:'Quận Bình Tân',status:{fail:9, pending:14, success:16}}
    ,{district:'Quận Thủ Đức',status:{fail:6, pending:14, success:15}}
    ,{district:'Quận Gò Vấp',status:{fail:3, pending:20, success:71}}
    ,{district:'Quận Tân Bình',status:{fail:2, pending:32, success:15}}

];

dashboard('#dashboard',data);