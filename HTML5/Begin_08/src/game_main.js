// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {



   //extendable default settings
   var gameName = "fruitFall",
         defaults = {
         canvasSize: {x:640,y:690}

   };

   // The actual plugin constructor
   function Game( element, options ) {
      this.element = element;
      this.settings = $.extend( {}, defaults, options );
      this._defaults = defaults;
      this._name = gameName;


      

      //start game build
      this.init();
   }

   // Avoid Game.prototype conflicts
   $.extend(Game.prototype, {

         init: function () {
            //creating the pixi stage
            this.stage = new PIXI.Stage(0x66FF99);

            //create a root pixi object container in order to handle scaling/rotation/etc.
            this.scene = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.scene);

            //create a renderer instance and set size to defaults
            this.renderer = PIXI.autoDetectRenderer(defaults.canvasSize.x, defaults.canvasSize.y);

            //add the renderer to the DOM
            $(this.element).append(this.renderer.view);

            //start animation ticker
            requestAnimFrame(this.animate.bind(this));

            this.loadAssets();


         },
         loadAssets:function(){
            var loader = new PIXI.AssetLoader(['assets/interface.json']);
            loader.onComplete = this.onLoadAssets.bind(this);

            loader.load();
         },
         onLoadAssets:function(){
            var texture = PIXI.Texture.fromImage('bg.png');
            var paperBG = new PIXI.Sprite(texture);
            this.scene.addChild(paperBG);
         },
         animate: function(){
            requestAnimFrame(this.animate.bind(this));

            this.renderer.render(this.stage);
         }


   });

   // A really lightweight plugin wrapper around the constructor,
   // preventing against multiple instantiations
   $.fn[ gameName ] = function ( options ) {
      this.each(function() {
            if ( !$.data( this, "plugin_" + gameName ) ) {
                  $.data( this, "plugin_" + gameName, new Game( this, options ) );
            }
      });

      // chain jQuery functions
      return this;
   };

})( jQuery, window, document );



