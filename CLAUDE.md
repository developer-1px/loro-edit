# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a sophisticated React + TypeScript + Vite application featuring a plugin-based HTML editor with collaborative editing capabilities. The application provides a dual-panel interface for editing HTML content with real-time preview, using a plugin architecture for extensible element handling.

## Development Commands

- `pnpm dev` - Start development server with hot module replacement
- `pnpm build` - Build for production (runs TypeScript compiler first, then Vite build)
- `pnpm lint` - Run ESLint on the codebase
- `pnpm preview` - Preview production build locally

## Testing Convention

**IMPORTANT**: When testing changes, always use `pnpm build` instead of `pnpm dev` to ensure TypeScript compilation and proper validation of the changes. This catches type errors and ensures production compatibility.

## Package Manager

This project uses **pnpm** as the package manager (evidenced by `pnpm-lock.yaml`). Use `pnpm` commands instead of `npm` or `yarn`.

## Architecture Overview

### Core Technologies
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite with SWC plugin for fast compilation
- **State Management**: Zustand with temporal (undo/redo) capabilities via Zundo
- **Styling**: Tailwind CSS with PostCSS
- **UI Icons**: Lucide React and Huge Icons React
- **Keyboard Shortcuts**: react-hotkeys-hook
- **Linting**: ESLint with TypeScript and React-specific rules

### Application Structure

The application follows a plugin-based architecture centered around `src/components/PluginBasedEditor.tsx`:

#### Main Components
- **App.tsx** - Root component that renders PluginBasedEditor
- **PluginBasedEditor.tsx** - Main editor component with dual-panel layout (preview + HTML source)
- **UI Components** (`src/components/ui/`):
  - PreviewControls - Device mode selection, undo/redo, selection controls
  - PreviewPanel - Responsive preview area with element rendering
  - HtmlEditorPanel - HTML source code editor
  - ResizeHandle - Draggable panel resizer

#### Plugin System (`src/plugins/`)
The application uses a sophisticated plugin architecture for handling different HTML element types:

- **PluginManager.ts** - Singleton class managing plugin registration and element rendering
- **types.ts** - Plugin interfaces and type definitions
- **Individual Plugins**:
  - `text.tsx` - Text content handling
  - `image.tsx` - Image element management
  - `database.tsx` - Database view components with cards/table modes
  - `repeat-container.tsx` - Repeatable element containers
  - `section.tsx` - Section/container elements
  - `element.tsx` - Generic element fallback

**Plugin Registration**: Default plugins are registered in `src/plugins/index.ts` and automatically loaded on application startup.

#### State Management (`src/store/`)
- **editorStore.ts** - Zustand store with temporal middleware for:
  - HTML input and parsed elements
  - Selection state (block/text modes)
  - Clipboard operations for repeat items
  - Element manipulation (text changes, image updates, database operations)
  - Undo/redo functionality

#### Selection System
The editor implements a dual-mode selection system:
- **Block Mode**: Select entire elements for structural operations
- **Text Mode**: Edit text content inline within selected elements

#### Hooks (`src/hooks/`)
- **useEditorHotkeys** - Keyboard shortcut handling
- **useSelectionHandling** - Mouse/click selection logic
- **useResizeHandling** - Panel resizing functionality

### Key Features

1. **Plugin-Based Element Handling**: Each element type (text, image, database, etc.) has its own plugin with parse/render logic
2. **Dual-Panel Interface**: Live preview alongside HTML source editing
3. **Responsive Preview**: Mobile/tablet/desktop preview modes
4. **Undo/Redo System**: Full state history with temporal store
5. **Advanced Selection**: Block and text selection modes with visual feedback
6. **Copy/Cut/Paste**: Clipboard operations for repeatable elements
7. **Database Integration**: Dynamic data fetching and display in cards/table views
8. **Real-time Parsing**: HTML changes instantly reflected in preview

### Plugin Development Guidelines

When creating new plugins:
1. Implement the `Plugin` interface from `src/plugins/types.ts`
2. Define `match()` function to identify when plugin should handle an element
3. Implement `parse()` to extract data from DOM elements
4. Create `render()` function returning React components
5. Register plugin in `src/plugins/index.ts`

### Data Flow

1. HTML input → HTML parser (`src/utils/htmlParser.ts`)
2. DOM elements → Plugin system parsing → ParsedElement objects
3. ParsedElement objects → Plugin rendering → React components
4. User interactions → Store actions → State updates → Re-rendering

## TypeScript Configuration

The project uses a composite TypeScript setup:
- `tsconfig.json` - Root configuration referencing app and node configs
- `tsconfig.app.json` - Application-specific TypeScript settings
- `tsconfig.node.json` - Node.js/build tool specific settings