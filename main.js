//python -m http.server 8080
//hope to create a 3d plot eventually: https://www.npmjs.com/package/d3-3d3
var chartScales;
var svg = d3.select('svg');
var domainMap;
var baselineCountry;
var country_data;
//creating scales
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');
var padding = {t: 20, r: 20, b: 20, l: 20};
// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

var chartG = svg.append('g')
    .attr('transform', 'translate('+[0, 0]+')');

var xAxisG = chartG.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate('+[50, chartHeight]+')');
var yAxisG = chartG.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate('+[padding.l, -20 ]+')');

d3.csv('CLEANED_assignment_3_dataset.csv').then(function(countries) {
    country_data = countries;
    //country_data[]
    //creating dropdown menus for X and Y axis
    data_cols = countries.columns    
    //removes 'Country Iso Code' and 'Country'
    data_cols = data_cols.filter(function (data_col) {
        return data_col !== 'ISO Country code' && data_col !== 'Country'; });
    //generates column labels for x/y axis
    d3.selectAll('select.axis_select').selectAll("option").data(data_cols).enter().append("option").each(
        function(d){                 
                d3.select(this).text(d).attr('value',d);
        });       
    //creating list of country names
    var country_names = [];
    function onlyUnique(value, index, array) {
        return array.indexOf(value) === index;
    }
    countries.forEach(function(row){ country_names.push(row['Country']);});
    country_names = country_names.filter(onlyUnique);
    //adding country names to select list
    d3.select('select.countrySelect').selectAll("option").data(country_names).enter().append("option").each(
        function(d){                 
                d3.select(this).text(d).attr('value',d);
        });     
    //scaling the axies to the scale of the svg chart    
    xScale = d3.scaleLinear().range([5, svgWidth]);
    yScale = d3.scaleLinear().range([svgHeight, 5]);
    //finding the mininum and maximum value for each column (the diff car metrics)
    domainMap = {};
    data_cols.forEach(function(column) {
		filtered_data = country_data.filter(function(item)
		{
			return item[column] != '';
		});
        domainMap[column] = d3.extent(filtered_data, function(data_element){
            return data_element[column];
        });
    });
    console.log(domainMap);
    // Create global object called chartScales to keep state
    chartScales = {x: 'Year', y: 'Year'};
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

function onBaselineChange() {
    var select = d3.select('#countrySelect').node();
    // Get current value of select element, save to global chartScales
    baselineCountry = select.options[select.selectedIndex].value
    // Update chart
    updateChart();
}

function updateChart() {
    // Update the scales based on new data attributes      
    yScale.domain(domainMap[chartScales.y]).nice();
    xScale.domain(domainMap[chartScales.x]).nice();

    xAxisG.transition().duration(450).call(d3.axisBottom(xScale));
    yAxisG.transition().duration(450).call(d3.axisLeft(yScale));    

	filtered_country_data_x = country_data.filter(function(item)
		{
			return item[chartScales.x] != '';
		});
	filtered_country_data_y = country_data.filter(function(item)
	{
		return item[chartScales.y] != '';
	});

    var dots = chartG.selectAll('.dot').data(filtered_country_data_x);  
    var dotsEnter = dots.enter()
        .append('g')
        .attr('class', 'dot')
        .attr('transform', function(d) {
            var tx = xScale(d[chartScales.x]);
            var ty = yScale(d[chartScales.y]);						
            return 'translate('+[tx, ty]+')';
        });
    
    dotsEnter.append('circle').attr('r',3);    

    dots.merge(dotsEnter)
        .transition()
        .duration(750)
        .attr('transform', function(d) {
            var tx = xScale(d[chartScales.x]);
            var ty = yScale(d[chartScales.y]);
            return 'translate('+[tx, ty]+')';
        })
        .style("fill", function(d){
            if( d["Country"] != baselineCountry){				
                return "red";
            }
            return "blue";
        });
        
    //adding ISO code text to each country
    dotsEnter.append('text')
    .attr('y', -10)
    .text(function(d) {
        return d['ISO Country code'];
    });
	dots.exit().remove();
}