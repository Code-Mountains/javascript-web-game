// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {



   //extendable default settings
   var gameName = "fruitFall",
         defaults = {
         canvasSize: {x:640,y:690},
         dpr:window.devicePixelRatio

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

            //add event listeners for resize
            $(window).on('resize deviceOrientation', this.rendererResize.bind(this));

            //trigger size check
            $(window).trigger('resize');


            this.loadAssets();


         },
         rendererResize:function(){
            //create target scale 
            var targetScale=1;

            //if dpr is greater than 1.2
            //load and scale everything based on a dpr of 2
            if(defaults.dpr>1.2){
               defaults.dpr=2;
            }

            var cv = defaults.canvasSize;
            var ih = $(window).innerHeight();
            var iw = $(window).innerWidth();

            var new_w = iw/cv.x;
            var new_h = ih/cv.y;

            //constrain scene scale to a max of 1.0
            if(new_h>1 && new_w>1){
               targetScale=1;
            }else{
               //always scale entire game to fit within viewport

               //if height scale is greater than width scale
               //then set new target scale based on WIDTH scale

               if(new_h > new_w){
                  targetScale=new_w;
               }else{
                  targetScale=new_h;
               }
            }

            //set our width and height variables based on our new adjusted target scale and dpr
            var w = targetScale*cv.x;
            var h = targetScale*cv.y;

            //resize renderer and scale scene container
            this.renderer.resize(w,h);

            this.scene.scale.x = this.scene.scale.y=targetScale/defaults.dpr;





         },
         loadAssets:function(){
            //load texture sprite sets based on device pixel ratio
            if(defaults.dpr>1.2){
               var loader = new PIXI.AssetLoader(['assets/2x/interface.json']);   
            }else{
               var loader = new PIXI.AssetLoader(['assets/interface.json']);
            }
            loader.onComplete = this.onLoadAssets.bind(this);

            loader.load();
         },
         onLoadAssets:function(){
            var texture = PIXI.Texture.fromImage('bg'+this.spRes()+'.png');
            var paperBG = new PIXI.Sprite(texture);
            this.scene.addChild(paperBG);
         },
         spRes:function(){
            //fix sprite name for screen resolution (pixijs auto handles the @2x naming convention)
            if(defaults.dpr>1.2){
               var nm='@2x';
            }else{
               var nm='';
            }
            return nm;
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



