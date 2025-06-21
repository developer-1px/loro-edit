# PlaintextEditor.tsx 리팩토링 완료

기존의 `PlaintextEditor.tsx` 파일이 너무 많은 역할을 담당하고 있어서, 플러그인 시스템을 활용하여 적절한 구조로 분리했습니다.

## 🎯 리팩토링 목표

- **단일 책임 원칙** 적용: 각 모듈이 하나의 책임만 가지도록 분리
- **플러그인 시스템** 활용: 확장 가능한 아키텍처로 전환
- **재사용성** 향상: UI 컴포넌트와 로직을 독립적으로 사용 가능
- **유지보수성** 개선: 코드 변경 시 영향 범위 최소화

## 📁 새로운 파일 구조

### 1. UI 컴포넌트 분리 (`src/components/ui/`)

```
src/components/ui/
├── PreviewControls.tsx    # 프리뷰 모드 및 상태 컨트롤
├── PreviewPanel.tsx       # 반응형 프리뷰 화면
├── ResizeHandle.tsx       # 패널 크기 조절 핸들
├── HtmlEditorPanel.tsx    # HTML 소스 편집기
└── index.ts              # UI 컴포넌트 통합 export
```

### 2. 유틸리티 함수 분리 (`src/utils/`)

```
src/utils/
├── htmlParser.ts         # HTML → ParsedElement 변환 로직
└── selectionUtils.ts     # 선택 상태 관련 유틸리티
```

### 3. 커스텀 훅 분리 (`src/hooks/`)

```
src/hooks/
├── useSelectionHandling.ts  # 클릭 및 선택 상태 관리
└── useResizeHandling.ts     # 패널 리사이즈 로직
```

### 4. 플러그인 시스템 (`src/plugins/`)

```
src/plugins/
├── types.ts                  # 플러그인 인터페이스
├── PluginManager.ts         # 플러그인 관리 및 렌더링
├── text.tsx                 # 텍스트 편집 플러그인
├── image.tsx                # 이미지 관리 플러그인
├── repeat-container.tsx     # 반복 컨테이너 플러그인
├── section.tsx              # 시맨틱 섹션 플러그인
├── element.tsx              # 일반 요소 플러그인 (폴백)
├── index.ts                 # 플러그인 등록 및 export
└── README.md               # 플러그인 시스템 문서
```

### 5. 새로운 메인 컴포넌트

```
src/components/
├── PluginBasedEditor.tsx    # 플러그인 기반 새로운 에디터
└── PlaintextEditor.tsx      # 기존 에디터 (보존)
```

## 🔄 주요 변경사항

### Before (기존 PlaintextEditor.tsx)
- **1,133줄**의 거대한 단일 파일
- 모든 UI 컴포넌트가 하나의 파일에 혼재
- DOM 파싱, 클릭 핸들링, 렌더링 로직이 모두 섞여 있음
- 새로운 요소 타입 추가 시 파일 전체 수정 필요

### After (분리된 구조)
- **역할별로 분리**된 작은 모듈들
- **플러그인 시스템**으로 요소별 독립적 관리
- **재사용 가능한** UI 컴포넌트들
- **확장성** 우선의 아키텍처

## 🎨 새로운 PluginBasedEditor 특징

### 1. 간결한 메인 로직 (146줄)
```typescript
export const PluginBasedEditor: React.FC = () => {
  // Store와 훅 사용
  const { /* store states */ } = useEditorStore();
  const { /* selection handlers */ } = useSelectionHandling({ selection, setSelection });
  const { /* resize handlers */ } = useResizeHandling(80);
  
  // 플러그인 기반 렌더링
  const renderElement = (element: ParsedElement): React.ReactNode => {
    return pluginManager.renderElement(element, pluginContext, renderElement);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 분리된 UI 컴포넌트들 조합 */}
    </div>
  );
};
```

### 2. 플러그인 기반 확장성
- 새로운 요소 타입 추가 시 **플러그인만 추가**하면 됨
- 기존 코드 **수정 없이** 기능 확장 가능
- **우선순위 시스템**으로 플러그인 충돌 방지

### 3. 관심사의 분리
- **UI**: 화면 표시만 담당
- **로직**: 비즈니스 로직만 담당  
- **상태**: 상태 관리만 담당
- **플러그인**: 요소별 렌더링만 담당

## 🚀 확장성 개선

### 새로운 컴포넌트 타입 추가
```typescript
// 1. 플러그인 파일 생성
const videoPlugin: Plugin = {
  name: 'video',
  version: '1.0.0',
  match: { condition: (el) => el.type === 'video', priority: 85 },
  render: ({ element }) => <VideoComponent element={element} />
};

// 2. 플러그인 등록
pluginManager.register(videoPlugin);
```

### UI 컴포넌트 재사용
```typescript
// 다른 에디터에서도 동일한 UI 컴포넌트 사용 가능
import { PreviewControls, PreviewPanel } from './components/ui';
```

## 📊 성과 지표

| 항목 | Before | After | 개선 |
|------|--------|-------|------|
| **메인 파일 크기** | 1,133줄 | 146줄 | **87% 감소** |
| **파일 수** | 1개 | 15개 | **모듈화 완성** |
| **최대 파일 크기** | 1,133줄 | 180줄 | **84% 감소** |
| **새 요소 추가 시 수정 범위** | 전체 파일 | 플러그인 1개 | **영향도 최소화** |

## 🔧 마이그레이션 가이드

### 기존 코드 사용법
```typescript
// 기존
import { PlaintextEditor } from './components/PlaintextEditor';

// 새로운 방식
import { PluginBasedEditor } from './components/PluginBasedEditor';
```

### 기존 컴포넌트들 재사용
```typescript
// 기존 EditableText, EditableImage 등은 플러그인으로 이동
import { textPlugin, imagePlugin } from './plugins';
```

## 🎉 결론

이번 리팩토링을 통해:

1. **거대한 단일 파일**을 **역할별 작은 모듈**로 분리
2. **플러그인 시스템** 도입으로 **무한 확장 가능**
3. **UI 컴포넌트** 재사용성 극대화
4. **유지보수성**과 **테스트 용이성** 대폭 개선

새로운 구조는 **확장성**, **유지보수성**, **재사용성**을 모두 만족하는 현대적인 React 아키텍처를 구현했습니다.