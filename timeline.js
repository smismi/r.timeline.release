
var data0 = [
	[new Date("2012-10-30 00:00:00"), 0],
	[new Date("2012-10-31 00:00:00"), 0],
	[new Date("2012-11-01 00:00:00"), 0],
	[new Date("2012-11-02 00:00:00"), 0],
	[new Date("2012-11-03 00:00:00"), 0],
	[new Date("2012-11-04 00:00:00"), 0],
	[new Date("2012-11-05 00:00:00"), 3],
	[new Date("2012-11-06 00:00:00"), 56],
	[new Date("2012-11-07 00:00:00"), 5],
	[new Date("2012-11-08 00:00:00"), 2],
	[new Date("2012-11-09 00:00:00"), 0],
	[new Date("2012-11-10 00:00:00"), 0],
	[new Date("2012-11-11 00:00:00"), 0],
	[new Date("2012-11-12 00:00:00"), 1],
	[new Date("2012-11-13 00:00:00"), 0],
	[new Date("2012-11-14 00:00:00"), 2],
	[new Date("2012-11-15 00:00:00"), 1],
	[new Date("2012-11-16 00:00:00"), 0],
	[new Date("2012-11-17 00:00:00"), 0],
	[new Date("2012-11-18 00:00:00"), 0],
	[new Date("2012-11-19 00:00:00"), 1],
	[new Date("2012-11-20 00:00:00"), 0],
	[new Date("2012-11-21 00:00:00"), 1],
	[new Date("2012-11-22 00:00:00"), 0],
	[new Date("2012-11-23 00:00:00"), 0],
	[new Date("2012-11-24 00:00:00"), 0],
	[new Date("2012-11-25 00:00:00"), 1],
	[new Date("2012-11-26 00:00:00"), 0],
	[new Date("2012-11-27 00:00:00"), 0],
	[new Date("2012-11-28 00:00:00"), 1],
	[new Date("2012-11-29 00:00:00"), 0],
	[new Date("2012-11-30 00:00:00"), 0],
	[new Date("2012-12-01 00:00:00"), 0],
	[new Date("2012-12-02 00:00:00"), 0],
	[new Date("2012-12-03 00:00:00"), 0],
	[new Date("2012-12-04 00:00:00"), 0],
	[new Date("2012-12-05 00:00:00"), 0],
	[new Date("2012-12-06 00:00:00"), 0],
	[new Date("2012-12-07 00:00:00"), 0],
	[new Date("2012-12-08 00:00:00"), 0],
	[new Date("2012-12-09 00:00:00"), 1],
	[new Date("2012-12-10 00:00:00"), 0],
	[new Date("2012-12-11 00:00:00"), 0],
	[new Date("2012-12-12 00:00:00"), 0],
	[new Date("2012-12-13 00:00:00"), 0],
	[new Date("2012-12-14 00:00:00"), 0]
];



var barWidth = 24*60*60*1000;


