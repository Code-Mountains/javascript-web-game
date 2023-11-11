// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

		// Create the defaults once
		var pluginName = "gameInterface",
				defaults = {
				pixiScene: null,
				fruitFall: null
		};

		// The actual plugin constructor
		function Plugin ( element, options ) {
				this.element = element;
				this.settings = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
		}

		// Avoid Plugin.prototype conflicts
		$.extend(Plugin.prototype, {
				init: function () {
					this.initScreen();
				}, 
				initScreen:function(){
					//create Fruit Fall game title and show play button
					var gameName = new PIXI.Text('Fruit Fall Game', {font:'70px lateron-Regular', fill:'black'});
					gameName.position.x=180;
					gameName.position.y=180;
					this.settings.pixiScene.addChild(gameName);
					
					

				},
				gameOver:function(){

				}

	});



		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
				this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});

				// chain jQuery functions
				return this;
		};

})( jQuery, window, document );