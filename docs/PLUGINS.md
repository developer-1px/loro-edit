# Plugin System Documentation

## Plugin Architecture

### Core Concepts

Each plugin in Loro Edit is responsible for handling a specific type of HTML element. Plugins follow a consistent interface and lifecycle:

1. **Matching**: Determine if the plugin can handle a given DOM element
2. **Parsing**: Extract data from DOM element into a ParsedElement
3. **Rendering**: Convert ParsedElement back to React components
4. **Clipboard Handling**: Optional clipboard operations

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

## Plugin Specifications

### 1. Text Plugin (`text.tsx`)

**Purpose**: Handle all text content including headings, paragraphs, and inline text.

**Matches**:
- Text nodes (nodeType === 3)
- Elements containing only text content

**Behavior**:
- Block mode: Shows selection overlay
- Text mode: Enables inline editing with contentEditable
- Preserves text hierarchy (h1-h6, p, span, etc.)
- Handles keyboard events for text editing
- Supports undo/redo for text changes

**Special Cases**:
- Empty text nodes are preserved
- Whitespace is maintained
- HTML entities are properly encoded/decoded

### 2. Image Plugin (`image.tsx`)

**Purpose**: Handle image elements with upload and display capabilities.

**Matches**:
- `<img>` elements
- `<picture>` elements

**Behavior**:
- Empty state: Shows upload prompt
- Click to upload: Opens file picker
- Drag & drop: Accepts image files
- Maintains aspect ratio
- Shows loading state during upload
- Preserves all image attributes

**Delete Behavior**:
- Clears `src` and `alt` attributes
- Maintains element structure
- Selection remains active

### 3. SVG Plugin (`svg.tsx`)

**Purpose**: Render and manage inline SVG content.

**Matches**:
- `<svg>` elements

**Behavior**:
- Renders SVG content inline
- Preserves all SVG attributes
- Supports selection overlay
- Maintains viewBox and dimensions

**Delete Behavior**:
- Clears `svgContent`
- Maintains element structure
- Selection remains active

### 4. Section Plugin (`section.tsx`)

**Purpose**: Container elements for organizing content.

**Matches**:
- `<section>` elements

**Behavior**:
- Acts as container for other elements
- Supports drag & drop reordering
- Generates thumbnail previews
- Recursive child rendering
- Shows in section sidebar

**Delete Behavior**:
- Fully removes section and all children
- Clears selection

**Clipboard**:
- Copies entire section with children
- Pastes as new section

### 5. Repeat Container Plugin (`repeat-container.tsx`)

**Purpose**: Manage collections of repeatable items.

**Matches**:
- Elements with `data-repeat-container` attribute

**Behavior**:
- Displays collection of repeat items
- "Add Item" button at the end
- Each item is independently selectable
- Supports item reordering

**Structure**:
```html
<div data-repeat-container="items">
  <div data-repeat-item="item-1">...</div>
  <div data-repeat-item="item-2">...</div>
</div>
```

### 6. Repeat Item Plugin (`repeat-item.tsx`)

**Purpose**: Individual items within repeat containers.

**Matches**:
- Elements with `data-repeat-item` attribute

**Behavior**:
- Selectable as individual unit
- Can be copied/cut/pasted
- Maintains unique repeat-item ID

**Delete Behavior**:
- Fully removes from container
- Updates container item list

**Clipboard**:
- Copies with new unique ID
- Can only paste into repeat containers

### 7. Database Plugin (`database.tsx`)

**Purpose**: Dynamic data display with multiple view modes.

**Matches**:
- Elements with `data-database` attribute

**Behavior**:
- Fetches data from API endpoint
- Two view modes: cards and table
- Real-time data updates
- Column configuration
- Loading states

**Structure**:
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

### 8. Element Plugin (`element.tsx`)

**Purpose**: Fallback handler for all other HTML elements.

**Matches**:
- Any element not matched by other plugins

**Behavior**:
- Preserves element type and attributes
- Recursive child rendering
- Generic selection handling
- Maintains DOM structure

**Common Elements**:
- `<div>`, `<span>`, `<button>`
- `<ul>`, `<ol>`, `<li>`
- `<table>`, `<tr>`, `<td>`
- Any custom elements

## Plugin Registration

Plugins are registered in priority order in `src/plugins/index.ts`:

```typescript
export function registerDefaultPlugins(): void {
  // Clear existing plugins
  pluginManager.clear();
  
  // Register in priority order
  pluginManager.register(new TextPlugin());
  pluginManager.register(new ImagePlugin());
  pluginManager.register(new SvgPlugin());
  pluginManager.register(new RepeatItemPlugin());
  pluginManager.register(new RepeatContainerPlugin());
  pluginManager.register(new SectionPlugin());
  pluginManager.register(new DatabasePlugin());
  pluginManager.register(new ElementPlugin()); // Fallback
}
```

## Plugin Development Guidelines

### Creating a New Plugin

1. **Create plugin file** in `src/plugins/`
2. **Implement Plugin interface**:
   ```typescript
   export class MyPlugin implements Plugin {
     name = 'my-plugin';
     selectable = { selectable: true, mode: 'block' };
     
     match(element: Element): boolean {
       // Return true if this plugin handles the element
     }
     
     parse(element: Element): ParsedElement | null {
       // Convert DOM to ParsedElement
     }
     
     render(props: PluginRenderProps): React.ReactNode {
       // Render the element
     }
   }
   ```

3. **Register plugin** in `src/plugins/index.ts`

### Best Practices

1. **Specific matching**: Be precise in the `match()` function
2. **Preserve attributes**: Maintain all element attributes during parse
3. **Handle edge cases**: Empty content, missing attributes, etc.
4. **Consistent IDs**: Generate unique IDs for new elements
5. **Selection feedback**: Show clear visual feedback when selected
6. **Clipboard support**: Implement clipboard handler for complex types

## Clipboard Handler Interface

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

### Clipboard Flow

1. **Copy/Cut**: Plugin's clipboard handler creates ClipboardData
2. **Storage**: ClipboardManager stores the data
3. **Paste**: Target context determines paste behavior
4. **Transform**: Data may be transformed based on target