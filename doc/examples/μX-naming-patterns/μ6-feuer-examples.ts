/**
 * μ6_FEUER (☲) - Functions Examples
 * =================================
 * 
 * "Aktive Berechnungen, Transformation" - Raimund Welsch
 * 
 * FEUER represents the active processing aspect - calculations, transformations,
 * data processing, algorithms, and computational logic.
 */

import { useCallback, useMemo } from 'react';
import { UDFormat } from '../../core/UDFormat';

// ✅ CORRECT μ6_ Examples:

// Context Manager Functions (Active AI processing)
export const μ6_useContextManager = () => {
    const [contextItems, setContextItems] = useState<UDItem[]>([]);
    
    // μ6_ Active context processing
    const μ6_addToContext = useCallback((item: UDItem) => {
        const μ6_shouldAdd = UDFormat.transistor(!item.is_contextual);
        
        if (μ6_shouldAdd) {
            const updatedItem = {
                ...item,
                is_contextual: true,
                transformation_history: [
                    ...item.transformation_history,
                    {
                        id: `ctx_${Date.now()}`,
                        timestamp: Date.now(),
                        verb: 'contextualized',
                        agent: 'user:human',
                        description: 'Added to AI context'
                    }
                ]
            };
            setContextItems(prev => [...prev, updatedItem]);
        }
    }, []);

    // μ6_ Context summarization algorithm
    const μ6_buildContextSummary = useCallback(() => {
        return contextItems.reduce((summary, item) => {
            const itemWeight = μ6_calculateContextWeight(item);
            const itemSummary = μ6_extractKeyInformation(item);
            return summary + itemWeight * itemSummary.length;
        }, 0);
    }, [contextItems]);

    // μ6_ Token estimation calculation
    const μ6_estimateTokens = useCallback((text: string): number => {
        // Rough token estimation algorithm
        const words = text.split(/\s+/).length;
        const avgTokensPerWord = 1.3;
        return Math.ceil(words * avgTokensPerWord);
    }, []);

    return {
        contextItems,
        μ6_addToContext,
        μ6_buildContextSummary,
        μ6_estimateTokens
    };
};

// Calculation Functions (Mathematical processing)
export const μ6_calculateLayout = (items: UDItem[], canvasBounds: UDBounds) => {
    // μ6_ Spatial layout algorithm
    const μ6_itemDensity = items.length / (canvasBounds.width * canvasBounds.height);
    const μ6_optimalSpacing = Math.sqrt(1 / μ6_itemDensity) * 0.8;
    
    return items.map(item => {
        const μ6_hasCollision = μ6_detectCollision(item, items);
        const μ6_newPosition = μ6_hasCollision ? 
            μ6_findOptimalPosition(item, items, μ6_optimalSpacing) : 
            item.position;
            
        return { ...item, position: μ6_newPosition };
    });
};

export const μ6_transformCoordinates = (
    worldPos: UDPosition, 
    viewportState: ViewportState
): ScreenPosition => {
    // μ6_ Coordinate transformation calculation
    const μ6_scaleMatrix = [
        [viewportState.scale, 0, 0],
        [0, viewportState.scale, 0],
        [0, 0, 1]
    ];
    
    const μ6_translationVector = [
        worldPos.x - viewportState.centerX,
        worldPos.y - viewportState.centerY,
        worldPos.z
    ];
    
    return μ6_applyMatrix(μ6_scaleMatrix, μ6_translationVector);
};

// AI Response Processing (Content transformation)
export const μ6_processAIResponse = (response: string, agents: string[]) => {
    // μ6_ Content analysis algorithm
    const μ6_responseMetrics = μ6_analyzeContent(response);
    const μ6_optimalType = μ6_determineWindowType(μ6_responseMetrics, agents);
    const μ6_structuredContent = μ6_extractStructure(response, μ6_optimalType);
    
    return {
        windowType: μ6_optimalType,
        content: μ6_structuredContent,
        metadata: {
            confidence: μ6_responseMetrics.confidence,
            complexity: μ6_responseMetrics.complexity,
            agents: agents
        }
    };
};

