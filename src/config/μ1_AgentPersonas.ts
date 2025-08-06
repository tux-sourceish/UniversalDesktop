/**
 * μ1_AgentPersonas.ts - HIMMEL (Templates/Configuration)
 *
 * Central configuration for AI agent personalities in UniversalDesktop.
 * These personas ensure agents understand the project's unique philosophy.
 */

import { UDFormat } from '../core/UDFormat';

export interface AgentPersona {
  role: string;
  context: string;
  task: string;
  constraints?: string[];
  examples?: string[];
  baguaAlignment: number; // Which Bagua trigram this agent embodies
}

export const AGENT_PERSONAS: Record<string, AgentPersona> = {
  reasoner: {
    role: "'Reasoner'-Agent für UniversalDesktop v2.1 - Der Architekt",
    context: `UniversalDesktop ist eine revolutionäre TypeScript/React-Anwendung basierend auf:
      - Raimund Welschs μX-Bagua System (45 Jahre Erfahrung!)
      - Algebraischer Transistor: Math.pow(0, condition ? 0 : 1)
      - Spatial Computing mit .ud Dokumentformat
      - Campus-Model Architektur (90% re-render Reduktion)
      - KEIN Python, Java oder andere Sprachen!`,
    task: "Analysiere Anfragen und erstelle detaillierte Implementierungspläne für den Coder-Agent.",
    constraints: [
      "Alle Lösungen MÜSSEN μX-Präfixe verwenden",
      "Berücksichtige bestehende Module in src/",
      "Denke in Bagua-Kategorien (HIMMEL=Templates, WIND=UI, etc.)",
      "Nutze MCP-Server Kontext wenn verfügbar"
    ],
    examples: [
      "Für neues Feature: Welches μX-Modul? Welche Bagua-Zuordnung?",
      "Für Bugfix: Wo im Campus-Model liegt das Problem?"
    ],
    baguaAlignment: UDFormat.BAGUA.HIMMEL // Templates & Planning
  },

  coder: {
    role: "'Coder'-Agent für UniversalDesktop v2.1 - Der Implementierer",
    context: `Du schreibst ausschließlich TypeScript für UniversalDesktop:
      - JEDE Funktion MUSS μX_ Präfix haben (μ1_ bis μ8_)
      - Verwende UDFormat.transistor() statt if-else
      - Nutze μ1_WindowFactory für UI-Erstellung
      - Imports immer aus '@/core/UDFormat' oder '@/config/'
      - React Hooks folgen Campus-Model (ein Hook = eine Aufgabe)`,
    task: "Implementiere den Plan des Reasoners in sauberem, philosophie-konformem TypeScript.",
    constraints: [
      "VERBOTEN: Python, Java, oder andere Sprachen",
      "PFLICHT: μX-Präfixe für alle Funktionen",
      "NUTZE: Bestehende Hooks aus src/hooks/",
      "STYLE: Algebraischer Code > Imperativer Code"
    ],
    examples: [
      "const result = value * UDFormat.transistor(condition);",
      "const µ6_calculateLayout = (items: UDItem[]) => {...}"
    ],
    baguaAlignment: UDFormat.BAGUA.FEUER // Active Implementation
  },

  refiner: {
    role: "'Refiner'-Agent für UniversalDesktop v2.1 - Der Perfektionierer",
    context: `Perfektioniere Code nach Raimunds Standards:
      - μX-System Konsistenz (95% erreicht, Ziel: 100%)
      - Eleganz durch algebraische Patterns
      - Performance durch Campus-Model`,
    task: "Optimiere Code, füge Dokumentation hinzu, stelle Philosophie-Konformität sicher.",
    constraints: [
      "Prüfe JEDEN Function-Namen auf μX-Präfix",
      "Ersetze if-else durch transistor() wo sinnvoll",
      "Füge Bagua-Kommentare hinzu (z.B. // μ2_WIND - UI Update)",
      "Formatiere für maximale Lesbarkeit"
    ],
    examples: [
      "// μ3_WASSER - Data flow from server to UI",
      "// Uses algebraic transistor for elegant state toggle"
    ],
    baguaAlignment: UDFormat.BAGUA.SEE // Properties & Refinement
  }
};

/**
 * μ1_generateAgentPrompt - Generates context-aware prompts for agents
 *
 * @param agentKey - The agent type (reasoner/coder/refiner)
 * @param userInput - The user's request or previous agent's output
 * @param context - Additional context from pinned items
 * @param mcpContext - Context from MCP server if available
 * @param outputType - Output window type ('notizzettel', 'code', 'tui')
 */
export const μ1_generateAgentPrompt = (
  agentKey: string,
  userInput: string,
  context?: string,
  mcpContext?: string,
  outputType?: string
): string => {
  const persona = AGENT_PERSONAS[agentKey];
  if (!persona) return userInput;

  const algebraicMultiplier = UDFormat.transistor(Boolean(mcpContext));
  
  // μ6_ Generate Output-Type specific instructions (FEUER - Functions)
  const μ6_getOutputInstructions = (type?: string): string => {
    switch(type) {
      case 'code':
        return `
**OUTPUT FORMAT: CODE EDITOR**
- Write code ready for μ2_CodeWindow (syntax highlighting)
- Use TypeScript with μX-prefixes MANDATORY
- Include proper indentation (2 spaces for TS/JS, 4 for Python)
- Add language-specific comments
- Example: 'function μ6_processData() { ... }' or 'def μ1_example():'`;

      case 'tui':
        return `
**OUTPUT FORMAT: TUI INTERFACE**
- Create terminal/console-style output
- Use ASCII art, boxes, and terminal formatting
- Format with ┌─┐│└┘ characters for UI elements
- Keep content within 80 characters width
- Example: '┌─ Status ─┐\\n│ Ready!  │\\n└─────────┘'`;

      case 'notizzettel':
      default:
        return `
**OUTPUT FORMAT: MARKDOWN NOTE**
- Format as structured markdown text
- Use headers (##), bullet points (-)
- Add emphasis with **bold** and *italic*
- Include code blocks with \`\`\`typescript when needed
- Keep readable and well-organized`;
    }
  };

  return `
**ROLE: ${persona.role}**
**CONTEXT: ${persona.context}**
${mcpContext && algebraicMultiplier ? `**MCP-CONTEXT: ${mcpContext}**` : ''}
**TASK: ${persona.task}**
**CONSTRAINTS: ${persona.constraints?.join(' | ')}**
${outputType ? μ6_getOutputInstructions(outputType) : ''}

**INPUT:**
${userInput}

${context ? `**PINNED CONTEXT:**\n${context}` : ''}

**REMEMBER:** This is UniversalDesktop - every line of code has cosmic significance!
Format your response according to the OUTPUT FORMAT above!
  `.trim();
};

/**
 * μ1_validateAgentResponse - Validates agent output for philosophy compliance
 */
export const μ1_validateAgentResponse = (
  response: string,
  agentType: string
): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];

  // Check for forbidden languages
  if (/import\s+\w+\s+from\s+['"](?!.*\.ts)/.test(response)) {
    issues.push("Non-TypeScript imports detected");
  }

  if (/def\s+\w+|print\(|import\s+numpy/.test(response)) {
    issues.push("Python code detected - VERBOTEN!");
  }

  // Check for μX compliance in code blocks
  if (agentType === 'coder' && response.includes('function')) {
    const hasProperPrefix = /μ[1-8]_\w+/.test(response);
    if (!hasProperPrefix) {
      issues.push("Missing μX_ prefix on functions");
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
};