# Loro Edit - Feature Specification

## Overview

Loro Edit is a minimalist WYSIWYG HTML editor built with React and TypeScript, featuring a plugin-based architecture for extensible element handling. The editor follows a content-first approach, maintaining design templates while allowing content editing.

## Core Architecture

### Design Philosophy
- **Content over structure**: Maintains design templates while allowing content editing
- **Selection-driven workflow**: Primary interactions are select, delete, copy, paste
- **Contextual tools**: Editing tools appear only when needed, at the right location
- **Keyboard-first**: Core shortcuts (Ctrl/Cmd + C/V/X, Delete) are primary interface

### Layout Structure
- **Left Panel (Section Sidebar)**: 
  - Width: 48 (w-48)
  - Shows section thumbnails with page numbers
  - Displays design block library
- **Middle Panel (Preview)**: 
  - 80% width when UI panels visible
  - 100% width when UI panels hidden
  - Responsive preview with device modes
- **Right Panel (Inspector)**: 
  - 20% width
  - Three tabs: History, Selection, Keyboard
  - Collapsible via Cmd+\

## Core Features

### 1. Selection System

#### Selection Modes
- **Block Mode**: Structural element selection
  - Visual overlay with blue border
  - Allows element manipulation (copy, cut, paste, delete)
  - Click on element to select
  
- **Text Mode**: Inline text editing
  - Direct text modification
  - Triggered by clicking on text elements in block mode
  - ESC to exit text mode

#### Selection State
```typescript
interface SelectionState {
  selectedElementId: string | null;
  mode: 'block' | 'text' | null;
}
```

### 2. Clipboard System

#### Universal Clipboard Operations
- **Copy (Cmd/Ctrl+C)**: Copies selected element
- **Cut (Cmd/Ctrl+X)**: Cuts selected element
- **Paste (Cmd/Ctrl+V)**: Pastes at selected location

#### Clipboard Architecture
- Plugin-based clipboard handlers
- Each element type can register its own clipboard handler
- Supports complex paste logic based on target context

### 3. Delete Behavior

#### Collection Elements (Fully Deleted)
- Sections
- Repeat containers
- Repeat items

#### Non-Collection Elements (Content Cleared)
- **Images**: `src` and `alt` attributes cleared
- **SVG**: `svgContent` cleared
- **Text**: `content` cleared
- **Regular elements**: `children` array cleared
- **Selection maintained** after content clear

### 4. History System (Undo/Redo)

#### Command Pattern Implementation
- All edits are commands with execute/undo methods
- Full state preservation for each command
- Keyboard shortcuts: Cmd/Ctrl+Z (undo), Cmd/Ctrl+Y or Cmd/Ctrl+Shift+Z (redo)

#### Supported Commands
- TextEditCommand
- DeleteElementCommand
- UniversalCopyCommand
- UniversalCutCommand
- UniversalPasteCommand
- MoveSectionCommand

### 5. UI Panel Management

#### Toggle UI (Cmd+\)
- Hides/shows left sidebar and right inspector
- Preview panel expands to full width when UI hidden
- Maintains preview controls visibility

## Plugin System

### Plugin Interface
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

### Default Plugins

#### 1. Text Plugin
- **Matches**: Text nodes and text-containing elements
- **Features**:
  - Inline text editing in text mode
  - Maintains text hierarchy (h1-h6, p, span, etc.)
  - Preserves text styling

#### 2. Image Plugin
- **Matches**: `<img>` and `<picture>` elements
- **Features**:
  - Click to upload new image
  - Drag & drop support
  - Empty state with upload prompt
  - Maintains aspect ratio

#### 3. SVG Plugin
- **Matches**: `<svg>` elements
- **Features**:
  - Renders inline SVG content
  - Preserves SVG attributes
  - Selection overlay support

#### 4. Section Plugin
- **Matches**: `<section>` elements
- **Features**:
  - Container for other elements
  - Supports drag & drop reordering
  - Thumbnail preview generation

#### 5. Repeat Container Plugin
- **Matches**: Elements with `data-repeat-container`
- **Features**:
  - Manages collections of repeat items
  - Add new items functionality
  - Supports copy/paste of items

#### 6. Database Plugin
- **Matches**: Elements with `data-database`
- **Features**:
  - Dynamic data fetching
  - Card and table view modes
  - Real-time data updates

#### 7. Element Plugin (Fallback)
- **Matches**: All other elements
- **Features**:
  - Generic element handling
  - Preserves DOM structure
  - Recursive child rendering

## Keyboard Shortcuts

### Navigation
- **Esc**: Clear selection

### Editing
- **Cmd/Ctrl+Z**: Undo
- **Cmd/Ctrl+Y** or **Cmd/Ctrl+Shift+Z**: Redo
- **Delete/Backspace**: Delete selected element

### Clipboard
- **Cmd/Ctrl+C**: Copy
- **Cmd/Ctrl+X**: Cut
- **Cmd/Ctrl+V**: Paste

### UI
- **Cmd/Ctrl+\\**: Toggle UI panels

## State Management

### Zustand Store Structure
```typescript
interface EditorStore {
  // Core state
  parsedElements: ParsedElement[];
  selection: SelectionState;
  
  // Actions
  setParsedElements: (elements: ParsedElement[]) => void;
  setSelection: (selection: SelectionState) => void;
  
  // Element operations
  handleTextChange: (elementId: string, content: string) => void;
  handleImageUpload: (elementId: string, file: File) => void;
  handleItemAdd: (containerId: string) => void;
  
  // Database operations
  handleDatabaseViewModeChange: (elementId: string, mode: 'cards' | 'table') => void;
  handleDatabaseSettingsUpdate: (elementId: string, settings: any) => void;
  handleDatabaseFetch: (elementId: string) => void;
}
```

## HTML Parsing

### Parse Flow
1. HTML string → DOM parsing
2. DOM traversal with plugin matching
3. ParsedElement tree generation
4. Element ID assignment
5. Plugin-based rendering

### Element Types
- TextElement
- ImageElement
- SvgElement
- RegularElement
- RepeatItemElement
- RepeatContainer
- DatabaseElement

## Inspector Panels

### History Inspector
- Shows command history
- Visual indicators for command types
- Undo/redo navigation
- Command descriptions

### Selection Inspector
- Current selection details
- Element properties
- Nested structure visualization

### Keyboard Inspector
- Real-time key press visualization
- Complete shortcut reference
- Platform-aware modifier keys
- Visual feedback for triggered shortcuts