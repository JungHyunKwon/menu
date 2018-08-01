/**
 * @author JungHyunKwon
 * @version 1.0.0
 */
try {
	'use strict';

	//제이쿼리가 있는지 확인
	if(typeof window.jQuery === 'function') {
		//$ 중첩 방지
		(function($) {
			var _register = [], //등록된 요소
				_separator = '_', //구분자
				_className = { //클래스 이름
					active : 'active', //활성화
					state : 'state', //상태
					has : 'has', //다음메뉴가 있을때
					solo : 'solo', //다음메뉴가 없을때
					open : 'open', //닫기
					prev : 'prev', //이전
					next : 'next', //다음
					cut : 'cut', //자르기
					initialized : 'menu' + _separator + 'initialized' //초기화된
				};

			//활성화의 이전
			_className.activePrev = _className.active + _separator + _className.prev;
			
			//활성화의 다음
			_className.activeNext = _className.active + _separator + _className.next;

			//활성화된
			_className.actived = _className.active + 'd';
			
			//활성화된의 이전
			_className.activedPrev = _className.actived + _separator + _className.prev;

			//활성화된의 다음
			_className.activedNext = _className.actived + _separator + _className.next;

			/**
			 * @name 콘솔오류방지
			 * @description 콘솔객체가 없을경우 에뮬레이션이 아닌 실제 인터넷 익스플로러9이하에서 콘솔로그 버그를 막을 수 있습니다. 막지 않고 콘솔을 쓸경우 모든 스크립팅은 중단 됩니다. 대체콘솔은 console.comment에 담겨있습니다.
			 * @since 2017-10-11
			 */
			if(!(window.console instanceof Object)) {
				window.console = {
					method : [
						'assert',
						'clear',
						'count',
						'debug',
						'dir',
						'dirxml',
						'error',
						'exception',
						'group',
						'groupCollapsed',
						'groupEnd',
						'info',
						'log',
						'markTimeline',
						'profile',
						'profileEnd',
						'table',
						'time',
						'timeEnd',
						'timeStamp',
						'trace',
						'warn'
					],
					comment : []
				};

				for(var i = 0, consoleMethodLength = window.console.method.length; i < consoleMethodLength; i++) {
					//함수가아닐때
					if(typeof window.console[window.console.method[i]] !== 'function') {
						window.console[window.console.method[i]] = function() {
							var result = [],
								argumentsLength = arguments.length;
                        
							//매개변수가 2개이상일때
							if(argumentsLength > 1) {
								for(var i = 0; i < argumentsLength; i++) {
									result.push(arguments[i]);
								}
							
							//매개변수가 한개일때
							}else if(argumentsLength === 1) {
								result = arguments[0];
							}
                           
							//console.comment에 기입
							if(argumentsLength) {
							    this.comment.push(result);
							}

							return result;
						};
					}
				}
			}

			/**
			 * @name 엘리먼트인지 구하기
			 * @since 2017-12-06
			 * @param {window || document || element || jQueryElement} element
			 * @return {boolean}
			 */
			function _isElement(element) {
				var result = false;

				/**
				 * @name 엘리먼트인지 구하기
				 * @since 2017-12-06
				 * @param {window || document || element} element
				 * @return {boolean}
				 */
				function isElement(element) {
					var result = false;
					
					try {
						result = document.documentElement.contains(element);
					}catch(error) {
						//console.error(error);
					}

					//window 또는 document 또는 element일때
					if(element === window || element === document) {
						result = true;						
					}

					return result;
				}

				/**
				 * @name 제이쿼리 엘리먼트인지 구하기
				 * @since 2017-12-06
				 * @param {jQueryElement || jQueryObject} element
				 * @return {boolean}
				 */
				function isJQueryElement(element) {
					var result = false;

					//제이쿼리 객체일때
					if(typeof window.jQuery === 'function' && element instanceof window.jQuery) {
						var elementLength = element.length;
						
						result = [];

						for(var i = 0; i < elementLength; i++) {
							var elementI = element[i];

							if(isElement(elementI)) {
								result.push(elementI);
							}
						}

						var resultLength = result.length;

						//제이쿼리 엘리먼트일때
						if(resultLength && elementLength === resultLength) {
							result = true;
						}
					}

					return result;
				}
				
				//window 또는 document 또는 element 또는 jQueryElement일때
				if(isElement(element) || isJQueryElement(element)) {
					result = true;
				}

				return result;
			}

			/**
			 * @name 별칭으로 시작하는 클래스 지우기
			 * @since 2017-12-06
			 * @param {element || jQueryElement} element
			 * @param {string} value
			 * @return {array || string}
			 */
			function _removePrefixClass(element, value) {
				var result = [],
					$element = $(element),
					valueLength = (typeof value === 'string') ? value.length : 0; //문자열이 아닐때 0대체
				
				for(var i = 0, elementLength = $element.length; i < elementLength; i++) {
					var $elementI = $element.eq(i),
						className = $elementI.attr('class');
					
					//클래스가 있을때
					if(className) {
						className = className.split(/\s/);

						for(var j = 0, classNameLength = className.length; j < classNameLength; j++) {
							var classNameJ = className[j];

							//클래스이름이 value값으로 시작할때
							if(classNameJ.substring(0, valueLength) === value) {
								//클래스 제거
								$elementI.removeClass(classNameJ);
								result.push(classNameJ);
							}
						}
					}
				}

				//결과가 1개일때
				if(result.length === 1) {
					result = result[0];
				}

				return result;
			}

			/**
			 * @name 등록된 요소 인덱스 구하기
			 * @since 2017-12-06
			 * @param {element || jQueryElement} element
			 * @return {array || number}
			 */
			function _getRegistIndex(element) {
				var $element = $(element),
					result = [],
					registerLength = _register.length;
				
				for(var i = 0, elementLength = $element.length; i < elementLength; i++) {
					var $elementI = $element.eq(i),
						isBreak = false;
					
					for(var j = 0, registerLength = _register.length; j < registerLength; j++) {
						var registerJ = _register[j];

						//객체일때 && 들어온 엘리먼트와 등록된 엘리먼트가 같을때
						if(registerJ instanceof Object && $elementI.is(registerJ.element)) {
							result.push(j);
							isBreak = true;
							break;
						}
					}
					
					//결과가 없을때
					if(!isBreak) {
						result.push(-1);
					}
				}
				
				//결과가 1개일때
				if(result.length === 1) {
					result = result[0];
				}

				return result;
			}

			$(function() {
				var _$body = $('body');

				/**
				 * @name menu
				 * @since 2018-02-23
				  * @param {object} option {event : string, cut : object[number || string[number-number] : number], namespace : string}
				 * @return {jQueryElement || jQueryObject}
				 */
				$.fn.menu = function(option) {
					var $thisFirst = this.first(),
						thisFirst = $thisFirst[0] || {},
						thisFirstStyle = thisFirst.style,
						registIndex = _getRegistIndex(thisFirst),
						register = _register[registIndex],
						event = $.Event('menu');

					//문자열일때
					if(typeof option === 'string') {
						//소문자 치환
						option = option.toLowerCase();

						//등록되어있을때
						if(register) {
							var registerOption = register.option;

							//파괴
							if(option === 'destroy') {
								var registerNamespace = registerOption.namespace;

								//cut 엘리먼트 삭제
								registerOption.$depthCutItem.remove();
								
								//클래스 제거
								$thisFirst.removeClass(_className.initialized);
								_$body.removeClass(registerOption.className.globalActive + ' ' + registerOption.className.globalOpen);
								_removePrefixClass($thisFirst, _className.state);
								registerOption.$depthItem.removeClass(_className.has + ' ' + _className.solo + ' ' + _className.activePrev + ' ' + _className.active + ' ' + _className.activeNext + ' ' + _className.activedPrev + ' ' + _className.actived + ' ' + _className.activedNext);

								//특성제거
								thisFirstStyle.height = '';

								//이벤트 핸들러 제거
								registerOption.$openElement.off('click.' + registerNamespace);
								registerOption.$closeElement.off('click.' + registerNamespace);
								registerOption.$depth1.off('mouseover.' + registerNamespace + ' mouseleave.' + registerNamespace);
								registerOption.$depthText.off('click.' + registerNamespace);
								registerOption.$depthAndText.off('mouseover.' + registerNamespace);
								registerOption.$depthText.off('keydown.' + registerNamespace);
								registerOption.$depthTitle2.off('mouseout.' + registerNamespace);

								//배열에서 제거
								_register.splice(registIndex, 1);
							
							//추적
							}else if(option === 'spy') {
								var element = arguments[1];

								//요소가 아닐때
								if(!_isElement(element)) {
									element = registerOption.$activedDepthText[0];
								}
								
								element = $(element).first()[0];

								//depthText에 포함된 요소일때
								if(registerOption.$depthText.is(element)) {
									registerOption.openMenu.call(element, event);
								}
							}
						}
					//적용
					}else if(_isElement(thisFirst)) {
						var menuHeight = '';

						//기존 이벤트 제거
						if(register) {
							$thisFirst.menu('destroy');
						}

						//옵션이 객체가 아닐때
						if(!(option instanceof Object)) {
							option = {};
						}

						//네임스페이스가 없거나 문자열이 아닐때
						if(!option.namespace || typeof option.namespace !== 'string') {
							option.namespace = $thisFirst.attr('id') || thisFirst.tagName.toLowerCase() + (_register.length + 1);
						}

						//컷팅이 객체가 아닐때
						if(!(option.cut instanceof Object)) {
							option.cut = {};
						}

						//이벤트가 문자열일때
						if(typeof option.event === 'string') {
							option.event = option.event.toLowerCase();
						}
						
						//이벤트가 mouse가 아니면서 click이 아닐때
						if(option.event !== 'mouse' && option.event !== 'click') {
							option.event = 'mouse';
						}

						//열기버튼
						option.$openElement = $('div[data-menu-open="' + option.namespace + '"] button[data-menu-button]');

						//닫기버튼
						option.$closeElement = $('div[data-menu-close="' + option.namespace + '"] button[data-menu-button]');

						//클래스이름 합성
						option.className = {
							globalActive : option.namespace + _separator + _className.active,
							globalOpen : option.namespace + _separator + _className.open
						};

						//유형 정의
						option.type = parseInt($thisFirst.attr('data-menu-type'), 10) || 1;
							
						//요소 정의
						option.$wildCard = $thisFirst.add($thisFirst.find('*'));
						option.$depth = $thisFirst.find('div[data-menu-depth]');
						option.$depth1 = option.$depth.filter('div[data-menu-depth="1"]');
						option.$depth1Text = option.$depth1.find('a[data-menu-text="1"], button[data-menu-text="1"]');
						option.$depthTitle1 = option.$depth1.find('div[data-menu-title="1"]');
						option.$depthTitle2 = option.$depth1.find('div[data-menu-title="2"]');
						option.$depth2 = option.$depth.filter('[data-menu-depth="2"]');
						option.$depthList = option.$depth.find('ul[data-menu-list]');
						option.$depthItem = option.$depthList.children('li');
						option.$depthText = option.$depth1.find('a[data-menu-text], button[data-menu-text]');
						option.$depthLastText = option.$depthText.last();
						option.$depthAndText = option.$depth.not('div[data-menu-depth="1"]').add(option.$depthText);
						option.$activedDepthText = option.$depth1.find('a[data-menu-text][data-menu-actived], button[data-menu-text][data-menu-actived]').last();
						option.$activedDepthItem = option.$activedDepthText.parents('li');

						//높이 캐싱
						option.$wildCard.css('transition-property', 'none');
						menuHeight = thisFirst.clientHeight;
						option.$wildCard.css('transition-property', '');

						//actived클래스 추가
						option.$activedDepthItem.prev('li').addClass(_className.activedPrev);
						option.$activedDepthItem.addClass(_className.actived);
						option.$activedDepthItem.next('li').addClass(_className.activedNext);

						//초기화 클래스 추가
						$thisFirst.addClass(_className.initialized);
						
						/**
						 * @name 메뉴목록 쿼리 얻기
						 * @since 2017-12-06
						 * @param {value} number
						 * @return {string}
						 */
						function getDepthListQuery(value) {
							var result = '';

							if(value > 0) {
								result = 'div[data-menu-depth="' + value + '"]:first-of-type ul[data-menu-list="' + value + '"]:first-of-type';
							}

							return result;
						}

						/**
						 * @name 상태 클래스 추가
						 * @since 2017-12-06
						 * @param {element || jQueryElement} element
						 * @reutn {array || string}
						 */
						function addStateClass(element) {
							var $element = $(element),
								$parentsDepthItem = $element.parents('li'),
								result = [];
							
							_removePrefixClass($thisFirst, _className.state);
							
							for(var i = 0, parentsDepthItemLength = $parentsDepthItem.length; i < parentsDepthItemLength; i++) {
								var state = _className.state + (option.$depthItem.index($parentsDepthItem[i]) + 1);

								result.push(state);
								$thisFirst.addClass(state);
							}

							//결과가 1개일때
							if(result.length === 1) {
								result = result[0];
							}

							return result;
						}

						/**
						 * @name 추적적용
						 * @since 2017-12-06
						 * @param {jQueryElement || element} element
						 * @return {jQueryElement}
						 */
						function setSpy(element) {
							//스파이 요소가 있을때
							if(option.$activedDepthText.length) {
								$thisFirst.menu('spy');
							}else{
								option.closeMenu.call(element, event);
							}

							return element;
						}

						/**
						 * @name 컷요소 거르기
						 * @since 2017-12-06
						 * @param {jQueryElement || element} element
						 * @param {string} direction
						 * @return {jQueryElement}
						 */
						function filterDepthCutItem(element, direction) {
							var $element = $(element);
							
							if(typeof direction === 'string') {
								direction = direction.toLowerCase();
							}

							for(var i = 0, elementLength = $element.length; i < elementLength; i++) {
								if(option.$depthCutItem.is($element[i])) {
									var $elementI = $element.eq(i);

									if(direction === 'prev') {
										$element[i] = $elementI.prev('li')[0];
									}else if(direction === 'next') {
										$element[i] = $elementI.next('li')[0];
									}
								}
							}

							return $($element);
						}

						//자르기
						for(var i in option.cut) {
							var number = i.split('-'),
								numberLength = number.length,
								depth = parseInt(number[0], 10),
								cut = parseInt(option.cut[i], 10),
								$depthList = $thisFirst;
							
							//1초과일때
							if(numberLength > 1) {
								for(var j = 0; j < numberLength; j++) {
									var numberJ = parseInt(number[j], 10);
									
									//0초과일때
									if(numberJ > 0) {
										var count = j + 1,
											query = getDepthListQuery(count);
										
										//마지막이 아닐때
										if(count !== numberLength) {
											query += ' > li:nth-child(' + numberJ + ')';
										}

										$depthList = $depthList.find(query);
									}else{
										$depthList.length = 0;
										break;
									}
								}
							
							//1개이면서 1초과일때
							}else if(numberLength === 1 && depth > 1) {
								$depthList = $depthList.find(getDepthListQuery(depth));
							}

							//초기화값과 같지 않으면서 자를순번이 1초과일때
							if(!$depthList.is($thisFirst) && cut > 1) {
								for(var j = 0, depthListLength = $depthList.length; j < depthListLength; j++) {
									$depthList.eq(j).children('li:nth-child(' + cut + 'n)').next('li').prev('li').after('<li class="' + _className.cut + '">&nbsp;</li>');
								}
							}
						}
						
						//컷요소 정의
						option.$depthCutItem = option.$depthList.children('li.' + _className.cut);

						//has, solo클래스 추가
						for(var i = 0, depthItemLength = option.$depthItem.length; i < depthItemLength; i++) {
							var $depthItemI = option.$depthItem.eq(i);

							//다음 메뉴가 있을때
							if($depthItemI.find('div[data-menu-depth]:first').length) {
								$depthItemI.addClass(_className.has);
							}else{
								$depthItemI.addClass(_className.solo);
							}
						}

						/**
						 * @name 메뉴 열기
						 * @since 2017-12-06
						 * @param {object} event
						 */ 
						option.openMenu = function(event) {
							var $this = $(this),
								$parentsDepthItem = $this.parents('li'),
								$parentDepthItem = $parentsDepthItem.first(),
								$parentsDepthLastItem = $parentsDepthItem.last(),
								$depth2 = $parentsDepthLastItem.find('div[data-menu-depth="2"]'),
								$parentsDepthPrevItem = filterDepthCutItem($parentsDepthItem.prev('li').get(), 'prev'),
								$parentsDepthNextItem = filterDepthCutItem($parentsDepthItem.next('li').get(), 'next');

							//마우스이벤트로 들어왔을때
							if(option.event === 'mouse') {
								//초기화
								option.closeMenu.call(this, event);

							//클릭이벤트로 들어왔을때
							}else if(option.event === 'click') {
								var $siblingsParentDepthItem = $parentsDepthItem.find('[data-menu-text]:first').filter('a, button').closest('li');

								//활성화의 이전, 활성화, 활성화의 다음 클래스 제거
								$siblingsParentDepthItem.add($siblingsParentDepthItem.siblings('li')).removeClass(_className.activePrev + ' ' + _className.active + ' ' + _className.activeNext);
							}

							//전역 활성화 클래스 추가
							_$body.addClass(option.className.globalActive);

							//활성화의 이전 클래스 추가
							$parentsDepthPrevItem.addClass(_className.activePrev);

							//활성화 클래스 추가
							$parentsDepthItem.addClass(_className.active);

							//활성화의 다음 클래스 추가
							$parentsDepthNextItem.addClass(_className.activeNext);

							//상태 클래스 추가
							addStateClass($parentsDepthLastItem.add($parentsDepthLastItem.find('div[data-menu-depth]:first-of-type ul[data-menu-list]:first > li')).filter('.' + _className.active).last().find('[data-menu-text]:first').filter('a, button')[0]);

							//풀다운1 || 풀다운2
							if(option.type === 1 || option.type === 2) {
								var $nextDepth = $parentDepthItem.find('div[data-menu-depth]:first');
								
								/**
								 * @name 2차메뉴 높이부여
								 * @since 2017-12-06
								 */ 
								function setDepth2Height() {
									var result = '';

									//풀다운1
									if(option.type === 1) {
										result = [];

										for(var i = 0, depth2Length = option.$depth2.length; i < depth2Length; i++) {
											result[i] = option.$depth2.eq(i).children().filter(function(index, element) {
												var position = $(element).css('position');

												return (position === 'static' || position === 'relative') ? true : false;
											}).first().outerHeight() || 0;
										}

										//depth2 첫번째 자손에서 outerHeight(height, padding, border)를 구해서 최대높이 구하기
										result = Math.max.apply(null, result) || '';

									//풀다운2
									}else if(option.type === 2) {
										//선택된 depthText에 depth2 첫번째 자손에서 outerHeight(height, padding, border)를 구하기
										result = $depth2.children().filter(function(index, element) {
											var position = $(element).css('position');

											return (position === 'static' || position === 'relative') ? true : false;
										}).first().outerHeight() || '';
									}

									//결과가 있을때
									if(result) {
										result += menuHeight;
										result += 'px';
									}

									thisFirstStyle.height = result;
								}
								
								//최초실행
								setDepth2Height();
								
								//다음뎁스가 있을때
								if($nextDepth.length) {
									$nextDepth.one('transitionend.' + option.namespace, function(event) {
										//활성화가 되어있을때
										if($parentDepthItem.hasClass(_className.active)) {
											setDepth2Height();
										}
									});
								}
							}

							//이벤트 전파 방지
							event.stopPropagation();
						};

						/**
						 * @name 메뉴 닫기
						 * @since 2017-12-06
						 * @param {object} event
						 */
						option.closeMenu = function(event) {
							var $this = $(this);

							//마우스이벤트로 들어왔을때
							if(option.event === 'mouse') {
								//전역 클래스 제거
								_$body.removeClass(option.className.globalActive);

								//상태 클래스 제거
								_removePrefixClass($thisFirst, _className.state);

								//height초기화
								thisFirstStyle.height = '';

								//활성화의 이전, 활성화, 활성화의 다음 클래스 제거
								option.$depthItem.removeClass(_className.activePrev + ' ' + _className.active + ' ' + _className.activeNext);
							
							//클릭이벤트로 들어왔을때
							}else if(option.event === 'click') {
								var element = this,
									$parentsDepthItem = $this.parents('li');

								//메뉴 닫기
								if($this.is(option.$depthLastText)) {
									var $parentsDepthPrevItem = filterDepthCutItem($parentsDepthItem.prev('li').get(), 'prev'),
										$parentsDepthNextItem = filterDepthCutItem($parentsDepthItem.next('li').get(), 'next');
									
									element = $parentsDepthItem.last().find('[data-menu-text="1"]').filter('a, button')[0];

									//활성화의 이전 클래스 제거
									$parentsDepthPrevItem.removeClass(_className.activePrev);

									//선택된 활성화 클래스 제거
									$parentsDepthItem.removeClass(_className.active);

									//활성화의 다음 클래스 제거
									$parentsDepthNextItem.removeClass(_className.activeNext);

									//상태 클래스 제거
									_removePrefixClass($thisFirst, _className.state);

								//다음메뉴 닫기
								}else{
									var $parentDepthItem = $parentsDepthItem.first(),
										$parentDepthPrevItem = filterDepthCutItem($parentDepthItem.prev('li')[0], 'prev'),
										$parentDepthNextItem = filterDepthCutItem($parentDepthItem.next('li')[0], 'next');

									//활성화의 이전 클래스 제거
									$parentDepthPrevItem.removeClass(_className.activePrev);

									//선택된 활성화 클래스 제거
									$parentDepthItem.removeClass(_className.active);

									//활성화의 다음 클래스 제거
									$parentDepthNextItem.removeClass(_className.activeNext);

									//상태 클래스 추가
									addStateClass($parentsDepthItem.eq(1).find('[data-menu-text]:first').filter('a, button')[0]);
								}

								//1차 메뉴를 닫을때
								if(option.$depth1Text.is(element)) {
									//전역 활성화 클래스 제거
									_$body.removeClass(option.className.globalActive);
									
									//메뉴타입이 1, 2일때
									if(option.type === 1 || option.type === 2) {
										//height 초기화
										thisFirstStyle.height = '';
									}
								}
							}

							//이벤트 전파 방지
							event.stopPropagation();
						};
						
						/**
						 * @name 메뉴 토글
						 * @since 2017-12-06
						 * @param {object} event
						 */
						option.toggleMenu = function(event) {
							var $this = $(this),
								$parentDepthItem = $this.closest('li'),
								$nextDepth = $parentDepthItem.find('div[data-menu-depth]:first'),
								$nextText = $nextDepth.find('ul[data-menu-list]:first > li a[data-menu-text]:first-of-type'),
								tagName = this.tagName.toLowerCase(),
								isActive = $parentDepthItem.hasClass(_className.active),
								href = $this.attr('href') || '',
								hasText = false;
							
							//다음 뎁스에 선택한 메뉴와 같은 콘텐츠가 있는지 확인
							for(var i = 0, nextTextLength = $nextText.length; i < nextTextLength; i++) {
								if(href === $nextText.eq(i).attr('href')) {
									hasText = true;
									break;
								}
							}
							
							//다음 뎁스가 있을때
							if($nextDepth.length) {
								//활성화되어 있을때
								if(isActive) {
									//버튼요소이거나 다음 뎁스에 선택한 메뉴와 같은 콘텐츠가 있거나 콘텐츠로 이동하지 않았을때
									if(tagName === 'button' || hasText || !window.confirm('콘텐츠로 이동하시겠습니까?')) {
										//닫기 또는 추적
										setSpy(this);

										//이벤트 기능 정지
										event.preventDefault();
									}
								}else{
									//다음 메뉴 열기
									option.openMenu.call(this, event);

									//이벤트 기능 정지
									event.preventDefault();
								}
							}
							
							//이벤트 전파 방지
							event.stopPropagation();
						};

						//mouse이벤트일때
						if(option.event === 'mouse') {
							//depthText와 depth에 마우스가 접근했을때						
							option.$depthAndText.on('mouseover.' + option.namespace, option.openMenu);
							
							//지정요소 나가면 추적
							option.$depth1.on('mouseover.' + option.namespace, function(event) {
								//메뉴가 활성화되어 있을때 && 풀다운1이면서 뎁스1일때 || 풀다운2이면서 타이틀1의 모든요소에 포함되지 않을때
								if(_$body.hasClass(option.className.globalActive) && ((option.type === 1 && $(this).is(event.target)) || (option.type === 2 && !option.$depthTitle1.add(option.$depthTitle1.find('*')).is(this)))) {
									setSpy(this);
								}
							}).on('mouseleave.' + option.namespace, function(event) {
								setSpy(this);
							});
							
							//타이틀2를 나갔을때
							option.$depthTitle2.on('mouseout.' + option.namespace, function(event) {
								//풀다운1일때
								if(option.type === 1) {
									setSpy(this);
								}								
							});

							//키보드 이벤트
							option.$depthText.on('keydown.' + option.namespace, function(event) {
								var keyCode = event.keyCode || event.which;

								//엔터키를 눌렀을때
								if(keyCode === 13) {
									option.toggleMenu.call(this, event);
								}
							});
						}else if(option.event === 'click') {
							option.$depthText.on('click.' + option.namespace, option.toggleMenu);
						}

						//메뉴 보이기
						option.$openElement.on('click.' + option.namespace, function(event) {
							//메뉴출력 클래스 토글
							_$body.toggleClass(option.className.globalOpen);
						});

						//메뉴 숨기기
						option.$closeElement.on('click.' + option.namespace, function(event) {						
							//메뉴 숨기기
							_$body.removeClass(option.className.globalOpen);
						});

						//요소 등록
						_register.push({
							element : thisFirst,
							option : option
						});

						//추적시작
						setSpy();
					}
					
					//요소반환
					return $thisFirst;
				};
			});
		})(jQuery);
	}else{
		throw '제이쿼리가 없습니다.';
	}
}catch(error) {
	console.error(error);
}