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

            //adjust physics scale to match screen size
            defaults.SCALE = defaults.SCALE/targetScale;

           
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


            //setup debugger canvas
            this.b2dDebug();

            //create our ficture and body definition variables
            this.fixDef = new Box2D.Dynamics.b2FixtureDef();
            this.bodyDef = new Box2D.Dynamics.b2BodyDef();

            //set ground and walls to collide with everything
            this.fixDef.filter.categoryBits = 0xFFFF;

            //ground
            this.fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
            this.fixDef.density = 1;
            this.fixDef.shape.SetAsBox(defaults.canvasSize.x/SCALE, 10/SCALE);
            this.bodyDef.position.Set(0,(defaults.canvasSize.y-30)/SCALE);
            var ground = this.world.CreateBody(this.bodyDef);
            ground.userData = {};
            ground.userData.name='ground';
            ground.CreateFixture(this.fixDef);


            //left wall
            this.fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
            this.fixDef.density = 1;
            this.fixDef.shape.SetAsBox(10/SCALE, defaults.canvasSize.y/SCALE);
            this.bodyDef.position.Set(30/SCALE,0);
            var wallL = this.world.CreateBody(this.bodyDef);
            wallL.userData = {};
            wallL.userData.name='wall';
            wallL.CreateFixture(this.fixDef);

            //right wall
            this.fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
            this.fixDef.density = 1;
            this.fixDef.shape.SetAsBox(10/SCALE, defaults.canvasSize.y/SCALE);
            this.bodyDef.position.Set((defaults.canvasSize.x-30)/SCALE,0);
            var wallR = this.world.CreateBody(this.bodyDef);
            wallR.userData = {};
            wallR.userData.name='wall';
            wallR.CreateFixture(this.fixDef);

            //randomly generate some fruit falling
            this.randomFruitFall();


         },
         randomFruitFall:function(){

          var ref = this;

          (function loop(){
            var rand = Math.round(Math.random()* (1000-500))+500;

            setTimeout(function(){
              //randomly generate falling fruit/enemy blocks
              var randomFruit = Math.round(Math.random()*defaults.foodTypes.length);

              //random x position based on fruit size add  1 pixel so they don't bounce off each other;
              var fruitOnXRand = Math.round((Math.random()*defaults.fruitOnX));
              var randomX = Math.round((defaults.fruitSize+1)*fruitOnXRand);


              //set bit masking for every other fruit line so they don't affect each other
              var cMasking = 0x0002;
              if(fruitOnXRand%2==1){
                cMasking=0x0004;
              }

              ref.createBlock(75+randomX, defaults.foodTypes[randomFruit], cMasking);

              loop();

            },rand);

          }());

         },
         createBlock: function(xPos, itemType, mc){
          //setup initial fixture vars, play with this until you have proper weight/interaction
          var SCALE = defaults.SCALE;
          var ref=this;
          this.fixDef.density = 1;
          this.fixDef.restitution = 0.5;
          this.fixDef.friction = 0.5;

          //make sure we are using a dynamic body
          this.bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;

          //divide fruit size by 2, SetAsBox uses half-measurements;
          var blockScale = defaults.fruitSize/2;

          //set maskBits and category to not collide with blocks not within their x position
          this.fixDef.filter.categoryBits = mc;
          this.fixDef.filter.maskBits=mc;

          //setup the shape and position
          this.fixDef.shape.SetAsBox(blockScale/SCALE, blockScale/SCALE);
          this.bodyDef.position.Set(xPos/SCALE, -blockScale/SCALE);

          //create block body, give it a user data object and add the item type name(apple, pear, etc)
          var theBlock = this.world.CreateBody(this.bodyDef);
          theBlock.CreateFixture(this.fixDef);
          theBlock.userData = {};
          theBlock.userData.name=itemType;

          //if itemType is a bomb then we want to destroy nearby blocks
          if(itemType=='bomb'){
            setTimeout(function(){
              //if not tagged for removal then explode bomb
              if(theBlock.userData.discovered!=true){
                ref.blastRadius(theBlock.GetPosition().x, theBlock.GetPosition().y);
              }

            },4000);
          }else{
            //else fruit should auto die after 15-25 seconds of life
            setTimeout(function(){
              ref.destroyBodies.push(theBlock);
            }, (Math.random()*10+5)*2000);
          }

          //create a prismatic joint to pin block movement to the y axis only
          var b2Vec2 = Box2D.Common.Math.b2Vec2;
          this.blockPrismaticJoint({
            world: this.world,
            axis:new b2Vec2(0.0,1.0), // pin only to the Y axis
            bodyA: theBlock,
            bodyB: this.world.GetGroundBody()
          });

         },
         blockPrismaticJoint: function(state){
          //basic prismatic joint just to lock on Y axis without any limits
          var jointDef = new Box2D.Dynamics.Joints.b2PrismaticJointDef();
          jointDef.Initialize(state.bodyA, state.bodyB, state.bodyA.GetWorldCenter(), state.axis);
          this.world.CreateJoint(jointDef);

         },
         blastRadius: function(xPoint, yPoint){
          //create collision rectangle around blast radius
          var blockPos = new Box2D.Common.Math.b2Vec2(xPoint, yPoint);
          var aabb = new Box2D.Collision.b2AABB();
          aabb.lowerBound.Set(xPoint-0.5, yPoint-0.5);
          aabb.upperBound.Set(xPoint+0.5, yPoint+0.5);

          //test if there are any AABBs (axis-aligned bounding boxes) within the blast rectangle area
          var body;
          var ref = this;
          this.world.QueryAABB(
            //the fixture that was successfully queried
            function(fixture)
            {
                //only get bodies that are dynamic (we don't want to destroy walls or floor)
                if(fixture.GetBody().GetType() != Box2D.Dynamics.b2Body.b2_staticBody)
                {
                    body = fixture.GetBody();
                    //destroy body and find next body within radius
                    ref.destroyBodies.push(body);
                    return true;
                }
            }, aabb);


         },
         b2dDebug:function(){
          //setup debug draw
          var debugDraw = new Box2D.Dynamics.b2DebugDraw();
          var debugCV = $('#dbc');
          debugCV.attr('height',defaults.canvasSize.y);
          debugCV.attr('width',defaults.canvasSize.x);

          debugDraw.SetSprite(document.getElementById('dbc').getContext('2d'));

          //scale our debug graphics and set alpha transparency
          debugDraw.SetDrawScale(100);
          debugDraw.SetFillAlpha(0.2);
          //list of flags to show in our debug canvas, we are showing shapes and joints
          debugDraw.SetFlags(
            Box2D.Dynamics.b2DebugDraw.e_shapeBit |
            Box2D.Dynamics.b2DebugDraw.e_jointBit
            );

          this.world.SetDebugDraw(debugDraw);


         },
         animate: function(){
          //animating the physics world
          this.world.Step(1/60, //Set to the Box2D manual's suggested 60hz time step
            8, //default velocity iterations
            3 //default position iterations
            //more iterations == more accuracy but requires more processing
            );

          this.world.DrawDebugData();
          this.world.ClearForces();

            requestAnimFrame(this.animate.bind(this));

           // render the stage
           this.renderer.render(this.stage);

           //destroy all bodies in destroy list
           //have to wait until box2d unlocks your bodies, send bodies to a destruction list to be
           //destroyed in you animation step function
           for(var i=0;i<this.destroyBodies.length;i++){
            this.world.DestroyBody(this.destroyBodies[i]);
           }

           //make sure to clear out yuor array after bodies have been destroyed
           this.destroyBodies = [];



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


