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
					//generate all graphics on first load, but only display ones that are used
					this.initScreen();
					this.scoreboard();

				}, 
				scoreboard:function(){
					//setup scoreboard visuals and events
					var spRes = this.settings.fruitFall.spRes();
					var highScoreIcon = new PIXI.Sprite.fromImage('gain-point'+spRes+'.png');
					highScoreIcon.anchor.x=highScoreIcon.anchor.y=0.5;
					highScoreIcon.position.x=262;
					highScoreIcon.position.y=23;
					this.settings.pixiScene.addChild(highScoreIcon);

					this.highScoreText = new PIXI.Text('0',{font:'50px lateron-Regular', fill:'#42914e'});
					this.highScoreText.position.x=250;
					this.highScoreText.position.y=42;
					this.settings.pixiScene.addChild(this.highScoreText);


					var livesIcon = new PIXI.Sprite.fromImage('lose-life'+spRes+'.png');
					livesIcon.anchor.x=livesIcon.anchor.y=0.5;
					livesIcon.position.x=360;
					livesIcon.position.y=23;
					this.settings.pixiScene.addChild(livesIcon);

					this.livesText = new PIXI.DisplayObjectContainer();
					this.settings.pixiScene.addChild(this.livesText);

					this.livesText_Used = new PIXI.Text('0', {font:"50px lateron-Regular", fill:'#db514d'});
					this.livesText_Used.position.x=328;
					this.livesText_Used.position.y=42;
					this.livesText.addChild(this.livesText_Used);

					this.livesText_Of = new PIXI.Text('-', {font:"20px lateron-Regular", fill:'#db514d'});
					this.livesText_Of.position.x=355;
					this.livesText_Of.position.y=52;
					this.livesText.addChild(this.livesText_Of);

					this.livesText_Remaining = new PIXI.Text('3', {font:"50px lateron-Regular", fill:'#db514d'});
					this.livesText_Remaining.position.x=365;
					this.livesText_Remaining.position.y=42;
					this.livesText.addChild(this.livesText_Remaining);

					
					var separation = new PIXI.Text('/', {font:"70px lateron-Regular", fill:'#000000'});
					separation.position.x=300;
					separation.position.y=35;
					this.settings.pixiScene.addChild(separation);

					var ref=this;

					//on life lost change our lives visuals
					function switchCopy(lives){
						ref.livesText_Used.setText(3-lives);
						ref.livesText_Remaining.setText(lives);
						ref.centerText(342, ref.livesText_Used);
						ref.centerText(382, ref.livesText_Remaining);

						TweenMax.to(ref.livesText,0.25,{alpha:1});
					}

					$(this.element).on('life_change',function(e,data){
						var lives=parseInt(data);
						TweenMax.to(livesIcon.scale,0.25,{bezier:{values:[{y:0,x:0},{y:1,x:1}]}});
						TweenMax.to(ref.livesText, 0.25,{alpha:0,onComplete:switchCopy,onCompleteParams:[lives]});

					});

					//on score change event updates score visuals
					function switchScoreCopy(score){
						ref.highScoreText.setText(score);
						ref.centerText(265,ref.highScoreText);
						TweenMax.to(ref.highScoreText,0.25,{alpha:1});
					}
					$(this.element).on('score_change', function(e, data){
						var score = parseInt(data);
						TweenMax.to(highScoreIcon.scale, 0.25,{bezier:{values:[{y:0,x:0},{y:1,x:1}]}});
						TweenMax.to(ref.highScoreText, 0.25,{alpha:0,onComplete:switchScoreCopy,onCompleteParams:[score]});
					});


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
						ref.settings.fruitFall.soundFX.play('pencilStrike2');
						ref.beginCountdown();
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
					this.clockTL = new TimelineMax();

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
						ref.settings.fruitFall.soundFX.play('pencilStrike2');
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
				beginCountdown: function(){
					//create count down clock before game starts
					var clock=0;
					var coundownId=0;
					var ref = this;

					//move clock into view to begin countdown
					this.clockTL.fromTo(this.clock,1.5,{x:-100},{alpha:1,x:215,ease:Strong.easeOut});

					//make sure end game graphics animation reverses out
					this.endGameTL.reverse();
					function countdown(){
						if(clock<3){
							clock++;
							TweenMax.to(ref.clockHand, 0.5,{rotation:(clock*90)/(180/Math.PI), ease:Elastic.easeOut});
							ref.settings.fruitFall.soundFX.play('clock');

						}else{
							//stop coundown and start active gameplay
							clearInterval(countdownId);
							ref.settings.fruitFall.beginGame();

							//reset clock and move out of view
							TweenMax.to(ref.clockHand,1,{rotation:0,delay:0.25,ease:Elastic.easeOut});
							ref.clockTL.to(ref.clock, 1,{alpha:0,x:615,ease:Strong.easeInOut});

						}
					}

					countdownId = setInterval(countdown,1000);

				},
				centerText: function(xMid,txt){
					//text centering
					var newX = xMid-(txt.width/2);
					txt.position.x=newX;
				},
				gameOver:function(){
					//show end game graphics. Play again and highscore buttons
					this.scoreButton.visible=true;
					this.replayButton.visible=true;
					this.endGameTL.play();
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