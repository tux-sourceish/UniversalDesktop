SYSTEM-AUFTRAG AN DIE ENTWICKLER-INSTANZ (ID: UD-M4-20250727-AI-AGENTS)

Projekt: UniversalDesktop v2.1.0 "Raimund Algebra"
Mission: Implementiere das spezialisierte, modellunabhängige Multi-Agenten-System
Primär-Direktive: Transformiere UI-Checkboxen in funktionale KI-Agenten mit flexibler Modellauswahl

KONTEXT:
✅ Build ist grün und stabil
✅ Context Manager funktioniert perfekt
✅ μ1_WindowFactory kann alle Window-Types erstellen
🎯 Jetzt: Den Agenten Leben einhauchen!

Referenz: UniversalDesktop_context/CONTEXT.md, ARCHITECTURE.md, FEATURES.md

═══════════════════════════════════════════════════════════════

TASK 1: State Management & UI für Agenten-Konfiguration

DATEI: src/components/panels/μ2_AIPanel.tsx

1.1 Erweitere State:
```typescript
interface AgentConfig {
  reasoner: { enabled: boolean; model: string; };
  coder:    { enabled: boolean; model: string; };
  refiner:  { enabled: boolean; model: string; };
}

const [agentConfig, setAgentConfig] = useState<AgentConfig>({
  reasoner: { enabled: true, model: 'nexus-online/claude-sonnet-4' },
  coder:    { enabled: false, model: 'kira-local/llama3.1-8b' },
  refiner:  { enabled: false, model: 'kira-online/gemini-2.5-pro' }
});


1.2 Erweitere UI (ca. Zeile 70-95):

BEHALTE die 3 Checkboxen

FÜGE neben jeder Checkbox ein <select> für Modellauswahl hinzu

Verfügbare Modelle:
['kira-online/gemini-2.5-flash', 'nexus-online/claude-sonnet-4',
'kira-online/gemini-2.5-pro', 'nexus-online-claude-opus-4',
'kira-local/llava-vision', 'kira-local/llama3.1-8b']

═══════════════════════════════════════════════════════════════

TASK 2: Implementierung der Agenten-Kette

2.1 Neue Funktion in μ2_AIPanel:

Generated typescript
const μ6_processWithAgents = async (
  initialPrompt: string,
  context: ContextItem[],
  agentConfig: AgentConfig
): Promise<string> => {
  let result = initialPrompt;
  const contextString = μ6_buildContextString(context);

  if (agentConfig.reasoner.enabled) {
    result = await liteLLMClient.chat({
      prompt: `[REASONER AGENT]\nContext: ${contextString}\n\nAnalyze: ${result}`,
      model: agentConfig.reasoner.model
    });
  }

  if (agentConfig.coder.enabled) {
    result = await liteLLMClient.chat({
      prompt: `[CODER AGENT]\n${result}\n\nImplement with μX_ patterns:`,
      model: agentConfig.coder.model
    });
  }

  if (agentConfig.refiner.enabled) {
    result = await liteLLMClient.chat({
      prompt: `[REFINER AGENT]\n${result}\n\nOptimize and perfect:`,
      model: agentConfig.refiner.model
    });
  }

  return result;
};

═══════════════════════════════════════════════════════════════

TASK 3: Output-Type Selection & Window Creation

3.1 Füge Output-Type Selector hinzu:

Generated typescript
type OutputType = 'notizzettel' | 'code' | 'tui';
const [outputType, setOutputType] = useState<OutputType>('notizzettel');

// In der UI (nach den Agent-Checkboxes):
<div className="output-type-selector">
  <label>Output Type:</label>
  <input type="radio" value="notizzettel" checked={outputType === 'notizzettel'}
         onChange={(e) => setOutputType(e.target.value as OutputType)} /> Notizzettel
  <input type="radio" value="code" checked={outputType === 'code'}
         onChange={(e) => setOutputType(e.target.value as OutputType)} /> Code
  <input type="radio" value="tui" checked={outputType === 'tui'}
         onChange={(e) => setOutputType(e.target.value as OutputType)} /> TUI
</div>

3.2 Integration mit μ1_WindowFactory:

Generated typescript
const handleSendWithAgents = async () => {
  const result = await μ6_processWithAgents(prompt, contextItems, agentConfig);

  // Nutze μ1_WindowFactory für Window-Erstellung
  const { createFromAIResponse } = μ1_WindowFactory;
  const newWindow = createFromAIResponse(result, outputType, agentConfig);

  // Window zum Canvas hinzufügen
  onCreateItem(newWindow);
};

═══════════════════════════════════════════════════════════════

TASK 4: Persistenz mit localStorage

4.1 Speichere Konfiguration:

Generated typescript
useEffect(() => {
  localStorage.setItem('ud-agent-config', JSON.stringify(agentConfig));
}, [agentConfig]);

useEffect(() => {
  localStorage.setItem('ud-output-type', outputType);
}, [outputType]);
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

4.2 Lade beim Start:

Generated typescript
useEffect(() => {
  const savedConfig = localStorage.getItem('ud-agent-config');
  if (savedConfig) {
    setAgentConfig(JSON.parse(savedConfig));
  }

  const savedOutputType = localStorage.getItem('ud-output-type');
  if (savedOutputType) {
    setOutputType(savedOutputType as OutputType);
  }
}, []);

═══════════════════════════════════════════════════════════════

ERFOLGS-KRITERIEN:
✅ Jeder Agent hat Checkbox + Model-Dropdown
✅ Agent-Chain: Prompt → Reasoner → Coder → Refiner
✅ Output-Type wählbar (Notizzettel/Code/TUI)
✅ Konfiguration überlebt Page-Reload
✅ Integration mit μ1_WindowFactory funktioniert

TIPP: Die μ1_WindowFactory kennt bereits alle Window-Types!
Check: src/components/factories/μ1_WindowFactory.tsx

Der Plan ist solide. Die Codebasis ist bereit. EXECUTE! 🚀

