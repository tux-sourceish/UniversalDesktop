# 📝 μX-Bagua File Rename Plan - Consistency Upgrade

**Ziel:** Alle aktiven Dateien mit korrekten μX-Präfixen gemäß Raimunds Bagua-System

---

## 🔍 **CURRENT STATUS ANALYSIS**

### ✅ **ALREADY μX-PREFIXED (Keep as-is):**
```
components/factories/μ1_WindowFactory.tsx         ✅ HIMMEL
components/panels/µ2_AIPanel.tsx                  ✅ WIND  
components/panels/µ2_ToolPanel.tsx                ✅ WIND
components/panels/µ5_TerritoryPanel.tsx           ✅ SEE
components/panels/µ6_ContextPanel.tsx             ✅ FEUER
components/windows/μ2_TableWindow.tsx             ✅ WIND
components/windows/μ2_TuiWindow.tsx               ✅ WIND
components/windows/μ8_NoteWindow.tsx              ✅ ERDE
components/µ1_Header.tsx                          ✅ HIMMEL
hooks/µ1_useUniversalDocument.ts                  ✅ HIMMEL
hooks/µ1_useWorkspace.ts                          ✅ HIMMEL  
hooks/µ2_useBaguaColors.ts                        ✅ WIND
hooks/µ2_useMinimap.ts                            ✅ WIND
hooks/µ3_useNavigation.ts                         ✅ WASSER
hooks/µ6_useContextManager.ts                     ✅ FEUER
hooks/µ8_usePanelLayout.ts                        ✅ ERDE
modules/µ2_Minimap.tsx                            ✅ WIND
services/µ1_supabaseUDService.ts                  ✅ HIMMEL
```

---

## 🔄 **RENAME REQUIRED - Active Files**

### **🏗️ Components (Active):**
```bash
# Core Components - Need μX Prefix:
src/components/DesktopItem.tsx                 → μ8_DesktopItem.tsx      # ERDE (Base item)

# Potential Duplicates - CHECK & REMOVE:
src/components/NoteWindow.tsx                  → DELETE? (Duplikat von μ8_NoteWindow.tsx)
src/components/TableWindow.tsx                 → DELETE? (Duplikat von μ2_TableWindow.tsx)  
src/components/TuiWindow.tsx                   → DELETE? (Duplikat von μ2_TuiWindow.tsx)
```

### **🪝 Hooks (Active):**
```bash
# Core Hooks - Need μX Prefix:
src/hooks/useAIAgent.ts                        → μ6_useAIAgent.ts         # FEUER (Functions)
src/hooks/useCanvasNavigation.ts               → μ3_useCanvasNavigation.ts # WASSER (Flow)
src/hooks/useWindowManager.ts                  → μ1_useWindowManager.ts   # HIMMEL (Templates)
src/hooks/useTerritoryManager.ts               → μ5_useTerritoryManager.ts # SEE (Properties)
src/hooks/useKeyboardShortcuts.ts              → μ7_useKeyboardShortcuts.ts # DONNER (Events)
src/hooks/useDraggable.ts                      → μ7_useDraggable.ts       # DONNER (Events)
src/hooks/useResizable.ts                      → μ7_useResizable.ts       # DONNER (Events)

# Potential Duplicates - CHECK & REMOVE:
src/hooks/useMinimap.ts                        → DELETE? (Duplikat von μ2_useMinimap.ts)
src/hooks/useContextManager.ts                 → DELETE? (Duplikat von μ6_useContextManager.ts)
```

### **🏛️ Modules (Active):**
```bash
# Core Modules - Need μX Prefix:
src/modules/AuthModule.tsx                     → μ4_AuthModule.tsx        # BERG (Init/Setup)
src/modules/CanvasModule.tsx                   → μ8_CanvasModule.tsx      # ERDE (Global/Base)  
src/modules/ContextModule.tsx                  → μ6_ContextModule.tsx     # FEUER (Functions)
src/modules/DataModule.tsx                     → μ8_DataModule.tsx        # ERDE (Global/Base)
src/modules/PanelModule.tsx                    → μ2_PanelModule.tsx       # WIND (Views/UI)
```

