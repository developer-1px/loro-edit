# Loro Edit - 기능 명세서

## 개요

Loro Edit는 React와 TypeScript로 구축된 미니멀리스트 WYSIWYG HTML 에디터로, 확장 가능한 요소 처리를 위한 플러그인 기반 아키텍처를 특징으로 합니다. 에디터는 콘텐츠 우선 접근 방식을 따르며, 콘텐츠 편집을 허용하면서 디자인 템플릿을 유지합니다.

## 핵심 아키텍처

### 디자인 철학
- **구조보다 콘텐츠**: 콘텐츠 편집을 허용하면서 디자인 템플릿 유지
- **선택 중심 워크플로**: 주요 상호작용은 선택, 삭제, 복사, 붙여넣기
- **맥락적 도구**: 편집 도구는 필요할 때만, 적절한 위치에 표시
- **키보드 우선**: 핵심 단축키(Ctrl/Cmd + C/V/X, Delete)가 주요 인터페이스

### 레이아웃 구조
- **왼쪽 패널 (섹션 사이드바)**: 
  - 너비: 48 (w-48)
  - 페이지 번호가 있는 섹션 썸네일 표시
  - 디자인 블록 라이브러리 표시
- **중앙 패널 (미리보기)**: 
  - UI 패널 표시 시 80% 너비
  - UI 패널 숨김 시 100% 너비
  - 디바이스 모드가 있는 반응형 미리보기
- **오른쪽 패널 (인스펙터)**: 
  - 20% 너비
  - 세 개의 탭: History, Selection, Keyboard
  - Cmd+\로 접기 가능

## 핵심 기능

### 1. 선택 시스템

#### 선택 모드
- **블록 모드**: 구조적 요소 선택
  - 파란색 테두리의 시각적 오버레이
  - 요소 조작 가능 (복사, 잘라내기, 붙여넣기, 삭제)
  - 요소 클릭으로 선택
  
- **텍스트 모드**: 인라인 텍스트 편집
  - 직접 텍스트 수정
  - 블록 모드에서 텍스트 요소 클릭으로 활성화
  - ESC로 텍스트 모드 종료

#### 선택 상태
```typescript
interface SelectionState {
  selectedElementId: string | null;
  mode: 'block' | 'text' | null;
}
```

### 2. 클립보드 시스템

#### 범용 클립보드 작업
- **복사 (Cmd/Ctrl+C)**: 선택된 요소 복사
- **잘라내기 (Cmd/Ctrl+X)**: 선택된 요소 잘라내기
- **붙여넣기 (Cmd/Ctrl+V)**: 선택된 위치에 붙여넣기

#### 클립보드 아키텍처
- 플러그인 기반 클립보드 핸들러
- 각 요소 유형은 자체 클립보드 핸들러 등록 가능
- 대상 컨텍스트에 따른 복잡한 붙여넣기 로직 지원

### 3. 삭제 동작

#### 컬렉션 요소 (완전 삭제)
- 섹션
- 반복 컨테이너
- 반복 아이템

#### 비컬렉션 요소 (콘텐츠만 삭제)
- **이미지**: `src`와 `alt` 속성 삭제
- **SVG**: `svgContent` 삭제
- **텍스트**: `content` 삭제
- **일반 요소**: `children` 배열 삭제
- 콘텐츠 삭제 후 **선택 상태 유지**

### 4. 히스토리 시스템 (실행 취소/다시 실행)

#### 커맨드 패턴 구현
- 모든 편집은 execute/undo 메서드를 가진 커맨드
- 각 커맨드에 대한 전체 상태 보존
- 키보드 단축키: Cmd/Ctrl+Z (실행 취소), Cmd/Ctrl+Y 또는 Cmd/Ctrl+Shift+Z (다시 실행)

#### 지원되는 커맨드
- TextEditCommand
- DeleteElementCommand
- UniversalCopyCommand
- UniversalCutCommand
- UniversalPasteCommand
- MoveSectionCommand

### 5. UI 패널 관리

#### UI 토글 (Cmd+\)
- 왼쪽 사이드바와 오른쪽 인스펙터 숨기기/표시
- UI 숨김 시 미리보기 패널이 전체 너비로 확장
- 미리보기 컨트롤 가시성 유지

