# menu v1.0.0
모든 메뉴의 유형이 나올 수 있도록 설계된 메뉴 플러그인입니다.

## 호출
````javascript
$(selector).menu({
    event : string,
    cut : object[number || string[number-number] : number],
    namespace : string,
    confirm : string
});
````

### 옵션

이름 | 기본값 | 값 | 설명
| :-- | :--- | :- | :-- |
event | click | string[mouse, click] | 사용할 이벤트를 지정합니다.
cut | | object[number \|\| string[number-number] : number] | 지정한 메뉴깊이에 지정한 숫자의 배수마다 cut요소를 생성합니다.
namespace | <ol><li>id</li><li>태그이름 + 메뉴순번</li></ol> | string | 메뉴의 명칭을 지정합니다.
confirm | 콘텐츠로 이동하시겠습니까? | string | 닫으려는 메뉴가 콘텐츠가 있을경우 발생됩니다.

### data-menu-*

#### selector
이름 | 기본값 | 값 | 설명
| :-- | :--- | :- | :-- |
top-background | wrap | string[full, wrap] | 상단배경을 꽉차게 지정할 수 있고 중앙정렬 넓이만큼 지정할 수 있습니다. 
bottom-background | wrap | string[full, wrap] | 하단배경을 꽉차게 지정할 수 있고 중앙정렬 넓이만큼 지정할 수 있습니다.
type | 1 | number | 메뉴유형을 지정합니다.<ol><li>풀다운</li><li>풀다운2</li><li>드롭다운</li><li>드롭다운2</li></ol>
effect | 1 | number | openElement에 지정한 요소를 눌렀을때의 효과를 지정합니다. <ol><li>토글</li><li>위에서 아래로 슬라이드</li><li>왼쪽에서 오른쪽으로 슬라이드</li><li>오른쪽에서 왼쪽으로 슬라이드</li></ol>

#### div
이름 | 값 | 설명
| :-- | :- | :-- |
depth | number | 깊이요소를 지정합니다.
title | number | 왼쪽 제목상자를 넣을때 사용하며 list의 이전요소에 기입해야 합니다.
open | namepsace | 메뉴를 열게할 요소를 지정하며 토글기능이 들어가 있습니다.
close | namepsace | 메뉴를 닫게할 요소를 지정합니다.

#### ul
이름 | 값 | 설명
| :-- | :- | :-- |
list | number | 목록요소(ul)를 지정합니다.

#### a, button
이름 | 값 | 설명
| :-- | :- | :-- |
text | number | 글자요소(a, button)를 지정합니다.
actived | | 초기에 활성화시킬 요소를 지정할때 사용합니다.

#### button
이름 | 값 | 설명
| :-- | :- | :-- |
button | | 여는버튼 또는 닫는버튼을 지정할때 사용하며 부모에 open, close가 있어야합니다.

### 클래스

#### html
* active : namespace에 지정한 값에 _active를 더하여 메뉴에 접근했을때 부여됩니다.
* open : namespace에 지정한 값에 _open을 더하여 메뉴를 열었을때 부여됩니다.

#### selector
* state : state라는 단어뒤에 접근한 요소의 순번이 부여됩니다.
* menu_initialized : 메뉴 플러그인이 셋팅되었을때 부여됩니다.

#### li
* active : 활성화됬을때 지정됩니다.
* active_next : 활성화의 이전요소에 지정됩니다.
* active_prev : 활성화의 다음요소에 지정됩니다.
* actived : 활성화된 요소에게 지정됩니다.
* actived_prev : 활성화된 요소의 이전요소에 지정됩니다.
* actived_next : 활성화된 요소의 다음요소에 지정됩니다.
* has : 다음메뉴가 있을때 지정됩니다.
* solo : 다음메뉴가 없을때 지정됩니다.
* cut : cut요소의 클래스 입니다.

### 속성선택자 변경방법
변경전 | 변경후
| :--- | :--- |
[data-menu-type='#'] | .nav
[data-menu-depth='#'] | .depth#
[data-menu-list='#'] | .depth#_list
[data-menu-list='#'] > li | .depth#_item
[data-menu-text='#'] | .depth#_text
[data-menu-open='#'] | .nav_open
[data-menu-open='#'] button | .nav_open .nav_button
[data-menu-close='#'] | .nav_close
[data-menu-close='#'] button | .nav_close .nav_button

### 메소드
$(selector).menu(메소드명, 매개변수);

이름 | 매개변수 | 설명
| :-- | :---- | :-- |
destroy | | 플러그인을 소멸시킵니다.
spy | jQueryElement \|\| element | 지정요소의 메뉴를 열어줍니다.

### 정렬
첫번째 깊이요소에 클래스(clearfix)를 추가하시면 메뉴가 오른쪽으로 붙습니다.
요소(ul)에 클래스(clearfix)를 추가하시면 요소(li)가 왼쪽으로 붙습니다.

### 제이쿼리 개발버전
1.12.4

### 브라우저 지원
* js : ie7이상 그 이외 브라우저 모두 지원합니다. 
* css : ie10이상 그 이외 브라우저 모두 지원합니다.