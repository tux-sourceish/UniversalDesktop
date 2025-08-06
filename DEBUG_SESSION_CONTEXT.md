# Debug-Session Context für UniversalDesktop v2.1

## 🎯 Was wurde in dieser Session erreicht

### ✅ Debug-Funktionalität komplett implementiert
- **Debug-Checkbox** im AIPanel (μ7_debugMode) mit localStorage-Persistierung
- **Debug-Windows spawnen** nach jedem Agent (außer dem letzten) 
- **Kompletter Prompt-Inhalt** für nächstes Modell wird angezeigt
- **Session-Tracking** mit μ7_debugSessionId

### ✅ Status-Anzeige korrigiert
- **Problem**: Status zeigte "Bereit" während lokales Modell noch rechnete
- **Lösung**: Status-Flow korrigiert - bleibt auf "🤖 KI denkt..." während echter API-Calls
- **Neue Texte**: "🤖 KI denkt..." (rot), "✅ Fertig" (grün), "💤 Bereit" (grau), "❌ Fehler" (rot)

### ✅ Context-Detection repariert  
- **Problem**: hasContext: false obwohl Fenster gepinnt
- **Lösung**: contextInfo Parameter zu μ2_callLiteLLMAPI hinzugefügt
- **Console zeigt jetzt**: promptLength + contextItems count

### ✅ Window-Creation Error behoben
- **Problem**: ReferenceError: positionCalculator is not defined
- **Lösung**: positionCalculator Parameter entfernt (temporär)
- **Windows spawnen jetzt** bei (0,0,0) - funktioniert wieder

## 🔧 Wichtige Code-Änderungen

### src/components/panels/µ2_AIPanel.tsx

#### Debug-System (μ7_ DONNER-Pattern):
```typescript
// Debug Mode State
const [μ7_debugMode, setμ7_DebugMode] = useState(() => 
  localStorage.getItem('ud-debug-mode') === 'true'
);
const [μ7_debugSessionId, setμ7_DebugSessionId] = useState(() => 
  `debug-${Date.now()}`
);

// Debug Window Spawning in μ6_processWithAgents:
if (μ7_shouldCreateDebugWindow && !isLastAgent) {
  const debugWindow = μ1_WindowFactory.createUDItem({
    type: 'notizzettel',
    position: { x: 0, y: 0, z: 1000 + i }, // Viewport centering
    title: `🔍 ${agent.name} → ${nextAgent.name}`,
    content: { text: `kompletter Prompt für nächstes Modell...` }
  });
}
```

#### Status-Flow korrigiert:
```typescript
// VOR μ6_processWithAgents (echte AI-Calls):
setμ2_AgentState(prev => ({
  ...prev,
  status: 'processing', // Bleibt processing während API-Calls
  isActive: true
}));

// NACH Window-Creation:
setμ2_AgentState(prev => ({
  ...prev,
  status: 'completed', // Dann completed
  isActive: false
}));
```

#### Context-Detection verbessert:
```typescript
const μ2_callLiteLLMAPI = useCallback(async (
  prompt: string, 
  enabledAgents: μ2_AgentConfig[], 
  model: string,
  contextInfo?: { activeItems?: any[], hasContextInPrompt?: boolean }
): Promise<any> => {
  console.log('🚀 μ2 LiteLLM API Call:', { 
    hasContext: hasContext,
    contextItems: contextInfo?.activeItems?.length || 0,
    promptLength: prompt.length, // NEU: Zeichen-Count
    promptPreview: prompt.substring(0, 100) + '...'
  });
}
```

## 🚧 Noch zu erledigen (nächste Session)

### 1. Viewport-Positionierung für AI-Windows
**Problem**: Windows spawnen bei (0,0,0) statt im sichtbaren Bereich
**Lösung**: positionCalculator richtig integrieren (wie in μ2_ToolPanel.tsx)

```typescript
// Working code in μ2_ToolPanel.tsx:
const newWindow = μ1_WindowFactory.createUDItem({
  // ... config
}, positionCalculator); // Funktioniert!

// Needs fixing in μ2_AIPanel.tsx:
// positionCalculator Parameter ist undefined - muss von Parent kommen
```

### 2. Request-Abort-Funktionalität
**Use Case**: Lokale Modelle brauchen ewig - Abbrechen-Button nötig
**Implementation**: AbortController Pattern (~15min Aufwand)

```typescript
// Planned implementation:
const [currentAbortController, setCurrentAbortController] = useState<AbortController | null>(null);

const handleAbort = () => {
  if (currentAbortController) {
    currentAbortController.abort();
    setμ2_AgentState(prev => ({ ...prev, status: 'idle' }));
  }
};
```

### 3. GPU-Migration auf 16GB VRAM Rechner
**Current**: Alter Rechner mit wenig VRAM - lokale Modelle sehr langsam
**Next**: Neuer Rechner mit 16GB GPU - LocalAI Config migrieren

## 🎯 Architektur-Erkenntnisse

### μX-Bagua System befolgen:
- μ7_ für Events/Debug (DONNER)  
- μ2_ für UI-Components (WIND)
- μ6_ für Functions/AI (FEUER)
- Immer localStorage für Persistierung

### Window-Creation Pattern:
```typescript
// Korrekt:
const window = μ1_WindowFactory.createUDItem({
  type: 'notizzettel',
  position: { x: 0, y: 0, z: 0 }, // Triggers viewport centering
  content: { text: content }
}, positionCalculator); // Wenn verfügbar

// Fallback:
}, undefined); // Oder ganz weglassen
```

### Status-Flow Pattern:
1. `'processing'` während echter Arbeit
2. `'completed'` nach erfolgreichem Abschluss  
3. `'idle'` nach timeout (1.5s)
4. `'error'` bei Fehlern mit detaillierten Logs

## 🔍 Debug-Kommandos

### Console Logs beachten:
- `🚀 μ2 LiteLLM API Call:` - Context & Prompt-Länge
- `🔍 Debug Window spawned:` - Debug-Window-Creation
- `🌟 AI Window Created:` - Finale Window-Creation
- `❌ AI Window creation error:` - Window-Creation Fehler

### LocalStorage Keys:
- `ud-debug-mode`: Debug-Modus Persistierung
- `ud-agent-config`: Agent-Konfiguration
- `ud-output-type`: Output-Type Selection

## 🚨 Kritische Erkenntnisse

### Context-Management funktioniert:
- Context wird korrekt an AI weitergegeben
- hasContext: true wird angezeigt
- Gepinnte Items werden in Prompts integriert

### Debug-System ist vollständig:
- Checkbox speichert State
- Windows spawnen zwischen Agenten
- Komplette Prompts werden angezeigt
- Session-Tracking funktioniert

### Window-System ist stabil:
- Final-Windows werden erstellt
- Debug-Windows werden erstellt
- Nur Positionierung muss noch korrigiert werden

**FILE LOCATION**: `/home/tux/SingularUniverse/UniversalDesktop/DEBUG_SESSION_CONTEXT.md`