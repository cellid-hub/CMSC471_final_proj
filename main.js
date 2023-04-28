//python -m http.server 8080
var select = d3.selectAll('select');
var chartScales;
d3.csv('CLEANED_assignment_3_dataset.csv').then(function(countries) {
    //creating dropdown menus for X and Y axis
    //exclude list: country, ISO Country code
    options = select.selectAll("option");
    options_enter = options.enter();
    data_cols = dataset.columns
    data_cols.shift(); //removes 'Country'
    data_cols.splice(12, 13); //removes 'Country Iso Code'    
    select.selectAll("option").data(data_cols).enter().append("option").each(
        function(d){                 
                d3.select(this).text(d).attr('value',d);
        });
    //creating scales
    var svgWidth = +svg.attr('width');
    var svgHeight = +svg.attr('height');
    //scaling the axies to the scale of the svg chart    
    xScale = d3.scaleLinear().range([0, svgWidth]);
    yScale = d3.scaleLinear().range([svgHeight, 0]);
    //finding the mininum and maximum value for each column (the diff car metrics)
    domainMap = {};
    data_cols.forEach(function(column) {
        domainMap[column] = d3.extent(countries, function(data_element){
            return data_element[column];
        });
    });

    // Create global object called chartScales to keep state
    chartScales = {x: 'economy (mpg)', y: 'power (hp)'};
    updateChart();

    })


// Global functions called when select elements changed
function onXScaleChanged() {
    var select = d3.select('#xScaleSelect').node();
    // Get current value of select element, save to global chartScales
    chartScales.x = select.options[select.selectedIndex].value
    // Update chart
    updateChart();
}

function onYScaleChanged() {
    var select = d3.select('#yScaleSelect').node();
    // Get current value of select element, save to global chartScales
    chartScales.y = select.options[select.selectedIndex].value
    // Update chart
    updateChart();
}

function updateChart() {
    // Update the scales based on new data attributes
    yScale.domain(domainMap[chartScales.y]).nice();
    xScale.domain(domainMap[chartScales.x]).nice();

    xAxisG.transition().duration(750).call(d3.axisBottom(xScale));
    yAxisG.transition().duration(750).call(d3.axisLeft(yScale));

    var dots = chartG.selectAll('.dot').data(countries);

    var dotsEnter = dots.enter()
    .append('g')
    .attr('class', 'dot')
    .attr('transform', function(d) {
        var tx = xScale(d[chartScales.x]);
        var ty = yScale(d[chartScales.y]);
        return 'translate('+[tx, ty]+')';
    });
    
    dotsEnter.append('circle').attr('r', 3);

    dots.merge(dotsEnter)
    .transition()
    .duration(750)
    .attr('transform', function(d) {
        var tx = xScale(d[chartScales.x]);
        var ty = yScale(d[chartScales.y]);
        return 'translate('+[tx, ty]+')';
    });

    dotsEnter.append('text')
    .attr('y', -10)
    .text(function(d) {
        return d.Country;
    });
}