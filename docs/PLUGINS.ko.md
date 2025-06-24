# 플러그인 시스템 문서

## 플러그인 아키텍처

### 핵심 개념

Loro Edit의 각 플러그인은 특정 유형의 HTML 요소를 처리하는 책임을 가집니다. 플러그인은 일관된 인터페이스와 라이프사이클을 따릅니다:

1. **매칭**: 플러그인이 주어진 DOM 요소를 처리할 수 있는지 결정
2. **파싱**: DOM 요소에서 ParsedElement로 데이터 추출
3. **렌더링**: ParsedElement를 React 컴포넌트로 변환
4. **클립보드 처리**: 선택적 클립보드 작업

### 플러그인 인터페이스

```typescript
interface Plugin {
  name: string;
  selectable: SelectableConfig;
  match: (element: Element) => boolean;
  parse: (element: Element) => ParsedElement | null;
  render: (props: PluginRenderProps) => React.ReactNode;
  clipboardHandler?: ClipboardHandler;
}

interface SelectableConfig {
  selectable: boolean;
  mode?: 'block' | 'text' | 'both';
}

interface PluginRenderProps {
  parsedElement: ParsedElement;
  renderChildren: (children: ParsedElement[]) => React.ReactNode;
  isSelected: boolean;
  isHovered: boolean;
  onTextChange?: (elementId: string, newContent: string) => void;
  onImageUpload?: (elementId: string, file: File) => void;
  onItemAdd?: (containerId: string) => void;
  onDatabaseViewModeChange?: (elementId: string, mode: 'cards' | 'table') => void;
  onDatabaseSettingsUpdate?: (elementId: string, settings: any) => void;
  onDatabaseFetch?: (elementId: string) => void;
  selection: SelectionState;
  setSelection: (selection: SelectionState) => void;
}
```

## 플러그인 명세

### 1. 텍스트 플러그인 (`text.tsx`)

**목적**: 제목, 단락, 인라인 텍스트를 포함한 모든 텍스트 콘텐츠 처리

**매칭 조건**:
- 텍스트 노드 (nodeType === 3)
- 텍스트 콘텐츠만 포함하는 요소

**동작**:
- 블록 모드: 선택 오버레이 표시
- 텍스트 모드: contentEditable로 인라인 편집 활성화
- 텍스트 계층 보존 (h1-h6, p, span 등)
- 텍스트 편집을 위한 키보드 이벤트 처리
- 텍스트 변경에 대한 실행 취소/다시 실행 지원

**특수 케이스**:
- 빈 텍스트 노드 보존
- 공백 문자 유지
- HTML 엔티티 적절히 인코딩/디코딩

### 2. 이미지 플러그인 (`image.tsx`)

**목적**: 업로드 및 표시 기능이 있는 이미지 요소 처리

**매칭 조건**:
- `<img>` 요소
- `<picture>` 요소

**동작**:
- 빈 상태: 업로드 프롬프트 표시
- 클릭하여 업로드: 파일 선택기 열기
- 드래그 앤 드롭: 이미지 파일 수락
- 종횡비 유지
- 업로드 중 로딩 상태 표시
- 모든 이미지 속성 보존

**삭제 동작**:
- `src`와 `alt` 속성 삭제
- 요소 구조 유지
- 선택 상태 유지

### 3. SVG 플러그인 (`svg.tsx`)

**목적**: 인라인 SVG 콘텐츠 렌더링 및 관리

**매칭 조건**:
- `<svg>` 요소

**동작**:
- SVG 콘텐츠 인라인 렌더링
- 모든 SVG 속성 보존
- 선택 오버레이 지원
- viewBox와 크기 유지

**삭제 동작**:
- `svgContent` 삭제
- 요소 구조 유지
- 선택 상태 유지

### 4. 섹션 플러그인 (`section.tsx`)

**목적**: 콘텐츠 구성을 위한 컨테이너 요소

**매칭 조건**:
- `<section>` 요소

**동작**:
- 다른 요소들의 컨테이너 역할
- 드래그 앤 드롭 재정렬 지원
- 썸네일 미리보기 생성
- 재귀적 자식 렌더링
- 섹션 사이드바에 표시

**삭제 동작**:
- 섹션과 모든 자식 완전 제거
- 선택 해제

**클립보드**:
- 자식을 포함한 전체 섹션 복사
- 새 섹션으로 붙여넣기

### 5. 반복 컨테이너 플러그인 (`repeat-container.tsx`)

**목적**: 반복 가능한 아이템 컬렉션 관리

**매칭 조건**:
- `data-repeat-container` 속성이 있는 요소

**동작**:
- 반복 아이템 컬렉션 표시
- 끝에 "Add Item" 버튼
- 각 아이템은 독립적으로 선택 가능
- 아이템 재정렬 지원

