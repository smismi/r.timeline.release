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
    //todo = TimelineNavigator
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
                end_date,
                plot_state;

            this.data = {
                "statistic"			:	[],
                "statistic_temp"	:	[],
                "statistic_xes"	    :	[],
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
            // тут считаем начало и конец реального периода
            start_date = ( statistic.length > 0 ) ? statistic[statistic.length - 1].date : new Date();
            end_date  = ( statistic.length > 0 ) ? statistic[0].date  : new Date();

            this.crosshair_position = ( statistic.length > 0 ) ? statistic[0].date  : new Date();

            // в цифре
            var d_start_date = start_date.getTime();
            var d_end_date = end_date.getTime();

            var period = d_end_date - d_start_date;

            switch( true ) {
                case period < 24 * 60 * 60 * 1000:
                    //plot_state = "DAY"

                    start_date = new Date( start_date.getFullYear(), start_date.getMonth(), start_date.getDate() - 21);
                    end_date = new Date( end_date.getFullYear(), end_date.getMonth(), end_date.getDate() + 20);
                    this.data.date_range.from = start_date;
                    this.data.date_range.to = end_date;
                    break;
                case period < 7 * 24 * 60 * 60 * 1000:


                    start_date = new Date( start_date.getFullYear(), start_date.getMonth(), start_date.getDate() - 21);
                    end_date = new Date( end_date.getFullYear(), end_date.getMonth(), end_date.getDate() + 20);
                    this.data.date_range.from = start_date;
                    this.data.date_range.to = end_date;

                    //plot_state = "WEEK"
                    break;
//                case period < 31 * 24 * 60 * 60 * 1000:
//
//                    break;
                default :
                    //plot_state = "MONTH";

                    start_date = new Date( start_date.getFullYear(), start_date.getMonth(), start_date.getDate() - 21);
                    end_date = new Date( end_date.getFullYear(), end_date.getMonth(), end_date.getDate() + 20);
                    this.data.date_range.from = start_date;
                    this.data.date_range.to = end_date;
            }

            var fix_time = ({
                "MONTH" : 31 * 24 * 60 * 60 * 1000, //12*60*60*1000
                "DAY" : 7 * 24 * 60 * 60 * 1000,
                "HOUR" : 60 * 60 * 1000 //30*60*1000
            })[plot_state];



            //scale bar init
            var scale_change_bar = $(".scale-change-bar", this.target),
                scale_change_bar_state = scale_change_bar.state({ "state_list" : SCALE_CHANGE_BAR_STATELIST });

//            $("a", scale_change_bar).bind("click", function(e){
//                e.preventDefault();
//                scale_change_bar_state.set( $(this).data("scale-size") );
//
//            });
            this.scale_change = {
                "bar"	:	scale_change_bar,
                "state"	:	scale_change_bar_state
            };

//            scale_change_bar.bind("state-change", function(e, state){   // байнд на смену стейтов
//
//
//                var date_range = {
//                    "from" 	: 	namespace.data.date_range.from
//                    ,"to" 	:	namespace.data.date_range.to
//                };
//
//                namespace.assemblyTempData.apply( namespace, [ namespace.data.date_range ] );
//                namespace.plotInit(date_range, scale_change_bar_state.settings.state.settings.state);
//                namespace.graph.setCrosshair({"x" : namespace.crosshair_position});
//            })

            // graph init
            this.assembly.apply( this, [ statistic ] );   // добавлает в data события по часам
            this.assemblyTempData.apply( this, [ this.data.date_range ] );

            namespace.plot_crosshair_image = new Image();
            namespace.plot_crosshair_image.src = "http://ria.ru/i/icons/timeline/crosshair.png";

            var plot_date_range = {
                "from"	:	new Date( this.data.date_range.from.getFullYear(), this.data.date_range.from.getMonth(), this.data.date_range.from.getDate() ),
                "to"	:	new Date( this.data.date_range.to.getFullYear(), this.data.date_range.to.getMonth(), this.data.date_range.to.getDate() )
            };
            this.plotInit( plot_date_range, scale_change_bar_state.settings.state.settings.state); // todo porno name

            myScroll = new iScroll('wrapper', { scrollbarClass: 'myScrollbar', hScroll: true, vScroll: false});
            namespace.graph.setCrosshair({"x" : end_date.getTime()});

        },  // INIT
        "plotInit"	:	function( date_range, plot_state ){

            __('plotInit');
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
        },

        "assembly"  :   function( data ){
            var end_date = this.data.date_range.to;

            end_date = new Date( end_date.getFullYear(), end_date.getMonth(), end_date.getDate() );
            for( var i = 0; i < data.length; i++ ){
                var hour = parseInt( ( end_date.getTime() - data[i].date.getTime() )  / 3600000 ); // 3600000 = 60*60*1000
                this.data.statistic[ hour ] = [ data[i].date.getTime(), data[i].count ];
            }
        },

        "assemblyTempData"  :   function( date_range ){
            __('assably' + date_range.from + ' - ' + date_range.to);
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

            this.data.statistic_temp = data;  //смотрит сколько разных дней и возвращает массив даже с пустыми днями что б правильно строить график
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
            }//,
