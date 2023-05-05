//python -m http.server 8080
//hope to create a 3d plot eventually: https://www.npmjs.com/package/d3-3d3
var chartScales;
var svg = d3.select('svg');
var domainMap;
var baselineCountry = 'Afghanistan';
var country_data;
var filtered_country;
var correlations;
var data_cols;
//creating scales
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');
var padding = {t: 50, r: 50, b: 50, l: 50};
// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

var chartG = svg.append('g')
    .attr('transform', 'translate('+[0, 0]+')');

var xAxisG = chartG.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate('+[0, chartHeight + 60]+')');
var yAxisG = chartG.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate('+[40, 0 ]+')');

d3.csv('CLEANED_assignment_3_dataset.csv').then(function(countries) {
    country_data = countries;
	initializeScatterPlot();
    updateChart();	
	updateBaseline();
    })

d3.csv('category_correlations.csv').then(function(d){
	correlations = d;
	update_coefficient();
	})


// Global functions called when select elements changed
function onXScaleChanged() {
    var select = d3.select('#xScaleSelect').node();
    // Get current value of select element, save to global chartScales
    chartScales.x = select.options[select.selectedIndex].value
    // Update chart
    updateChart();
	update_coefficient();
}

function onYScaleChanged() {
    var select = d3.select('#yScaleSelect').node();
    // Get current value of select element, save to global chartScales
    chartScales.y = select.options[select.selectedIndex].value
    // Update chart
    updateChart();
	update_coefficient();
}

function onBaselineChange() {
    var select = d3.select('#countrySelect').node();
    // Get current value of select element, save to global chartScales
    baselineCountry = select.options[select.selectedIndex].value
    // Update chart    
	updateBaseline();
}

function updateChart() {
    // Update the scales based on new data attributes      
    yScale.domain(domainMap[chartScales.y]).nice();
    xScale.domain(domainMap[chartScales.x]).nice();

    xAxisG.transition().duration(450).call(d3.axisBottom(xScale));
    yAxisG.transition().duration(450).call(d3.axisLeft(yScale));    

	filtered_country_data = country_data.filter(function(item){
			return item[chartScales.x] != '';
		});

    var dots = chartG.selectAll('.dot').data(filtered_country_data);  
    var dotsEnter = dots.enter()
        .append('g')
        .attr('class', 'dot')
        .attr('transform', function(d) {
            var tx = xScale(d[chartScales.x]);
            var ty = yScale(d[chartScales.y]);						
            return 'translate('+[tx, ty]+')';
        });
    
    dotsEnter.append('circle').style("opacity", function(d) {
		if(d['Country'] == baselineCountry){
			return 1;
		}
		return .25;
		});			

    dots.merge(dotsEnter)
        .transition()
        .duration(750)
        .attr('transform', function(d) {
            var tx = xScale(d[chartScales.x]);
            var ty = yScale(d[chartScales.y]);
            return 'translate('+[tx, ty]+')';
        });				
        
	//adding hovering tooltip w/ ISO code
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<strong>" + d['ISO Country code']+", "+ d["Year"] + "</strong>";
		});
		
	svg.call(tip);
	
	dotsEnter
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide);
	
	dots.exit().remove();
	dotsEnter.exit().remove();	
	updateBaseline();
}

function updateBaseline(){
	d3.selectAll('circle').data(filtered_country_data)
		.join('circle')
		.transition()
        .duration(750)		
		.attr("fill", function(d){
				if(d['Country'] == baselineCountry){ return "red"; }
				return "blue";
		})
		.attr("r", function(d){
				if(d['Country'] == baselineCountry){ return 6; }
				return 3;
		}).style("opacity", function(d) {
		if(d['Country'] == baselineCountry){
			return 1;
		}
		return .25;
		});	;
	
}

function initializeScatterPlot(){
	//creating dropdown menus for X and Y axis
    data_cols = country_data.columns    
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
    country_data.forEach(function(row){ country_names.push(row['Country']);});
    country_names = country_names.filter(onlyUnique);
    //adding country names to select list
    d3.select('select.country_select').selectAll("option").data(country_names).enter().append("option").each(
        function(d){                 
                d3.select(this).text(d).attr('value',d);
        });     
    //scaling the axies to the scale of the svg chart    
    xScale = d3.scaleLinear().range([50, svgWidth - 50]);
    yScale = d3.scaleLinear().range([svgHeight - 50, 50]);
    //finding the mininum and maximum value for each column (the diff car metrics)
    domainMap = {};

    data_cols.forEach(function(column) {
		filtered_data = country_data.filter(function(item)
		{
			return item[column] != '';
		});
        domainMap[column] = d3.extent(filtered_data, function(data_element){
            return +data_element[column];
        });

        console.log(domainMap)
       
    });    
    // Create global object called chartScales to keep state
    chartScales = {x: 'Year', y: 'Year'};	
}

function update_coefficient(){
	if (chartScales.x != 'Year' && chartScales.y != 'Year'){		
		ind = data_cols.indexOf(chartScales.x) - 1;
		console.log(correlations[ind][chartScales.y]);
		corr_coeff = correlations[ind][chartScales.y];
		d3.select("body").append('div')
		.html("The correlation coefficient between <strong>"+chartScales.x+
			"</strong> and <strong>"+chartScales.y+"</strong> is "+corr_coeff)
		.attr("class","correlation")
		.attr("x",100)
		.attr("y",100)
		;		
	}
}