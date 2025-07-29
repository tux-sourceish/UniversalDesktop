# Universal Context Menu Integration Guide

## 🌌 Philosophy

The Universal Context Menu is the skeleton key that unlocks every feature in UniversalDesktop. It's not just a menu - it's an interactive cheatsheet, keyboard shortcut teacher, and universal interaction pattern for ALL UI elements.

## 🎯 Core Concepts

### 1. Context-Aware Actions
Every element type has specific actions that make sense for it:
- **Files**: Open, Rename, Delete, Transform to .ud
- **Folders**: Navigate, Create new files, Transform to workspace
- **Canvas**: Create new items, Navigation controls
- **Windows**: Minimize, Maximize, Add to AI context
- **Text**: Cut, Copy, Paste, Select All

### 2. Keyboard Shortcut Teaching
Each action shows its keyboard shortcut and explains why it might be disabled.

### 3. Live Previews
Actions can provide previews of what will happen when executed.

## 🔧 Integration Patterns

### Basic Integration

```tsx
import { μ7_UniversalContextMenu, useUniversalContextMenu } from './contextMenu/μ7_UniversalContextMenu';

const MyComponent = () => {
  const { contextMenu, showContextMenu, hideContextMenu } = useUniversalContextMenu();

  const handleContextMenu = (event: React.MouseEvent, element: any) => {
    event.preventDefault();
    showContextMenu(event, element, 'window'); // or 'file', 'folder', 'canvas', etc.
  };

  return (
    <div onContextMenu={(e) => handleContextMenu(e, myElement)}>
      {/* Your component content */}
      
      <μ7_UniversalContextMenu
        element={contextMenu.element}
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        contextType={contextMenu.contextType}
        onClose={hideContextMenu}
        onItemAction={handleAction}
        // ... other props
      />
    </div>
  );
};
```

### Custom Action Handlers

```tsx
const handleAction = (action: string, element?: any) => {
  switch (action) {
    case 'custom-action':
      // Handle your custom action
      console.log('Custom action triggered:', element);
      break;
    
    case 'transform-to-ud':
      // Transform element to UniversalDocument format
      const udItem = {
        type: UDFormat.ItemType.VARIABLE,
        title: element.name,
        content: element.data,
        position: { x: 100, y: 100, z: 1 }
      };
      onCreateUDItem?.(udItem);
      break;
    
    default:
      console.log('Unhandled action:', action, element);
  }
};
```

## 🎨 Context Types

### 1. Canvas Context
**When to use**: Right-clicking on empty canvas space
**Available actions**: Create new items, navigation controls, AI assistance

```tsx
showContextMenu(event, null, 'canvas');
```

### 2. Window Context  
**When to use**: Right-clicking on window title bars or window content
**Available actions**: Window management, AI context, transformations

```tsx
showContextMenu(event, windowItem, 'window');
```

### 3. File Context
**When to use**: Right-clicking on files in file manager
**Available actions**: Open, rename, delete, transform to workspace

```tsx
showContextMenu(event, fileItem, 'file');
```

### 4. Folder Context
**When to use**: Right-clicking on folders in file manager  
**Available actions**: Navigate, create new files, transform to .ud archive

```tsx
showContextMenu(event, folderItem, 'folder');
```

### 5. Content Context
**When to use**: Right-clicking on text/content within windows
**Available actions**: Text editing, AI text improvements, formatting

```tsx
showContextMenu(event, selection, 'content');
```

### 6. Selection Context
**When to use**: Right-clicking on selected text or elements
**Available actions**: Cut, copy, AI explanation, formatting

```tsx
showContextMenu(event, selectedContent, 'selection');
```

## 🏗️ Extending the System

### Adding New Context Types

1. **Define the context type**:
```tsx
type ContextType = 'canvas' | 'window' | 'file' | 'folder' | 'content' | 'selection' | 'my-new-type';
```

2. **Add actions in getActionsForElement**:
```tsx
if (contextType === 'my-new-type') {
  actions.push({
    title: 'My Actions',
    baguaCategory: 'DONNER',
    items: [
      {
        id: 'my-action',
        label: 'My Custom Action',
        icon: '⚡',
        shortcut: 'Ctrl+M',
        baguaCategory: 'DONNER',
        enabled: true,
        preview: () => 'This will do something awesome',
        action: () => handleMyAction(element)
      }
    ]
  });
}
```

