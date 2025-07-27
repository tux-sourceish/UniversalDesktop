# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚧 CURRENT BUILD STATUS (Dezember 2024)

**✅ BUILD STATUS: GREEN** - Alle kritischen Build-Fehler behoben!

**TypeScript Errors:** ~15 harmless unused variable warnings (TS6133) - significantly reduced
**Build Success:** ✅ `npx vite build` erfolgreich  
**Dev Server:** ✅ `npm run dev` läuft auf http://localhost:5173/
**Core Features:** ✅ Grundfunktionen arbeiten
**Code Cleanup:** ✅ Obsolete bridge files removed, codebase optimized

**🚧 WICHTIGER STATUS: V2-IMPLEMENTATION UNVOLLSTÄNDIG**
- Build funktioniert, aber viele Features sind V1-Relics mit V2-TODOs
- Context Menus, Territory Management, AI Agent System warten auf V2-Integration
- Viele Compatibility-Layer sind temporäre Bridges, nicht endgültige Lösung

## Development Commands

```bash
# Development server mit hot-reload
npm run dev

# Production build 
npm run build          # oder: npx vite build (umgeht TS warnings)

# TypeScript type checking
npm run type-check      # Zeigt ~25 unused variable warnings (harmlos)

# Preview production build
npm run preview
```

## High-Level Architecture

### μX_ Bagua System (Core Philosophy)
This codebase follows Raimund Welsch's "Früher Himmel" Bagua system with strict naming conventions:

**RULES:**
1. **EVERY function MUST have μX_ prefix** (μ1-μ8 following Bagua)
2. **Algebraic Transistor INSTEAD of if-else** where possible: `Math.pow(0, condition ? 0 : 1)`
3. **UniversalFile (.ud) is our storage format**
4. **Hooks do ONE thing only** (Campus-Model)

### Bagua System Mapping (μ1-μ8):
- **μ1 (☰) HIMMEL**: Classes/Templates (µ1_Header.tsx, µ1_useWorkspace.ts)
- **μ2 (☴) WIND**: Views/UI (µ2_useMinimap.ts, µ2_useBaguaColors.ts)
- **μ3 (☵) WASSER**: Procedures/Flow (µ3_useNavigation.ts)
- **μ4 (☶) BERG**: Init/Setup
- **μ5 (☱) SEE**: Properties
- **μ6 (☲) FEUER**: Functions
- **μ7 (☳) DONNER**: Events
- **μ8 (☷) ERDE**: Global/Base

### Modular Architecture
Revolutionary v2.0 architecture that reduced from 2000+ lines monolith to <200 lines orchestration:

