(function($){
    
	months_names    =   {
		"nominative"    :   [ "январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь" ],
		"genitive"      :   [ "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря" ]
	};
	
	var DefaultTemplates = {
            "month"     :   "<div id=\"month-item-${date.getTime()}\" class=\"timeline_month\" data-timestamp=\"${date.getTime()}\">\n\
                                {{each( index, value ) content}}\n\
                                    {{tmpl( value ) content_template}}\n\
                                {{/each}}\n\
                            </div>",
            "day"       :   "<div id=\"day-item-${date.getTime()}\" class=\"timeline_day\" data-timestamp=\"${date.getTime()}\">\n\
                                <div class=\"day_header\">\n\
                                    <span class=\"day_header_date\">\n\
                                        ${date.getDate()} ${months_names.genitive[ date.getMonth() ]} ${date.getFullYear()}\n\
                                    </span>\n\
                                    <span class=\"day_header_breadcrumbs\">\n\
                                        <span />\n\
                                    </span>\n\
                                </div>\n\
                                {{each( index, value ) content}}\n\
                                    {{tmpl( value ) content_template}}\n\
                                {{/each}}\n\
                            </div>",
            "article"   :   "<article data-timestamp=\"${date.getTime()}\">\n\
                                <div class=\"announce\">\n\
                                    <div class=\"article-actions\">\n\
                                        <a class=\"comments_link\" href=\"${url}#comments\" target=\"_blank\">\n\
                                            <span class=\"ico comments_ico\" />\n\
                                            <span class=\"count\">${comments}</span>\n\
                                        </a>\n\
                                        <span class=\"views_count\">\n\
                                            <span class=\"ico views_ico\" />\n\
                                            <span class=\"count\">${views}</span>\n\
                                        </span>\n\
                                        <a data-type=\"favorite\" data-status=\"${subscription.status}\" data-article_id=\"${id}\" class=\"watch-later ${subscription.status} read_later_link\" href=\"#read_later\">\n\
                                            <span class=\"ico read_later_ico\" />\n\
                                            <span class=\"unsubscribed text\" style=\"display: {{if subscription.status == 'unsubscribed'}}inline{{else}}none{{/if}};\">Прочитать позже</span>\n\
                                            <span class=\"subscribed text\" style=\"display: {{if subscription.status == 'subscribed'}}inline{{else}}none{{/if}};\">Добавлено</span>\n\
                                        </a>\n\
                                    </div>\n\
                                    <div class=\"article\">\n\
                                        <a href=\"${url}\" target=\"_blank\">\n\
                                            <span class=\"time\">\n\
                                                ${ ( (date.getHours()<10) ? '0'+date.getHours() : date.getHours() )}:${ ( (date.getMinutes()<10) ? '0'+date.getMinutes() : date.getMinutes() )}\n\
                                            </span>\n\
                                            {{if medias.announce_image.s120x83 }}\n\
                                                <span class=\"announce-image\">\n\
                                                    <img width=\"120\" height=\"83\" title=\"${medias.announce_image.s120x83.title}\" alt=\"${medias.announce_image.s120x83.alt}\" src=\"${medias.announce_image.s120x83.src}\" />\n\
                                                </span>\n\
                                            {{/if}}\n\
                                            <span class=\"title\">${title}</span>\n\
                                        </a>\n\
                                        {{if ( medias.images.length > 0 )}}\n\
                                            <div class=\"article_photo_gallery\">\n\
                                                <a href=\"${ url }\" target=\"_blank\">\n\
                                                    {{each medias.images}}\n\
                                                        <span class=\"image\">\n\
                                                            <img width=\"80\" height=\"60\" title=\"${s80x60.title}\" alt=\"${s80x60.alt}\" src=\"${s80x60.src}\" />\n\
                                                        </span>\n\
                                                    {{/each}}\n\
                                                </a>\n\
                                            </div>\n\
                                        {{/if}}\n\
                                        {{if ( medias.video.length > 0 )}}\n\
                                            <div class=\"article_videos_list\">\n\
                                                {{each medias.video}}\n\
                                                    <div id=\"${video_id}\" class=\"video_item\">\n\
                                                        <span class=\"play_ico\" />\n\
                                                        <span class=\"image\">\n\
                                                            <img width=\"320\" height=\"180\" title=\"${video_preview.title}\" alt=\"${video_preview.alt}\" src=\"${video_preview.src}\" />\n\
                                                        </span>\n\
                                                    </div>\n\
                                                {{/each}}\n\
                                            </div>\n\
                                        {{/if}}\n\
                                        <span class=\"announce\">${announce}</span>\n\
                                    </div>\n\
                                </div>\n\
                            </article>",
            "video"     :   ""
        },
		SCALE_CHANGE_BAR_STATELIST = [ "MONTH", "WEEK", "DAY" ];
		
	var TimelineNavigator = function(options){
		this.init( options )
	};
	//todo = rr
	TimelineNavigator.prototype = {
		"constructor"	:	TimelineNavigator,
		"init"			:	function( options ){
			var defaults = {
				"target"	:	undefined
			};
			this.settings = $.extend( {}, defaults, options );

			this.target = this.settings.target;
			this.loader = $("#timeline_navigator_loader", this.target);

			var namespace = this,
				start_date,
				end_date;

			this.data = {
				"statistic"			:	[],
				"statistic_temp"	:	[],
				"list"				:	this.settings.list,
				"queries"			:	{},
				"date_range"		:	{}
			};
			
			var statistic = (function(){
				var data = namespace.settings.data
				for( var i = 0; i < data.length; i++ ){
					data[i].date = new Date( data[i].date );
					if( typeof( data[i].is_first ) != 'undefined' )
						namespace.full_load = true;
				}
				data.sort(function(a,b){ return b.date.getTime() - a.date.getTime(); });
				return data
			})()
			// тут считаем начало и конец реального периода
			start_date = ( statistic.length > 0 ) ? statistic[statistic.length - 1].date : new Date();
			start_date = new Date( start_date.getFullYear(), start_date.getMonth(), start_date.getDate() - 15);

			end_date = ( statistic.length > 0 ) ? statistic[0].date : new Date();
			end_date = new Date( end_date.getFullYear(), end_date.getMonth(), end_date.getDate() + 15);

			this.data.date_range.from = start_date;
			this.data.date_range.to = end_date;



			this.crosshair_position = this.data.date_range.from.getTime();
			//scale bar init
			var scale_change_bar = $(".scale-change-bar", this.target),
				scale_change_bar_state = scale_change_bar.state({ "state_list" : SCALE_CHANGE_BAR_STATELIST });
			
			$("a", scale_change_bar).bind("click", function(e){
				e.preventDefault();
				scale_change_bar_state.set( $(this).data("scale-size") );

			});
			this.scale_change = {
				"bar"	:	scale_change_bar,
				"state"	:	scale_change_bar_state
			};

			scale_change_bar.bind("state-change", function(e, state){   // байнд на смену стейтов
//				var date_range = {
//					"from" 	: 	new Date( namespace.crosshair_position )
//					,"to" 	:	new Date( namespace.crosshair_position )
//				};
				var date_range = {
					"from" 	: 	namespace.data.date_range.from
					,"to" 	:	namespace.data.date_range.to
				};
//				switch( state.name ){
//					case "MONTH"    :
//					default         :
//							date_range.to = new Date( date_range.to.setDate( date_range.to.getDate() + 31 ) );
//						break;
//					case "WEEK"     :
//							date_range.to = new Date( date_range.to.setDate( date_range.to.getDate() + 7 ) );
//						break;
//					case "DAY"      :
//							date_range.to = new Date( date_range.to.setDate( date_range.to.getDate() + 1 ) );
//						break;
//				}
				namespace.assemblyTempData.apply( namespace, [ namespace.data.date_range ] );
				namespace.plotInit(date_range, scale_change_bar_state.settings.state.settings.state);
				namespace.graph.setCrosshair({"x" : namespace.crosshair_position});
			})

			// graph init
			this.assembly.apply( this, [ statistic ] );
			this.assemblyTempData.apply( this, [ this.data.date_range ] );
			
			namespace.plot_crosshair_image = new Image();
			namespace.plot_crosshair_image.src = "http://ria.ru/i/icons/timeline/crosshair.png";

			var plot_date_range = {
				"from"	:	new Date( this.data.date_range.from.getFullYear(), this.data.date_range.from.getMonth(), this.data.date_range.from.getDate() ),
				"to"	:	new Date( this.data.date_range.to.getFullYear(), this.data.date_range.to.getMonth(), this.data.date_range.to.getDate() )
			};
			myScroll = new iScroll('wrapper', { scrollbarClass: 'myScrollbar', hScroll: true, vScroll: false});

			this.plotInit( plot_date_range, scale_change_bar_state.settings.state.settings.state); // todo porno name
			this.graph.setCrosshair({"x" : end_date.getTime()});
		},  // INIT
		"load"			:	function( date_range ){
			console.log('load' + date_range.from + ' - ' + date_range.to);

			var date_string = {
					"from"		:   date_range.from.getFullYear() + ( ( date_range.from.getMonth() < 9 ) ? '0' : '' ) + ( date_range.from.getMonth() + 1) + ( ( date_range.from.getDate() < 10 ) ? '0' : '' ) + date_range.from.getDate(),
					"to"		:	date_range.to.getFullYear() + ( ( date_range.to.getMonth() < 9 ) ? '0' : '' ) + ( date_range.to.getMonth() + 1) + ( ( date_range.to.getDate() < 10 ) ? '0' : '' ) + date_range.to.getDate()
				},
				query_id            =   date_string.from,
				namespace           =   this;
			
			if( typeof( this.data.queries[ query_id ] ) == 'undefined' && ( typeof( this.full_load ) == 'undefined' || !namespace.full_load ) ){
				this.loader.show();
				this.data.queries[ query_id ] = $.ajax({
					"url"       :   "/services/timeline/gettimeline",
					"type"      :   "POST",
					"dataType"  :   "json",
					"data"      :   {
						"list_sid"  :   this.data.list, 
						"date_from" :   date_string.from,
						"date_to"   :   date_string.to,
						"group_type":   "hour"
					},
					"success"   :   function( response ){
						
						for( var i = 0; i < response.data.length; i++ ){
							response.data[i].date = new Date( response.data[i].date );
							if( typeof( response.data[i].is_first ) != 'undefined' )
								namespace.full_load = true;
						}
							
						
						namespace.data.date_range.from = date_range.from;
						
						var plot_to_date = date_range.from;
						switch( namespace.scale_change.state.get().name ){
							case "MONTH"    :
							default         :
									plot_to_date = new Date( plot_to_date.getFullYear(), plot_to_date.getMonth() + 1, 1 );
								break;
							case "WEEK"		:
									plot_to_date = new Date( plot_to_date.getFullYear(), plot_to_date.getMonth(), plot_to_date.getDate() + 7 );
								break;
							case "DAY"		:
									plot_to_date = new Date( plot_to_date.getFullYear(), plot_to_date.getMonth(), plot_to_date.getDate() + 1 );
								break;
						}
						var plot_date_range = {
							"from"	:	date_range.from,
							"to"	:	plot_to_date
						}
						namespace.assembly( response.data );
						namespace.assemblyTempData( namespace.data.date_range );
						
						
						namespace.plotInit(plot_date_range);
						namespace.graph.pan(namespace.graph.p2c({"x" : namespace.crosshair_position }))
						namespace.graph.setCrosshair({ "x" : namespace.crosshair_position });
						namespace.loader.hide()
						
						namespace.target.trigger("statistic.loaded");
						
					}
				});
			}

		}, //
		
		"plotInit"	:	function( date_range, plot_state ){

			__('plotInit' + date_range.from + ' - ' + date_range.to);
			var namespace = this,
				min_value = date_range.from.getTime(),
				max_value = date_range.to.getTime();

			var fix_timestamp = ({
				"MONTH" : 31 * 24 * 60 * 60 * 1000, //12*60*60*1000
				"WEEK" : 7 * 24 * 60 * 60 * 1000,
				"DAY" : 3 * 24 * 60 * 60 * 1000 //30*60*1000
			})[ plot_state ];

			$("#timeline_navigator").css({
				width: 1000 * (max_value - min_value)  / fix_timestamp // скотлько раз в тысяче ширины поместяться данные этого масштаба от-до
			})
			this.graph = $.plot(
				$("#timeline_navigator", this.target), 
				[ { "data" : this.data.statistic_temp }, { "data" : this.data.statistic_temp, "xaxis" : 2 } ], 
				{
					"crosshair" :   { "mode" : "x", "locked" : true, "image" : this.plot_crosshair_image },
					"grid"		:	{
						"clickable"     :   true,
						"hoverable"     :   true,
						"autoHighlight" :   false,
						"show"			:	true,
						"borderWidth"	:	0,
						"lineWidth"		:	0,
						"markings"		:	function areas(axes) {

							var markings            =   [],
								markings_counter    =   5000;  // todo считать сколько будет отсечек

							do {
								if( axes.xaxis.ticks[ markings_counter  ] ){

									var fix_timestamp = ({
											"MONTH" : 43200000, //12*60*60*1000
											"WEEK" : 43200000,
											"DAY" : 1800000 //30*60*1000
										})[ namespace.scale_change.state.get().name ]

									markings.push({
										"x1axis"		: {
											"from"	: axes.xaxis.ticks[ markings_counter  ].v + fix_timestamp,
											"to"	: axes.xaxis.ticks[ markings_counter - axes.xaxis.n ].v + fix_timestamp
										},
										"color"		: ( markings_counter % 2 ) ? "#ffffff" : "#f7f7f7"
									});
								}

								markings_counter -= axes.xaxis.n;
							} while ( markings_counter > 0 );

							return markings;
						}
					},
					"series":	{
						/*"lines"		:	{
							"lineWidth"		:	0,
							"fill"			:	true,
							"fillColor"		:	"#b7c1c4"
						},*/
						"bars"		:	{
							"show"			:	true,
							"lineWidth"		:	0,
							"fill"			:	true,
							"fillColor"		:	"#b7c1c4",
							"barWidth"		:	({ "MONTH" : 24*60*60*1000, "WEEK" : 24*60*60*1000, "DAY" : 60*60*1000 })[ namespace.scale_change.state.get().name ]
						},
						"shadowSize"	:	0
					},
					"yaxes"	:	[{
						"show"      :   false, 
						"min"       :   null, 
						"max"       :   null
					}],
					"xaxes"	:	[
						{
							"min"           :   min_value,
							"max"           :   max_value,
							"tickLength"    :   0,
							"position"      :   "bottom",
							"ticks"         :   function( date_range ){

								var ticks       =   [],
									last_date   =   new Date( date_range.max ),
									tick_counter=   1000;

								switch( namespace.scale_change.state.get().name ) {
									case 'DAY':
										for( var i = 0; i < tick_counter; i++ ){
											var tick_date = new Date( last_date.getFullYear(), last_date.getMonth(), last_date.getDate(),  last_date.getHours() - i - 1 );
											ticks.push( [ tick_date.getTime() + 30*60*1000 , "" + (( tick_date.getHours() < 10 ) ? "0" : "" ) + tick_date.getHours() ] );
										}
										break;
									default     :
										for( var i = 0; i <= tick_counter; i++ ){
											var tick_date = new Date( last_date.getFullYear(), last_date.getMonth(), last_date.getDate() - i );
											ticks.push( [ tick_date.getTime() + 43200000, tick_date.getDate() ] ); // 12*60*60*1000 = 43200000 for correcting position (left border)
										}
										break;
								}
								return ticks;
							}
						},
						{
							"min"           :   min_value,
							"max"           :   max_value,
							"tickSize"      :   4,
							"ticks"         :   function( date_range ){

								var ticks = [],
									first_tick_date = new Date( date_range.min ),
									last_tick_date = new Date( date_range.max );

								switch( namespace.scale_change.state.get().name ) {
									case 'MONTH':
									default     :
										var month_count = (last_tick_date.getFullYear() - first_tick_date.getFullYear()) * 12 - first_tick_date.getMonth() + 1 + last_tick_date.getMonth()
										for( var i = 0; i < month_count; i++ ){
											var month_date_end = new Date( first_tick_date.getFullYear(), first_tick_date.getMonth() + i + 1, 0 ),
												month_date_middle = new Date( month_date_end.getFullYear(), month_date_end.getMonth(), parseInt( month_date_end.getDate()/2 ));
											ticks.push( [ month_date_middle.getTime(), months_names.nominative[ month_date_middle.getMonth() ] + " " + month_date_middle.getFullYear() ] );
										}
									case 'WEEK' :
										var month_count = last_tick_date.getUTCMonth() - first_tick_date.getUTCMonth() + 1;
											for( var i = 0; i < month_count; i++ ){
												var month_date_end = new Date( first_tick_date.getFullYear(), first_tick_date.getMonth() + i + 1, 0 ),
													month_date_middle = new Date( month_date_end.getFullYear(), month_date_end.getMonth(), parseInt( month_date_end.getDate()/2 ));
												ticks.push( [ month_date_middle.getTime(), months_names.nominative[ month_date_middle.getMonth() ] + " " + month_date_middle.getFullYear() ] );
											}
										break;
									case 'DAY'  :
										var day_date = new Date( namespace.crosshair_position ),
											day_date_middle = new Date( day_date.getFullYear(), day_date.getMonth(), day_date.getDate(), 12 );
										ticks.push( [ day_date_middle.getTime(), day_date_middle.getDate() + " " + months_names.genitive[ day_date_middle.getMonth() ] + " " + day_date_middle.getFullYear() ] );
										break;
								}
								return ticks;
							},
							"position"      :   "top",
							"labelHeight"   :   0,
							"tickColor"     :   "#ffffff"
						}
					]
				}
			);
//			this.graph.lockCrosshair();
			myScroll.refresh()
		},
		
		"assembly"  :   function( data ){
			var end_date = this.data.date_range.to;

			end_date = new Date( end_date.getFullYear(), end_date.getMonth(), end_date.getDate() );
			for( var i = 0; i < data.length; i++ ){
				var hour = parseInt( ( end_date.getTime() - data[i].date.getTime() )  / 3600000 ); // 3600000 = 60*60*1000
				this.data.statistic[ hour ] = [ data[i].date.getTime(), data[i].count ];
			}
		},
		
		"get"	:	{
			"hour"	:	{
				"next"	:	function( from_date ){
					var star_search_from_hour = parseInt( ( this.data.date_range.to.getTime() - from_date.getTime() ) / 3600000 ), // 1 
						next_day_date = undefined;

					while( !(next_day_date instanceof Date) && star_search_from_hour >= 0 ){
						star_search_from_hour-=1;
						if( typeof( this.data.statistic[star_search_from_hour ] ) != 'undefined' )
							next_day_date = new Date( this.data.statistic[ star_search_from_hour ][0] );
					}
					return next_day_date;
				},
				"prev"	:	function( from_date ){
					var star_search_from_hour = parseInt( ( this.data.date_range.to.getTime() - from_date.getTime() ) / 3600000 ), // 1 
						next_day_date = undefined;

					while( !(next_day_date instanceof Date) && this.data.statistic.length > star_search_from_hour ){
						star_search_from_hour+=1;
						if( typeof( this.data.statistic[star_search_from_hour ] ) != 'undefined' )
							next_day_date = new Date( this.data.statistic[ star_search_from_hour ][0] );
					}
					return next_day_date;
				}
			}
		},

		"assemblyTempData"  :   function( date_range ){
			console.log('assably' + date_range.from + ' - ' + date_range.to);
			var data = [];
			
			switch( this.scale_change.state.get().name ){
				case "MONTH"    :
				case "WEEK"     :
				default         :
						var diff_days = Math.floor( ( date_range.to.getTime() - date_range.from.getTime() )/86400000 ); // 86400000 = 24*60*60*1000;
						data.push( [ new Date( date_range.to.getFullYear(), date_range.to.getMonth(), date_range.to.getDate() ), 0 ] )
						for( var i = 0; i < diff_days + 1; i++ ){
							var items_count = 0;
							for( var k = 0; k < 24; k++ ){
								var hour = i*24 + k;
								if( typeof( this.data.statistic[ hour ] ) != 'undefined' ){
									items_count += this.data.statistic[ hour ][1];
								}
							}
							data.push( [ new Date( date_range.to.getFullYear(), date_range.to.getMonth(), date_range.to.getDate() - i - 1 ), items_count ] )
						}

					break;
				case "DAY"      :
						var diff_hours = Math.floor( ( date_range.to.getTime() - date_range.from.getTime() )/3600000 ); // 3600000 = 60*60*1000;

						for( var i = 0; i < diff_hours; i++ ){
							var items_count = ( typeof( this.data.statistic[ i ] ) != 'undefined' ) ? this.data.statistic[ i ][1] : 0;
							data.push( 
								[ 
									new Date( date_range.to.getFullYear(), date_range.to.getMonth(), date_range.to.getDate(), date_range.to.getHours() - i  ).getTime(), 
									items_count
								]
							)
						}

					break;
			}
			data.sort(function(a,b){ return a[0] - b[0] });

			this.data.statistic_temp = data;
		}
		
	};
	


	var ArticleListTimeline = function(options){
		this.init( options );
	};
	
	ArticleListTimeline.prototype = {
		"constructor"	:	ArticleListTimeline,
		"init"			:	function( options ){
			var defaults = {
				"target"	:	undefined,
				"templates" :   DefaultTemplates
			};
			this.settings = $.extend( {}, defaults, options );
			
			this.queries = [];
			
			this.list = this.settings.list
			this.target = this.settings.target;
			this.element = $(".timeline", this.target);
			this.templates = this.settings.templates;
			this.articles = this.settings.articles;
			this.articles = this.data.grouping.apply(this, [ this.articles ] );
			this.articles.dates.sort(function(a,b){ return a - b });
			this.loader = $("#story_timeline_loader", this.target)
			
			this.video_container = $("<div class=\"timeline_video_data\" />").appendTo(this.element);
			for( var key in  this.articles.content)
				if( this.articles.content.hasOwnProperty( key ) )
					this.item.month.generate.apply(  this,  [ this.articles.content[ key ], this.element ]  );
			
			this.articles.dates.sort(function(a,b){ return b - a });
			
			this.active = {};
			this.active.month = $(".timeline_month:first").addClass("active_month");
            this.active.day = $(".timeline_day:first", this.active.month).addClass("active_day");
            this.active.item = $("article:first", this.active.day).addClass("active_article");

		},
		
		"data"			:	{
			"grouping"  :   function( data ){

                data.sort( function( a,b ){ return b.date.getTime() - a.date.getTime(); } )

				var content_data = { "dates" : [], "content" : {} };
                    
                for( var i = 0; i < data.length; i++ ){
					
					
					
                    var article_date    =   data[i].date,
                        day_date        =   new Date( article_date.getFullYear(), article_date.getMonth(), article_date.getDate() ),
                        month_date      =   new Date( article_date.getFullYear(), article_date.getMonth() );
                    
					
                    data[i].content_template = this.settings.templates.article;
                    data[i].type = "article";
                    
                    if( typeof( content_data.content[ month_date.getTime() ] ) == 'undefined' ){
                        content_data.content[ month_date.getTime() ] = {
                            "date"              :   month_date,
                            "content"           :   {},
                            "type"              :   "month",
                            "content_template"  :   this.settings.templates.month,
							"dates"				:	[]
                        }
                        content_data.dates.push( month_date.getTime()  )
                    }
                     
					if( typeof( content_data.content[ month_date.getTime() ].content[ day_date.getTime() ] ) == 'undefined' ){
						content_data.content[ month_date.getTime() ].dates.push( day_date.getTime() );
                        content_data.content[ month_date.getTime() ].content[ day_date.getTime() ] = {
                            "type"      :   "day",
                            "date"      :   day_date,
                            "content"   :   [],
                            "content_template"  :   this.settings.templates.day
                        };
					}
						
                    content_data.content[ month_date.getTime() ].content[ day_date.getTime() ].content.push( data[i] );
                }
                
                return content_data;
            },
            "merge" :   function( content1, content2, parent ){
                
                var namespace = this;
                for( var key in content2 ){
                    if( content1.hasOwnProperty( key ) ){
                        if( content1[ key ] instanceof Array && content2[ key ] instanceof Array ){
                            var array_content1 = content1[ key ],
                                array_content2 = content2[ key ];
                            for( var i = 0; i < array_content2.length; i++ )
                                for( var j = 0; j < array_content1.length; j++ )
                                    if( array_content2[i] == array_content1[j] )
                                        array_content2.splice(i,1)
                            content1[key] = array_content1.concat( array_content2 );
                        }else if( content1[ key ].constructor === Object )
                            content1[key] = namespace.data.merge.apply( namespace, [ content1[ key ], content2[ key ], content1 ] );
                    }
                    else{
                        var item = content2[ key ];
                        content1[ key ] = item;
                        if( item.type ){
                            switch( item.type ){
                                case "month"    :
										namespace.item[ item.type ].generate.apply( namespace, [ item, namespace.element ] );
                                    break;
                                default         : 
										namespace.item[ item.type ].generate.apply( namespace, [ item, $("#" + parent.type + "-item-" + parent.date.getTime(), namespace.element ) ] );
                                    break;
                            }
                        }
                    }
                }
                
                return content1;
            }
		},
		
		
		"item"		:	{
			"get"		:	{
				"next"	:	function( timestamp ){
					var date = new Date(timestamp),
						data = {}, temp_data = {}, data_item = [], i;
						
					date.month = new Date( date.getFullYear(), date.getMonth() );
					date.day = new Date( date.getFullYear(), date.getMonth(), date.getDate() );
					
					temp_data.month = (function(dates){
						for( i = dates.length - 1; i >= 0; i-- ){
							if( dates[i] >= date.month.getTime())
								return i;
						}
					})(this.articles.dates);
					data.month = this.articles.content[ this.articles.dates[ temp_data.month ] ];
					
					temp_data.day = (function(){
						for( i = data.month.dates.length; i > 0; i-- ){
							if( data.month.dates[i-1] > date.getTime() )
								return i;
					};})();
					data.day = data.month.content[ data.month.dates[ temp_data.day ] ];
					
					temp_data.item = (function(){
						if( data.day )
							for( i = data.day.content.length-1; i >= 0; i-- ){
								if( data.day.content[i].date.getTime() > date.getTime() )
									return i;
							};
					})();
					if( typeof( temp_data.item ) == 'undefined' ){
						temp_data.day -= 1
						data.day = data.month.content[ data.month.dates[ temp_data.day ] ];
						if( data.day )
							temp_data.item = data.day.content.length - 1;
						else if( typeof( data.day ) == 'undefined' ){
							temp_data.month -= 1;
							data.month = this.articles.content[ this.articles.dates[ temp_data.month ] ];
							temp_data.day = data.month.dates.length - 1;
							data.day = data.month.content[ data.month.dates[ temp_data.day ] ];
							temp_data.item = data.day.content.length - 1;
						}
					}
					data.item = data.day.content[ temp_data.item ];
					
					return data;
				},
				"prev"	:	function( timestamp ){
					var date = new Date(timestamp),
						data = {}, temp_data = {}, data_item = [], i;
						
					date.month = new Date( date.getFullYear(), date.getMonth() );
					date.day = new Date( date.getFullYear(), date.getMonth(), date.getDate() );
					
					temp_data.month = (function(dates){
						for( i = 0; i < dates.length; i++ ){
							if( dates[i] < date.getTime())
								return i;
					};})(this.articles.dates);
					data.month = this.articles.content[ this.articles.dates[ temp_data.month ] ];
					
					temp_data.day = (function(){
						for( i = 0; i < data.month.dates.length; i++ ){
							if( data.month.dates[i] < date.getTime() )
								return i;
					};})();
					data.day = data.month.content[ data.month.dates[ temp_data.day ] ];
					
					temp_data.item = (function(){
						for( i = 0; i < data.day.content.length; i++ ){
							if( data.day.content[i].date.getTime() < date.getTime() )
								return i;
						};
					})();
					
					if( typeof( temp_data.item ) == 'undefined' ){
						temp_data.day += 1
						temp_data.item = 0;
						data.day = data.month.content[ data.month.dates[ temp_data.day ] ];
						if( typeof( data.day ) == 'undefined' ){
							temp_data.month += 1;
							temp_data.day = 0;
							data.month = this.articles.content[ this.articles.dates[ temp_data.month ] ];
							data.day = data.month.content[ data.month.dates[ temp_data.day ] ];
						}
					}
					
					data.item = data.day.content[ temp_data.item ];
					
					return data;
				}
			},
			
			"addEvents"    :   function( data ){
				var namespace = this;
				$(".video_item", data).bind("click", function(e){
					e.preventDefault();
					var item = $(this),
						video = $("#video_content_" + item.attr("id").replace("item_video_" , ''), namespace.video_container);
					
					item.empty().append( video ).unbind("click");
				})
			},
			"month"     :   {
                "generate"  :   function( data, container ){
                    var month = $.tmpl( this.settings.templates.month, data );
					this.item.addEvents.apply( this, [month] );
                    if( month.length > 0 )
                        month.appendTo( container );
                }
            },
            "day"       :   {
                "generate"  :   function ( data, container ){
                    var day = $.tmpl( this.settings.templates.day, data );
                    this.item.addEvents.apply( this, [day] );
                    day.appendTo( container );
                }
            },
			"article"		:	{
				"generate"		:	function( data, container ){
					var articles = $.tmpl( this.settings.templates.article, data);
					this.item.addEvents.apply( this, [articles] );
					articles.appendTo( container );
				},
				"setActive"	:	function(article, scrollToActive){
					scrollToActive = scrollToActive || false;
					this.active.item.removeClass("active_article");
					this.active.item = article.addClass("active_article");
					if( scrollToActive )
						scrollTo( 0, article.position().top + $(".story_main_container", this).outerHeight() + 50 );
				}
			}
		},
		
		
		"load"		:	function( date_range ){
			console.log('plotInit' + date_range.from + ' - ' + date_range.to);

			var namespace = this;
			
			var date_string = "" + date_range.to.getFullYear()
								+ (( date_range.to.getMonth() < 9 ) ? "0" + (date_range.to.getMonth() + 1) : (date_range.to.getMonth() + 1) ) 
								+ (( date_range.to.getDate() < 10 ) ? "0" + date_range.to.getDate() : date_range.to.getDate() );

			if( typeof( this.queries[ date_string ] ) == 'undefined' && typeof( date_range.to ) != 'undefined' ){
				
				namespace.loader.show();
				
				var request_params = {
					"list_sid"	:	this.list,
					"date"		:	date_range.to
				};
				
				request_params.date = "" + request_params.date.getFullYear() 
										+ (( request_params.date.getMonth() < 9 ) ? "0" + (request_params.date.getMonth() + 1) : request_params.date.getMonth() + 1 ) 
										+ (( request_params.date.getDate() < 10 ) ? "0" + request_params.date.getDate() : request_params.date.getDate() ) 
				
				if( !date_range.from )
					date_range.from = date_range.to;
				else{
					var date_range_days = parseInt( ( date_range.from.getTime() - date_range.to.getTime() ) / 24 * 60 * 60 * 1000 )
					//console.log( date_range_days, "fix it - push to this.queries boolean object" );
				}
					
				
				request_params.start_date = date_range.from;
				
				if( request_params.start_date.getTime() > date_range.to.getTime())
					request_params.start_date = date_range.to;
					
				request_params.start_date = "" + request_params.start_date.getFullYear() 
									+ (( request_params.start_date.getMonth() < 9 ) ? "0" + (request_params.start_date.getMonth() + 1) : request_params.start_date.getMonth() + 1 ) 
									+ (( request_params.start_date.getDate() < 10 ) ? "0" + request_params.start_date.getDate() : request_params.start_date.getDate() ) 
				
				this.queries[ date_string ] = $.ajax({
					"url"       :   "/services/timeline/getlist",
					"type"      :   "POST",
					"dataType"  :   "html",
					"data"      :   request_params,
					"success"   :   function( response ){
						
						var response = $.parseXML( response ),
							json_data = $.parseJSON( $("json", $(response)).text() ),
							videos = $("xml_data videos", response);
						
						if( json_data.articles && json_data.articles.length > 0 ){
							var reg = new RegExp("new Date\\(\"[0-9]{4}\/[0-9]{2}\/[0-9]{2} [0-9]{2}:[0-9]{2}\"\\)", "i")

							for( var i = 0; i < json_data.articles.length; i++ )
								if( typeof( json_data.articles[i].date ) == "string" && reg.exec( json_data.articles[i].date )  )
									json_data.articles[i].date = eval( json_data.articles[i].date );

							json_data.articles.sort( function( a,b ){ return b.date.getTime() - a.date.getTime(); } );
							namespace.video_container.append( $("<div />").html( videos.text() ).children() );
							var grouped_data = namespace.data.grouping.apply( namespace, [ json_data.articles  ] )
							namespace.articles = namespace.data.merge.apply( namespace, [ namespace.articles, grouped_data ] );
							
							namespace.element.trigger("items.loaded");
							namespace.loader.hide();
						}
					}
				});
			}
		}
		
	}
	
	var StoryTimeline = function( options ){
		this.init( options );
	};
	
	StoryTimeline.prototype = {
		"constructor"	:	StoryTimeline,
		"init"			:	function( options ){
			var defaults = {
				"target"	:	undefined
			},
			namespace = this;
			
			this.settings = $.extend( {}, defaults, options );
			
			this.target = this.settings.target;
			
			this.navigator = 
					new TimelineNavigator({ 
						"target"	:	$(".timeline_navigator_container", this.target),
						"list"		:	this.settings.list,
						"data"		:	this.settings.data.statistic
					});
					
			this.article_list = 
					new ArticleListTimeline({
						"target"	:	$(".story_timeline", this.target),
						"articles"	:	this.settings.data.articles,
						"list"		:	this.settings.list
					});
					
//			this.navigator.crosshair_position = this.article_list.active.item.data("timestamp");
			this.story = {
				"timeline"	:	$(".story_timeline", this.target),
				"container"	:	$(".story_main_container", this.target),
				"dummy"		:	$(".timeline_article_cursor", this.target)
			}
				
			
			var graph = this.navigator.graph,
				graph_container = graph.getPlaceholder();
			
			function scrollToSelectedRange(){
				__("scrollToSelectedRange");

				var coord = graph.getCrosshairPosition(),
					offset = graph.c2p( coord );

				var active_article = namespace.get.nextArticleByTimestamp.apply(namespace, [ parseInt( offset.x ) ])
				if(active_article.length != 0){
					scrollTo(0,active_article.offset().top - 200)
					myScroll.scrollTo(-150, 0, 200);
				}else{
					var load_date_range ={
						"from"	:	undefined,
						"to"	:	undefined
					};

					var last_loaded = { "month" : namespace.article_list.articles.content[ namespace.article_list.articles.dates[namespace.article_list.articles.dates.length - 1] ] }
						last_loaded.day = last_loaded.month.content[ last_loaded.month.dates[last_loaded.month.dates.length - 1] ];

					var prev_day_date = namespace.navigator.get.hour.prev.apply( namespace.navigator, [ last_loaded.day.date ] );
					if( typeof( prev_day_date ) != 'undefined' )
						load_date_range.to = new Date( prev_day_date.getFullYear(), prev_day_date.getMonth(), prev_day_date.getDate() )

					var selected_date = new Date( parseInt( offset.x ) );
					load_date_range.from = new Date( selected_date.getFullYear(), selected_date.getMonth(), selected_date.getDate() );

//					namespace.article_list.load(load_date_range);
//					namespace.article_list.element.bind("items.loaded", function(){
//						scrollToSelectedRange();
//					})
				}


			}
			
			
			graph_container.bind("plotclick.graph_navigation", function(e, data, point){
				if (!click_lock) {
					namespace.navigator.graph.lockCrosshair();
					namespace.navigator.crosshair_position = parseInt( data.x )
					graph.setCrosshair({"x" : namespace.navigator.crosshair_position });
 					scrollToSelectedRange()
				}
			})
			
			graph_container.bind("mousedown.graph_navigation", function(e){
				e.preventDefault();
 				click_lock = false;
//				namespace.navigator.graph.unlockCrosshair();
//
				graph_container.bind("mousemove.graph_navigation", function(){
//					scrollToSelectedRange()
 					click_lock = true;
 				});
				graph_container.bind("mouseup.graph_navigation", function(){

						graph_container
							.unbind("mousemove.graph_navigation")
							.unbind("mouseup.graph_navigation");
 //					namespace.navigator.graph.lockCrosshair();
				});
				return false;
			});

			
			var scrollTimer = 0;
			$(".timeline_navigator_controls a.prev,.timeline_navigator_controls a.next", this.target).bind("click", function(e){
				e.preventDefault();


				var item = $(this),
					scrolled_items;

				if( item.hasClass("prev") ) {
					scrolled_items = namespace.article_list.item.get.prev.apply( namespace.article_list, [ namespace.navigator.crosshair_position ] )
					myScroll.scrollTo('-50px', 0, 2000, true);
				}
				else if( item.hasClass("next") ) {
					scrolled_items = namespace.article_list.item.get.next.apply( namespace.article_list, [ namespace.navigator.crosshair_position ] )
					myScroll.scrollTo('50px', 0, 2000, true);
				}
				
				if(scrolled_items.item){
					var month = $("#month-item-" + scrolled_items.month.date.getTime(), namespace.article_list.target),
						day = $("#day-item-" + scrolled_items.day.date.getTime(), month),
						article = $("article[data-timestamp=" + scrolled_items.item.date.getTime() + "]", day);
						
					scrollTo(0,article.offset().top - namespace.story.container.outerHeight())
				}
			}).bind("mousedown", function(){
				var item = $(this),
					timoutClick = function(){
						clearTimeout( scrollTimer );
						item.trigger("click");
						scrollTimer = setTimeout(timoutClick, 600);

					};s
				scrollTimer = setTimeout(timoutClick, 600);
			}).bind("mouseup mouseleave", function(){
				clearTimeout( scrollTimer );
			});

//			$(window).bind("scroll", function(e){
////				console.log('scroll');
//				namespace.story.scrollTop = $(window).scrollTop()
//
//				namespace.scrollEvents.update.header.apply( namespace );
//
//                namespace.story.dummy.position_top = namespace.story.scrollTop + namespace.story.dummy.position().top + namespace.story.dummy.outerHeight()/2;
//				namespace.scrollEvents.update.objects.activate.apply(namespace);
//				namespace.scrollEvents.update.statistic.upload.apply(namespace);
//				namespace.scrollEvents.update.objects.upload.apply(namespace);
//				namespace.scrollEvents.update.statistic.redraw.apply(namespace);
//				myScroll.scrollTo(-50, 0, 2000, true);
////				namespace.navigator.graph.setCrosshair({"x" : namespace.article_list.active.item.data("timestamp")});
//			});
		},
		
		"get"	:	{
			"nextArticleByTimestamp"	:	function(timestamp){
				
				var date = new Date(timestamp),
					dates = {
						"month"	:	new Date(date.getFullYear(), date.getMonth(), 1),
						"day"	:	new Date(date.getFullYear(), date.getMonth(), date.getDate())
					},
					active = {
						"month"	:	[],
						"day"	:	[],
						"article"	:	[]
					};
					
				active.month = $("#month-item-" + dates.month.getTime(), this.article_list.target);
				active.day = $("#day-item-" + dates.day.getTime(), active.month);
				
				$("article", active.day).each(function(index, item){
					var item = $(this),
						item_timestamp = item.data("timestamp"),
						prev_item = item.prev("article");
					if( prev_item.length == 0 )
						active.article = item;
					else if( prev_item.data("timestamp") > timestamp && item_timestamp < timestamp )
						active.article = ( timestamp - prev_item.data("timestamp") >= item_timestamp - timestamp ) ? prev_item : item;
				});
				return active.article;
			}
			
		},
		
		"scrollEvents"	:	{
			"update"	:	{
				"header"	:	function(){
					if( this.story.scrollTop > this.target.position().top ){

						if( this.story.timeline.offset().top + this.story.timeline.outerHeight() < this.story.scrollTop + this.story.container.outerHeight() - parseInt( this.story.dummy.css("bottom"))  ){
							this.story.container.css({ "top" : this.story.timeline.outerHeight() + this.story.container.outerHeight() + parseInt( this.story.dummy.css("bottom") ) + "px" });
							this.target
								.removeClass('sticked_top_symmary')
								.addClass('offset_bottom_summary');
						}else{
							this.story.container.css({"top" : "0"})

							this.target
								.removeClass('offset_bottom_summary')
								.addClass('sticked_top_symmary');
						}

						$(".story_main", this.story.container).css({"border" : "none"})

						this.story.timeline.css({ "margin-top" : this.story.container.outerHeight() + 'px' });

					}else{
						this.target.removeClass('sticked_top_symmary offset_bottom_summary')
						this.story.timeline.css({ "margin-top"  :   0 });
					}
				},
				"objects"		:	{
					"activate"		:	function(){

						var namespace = this,
							new_active = {
								"month"	:	[],
								"day"	:	[],
								"item"	:	[]
							}

						$(".timeline_month", this.story.timeline).each(function(index, item){
							var item = $(item),
								item_top_min = item.offset().top,
								item_top_max = item_top_min + item.outerHeight();

							if( new_active.month.length == 0 && ( item_top_min  < namespace.story.dummy.position_top ) && ( item_top_max > namespace.story.dummy.position_top ) )
								new_active.month = item;
						});

						$(".timeline_day", new_active.month).each(function(index, item){
							var item = $(item),
								item_top_min = item.offset().top,
								item_top_max = item_top_min + item.outerHeight();

							if( new_active.day.length == 0 && ( item_top_min  < namespace.story.dummy.position_top ) && ( item_top_max > namespace.story.dummy.position_top ) )
								new_active.day = item;
						});

						$("article", new_active.day).each(function(index, item){
							var item = $(item),
								item_top_min = item.offset().top,
								item_top_max = item_top_min + item.outerHeight();

							if( new_active.item.length == 0 && ( item_top_min  < namespace.story.dummy.position_top ) && ( item_top_max > namespace.story.dummy.position_top ) )
								new_active.item = item;
						});

						if( new_active.item.length != 0 ){
							this.article_list.item.article.setActive.apply(this.article_list, [ new_active.item ] );
							this.article_list.active = new_active;
							this.navigator.crosshair_position = new_active.item.data("timestamp");
						}
					},
					"upload"		:	function(){
						if( this.story.scrollTop > this.story.timeline.position().top + this.story.timeline.outerHeight() - $(window).height() ){
							var load_date_range = {
								"from"	:	undefined,
								"to"	:	undefined
							};
							
							var last_loaded = { "month" : this.article_list.articles.content[ this.article_list.articles.dates[this.article_list.articles.dates.length - 1] ] }
							last_loaded.day = last_loaded.month.content[ last_loaded.month.dates[last_loaded.month.dates.length - 1] ];
							var prev_day_date = this.navigator.get.hour.prev.apply( this.navigator, [ last_loaded.day.date ] );
							if( typeof( prev_day_date ) != 'undefined' ){
								load_date_range.to = new Date( prev_day_date.getFullYear(), prev_day_date.getMonth(), prev_day_date.getDate() )
								
								var prev_day_temp_data = this.navigator.data.statistic_temp[ (load_date_range.to.getTime() - this.navigator.data.date_range.from.getTime() )/ (24*60*60*1000) ];
								
								if(prev_day_temp_data){
									var total_articles_count = parseInt( prev_day_temp_data[1] );
									if( total_articles_count < 10 ){
										load_date_range.from = new Date( load_date_range.to.getFullYear(), load_date_range.to.getMonth(), load_date_range.to.getDate() );
										while( total_articles_count < 10 && prev_day_date && prev_day_temp_data ){
											prev_day_date = new Date( load_date_range.from.getFullYear(), load_date_range.from.getMonth(), load_date_range.from.getDate(), 0, 0, -1 );
											prev_day_date = this.navigator.get.hour.prev.apply( this.navigator, [ prev_day_date ] );
											if(prev_day_date){
												load_date_range.from = new Date( prev_day_date.getFullYear(), prev_day_date.getMonth(), prev_day_date.getDate() );
												prev_day_temp_data = this.navigator.data.statistic_temp[ (load_date_range.from.getTime() - this.navigator.data.date_range.from.getTime() )/ (24*60*60*1000) + 1 ];
												if(prev_day_temp_data)
													total_articles_count+= parseInt( prev_day_temp_data[1] );
											}
										};
									}
								}
								
//								this.article_list.load(load_date_range);
							}
						}
					}
				},
				"statistic"		:	{
					
					"upload"		:	function(){
						
						var last_loaded = { "month" : this.article_list.articles.content[ this.article_list.articles.dates[ this.article_list.articles.dates.length - 1 ] ] },
							prev_day,
							namespace = this;
							
						this.story.last_loaded_day = last_loaded.day = last_loaded.month.content[ last_loaded.month.dates[last_loaded.month.dates.length - 1] ];
						
						prev_day = this.navigator.get.hour.prev.apply( this.navigator, [ last_loaded.day.date ] );
						
						if( this.navigator.data.date_range.from.getTime() > prev_day || typeof(prev_day) == 'undefined' ){
							var load_from_date = new Date( this.navigator.data.date_range.from.getTime() ),
								last_loaded = { "month" : this.article_list.articles.content[ this.article_list.articles.dates[0] ] }
							
							if( load_from_date.getTime() > last_loaded.month.date.getTime() )
								load_from_date = last_loaded.month.date;
							
							load_from_date = new Date( load_from_date.getFullYear(), load_from_date.getMonth() - 1, 1 );
							
							this.navigator.load.apply( this.navigator, [{ "to" : this.navigator.data.date_range.from, "from" : load_from_date }] );
							
//							this.navigator.target.bind("statistic.loaded", function(e){
//								if( typeof( namespace.navigator.full_load ) == 'undefined' || !namespace.navigator.full_load )
//									namespace.scrollEvents.update.objects.upload.apply(namespace);
//
//								namespace.navigator.target.unbind("statistic.loaded");
//							})
							
						}
					},
					
					"redraw"		:	function(){
						var plot_xaxis = this.navigator.graph.getAxes().xaxis,
							active_day_date = this.article_list.active.day.data("timestamp"),
							coord = {};
						
						if( active_day_date - 24*60*60*1000 < plot_xaxis.min ){
							var prev_day_date = this.navigator.get.hour.prev.apply( this.navigator, [ new Date(active_day_date) ] );
							coord = this.navigator.graph.p2c({"x" : active_day_date })
						}else if( active_day_date + 24*60*60*1000 > plot_xaxis.max ){
							var next_day_date = this.navigator.get.hour.next.apply( this.navigator, [ new Date(active_day_date) ] ),
								graph_offset_date = new Date(active_day_date);
							
							
							switch( this.navigator.scale_change.state.get().name ){
								case "MONTH"    :
								default         :
										graph_offset_date = graph_offset_date.setDate(graph_offset_date.getDate() - 29);
									break;
								case "WEEK"     :
										graph_offset_date = graph_offset_date.setDate(graph_offset_date.getDate() - 6);
									break;
								case "DAY"      :
										graph_offset_date = graph_offset_date.setDate(graph_offset_date.getDate() );
									break;
							}
							coord = this.navigator.graph.p2c({"x" : graph_offset_date })
						}
						if( typeof( coord.left ) != 'undefined' && coord.left != 0 )
							this.navigator.graph.pan( coord );
						console.log("redraw")
					}
					
				}
			}
		}
	}
	
	
    $.fn.articles_timeline = function( method ){
		
		var timeline = this.data("timeline");
		
		if( timeline && timeline instanceof StoryTimeline ){
			if( timeline[method] && ( typeof timeline[method] == 'function' ) )
				return timeline[ method ].apply( timeline, Array.prototype.slice.call( arguments, 1 ));
			else
				return $.error( 'Method ' +  method + ' does not exist on StoryTimeline' );
		}else if( typeof method === 'object' || !method ){
			
			var defaults = { "target" : this },
				options = ( arguments.length > 0 ) ? arguments[ 0 ] : {},
				settings = $.extend( {}, defaults, options );
			
			timeline = new StoryTimeline( settings );
			return timeline
		}else
			return $.error( 'The articles_timeline object does not exist on this item' );
		
        return false;
		
	}
})(jQuery)

function __(text) {
	$("#log").append("<div>" + text +"</div>");
}