### **🔧 Services (Active):**
```bash
# Core Services - Need μX Prefix:
src/services/litellmClient.ts                  → μ6_litellmClient.ts      # FEUER (Functions)
src/services/supabaseClient.ts                 → μ8_supabaseClient.ts     # ERDE (Global/Base)
src/services/ClipboardService.ts               → μ7_ClipboardService.ts   # DONNER (Events)
src/services/WindowSizingService.ts            → μ5_WindowSizingService.ts # SEE (Properties)
```

---

## 🌉 **BRIDGE FILES - Special Handling**

### **Keep Bridge Prefix (V1→V2 Transition):**
```bash
# These are temporary compatibility layers:
src/components/bridges/CanvasController.tsx    → KEEP (Bridge während V2 Migration)
src/components/bridges/FileManagerWindow.tsx   → KEEP (Bridge während V2 Migration)
src/components/bridges/MinimapWidget.tsx       → KEEP (Bridge während V2 Migration)  
src/components/bridges/PanelSidebar.tsx        → KEEP (Bridge während V2 Migration)
```

---

## ❓ **LEGACY/UNUSED - Evaluate**

### **Context System (TODO V2 Revival):**
```bash
# These need V2 integration:
src/components/ContextManager.tsx              → μ6_ContextManager.tsx?   # FEUER (Functions)
src/components/ContextMenuActions.tsx          → μ7_ContextMenuActions.tsx? # DONNER (Events)
src/components/ContextMenu.tsx                 → μ7_ContextMenu.tsx?      # DONNER (Events)
src/components/ImHexContextMenu.tsx            → μ7_ImHexContextMenu.tsx? # DONNER (Events)
src/components/UnifiedContextMenu.tsx          → μ7_UnifiedContextMenu.tsx? # DONNER (Events)
```

### **Legacy Components:**
```bash
# Check if still needed:
src/components/StarCraftMinimap.tsx            → μ2_StarCraftMinimap.tsx? # WIND (Views)
src/components/PerformanceControlsPanel.tsx    → μ5_PerformanceControlsPanel.tsx? # SEE (Properties)
src/components/LoginPage.tsx                   → μ4_LoginPage.tsx?        # BERG (Init/Setup)
src/components/ErrorBoundary.tsx               → μ8_ErrorBoundary.tsx?    # ERDE (Global/Base)
```

### **Legacy Hooks:**
```bash
# Check if still needed:
src/hooks/UDDocument.ts                        → μ8_UDDocument.ts?        # ERDE (Global/Base)
src/hooks/UDFormat.ts                          → μ8_UDFormat.ts?          # ERDE (Global/Base)
src/hooks/UDMinimapIntegration.ts              → μ2_UDMinimapIntegration.ts? # WIND (Views)
src/hooks/UniversalDocumentV2.ts               → μ1_UniversalDocumentV2.ts? # HIMMEL (Templates)
src/hooks/useClipboardManager.ts               → μ7_useClipboardManager.ts? # DONNER (Events)
src/hooks/useFileManager.ts                    → μ8_useFileManager.ts?    # ERDE (Global/Base)
src/hooks/usePanelManager.ts                   → μ2_usePanelManager.ts?   # WIND (Views)
```

---

## 🎯 **RECOMMENDED ACTION PLAN**