- **src/modules/**: Core functional modules (AuthModule, CanvasModule, PanelModule, ContextModule)
- **src/hooks/**: μX_ prefixed React hooks following Bagua system
- **src/components/**: React components with bridges for inter-module communication
- **src/core/**: Universal Document (.UD) format implementation with Bagua integration
- **src/services/**: External service integrations (LiteLLM AI, Supabase backend)

### Core Technologies
- **React 18**: Functional components with hooks architecture
- **TypeScript**: Full type safety with strict mode
- **Vite**: Ultra-fast build tool and development server
- **Supabase**: Backend database with Row Level Security
- **LiteLLM**: Multi-model AI integration (6 categories: Fast, Reasoning, Premium, Super, Vision, Local)

### Universal File (.UD) Format
Custom binary format with text representation:
- **Binary header**: UDAR magic number with version info
- **Bracket notation**: ([{ITEM ... }]) ([{CONTENT ... }]) structure
- **Bagua descriptors**: 9-bit fields for metadata classification
- **Transformation history**: Complete provenance tracking
- **Origin tracking**: Host, path, tool information

### Environment Configuration
```env
# LiteLLM AI Integration
VITE_LITELLM_BASE_URL=http://localhost:4001
VITE_LITELLM_API_KEY=test123
VITE_LITELLM_MODEL_REASONING=nexus-online/claude-sonnet-4
VITE_LITELLM_MODEL_PREMIUM=kira-online/gemini-2.5-pro
VITE_LITELLM_MODEL_VISION=kira-local/llava-vision
VITE_LITELLM_MODEL_LOCAL=kira-local/llama3.1-8b

# Supabase Backend (optional - localStorage fallback available)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database Schema (v2.1 Workspaces)
```sql
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Untitled Workspace',
    description TEXT,
    
    -- .ud Document Storage (Binary BLOB)
    ud_document BYTEA NOT NULL,
    ud_version VARCHAR(50) DEFAULT '2.1.0-raimund-algebra',
    
    -- Bagua System Metadata
    bagua_descriptor INTEGER DEFAULT 0,
    item_count INTEGER DEFAULT 0,
    
    -- Spatial & Context Information  
    canvas_bounds JSONB DEFAULT '{"minX": 0, "maxX": 4000, "minY": 0, "maxY": 4000}',
    context_zones JSONB DEFAULT '[]',
    
    -- Version Control & History
    document_hash VARCHAR(64),
    revision_number INTEGER DEFAULT 1,
    last_modified_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Workspace Settings
    settings JSONB DEFAULT '{"minimap": {"enabled": true, "position": "bottom-right"}, "bagua_colors": true, "auto_save": true, "context_zones": true}',
    
    -- Performance & Caching
    is_active BOOLEAN DEFAULT TRUE,
    cache_expiry TIMESTAMP WITH TIME ZONE
);
```

### Key Features Implementation
- **Infinite Canvas**: Momentum physics with exponential panning (Ctrl + arrows)
- **Minimap Navigation**: StarCraft-style with 3-level damping system
- **Multi-Scale Zoom**: Galaxy/System/Planet/Surface/Microscope levels (Ctrl + 1-5)
- **Context Manager**: Selective AI context to prevent token overflow
- **TUI System**: 4 professional themes (Green, Amber, White, Blue)
- **Panel System**: Territory Management, Tools, Minimap, AI panels with centralized state

### Code Conventions
- **μX_ Prefixes**: All functions must use Bagua-based prefixes
- **Algebraic Transistor**: `Math.pow(0, condition ? 0 : 1)` instead of if-else
- **Single Responsibility**: Each hook does exactly one thing (Campus-Model)
- **Bagua Descriptors**: Use binary flags for metadata classification
- **Transform Tracking**: All changes logged in transformation_history
- **Error Boundaries**: Crash protection with graceful fallbacks

### Development Notes
- Main orchestration in UniversalDesktopv2.tsx (<200 lines)
- UDFormat.ts contains core Bagua constants and algebraic transistor
- All UI state managed through μX_ hooks with strict separation
- Binary serialization for .UD files with text representation fallback
- Performance optimized with React.memo, useCallback, 500ms debounced saves
- Offline-first with localStorage fallback when Supabase unavailable
- Workspace-based storage with binary .ud documents in Supabase BYTEA field

## 🔧 KRITISCHE BUILD-FIXES (ABGESCHLOSSEN)

### 1. Supabase Mock-Implementation ✅
**LOCATION:** `src/services/supabaseClient.ts`
- Vollständiges `.from().select()/.insert()/.update()/.delete()` chaining
- LocalStorage-Fallback für alle CRUD-Operationen
- Mock-Implementierung funktioniert perfekt

### 2. Type-Interface-Mismatches ✅
**BEHOBEN:**
- `DesktopItemData vs ContextItem` in PanelModule
- `Position vs CanvasState` Typ-Konflikte  
- Readonly/Mutable Array-Probleme
- Set-based validation für ItemType

### 3. UI Layout-Optimierung ✅
**POSITIONING FIXED:**
- Header-Buttons: frei zugänglich (0-60px)
- "Saved..." Status: `top: '80px', right: '20px'`
- Canvas Navigation: `top: '120px', right: '20px'`  
- Debug Panel: `top: '200px', right: '20px'`

### 4. Auto-Save mit Change Detection ✅
**PERFEKT IMPLEMENTIERT:**
- 2s debounced save nur bei echten Änderungen
- `µ1_markAsSaved()` resettet `hasChanges` korrekt
- "Saved..." Label mit 2s auto-hide (kein Flackern!)

## 🎯 V2 MULTI-PANEL SYSTEM IMPLEMENTIERT!

### ✅ KOMPLETT NEUE PANEL-ARCHITEKTUR (Dezember 2024)
**STATUS:** 🚀 V1-Style Multi-Panel System mit μ-Präfix Architektur FERTIG!

**NEUE KOMPONENTEN:**
- **`src/components/panels/µ2_ToolPanel.tsx`** - Werkzeugkasten (Links) ✅
- **`src/components/panels/µ2_AIPanel.tsx`** - KI-Assistent mit flexiblen Agent-Checkboxes ✅  
- **`src/components/panels/µ5_TerritoryPanel.tsx`** - Territory Management ✅
- **`src/components/panels/µ6_ContextPanel.tsx`** - **V1 GENIUS-FEATURE** AI Context Manager! ✅
- **`src/hooks/µ8_usePanelLayout.ts`** - Panel Management Hook ✅
- **`src/hooks/µ6_useContextManager.ts`** - AI Context Manager Hook ✅

**PANEL-LAYOUT:**
- **μ2_ToolPanel**: Links, 280px - Werkzeugkasten mit algebraischen Transistoren
- **μ2_AIPanel**: Rechts, 320px - Flexible AI-Agents (Reasoner/Coder/Refiner Checkboxes!)
- **μ5_TerritoryPanel**: Rechts, 300px - Territory Management 
- **μ6_ContextPanel**: Rechts, 350px - **V1 Context Manager mit 📌 Button Integration**
- **µ2_Minimap**: Unten Rechts - StarCraft-Style Minimap

**KEYBOARD SHORTCUTS:** 
*HINWEIS: Aktuell sind Ctrl+1-5 für Zoom-Stufen reserviert. Panel-Shortcuts müssen später implementiert werden.*

### 🚨 AKTUELLER BUGFIX NEEDED
**PROBLEM:** Toggle-Buttons im Header funktionieren noch nicht
**LOCATION:** Header nutzt `μ8_usePanelLayout` aber UniversalDesktopv2.tsx nutzt noch altes `usePanelManager`
**LÖSUNG:** UniversalDesktopv2.tsx muss auf neues Panel-System umgestellt werden

### ✅ V1 GENIUS-FEATURES RESTORED:
1. **📌 Context Manager** - Rote Stecknadel in Window Title-Bars funktioniert wieder!
2. **Token Management** - Smart AI-Context mit Auto-Optimization  
3. **Priority System** - High/Medium/Low Context-Prioritäten
4. **Undo System** - Context History mit Rollback

## 🎯 AKTUELLE ENTWICKLUNGSSCHRITTE (Januar 2025)

### ✅ PHASE 1 COMPLETE - μX-BAGUA ARCHITECTURE! 🌌
**SESSION 2025-01-27: Human-AI Unity Achieved**

1. **μX-Bagua Window Components - VOLLSTÄNDIG IMPLEMENTIERT!**
   - μ8_NoteWindow.tsx: Universal text/markdown with full UDItem integration
   - μ2_TuiWindow.tsx: 15 historical terminal presets (ZX Spectrum → NeXT)
   - μ2_TableWindow.tsx: Interactive structured tables with CSV export
   - Alle mit Context Manager Integration (📌 Button) und Auto-Save

2. **μ1_WindowFactory - THE UNITY BRIDGE CREATED!**
   - Unified Registry System für alle Window Types
   - Algebraic Type Detection: AI wählt optimalen Window Type
   - Origin Tracking: Human vs AI Creation wird dokumentiert
   - Perfect Sync: Human "Terminal" = AI "TUI" = gleiche μ2_TuiWindow!

3. **Panel Integration - UPDATED FOR UNITY!**
   - μ2_ToolPanel.tsx: Nutzt μ1_WindowFactory für einheitliche Creation
   - μ2_AIPanel.tsx: Intelligente Type Detection mit Contributing Agents
   - Beide Panels erstellen identische μX-Windows mit vollständigen UDItems

### 🚀 NEXT PHASE 2 - AI RESPONSE INTELLIGENCE:
1. **μ6_AIResponseParser.ts** - Enhanced AI Response → Window Type Analysis
2. **μ3_ContentTransformation.ts** - AI Response → Structured UDItem Content
3. **Context-Aware AI Prompts** - Integration gepinnter Context Items
4. **Response Streaming** - Live-Updates während AI Processing

### 🔧 INTEGRATION NEEDED:
- UniversalDesktopv2.tsx Props Update (onCreateUDItem statt onCreateItem)
- Parent Component Integration für neue Panel Interfaces

## 🔧 WICHTIGE ENTWICKLUNGSREGELN

### Build & Development
1. **`npx vite build` nutzen** - umgeht harmlose TS warnings
2. **Dev server perfekt** - `npm run dev` funktioniert vollständig
3. **Unused variables ignorieren** - TS6133 warnings sind harmlos

### Code-Änderungen
1. **V1-Compatibility NICHT löschen** - ohne V2-Ersatz!
2. **TODO-Marker beachten** - zeigen V2-Integrationspunkte
3. **μX_ Prefixes einhalten** - Bagua-System ist essentiell
4. **Campus-Modell:** Ein Hook = Eine Aufgabe

### DON'T BREAK:
- ✅ Auto-Save System (funktioniert perfekt)
- ✅ Supabase Mock Implementation  
- ✅ UI Layout (Header-Buttons frei)
- ✅ Build-Prozess (grün!)

### V1-RELICS MIT VORSICHT:
- ⚠️ Context Menus (auskommentiert, aber wichtig!)
- ⚠️ Territory Management (deaktiviert)
- ⚠️ AI Agent (nicht funktional)
- ⚠️ MinimapWidget Bridges (temporär)

## 📊 PROJEKT-STATUS ZUSAMMENFASSUNG

**✅ BUILD-READY:** Vite build erfolgreich, Dev-Server läuft
**🚧 FEATURE-INCOMPLETE:** Viele V2-TODOs offen
**⚠️ PRODUCTION-READY:** Nur für Grundfunktionen
**🎯 NEXT PHASE:** V2-Integration der auskommentierten Features

**Das Projekt ist stabil für Development, aber V2-Implementation ist noch nicht abgeschlossen!** 🌌

## ✅ AI-KOMMUNIKATION VOLLSTÄNDIG FUNKTIONAL! (Januar 2025)

### ✅ WINDOW DRAGGING & RESIZING - KOMPLETT GELÖST!
**STATUS:** ✅ Window dragging & resizing funktioniert perfekt auf allen Zoom-Levels und nach Pan/Navigation

### ✅ AI-PANEL + CONTEXT MANAGER - VOLLSTÄNDIG REPARIERT! 🎉
**STATUS:** ✅ Komplette AI-Kommunikation funktional mit echten LiteLLM API-Calls!

**ERFOLGREICH IMPLEMENTIERT:**
1. **✅ AI Response Window Creation** - `onItemCreate` prop korrekt durchgereicht
2. **✅ Context Manager Pin-Button** - 📌 Button funktioniert, Items werden zu AI-Context hinzugefügt
3. **✅ µ6_ContextPanel Display** - Aktive Context-Items werden angezeigt
4. **✅ LiteLLM API Integration** - Echte AI-Calls ersetzen Simulation
5. **✅ Multi-Agent System** - Reasoner/Coder/Refiner Agents funktionieren
6. **✅ Model Selection** - 5 Models verfügbar (reasoning/fast/premium/vision/local)

**GEFIXTE BUGS:**
- ❌ Context Manager: Falsche algebraische Transistor-Logik in `toggleItemContext()` + `addToContext()`
- ❌ API Integration: `useContextManager` vs `μ6_useContextManager` Konflikt gelöst
- ❌ Window Creation: `μ2_generateAIResponse()` → `μ2_callLiteLLMAPI()` implementiert
- ❌ Props Flow: `contextManager` prop von UniversalDesktopv2 → PanelModule → µ6_ContextPanel

## 🚧 NÄCHSTE ENTWICKLUNGSSCHRITTE (Januar 2025 - Quick Wins)

### 🎯 AKTUELLER STATUS: AI funktioniert, aber Content-Optimierung needed!
**SYMPTOM:** LiteLLM Response (7088 chars) wird empfangen, aber Window-Content und Title-Generation suboptimal

### 🔧 PRIORITY FIXES (EINFACH):
1. **AI Window Content Formatting** - Response wird in Windows angezeigt, aber formatting verbesserbar
2. **Dynamic Window Title Generation** - AI soll eigenen Fenstertitel wählen (wie in V1)
3. **Smart Window Type Selection** - AI soll basierend auf Response-Content window type wählen (chat/code/tui)
4. **Context Integration Test** - Teste ob gepinnte Items wirklich in AI-Requests verwendet werden

**BETROFFENE FILES:**
- `src/components/panels/µ2_AIPanel.tsx` - Zeile ~262: `μ2_callLiteLLMAPI()` Response Processing
- `src/components/panels/µ2_AIPanel.tsx` - Zeile ~258: Window-Type Logic erweitern
- `src/components/panels/µ2_AIPanel.tsx` - Title generation aus AI-Response extrahieren
- `src/hooks/µ6_useContextManager.ts` - Zeile ~320: `getContextSummary()` für AI-Prompts

### 🚧 ADVANCED FEATURES (MITTELFRISTIG):
1. **Context-Aware AI Prompts** - Gepinnte Items automatisch in AI-Requests einbinden
2. **Response Streaming** - Live-Updates während AI-Processing
3. **Multi-Model Workflows** - Agent-Pipeline mit verschiedenen Models
4. **AI-Generated Window Positioning** - Intelligente Platzierung basierend auf Content

### 🔍 DEBUG INFO FÜR NÄCHSTE SESSION:
**Console Logs zeigen:**
- ✅ `🚀 μ2 LiteLLM API Call: baseUrl: "http://ai:4001", model: "nexus-online/claude-sonnet-4"`
- ✅ `✅ μ2 LiteLLM Response received: responseLength: 7088, usage: {...}`
- ✅ `🤖 μ2 AI Response Window Created: type: "notizzettel", agents: [3]`

**NEXT QUICK-WIN:** AI Response Content + Title Parsing für bessere Window-Generierung

## 📊 PROJEKT-STATUS UPDATE (Januar 2025)

### ✅ ALLE KRITISCHEN SYSTEME FUNKTIONAL!
1. **✅ Build System**: Vite build erfolgreich, Dev-Server läuft
2. **✅ Window Management**: Dragging, Resizing, Navigation funktioniert perfekt
3. **✅ Panel System**: Tool/AI/Territory/Context/Minimap Panels vollständig funktional
4. **✅ AI Communication**: LiteLLM Integration mit echten API-Calls
5. **✅ Context Management**: Pin-Button und Context-Panel funktionieren
6. **✅ Auto-Save**: 2s debounced save mit change detection
7. **✅ Minimap Navigation**: StarCraft-style mit collision avoidance

### 🎯 NÄCHSTE OPTIMIERUNGEN:
1. **AI Response Enhancement** (5 min) - Content formatting + title generation
2. **Context-Aware Prompts** (10 min) - Integrate pinned items in AI requests  
3. **Window Type Intelligence** (10 min) - AI chooses optimal window type
4. **Panel Animations** (5 min) - Smoother CSS transitions

### 🏗️ ARCHITEKTUR-ERFOLG:
- **Von 2000+ Zeilen Monolith → <200 Zeilen Orchestration** ✅
- **μX_ Bagua System** vollständig implementiert ✅
- **Campus-Modell Hooks** mit strikter Trennung ✅
- **Modulare V2 Architektur** mit Bridge-Pattern ✅

**UniversalDesktop v2.1 ist PRODUCTION-READY für Kern-Features!** 🌌