function plotInit() {

	var placeholder = $("#timeline_navigator");
	var placeholder2 = $("#timeline_navigator2");
	var data = [ { "data" : data0 } ];
   	var min_value = new Date("2012-10-30 00:00:00");
   	var max_value = new Date("2012-12-14 00:00:00");
   	var viewmin = new Date("2012-10-30 00:00:00");
   	var viewmax = new Date("2012-12-14 00:00:00");

	var options = {
		xaxis: {
			min			:	viewmin,
			max			:	viewmax,
			position	:	"bottom",
			panRange	:	[min_value, max_value],
			"ticks"         :   function(){

				var ticks =   [];

				if (!plot) {
					var tick_counter = Math.floor((viewmax - viewmin) /  barWidth);
					var last_date = viewmax;
				} else {
					var tick_counter = Math.floor((plot.getAxes().xaxis.max - plot.getAxes().xaxis.min) /  barWidth);
					var last_date = new Date(plot.getAxes().xaxis.max);
				}

										for( var i = 0; i <= tick_counter; i++ ){
											var tick_date = new Date( last_date.getFullYear(), last_date.getMonth(), last_date.getDate() - i );
											ticks.push( [ tick_date.getTime() /*+ 43200000*/, tick_date.getDate() ] ); // 12*60*60*1000 = 43200000 for correcting position (left border)
										}



//				for( var i = 0; i <= tick_counter; i++ ){
//					var tick_date = new Date( last_date.getFullYear(), last_date.getMonth(), last_date.getDate(), last_date.getHours() - i );
//					ticks.push( [ tick_date.getTime() /*+ 43200000*/, tick_date.getHours() ] ); // 12*60*60*1000 = 43200000 for correcting position (left border)
//				}
				return ticks;
			}


		},
		"series":	{
			"bars"		:	{
				"show"			:	true,
				"lineWidth"		:	0,
				"fill"			:	true,
				"fillColor"		:	"#b7c1c4",
				"barWidth"		:	({ "MONTH" : 24*60*60*1000, "WEEK" : 24*60*60*1000, "DAY" : 60*60*1000 })[ "MONTH" ]
			},
			"shadowSize"	:	0
		},
		"yaxes"	:	[{
			"zoomRange" :   false,
			"panRange"  :   false,
			"show"      :   false,
			"min"       :   null,
			"max"       :   null
		}],
		pan: {
			interactive: true,
			frameRate: 1000
		},
		zoom: {
			interactive: true,
			amount: 1.1
		}

	}
	var options2 = {
		xaxis: {
			min			:	viewmin,
			max			:	viewmax,
			position	:	"bottom",
			panRange	:	[min_value, max_value],
			"ticks"         :   function(){
				var ticks =   [];
				return ticks;
			}
		},
		"series":	{
			"bars"		:	{
				"show"			:	true,
				"lineWidth"		:	0,
				"fill"			:	true,
				"fillColor"		:	"#b7c1c4",
				"barWidth"		:	({ "MONTH" : 24*60*60*1000, "WEEK" : 24*60*60*1000, "DAY" : 60*60*1000 })[ "MONTH" ]
			},
			"shadowSize"	:	0
		},
		"yaxes"	:	[{
			"zoomRange" :   false,
			"panRange"  :   false,
			"show"      :   false,
			"min"       :   null,
			"max"       :   null
		}],
		pan: {
			interactive: true,
			frameRate: 1000
		},
		zoom: {
			interactive: true,
			amount: 1.1
		}

	};
	var plot = $.plot(placeholder, data, options);
	$.plot(placeholder2, data, options2);

	var pan_lock = true;
	var zoom_lock = true;

	$('#timeline_navigator canvas').bind('drag', function(){
		pan_lock = false;
	});
	$('#timeline_navigator canvas').bind('dragend', function(){
		pan_lock = true;
	});
	$('#timeline_navigator canvas').bind('mouseenter', function(){
		zoom_lock = false;
	});
	$('#timeline_navigator canvas').bind('mouseleave', function(){
		zoom_lock = true;
	});

	placeholder.bind('plotpan', function (event, plot) {

		viewmin = new Date(Math.floor(plot.getAxes().xaxis.min));
		viewmax = new Date(Math.floor(plot.getAxes().xaxis.max));


		if (!pan_lock)  $( "#slider" ).dragslider( "option", "values", [viewmin.getTime() , viewmax.getTime() ] );

	});


	placeholder.bind('plotzoom', function (event, plot) {

		viewmin = new Date(Math.floor(plot.getAxes().xaxis.min));
		viewmax = new Date(Math.floor(plot.getAxes().xaxis.max));


		if (!zoom_lock) $( "#slider" ).dragslider( "option", "values", [viewmin.getTime() , viewmax.getTime() ] );



	});




	$( "#slider" ).dragslider({
		range: true,
		rangeDrag: true,
		animate: true,
		min: min_value.getTime(),
		max: max_value.getTime(),
		values: [ viewmin.getTime(), viewmax.getTime() ],
		step: 100,
		slide: function( event, ui ) {

			viewmin = new Date(ui.values[0]);
			viewmax = new Date(ui.values[1]);


			var range = {};
			range.from = ui.values[0];
			range.to = ui.values[1];
			pereplot(range);
		}
	});



	function pereplot (range) {

		var d = plot.getAxes().xaxis.datamax - plot.getAxes().xaxis.datamin;
		var b = range.to - range.from;
		plot.zoom({ amount: 0.0000000000000000000000001});
		plot.zoom({ amount: d/b });

		coord = plot.p2c({"x" : plot.getAxes().xaxis.min - (plot.getAxes().xaxis.min - range.from)})

		if( typeof( coord.left ) != 'undefined' && coord.left != 0 )
			plot.pan( coord );

	}


}


