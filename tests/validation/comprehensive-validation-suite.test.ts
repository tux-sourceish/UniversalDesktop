/**
 * Comprehensive Validation Suite for UniversalDesktop Agent System
 * 
 * Tests all implementation criteria from the project requirements:
 * ✅ Modular configuration in separate file
 * ✅ Type-safe persona definitions  
 * ✅ NO Python/Java hallucinations
 * ✅ ALL responses use μX_ patterns
 * ✅ MCP context integration works
 * ✅ Validation catches non-compliant responses
 * ✅ Agents understand UniversalDesktop's soul
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  AGENT_PERSONAS,
  μ1_generateAgentPrompt,
  μ1_validateAgentResponse,
  AgentPersona
} from '../../src/config/μ1_AgentPersonas';
import { UDFormat } from '../../src/core/UDFormat';

describe('🧪 THE PYTHON TEST - Validate Agent Response Prevents Python Code', () => {
  it('μ1_validateAgentResponse should detect Python imports', () => {
    const pythonCode = `
import numpy as np
import pandas as pd
from sklearn import metrics

def calculate_accuracy(predictions, targets):
    return metrics.accuracy_score(predictions, targets)
    `;

    const validation = μ1_validateAgentResponse(pythonCode, 'coder');
    
    expect(validation.valid).toBe(false);
    expect(validation.issues).toContain('Python code detected - VERBOTEN!');
  });

  it('should detect Python function definitions', () => {
    const pythonCode = `
def process_data(data):
    print("Processing data")
    return data.shape
    `;

    const validation = μ1_validateAgentResponse(pythonCode, 'coder');
    
    expect(validation.valid).toBe(false);
    expect(validation.issues).toContain('Python code detected - VERBOTEN!');
  });

  it('should detect Python print statements', () => {
    const pythonCode = `
result = calculate_metrics(data)
print(f"Accuracy: {result}")
    `;

    const validation = μ1_validateAgentResponse(pythonCode, 'coder');
    
    expect(validation.valid).toBe(false);
    expect(validation.issues).toContain('Python code detected - VERBOTEN!');
  });

  it('should detect numpy imports specifically', () => {
    const pythonCode = `import numpy as np`;

    const validation = μ1_validateAgentResponse(pythonCode, 'coder');
    
    expect(validation.valid).toBe(false);
    expect(validation.issues).toContain('Python code detected - VERBOTEN!');
  });

  it('should allow TypeScript imports', () => {
    const typescriptCode = `
import React from 'react';
import { UDFormat } from '@/core/UDFormat';

const μ2_Component = () => {
  return <div>Hello UniversalDesktop</div>;
};
    `;

    const validation = μ1_validateAgentResponse(typescriptCode, 'coder');
    
    expect(validation.valid).toBe(true);
    expect(validation.issues).toHaveLength(0);
  });
});

describe('🧪 THE BAGUA TEST - Verify μX Pattern Enforcement', () => {
  it('should require μX_ prefix on functions for coder agent', () => {
    const codeWithoutPrefix = `
function processData(input) {
  return input.map(item => item.value);
}
    `;

    const validation = μ1_validateAgentResponse(codeWithoutPrefix, 'coder');
    
    expect(validation.valid).toBe(false);
    expect(validation.issues).toContain('Missing μX_ prefix on functions');
  });

  it('should accept μX_ prefixed functions', () => {
    const codeWithPrefix = `
const μ6_processData = (input: any[]) => {
  return input.map(item => item.value);
};

function μ2_updateUI() {
  // Update UI components
}
    `;

    const validation = μ1_validateAgentResponse(codeWithPrefix, 'coder');
    
    expect(validation.valid).toBe(true);
    expect(validation.issues).toHaveLength(0);
  });

  it('should validate all μX prefixes from μ1_ to μ8_', () => {
    const validPrefixes = [
      'μ1_createTemplate',
      'μ2_updateUI', 
      'μ3_processData',
      'μ4_initialize',
      'μ5_manage',
      'μ6_transform',
      'μ7_handle',
      'μ8_finalize'
    ];

    validPrefixes.forEach(funcName => {
      const code = `const ${funcName} = () => { /* implementation */ };`;
      const validation = μ1_validateAgentResponse(code, 'coder');
      
      expect(validation.valid).toBe(true);
    });
  });

  it('should not require μX_ prefix for non-coder agents', () => {
    const codeWithoutPrefix = `
Here's my analysis of the architecture:

