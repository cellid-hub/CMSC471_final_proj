 // set the dimensions and margins of the graph
 var margin = { top: 80, right: 30, bottom: 50, left: 110 },
 width = 450 - margin.left - margin.right,
 height = 3000 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
 .select("#my_dataviz")
 .append("svg")
 .attr("width", width + margin.left + margin.right)
 .attr("height", height + margin.top + margin.bottom)
 .append("g")
 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.csv("CLEANED_assignment_3_dataset.csv", function (data) {
 var years = Array.from(
   new Set(
     data.map(function (d) {
       return d.Year;
     })
   )
 );

 var countries = Array.from(
   new Set(
     data.map(function (d) {
       return d.Country;
     })
   )
 );

 var n = countries.length;

 var myColor = d3
   .scaleSequential()
   .domain([0, 100])
   .interpolator(d3.interpolateViridis);

 // Define the x scale
 var x = d3.scaleBand().domain(years).range([0, width]).padding(0.2);
 // Define the y scale
 var y = d3.scaleBand().domain(countries).range([0, height]).padding(0.4);

 // Draw the x axis
 svg
   .append("g")
   .attr("transform", "translate(0," + height + ")")
   .call(d3.axisBottom(x));
 // Draw the y axis
 svg.append("g").call(d3.axisLeft(y));

 // Add X axis label:
 svg
   .append("text")
   .attr("text-anchor", "end")
   .attr("x", width / 2)
   .attr("y", height + 40)
   .text("Year");

 var country = "Haiti";
 var column = "Military Spending as % of GDP";
 var radius = d3.scaleLinear().domain([0, 1]).range([5, 20]);

 // Normalize the data for the specified country and column for each year
 var normalizedData = years.map(function (year) {
   return normalizeData(data, year, column).find(function (d) {
     return d.Country === country;
   });
 });

 // Set up the initial opacity and transition duration for the areas
 var initialOpacity = 0;
 var transitionDuration = 1000;

 // Iterate through every country
 countries.forEach(function (country) {
   // Normalize the data for the specified country and column for each year
   var normalizedData = years.map(function (year) {
     return normalizeData(data, year, column).find(function (d) {
       return d.Country === country;
     });
   });

   // Define the area function
   var area = d3
     .area()
     .x(function (d) {
       return x(d.Year);
     })
     .y0(function (d) {
       return y(d.Country) + y.bandwidth() / 2;
     })
     .y1(function (d) {
       return y(d.Country) + y.bandwidth() / 2 - radius(d.Value);
     })
     .curve(d3.curveMonotoneX);

   // Draw the area using the normalized data points for the current country
   svg
     .append("path")
     .datum(normalizedData)
     .attr("fill", myColor(Math.random() * 100))
     .attr("opacity", initialOpacity) // Set the initial opacity to 0
     .attr("d", area)
     .transition() // Add a transition to animate the drawing of the area
     .duration(transitionDuration)
     .attr("opacity", 1); // Set the final opacity to 1
 });
});

function normalizeData(data, year, column) {
 // Get the minimum and maximum values of the specified column for the specified year
 var extent = d3.extent(
   data.filter(function (d) {
     return d.Year == year;
   }),
   function (d) {
     return +d[column];
   }
 );

 // Normalize the data for the specified year and column
 var normalizedData = data
   .filter(function (d) {
     return d.Year == year;
   })
   .map(function (d) {
     var value = +d[column];

     return {
       Country: d.Country,
       Value: isNaN((value - extent[0]) / (extent[1] - extent[0]))
         ? 0
         : (value - extent[0]) / (extent[1] - extent[0]),
       Year: year,
     };
   });

 return normalizedData;
}