### **Phase 1: Core Renames (High Priority)**
```bash
# 1. Active Components:
git mv src/components/DesktopItem.tsx src/components/μ8_DesktopItem.tsx

# 2. Active Hooks:
git mv src/hooks/useAIAgent.ts src/hooks/μ6_useAIAgent.ts
git mv src/hooks/useCanvasNavigation.ts src/hooks/μ3_useCanvasNavigation.ts  
git mv src/hooks/useWindowManager.ts src/hooks/μ1_useWindowManager.ts
git mv src/hooks/useTerritoryManager.ts src/hooks/μ5_useTerritoryManager.ts
git mv src/hooks/useKeyboardShortcuts.ts src/hooks/μ7_useKeyboardShortcuts.ts
git mv src/hooks/useDraggable.ts src/hooks/μ7_useDraggable.ts
git mv src/hooks/useResizable.ts src/hooks/μ7_useResizable.ts

# 3. Active Modules:
git mv src/modules/AuthModule.tsx src/modules/μ4_AuthModule.tsx
git mv src/modules/CanvasModule.tsx src/modules/μ8_CanvasModule.tsx
git mv src/modules/ContextModule.tsx src/modules/μ6_ContextModule.tsx  
git mv src/modules/DataModule.tsx src/modules/μ8_DataModule.tsx
git mv src/modules/PanelModule.tsx src/modules/μ2_PanelModule.tsx

# 4. Active Services:
git mv src/services/litellmClient.ts src/services/μ6_litellmClient.ts
git mv src/services/supabaseClient.ts src/services/μ8_supabaseClient.ts
git mv src/services/ClipboardService.ts src/services/μ7_ClipboardService.ts
git mv src/services/WindowSizingService.ts src/services/μ5_WindowSizingService.ts
```

### **Phase 2: Check for Duplicates**
```bash
# Compare and potentially remove duplicates:
diff src/components/NoteWindow.tsx src/components/windows/μ8_NoteWindow.tsx
diff src/components/TableWindow.tsx src/components/windows/μ2_TableWindow.tsx
diff src/components/TuiWindow.tsx src/components/windows/μ2_TuiWindow.tsx
diff src/hooks/useMinimap.ts src/hooks/μ2_useMinimap.ts
diff src/hooks/useContextManager.ts src/hooks/μ6_useContextManager.ts

# If identical → DELETE the non-μX versions
```

### **Phase 3: Update All Imports**
```bash
# After renaming, fix all import statements:
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/from "\.\.\/DesktopItem"/from "\.\.\/μ8_DesktopItem"/g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/useAIAgent/μ6_useAIAgent/g'
# ... etc for all renamed files
```

---

## ⚠️ **CRITICAL CONSIDERATIONS**

### **Import Updates Required:**
Nach jedem Rename müssen **alle Import-Statements** aktualisiert werden:
```typescript
// BEFORE:
import { DesktopItem } from './components/DesktopItem';
import { useAIAgent } from './hooks/useAIAgent';

// AFTER:  
import { μ8_DesktopItem } from './components/μ8_DesktopItem';
import { μ6_useAIAgent } from './hooks/μ6_useAIAgent';
```

### **Export Updates Required:**
Alle **named exports** müssen ebenfalls μX-Präfixe bekommen:
```typescript
// BEFORE:
export const DesktopItem: React.FC = () => {};

// AFTER:
export const μ8_DesktopItem: React.FC = () => {};
```

### **Build System Impact:**
- **Vite Hot-Reload**: Funktioniert weiterhin
- **TypeScript**: Alle Imports/Exports müssen konsistent sein
- **ESLint**: Eventuelle Naming-Rules anpassen

---

## 🤔 **QUESTIONS FOR DECISION**

1. **Duplicate Files**: Sollen die Non-μX Duplikate sofort gelöscht werden?
2. **Bridge Files**: μX-Präfixe auch für Bridge-Components?
3. **Legacy Context System**: Komplette μX-Umbenennung oder warten auf V2 Revival?
4. **Git History**: `git mv` bewahrt History, ist das gewünscht?
5. **Phased Approach**: Alles auf einmal oder schrittweise?

---

## 🎯 **RECOMMENDED APPROACH**

**Ich empfehle einen schrittweisen Ansatz:**

1. **Start mit eindeutigen Fällen** (keine Duplikate)
2. **Teste nach jedem Rename** dass Build funktioniert  
3. **Update Imports systematisch** mit find/replace
4. **Dokumentiere Änderungen** für ARCHITECTURE.md Update

**Soll ich mit Phase 1 starten?** 🚀