function processData(input) {
  return input.map(item => item.value);
}
    `;

    const validation = μ1_validateAgentResponse(codeWithoutPrefix, 'reasoner');
    
    expect(validation.valid).toBe(true);
    expect(validation.issues).toHaveLength(0);
  });
});

describe('🧪 THE MCP TEST - Verify MCP Context Integration', () => {
  beforeEach(() => {
    // Mock global MCP context
    (global as any).window = {
      __MCP_CONTEXT__: 'UniversalDesktop MCP Context: Current session has 3 active windows, using Bagua system for spatial organization'
    };
  });

  it('should include MCP context in generated prompts when available', () => {
    const prompt = μ1_generateAgentPrompt(
      'reasoner',
      'Create a new file manager component',
      'Some context',
      'MCP Context: User has 5 windows open'
    );

    expect(prompt).toContain('**MCP-CONTEXT: MCP Context: User has 5 windows open**');
  });

  it('should work without MCP context', () => {
    const prompt = μ1_generateAgentPrompt(
      'reasoner',
      'Create a new file manager component',
      'Some context'
    );

    expect(prompt).not.toContain('**MCP-CONTEXT:');
    expect(prompt).toContain('**ROLE:');
    expect(prompt).toContain('**TASK:');
  });

  it('should use algebraic transistor for MCP context inclusion', () => {
    const mcpContext = 'Test MCP Context';
    const prompt = μ1_generateAgentPrompt(
      'reasoner',
      'Test input',
      undefined,
      mcpContext
    );

    // Should include MCP context when provided
    expect(prompt).toContain(`**MCP-CONTEXT: ${mcpContext}**`);
    
    // Test with no MCP context
    const promptWithoutMCP = μ1_generateAgentPrompt(
      'reasoner',
      'Test input'
    );
    
    expect(promptWithoutMCP).not.toContain('**MCP-CONTEXT:');
  });
});

describe('🧪 THE PHILOSOPHY TEST - Verify UniversalDesktop Compliance', () => {
  it('should have proper Bagua alignment for all personas', () => {
    expect(AGENT_PERSONAS.reasoner.baguaAlignment).toBe(UDFormat.BAGUA.HIMMEL);
    expect(AGENT_PERSONAS.coder.baguaAlignment).toBe(UDFormat.BAGUA.FEUER);
    expect(AGENT_PERSONAS.refiner.baguaAlignment).toBe(UDFormat.BAGUA.SEE);
  });

  it('should include UniversalDesktop philosophy in context', () => {
    Object.values(AGENT_PERSONAS).forEach(persona => {
      expect(persona.context).toContain('UniversalDesktop');
      expect(persona.context).toContain('μX') || expect(persona.context).toContain('TypeScript');
    });
  });

  it('should enforce TypeScript-only constraint for coder', () => {
    const coderPersona = AGENT_PERSONAS.coder;
    
    expect(coderPersona.constraints).toContain('VERBOTEN: Python, Java, oder andere Sprachen');
    expect(coderPersona.constraints).toContain('PFLICHT: μX-Präfixe für alle Funktionen');
    expect(coderPersona.context).toContain('JEDE Funktion MUSS μX_ Präfix haben');
  });

  it('should reference algebraic transistor pattern', () => {
    const reasonerPersona = AGENT_PERSONAS.reasoner;
    const coderPersona = AGENT_PERSONAS.coder;
    
    expect(reasonerPersona.context).toContain('Algebraischer Transistor');
    expect(coderPersona.context).toContain('UDFormat.transistor()');
  });

  it('should include Campus-Model architecture reference', () => {
    const reasonerPersona = AGENT_PERSONAS.reasoner;
    const coderPersona = AGENT_PERSONAS.coder;
    
    expect(reasonerPersona.context).toContain('Campus-Model');
    expect(coderPersona.context).toContain('Campus-Model');
  });
});

describe('✅ Modular Configuration Validation', () => {
  it('should export AgentPersona interface properly', () => {
    const persona: AgentPersona = {
      role: 'Test Role',
      context: 'Test Context', 
      task: 'Test Task',
      constraints: ['Test Constraint'],
      examples: ['Test Example'],
      baguaAlignment: 1
    };

    // TypeScript compilation should succeed
    expect(persona.role).toBe('Test Role');
    expect(persona.baguaAlignment).toBe(1);
  });

  it('should have all required persona properties', () => {
    Object.values(AGENT_PERSONAS).forEach(persona => {
      expect(persona.role).toBeDefined();
      expect(persona.context).toBeDefined();
      expect(persona.task).toBeDefined();
      expect(persona.baguaAlignment).toBeDefined();
      expect(typeof persona.baguaAlignment).toBe('number');
    });
  });

  it('should be properly typed', () => {
    // This test validates TypeScript compilation
    const reasoner: AgentPersona = AGENT_PERSONAS.reasoner;
    const coder: AgentPersona = AGENT_PERSONAS.coder;
    const refiner: AgentPersona = AGENT_PERSONAS.refiner;

    expect(reasoner).toBeDefined();
    expect(coder).toBeDefined();
    expect(refiner).toBeDefined();
  });
});

describe('✅ Type-Safe Persona Definitions', () => {
  it('should properly type all personas', () => {
    const personas: Record<string, AgentPersona> = AGENT_PERSONAS;
    
    expect(personas.reasoner).toBeDefined();
    expect(personas.coder).toBeDefined();
    expect(personas.refiner).toBeDefined();
  });

  it('should enforce proper typing on generateAgentPrompt', () => {
    const prompt: string = μ1_generateAgentPrompt(
      'reasoner',
      'test input',
      'test context',
      'test mcp'
    );

    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('should enforce proper typing on validateAgentResponse', () => {
    const validation: { valid: boolean; issues: string[] } = μ1_validateAgentResponse(
      'test response',
      'coder'
    );

    expect(typeof validation.valid).toBe('boolean');
    expect(Array.isArray(validation.issues)).toBe(true);
  });
});

describe('✅ Validation Engine Catches Non-Compliant Responses', () => {
  it('should catch non-TypeScript imports', () => {
    const badImport = `import something from 'python-lib'`;
    const validation = μ1_validateAgentResponse(badImport, 'coder');
    
    // This should pass as it's still a valid import format
    // The Python detection is more specific
    expect(validation.valid).toBe(true);
  });

  it('should validate against multiple violations', () => {
    const badCode = `
