# Live Preview Plugin System

플러그인 시스템을 통해 Live Preview의 Module들을 동적으로 등록하고 관리할 수 있습니다.

## 아키텍처

### 플러그인 구조

각 플러그인은 다음 요소들을 포함합니다:

1. **조건 매칭**: 어떤 조건일 때 이 플러그인을 사용할지 결정
2. **DOM 파싱**: HTML을 어떻게 파싱하여 데이터로 변환할지
3. **렌더링**: 데이터를 어떻게 React 컴포넌트로 렌더링할지
4. **상태 관리**: 선택 상태 변화를 어떻게 처리할지

### 플러그인 인터페이스

```typescript
interface Plugin {
  name: string;
  version: string;
  description?: string;
  
  // 매칭 조건 - 언제 이 플러그인을 사용할지
  match: ElementMatch;
  
  // DOM 파싱 - HTML을 어떻게 element 데이터로 변환할지
  parse?: (element: Element) => ParsedElement | null;
  
  // 렌더링 - element를 어떻게 그릴지
  render: (props: PluginRenderProps) => React.ReactNode;
  
  // 선택 처리 - 선택 시 어떻게 반응할지
  onSelect?: (element: ParsedElement, context: PluginContext) => void;
  
  // 초기화 및 정리
  init?: () => void;
  destroy?: () => void;
}
```

## 기본 제공 플러그인

### 1. Text Plugin (`text.tsx`)
- **조건**: `element.type === 'text'`
- **기능**: 인라인 텍스트 편집, focus/blur 처리, 키보드 단축키
- **우선순위**: 100

### 2. Image Plugin (`image.tsx`)
- **조건**: `element.type === 'img' || element.type === 'picture'`
- **기능**: 이미지 업로드 (드래그앤드롭, 붙여넣기), 미리보기
- **우선순위**: 90

### 3. Repeat Container Plugin (`repeat-container.tsx`)
- **조건**: `element.type === 'repeat-container'`
- **기능**: 반복 가능한 컨테이너, 아이템 추가/삭제, 선택 관리
- **우선순위**: 80

### 4. Section Plugin (`section.tsx`)
- **조건**: `element.type === 'element' && ['section', 'header', 'footer', 'nav'].includes(element.tagName)`
- **기능**: 시맨틱 섹션 요소들의 선택 및 컨테이너 관리
- **우선순위**: 70

### 5. Element Plugin (`element.tsx`)
- **조건**: `element.type === 'element'` (fallback)
- **기능**: 일반 HTML 요소 렌더링
- **우선순위**: 10 (가장 낮은 우선순위 - 폴백용)

## 사용법

### 플러그인 등록

```typescript
import { pluginManager } from './plugins';

// 기본 플러그인들은 자동으로 등록됨
// 새로운 플러그인 등록
pluginManager.register(myCustomPlugin);
```

### 커스텀 플러그인 작성

```typescript
import type { Plugin } from './plugins/types';

const myCustomPlugin: Plugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',
  description: 'My custom plugin description',
  
  match: {
    condition: (element) => element.type === 'my-custom-type',
    priority: 50
  },

  parse: (element: Element) => {
    // HTML Element를 ParsedElement로 변환
    if (element.hasAttribute('data-my-custom')) {
      return {
        type: 'my-custom-type',
        id: element.id || crypto.randomUUID(),
        // ... 기타 속성들
      };
    }
    return null;
  },

  render: ({ element, context, canEditText, showHoverEffects }) => {
    // React 컴포넌트로 렌더링
    return (
      <MyCustomComponent
        element={element}
        onInteraction={(data) => context.handleSomeAction(data)}
        editable={canEditText}
        hoverable={showHoverEffects}
      />
    );
  },

  onSelect: (element, context) => {
    // 선택 시 추가 로직
    console.log('Element selected:', element);
  },

  init: () => {
    console.log('Plugin initialized');
  },

  destroy: () => {
    console.log('Plugin destroyed');
  }
};
```

## 플러그인 우선순위

플러그인들은 우선순위에 따라 매칭됩니다. 높은 숫자가 높은 우선순위를 가집니다:

1. **Text (100)**: 텍스트 요소
2. **Image (90)**: 이미지 요소  
3. **Repeat Container (80)**: 반복 컨테이너
4. **Section (70)**: 시맨틱 섹션 요소
5. **Element (10)**: 일반 요소 (폴백)

## Context API

플러그인에서 사용할 수 있는 컨텍스트:

```typescript
interface PluginContext {
  selection: SelectionState;              // 현재 선택 상태
  setSelection: (selection) => void;      // 선택 상태 변경
  handleItemAdd: (containerId) => void;   // 아이템 추가
  handleTextChange: (id, text) => void;   // 텍스트 변경
  handleImageChange: (id, src) => void;   // 이미지 변경
}
```

## 확장성

이 플러그인 시스템을 통해 다음과 같은 확장이 가능합니다:

- **새로운 컴포넌트 타입** 추가 (예: Video, Audio, Chart 등)
- **커스텀 편집 동작** 구현
- **특별한 렌더링 로직** 적용
- **서드파티 라이브러리** 통합
- **실시간 협업 기능** 플러그인화

각 플러그인은 독립적으로 개발, 테스트, 배포할 수 있어 유지보수성과 확장성을 크게 향상시킵니다.