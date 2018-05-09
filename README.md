# menu v1.0.0
모든 메뉴의 유형이 나올 수 있도록 설계된 메뉴 플러그인입니다.

## 호출
````javascript
$(selector).menu({
    event : string,
    cut : number,
    namespace : string,
    openElement : jQueryElement || element,
    closeElement : jQueryElement || element
});
````

### 옵션

이름 | 값 | 설명
| :-- | :- | :-- |
event | string(mouse, click) | 사용할 이벤트를 지정합니다
cut | number | 지정한 숫자의 배수마다 2차메뉴에 cut요소를 생성합니다.
namespace | string | 메뉴의 명칭을 지정합니다.
openElement | jQueryElement \|\| element | 메뉴를 열게할 요소를 지정하며 토글기능이 들어가 있습니다.
closeElement | jQueryElement \|\| element | 메뉴를 닫게할 요소를 지정합니다.

### data-menu-*

#### selector
이름 | 값 | 설명
| :-- | :- | :-- |
top-background | string(full, wrap) | 상단배경을 꽉차게 지정할 수 있고 중앙정렬 넓이만큼 지정할 수 있습니다. 
bottom-background | string(full, wrap) | 하단배경을 꽉차게 지정할 수 있고 중앙정렬 넓이만큼 지정할 수 있습니다.
type | number | 메뉴유형을 지정합니다.<ol><li>풀다운</li><li>풀다운2</li><li>드롭다운</li><li>드롭다운2</li></ol>
effect | number | openElement에 지정한 요소를 눌렀을때의 효과를 지정합니다. <ol><li>토글</li><li>위에서 아래로 슬라이드</li><li>왼쪽에서 오른쪽으로 슬라이드</li><li>오른쪽에서 왼쪽으로 슬라이드</li></ol>

#### div
이름 | 값 | 설명
| :-- | :- | :-- |
depth | number | 깊이요소(div)를 지정합니다.
title | number | div요소 왼쪽 제목상자를 넣을때 사용하며 list의 이전요소에 기입해야 합니다.

#### ul
이름 | 값 | 설명
| :-- | :- | :-- |
list | number | 목록요소(ul)를 지정합니다.

#### a, button
이름 | 값 | 설명
| :-- | :- | :-- |
text | number | 글자요소(a, button)를 지정합니다.
actived | boolean | 초기에 활성화시킬 요소를 지정할때 사용합니다.

### 클래스

#### body
* active : namespace에 지정한 값에 _active을 더하여 메뉴에 접근했을때 부여됩니다.
* open : namespace에 지정한 값에 _open을 더하여 메뉴를 열었을때 부여됩니다.

#### selector
* state : state라는 단어뒤에 접근한 요소의 순번이 부여됩니다.
* menu_initialized : 메뉴 플러그인이 셋팅되었을때 부여됩니다.

#### li
* active : 활성화됬을때 지정됩니다.
* active_next : 활성화의 이전요소에 지정됩니다.
* active_prev : 활성화의 다음요소에 지정됩니다.
* actived : 미리 활성화된 요소에게 지정됩니다.
* actived_prev : 미리 활성화된 요소의 이전요소에 지정됩니다.
* actived_next : 미리 활성화된 요소의 다음요소에 지정됩니다.
* rule : rule이라는 단어뒤에 li요소의 순번이 부여됩니다.
* has : 다음메뉴가 있을때 지정됩니다.
* solo : 다음메뉴가 없을때 지정됩니다.
* cut : cut요소의 클래스 입니다.

### 메소드
$(selector).menu(메소드명, 매개변수);

이름 | 매개변수 | 설명
| :-- | :---- | :-- |
destroy | | 플러그인을 소멸시킵니다.
spy | jQueryElement \|\| element | 지정요소의 메뉴를 열어줍니다.

### 제이쿼리 개발버전
1.12.4

### 브라우저 지원
* js : ie7이상 그 이외 브라우저 모두 지원합니다. 
* css : ie10이상 그 이외 브라우저 모두 지원합니다.