**구조**:
```html
<div data-repeat-container="items">
  <div data-repeat-item="item-1">...</div>
  <div data-repeat-item="item-2">...</div>
</div>
```

### 6. 반복 아이템 플러그인 (`repeat-item.tsx`)

**목적**: 반복 컨테이너 내의 개별 아이템

**매칭 조건**:
- `data-repeat-item` 속성이 있는 요소

**동작**:
- 개별 단위로 선택 가능
- 복사/잘라내기/붙여넣기 가능
- 고유한 repeat-item ID 유지

**삭제 동작**:
- 컨테이너에서 완전 제거
- 컨테이너 아이템 목록 업데이트

**클립보드**:
- 새로운 고유 ID로 복사
- 반복 컨테이너에만 붙여넣기 가능

### 7. 데이터베이스 플러그인 (`database.tsx`)

**목적**: 여러 뷰 모드를 가진 동적 데이터 표시

**매칭 조건**:
- `data-database` 속성이 있는 요소

**동작**:
- API 엔드포인트에서 데이터 가져오기
- 두 가지 뷰 모드: 카드와 테이블
- 실시간 데이터 업데이트
- 컬럼 구성
- 로딩 상태

**구조**:
```typescript
interface DatabaseElement {
  type: "database";
  database: string;
  apiUrl?: string;
  viewMode: "cards" | "table";
  data: DatabaseRecord[];
  columns: DatabaseColumn[];
}
```

### 8. 요소 플러그인 (`element.tsx`)

**목적**: 다른 모든 HTML 요소를 위한 폴백 핸들러

**매칭 조건**:
- 다른 플러그인에 매칭되지 않는 모든 요소

**동작**:
- 요소 유형과 속성 보존
- 재귀적 자식 렌더링
- 일반적인 선택 처리
- DOM 구조 유지

**일반적인 요소**:
- `<div>`, `<span>`, `<button>`
- `<ul>`, `<ol>`, `<li>`
- `<table>`, `<tr>`, `<td>`
- 모든 커스텀 요소

## 플러그인 등록

플러그인은 `src/plugins/index.ts`에서 우선순위 순서로 등록됩니다:

```typescript
export function registerDefaultPlugins(): void {
  // 기존 플러그인 제거
  pluginManager.clear();
  
  // 우선순위 순서로 등록
  pluginManager.register(new TextPlugin());
  pluginManager.register(new ImagePlugin());
  pluginManager.register(new SvgPlugin());
  pluginManager.register(new RepeatItemPlugin());
  pluginManager.register(new RepeatContainerPlugin());
  pluginManager.register(new SectionPlugin());
  pluginManager.register(new DatabasePlugin());
  pluginManager.register(new ElementPlugin()); // 폴백
}
```

## 플러그인 개발 가이드라인

### 새 플러그인 만들기

1. **플러그인 파일 생성**: `src/plugins/`에 생성
2. **Plugin 인터페이스 구현**:
   ```typescript
   export class MyPlugin implements Plugin {
     name = 'my-plugin';
     selectable = { selectable: true, mode: 'block' };
     
     match(element: Element): boolean {
       // 이 플러그인이 요소를 처리하면 true 반환
     }
     
     parse(element: Element): ParsedElement | null {
       // DOM을 ParsedElement로 변환
     }
     
     render(props: PluginRenderProps): React.ReactNode {
       // 요소 렌더링
     }
   }
   ```

3. **플러그인 등록**: `src/plugins/index.ts`에 등록

### 모범 사례

1. **구체적인 매칭**: `match()` 함수에서 정확하게 매칭
2. **속성 보존**: 파싱 중 모든 요소 속성 유지
3. **엣지 케이스 처리**: 빈 콘텐츠, 누락된 속성 등
4. **일관된 ID**: 새 요소에 고유 ID 생성
5. **선택 피드백**: 선택 시 명확한 시각적 피드백 표시
6. **클립보드 지원**: 복잡한 유형에 대한 클립보드 핸들러 구현

## 클립보드 핸들러 인터페이스

```typescript
interface ClipboardHandler {
  type: string;
  name: string;
  canHandle: (element: ParsedElement) => boolean;
  canPaste: (target: ParsedElement | null, clipboardData: ClipboardData) => boolean;
  copy: (element: ParsedElement) => ClipboardData | null;
  cut: (element: ParsedElement) => ClipboardData | null;
  paste: (target: ParsedElement | null, clipboardData: ClipboardData, context: PasteContext) => PasteResult;
}
```

### 클립보드 플로우

1. **복사/잘라내기**: 플러그인의 클립보드 핸들러가 ClipboardData 생성
2. **저장**: ClipboardManager가 데이터 저장
3. **붙여넣기**: 대상 컨텍스트가 붙여넣기 동작 결정
4. **변환**: 대상에 따라 데이터가 변환될 수 있음