### Custom Action Properties

```tsx
interface UniversalContextAction {
  id: string;                    // Unique identifier
  label: string;                 // Display text
  icon: string;                  // Emoji or icon
  shortcut?: string;             // Keyboard shortcut
  baguaCategory: BaguaCategory;  // Philosophical category
  enabled: boolean;              // Whether action is available
  submenu?: UniversalContextAction[]; // Nested actions
  preview?: () => string;        // Preview description
  description?: string;          // Detailed description
  disabledReason?: string;       // Why action is disabled
  action: () => void;           // Action handler
}
```

## 🎓 Teaching Mode Features

### Keyboard Shortcuts
Every action displays its keyboard shortcut in a styled badge:
- Shows the actual key combination
- Explains when shortcuts are available
- Teaches users efficient workflows

### Disabled Actions
When actions are disabled, the menu shows:
- Why the action isn't available
- What conditions need to be met
- Suggestions for alternative actions

### Preview System
Actions can provide live previews:
```tsx
preview: () => {
  if (hasSelection) {
    return 'Copy selected content to clipboard';
  }
  return 'Select content first to copy';
}
```

## 🌟 Best Practices

### 1. Context Sensitivity
Only show actions that make sense for the current element:
```tsx
enabled: elementType === 'file' && !element.isDirectory
```

### 2. Clear Labels
Use descriptive action names:
- ✅ "Transform to .ud Document"
- ❌ "Convert"

### 3. Helpful Icons
Choose intuitive icons:
- 📁 for file operations
- ✂️ for cut operations
- 🌌 for UniversalDesktop-specific actions

### 4. Keyboard Shortcuts
Follow standard conventions:
- Ctrl+C for copy
- F2 for rename
- Delete for delete

### 5. Error Handling
Always handle edge cases:
```tsx
enabled: element && element.canBeRenamed && !element.isReadonly,
disabledReason: !element ? 'No element selected' : 
                element.isReadonly ? 'File is read-only' : 
                'Cannot rename this item'
```

## 🚀 Performance Considerations

### 1. Lazy Action Generation
Generate actions only when menu is shown:
```tsx
const menuSections = useMemo(() => {
  return getActionsForElement(element, contextType);
}, [element, contextType, getActionsForElement]);
```

### 2. Event Cleanup
Always clean up event listeners:
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  if (visible) {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }
}, [visible, onClose]);
```

### 3. Memoized Callbacks
Use useCallback for action handlers:
```tsx
const handleAction = useCallback((action: string, element?: any) => {
  // Handle action
}, [dependencies]);
```

## 🔮 Future Enhancements

### 1. Machine Learning
- Learn from user action patterns
- Suggest frequently used actions
- Predict what user wants to do

### 2. Voice Commands
- "Open file manager" 
- "Create new note"
- "Transform to document"

### 3. Gesture Support
- Touch gestures on tablets
- Mouse gesture recognition
- Spatial gestures in VR/AR

### 4. Theme Integration
- Dark/light mode support
- Color coding by Bagua category
- Accessibility improvements

## 📊 Integration Checklist

Before integrating the Universal Context Menu:

- [ ] Identify all elements that need context menus
- [ ] Define appropriate context types for each element
- [ ] List all possible actions for each context
- [ ] Implement keyboard shortcuts for major actions
- [ ] Add preview descriptions for complex actions
- [ ] Test with different system states (loading, error, etc.)
- [ ] Verify accessibility (keyboard navigation, screen readers)
- [ ] Test performance with large numbers of elements
- [ ] Document custom actions and context types
- [ ] Train users on new interaction patterns

## 🎯 Success Metrics

A well-integrated Universal Context Menu should:

1. **Reduce clicks** - Users can access any function in 2 clicks max
2. **Teach shortcuts** - Users learn keyboard shortcuts naturally
3. **Prevent errors** - Clear feedback on why actions are disabled
4. **Feel intuitive** - Actions appear where users expect them
5. **Scale well** - Performance remains good with many elements
6. **Stay consistent** - Same patterns work across all components

---

*The Universal Context Menu is your gateway to UniversalDesktop mastery. Use it wisely!* 🌌