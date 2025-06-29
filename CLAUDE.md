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

## Design Philosophy

The editor follows a minimalist approach inspired by Builder.io-style WYSIWYG editors:
- **Content over structure**: Maintains design templates while allowing content editing
- **Selection-driven workflow**: Primary interactions are select, delete, copy, paste
- **Contextual tools**: Editing tools appear only when needed, at the right location
- **Keyboard-first**: Core shortcuts (Ctrl/Cmd + C/V, Delete) are primary interface

## Architecture Overview

### Core Technologies
- **Frontend Framework**: React 19 with TypeScript (strict mode)
- **Build Tool**: Vite with SWC plugin for fast compilation
- **State Management**: Zustand with temporal (undo/redo) capabilities via Zundo  
- **Styling**: Tailwind CSS with PostCSS
- **UI Components**: Radix UI primitives (Dialog, Popover, Select, etc.)
- **UI Icons**: Lucide React and Huge Icons React
- **Keyboard Shortcuts**: react-hotkeys-hook
- **Common Utilities**: react-use library for reusable patterns
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
  - `link.tsx` - Link editing with contextual popup
  - `table.tsx` - Table elements with API data integration
  - `form.tsx` - Form element handling
  - `database.tsx` - Database view components with cards/table modes
  - `repeat-container.tsx` - Repeatable element containers
  - `repeat-item.tsx` - Individual items within repeat containers
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
- **floatingUIStore.ts** - Manages floating UI state for contextual menus

#### Features (`src/features/`)
Modular feature implementations:
- **clipboard/** - Copy/cut/paste operations with hotkeys
- **floating-ui/** - Contextual floating menus and link editing
- **history/** - Undo/redo system with command pattern
- **selection/** - Selection handling, keyboard navigation, and visual indicators

#### Selection System
The editor implements a dual-mode selection system:
- **Block Mode**: Select entire elements for structural operations
- **Text Mode**: Edit text content inline within selected elements

#### Hooks (`src/hooks/`)
- **useEditorHotkeys** - Keyboard shortcut handling  
- **useSelectionHandling** - Mouse/click selection logic
- **useResizeHandling** - Panel resizing functionality
- **useClipboardOperations** - Copy/cut/paste operations
- **useModalForm** - Modal dialog management
- **useAsyncOperation** - Async operation handling
- **useDeepTreeOperations** - Deep tree manipulation utilities

### Key Features

1. **Plugin-Based Element Handling**: Each element type (text, image, database, etc.) has its own plugin with parse/render logic
2. **Dual-Panel Interface**: Live preview alongside HTML source editing
3. **Responsive Preview**: Mobile/tablet/desktop preview modes
4. **Undo/Redo System**: Full state history with temporal store
5. **Advanced Selection**: Block and text selection modes with visual feedback
6. **Copy/Cut/Paste**: Clipboard operations for repeatable elements
7. **Database Integration**: Dynamic data fetching and display in cards/table views
8. **Real-time Parsing**: HTML changes instantly reflected in preview
9. **Floating UI**: Contextual menus that appear near selected elements
10. **Link Editing**: Click-through link editing with child element support

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

Key TypeScript paths configured:
- `@/*` → `./src/*` - Use this import alias for all src imports

## Development Guidelines

### Code Style Requirements
- Use TypeScript strict mode (no `any` types)
- Implement functional components with React.FC
- Use React Hooks pattern consistently
- Follow ESLint rules without exceptions
- Apply Tailwind CSS for all styling
- Use path aliases (`@/`) for imports from src directory

### Minimalist Code Conventions
- **Prefer concise, declarative code**: Write the smallest amount of code that clearly expresses intent
- **Avoid unnecessary abstractions**: Don't create layers of abstraction unless they solve real complexity
- **Single responsibility**: Each function/component should do one thing well
- **Eliminate redundancy**: Remove duplicate logic, unused variables, and dead code
- **Minimal dependencies**: Use native browser APIs and React hooks before adding external libraries
- **Inline small utilities**: Don't extract 1-2 line functions unless reused multiple times
- **Direct state updates**: Prefer simple state changes over complex action patterns
- **Essential comments only**: Code should be self-documenting; comments only for non-obvious business logic

### Plugin Development Process
When adding new element types:
1. Create plugin file in `src/plugins/` implementing the `Plugin` interface
2. Define `match()` function to identify target elements
3. Implement `parse()` for DOM → ParsedElement conversion
4. Create `render()` function returning React components
5. Register plugin in `src/plugins/index.ts`
6. Test with `pnpm build` to ensure type safety

### State Management Rules
- Use Zustand store (`src/store/editorStore.ts`) for all state
- Maintain immutability in state updates
- Leverage temporal middleware for undo/redo
- Distinguish between block/text selection modes
- Handle clipboard operations through store actions

### Selection System Implementation
- **Block Mode**: Structural element selection and manipulation
- **Text Mode**: Inline text editing within selected elements  
- **Visual Feedback**: Clear selection indicators and overlays
- **Keyboard Navigation**: Full keyboard shortcut support

### Performance Optimization
- Use React.memo, useMemo, useCallback appropriately
- Avoid unnecessary re-renders through proper state management
- Optimize plugin matching logic for large DOM trees
- Implement efficient clipboard operations

## UI Design Conventions

### Compact Application-Like Interface
The UI should always prioritize compactness and efficiency, resembling professional desktop applications rather than spacious web interfaces:

#### General Principles
- **Dense Information Display**: Maximize content visibility with minimal chrome
- **Small, Precise Controls**: Use compact buttons, inputs, and menus
- **Dark Theme for Tools**: Floating menus and toolbars use dark backgrounds (gray-900)
- **Minimal Padding**: Reduce spacing to essential amounts only
- **Professional Aesthetics**: Clean, sharp edges with subtle shadows

#### Specific Guidelines

##### Floating Menus
- Background: `bg-gray-900` (dark theme)
- Padding: `px-0.5 py-0.5` for containers, `px-2.5 py-1.5` for buttons
- Text size: `text-xs` (12px) for labels
- Icons: Small sizes (12-16px), typically `w-3.5 h-3.5`
- Hover states: Subtle color changes (`hover:bg-gray-800`)
- Active states: Amber accent (`bg-amber-500 text-gray-900`)

##### Popovers and Dialogs
- Width: Constrained (`w-48`, `w-60`, `w-80` max)
- Dark backgrounds with light borders (`bg-gray-900 border-gray-800`)
- Compact headers and footers
- Small form controls with reduced padding

##### Selection Overlays
- Thin borders (2px)
- Small labels with minimal padding (`padding: 4px 8px`)
- Tiny font sizes (`fontSize: 12px`)
- Positioned close to selected elements

##### Buttons and Controls
- Small heights (`h-6`, `h-7` for action buttons)
- Reduced padding (`px-2`, `px-3`)
- Compact text (`text-xs`)
- Grouped controls with minimal gaps (`gap-0.5`, `gap-1`)

#### Examples
```tsx
// Compact floating menu
<div className="bg-gray-900 rounded-md shadow-xl px-0.5 py-0.5 flex items-center gap-0.5">
  <button className="px-2.5 py-1.5 text-xs hover:bg-gray-800">
    <Icon className="w-3.5 h-3.5" />
  </button>
</div>

// Small popover
<PopoverContent className="w-48 p-2 bg-gray-900 border-gray-800">
  // Compact content
</PopoverContent>
```

This approach creates a professional, efficient interface that maximizes usable space while maintaining excellent usability.