//            "merge" :   function( content1, content2, parent ){
//
//                var namespace = this;
//                for( var key in content2 ){
//                    if( content1.hasOwnProperty( key ) ){
//                        if( content1[ key ] instanceof Array && content2[ key ] instanceof Array ){
//                            var array_content1 = content1[ key ],
//                                array_content2 = content2[ key ];
//                            for( var i = 0; i < array_content2.length; i++ )
//                                for( var j = 0; j < array_content1.length; j++ )
//                                    if( array_content2[i] == array_content1[j] )
//                                        array_content2.splice(i,1)
//                            content1[key] = array_content1.concat( array_content2 );
//                        }else if( content1[ key ].constructor === Object )
//                            content1[key] = namespace.data.merge.apply( namespace, [ content1[ key ], content2[ key ], content1 ] );
//                    }
//                    else{
//                        var item = content2[ key ];
//                        content1[ key ] = item;
//                        if( item.type ){
//                            switch( item.type ){
//                                case "month"    :
//										namespace.item[ item.type ].generate.apply( namespace, [ item, namespace.element ] );
//                                    break;
//                                default         :
//										namespace.item[ item.type ].generate.apply( namespace, [ item, $("#" + parent.type + "-item-" + parent.date.getTime(), namespace.element ) ] );
//                                    break;
//                            }
//                        }
//                    }
//                }
//
//                return content1;
//            }
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

       //     this.navigator.crosshair_position = this.article_list.active.item.data("timestamp");




            this.story = {
                "timeline"	:	$(".story_timeline", this.target),
                "container"	:	$(".story_main_container", this.target),
                "dummy"		:	$(".timeline_article_cursor", this.target)
            }


            var graph = this.navigator.graph,
                graph_container = graph.getPlaceholder();

            namespace.scrollToSelectedRange();

            graph_container.bind("plotclick.graph_navigation", function(e, data, point){
                if (!click_lock) {
                    namespace.navigator.graph.lockCrosshair();
                    namespace.navigator.crosshair_position = parseInt( data.x )
                    graph.setCrosshair({"x" : namespace.navigator.crosshair_position });
                    namespace.scrollToSelectedRange();
                }
            })

            graph_container.bind("mousedown.graph_navigation", function(e){
                e.preventDefault();
                click_lock = false;
//				namespace.navigator.graph.unlockCrosshair();
//
                graph_container.bind("mousemove.graph_navigation", function(){
                    click_lock = true;
                });
                graph_container.bind("mouseup.graph_navigation", function(){

                    graph_container
                        .unbind("mousemove.graph_navigation")
                        .unbind("mouseup.graph_navigation");
                    namespace.navigator.graph.lockCrosshair();
                });
                return false;
            });
        },

        "scrollToSelectedRange" : function() {
            namespace = this;
            var graph = namespace.navigator.graph;
            var coord = graph.getCrosshairPosition(),
                offset = graph.c2p( coord );
            namespace.scrollScroll(offset.x);


            var active_article = namespace.get.nextArticleByTimestamp.apply(namespace, [ parseInt( offset.x ) ]);
            if(active_article.length != 0){
                scrollTo(0,active_article.offset().top - 200);
                __(active_article.offset().top);
            } else {
                __('мимо')
            }
        },
        "scrollScroll" : function(timecheck) {
            namespace = this;
            var crosshair_position = new Date(namespace.navigator.crosshair_position);
            var date_range = namespace.navigator.data.date_range;

            var min_value = date_range.from.getTime(),
                max_value = date_range.to.getTime();

            var fix_timestamp = ({
                "MONTH" : 31 * 24 * 60 * 60 * 1000, //12*60*60*1000
                "WEEK" : 7 * 24 * 60 * 60 * 1000,
                "DAY" : 3 * 24 * 60 * 60 * 1000 //30*60*1000
            })[ namespace.navigator.scale_change.state.settings.state.settings.state ];

            _w = 1000 * (max_value - min_value)  / fix_timestamp; //width_plot
            _x = 1000 * (timecheck - min_value)  / fix_timestamp;

            myScroll.scrollTo(-_x + 500, 0, 200);

            $("#current_timestamp").html(crosshair_position.getFullYear() + ' ' +  crosshair_position.getMonth()  + ' ' +  crosshair_position.getDate())
        },
        "get"	:	 {
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
        }
    };












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