/**
 * @author JungHyunKwon
 * @version 1.0.0
 */
try {
	'use strict';

	(function($) {
		//제이쿼리가 함수일때
		if(typeof $ === 'function') {
			var _$html = $('html'),
				_register = [], //등록된 요소
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
			 * @name 형태얻기
			 * @since 2017-12-06
			 * @param {*} value
			 * @return {string || undefined}
			 */
			function _getType(value) {
				var result;
				
				//매개변수가 있을때
				if(arguments.length) {
					//null일때
					if(value === null) {
						result = 'null';
					
					//undefined일때
					}else if(value === undefined) {
						result = 'undefined';
					}else{
						result = Object.prototype.toString.call(value).toLowerCase().replace('[object ', '').replace(']', '');
						
						//Invalid Date일때
						if(result === 'date' && isNaN(new Date(value))) {
							result = 'Invalid Date';
						
						//숫자일때
						}else if(result === 'number') {
							//NaN일때
							if(isNaN(value)) {
								result = 'NaN';
							
							//Infinity일때
							}else if(!isFinite(value)) {
								result = value.toString();
							}
						
						//콘솔일때
						}else if(result === 'console') {
							result = 'object';
						
						//요소일때
						}else if(result.indexOf('element') > -1) {
							result = 'element';
						
						//문서일때
						}else if(result.indexOf('document') > -1) {
							result = 'document';
						}
					}
				}

				return result;
			}

			/**
			 * @name 요소 확인
			 * @since 2017-12-06
			 * @param {object} options element || jQueryElement || {element : element || window || document || array || jQueryElement, isInPage : boolean, include : window || document || array, match : boolean}
			 * @return {boolean}
			 */
			function _isElement(options) {
				var hasJQuery = (typeof $ === 'function') ? true : false,
					optionsType = _getType(options),
					result = false;
				
				//요소이거나 제이쿼리 요소일때
				if(optionsType === 'element' || (hasJQuery && options instanceof $)) {
					options = {
						element : options
					};

					optionsType = 'object';
				}

				//객체 또는 요소일때
				if(optionsType === 'object') {
					var element = options.element,
						elementType = _getType(element),
						include = options.include,
						includeType = _getType(include),
						isInPage = (options.isInPage === true) ? true : false;
					
					//window 또는 document 또는 요소일때
					if(elementType === 'window' || elementType === 'document' || elementType === 'element') {
						element = [element];
						elementType = 'array';
					}

					//window 또는 document일때
					if(include === 'window' || includeType === 'document') {
						include = [include];
						includeType = 'array';
					}

					/**
					 * @name 요소검사
					 * @since 2017-12-06
					 * @param {window || document || element} element
					 * @return {boolean}
					 */
					function checkElement(element) {
						var result = false,
							elementType = _getType(element);

						//배열일때
						if(includeType === 'array') {
							for(var i = 0, includeLength = include.length; i < includeLength; i++) {
								var includeI = include[i];
								
								//window 또는 document 포함여부
								if((includeI === window || includeI === document) && element === includeI) {
									result = true;
									break;
								}
							}
						
						//요소일때
						}else if(elementType === 'element') {
							//페이지안에 존재여부를 허용했을때
							if(isInPage) {
								result = document.documentElement.contains(element);
							}else{
								result = true;
							}
						}

						return result;
					}

					//배열이거나 제이쿼리 요소일때
					if(elementType === 'array' || (hasJQuery && element instanceof $)) {
						var checkedElement = [],
							elementLength = element.length;

						for(var i = 0; i < elementLength; i++) {
							var elementI = element[i];

							//요소일때
							if(checkElement(elementI)) {
								checkedElement.push(elementI);
							}
						}

						var checkedElementLength = checkedElement.length;
						
						//결과가 있을때
						if(checkedElementLength) {
							//일치를 허용했을때
							if(options.match === true) {
								//요소갯수와 결과갯수가 같을때
								if(elementLength === checkedElementLength) {
									result = true;
								}
							}else{
								result = true;
							}
						}
					}
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
						if(_getType(registerJ) === 'object' && $elementI.is(registerJ.element)) {
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
				/**
				 * @name menu
				 * @since 2018-02-23
				 * @param {object} options {event : string, cut : object[number || string[number-number] : number], namespace : string}
				 * @return {jQueryElement || jQueryObject}
				 */
				$.fn.menu = function(options) {
					var $thisFirst = this.first(),
						thisFirst = $thisFirst[0] || {},
						thisFirstStyle = thisFirst.style,
						index = _getRegistIndex(thisFirst),
						register = _register[index],
						event = $.Event('menu');

					//문자열일때
					if(typeof options === 'string') {
						//소문자 치환
						options = options.toLowerCase();

						//등록되어있을때
						if(register) {
							var registerOption = register.options;

							//파괴
							if(options === 'destroy') {
								var registerNamespace = registerOption.namespace;

								//cut 엘리먼트 삭제
								registerOption.$depthCutItem.remove();
								
								//클래스 제거
								$thisFirst.removeClass(_className.initialized);
								_$html.removeClass(registerOption.className.globalActive + ' ' + registerOption.className.globalOpen);
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
								registerOption.$depthTitle1.off('focusin.' + registerNamespace + ' focusout.' + registerNamespace);
								registerOption.$depthTitle2.off('mouseout.' + registerNamespace);

								//배열에서 제거
								_register.splice(index, 1);
							
							//추적
							}else if(options === 'spy') {
								var element = arguments[1];

								//요소가 아닐때
								if(!_isElement(element)) {
									element = registerOption.$activedDepthLastText[0];
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
						var size = {
								width : '',
								height : ''
							},
							type = parseInt($thisFirst.attr('data-menu-type'), 10);

						//기존 이벤트 제거
						if(register) {
							$thisFirst.menu('destroy');
						}

						//옵션이 객체가 아닐때
						if(_getType(options) !== 'object') {
							options = {};
						}

						//유형 정의
						options.type = type || 1;
						
						//유형이 없을때
						if(!type) {
							$thisFirst.attr('data-menu-type', 1);
						}

						//네임스페이스가 없거나 문자열이 아닐때
						if(!options.namespace || typeof options.namespace !== 'string') {
							options.namespace = $thisFirst.attr('id') || thisFirst.tagName.toLowerCase() + (_register.length + 1);
						}

						//컷팅이 객체가 아닐때
						if(_getType(options.cut) !== 'object') {
							options.cut = {};
						}

						//이벤트가 문자열일때
						if(typeof options.event === 'string') {
							options.event = options.event.toLowerCase();
						}
						
						//이벤트가 mouse가 아니면서 click이 아닐때
						if(options.event !== 'mouse' && options.event !== 'click') {
							options.event = 'mouse';
						}
						
						//컨펌이없거나 문자가 아닐때
						if(!options.confirm || typeof options.confirm !== 'string') {
							options.confirm = '콘텐츠로 이동하시겠습니까?';
						}

						//열기버튼
						options.$openElement = $('div[data-menu-open="' + options.namespace + '"] button[data-menu-button]');

						//닫기버튼
						options.$closeElement = $('div[data-menu-close="' + options.namespace + '"] button[data-menu-button]');

						//클래스이름 합성
						options.className = {
							globalActive : options.namespace + _separator + _className.active,
							globalOpen : options.namespace + _separator + _className.open
						};

						//요소 정의
						options.$wildCard = $thisFirst.add($thisFirst.find('*'));
						options.$depth = $thisFirst.find('div[data-menu-depth]');
						options.$depth1 = options.$depth.filter('div[data-menu-depth="1"]');
						options.$depth1Text = options.$depth1.find('a[data-menu-text="1"], button[data-menu-text="1"]');
						options.$depthTitle = options.$depth1.find('div[data-menu-title]');
						options.$depthTitle1 = options.$depthTitle.filter('[data-menu-title="1"]');
						options.$depthTitle2 = options.$depthTitle.filter('[data-menu-title="2"]');
						options.$depth2 = options.$depth.filter('[data-menu-depth="2"]');
						options.$depthList = options.$depth.find('ul[data-menu-list]');
						options.$depthItem = options.$depthList.children('li');
						options.$depthText = options.$depth1.find('a[data-menu-text], button[data-menu-text]');
						options.$depthLastText = options.$depthText.last();
						options.$depthAndText = options.$depth.not('div[data-menu-depth="1"]').add(options.$depthText);
						options.$activedDepthLastText = options.$depth1.find('[data-menu-text][data-menu-actived]').filter('a, button').last();
						options.$activedDepthItem = options.$activedDepthLastText.parents('li');

						//크기 캐싱
						options.$wildCard.css('transition-property', 'none');
						size.width = $thisFirst.outerWidth() || '';
						size.height = $thisFirst.outerHeight() || '';
						options.$wildCard.css('transition-property', '');

						//actived클래스 추가
						options.$activedDepthItem.prev('li').addClass(_className.activedPrev);
						options.$activedDepthItem.addClass(_className.actived);
						options.$activedDepthItem.next('li').addClass(_className.activedNext);

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
								result = 'ul[data-menu-list="' + value + '"]';
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
								var state = _className.state + (options.$depthItem.index($parentsDepthItem[i]) + 1);

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
							var isSpy = false;

							//스파이 요소가 있을때
							if(options.$activedDepthLastText.length) {
								//클릭 이벤트일때
								if(options.event === 'click') {
									//1차메뉴 요소이면서 선택된 요소의 가장 가까운 부모인 li가 actived클래스를 가지고 있지 않을때 또는 메뉴요소일때
									if((options.$depth1Text.is(element) && !$(element).closest('li').hasClass(_className.actived)) || $thisFirst.is(element)) {
										isSpy = true;
									}
								}else{
									isSpy = true;
								}
							}
							
							//스파이 조건에 맞을때
							if(isSpy) {
								$thisFirst.menu('spy');
							}else{
								options.closeMenu.call(element, event);
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
								if(options.$depthCutItem.is($element[i])) {
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
						for(var i in options.cut) {
							var number = i.split('-'),
								numberLength = number.length,
								depth = parseInt(number[0], 10),
								cut = parseInt(options.cut[i], 10),
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
						options.$depthCutItem = options.$depthList.children('li.' + _className.cut);

						//has, solo클래스 추가
						for(var i = 0, depthItemLength = options.$depthItem.length; i < depthItemLength; i++) {
							var $depthItemI = options.$depthItem.eq(i);

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
						options.openMenu = function(event) {
							var $this = $(this),
								$parentsDepthItem = $this.parents('li'),
								$parentDepthItem = $parentsDepthItem.first(),
								$parentsDepthLastItem = $parentsDepthItem.last(),
								$depth2 = $parentsDepthLastItem.find('div[data-menu-depth="2"]'),
								$parentsDepthPrevItem = filterDepthCutItem($parentsDepthItem.prev('li').get(), 'prev'),
								$parentsDepthNextItem = filterDepthCutItem($parentsDepthItem.next('li').get(), 'next');

							//마우스이벤트로 들어왔을때
							if(options.event === 'mouse') {
								//초기화
								options.closeMenu.call(this, event);

							//클릭이벤트로 들어왔을때
							}else{
								var $siblingsParentDepthItem = $parentsDepthItem.find('[data-menu-text]:first').filter('a, button').closest('li');

								//활성화의 이전, 활성화, 활성화의 다음 클래스 제거
								$siblingsParentDepthItem.add($siblingsParentDepthItem.siblings('li')).removeClass(_className.activePrev + ' ' + _className.active + ' ' + _className.activeNext);
							}

							//전역 활성화 클래스 추가
							_$html.addClass(options.className.globalActive);

							//활성화의 이전 클래스 추가
							$parentsDepthPrevItem.addClass(_className.activePrev);

							//활성화 클래스 추가
							$parentsDepthItem.addClass(_className.active);

							//활성화의 다음 클래스 추가
							$parentsDepthNextItem.addClass(_className.activeNext);

							//상태 클래스 추가
							addStateClass($parentsDepthLastItem.add($parentsDepthLastItem.find('ul[data-menu-list] > li')).filter('.' + _className.active).last().find('[data-menu-text]:first').filter('a, button')[0]);

							//풀다운1 또는 풀다운2 또는 왼쪽메뉴일때
							if(options.type === 1 || options.type === 2) {
								var $nextDepth = $parentDepthItem.find('div[data-menu-depth]:first');
								
								/**
								 * @name 2차메뉴 크기부여
								 * @since 2017-12-06
								 */ 
								function setDepth2Size() {
									var result = '';

									//풀다운1
									if(options.type === 1) {
										result = [];

										for(var i = 0, depth2Length = options.$depth2.length; i < depth2Length; i++) {
											result[i] = options.$depth2.eq(i).children().filter(function(index, element) {
												var position = $(element).css('position');

												return (position === 'static' || position === 'relative') ? true : false;
											}).first().outerHeight() || 0;
										}

										//depth2 첫번째 자손에서 outerHeight(height, padding, border)를 구해서 최대높이 구하기
										result = Math.max.apply(null, result) || '';

									//풀다운2
									}else if(options.type === 2) {
										//선택된 depthText에 depth2 첫번째 자손에서 outerHeight(height, padding, border)를 구하기
										result = $depth2.children().filter(function(index, element) {
											var position = $(element).css('position');

											return (position === 'static' || position === 'relative') ? true : false;
										}).first().outerHeight() || '';
									}

									//결과가 있을때
									if(result) {
										result += size.height;
										result += 'px';
									}

									thisFirstStyle.height = result;
								}
								
								//최초실행
								setDepth2Size();
								
								//다음뎁스가 있을때
								if($nextDepth.length) {
									$nextDepth.one('transitionend.' + options.namespace, function(event) {
										//활성화가 되어있을때
										if($parentDepthItem.hasClass(_className.active)) {
											setDepth2Size();
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
						options.closeMenu = function(event) {
							var $this = $(this);

							//마우스이벤트로 들어왔을때
							if(options.event === 'mouse') {
								//전역 클래스 제거
								_$html.removeClass(options.className.globalActive);

								//상태 클래스 제거
								_removePrefixClass($thisFirst, _className.state);

								//풀다운1 또는 풀다운2일때
								if(options.type === 1 || options.type === 2) {
									//높이 초기화
									thisFirstStyle.height = '';
								}

								//활성화의 이전, 활성화, 활성화의 다음 클래스 제거
								options.$depthItem.removeClass(_className.activePrev + ' ' + _className.active + ' ' + _className.activeNext);
							
							//클릭이벤트로 들어왔을때
							}else{
								var element = this,
									$parentsDepthItem = $this.parents('li');

								//메뉴 닫기
								if($this.is(options.$depthLastText)) {
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
								if(options.$depth1Text.is(element)) {
									//전역 활성화 클래스 제거
									_$html.removeClass(options.className.globalActive);
									
									//풀다운1 또는 풀다운2일때
									if(options.type === 1 || options.type === 2) {
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
						options.toggleMenu = function(event) {
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
							
							//다음 뎁스가 있으면서 display가 none일때
							if($nextDepth.length && $nextDepth.css('display') !== 'none') {
								//활성화되어 있을때
								if(isActive) {
									//버튼요소이거나 다음 뎁스에 선택한 메뉴와 같은 콘텐츠가 있거나 콘텐츠로 이동하지 않았을때
									if(tagName === 'button' || hasText || !window.confirm(options.confirm)) {
										//닫기 또는 추적
										setSpy(this);

										//이벤트 기능 정지
										event.preventDefault();
									}
								}else{
									//다음 메뉴 열기
									options.openMenu.call(this, event);

									//이벤트 기능 정지
									event.preventDefault();
								}
							}
							
							//이벤트 전파 방지
							event.stopPropagation();
						};

						//마우스 이벤트일때
						if(options.event === 'mouse') {
							//depthText와 depth에 마우스가 접근했을때						
							options.$depthAndText.on('mouseover.' + options.namespace, options.openMenu);
							
							//지정요소 나가면 추적
							options.$depth1.on('mouseover.' + options.namespace, function(event) {
								//메뉴가 활성화되어 있을때 && 풀다운1이면서 뎁스1일때 || 풀다운2이면서 타이틀1의 모든요소에 포함되지 않을때
								if(_$html.hasClass(options.className.globalActive) && ((options.type === 1 && $(this).is(event.target)) || (options.type === 2 && !options.$depthTitle1.add(options.$depthTitle1.find('*')).is(event.target)))) {
									setSpy(this);
								}
							}).on('mouseleave.' + options.namespace, function(event) {
								setSpy(this);
							});
							
							//타이틀1을 접근했을때, 빠져나갔을때
							options.$depthTitle1.on('focusin.' + options.namespace, function(event) {
								//풀다운1일때
								if(options.type === 1) {
									options.openMenu.call(this, event);
								}
							}).on('focusout.' + options.namespace, function(event) {
								//풀다운1일때
								if(options.type === 1) {
									setSpy(this);
								}
							});

							//타이틀2를 나갔을때
							options.$depthTitle2.on('mouseout.' + options.namespace, function(event) {
								//풀다운1일때
								if(options.type === 1) {
									setSpy(this);
								}								
							});

							//키보드 이벤트
							options.$depthText.on('keydown.' + options.namespace, function(event) {
								var keyCode = event.keyCode || event.which;

								//엔터키를 눌렀을때
								if(keyCode === 13) {
									options.toggleMenu.call(this, event);
								}
							});
						//클릭 이벤트일때
						}else{
							options.$depthText.on('click.' + options.namespace, options.toggleMenu);
						}

						//메뉴 보이기
						options.$openElement.on('click.' + options.namespace, function(event) {
							//메뉴출력 클래스 토글
							_$html.toggleClass(options.className.globalOpen);
						});

						//메뉴 숨기기
						options.$closeElement.on('click.' + options.namespace, function(event) {						
							//메뉴 숨기기
							_$html.removeClass(options.className.globalOpen);
						});

						//요소 등록
						_register.push({
							element : thisFirst,
							options : options
						});

						//추적시작
						setSpy(thisFirst);
					}
					
					//요소반환
					return $thisFirst;
				};
			});
		}else{
			throw '제이쿼리가 없습니다.';
		}
	})(window.jQuery);
}catch(error) {
	console.error(error);
}