## 플러그인 시스템

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
```

### 기본 플러그인

#### 1. 텍스트 플러그인
- **매칭**: 텍스트 노드와 텍스트 포함 요소
- **기능**:
  - 텍스트 모드에서 인라인 텍스트 편집
  - 텍스트 계층 유지 (h1-h6, p, span 등)
  - 텍스트 스타일 보존

#### 2. 이미지 플러그인
- **매칭**: `<img>`와 `<picture>` 요소
- **기능**:
  - 클릭으로 새 이미지 업로드
  - 드래그 앤 드롭 지원
  - 업로드 프롬프트가 있는 빈 상태
  - 종횡비 유지

#### 3. SVG 플러그인
- **매칭**: `<svg>` 요소
- **기능**:
  - 인라인 SVG 콘텐츠 렌더링
  - SVG 속성 보존
  - 선택 오버레이 지원

#### 4. 섹션 플러그인
- **매칭**: `<section>` 요소
- **기능**:
  - 다른 요소들의 컨테이너
  - 드래그 앤 드롭 재정렬 지원
  - 썸네일 미리보기 생성

#### 5. 반복 컨테이너 플러그인
- **매칭**: `data-repeat-container` 속성이 있는 요소
- **기능**:
  - 반복 아이템 컬렉션 관리
  - 새 아이템 추가 기능
  - 아이템 복사/붙여넣기 지원

#### 6. 데이터베이스 플러그인
- **매칭**: `data-database` 속성이 있는 요소
- **기능**:
  - 동적 데이터 가져오기
  - 카드 및 테이블 뷰 모드
  - 실시간 데이터 업데이트

#### 7. 요소 플러그인 (폴백)
- **매칭**: 다른 모든 요소
- **기능**:
  - 일반 요소 처리
  - DOM 구조 보존
  - 재귀적 자식 렌더링

## 키보드 단축키

### 탐색
- **Esc**: 선택 해제

### 편집
- **Cmd/Ctrl+Z**: 실행 취소
- **Cmd/Ctrl+Y** 또는 **Cmd/Ctrl+Shift+Z**: 다시 실행
- **Delete/Backspace**: 선택된 요소 삭제

### 클립보드
- **Cmd/Ctrl+C**: 복사
- **Cmd/Ctrl+X**: 잘라내기
- **Cmd/Ctrl+V**: 붙여넣기

### UI
- **Cmd/Ctrl+\\**: UI 패널 토글

## 상태 관리

### Zustand 스토어 구조
```typescript
interface EditorStore {
  // 핵심 상태
  parsedElements: ParsedElement[];
  selection: SelectionState;
  
  // 액션
  setParsedElements: (elements: ParsedElement[]) => void;
  setSelection: (selection: SelectionState) => void;
  
  // 요소 작업
  handleTextChange: (elementId: string, content: string) => void;
  handleImageUpload: (elementId: string, file: File) => void;
  handleItemAdd: (containerId: string) => void;
  
  // 데이터베이스 작업
  handleDatabaseViewModeChange: (elementId: string, mode: 'cards' | 'table') => void;
  handleDatabaseSettingsUpdate: (elementId: string, settings: any) => void;
  handleDatabaseFetch: (elementId: string) => void;
}
```

## HTML 파싱

### 파싱 플로우
1. HTML 문자열 → DOM 파싱
2. 플러그인 매칭과 함께 DOM 순회
3. ParsedElement 트리 생성
4. 요소 ID 할당
5. 플러그인 기반 렌더링

### 요소 유형
- TextElement
- ImageElement
- SvgElement
- RegularElement
- RepeatItemElement
- RepeatContainer
- DatabaseElement

## 인스펙터 패널

### 히스토리 인스펙터
- 커맨드 히스토리 표시
- 커맨드 유형별 시각적 표시
- 실행 취소/다시 실행 탐색
- 커맨드 설명

### 선택 인스펙터
- 현재 선택 상세 정보
- 요소 속성
- 중첩 구조 시각화

### 키보드 인스펙터
- 실시간 키 입력 시각화
- 전체 단축키 참조
- 플랫폼 인식 수정자 키
- 트리거된 단축키에 대한 시각적 피드백