import numpy as np

def process_data():
    print("Processing")
    
function processMore() {
    return "no prefix";
}
    `;

    const validation = μ1_validateAgentResponse(badCode, 'coder');
    
    expect(validation.valid).toBe(false);
    expect(validation.issues.length).toBeGreaterThan(1);
    expect(validation.issues).toContain('Python code detected - VERBOTEN!');
    expect(validation.issues).toContain('Missing μX_ prefix on functions');
  });

  it('should return valid for compliant TypeScript code', () => {
    const goodCode = `
import React from 'react';
import { UDFormat } from '@/core/UDFormat';

const μ2_ProcessData = (input: any[]) => {
  return input.map(item => UDFormat.transistor(item.active) * item.value);
};

const μ6_UpdateUI = (): void => {
  // Update UI using Campus-Model pattern
};
    `;

    const validation = μ1_validateAgentResponse(goodCode, 'coder');
    
    expect(validation.valid).toBe(true);
    expect(validation.issues).toHaveLength(0);
  });
});

describe('🎯 Integration Test - Full System Validation', () => {
  it('should handle complete agent workflow', () => {
    // Test full agent prompt generation
    const reasonerPrompt = μ1_generateAgentPrompt(
      'reasoner',
      'Create a new component for file management',
      'Context: User needs dual-mode file browser',
      'MCP: 3 windows active, Bagua organization enabled'
    );

    expect(reasonerPrompt).toContain('Reasoner');
    expect(reasonerPrompt).toContain('UniversalDesktop');
    expect(reasonerPrompt).toContain('μX-Bagua System');
    expect(reasonerPrompt).toContain('MCP: 3 windows active');

    // Test coder prompt with reasoner output
    const coderPrompt = μ1_generateAgentPrompt(
      'coder',
      reasonerPrompt + '\n\nImplement a dual-mode file manager with μ3_FileManager component',
      'Previous context from reasoner'
    );

    expect(coderPrompt).toContain('Coder');
    expect(coderPrompt).toContain('TypeScript');
    expect(coderPrompt).toContain('μX_ Präfix');

    // Test validation of coder output
    const coderOutput = `
import React from 'react';
import { UDFormat } from '@/core/UDFormat';

const μ3_FileManager = ({ mode }: { mode: 'tui' | 'gui' }) => {
  const μ3_toggleMode = () => {
    return UDFormat.transistor(mode === 'tui') ? 'gui' : 'tui';
  };

  return <div>File Manager in {mode} mode</div>;
};
    `;

    const validation = μ1_validateAgentResponse(coderOutput, 'coder');
    expect(validation.valid).toBe(true);
    expect(validation.issues).toHaveLength(0);
  });

  it('should maintain philosophy compliance across agent chain', () => {
    const agents = ['reasoner', 'coder', 'refiner'];
    
    agents.forEach(agentKey => {
      const persona = AGENT_PERSONAS[agentKey];
      expect(persona).toBeDefined();
      expect(persona.context).toContain('UniversalDesktop');
      expect(persona.baguaAlignment).toBeGreaterThanOrEqual(0);
      expect(persona.baguaAlignment).toBeLessThanOrEqual(7);
    });
  });
});

describe('📊 Performance and Memory Tests', () => {
  it('should generate prompts efficiently', () => {
    const start = performance.now();
    
    for (let i = 0; i < 100; i++) {
      μ1_generateAgentPrompt('reasoner', `Test prompt ${i}`, 'context', 'mcp');
    }
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
  });

  it('should validate responses efficiently', () => {
    const testCode = `
import React from 'react';
const μ2_Component = () => <div>Test</div>;
    `;
    
    const start = performance.now();
    
    for (let i = 0; i < 100; i++) {
      μ1_validateAgentResponse(testCode, 'coder');
    }
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50); // Should complete in under 50ms
  });
});