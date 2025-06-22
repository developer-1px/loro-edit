# Loro Edit Documentation

이 문서는 Loro Edit 프로젝트의 요구사항과 구현 사항을 체계적으로 정리한 것입니다.

## 📚 문서 구조

### Core Features
- [Selection System](./selection-system.md) - 선택 시스템과 사용자 인터랙션
- [Plugin Architecture](./plugin-architecture.md) - 플러그인 시스템과 확장성
- [UI Components](./ui-components.md) - shadcn/ui 통합과 컴포넌트 사용

### Plugin Documentation
- [SVG Plugin](./svg-plugin.md) - SVG 편집 플러그인 구현
- [Text Plugin](./text-plugin.md) - 텍스트 편집 기능
- [Image Plugin](./image-plugin.md) - 이미지 처리 플러그인
- [Database Plugin](./database-plugin.md) - 데이터베이스 연동 기능

### Development
- [Development Guidelines](./development-guidelines.md) - 개발 가이드라인과 규칙
- [Design Philosophy](./design-philosophy.md) - 디자인 철학과 UX 원칙
- [Technical Requirements](./technical-requirements.md) - 기술적 요구사항과 제약사항

## 🎯 프로젝트 개요

Loro Edit은 Builder.io 스타일의 미니멀한 WYSIWYG HTML 에디터입니다. 플러그인 기반 아키텍처를 통해 다양한 HTML 요소를 처리하며, 직관적인 선택 시스템과 컨텍스트 기반 편집 도구를 제공합니다.

### 핵심 특징
- **선택 우선 워크플로우**: 먼저 선택하고, 그 다음 편집
- **미니멀한 UI**: 필요한 때만 나타나는 컨텍스트 도구
- **플러그인 확장성**: 새로운 요소 타입 쉽게 추가 가능
- **키보드 중심**: 주요 기능들의 키보드 단축키 지원

## 🚀 빠른 시작

```bash
# 프로젝트 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build
```

## 📋 요구사항 요약

### 완료된 기능
- ✅ SVG 플러그인 구현 (선택 기반 편집)
- ✅ Popover 기반 미니멀 UI
- ✅ document.elementsFromPoint 선택 시스템
- ✅ shadcn/ui 컴포넌트 통합
- ✅ Figma/FigJam 스타일 계층적 선택

### 개발 중인 기능
- 🔄 다른 플러그인들의 선택 기반 편집 적용
- 🔄 키보드 단축키 시스템 확장
- 🔄 접근성 향상

## 🤝 기여하기

새로운 플러그인이나 기능을 추가할 때는 [Development Guidelines](./development-guidelines.md)을 참고하세요.