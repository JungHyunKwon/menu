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
			var _$window = $(window),
				_$document = $(document),
				_consoleType = _getTypeof(window.console),
				_register = [], //등록된 요소
				_separator = '_', //구분자
				_className = { //클래스 이름
					active : 'active', //활성화
					state : 'state', //상태
					has : 'has', //다음메뉴가 있을때
					solo : 'solo', //다음메뉴가 없을때
					rule : 'rule', //nth-child 대체
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
			 * @since 2017-12-18
			 * @param {*} value
			 * @return {string}
			 */
			function _getTypeof(value) {
				var result = 'none';
				
				//매개변수가 있을때
				if(arguments.length) {
					result = Object.prototype.toString.call(value).toLowerCase().replace('[object ', '').replace(']', '');

					//undefined일때(ie7, ie8에서 찾지 못함)
					if(value === undefined) {
						result = 'undefined';
					
					//NaN일때(숫자로 처리되서 따로 처리함)
					}else if(result === 'number' && isNaN(value)) {
						result = 'NaN';
					
					//Infinity일때(숫자로 처리되서 따로 처리함)
					}else if(result === 'number' && !isFinite(value)) {
						result = value.toString();

					//window일때
					}else if(value === window) {
						result = 'window';

					//document일때
					}else if(value === document) {
						result = 'document';

					//엘리먼트일때
					}else if(value.tagName) {
						result = 'element';

					//제이쿼리 객체일때
					}else if(typeof window.jQuery === 'function' && value instanceof window.jQuery) {
						var valueLength = value.length,
							i = 0;

						result = [];

						for(; i < valueLength; i++) {
							var valueI = value[i],
								elementType = _getTypeof(valueI);

							if(elementType === 'window' || elementType === 'document' || elementType === 'element') {
								result.push(valueI);
							}
						}
						
						var resultLength = result.length;

						//제이쿼리 엘리먼트일때
						if(resultLength && valueLength === resultLength) {
							result = 'jQueryElement';
						}else{
							result = 'jQueryObject';
						}

					//Invalid Date일때(date로 처리되서 따로 처리함)
					}else if(result === 'date' && isNaN(new Date(value))) {
						result = 'Invalid Date';
					
					//class일때
					}else if(result === 'function' && /^class\s/.test(value.toString())) {
						result = 'class';
					}
				}

				return result;
			}

			/**
			 * @name 콘솔오류방지
			 * @description 콘솔객체가 없을경우 에뮬레이션이 아닌 실제 인터넷 익스플로러9이하에서 콘솔로그 버그를 막을 수 있습니다. 막지 않고 콘솔을 쓸경우 모든 스크립팅은 중단 됩니다. 대체콘솔은 console.comment에 담겨있습니다.
			 * @since 2017-10-11
			 */
			if(_consoleType !== 'object' && _consoleType !== 'console') {
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
					if(_getTypeof(window.console[window.console.method[i]]) !== 'function') {
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
			 * @name 문자열 공백 제거
			 * @since 2017-12-06
			 * @param {string} value
			 * @return {string}
			 */
			function _removeBlank(value) {
				return (typeof value === 'string') ? value.replace(/\s/g, '') : value;
			}

			$(function() {
				var _$body = $('body');

				/**
				 * @name 엘리먼트 인지 구하기
				 * @since 2017-12-06
				 * @param {window || document || element || jQueryElement} element
				 * @return {boolean}
				 */
				function _isElement(element) {
					var elementType = _getTypeof(element),
						result = false;

					if(elementType === 'window' || elementType === 'document' || elementType === 'element' || elementType === 'jQueryElement') {
						result = true;						
					}

					return result;
				}

				/**
				 * @name 높이 구하기
				 * @since 2017-12-06
				 * @param {jQueryElement || element} element
				 * @return {array || number || string}
				 */
				function _getOuterHeight(element) {
					var $element = $(element),
						result = [],
						cssText = 'display:block; visibility:hidden !important; position:absolute; top:-9999px; left:-9999px; z-index:-1; height:auto; min-height:0; max-height:none; animation-name:none; transition-property:none;';
				
					//받은요소만큼 반복
					for(var i = 0, elementLength = $element.length; i < elementLength; i++) {
						var $elementI = $element.eq(i),
							elementI = $elementI[0],
							cloneHeight = '';
							
						//요소일때
						if(_isElement(elementI)) {
							var clone = elementI.cloneNode(true);

							//css기입
							clone.style.cssText = cssText + ' width:' + $elementI.width() + 'px;';

							//clone생성
							$elementI.after(clone);

							//높이얻기
							cloneHeight = $(clone).outerHeight(true);

							//clone제거
							clone.parentNode.removeChild(clone);
						}

						result[i] = cloneHeight;
					}
					
					//결과가 1개일때
					if(result.length === 1) {
						result = result[0];
					
					//결과가 없을때
					}else if(!result.length) {
						result = '';
					}

					return result;
				}

				/**
				 * @name 별칭으로 시작하는 클래스 지우기
				 * @since 2017-12-06
				 * @param {element || jQueryElement} element
				 * @param {string} startName
				 * @return {array || string || jQueryElement || jQueryObject}
				 */
				function _removePrefixClass(element, startName) {
					var $element = $(element),
						startNameLength = (typeof startName === 'string') ? startName.length : 0, //문자열이 아닐때 0대체
						result = [];
					
					for(var i = 0, elementLength = $element.length; i < elementLength; i++) {
						var $elementI = $element.eq(i),
							className = $elementI.attr('class');
						
						//클래스가 있을때
						if(className) {
							className = className.split(/\s/);

							for(var j = 0, classNameLength = className.length; j < classNameLength; j++) {
								var classNameJ = className[j];

								//클래스이름이 startName값으로 시작할때
								if(classNameJ.substring(0, startNameLength) === startName) {
									//클래스 제거
									$elementI.removeClass(classNameJ);

									//결과 기입
									result.push(classNameJ);
								}
							}
						}
					}

					//결과가 1개일때
					if(result.length === 1) {
						result = result[0];
					
					//결과가 없을때
					}else if(!result.length) {
						result = $element;
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
							if(_getTypeof(registerJ) === 'object' && $elementI.is(registerJ.element)) {
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

				/**
				 * @name menu
				 * @since 2018-02-23
				 * @param {object} option({event : string, cut : object(number : number), namespace : string, openElement : element, closeElement : element})
				 * @param {jQueryElement || element} element
				 * @return {jQueryElement || jQueryObject}
				 */
				$.fn.menu = function(option, element) {
					var $thisFirst = this.first(),
						thisFirst = $thisFirst[0],
						optionType = _getTypeof(option),
						registIndex = _getRegistIndex(thisFirst),
						register = _register[registIndex],
						event = $.Event('menu');

					//문자열일때
					if(optionType === 'string') {
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
								_removePrefixClass(registerOption.$depthItem, _className.rule);
								_$body.removeClass(registerOption.className.globalActive + ' ' + registerOption.className.globalOpen);
								_removePrefixClass($thisFirst, _className.state);
								registerOption.$depthItem.removeClass(_className.has + ' ' + _className.solo + ' ' + _className.activePrev + ' ' + _className.active + ' ' + _className.activeNext + ' ' + _className.activedPrev + ' ' + _className.actived + ' ' + _className.activedNext);

								//특성제거
								registerOption.$depth.css('max-height', '');
								registerOption.$depth1Title.css('max-height', '');
								$thisFirst.css('padding-bottom', '');

								//이벤트 핸들러 제거
								_$window.off('resize.' + registerNamespace);
								_$document.off('keydown.' + registerNamespace);
								registerOption.$openElement.off('click.' + registerNamespace + ' focusin.' + registerNamespace);
								registerOption.$closeElement.off('click.' + registerNamespace + ' focusout.' + registerNamespace);
								$thisFirst.off('mouseover.' + registerNamespace + ' mouseleave.' + registerNamespace);
								registerOption.$depthText.off('focusin.' + registerNamespace + ' focusout.' + registerNamespace + ' click.' + registerNamespace);
								registerOption.$depthAndText.off('mouseover.' + registerNamespace);
								
								//배열에서 제거
								_register.splice(registIndex, 1);
							
							//추적
							}else if(option === 'spy') {
								//요소가 아닐때
								if(!_isElement(element)) {
									element = registerOption.$activedDepthText[0];
								}

								var $element = $(element),
									depthTextLength = registerOption.$depthText.length;

								for(var i = 0, elementLength = $element.length; i < elementLength; i++) {
									var hasDepthText = false,
										elementI = $element[i];
									
									for(var j = 0, depthTextLength = registerOption.$depthText.length; j < depthTextLength; j++) {
										//depthText에 포함된 요소일때
										if(registerOption.$depthText.eq(j).is(elementI)) {
											hasDepthText = true;
										}
									}
									
									//depthText가 있을때
									if(hasDepthText) {
										registerOption.openMenu.call(elementI, event);
									}
								}
							}
						}
					//적용
					}else if(_getTypeof($thisFirst) === 'jQueryElement') {
						//기존 이벤트 제거
						if(register) {
							$thisFirst.menu('destroy');
						}

						//옵션이 객체가 아닐때
						if(optionType !== 'object') {
							option = {};
						}

						//네임스페이스 공백제거
						option.namespace = _removeBlank(option.namespace);

						//네임스페이스가 문자열이 아니거나 공백일때
						if(typeof option.namespace !== 'string' || option.namespace === '') {
							option.namespace = $thisFirst.attr('id') || ($thisFirst.attr('class') || '').split(/\s/)[0] || thisFirst.tagName.toLowercase() + (_register.length + 1);
						}

						//컷팅이 객체가 아닐때
						if(_getTypeof(option.cut) !== 'object') {
							option.cut = {};
						}

						//이벤트가 문자열일때
						if(typeof option.event === 'string') {
							option.event = option.event.toLowerCase();
						}
						
						//이벤트가 mouse가 아니면서 click이 아닐때
						if(option.event !== 'mouse' && option.event !== 'click') {
							option.event = 'click';
						}

						//열기버튼 제이쿼리 엘리먼트로 변환
						option.$openElement = $(option.openElement);
						
						//열기버튼이 없을때
						if(!option.$openElement.length) {
							option.$openElement = $('div[data-menu-open="' + option.namespace + '"] [data-menu-button]');
						}

						//닫기버튼 제이쿼리 엘리먼트로 변환
						option.$closeElement = $(option.closeElement);
						
						//닫기버튼이 없을때
						if(!option.$closeElement.length) {
							option.$closeElement = $('div[data-menu-close="' + option.namespace + '"] [data-menu-button]');
						}

						//타이머 간격
						option.interval = 250;

						//클래스이름 합성
						option.className = {
							globalActive : option.namespace + _separator + _className.active,
							globalOpen : option.namespace + _separator + _className.open
						};

						//유형 정의
						option.type = parseInt($thisFirst.attr('data-menu-type'), 10);
						
						//속성이 없거나 NaN일때
						if(!option.type || _getTypeof(option.type) === 'NaN') {
							option.type = 1;
						}
							
						//요소 정의
						option.$depth = $thisFirst.find('div[data-menu-depth]');
						option.$depth1 = option.$depth.filter('div[data-menu-depth="1"]');
						option.$depth1Title = option.$depth1.find('div[data-menu-title="1"]');
						option.$depth1List = option.$depth1.find('ul[data-menu-list="1"]');
						option.$depth1Item = option.$depth1List.children('li');
						option.$depth1Text = option.$depth1Item.find('a[data-menu-text="1"], button[data-menu-text="1"]');
						option.$depth2 = option.$depth.filter('[data-menu-depth="2"]');
						option.$depthList = option.$depth.find('ul[data-menu-list]');
						option.$depthItem = option.$depthList.children('li');
						option.$depthText = option.$depth1.find('a[data-menu-text], button[data-menu-text]');
						option.$depthLastText = option.$depthText.last();
						option.$depthAndText = option.$depth.not('div[data-menu-depth="1"]').add(option.$depthText);
						option.$activedDepthText = option.$depth1.find('a[data-menu-text][data-menu-actived], button[data-menu-text][data-menu-actived]').last();
						option.$activedDepthItem = option.$activedDepthText.parents('li');

						//actived클래스 추가
						option.$activedDepthItem.prev('li').addClass(_className.activedPrev);
						option.$activedDepthItem.addClass(_className.actived);
						option.$activedDepthItem.next('li').addClass(_className.activedNext);

						//초기화 클래스 추가
						$thisFirst.addClass(_className.initialized);

						//자르기
						for(var i in option.cut) {
							var cutI = option.cut[i];

							i = parseInt(i, 10);

							if(_getTypeof(i) === 'number' && _getTypeof(cutI) === 'number' && cutI > 1) {
								$thisFirst.find('div[data-menu-depth="' + i + '"]:first-of-type ul[data-menu-list]:first > li:nth-child(' + cutI + 'n)').next('li').prev('li').after('<li class="' + _className.cut + '">&nbsp;</li>');
							}
						}
						
						//요소 정의
						option.$depthCutItem = option.$depthList.children('li.' + _className.cut);

						//rule, has, solo클래스 추가
						for(var i = 0, depthListLength = option.$depthList.length; i < depthListLength; i++) {
							var $depthListI = option.$depthList.eq(i),
								$depthItemI = $depthListI.children('li');

							for(var j = 0, depthItemILength = $depthItemI.length; j < depthItemILength; j++) {
								var $depthItemJ = $depthItemI.eq(j);
								
								$depthItemJ.addClass(_className.rule + (j + 1));
								
								//다음 메뉴가 있을때
								if($depthItemJ.find('div[data-menu-depth]:first').length) {
									$depthItemJ.addClass(_className.has);
								}else{
									$depthItemJ.addClass(_className.solo);
								}
							}
						}

						/**
						 * @name 높이반영
						 * @param {object} opt({element : element || jQueryElement, nextDepth : boolean, parentsDepth : boolean})
						 * @since 2017-12-06
						 */
						option.setHeight = function(opt) {
							//객체가 아닐때
							if(_getTypeof(opt) !== 'object') {
								option = {};
							}
							
							//불린이 아닐때
							if(typeof opt.nextDepth !== 'boolean') {
								opt.nextDepth = false;
							}
							
							//불린이 아닐때
							if(typeof opt.parentsDepth !== 'boolean') {
								opt.parentsDepth = false;
							}

							//제이쿼리로 변환
							opt.$element = $(opt.element);

							//제이쿼리 엘리먼트가 존재할때 && setSpy가 잘못들어오지않았을때
							if(_isElement(opt.element) && _getTypeof(opt.element) !== 'window') {
								//활성화 되었는지, 열려있진 않은지 확인하는 변수
								opt.isActive = true;
								opt.isOpen = true;
								
								//활성화 되지 않았을때
								if(!_$body.hasClass(option.className.globalActive)) {
									_$body.addClass(option.className.globalActive);
									opt.isActive = false;
								}
								
								//열려있지 않았을때
								if(!_$body.hasClass(option.className.globalOpen)) {
									_$body.addClass(option.className.globalOpen);
									opt.isOpen = false;
								}

								opt.$parentsDepthItem = opt.$element.parents('li');

								//선택된 메뉴 높이 조정
								if(opt.nextDepth) {
									opt.$nextDepth = opt.$parentsDepthItem.first().find('div[data-menu-depth]:first');

									//다음 차수메뉴의 outerHeight(height, padding)를 구해서 적용
									opt.$nextDepth.css('max-height', _getOuterHeight(opt.$nextDepth[0]));
								}

								//선택된 depthText의 부모 메뉴 높이 조정
								if(opt.parentsDepth) {
									opt.$parentsDepth = opt.$element.parents('div[data-menu-depth]:not([data-menu-depth="1"])');

									for(var i = 0, parentDepthLength = opt.$parentsDepth.length; i < parentDepthLength; i++) {
										var parentDepthI = opt.$parentsDepth[i];

										//부모 차수메뉴의 outerHeight(height, padding)를 구해서 적용
										parentDepthI.style.maxHeight = _getOuterHeight(parentDepthI) + 'px';
									}
								}
								
								opt.$depth2 = opt.$parentsDepthItem.find('div[data-menu-depth="2"]');

								//풀다운
								if(option.type === 1) {
									//depth2중에서 outerHeight(height, padding)를 구해서 최대높이 구하기
									opt.depth2Height = Math.max.apply(null, _getOuterHeight(option.$depth2.get()));
									
									//depth1Title에 max-height부여
									option.$depth1Title.css('max-height', opt.depth2Height);

								//풀다운2, 드롭다운1
								}else if((option.type === 2 || option.type === 3) && opt.$depth2.length) {
									//선택된 depthText에 depth2에서 outerHeight(height, padding)를 구하기
									opt.depth2Height = _getOuterHeight(opt.$depth2[0]);
								}
								
								//풀다운 메뉴에 모든 2차메뉴에 적용
								if(option.type === 1 || option.type === 2) {
									option.$depth2.css('max-height', opt.depth2Height);
								
								//드롭다운1 메뉴에 선택된 2차메뉴에 적용
								}else if(option.type === 3) {
									opt.$depth2.css('max-height', opt.depth2Height);
								}

								//풀다운, 드롭다운1 메뉴에 padding-bottom적용
								if(option.type === 1 || option.type === 2 || option.type === 3) {
									thisFirst.style.paddingBottom = opt.depth2Height + 'px';
								}
								
								//활성화되지 않았을때
								if(!opt.isActive) {
									_$body.removeClass(option.className.globalActive);
								}

								//열려있지 않았을때
								if(!opt.isOpen) {
									_$body.removeClass(option.className.globalOpen);
								}
							}

							return opt.$element;
						};

						/**
						 * @name 상태 클래스 추가
						 * @since 2017-12-06
						 * @param {element || jQueryElement} element
						 */
						option.addStateClass = function(element) {
							var $element = $(element),
								$parentsDepthItem = $element.parents('li');
							
							_removePrefixClass($thisFirst, _className.state);
							
							for(var i = 0, parentsDepthItemLength = $parentsDepthItem.length; i < parentsDepthItemLength; i++) {
								$thisFirst.addClass(_className.state + (option.$depthItem.index($parentsDepthItem[i]) + 1));
							}
						};

						/**
						 * @name 추적적용
						 * @since 2017-12-06
						 * @param {jQueryElement || element} element
						 */
						option.setSpy = function(element) {
							//spy요소가 있을때
							if(option.$activedDepthText.length) {
								$thisFirst.menu('spy');
							}else{
								option.closeMenu.call(element, event);
							}
						};

						/**
						 * @name 메뉴 열기
						 * @since 2017-12-06
						 * @param {object} event
						 */ 
						option.openMenu = function(event) {
							var $this = $(this),
								$parentsDepthItem = $this.parents('li'),
								$parentsDepthLastItem = $parentsDepthItem.last(),
								$depthPrevItem = $parentsDepthItem.prev('li'),
								$depthNextItem = $parentsDepthItem.next('li');

							//이전 아이템이 cut아이템일때
							if(option.$depthCutItem.is($depthPrevItem)) {
								$depthPrevItem = $depthPrevItem.prev('li');
							}
							
							//다음 아이템이 cut아이템일때
							if(option.$depthCutItem.is($depthNextItem)) {
								$depthNextItem = $depthNextItem.next('li');
							}

							//mouse이벤트일때
							if(option.event === 'mouse' && event.type !== 'focusin') {
								//초기화
								option.closeMenu.call(this, event);
							}else if(option.event === 'click') {
								var $siblingsParentDepthItem = $parentsDepthItem.find('[data-menu-text]:first').filter('a, button').closest('li'),
									$siblingsDepthItem = $siblingsParentDepthItem.siblings('li');

								//활성화의 이전, 활성화, 활성화의 다음 클래스 제거
								$siblingsParentDepthItem.add($siblingsDepthItem).removeClass(_className.activePrev + ' ' + _className.active + ' ' + _className.activeNext);

								//메뉴 닫기
								$siblingsDepthItem.find('div[data-menu-depth]:first').css('max-height', '');
							}

							//전역 활성화 클래스 추가
							_$body.addClass(option.className.globalActive);

							//활성화의 이전 클래스 추가
							$depthPrevItem.addClass(_className.activePrev);

							//활성화 클래스 추가
							$parentsDepthItem.addClass(_className.active);

							//활성화의 다음 클래스 추가
							$depthNextItem.addClass(_className.activeNext);

							//상태 클래스 추가
							option.addStateClass($parentsDepthLastItem.add($parentsDepthLastItem.find('div[data-menu-depth]:first-of-type ul[data-menu-list]:first > li')).filter('.' + _className.active).last().find('[data-menu-text]:first').filter('a, button')[0]);

							//높이 조정
							option.setHeight({
								element : this,
								nextDepth : true,
								parentsDepth : true
							});

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

							//mouse이벤트일때
							if(option.event === 'mouse') {
								//전역 클래스 제거
								_$body.removeClass(option.className.globalActive);

								//상태 클래스 제거
								_removePrefixClass($thisFirst, _className.state);

								//max-height, padding-bottom초기화
								option.$depth.css('max-height', '');
								option.$depth1Title.css('max-height', '');
								thisFirst.style.paddingBottom = '';

								//활성화의 이전, 활성화, 활성화의 다음 클래스 제거
								option.$depthItem.removeClass(_className.activePrev + ' ' + _className.active + ' ' + _className.activeNext);
							}else{
								var element = this,
									$parentsDepthItem = $this.parents('li'),
									$secondParentDepthItem = $parentsDepthItem.eq(1);

								//부모메뉴 닫기
								if($this.is(option.$depthLastText)) {
									var $secondParentDepthPrevItem = $secondParentDepthItem.prev('li'),
										$secondParentDepthNextItem = $secondParentDepthItem.next('li');

									element = $parentsDepthItem.eq(2).find('[data-menu-text]:first').filter('a, button')[0];

									//이전 아이템이 cut아이템일때
									if(option.$depthCutItem.is($secondParentDepthPrevItem)) {
										$secondParentDepthPrevItem = $secondParentDepthPrevItem.prev('li');
									}
									
									//다음 아이템이 cut아이템일때
									if(option.$depthCutItem.is($secondParentDepthNextItem)) {
										$secondParentDepthNextItem = $secondParentDepthNextItem.next('li');
									}

									//활성화의 이전 클래스 제거
									$secondParentDepthPrevItem.removeClass(_className.activePrev);

									//선택된 활성화 클래스 제거
									$secondParentDepthItem.removeClass(_className.active);

									//활성화의 다음 클래스 제거
									$secondParentDepthNextItem.removeClass(_className.activeNext);

									//상태 클래스 추가
									option.addStateClass(element);

									//메뉴 닫기
									$parentsDepthItem.first().closest('div[data-menu-depth]').css('max-height', '');

								//다음메뉴 닫기
								}else{
									var $parentDepthItem = $parentsDepthItem.first(),
										$depthPrevItem = $parentDepthItem.prev('li'),
										$depthNextItem = $parentDepthItem.next('li');

									//이전 아이템이 cut아이템일때
									if(option.$depthCutItem.is($depthPrevItem)) {
										$depthPrevItem = $depthPrevItem.prev('li');
									}
									
									//다음 아이템이 cut아이템일때
									if(option.$depthCutItem.is($depthNextItem)) {
										$depthNextItem = $depthNextItem.next('li');
									}

									//활성화의 이전 클래스 제거
									$depthPrevItem.removeClass(_className.activePrev);

									//선택된 활성화 클래스 제거
									$parentDepthItem.removeClass(_className.active);

									//활성화의 다음 클래스 제거
									$depthNextItem.removeClass(_className.activeNext);

									//상태 클래스 추가
									option.addStateClass($secondParentDepthItem.find('[data-menu-text]:first').filter('a, button')[0]);

									//다음 메뉴 닫기
									$parentDepthItem.find('div[data-menu-depth]:first').css('max-height', '');
								}

								//높이 재조정
								option.setHeight({
									element : element,
									nextDepth : false,
									parentsDepth : true
								});

								//1차 메뉴를 닫을때
								if(option.$depth1Text.is(element)) {
									//전역 활성화 클래스 제거
									_$body.removeClass(option.className.globalActive);
									
									//메뉴타입이 1, 2, 3일때
									if(option.type === 1 || option.type === 2 || option.type === 3) {
										//padding-bottom 초기화
										thisFirst.style.paddingBottom = '';

										//max-height 초기화
										option.$depth1Title.css('max-height', '');
										option.$depth2.css('max-height', '');
									}
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
							$thisFirst.on('mouseover.' + option.namespace, function(event) {
								//메뉴가 활성화되어 있을때
								if(_$body.hasClass(option.className.globalActive)) {
									option.openMenu.call(this, event);
								}
							}).on('mouseleave.' + option.namespace, function(event) {
								option.setSpy(this);
							});
						}else{
							//transition-duration 전역변수
							option.time = 0;

							option.$depthText.on('click.' + option.namespace, function(event) {
								var $this = $(this),
									$parentDepthItem = $this.closest('li'),
									$nextDepth = $parentDepthItem.find('div[data-menu-depth]:first'),
									time = new Date().getTime(),
									nextDepthTransitionDuration = $nextDepth.css('transition-duration');

								//문자열일때
								if(typeof nextDepthTransitionDuration === 'string') {
									//second일때
									if(nextDepthTransitionDuration.substr(-1) !== 'ms') {
										nextDepthTransitionDuration= parseFloat(nextDepthTransitionDuration, 10) * 1000;
									
									//millisecond일때
									}else{
										nextDepthTransitionDuration = parseFloat(nextDepthTransitionDuration, 10);
									}
									
									//NaN일때
									if(_getTypeof(nextDepthTransitionDuration) === 'NaN') {
										nextDepthTransitionDuration = 0;
									}
								}else{
									nextDepthTransitionDuration = 0;
								}

								//다음 메뉴의 transition-duration을 구해 그 시간이 지난후에 실행
								if((time - option.time) >= nextDepthTransitionDuration) {
									var tagName = this.tagName.toLowerCase(),
										isActive = $parentDepthItem.hasClass(_className.active);

									option.time = time;

									//(선택된 태그의 주소와 다음 메뉴의 첫번째 a태그의 주소와 같을때 || 선택된 태그가 button태그일때) && 활성화 상태일때
									if(((tagName === 'a' && $this.attr('href') === $nextDepth.find('ul[data-menu-list]:first > li:first-child a[data-menu-text]:first').attr('href')) || tagName === 'button') && isActive) {
										//닫기 또는 추적
										option.setSpy(this);
										
										//이벤트 기능 정지
										event.preventDefault();
									//다음 메뉴가 있을때 && 활성화 상태가 아닐때
									}else if($nextDepth.length && !isActive) {
										//다음 메뉴 열기
										option.openMenu.call(this, event);

										//이벤트 기능 정지
										event.preventDefault();
									}
								}else{
									//이벤트 기능 정지
									event.preventDefault();
								}
							});
						}

						//메뉴 보이기
						option.$openElement.on('click.' + option.namespace, function(event) {
							//메뉴출력 클래스 토글
							_$body.toggleClass(option.className.globalOpen);

							//이벤트 제거
							event.preventDefault();
						}).on('focusin.' + option.namespace, function(event) {
							//메뉴 숨기기
							_$body.removeClass(option.className.globalOpen);
						});

						//메뉴 숨기기
						option.$closeElement.on('click.' + option.namespace + ' focusout.' + option.namespace, function(event) {						
							//메뉴 숨기기
							_$body.removeClass(option.className.globalOpen);

							//포커스 복귀
							option.$openElement.focus();

							//이벤트 중단
							if(event.type === 'click') {
								event.preventDefault();
							}
						});

						//depthText에 포커스가 갔을때 && 클릭했을때
						option.$depthText.on('focusin.' + option.namespace, function(event) {
							//메뉴 열기
							if(option.isPressTabKey) {
								option.openMenu.call(this, event);
							}
						}).on('focusout.' + option.namespace, function(event) {
							//메뉴 닫기
							if(option.isPressTabKey) {
								option.setSpy(this);
							}
						});

						//키보드 이벤트
						_$document.on('keydown.' + option.namespace, function(event) {
							var keyCode = event.keyCode || event.which;

							//tab키를 눌렀을때
							if(keyCode === 9) {
								option.isPressTabKey = true;
							}
							
							//타이머가 존재하면
							if(option.keydownTimer) {
								clearTimeout(option.keydownTimer);
								option.keydownTimer = 0;
							}
							
							//0.25초마다 타이머 실행
							option.keydownTimer = setTimeout(function() {
								option.isPressTabKey = false;
							}, option.interval);
						});
						
						//리사이즈 이벤트
						_$window.on('resize.' + option.namespace, function(event) {
							//타이머가 존재하면
							if(option.resizeTimer) {
								clearTimeout(option.resizeTimer);
								option.resizeTimer = 0;
							}
							
							//0.25초마다 타이머 실행
							option.resizeTimer = setTimeout(function() {
								//활성화된 요소 높이 갱신
								var activeTextElement = option.$depthItem.filter('.' + _className.active).find('[data-menu-text]:first').filter('a, button').get().reverse();
								
								for(var i = 0, activeTextElementLength = activeTextElement.length; i < activeTextElementLength; i++) {
									option.setHeight({
										element : activeTextElement[i],
										nextDepth : true,
										parentsDepth : true
									});	
								}
							}, option.interval);
						});

						//요소 등록
						_register.push({
							element : thisFirst,
							option : option
						});

						//추적시작
						option.setSpy();
					}
					
					//요소반환
					return $thisFirst;
				};
			});
		})(jQuery);
	}else{
		throw '제이쿼리가 없습니다.';
	}
}catch(e) {
	console.error(e);
}