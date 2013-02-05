
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

var months_names    =   {
	"nominative"    :   [ "январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь" ],
	"genitive"      :   [ "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря" ]
};

var barWidth = 24*60*60*1000;


function plotInit() {
 	var placeholder = $("#timeline_navigator");
	var placeholder2 = $("#timeline_navigator2");
	var data = [ { color:'#f00', "data" : data0 },  { color:'#f00', "data" : data0, "xaxis" : 2} ];
	var data2 = [ { color:'#f00', "data" : data0 } ];
   	var min_value = new Date("2012-10-30 00:00:00");
   	var max_value = new Date("2012-12-14 00:00:00");
   	var viewmin = new Date("2012-10-30 00:00:00");
   	var viewmax = new Date("2012-12-14 00:00:00");

	var options = {
		crosshair :   { "mode" : "x", "locked" : true },
		grid: {
			borderWidth	:	1,
			lineWidth	:	0
		},
		"xaxes"	: [{
			min			:	viewmin,
			max			:	viewmax,
			position	:	"bottom",
			panRange	:	[min_value, max_value],
			tickOffset	:  	function(){
				return { x: 0, y: 0 }
			},
			ticks         :   function(){

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
				return ticks;
			}
//			tickFormatter: function formatter(val, axis) {
//				return val.toFixed(axis.tickDecimals);
//			}


		},
			{
			min			:	viewmin,
			max			:	viewmax,
			position	:	"top",
			panRange	:	[min_value, max_value],
			tickOffset	: 	function(){

				return { x: 0, y: 0 }
			},
			ticks         :   function(){

				var ticks =   [],
					first_tick_date = new Date( viewmin ),
					last_tick_date = new Date( viewmax );
//				if (!plot) {
//					var month_counter = Math.floor((viewmax - viewmin) /  15*24*60*60*1000);
//					var month_last_date = viewmax;
//				} else {
//					var month_counter = Math.floor((plot.getAxes().xaxis.max - plot.getAxes().xaxis.min) /  15*24*60*60*1000);
//					var month_last_date = new Date(plot.getAxes().xaxis.max);
//				}

				var month_count = (last_tick_date.getFullYear() - first_tick_date.getFullYear()) * 12 - first_tick_date.getMonth() + 1 + last_tick_date.getMonth()
				for( var i = 0; i < month_count; i++ ){
					var month_date_end = new Date( first_tick_date.getFullYear(), first_tick_date.getMonth() + i + 1, 0 ),
						month_date_middle = new Date( month_date_end.getFullYear(), month_date_end.getMonth(), parseInt( month_date_end.getDate() ));
					ticks.push( [ month_date_middle.getTime(), months_names.nominative[ month_date_middle.getMonth() ] + " " + month_date_middle.getFullYear() ] );
				}

				return ticks;
			}
		}],
		"series":	{
			"bars"		:	{
				"show"			:	true,
				"lineWidth"		:	0,
				"fill"			:	true,
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
		crosshair :   { "mode" : "x", "locked" : true },
		grid: {
			borderWidth	:	1,
			lineWidth	:	0
		},
		xaxis: {
			min			:	viewmin,
			max			:	viewmax,
			position	:	"top",
			"show"      :   false,
			tickOffset	: 	function(){

				return { x: 0, y: 0 }
			},
			ticks         :   function(){

				var ticks =   [],
					first_tick_date = new Date( viewmin ),
					last_tick_date = new Date( viewmax );
//				if (!plot) {
//					var month_counter = Math.floor((viewmax - viewmin) /  15*24*60*60*1000);
//					var month_last_date = viewmax;
//				} else {
//					var month_counter = Math.floor((plot.getAxes().xaxis.max - plot.getAxes().xaxis.min) /  15*24*60*60*1000);
//					var month_last_date = new Date(plot.getAxes().xaxis.max);
//				}

				var month_count = (last_tick_date.getFullYear() - first_tick_date.getFullYear()) * 12 - first_tick_date.getMonth() + 1 + last_tick_date.getMonth()
				for( var i = 0; i < month_count; i++ ){
					var month_date_end = new Date( first_tick_date.getFullYear(), first_tick_date.getMonth() + i + 1, 0 ),
						month_date_middle = new Date( month_date_end.getFullYear(), month_date_end.getMonth(), parseInt( month_date_end.getDate() ));
					ticks.push( [ month_date_middle.getTime(), months_names.nominative[ month_date_middle.getMonth() ] + " " + month_date_middle.getFullYear() ] );
				}

				return ticks;
			}
		},
		"series":	{
			"bars"		:	{
				"show"			:	true,
				"lineWidth"		:	0,
				"fill"			:	true,
				"fillColor"		:	"#f60",
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
		}]

	};
	var plot = $.plot(placeholder, data, options);
		plot.setCrosshair({"x" : 1353321542000 });
		plot.lockCrosshair();

	var plot2 = $.plot(placeholder2, data2, options2);
		plot2.setCrosshair({"x" : 1353321542000 });
		plot2.lockCrosshair();

	// add labels

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

		plot.setCrosshair({"x" : 1353321542000 });
		plot2.setCrosshair({"x" : 1353321542000 });

	});


	placeholder.bind('plotzoom', function (event, plot) {

		viewmin = new Date(Math.floor(plot.getAxes().xaxis.min));
		viewmax = new Date(Math.floor(plot.getAxes().xaxis.max));


		if (!zoom_lock) $( "#slider" ).dragslider( "option", "values", [viewmin.getTime() , viewmax.getTime() ] );

		plot.setCrosshair({"x" : 1353321542000 });
		plot2.setCrosshair({"x" : 1353321542000 });

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