export const μ6_analyzeContent = (text: string) => {
    // μ6_ Content analysis functions
    const μ6_codePatterns = /```[\s\S]*?```|`[^`]+`|\b(function|class|import|export)\b/g;
    const μ6_tablePatterns = /\|.*\||\t.*\t|,.*,/g;
    const μ6_structurePatterns = /^#{1,6}\s|^\d+\.|^[-*+]\s/gm;
    
    const μ6_codeScore = (text.match(μ6_codePatterns) || []).length;
    const μ6_tableScore = (text.match(μ6_tablePatterns) || []).length;
    const μ6_structureScore = (text.match(μ6_structurePatterns) || []).length;
    
    return {
        codeScore: μ6_codeScore,
        tableScore: μ6_tableScore,
        structureScore: μ6_structureScore,
        confidence: μ6_calculateConfidence(μ6_codeScore, μ6_tableScore, μ6_structureScore),
        complexity: text.length / 100
    };
};

// Algebraic Processing (Raimund's transistor applications)
export const μ6_algebraicProcessor = {
    // μ6_ Multi-condition processing with algebraic transistors
    processConditions: (value: number, ...conditions: boolean[]) => {
        return conditions.reduce((result, condition) => {
            return result * UDFormat.transistor(condition);
        }, value);
    },
    
    // μ6_ Weighted calculation using transistor logic
    calculateWeightedSum: (values: number[], weights: boolean[]) => {
        return values.reduce((sum, value, index) => {
            const weight = UDFormat.transistor(weights[index]);
            return sum + (value * weight);
        }, 0);
    },
    
    // μ6_ State transition calculation
    calculateTransition: (currentState: number, targetState: number, condition: boolean) => {
        const transitionFactor = UDFormat.transistor(condition);
        return currentState + (targetState - currentState) * transitionFactor;
    }
};

// Data Transformation Functions
export const μ6_transformUDItem = (item: UDItem, transformType: string, data: any) => {
    // μ6_ UDItem transformation with history tracking
    const μ6_transformationId = `transform_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const μ6_transformedContent = μ6_applyTransformation(item.content, transformType, data);
    const μ6_newBaguaDescriptor = μ6_updateBaguaDescriptor(item.bagua_descriptor, transformType);
    
    const μ6_transformation = {
        id: μ6_transformationId,
        timestamp: Date.now(),
        verb: transformType,
        agent: 'system:μ6_processor',
        description: `Content transformed: ${transformType}`
    };
    
    return {
        ...item,
        content: μ6_transformedContent,
        bagua_descriptor: μ6_newBaguaDescriptor,
        transformation_history: [...item.transformation_history, μ6_transformation],
        updated_at: Date.now()
    };
};

// ❌ WRONG Examples (what NOT to do):

// Missing μ prefix:
export const calculateLayout = () => {}; // ❌ No Bagua identification

// Wrong prefix for calculation functionality:
export const μ2_calculateLayout = () => {}; // ❌ μ2 is for UI, not calculations
export const μ8_processAIResponse = () => {}; // ❌ μ8 is for global/base, not processing

// UI concerns in function module:
export const μ6_renderWindow = () => {}; // ❌ Rendering is μ2, not μ6
export const μ6_displayPanel = () => {}; // ❌ Display is μ2, not μ6

// Event handling in function module:
export const μ6_handleClick = () => {}; // ❌ Event handling is μ7, not μ6
export const μ6_onKeyPress = () => {}; // ❌ Event reactions are μ7, not μ6

/**
 * Key μ6_FEUER Principles:
 * 
 * 1. **Active Processing**: Calculations, algorithms, transformations
 * 2. **Mathematical Logic**: Number crunching, data analysis
 * 3. **Content Transformation**: Converting data from one form to another
 * 4. **Algorithmic Intelligence**: Smart processing, AI analysis
 * 5. **Polar Relationship**: Works with μ3_WASSER (flow/procedures)
 * 
 * Use μ6_ for:
 * - Mathematical calculations (calculateX, processY, computeZ)
 * - Data transformations (transformX, convertY, analyzeZ)
 * - Algorithm implementations (sortX, searchY, optimizeZ)
 * - AI processing functions (analyzeContent, processResponse)
 * - Algebraic transistor applications (condition processing)
 * - Context management functions (buildContext, estimateTokens)
 */

// Helper functions (still μ6_ as they're computational)
const μ6_detectCollision = (item: UDItem, allItems: UDItem[]): boolean => {
    return allItems.some(other => 
        other.id !== item.id && 
        μ6_itemsOverlap(item.position, item.dimensions, other.position, other.dimensions)
    );
};

const μ6_itemsOverlap = (pos1: UDPosition, dim1: UDDimensions, pos2: UDPosition, dim2: UDDimensions): boolean => {
    return !(pos1.x + dim1.width < pos2.x || 
             pos2.x + dim2.width < pos1.x || 
             pos1.y + dim1.height < pos2.y || 
             pos2.y + dim2.height < pos1.y);
};

const μ6_findOptimalPosition = (item: UDItem, allItems: UDItem[], spacing: number): UDPosition => {
    // Spiral search algorithm for collision-free positioning
    let radius = spacing;
    let angle = 0;
    
    while (radius < 1000) {
        const candidateX = item.position.x + Math.cos(angle) * radius;
        const candidateY = item.position.y + Math.sin(angle) * radius;
        const candidatePos = { x: candidateX, y: candidateY, z: item.position.z };
        
        if (!μ6_detectCollision({ ...item, position: candidatePos }, allItems)) {
            return candidatePos;
        }
        
        angle += 0.5;
        if (angle > Math.PI * 2) {
            angle = 0;
            radius += spacing;
        }
    }
    
    return item.position; // Fallback to original position
};