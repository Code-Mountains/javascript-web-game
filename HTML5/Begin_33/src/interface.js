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
					this.scoreboard();
					this.initScreen();


				},
				scoreboard:function(){
					var dpr = this.settings.fruitFall.settings.dpr;
					//setup scoreboard visuals and events
					var spRes = this.settings.fruitFall.spRes();
					var highScoreIcon = new PIXI.Sprite.fromImage('gain-point'+spRes+'.png');
					highScoreIcon.anchor.x=highScoreIcon.anchor.y=0.5;
					highScoreIcon.position.x=262*dpr;
					highScoreIcon.position.y=23*dpr;
					this.settings.pixiScene.addChild(highScoreIcon);

					this.highScoreText = new PIXI.Text('0', {font:(50*dpr)+"px lateron-Regular", fill:'#42914e'});
					this.highScoreText.position.x=250*dpr;
					this.highScoreText.position.y=42*dpr;
					this.settings.pixiScene.addChild(this.highScoreText);



					var livesIcon = new PIXI.Sprite.fromImage('lose-life'+spRes+'.png');
					livesIcon.anchor.x=livesIcon.anchor.y=0.5;
					livesIcon.position.x=360*dpr;
					livesIcon.position.y=23*dpr;
					this.settings.pixiScene.addChild(livesIcon);

					this.livesText = new PIXI.DisplayObjectContainer();
					this.settings.pixiScene.addChild(this.livesText);

					this.livesText_Used = new PIXI.Text('0', {font:(50*dpr)+"px lateron-Regular", fill:'#db514d'});
					this.livesText_Used.position.x=328*dpr;
					this.livesText_Used.position.y=42*dpr;
					this.livesText.addChild(this.livesText_Used);

					this.livesText_Of = new PIXI.Text('-', {font:(20*dpr)+"px lateron-Regular", fill:'#db514d'});
					this.livesText_Of.position.x=355*dpr;
					this.livesText_Of.position.y=52*dpr;
					this.livesText.addChild(this.livesText_Of);

					this.livesText_Remaining = new PIXI.Text('3', {font:(50*dpr)+"px lateron-Regular", fill:'#db514d'});
					this.livesText_Remaining.position.x=365*dpr;
					this.livesText_Remaining.position.y=42*dpr;
					this.livesText.addChild(this.livesText_Remaining);

					
					var separation = new PIXI.Text('/', {font:(70*dpr)+"px lateron-Regular", fill:'#000000'});
					separation.position.x=300*dpr;
					separation.position.y=35*dpr;
					this.settings.pixiScene.addChild(separation);

					var ref = this;


					//on life lost change out lives visuals
					function switchCopy(lives){
						ref.livesText_Used.setText((3-lives));
						ref.livesText_Remaining.setText(lives);

						ref.centerText(342, ref.livesText_Used);
						ref.centerText( 382, ref.livesText_Remaining);

						TweenMax.to(ref.livesText,0.25,{alpha:1});
					}

					$(this.element).on('life_change',function(e, data){
						var lives=parseInt(data);
						TweenMax.to(livesIcon.scale, 0.25,{bezier: {values:[{y:0,x:0}, {y:1, x:1}]}});
						TweenMax.to(ref.livesText, 0.25, {alpha:0,onComplete:switchCopy, onCompleteParams:[lives]});
					});



					//on score change event update score visuals
					function switchScoreCopy(score){
						ref.highScoreText.setText(score);
						ref.centerText(265,ref.highScoreText);
						TweenMax.to(ref.highScoreText,0.25,{alpha:1});
					}

					$(this.element).on('score_change',function(e, data){
						var score=parseInt(data);
						TweenMax.to(highScoreIcon.scale, 0.25,{bezier: {values:[{y:0,x:0}, {y:1, x:1}]}});
						TweenMax.to(ref.highScoreText, 0.25, {alpha:0,onComplete:switchScoreCopy, onCompleteParams:[score]});
						
					});
				},
				initScreen: function(){
					var ref = this;
					var dpr = this.settings.fruitFall.settings.dpr;
					//create Fruit Fall game title and show play button
					var gameName = new PIXI.Text('Fruit Fall Game', {font:(70*dpr)+"px lateron-Regular", fill:'black'});
					gameName.position.x=180*dpr;
					gameName.position.y=180*dpr;
					gameName.alpha=0;
					this.settings.pixiScene.addChild(gameName);

					this.enterHighscore();


					//create play button
					var spRes = this.settings.fruitFall.spRes();
					this.playButton = new PIXI.Sprite.fromImage('play_btn'+spRes+'.png')
					this.playButton.anchor.y=this.playButton.anchor.x=0.5;
					this.playButton.position.x = 320*dpr;
					this.playButton.position.y=350*dpr;
					this.playButton.interactive = true;
					this.playButton.buttonMode=true;
					this.playButton.alpha=0;
					
					
					this.settings.pixiScene.addChild(this.playButton);

					//ease initial graphics in and add event listeners to start game
					this.navTL = new TimelineMax();
					this.navTL.append(TweenMax.to(gameName,1,{alpha:1, delay:1, ease:Power2.easeInOut}));
					this.navTL.append(TweenMax.to(this.playButton,2,{alpha:1, delay:-2, ease:Strong.easeIn}));
					

					this.playButton.click = function(mouseData) {
						ref.settings.fruitFall.soundFX.play('pencilStrike2');

						TweenMax.to(this, 0.07,{rotation:-3/(180/Math.PI), ease:Strong.easeInOut, yoyo:true,repeat:3});
						
						var parentCoordsPosition = mouseData.getLocalPosition(ref.settings.pixiScene);
						ref.randomSwirlsAndDrips(parentCoordsPosition.x,parentCoordsPosition.y);

						ref.beginCountdown();
						ref.playButton.interactive=false;

						ref.navTL.timeScale(5);
						ref.navTL.reverse();
					};

					//create the countdown clock and 
					this.clock = new PIXI.DisplayObjectContainer();
					this.clock.position.x=125*dpr;
					this.clock.position.y=300*dpr;
					this.clock.alpha=0;
					this.settings.pixiScene.addChild(this.clock);

					this.clockHand = new PIXI.Sprite.fromImage('clock-hand'+spRes+'.png');
					this.clockHand.anchor.y=0.8;
					this.clockHand.anchor.x=0.4;
					this.clockHand.position.x=10*dpr;
					this.clockHand.position.y=4*dpr;
					this.clock.addChild(this.clockHand);


					var clockBG = new PIXI.Sprite.fromImage('clock'+spRes+'.png');
					clockBG.position.x=-((clockBG.width/2));
					clockBG.position.y=-((clockBG.height/2));
					this.clock.addChild(clockBG);
					this.clockTL = new TimelineMax();

					//create replay button graphic and event listener
					this.replayButton = new PIXI.Sprite.fromImage('replay'+spRes+'.png');
					this.replayButton.anchor.x=this.replayButton.anchor.y=0.5;
					this.replayButton.position.x=390*dpr;
					this.replayButton.position.y=250*dpr;
					this.replayButton.buttonMode=true;
					this.replayButton.interactive=true;
					this.replayButton.visible=false;
					this.replayButton.alpha=0;
					this.settings.pixiScene.addChild(this.replayButton);


					this.replayButton.click = function(mouseData) {
						ref.settings.fruitFall.soundFX.play('pencilStrike2');
						TweenMax.to(this, 0.07,{rotation:-5/(180/Math.PI), ease:Strong.easeInOut, yoyo:true,repeat:3});
						
						var parentCoordsPosition = mouseData.getLocalPosition(ref.settings.pixiScene);
						ref.randomSwirlsAndDrips(parentCoordsPosition.x,parentCoordsPosition.y);

						ref.replayButton.interactive=false;
						ref.scoreButton.interactive=false;

						ref.settings.fruitFall.restartGame();
					};

					//create high score button graphics
					this.scoreButton = new PIXI.Sprite.fromImage('highscore-btn'+spRes+'.png');
					this.scoreButton.anchor.x=this.scoreButton.anchor.y=0.5;
					this.scoreButton.position.x=250*dpr;
					this.scoreButton.position.y=250*dpr;
					this.scoreButton.buttonMode=true;
					this.scoreButton.interactive=true;
					this.scoreButton.visible=false;
					this.scoreButton.alpha=0;
					this.settings.pixiScene.addChild(this.scoreButton);

					this.scoreButton.click = this.scoreButton.touchstart = function(mouseData){
						ref.scoreSubmission.alpha=1;
						ref.scoreSubmission.visible=true;
						ref.submitBtn.interactive=true;
					}

					//end game graphic timelinemax to play and reverse based on state of gameplay
					this.endGameTL = new TimelineMax({pause:true});
					this.endGameTL.append(TweenMax.allTo([this.scoreButton, this.replayButton],0.5,{alpha:1}));
				},
				beginCountdown: function(){
					var dpr = this.settings.fruitFall.settings.dpr;
					//create count down clock before game starts
					var clock = 0;
			        var countdownId = 0;
			        var ref = this;

			        //move clock into view to begin countdown
			        this.clockTL.fromTo(this.clock,1.5,{x:-200*dpr},{alpha:1,x:300*dpr,ease:Strong.easeOut});

			        //make sure end game graphics animation reverses out
			        this.endGameTL.reverse();
			        function countdown(){
			        	//have the clock hand rotate on each second, add some swirl flourishes
			            if(clock < 3){
			                clock = clock + 1;

			                ref.settings.fruitFall.soundFX.play('clock');

			                TweenMax.to(ref.clockHand,0.5,{rotation:(clock*90)/(180/Math.PI), ease:Elastic.easeOut});
			                
			                TweenMax.to(ref.clock, 0.1,{rotation:-1/(180/Math.PI), ease:Strong.easeInOut, yoyo:true,repeat:3});

						ref.randomSwirlsAndDrips(ref.clock.position.x,ref.clock.position.y);
						ref.randomSwirlsAndDrips(ref.clock.position.x,ref.clock.position.y);


			            } else {
			                //Stop countdown and start active gameplay
			                clearInterval(countdownId);
			                ref.settings.fruitFall.beginGame();
			                
			                //reset clock and move out of view
			                TweenMax.to(ref.clockHand,1,{rotation:(0)/(180/Math.PI), delay:0.25, ease:Elastic.easeOut});
			                ref.clockTL.to(ref.clock,1,{alpha:0,x:715*dpr,ease:Strong.easeInOut});
			                TweenMax.to(ref.clock, 0.1,{rotation:-1/(180/Math.PI), ease:Strong.easeInOut, yoyo:true,repeat:3});
			            }
			        }
			        countdownId = setInterval(countdown, 1000);


				},
				gameOver: function(){
					//show end game graphics, disable/enable interactivity of pertinent buttons
					this.scoreButton.visible=true;
					this.replayButton.visible=true;
					this.replayButton.interactive=true;
					this.scoreButton.interactive=true;

					this.endGameTL.play();
				},
				centerText: function(xMid,txt){
					var dpr = this.settings.fruitFall.settings.dpr;
					//text centering
					var newX = xMid-(txt.width/2);
					txt.position.x=newX*dpr;
				},
				preloader : function(doWhat){
					//preloader graphics here
				},

		         randomSwirlsAndDrips: function(_x,_y){
		         	var dpr = this.settings.fruitFall.settings.dpr;

		         	//swirls and drips for random creation
		         	var swirls = [['swirly-one',19],['swirly-two',25],['swirly-three',16],['swirly-four',19],
		          ['drips-two',17],['drips-three',19],['drips-four',15]];

		          var randSwirl = Math.round(Math.random()*(swirls.length-1));

		          //drips anchor from top and drop down, swirls anchor from bottom and fly up
		          var anchorY=1;
		          if(swirls[randSwirl][0].indexOf('swirly')){
		          	anchorY=0;
		          }

		          var frameTotal = swirls[randSwirl][1];
		          var theSwirl = swirls[randSwirl][0];

		          var zeros='0000';
		          var swirlTextures = [];

		          for(var i=0;i<=frameTotal;i++){
		            //fix naming convention (0009,0010,0100);
		            zeros = ('0000').substring(0,4-String(i).length);

		            var texture = PIXI.Texture.fromFrame(theSwirl+zeros+i+".png");
		            swirlTextures.push(texture);
		          }

		          //swirl/drip mc
		          var animation = new PIXI.MovieClip(swirlTextures);
		          animation.anchor.x = 0.5;
		          animation.anchor.y = anchorY;

		          animation.position.x = _x*dpr;
		          animation.position.y = _y*dpr;

		          animation.scale.x=animation.scale.y = Math.random()*1;

		          animation.loop=false;

		          animation.gotoAndPlay(0);
		          this.settings.pixiScene.addChild(animation);

		          //keep checking until clip is done playing and then remove from scene
		          var removeDripOnComplete = setInterval(function(){
		          	if(!animation.playing){
		          		animation.parent.removeChild(animation);
		          		clearInterval(removeDripOnComplete);
		          		removeDripOnComplete=null;
		          	}
		          },1000/60);

		         },
		         enterHighscore:function(){
		         	var keyLimit = 8;
		         	var totalKeys='';

		         	var ref = this;
		         	var spRes = this.settings.fruitFall.spRes();
		         	var dpr = this.settings.fruitFall.settings.dpr;

		         	//container for all 10 highscores
			        this.highScoreList = new PIXI.DisplayObjectContainer();
			    	this.highScoreList.position.x=230*dpr;
			    	this.highScoreList.position.y=320*dpr;
			    	this.settings.pixiScene.addChild(this.highScoreList);


			    	//container for all highscore submission graphics
			        this.scoreSubmission = new PIXI.DisplayObjectContainer();
			        this.scoreSubmission.position.x = 190*dpr;
			        this.scoreSubmission.position.y=350*dpr;
			        this.scoreSubmission.alpha=0;
			        this.settings.pixiScene.addChild( this.scoreSubmission );

			        //create a name prompter and use tweenmax to constanly blink
			       this.namePrompter = new PIXI.Sprite.fromImage('prompter'+spRes+'.png');
			        this.namePrompter.anchor.x=0;
			        this.namePrompter.anchor.y=0.05;
			        TweenMax.to(this.namePrompter, 0.35,{alpha:0.2, ease:Power1.easeInOut, yoyo:true,repeat:-1});
			        this.scoreSubmission.addChild( this.namePrompter );

			        //add our submit button
			        this.submitBtn = new PIXI.Sprite.fromImage('submit'+spRes+'.png');
			        this.submitBtn.anchor.x=this.submitBtn.anchor.y=0.5;
			        this.submitBtn.position.x=220*dpr;
			        this.submitBtn.position.y=15*dpr;
			        this.submitBtn.interactive=false;
			        this.submitBtn.buttonMode=true;
			        this.scoreSubmission.addChild(this.submitBtn);

			        this.submitBtn.click = this.submitBtn.touchstart = function(mouseData){
			        	//add sound effect and swirls on click
						var parentCoordsPosition = mouseData.getLocalPosition(ref.settings.pixiScene);
						ref.settings.fruitFall.soundFX.play('pencilStrike2');
						TweenMax.to(this, 0.07,{rotation:-5/(180/Math.PI), ease:Strong.easeInOut, yoyo:true,repeat:3});
						ref.randomSwirlsAndDrips(parentCoordsPosition.x,parentCoordsPosition.y);

						//make sure is not interactive immediately after click
						this.interactive=false;

			        	ref.submitScore();
			        }

			        //our playername textfield for keyboard input
			        this.playerName = new PIXI.Text('', {font:(40*dpr)+'px lateron-Regular', fill:'#42914e'});
			        this.scoreSubmission.addChild(this.playerName);

			        //setup keyboard prompter position and keyboard keydown events
			        this.totalKeys=' ';
			        this.playerName.setText(this.totalKeys);
			        this.playerName.position.x=(100*dpr)-((this.playerName.width/2));
			        TweenMax.to((this.namePrompter.position),0,{x:((this.playerName.position.x)+this.playerName.width)});
			        $(document).on('keydown', this.updateReadout.bind(this));


		         },
		         updateReadout:function(){
		         	var prevString = this.playerName.text;
		         	var keysString;
		         	var keyLimit=8;//only show 8 chars on screen
		         	var dpr = this.settings.fruitFall.settings.dpr;

		         	var keys = KeyboardJS.activeKeys();
		         	//if pressed a key
		         	if(keys.length){
		         		//get the pressed key string (convert to string from array)
		         		keysString = keys.join(',');
		         		//don't want to allow spaces in our player names
		         		if(keysString.indexOf('space')<0){
		         			if(this.totalKeys.length<=keyLimit){
		         				//convert keyString back into an array to handle last key press
		         				//make sure we are getting the actual character
		         				//e.x., [Shift,s,S] << we want to get the capital S only
		         				var arr = keysString.split(',');
		         				if((arr[arr.length-1].length<=1)){
		         					this.totalKeys+=arr[arr.length-1];
		         				}
		         			}
		         			//remove last char on backspace press
		         		}else if(keysString.indexOf('backspace')>=0){
		         			this.totalKeys=this.totalKeys.substring(0,this.totalKeys.length-1);
		         		}
		         	} else {
		         		keysString = 'No key pressed';
		         	}
		         	//change data and run effects only if htere was a visual change (don't need this ctrl/shift/etc keys)
		         	if(String(prevString)!=String(this.totalKeys)){
		         		this.settings.fruitFall.soundFX.play('typewriter');
		         		this.playerName.setText(this.totalKeys);

		         		//center text position based on width
		         		this.playerName.position.x=(100*dpr)-((this.playerName.width/2));

		         		//adjust flashing text prompt to end of text
		         		TweenMax.to((this.namePrompter.position),0.15,{x:((this.playerName.position.x)+this.playerName.width)});

		         		this.randomSwirlsAndDrips(
		         			(this.namePrompter.position.x+this.scoreSubmission.position.x)*dpr,
		         			(this.namePrompter.position.y+this.scoreSubmission.position.y)*dpr);
		         	}

		         },
		         submitScore: function(){

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