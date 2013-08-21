
(function($) {
	$.fn.imageFilter = function() {

		return this.each(function() {
			var $this = $(this);
			var src = $this.attr('src');

			var match = src.match(/-thumb\.(png|jpg|gif)$/);
			if(match != null)
			{
				var url = src.replace(/-thumb/, '');

				$this.addClass('img-rounded');
				$this.wrap('<a href="' + url + '" data-lightbox="post"/>');
			}
		});
	};
})(jQuery);

$(document).ready(function() {
	$('img').imageFilter();
});
