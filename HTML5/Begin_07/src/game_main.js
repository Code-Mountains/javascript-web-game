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
            this.aFunction();
         },
         aFunction:function(){
            console.log('hello world');
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


