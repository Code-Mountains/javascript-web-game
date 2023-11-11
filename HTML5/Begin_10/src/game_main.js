// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {



   //extendable default settings
   var gameName = "fruitFall",
         defaults = {
         canvasSize: {x:640,y:690},
         fruitOnX: 8,
         dpr:window.devicePixelRatio,
         SCALE:100, //box2d likes to operate with objects from 0.1-10 meters in scale
         fruitSize:60,
         foodTypes:['peach','apple','orange','bomb']
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

            //rAF fix for older browsers
            window.requestAnimFrame = (function(){
              return window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame        ||
              window.mozRequestAnimationFrame           ||
              window.oRequestAnimationFrame             ||
              window.msRequestAnimationFrame            ||
              function(callback, element){
                window.setTimeout(callback, 100/60);

              };
            })();


             // create the pixi stage
            this.stage = new PIXI.Stage(0x66FF99);

            //create a root pixi object container in order to handle scaling/retina res/orientation/etc.
            this.scene = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.scene);


            // create a renderer instance and set size to defaults
            this.renderer = PIXI.autoDetectRenderer(defaults.canvasSize.x, defaults.canvasSize.y);


             // add the renderer view element to the DOM
             $(this.element).append(this.renderer.view);

             //start aimation ticker
             requestAnimFrame(this.animate.bind(this));


             //add listeners for screen resize and device orientation change
             //make sure renderResize function's "this" is bound to our main game object
             //so we can access our game variables
            window.addEventListener('resize', this.rendererResize.bind(this));
            window.addEventListener('deviceOrientation', this.rendererResize.bind(this));

            //trigger initial size check
            this.rendererResize();

            //create physics world
            this.physicsWorld();

            //load sprites and other assets
            this.loadAssets();
         },
         rendererResize: function(){
            //create target scale variable
            var targetScale=1;


            //load 2X retina images and scale scene for HiDPI images if dpr is greater than 1.2
            if(defaults.dpr>1.2){
               defaults.dpr=2;
            }


            //constrain scene scale to a max of 1.0 to prevent ugly upscaled textures
            if(($(window).innerHeight() / defaults.canvasSize.y)>1 &&  
               ($(window).innerWidth() / defaults.canvasSize.x)>1){
               targetScale=1;
            }else{
               //always scale entire game to fit within viewport
               if (($(window).innerHeight() / defaults.canvasSize.y) <
                   ($(window).innerWidth()  / defaults.canvasSize.x)) {

                  //if height is greater than window height then scale proportionately based on height
                  targetScale = $(window).innerHeight()/defaults.canvasSize.y;

               } else {

                  //if width is greater than window width then scale proportionately based on width
                  targetScale = $(window).innerWidth()/defaults.canvasSize.x;

               }
            }


           
            //set our width and height variables based on our new adjusted target scale
            var width = targetScale*defaults.canvasSize.x;
            var height = targetScale*defaults.canvasSize.y;

            //resize renderer and scale scene container object based on the current device pixel ratio
            this.renderer.resize(width, height);
            this.scene.scale.x=this.scene.scale.y=targetScale/defaults.dpr;

         },
         loadAssets: function () {
            //load texture sprite sets based on device pixel ratio
            if(defaults.dpr>1.2){
               var loader = new PIXI.AssetLoader(["assets/2x/interface.json"]);
            }else{
               var loader = new PIXI.AssetLoader(["assets/interface.json"]);
            }
            
           loader.onComplete = this.onLoadAssets.bind(this);
           loader.load();

         },
         onLoadAssets: function(){
            //all assets loaded
            this.staticGraphics();
         },
         staticGraphics: function(){
            var texture = PIXI.Texture.fromImage('bg'+this.spRes()+'.png');
            var paperBG = new PIXI.Sprite(texture);
            this.scene.addChild(paperBG);

         },

         spRes: function(){
            //fix sprite name for screen resolution (pixijs auto handles scaling sprites with the @2x naming convention)
            if(defaults.dpr>1.2){
              var nm='@2x';
            }else{
              var nm='';
            }
            return nm;
         },
         physicsWorld:function(){
            var SCALE = defaults.SCALE;

            //our body destruction container
            this.destroyBodies = [];
            //where we will store our bodies and actors
            //how we will tie pixi lib sprites to the physics lib bodies
            this.bodiesAndActors = [];

            //Earth gravity 9.8/m/s/s
            this.world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0,9.8), true);

            //create our ficture and body definition variables
            this.fixDef = new Box2D.Dynamics.b2FixtureDef();
            this.bodyDef = new Box2D.Dynamics.b2BodyDef();

            //ground
            this.fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
            this.fixDef.density = 1;
            this.fixDef.shape.SetAsBox(defaults.canvasSize.x/SCALE, 10/SCALE);
            this.bodyDef.position.Set(0,(defaults.canvasSize.y-30)/SCALE);
            var ground = this.world.CreateBody(this.bodyDef);
            ground.userData = {};
            ground.userData.name='ground';
            ground.CreateFixture(this.fixDef);

         },
         animate: function(){
          //animating the physics world
          this.world.Step(1/60, //Set to the Box2D manual's suggested 60hz time step
            8, //default velocity iterations
            3 //default position iterations
            //more iterations == more accuracy but requires more processing
            );


          this.world.ClearForces();

            requestAnimFrame(this.animate.bind(this));

           // render the stage
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


