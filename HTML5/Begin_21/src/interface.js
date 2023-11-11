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
					var ref = this;
					//create Fruit Fall game title and show play button
					var gameName = new PIXI.Text('Fruit Fall Game', {font:'70px lateron-Regular', fill:'black'});
					gameName.position.x=180;
					gameName.position.y=180;
					gameName.alpha=0;
					this.settings.pixiScene.addChild(gameName);

					//create play button
					var spRes = this.settings.fruitFall.spRes();
					this.playButton = new PIXI.DisplayObjectContainer();
					this.playButton.addChild(new PIXI.Sprite.fromFrame('play_btn'+spRes+'.png'));
					this.playButton.position.x = 250;
					this.playButton.position.y=300;
					this.playButton.interactive = true;
					this.playButton.buttonMode = true;
					this.playButton.alpha=0;


					this.settings.pixiScene.addChild(this.playButton);

					//ease initial graphics in and add event listeners to start game
					this.navTL = new TimelineMax();
					this.navTL.append(TweenMax.to(gameName,1,{alpha:1,delay:1,ease:Power2.easeInOut}));
					this.navTL.append(TweenMax.to(this.playButton,1,{alpha:1,delay:-2,ease:Power2.easeInOut}));

					this.playButton.click  = function(event){
						//ref.beginCountdown();
						ref.playButton.interactive=false;
						ref.navTL.timeScale(5);
						ref.navTL.reverse();
					}

					//create the countdown clock 
					this.clock = new PIXI.DisplayObjectContainer();
					this.clock.position.x=-25;
					this.clock.position.y=250;
					this.clock.alpha=0;
					this.settings.pixiScene.addChild(this.clock);

					this.clockHand = new PIXI.Sprite.fromImage('clock-hand'+spRes+'.png');
					this.clockHand.anchor.y=0.8;
					this.clockHand.anchor.x=0.4;
					this.clockHand.position.x=95;
					this.clockHand.position.y=78;
					this.clock.addChild(this.clockHand);


					var clockBG = new PIXI.Sprite.fromImage('clock'+spRes+'.png');
					this.clock.addChild(clockBG);


					//create replay button graphic and event listener
					this.replayButton = new PIXI.Sprite.fromImage('replay'+spRes+'.png');
					this.replayButton.anchor.x=this.replayButton.anchor.y=0.5;
					this.replayButton.position.x=390;
					this.replayButton.position.y=250;
					this.replayButton.buttonMode=true;
					this.replayButton.interactive=true;
					this.replayButton.visible=false;
					this.replayButton.alpha=0;
					this.settings.pixiScene.addChild(this.replayButton);
					
					this.replayButton.click = function(event) {
						ref.settings.fruitFall.restartGame();
					};

					//create high score button graphics
					this.scoreButton = new PIXI.Sprite.fromImage('highscore-btn'+spRes+'.png');
					this.scoreButton.anchor.x=this.scoreButton.anchor.y=0.5;
					this.scoreButton.position.x=250;
					this.scoreButton.position.y=250;
					this.scoreButton.buttonMode=true;
					this.scoreButton.interactive=true;
					this.scoreButton.visible=false;
					this.scoreButton.alpha=0;
					this.settings.pixiScene.addChild(this.scoreButton);

					//end game graphic timelinemax to play and reverse based on state of gameplay
					this.endGameTL = new TimelineMax({pause:true});
					this.endGameTL.append(TweenMax.allTo([this.scoreButton, this.replayButton],0.5,{alpha:1}));

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