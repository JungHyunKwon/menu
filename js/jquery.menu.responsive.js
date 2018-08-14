/**
 * @name 메뉴 반응형 처리
 * @author JungHyunKwon
 * @version 1.0.0
 */
try {
	'use strict';

	(function($) {
		//제이쿼리가 함수일때
		if(typeof $ === 'function') {
			$(function() {
				var $nav = $('[data-menu-type]'),
					$navActivedText = $nav.find('[data-menu-actived]'),
					navMenuType = parseInt($nav.attr('data-menu-type'), 10) || 1,
					navOption = {
						cut : {},
						namespace : 'menu'
					};

				$(window).on('responsive.menu', function(event) {
					//wide, web, tablet, phone분기에 걸렸을때
					if($.inArray(event.state, event.setting.rangeProperty) > -1) {
						var menuEvent = 'click',
							menuType = 4;
						
						//wide 또는 web일때
						if(event.state === 'wide' || event.state === 'web') {
							menuEvent = 'mouse';
							menuType = navMenuType;
							$navActivedText.removeAttr('data-menu-actived');
						}else{
							$navActivedText.attr('data-menu-actived', '');
						}
						
						//현재 메뉴 이벤트와 분기에 따른 메뉴 이벤트가 다를때
						if(navOption.event !== menuEvent) {
							//메뉴 이벤트 변경
							navOption.event = menuEvent;

							//data-menu-type변경하고 새로운메뉴 생성 후 data-menu-type복귀
							$nav.attr('data-menu-type', menuType).menu(navOption).attr('data-menu-type', navMenuType);
						}
					}
				});
			});

			$(document).on('ready', function(event) {
				$.responsive({
					range : {
						wide : {
							horizontal : {
								from : 9999,
								to : 1201
							}
						},
						web : {
							horizontal : {
								from : 1200,
								to : 1001
							}
						},
						tablet : {
							horizontal : {
								from : 1000,
								to : 641
							}
						},
						phone : {
							horizontal : {
								from : 640,
								to : 0
							}
						}
					},
					lowIE : {
						property : 'web'
					}
				});
			});
		}else{
			throw '제이쿼리가 없습니다.';
		}
	})(window.jQuery);
}catch(error) {
	console.error(error);
}