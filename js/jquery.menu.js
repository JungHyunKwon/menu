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
			var _$document = $(document),
				_consoleType = _getTypeof(window.console),
				_register = [], //등록된 객체
				_namespace = 'menu', //네임스페이스
				_separator = '_', //구분자
				_className = { //클래스 이름
					active : 'active', //활성화
					state : 'state', //상태
					has : 'has', //다음메뉴가 있을때
					solo : 'solo', //다음메뉴가 없을때
					rule : 'rule', //nth-child 대체
					open : 'open', //열기
					prev : 'prev', //이전
					next : 'next', //다음
					cut : 'cut' //자르기
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
						var element = window.jQuery.map(value, function(element, index) {
								var elementType = _getTypeof(element);

								if(elementType === 'window' || elementType === 'document' || elementType === 'element') {
									return element;
								}
							}),
							elementLength = element.length;

						//제이쿼리 엘리먼트일때
						if(elementLength && value.length === elementLength) {
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
				return (_getTypeof(value) === 'string') ? value.replace(/\s/g, '') : value;
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
				 * @name 넓이 또는 높이 구하기
				 * @since 2017-12-06
				 * @param {object} option({element : element || jQueryElement, method : string, noneDuration : boolean || string, showElement : boolean, showParents : boolean, changeAuto : boolean})
				 * @return {array || number || string}
				 */
				function _getSize(option) {
					//객체가 아닐때
					if(_getTypeof(option) !== 'object') {
						option = {};
					}

					//문자열일때
					if(_getTypeof(option.method) === 'string') {
						option.method = option.method.toLowerCase();
					}
					
					//형태검사
					option.noneDurationType = _getTypeof(option.noneDuration);
					
					//문자열일때
					if(option.noneDurationType === 'string') {
						option.noneDuration = option.noneDuration.toLowerCase();
					
					//불린이 아닐때
					}else if(option.noneDurationType !== 'boolean') {
						option.noneDuration = false;
					}
					
					//불린이 아닐때
					if(_getTypeof(option.showElement) !== 'boolean') {
						option.showElement = false;
					}
					
					//불린이 아닐때
					if(_getTypeof(option.showParents) !== 'boolean') {
						option.showParents = false;
					}
					
					//불린이 아닐때
					if(_getTypeof(option.changeAuto) !== 'boolean') {
						option.changeAuto = false;
					}
					
					//제이쿼리로 변환
					option.$element = $(option.element);
					option.result = [];
					
					//받은객체만큼 루핑
					option.$element.each(function(index, element) {
						var $this = $(element),
							value = '';
							
						//엘리먼트일때
						if(_isElement(element)) {
							//타임스탬프 생성
							var timestamp = 'clone' + new Date().getTime();
							
							//클래스 추가로 색인
							$this.addClass(timestamp);

							var $lastParent = $($this.parents().eq(-3)[0] || $this[0]), //html, body를 제외한 최상위 부모 찾기
								$clone = $lastParent.clone(true); //부모 복사
							
							//보이지않게 css처리
							$clone.css({
								visibility : 'hidden',
								width : $lastParent.width(),
								height : $lastParent.height(),
								position : 'absolute',
								top : -100 + '%',
								left : -100 + '%',
								zIndex : -1
							});
							
							//body태그 자손으로 추가
							$clone.appendTo('body');

							//색인클래스 삭제
							$this.removeClass(timestamp);
							
							//복사된 요소에서 색인된 엘리먼트 찾기
							var $cloneThis = $clone.find('.' + timestamp);

							//복사된 요소에서 색인된 엘리먼트에서 색인클래스 삭제
							$cloneThis.removeClass(timestamp);
							
							//부모들을 강제로 보이게 설정했을때
							if(option.showParents) {
								var $cloneParents = $cloneThis.parents().not('html, body'); //html, body예외처리

								$cloneParents.show(0);
							}
							
							//색인된 객체를 보이게 설정했을때
							if(option.showElement) {
								$cloneThis.show(0);
							}

							//불린으로 들어왔을때
							if(option.noneDuration) {
								$cloneThis.css({
									animationName : 'none',
									transitionProperty : 'none'
								});
							
							//animation으로 들어왔을때
							}else if(option.noneDuration === 'animation') {
								$cloneThis.css('animation-name', 'none');
							
							//transition으로 들어왔을때
							}else if(option.noneDuration === 'transition') {
								$cloneThis.css('transition-property', 'none');
							}
							
							//width, min-width, max-width, height, min-height, max-height를 자동으로 변경하는걸로 설정했을때
							if(option.changeAuto) {
								if(option.method === 'outerwidth(true)' || option.method === 'outerwidth' || option.method === 'innerwidth' || option.method === 'width') {
									$cloneThis.css({
										width : 'auto',
										minWidth : 0,
										maxWidth : 'none'
									});
								}else if(option.method === 'outerheight(true)' || option.method === 'outerheight' || option.method === 'innerheight' || option.method === 'height') {
									$cloneThis.css({
										height : 'auto',
										minHeight : 0,
										maxHeight : 'none'
									});
								}else{
									$cloneThis.css({
										width : 'auto',
										minWidth : 0,
										maxWidth : 'none',
										height : 'auto',
										minHeight : 0,
										maxHeight : 'none'
									});	
								}
							}

							if(option.method === 'outerwidth(true)') {
								value = $cloneThis.outerWidth(true);
							}else if(option.method === 'outerwidth') {
								value = $cloneThis.outerWidth();
							}else if(option.method === 'innerwidth') {
								value = $cloneThis.innerWidth();
							}else if(option.method === 'width') {
								value = $cloneThis.width();
							}else if(option.method === 'outerheight(true)') {
								value = $cloneThis.outerHeight(true);
							}else if(option.method === 'outerheight') {
								value = $cloneThis.outerHeight();
							}else if(option.method === 'innerheight') {
								value = $cloneThis.innerHeight();
							}else if(option.method === 'height') {
								value = $cloneThis.height();
							}
							
							//복사객체 제거
							$clone.remove();
						}
						
						//결과 기입
						option.result.push(value);
					});
					
					//결과가 1개일때
					if(option.result.length === 1) {
						option.result = option.result[0];
					
					//결과가 없을때
					}else if(!option.result.length) {
						option.result = '';
					}

					return option.result;
				}

				/**
				 * @name 별칭으로 시작하는 클래스 지우기
				 * @since 2017-12-06
				 * @param {element || jQueryElement} element
				 * @param {string} namespace
				 * @return {array || string || jQueryElement || jQueryObject}
				 */
				function _removePrefixClass(element, namespace) {
					var $this = $(element),
						namespaceLength = (_getTypeof(namespace) === 'string') ? namespace.length : 0, //문자열이 아닐때 0대체
						result = [];

					$this.each(function(index, element) {
						var $this = $(element),
							className = $this.attr('class');
						
						//클래스가 있을때
						if(className) {
							//클래스를 공백단위로 자르기
							className = className.split(/\s/);

							for(var i = 0, classNameLength = className.length; i < classNameLength; i++) {
								//클래스이름이 namespace값으로 시작할때
								if(className[i].substring(0, namespaceLength) === namespace) {
									//클래스 제거
									$this.removeClass(className[i]);

									//결과 기입
									result.push(className[i]);
								}
							}
						}
					});
					
					//결과가 1개일때
					if(result.length === 1) {
						result = result[0];
					
					//결과가 없을때
					}else if(!result.length) {
						result = $this;
					}

					return result;
				}
				

				/**
				 * @name 등록된 객체 인덱스 구하기
				 * @since 2017-12-06
				 * @param {element || jQueryElement} element
				 * @return {array || number}
				 */
				function _getRegistIndex(element) {
					var $this = $(element),
						result = [];
					
					$this.each(function(index, element) {
						var $this = $(element),
							isBreak = false;

						for(var i = 0, registerLength = _register.length; i < registerLength; i++) {
							//객체일때 && 들어온 엘리먼트와 등록된 엘리먼트가 같을때
							if(_getTypeof(_register[i]) === 'object' && $this.is(_register[i].element)) {
								result.push(i);
								isBreak = true;
								break;
							}
						}
						
						//결과가 없을때
						if(!isBreak) {
							result.push(-1);
						}
					});
					
					//결과가 1개일때
					if(result.length === 1) {
						result = result[0];
					}

					return result;
				}

				/**
				 * @name menu
				 * @since 2018-02-23
				 * @param {object} option({event : string, cut : number, namespace : string, openElement : element, closeElement : element})
				 * @param {jQueryElement || element} element
				 * @return {jQueryElement || jQueryObject}
				 */
				$.fn.menu = function(option, element) {
					var $this = this,
						$thisFirst = $this.first(),
						optionType = _getTypeof(option),
						registIndex = _getRegistIndex($thisFirst[0]),
						event = $.Event('menu');

					//문자열일때
					if(optionType === 'string') {
						//소문자 치환
						option = option.toLowerCase();

						//등록되어있을때
						if(registIndex > -1) {
							//파괴
							if(option === 'destroy') {
								//cut 엘리먼트 삭제
								_register[registIndex].option.$depth2CutItem.remove();
								
								//클래스 제거
								_removePrefixClass(_register[registIndex].option.$depthItem, _className.rule);
								_$body.removeClass(_register[registIndex].option.className.globalActive + ' ' + _register[registIndex].option.className.globalOpen);
								_removePrefixClass($thisFirst, _className.state);
								_register[registIndex].option.$depthItem.removeClass(_className.has + ' ' + _className.solo + ' ' + _className.activePrev + ' ' + _className.active + ' ' + _className.activeNext + ' ' + _className.activedPrev + ' ' + _className.actived + ' ' + _className.activedNext);

								//특성제거
								_register[registIndex].option.$depth.css('max-height', '');
								$thisFirst.css('padding-bottom', '');

								//이벤트 핸들러 제거
								_$document.off('keydown.' + _register[registIndex].option.namespace + ' keyup.' + _register[registIndex].option.namespace);
								_register[registIndex].option.$openElement.off('click.' + _register[registIndex].option.namespace + ' focusin.' + _register[registIndex].option.namespace);
								_register[registIndex].option.$closeElement.off('click.' + _register[registIndex].option.namespace + ' focusout.' + _register[registIndex].option.namespace);
								$thisFirst.off('mouseleave.' + _register[registIndex].option.namespace);
								_register[registIndex].option.$depthFirstText.off('focusout.' + _register[registIndex].option.namespace);
								_register[registIndex].option.$depthLastText.off('focusout.' + _register[registIndex].option.namespace);
								_register[registIndex].option.$depthText.off('focusin.' + _register[registIndex].option.namespace + ' click.' + _register[registIndex].option.namespace);
								_register[registIndex].option.$depthAndText.off('mouseover.' + _register[registIndex].option.namespace);
								
								//배열에서 제거
								_register.splice(registIndex, 1);
							
							//추적
							}else if(option === 'spy') {
								//요소가 없을때
								if(!_isElement(element)) {
									element = _register[registIndex].option.$activedDepthText[0];
								}

								$(element).each(function(index, element) {
									var hasDepthText = false;

									_register[registIndex].option.$depthText.each(function(index, depthText) {
										var $this = $(depthText);
										
										//depthText에 포함된 요소일때
										if($this.is(element)) {
											hasDepthText = true;
										}
									});
									
									//depthText가 있을때
									if(hasDepthText) {
										_register[registIndex].option.openMenu.call(element, event);
									}
								});
							};
						}
					//적용
					}else if(_getTypeof($thisFirst) === 'jQueryElement') {
						//기존 이벤트 제거
						if(registIndex > -1) {
							$thisFirst.menu('destroy');
						}

						//옵션이 객체가 아닐때
						if(optionType !== 'object') {
							option = {};
						}

						//접두어 공백제거
						option.namespace = _removeBlank(option.namespace);

						//네임스페이스가 문자열이 아니거나 공백일때
						if(_getTypeof(option.namespace) !== 'string' || option.namespace === '') {
							option.namespace = _namespace;
						}

						//2차메뉴 컷팅 갯수가 숫자가 아닐때
						if(_getTypeof(option.cut) !== 'number') {
							option.cut = 0;
						}

						//이벤트가 문자열일때
						if(_getTypeof(option.event) === 'string') {
							option.event = option.event.toLowerCase();
						}
						
						//이벤트가 mouse가 아니면서 click이 아닐때
						if(option.event !== 'mouse' && option.event !== 'click') {
							option.event = 'click';
						}

						//열기버튼 제이쿼리 엘리먼트로 변환
						option.$openElement = $(option.openElement);

						//닫기버튼 제이쿼리 엘리먼트로 변환
						option.$closeElement = $(option.closeElement);

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
						option.$depth1List = option.$depth1.find('ul[data-menu-list="1"]');
						option.$depth1Item = option.$depth1List.children('li');
						option.$depth1FirstItem = option.$depth1Item.first();
						option.$depth1Text = option.$depth1Item.find('a[data-menu-text="1"], button[data-menu-text="1"]');
						option.$depth2 = option.$depth.filter('[data-menu-depth="2"]');
						option.$depthList = option.$depth.find('ul[data-menu-list]');
						option.$depth2List = option.$depth2.find('ul[data-menu-list="2"]');
						option.$depthItem = option.$depthList.children('li');
						option.$depthText = option.$depthItem.find('a[data-menu-text], button[data-menu-text]');
						option.$depthFirstText = option.$depthText.first();
						option.$depthLastText = option.$depthText.last();
						option.$depthAndText = option.$depth.add(option.$depthText);
						option.$activedDepthText = option.$depthItem.find('a[data-menu-text][data-menu-actived="true"], button[data-menu-text][data-menu-actived="true"]').last();
						option.$activedDepthItem = option.$activedDepthText.parents('li');

						//actived클래스 추가
						option.$activedDepthItem.prev('li').addClass(_className.activedPrev);
						option.$activedDepthItem.addClass(_className.actived);
						option.$activedDepthItem.next('li').addClass(_className.activedNext);

						//자르기
						if(option.cut > 0) {
							option.$depth2List.children('li:nth-child(' + option.cut + 'n)').next('li').prev('li').after('<li class="' + _className.cut + '">&nbsp;</li>');
						}
						
						//요소 정의
						option.$depth2CutItem = option.$depthList.children('li.' + _className.cut);

						//rule, has, solo클래스 추가
						option.$depthList.each(function(index, element) {
							var $this = $(element);

							$this.children('li').each(function(index, element) {
								var $this = $(element);
								
								$this.addClass(_className.rule + (index + 1));
								
								//다음 메뉴가 있을때
								if($this.find('div[data-menu-depth]:first').length) {
									$this.addClass(_className.has);
								}else{
									$this.addClass(_className.solo);
								}
							});
						});

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
							if(_getTypeof(opt.nextDepth) !== 'boolean') {
								opt.nextDepth = false;
							}
							
							//불린이 아닐때
							if(_getTypeof(opt.parentsDepth) !== 'boolean') {
								opt.parentsDepth = false;
							}

							//제이쿼리로 변환
							opt.$element = $(opt.element);
							
							//제이쿼리 엘리먼트가 존재할때
							if(_isElement(opt.element)) {
								opt.$parentsDepthItem = opt.$element.parents('li');

								//선택된 메뉴 높이 조정
								if(opt.nextDepth) {
									opt.$nextDepth = opt.$parentsDepthItem.first().find('div[data-menu-depth]:first');

									//다음 차수메뉴의 outerHeight(height, padding)를 구해서 적용
									opt.$nextDepth.css('max-height', _getSize({
										element : opt.$nextDepth[0],
										method : 'outerheight(true)',
										noneDuration : true,
										showElement : true,
										showParents : true,
										changeAuto : true
									}));
								}

								//선택된 depthText의 부모 메뉴 높이 조정
								if(opt.parentsDepth) {
									opt.$element.parents('div[data-menu-depth]:not([data-menu-depth="1"])').each(function(index, element) {
										//부모 차수메뉴의 outerHeight(height, padding)를 구해서 적용
										$(element).css('max-height', _getSize({
											element : element,
											method : 'outerheight(true)',
											noneDuration : true,
											showElement : true,
											showParents : true,
											changeAuto : true
										}));
									});
								}
								
								//가로형 레이아웃을 사용할때
								if(option.isHorizontalLayout()) {
									opt.$depth2 = opt.$parentsDepthItem.find('div[data-menu-depth="2"]');
									
									//풀다운
									if(option.type === 1) {
										//depth2중에서 outerHeight(height, padding)를 구해서 최대높이 구하기
										opt.depth2Height = Math.max.apply(null, _getSize({
											element : option.$depth2.get(),
											method : 'outerheight(true)',
											noneDuration : true,
											showElement : true,
											changeAuto : true,
											showParents : true
										}));
									
									//풀다운2, 드롭다운1
									}else if(option.type === 2 || option.type === 3) {
										//선택된 depthText에 depth2에서 outerHeight(height, padding)를 구하기
										opt.depth2Height = _getSize({
											element : opt.$depth2[0],
											method : 'outerheight(true)',
											noneDuration : true,
											showElement : true,
											showParents : true,
											changeAuto : true
										});
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
										$thisFirst.css('padding-bottom', opt.depth2Height);
									}
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
							var $this = $(element);
							
							_removePrefixClass($thisFirst, _className.state);

							$this.parents('li').each(function(index, element) {
								$thisFirst.addClass(_className.state + (option.$depthItem.index(element) + 1));
							});
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
						 * @name 가로 레이아웃인지 확인
						 * @since 2017-12-06
						 */
						option.isHorizontalLayout = function() {
							var result = false,
								depth1FirstItemFloat = option.$depth1FirstItem.css('float');

							//값이 left이거나 right일때
							if(depth1FirstItemFloat === 'left' || depth1FirstItemFloat === 'right') {
								result = true;
							}

							return result;
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
								$depthNextItem = $parentsDepthItem.next('li'),
								$siblingsDepthText = $parentsDepthItem.find('[data-menu-text]:first').filter('a, button'),
								$siblingsParentDepthItem = $siblingsDepthText.closest('li'),
								$siblingsDepthItem = $siblingsParentDepthItem.siblings('li'),
								$siblingsNextDepth = $siblingsDepthItem.find('div[data-menu-depth]:first');

							//이전 아이템이 cut아이템일때
							if(option.$depth2CutItem.is($depthPrevItem)) {
								$depthPrevItem = $depthPrevItem.prev('li');
							}
							
							//다음 아이템이 cut아이템일때
							if(option.$depth2CutItem.is($depthNextItem)) {
								$depthNextItem = $depthNextItem.next('li');
							}

							//mouse이벤트일때
							if(option.event === 'mouse') {
								//초기화
								option.closeMenu.call(this, event);
							}else{
								//활성화의 이전, 활성화, 활성화의 다음 클래스 제거
								$siblingsParentDepthItem.add($siblingsDepthItem).removeClass(_className.activePrev + ' ' + _className.active + ' ' + _className.activeNext);

								//메뉴 닫기
								$siblingsNextDepth.css('max-height', '');
								
								//높이 재조정
								$siblingsDepthText.each(function(index, element) {
									option.setHeight({
										element : element,
										nextDepth : false,
										parentsDepth : true
									});
								});
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
							option.addStateClass($parentsDepthLastItem.add($parentsDepthLastItem.find('ul[data-menu-list] > li')).filter('.' + _className.active).last().find('a[data-menu-text], button[data-menu-text]').first()[0]);

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
							var $this = $(this),
								$parentsDepthItem = $this.parents('li'),
								$parentDepthItem = $parentsDepthItem.first(),
								$depthPrevItem = $parentDepthItem.prev('li'),
								$depthNextItem = $parentDepthItem.next('li'),
								$nextDepth = $parentDepthItem.find('div[data-menu-depth]:first'),
								$secondParentDepthItem = $parentsDepthItem.eq(1),
								$secondParentDepthPrevItem = $secondParentDepthItem.prev('li'),
								$secondParentDepthNextItem = $secondParentDepthItem.next('li'),
								$secondParentDepthText = $secondParentDepthItem.find('a[data-menu-text], button[data-menu-text]').first();

							//mouse이벤트일때
							if(option.event === 'mouse') {
								//전역 클래스 제거
								_$body.removeClass(option.className.globalActive);

								//상태 클래스 제거
								_removePrefixClass($thisFirst, _className.state);

								//max-height, padding-bottom초기화
								option.$depth.css('max-height', '');
								$thisFirst.css('padding-bottom', '');
								
								//활성화의 이전, 활성화, 활성화의 다음 클래스 제거
								option.$depthItem.removeClass(_className.activePrev + ' ' + _className.active + ' ' + _className.activeNext);
							}else{
								//부모메뉴 닫기
								if($this.is(option.$depthLastText)) {
									//이전 아이템이 cut아이템일때
									if(option.$depth2CutItem.is($secondParentDepthPrevItem)) {
										$secondParentDepthPrevItem = $secondParentDepthPrevItem.prev('li');
									}
									
									//다음 아이템이 cut아이템일때
									if(option.$depth2CutItem.is($secondParentDepthNextItem)) {
										$secondParentDepthNextItem = $secondParentDepthNextItem.next('li');
									}

									//활성화의 이전 클래스 제거
									$secondParentDepthPrevItem.removeClass(_className.activePrev);

									//선택된 활성화 클래스 제거
									$secondParentDepthItem.removeClass(_className.active);

									//활성화의 다음 클래스 제거
									$secondParentDepthNextItem.removeClass(_className.activeNext);

									//상태 클래스 추가
									option.addStateClass($secondParentDepthText[0]);

									//메뉴 닫기
									$parentsDepthItem.first().closest('div[data-menu-depth]').css('max-height', '');

									//높이 재조정
									option.setHeight({
										element : $secondParentDepthText[0],
										nextDepth : false,
										parentsDepth : true
									});

								//다음메뉴 닫기
								}else{
									//이전 아이템이 cut아이템일때
									if(option.$depth2CutItem.is($depthPrevItem)) {
										$depthPrevItem = $depthPrevItem.prev('li');
									}
									
									//다음 아이템이 cut아이템일때
									if(option.$depth2CutItem.is($depthNextItem)) {
										$depthNextItem = $depthNextItem.next('li');
									}

									//활성화의 이전 클래스 제거
									$depthPrevItem.removeClass(_className.activePrev);

									//선택된 활성화 클래스 제거
									$parentDepthItem.removeClass(_className.active);

									//활성화의 다음 클래스 제거
									$depthNextItem.removeClass(_className.activeNext);

									//상태 클래스 추가
									option.addStateClass($parentsDepthItem.eq(1).find('a[data-menu-text], button[data-menu-text]').first()[0]);

									//다음 메뉴 닫기
									$nextDepth.css('max-height', '');

									//높이 재조정
									option.setHeight({
										element : this,
										nextDepth : false,
										parentsDepth : true
									});
								}

								//1차 메뉴를 닫을때
								if(option.$depth1Text.is(this)) {
									//전역 활성화 클래스 제거
									_$body.removeClass(option.className.globalActive);
									
									//가로형 레이아웃을 사용할때
									if(option.isHorizontalLayout()) {
										//padding-bottom 초기화
										$thisFirst.css('padding-bottom', '');
									}
								}
							}

							//이벤트 전파 방지
							event.stopPropagation();
						};
						
						//mouse이벤트일때
						if(option.event === 'mouse') {
							//depthText와 depth에 마우스가 접근했을때						
							option.$depthAndText.on('mouseover.' + option.namespace, function(event) {
								option.openMenu.call(this, event);
							});

							//지정객체 나가면 추적
							$thisFirst.on('mouseleave.' + option.namespace, function(event) {
								option.setSpy();
							});
						}else{
							//transition-duration 전역변수
							option.time = 0;

							option.$depthText.on('click.' + option.namespace, function(event) {
								var $this = $(this),
									$parentDepthItem = $this.closest('li'),
									$nextDepth = $parentDepthItem.find('div[data-menu-depth]:first'),
									tagName = this.tagName.toLowerCase(),
									isActive = $parentDepthItem.hasClass(_className.active),
									time = new Date().getTime(),
									nextDepthTransitionDuration = $nextDepth.css('transition-duration');

								//문자열일때
								if(_getTypeof(nextDepthTransitionDuration) === 'string') {
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
							event.preventDefault();
						});

						//depthText에 포커스가 갔을때 && 클릭했을때
						option.$depthText.on('focusin.' + option.namespace, function(event) {
							//메뉴 열기
							if(option.isPressTabKey) {
								option.openMenu.call(this, event);
							}
						});

						//첫번째 a나가고 추적
						option.$depthFirstText.on('focusout.' + option.namespace, function(event) {
							//shift키와 tab키를 눌러서 나갔을때
							if(option.isPressShiftKey && option.isPressTabKey) {
								option.setSpy(this);
							}
						});

						//마지막 a나가고 추적
						option.$depthLastText.on('focusout.' + option.namespace, function(event) {
							if(!option.isPressShiftKey && option.isPressTabKey) {
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

							//shift키를 눌렀을때
							if(event.shiftKey) {
								option.isPressShiftKey = true;
							}
						}).on('keyup.' + option.namespace, function(event) {
							var keyCode = event.keyCode || event.which;

							//tab키를 눌렀을때
							if(keyCode === 9) {
								option.isPressTabKey = false;
							}

							//shift키를 눌렀을때
							if(event.shiftKey) {
								option.isPressShiftKey = false;
							}
						});

						//객체 등록
						_register.push({
							element : $thisFirst[0],
							option : option
						});
						
						//추적시작
						$thisFirst.menu('spy');
					}
					
					//객체반환
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