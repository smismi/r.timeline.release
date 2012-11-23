(function($){
	
	// State object
	var DEFAULT_STATE_LIST = [ "LOADING", "READY" ];
	var State = function( options ){
		var defaults = {
			"state_list"	:	DEFAULT_STATE_LIST,
			"state"			:	undefined
		};
		this.settings = this.settings = $.extend( {}, defaults, options );
		this.init();
	};
	
	State.prototype = {
		"constructor"	:	State,
		"init"			:	function(){
			var state = ( this.settings.state ) ? this.settings.state : this.settings.state_list[0];
			this.set( state );
		},
		"get"			:	function(){
			return { "index" : this.settings.state_list.indexOf( this.settings.state ), "name" : this.settings.state };
		},
		"set"			:	function( state ){
			var state_index = this.settings.state_list.indexOf( state );
			if( state_index !== -1 ){
				this.settings.state = state;
				$.event.trigger( "state-change", { "name" : state, "index" : state_index }, this);
				$.event.trigger( "state-" + state_index, { "state" : state }, this);
			}else
				$.error( "State \"" + state + " \" not found in state_list ");
		}
	};
	
	
	// HTMLElement_State object
	var HTMLElement_State = function(options){
		var defaults = { "target" : undefined };
		this.settings = $.extend( {}, defaults, options );
		this.init();
	};
	
	HTMLElement_State.prototype = {
		"constructor"	:	HTMLElement_State,
		"init"			:	function(){
			var namespace = this;
			this.settings.state = new State({"state_list" : this.settings.state_list})
			
			$.event.add( this.settings.state, "state-change", function( e, new_state ){ 
				
				var target = namespace.settings.target;
				if( target ){
					
					var old_state = target.data("state-index");
					target.removeClass( "target-state-" + old_state );
					
					target.data("state-index", new_state.index);
					target.addClass("target-state-" + new_state.index);
					
					$(">.state", target).removeClass("active-state");
					$(">.state-" + new_state.index, target).addClass("active-state");
					
					target.trigger("state-change", new_state, this)
				}
			});
			this.settings.target.data( "state", this );
		},
		"set"			:	function( state ){
			this.settings.state.set( state );
		},
		"get"			:	function(){
			return this.settings.state.get();
		}
	};
	
	$.fn.state = function( method ){

		var state = this.data("state");
		
		if( state && state instanceof HTMLElement_State ){
			
			if( state[method] && ( typeof state[method] == 'function' ) )
				return state[ method ].apply( state, Array.prototype.slice.call( arguments, 1 ));
			else
				return $.error( 'Method ' +  method + ' does not exist on HTMLElement_State' );
		}else if( typeof method === 'object' || !method ){
			
			var defaults = { "target" : this },
				options = ( arguments.length > 0 ) ? arguments[ 0 ] : {},
				settings = $.extend( {}, defaults, options );
			
			state = new HTMLElement_State( settings );
			return state
		}else
			return $.error( 'The state object does not exist on this item' );
		
        return false;
	}
	
})(jQuery)