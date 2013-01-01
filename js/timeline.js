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
            "article"   :   "<article id=\"article-item-${date.getTime()}\" data-timestamp=\"${date.getTime()}\">\n\
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
        SCALE_CHANGE_BAR_STATELIST = [ "MONTH", "WEEK", "DAY", "YEAR" ];

    var TimelineNavigator = function(options){
        this.init( options )
    };

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
                "statistic_by_day"	:	[],
                "statistic_by_day0"	:	[],
                "statistic_by_hour"	:	[],
                "statistic_by_hour0"	:	[],
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
            })();

            start_date = ( statistic.length > 0 ) ? statistic[statistic.length - 1].date : new Date();
            end_date = ( statistic.length > 0 ) ? statistic[0].date : new Date();

            this._start_date = new Date( start_date.getFullYear(), start_date.getMonth(), start_date.getDate());
            this._end_date = new Date( end_date.getFullYear(), end_date.getMonth(), end_date.getDate() + 1);


            this.data.date_range.from = this._start_date;
            this.data.date_range.to = this._end_date;

            this.assembly.apply( this, [ statistic ] );

            this.plot_crosshair_image = new Image();
            this.plot_crosshair_image.src = "i/icons/timeline/crosshair.png";

            this.assemblyData.apply( this, [ this.data.date_range] );
            this.assemblyDayData.apply( this, [ this.data.date_range] );


            this.crosshair_position = this._end_date;
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

            scale_change_bar.bind("state-change", function(e, state){

                namespace.plotInit();

            });






            namespace.plotInit();
        },
        plotInit : function() {
            var namespace = this,
                view_mode = namespace.scale_change.state.get().name,
                min_value = namespace.data.data.by_day.a[0][0],
                max_value = namespace.data.data.by_day.a[namespace.data.data.by_day.a.length - 1][0];

            switch (view_mode) {
                case 'YEAR':
                    var data = [ { color:'#b7c1c4', "data" : namespace.data.data.by_year.b }, { color:'#f00',  "data" : namespace.data.data.by_year.a, "xaxis" : 2 } ]
                    break;
                case 'DAY':
                    var data = [ { color:'#b7c1c4', "data" : namespace.data.data.by_hour.b }, { color:'#f00',  "data" : namespace.data.data.by_hour.a, "xaxis" : 2 } ]
                    break;
                default     :
                    var data = [ { color:'#b7c1c4', "data" : namespace.data.data.by_day.b}, { color:'#f00',  "data" : namespace.data.data.by_day.a, "xaxis" : 2 } ]
                    break;
            }





            fixstamp =   ({
                "YEAR" : 365*24*60*60*1000,
                "MONTH" : 31*24*60*60*1000,
                "WEEK" : 14*24*60*60*1000,
                "DAY" : 24*60*60*1000
            })[ view_mode ];
            var placeholder = $("#placeholder");
            var options = {
                "xaxes"	:	[
                    {
                        min         :   (max_value - min_value < fixstamp) ? min_value : max_value - fixstamp,
                        max         :   max_value,
                        panRange: [min_value, max_value],
                        zoomRange: ({
                            "MONTH" : [31*24*60*60*1000, 365*24*60*60*1000],
                            "WEEK" : [7*24*60*60*1000, 31*24*60*60*1000],
                            "DAY" : [24*60*60*1000, 3*24*60*60*1000]
                        })[ view_mode ],
                        mode: "time",
                        tickLength: 5,
                        "position": "bottom",
                        "tickColor"     :   "#ffffff",
                        "ticks": function (date_range) {

                            var ticks = [],
                                last_date = new Date(date_range.max),
                                tick_counter = ({ "MONTH": 100, "WEEK": 100, "DAY": 100 })[ namespace.scale_change.state.get().name ];

                            switch (namespace.scale_change.state.get().name) {
                                case 'DAY':
                                    for (var i = 0; i < tick_counter; i++) {
                                        var tick_date = new Date(last_date.getFullYear(), last_date.getMonth(), last_date.getDate(), last_date.getHours() - i - 1);
                                        ticks.push([ tick_date.getTime() + 30*60*1000, "" + (( tick_date.getHours() < 10 ) ? "0" : "" ) + tick_date.getHours() ]);
                                    }
                                    break;
                                default     :
                                    for (var i = 0; i <= tick_counter; i++) {
                                        var tick_date = new Date(last_date.getFullYear(), last_date.getMonth(), last_date.getDate() - i);
                                        ticks.push([ tick_date.getTime() + 12*60*60*1000, tick_date.getDate() ]); // 12*60*60*1000 = 43200000 for correcting position (left border)
                                    }
                                    break;
                            }
                            return ticks;
                        }
                    },
                    {
                        min         :   (max_value - min_value < fixstamp) ? min_value : max_value - fixstamp,
                        max         :   max_value,
                        zoomRange: ({
                            "MONTH" : [31*24*60*60*1000, 365*24*60*60*1000],
                            "WEEK" : [7*24*60*60*1000, 31*24*60*60*1000],
                            "DAY" : [24*60*60*1000, 3*24*60*60*1000]
                        })[ view_mode ],
                        panRange: [min_value, max_value],
                        mode: "time",
                        tickLength: 5,
                        "position": "top",
                        "tickColor"     :   "#ffffff",
                        "ticks": function (date_range) {


                            var ticks = [],
                                first_tick_date = new Date( date_range.min ),
                                last_tick_date = new Date( date_range.max );

                            switch( namespace.scale_change.state.get().name ) {
                                case 'MONTH':
                                default     :
                                    var month_count = (last_tick_date.getFullYear() - first_tick_date.getFullYear()) * 6 - first_tick_date.getMonth() + 1 + last_tick_date.getMonth()
                                    for( var i = 0; i < month_count; i++ ){
                                        var month_date_end = new Date( first_tick_date.getFullYear(), first_tick_date.getMonth() + i + 1, 0 ),
                                            month_date_middle = new Date( month_date_end.getFullYear(), month_date_end.getMonth(), parseInt( month_date_end.getDate()/2 ));
                                        ticks.push( [ month_date_middle.getTime(), months_names.nominative[ month_date_middle.getMonth() ] + " " + month_date_middle.getFullYear() ] );
                                    }
                                    break;
                                case 'WEEK' :
                                    var month_count = (last_tick_date.getFullYear() - first_tick_date.getFullYear()) * 6 - first_tick_date.getMonth() + 1 + last_tick_date.getMonth()
                                    for( var i = 0; i < month_count; i++ ){
                                        var month_date_end = new Date( first_tick_date.getFullYear(), first_tick_date.getMonth() + i + 1, 0 ),
                                            month_date_middle = new Date( month_date_end.getFullYear(), month_date_end.getMonth(), parseInt( month_date_end.getDate()/1.2 ));
                                        month_date_middle2 = new Date( month_date_end.getFullYear(), month_date_end.getMonth(), parseInt( month_date_end.getDate()/2.5 ));
                                        ticks.push( [ month_date_middle.getTime(), months_names.nominative[ month_date_middle.getMonth() ] + " " + month_date_middle.getFullYear() ] );
                                        ticks.push( [ month_date_middle2.getTime(), months_names.nominative[ month_date_middle2.getMonth() ] + " " + month_date_middle2.getFullYear() ] );
                                    }
                                    break;
                                case 'DAY'  :
                                    var day_count = (last_tick_date.getTime() - first_tick_date.getTime())/ (12*60*60*1000);
                                    for( var i = 0; i < day_count; i++ ){
                                        var day_date_end = new Date( first_tick_date.getFullYear(), first_tick_date.getMonth(), first_tick_date.getDate() + i ),
                                            day_date_middle = new Date( day_date_end.getFullYear(), day_date_end.getMonth(), day_date_end.getDate(), 6 );
                                        day_date_middle2 = new Date( day_date_end.getFullYear(), day_date_end.getMonth(), day_date_end.getDate(), 18 );
                                        ticks.push( [ day_date_middle.getTime(), day_date_middle.getDate() + " " + months_names.nominative[ day_date_middle.getMonth() ] + " " + day_date_middle.getFullYear() ] );
                                        ticks.push( [ day_date_middle2.getTime(), day_date_middle2.getDate() + " " + months_names.nominative[ day_date_middle2.getMonth() ] + " " + day_date_middle2.getFullYear() ] );
                                    }
                                    break;
                            }
                            return ticks;
                        }
                    }
                ] ,
                "crosshair" :   { "mode" : "x", "locked" : true, "image" : this.plot_crosshair_image },
                "grid"		:	{
                    "clickable"     :   true,
                    "hoverable"     :   false,
                    "autoHighlight" :   false,
                    "show"			:	true,
                    "borderWidth"	:	0,
                    "lineWidth"		:	1
                },
                "series":	{
//                     "lines"		:	{
//                     "lineWidth"	:	0,
//                     "fill"			:	true,
//                     "fillColor"	:	"#b7c1c4"
//                     },
                    "bars"		:	{
                        "show"			:	true,
                        "lineWidth"		:	0,
                        "fill"			:	true,
//                        align : "center",
                        "barWidth"		:   ({ "MONTH" : 24*60*60*1000,  "WEEK" : 24*60*60*1000, "DAY" : 60*60*1000 })[ view_mode ]
                    }
                },
                yaxis: {
                    zoomRange   :   false,
                    panRange    :   false,
                    show        :   false,
                    min         :   null,
                    max         :   null,
                },
                zoom: {
                    interactive: false
                },
                pan: {
                    interactive: true,
                    frameRate: 1000
                }
            };

            this.graph = $.plot(placeholder, data, options);
//            this.graph.lockCrosshair();
//            $("#m100").on("click", function(){
//                namespace.graph.pan({ left: -1000 });
//
//            })
//            $("#p100").on("click", function(){
//                namespace.graph.pan({ left: 1000 });
//
//            })
//            $("#zoom").on("click", function(){
//                namespace.graph.setCrosshair({ "x" : 1356613740772 });
//
//
//            })



//            placeholder.bind( "plotselected", function( event, ranges ) {
//
//            });

            // show pan/zoom messages to illustrate events
            placeholder.bind('plotpan', function (event, plot) {
                var axes = plot.getAxes();
                $(".message").html("Panning to x: "  + axes.xaxis.min.toFixed(2)
                    + " &ndash; " + axes.xaxis.max.toFixed(2)
                    + " and y: " + axes.yaxis.min.toFixed(2)
                    + " &ndash; " + axes.yaxis.max.toFixed(2));

//                plot.setCrosshair({ "x" : namespace.crosshair_position });
//                plot.lockCrosshair();
            });
            placeholder.bind('plotzoom', function (event, plot) {
                var axes = plot.getAxes();
                $(".message").html("Zooming to x: "  + axes.xaxis.min.toFixed(2)
                    + " &ndash; " + axes.xaxis.max.toFixed(2)
                    + " and y: " + axes.yaxis.min.toFixed(2)
                    + " &ndash; " + axes.yaxis.max.toFixed(2));

//                plot.setCrosshair({ "x" : namespace.crosshair_position });
//                plot.lockCrosshair();

            });










        },
        "assembly"  :   function( data ){
            var end_date = this.data.date_range.to;

            end_date = new Date( end_date.getFullYear(), end_date.getMonth(), end_date.getDate() );
            for( var i = 0; i < data.length; i++ ){
                var hour = parseInt( ( end_date.getTime() - data[i].date.getTime() )  / 3600000 ); // 3600000 = 60*60*1000
                this.data.statistic[ hour ] = [ data[i].date.getTime(), data[i].count ];
            }
        },

        "assemblyData"  :   function( date_range ){
            namespace = this;
            var data = {}


// по дням
            data.by_day = {
                a : [],
                b : []
            };



            var diff_days = Math.floor( ( date_range.to.getTime() - date_range.from.getTime() ) / 86400000 ); // 86400000 = 24*60*60*1000;
            data.by_day.a.push( [ new Date( date_range.to.getFullYear(), date_range.to.getMonth(), date_range.to.getDate() ), 0 ] )
            for( var i = 0; i < diff_days + 1; i++ ){
                var items_count = 0;
                for( var k = 0; k < 24; k++ ){
                    var hour = i*24 + k;
                    if( typeof( this.data.statistic[ hour ] ) != 'undefined' ){
                        items_count += this.data.statistic[ hour ][1];
                    }


                }
                if (i % 2) {items_count0 = 10} else {items_count0 = 0};
                data.by_day.a.push( [ new Date( date_range.to.getFullYear(), date_range.to.getMonth(), date_range.to.getDate() - i - 1 ), items_count ] )
                data.by_day.b.push( [ new Date( date_range.to.getFullYear(), date_range.to.getMonth(), date_range.to.getDate() - i - 1 ), items_count0 ] )

            }
//по часам
            data.by_hour = {
                a : [],
                b : []
            };
            var diff_hours = Math.floor( ( date_range.to.getTime() - date_range.from.getTime() ) / 3600000 ); // 3600000 = 60*60*1000;

            for( var i = 0; i < diff_hours; i++ ){
                var items_count = ( typeof( this.data.statistic[ i ] ) != 'undefined' ) ? this.data.statistic[ i ][1] : 0;
                data.by_hour.a.push( [ new Date(date_range.to.getFullYear(), date_range.to.getMonth(), date_range.to.getDate(), date_range.to.getHours() - i  ).getTime(), items_count ] )
                data.by_hour.b.push( [ new Date(date_range.to.getFullYear(), date_range.to.getMonth(), date_range.to.getDate(), date_range.to.getHours() - i  ).getTime(), (i % 2) ? 10 : 0 ] )
            }


            data.by_day.a.sort(function(a,b){ return a[0] - b[0] });
            data.by_day.b.sort(function(a,b){ return a[0] - b[0] });
            data.by_hour.a.sort(function(a,b){ return a[0] - b[0] });
            data.by_hour.b.sort(function(a,b){ return a[0] - b[0] });

//по месяцам
            data.by_month = {
                a : [],
                b : []
            };

            first_month = new Date( date_range.from.getFullYear(), date_range.from.getMonth() ) ;
            last_month = new Date( date_range.to.getFullYear(), date_range.to.getMonth() + 1 ) ;
            var diff_month = Math.floor((last_month -  first_month) / 31 / 24 / 60 / 60 / 1000);

            for( var i = 0; i <= diff_month; i++ ){
                var items_count = 0;

                var _time_form = new Date( date_range.from.getFullYear(), date_range.from.getMonth() + i ).getTime();
                var _time_to = new Date( date_range.from.getFullYear(), date_range.from.getMonth() + i + 1 ).getTime();


                $.each(namespace.data.statistic, function(index, value) {

                    if( typeof( namespace.data.statistic[ index ] ) != 'undefined' ){
                        if (namespace.data.statistic[ index ][0] > _time_form && namespace.data.statistic[ index ][0] < _time_to)
                            items_count += namespace.data.statistic[ index ][1];
                    }

                });

                if (i % 2) {items_count0 = 10} else {items_count0 = 0};
                data.by_month.a.push( [ new Date( date_range.from.getFullYear(), date_range.from.getMonth() + i ), items_count ] )
                data.by_month.b.push( [ new Date( date_range.from.getFullYear(), date_range.from.getMonth() + i ), items_count0 ] )

            }

//по годам
            data.by_year = {
                a : [],
                b : []
            };

            first_year = new Date( date_range.from.getFullYear(), 0) ;
            last_year = new Date( date_range.to.getFullYear(), 0) ;
            var diff_year = Math.floor((last_month -  first_month) / 365 / 24 / 60 / 60 / 1000);

            for( var i = 0; i <= diff_year; i++ ){
                var items_count = 0;

                var _time_form = new Date( date_range.from.getFullYear() + i, 0 ).getTime();
                var _time_to = new Date( date_range.from.getFullYear() + i + 1, 0 ).getTime();


                $.each(namespace.data.statistic, function(index, value) {

                    if( typeof( namespace.data.statistic[ index ] ) != 'undefined' ){
                        if (namespace.data.statistic[ index ][0] > _time_form && namespace.data.statistic[ index ][0] < _time_to)
                            items_count += namespace.data.statistic[ index ][1];
                    }

                });

                if (i % 2) {items_count0 = 10} else {items_count0 = 0};
                data.by_year.a.push( [ new Date( date_range.from.getFullYear() + i, 0 ), items_count ] )
                data.by_year.b.push( [ new Date( date_range.from.getFullYear() + i, 0 ), items_count0 ] )

            }

            this.data.data = data;

        },

        "assemblyDayData"  :   function( date_range ){
            var data = [];
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
            data.sort(function(a,b){ return a[0] - b[0] });

            this.data.statistic_by_hour = data;





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

            var namespace = this;

            var date_string = "" + date_range.to.getFullYear()
                + (( date_range.to.getMonth() < 9 ) ? "0" + (date_range.to.getMonth() + 1) : (date_range.to.getMonth() + 1) )
                + (( date_range.to.getDate() < 10 ) ? "0" + date_range.to.getDate() : date_range.to.getDate() );

            if( typeof( this.queries[ date_string ] ) == 'undefined' && typeof( date_range.to ) != 'undefined' ){

//				namespace.loader.show();

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

            this.navigator.crosshair_position = this.article_list.active.item.data("timestamp");
            this.story = {
                "timeline"	:	$(".story_timeline", this.target),
                "container"	:	$(".story_main_container", this.target),
                "dummy"		:	$(".timeline_article_cursor", this.target)
            }


            var graph = this.navigator.graph,
                graph_container = graph.getPlaceholder()
            click_lock = false;




            graph_container.bind("plotclick.graph_navigation", function(e, data, item){

                namespace.navigator.crosshair_position = parseInt( data.x )
                graph.setCrosshair({"x" : namespace.navigator.crosshair_position });
                graph.lockCrosshair();
                console.log(new Date(namespace.navigator.crosshair_position))
            })


            function scrollToSelectedRange(){

            }


        },
        "get"	:	{


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
})(jQuery);
function __(text) {
    $("#log").append("<div>" + text +"</div>");
}