/**
 * Complex Algebraic Transistor Conditions
 * =======================================
 * 
 * Advanced patterns for complex conditional logic using Raimunds algebraic transistors.
 * Demonstrates how to handle sophisticated business logic mathematically.
 */

import { UDFormat } from '../../core/UDFormat';

// ✅ COMPLEX CONDITIONAL PATTERNS

// 1. Priority-Based Selection (Multiple Options)
export const μ6_prioritySelection = (
    options: { value: number; priority: number; condition: boolean }[]
): number => {
    // Traditional approach with loops and sorting:
    // const validOptions = options.filter(opt => opt.condition);
    // if (validOptions.length === 0) return 0;
    // validOptions.sort((a, b) => b.priority - a.priority);
    // return validOptions[0].value;
    
    // Algebraic transistor approach:
    let selectedValue = 0;
    let highestPriority = -1;
    
    options.forEach(option => {
        const μ6_isValid = UDFormat.transistor(option.condition);
        const μ6_hasHigherPriority = UDFormat.transistor(option.priority > highestPriority);
        const μ6_shouldSelect = μ6_isValid * μ6_hasHigherPriority;
        
        // Update selection based on algebraic conditions
        selectedValue = selectedValue * (1 - μ6_shouldSelect) + option.value * μ6_shouldSelect;
        highestPriority = highestPriority * (1 - μ6_shouldSelect) + option.priority * μ6_shouldSelect;
    });
    
    return selectedValue;
};

// 2. State Machine with Algebraic Transitions
export const μ6_algebraicStateMachine = (
    currentState: string,
    triggers: Record<string, boolean>,
    transitions: Record<string, Record<string, string>>
): string => {
    // Traditional state machine with nested if-else:
    // for (const trigger in triggers) {
    //     if (triggers[trigger] && transitions[currentState]?.[trigger]) {
    //         return transitions[currentState][trigger];
    //     }
    // }
    // return currentState;
    
    // Algebraic transistor approach:
    let nextState = currentState;
    
    Object.entries(triggers).forEach(([trigger, isActive]) => {
        const possibleNextState = transitions[currentState]?.[trigger];
        if (possibleNextState) {
            const μ6_shouldTransition = UDFormat.transistor(isActive);
            // Algebraic state selection
            nextState = nextState.slice(0, Math.floor((1 - μ6_shouldTransition) * nextState.length)) + 
                       possibleNextState.slice(0, Math.floor(μ6_shouldTransition * possibleNextState.length));
        }
    });
    
    return nextState;
};

// 3. Multi-Dimensional Conditional Scaling
export const μ6_multiDimensionalScaling = (
    baseValue: { x: number; y: number; z: number },
    conditions: {
        scaleX: boolean;
        scaleY: boolean; 
        scaleZ: boolean;
        invertX: boolean;
        invertY: boolean;
        amplifyAll: boolean;
    },
    scalingFactors: { x: number; y: number; z: number; amplify: number }
): { x: number; y: number; z: number } => {
    // Traditional approach with multiple if statements:
    // let result = { ...baseValue };
    // if (conditions.scaleX) result.x *= scalingFactors.x;
    // if (conditions.scaleY) result.y *= scalingFactors.y;
    // if (conditions.scaleZ) result.z *= scalingFactors.z;
    // if (conditions.invertX) result.x *= -1;
    // if (conditions.invertY) result.y *= -1;
    // if (conditions.amplifyAll) {
    //     result.x *= scalingFactors.amplify;
    //     result.y *= scalingFactors.amplify;
    //     result.z *= scalingFactors.amplify;
    // }
    // return result;
    
    // Algebraic transistor approach:
    const μ6_scaleXFactor = 1 + (scalingFactors.x - 1) * UDFormat.transistor(conditions.scaleX);
    const μ6_scaleYFactor = 1 + (scalingFactors.y - 1) * UDFormat.transistor(conditions.scaleY);
    const μ6_scaleZFactor = 1 + (scalingFactors.z - 1) * UDFormat.transistor(conditions.scaleZ);
    
    const μ6_invertXFactor = 1 - 2 * UDFormat.transistor(conditions.invertX);
    const μ6_invertYFactor = 1 - 2 * UDFormat.transistor(conditions.invertY);
    
    const μ6_amplifyFactor = 1 + (scalingFactors.amplify - 1) * UDFormat.transistor(conditions.amplifyAll);
    
    return {
        x: baseValue.x * μ6_scaleXFactor * μ6_invertXFactor * μ6_amplifyFactor,
        y: baseValue.y * μ6_scaleYFactor * μ6_invertYFactor * μ6_amplifyFactor,
        z: baseValue.z * μ6_scaleZFactor * μ6_amplifyFactor
    };
};

// 4. Conditional Resource Allocation
export const μ6_resourceAllocation = (
    totalResources: number,
    demands: { id: string; priority: number; amount: number; condition: boolean }[]
): Record<string, number> => {
    // Traditional approach with sorting and allocation loops:
    // const validDemands = demands.filter(d => d.condition);
    // validDemands.sort((a, b) => b.priority - a.priority);
    // let remaining = totalResources;
    // const allocation: Record<string, number> = {};
    // for (const demand of validDemands) {
    //     const allocated = Math.min(demand.amount, remaining);
    //     allocation[demand.id] = allocated;
    //     remaining -= allocated;
    // }
    // return allocation;
    
    // Algebraic transistor approach:
    const allocation: Record<string, number> = {};
    let remainingResources = totalResources;
    
    // Sort by priority first (this part remains traditional for clarity)
    const sortedDemands = [...demands].sort((a, b) => b.priority - a.priority);
    
    sortedDemands.forEach(demand => {
        const μ6_isValidDemand = UDFormat.transistor(demand.condition);
        const μ6_hasResources = UDFormat.transistor(remainingResources > 0);
        const μ6_canAllocate = μ6_isValidDemand * μ6_hasResources;
        
        const μ6_allocationAmount = Math.min(demand.amount, remainingResources) * μ6_canAllocate;
        
        allocation[demand.id] = μ6_allocationAmount;
        remainingResources -= μ6_allocationAmount;
    });
    
    return allocation;
};

// 5. Adaptive UI Behavior Based on Multiple Factors
export const μ2_adaptiveUIBehavior = (
    screenSize: { width: number; height: number },
    userPreferences: { compactMode: boolean; highContrast: boolean; animations: boolean },
    systemState: { lowMemory: boolean; slowConnection: boolean; batteryLow: boolean },
    contextualFactors: { isEditMode: boolean; hasUnsavedChanges: boolean; isFullscreen: boolean }
) => {
    // Traditional complex if-else tree:
    // let layout = 'default';
    // let animationSpeed = 1.0;
    // let colorScheme = 'normal';
    // let density = 'normal';
    // 
    // if (userPreferences.compactMode || systemState.lowMemory) {
    //     density = 'compact';
    // }
    // if (userPreferences.highContrast) {
    //     colorScheme = 'high-contrast';
    // }
    // if (!userPreferences.animations || systemState.lowMemory || systemState.batteryLow) {
    //     animationSpeed = 0;
    // }
    // ... (many more conditions)
    
    // Algebraic transistor approach:
    const μ2_isSmallScreen = UDFormat.transistor(screenSize.width < 768);
    const μ2_isCompactMode = UDFormat.transistor(userPreferences.compactMode);
    const μ2_isLowMemory = UDFormat.transistor(systemState.lowMemory);
    const μ2_shouldOptimize = UDFormat.transistor(systemState.slowConnection || systemState.batteryLow);
    
    // Density calculation
    const μ2_compactFactor = μ2_isSmallScreen + μ2_isCompactMode + μ2_isLowMemory;
    const μ2_density = Math.max(0.6, 1.0 - μ2_compactFactor * 0.15);
    
    // Animation speed calculation  
    const μ2_disableAnimations = UDFormat.transistor(!userPreferences.animations);
    const μ2_performanceOptimization = μ2_isLowMemory + μ2_shouldOptimize;
    const μ2_animationSpeed = (1.0 - μ2_disableAnimations) * Math.max(0.1, 1.0 - μ2_performanceOptimization * 0.4);
    
    // Color scheme intensity
    const μ2_highContrastBoost = UDFormat.transistor(userPreferences.highContrast) * 0.3;
    const μ2_contextualIntensity = UDFormat.transistor(contextualFactors.hasUnsavedChanges) * 0.1;
    const μ2_colorIntensity = 1.0 + μ2_highContrastBoost + μ2_contextualIntensity;
    
    // Layout responsiveness
    const μ2_fullscreenFactor = UDFormat.transistor(contextualFactors.isFullscreen);
    const μ2_editModeFactor = UDFormat.transistor(contextualFactors.isEditMode);
    const μ2_layoutComplexity = 1.0 + μ2_fullscreenFactor * 0.2 + μ2_editModeFactor * 0.3;
    
    return {
        density: μ2_density,
        animationSpeed: μ2_animationSpeed,
        colorIntensity: μ2_colorIntensity,
        layoutComplexity: μ2_layoutComplexity,
        
        // Derived styles
        spacing: Math.round(8 * μ2_density),
        borderWidth: Math.max(1, Math.round(2 * μ2_colorIntensity)),
        transitionDuration: `${μ2_animationSpeed * 0.3}s`,
        
        // Conditional features
        showAdvancedControls: μ2_editModeFactor === 1,
        enableRealTimePreview: μ2_animationSpeed > 0.5,
        useSimplifiedRendering: μ2_shouldOptimize === 1
    };
};

// 6. Dynamic Load Balancing Algorithm
export const μ6_dynamicLoadBalancing = (
    servers: Array<{
        id: string;
        currentLoad: number;
        maxCapacity: number;
        isHealthy: boolean;
        latency: number;
        priority: number;
    }>,
    newRequestWeight: number
): string => {
    // Traditional approach with complex scoring:
    // const availableServers = servers.filter(s => s.isHealthy && s.currentLoad < s.maxCapacity);
    // if (availableServers.length === 0) return servers[0].id;
    // 
    // let bestServer = availableServers[0];
    // let bestScore = calculateScore(bestServer);
    // 
    // for (const server of availableServers) {
    //     const score = calculateScore(server);
    //     if (score > bestScore) {
    //         bestScore = score;
    //         bestServer = server;
    //     }
    // }
    // return bestServer.id;
    
    // Algebraic transistor approach:
    let selectedServerId = servers[0]?.id || '';
    let bestScore = -1;
    
    servers.forEach(server => {
        const μ6_isHealthy = UDFormat.transistor(server.isHealthy);
        const μ6_hasCapacity = UDFormat.transistor(server.currentLoad + newRequestWeight <= server.maxCapacity);
        const μ6_isViable = μ6_isHealthy * μ6_hasCapacity;
        
        if (μ6_isViable === 1) {
            // Calculate composite score using algebraic weights
            const μ6_loadFactor = 1.0 - (server.currentLoad / server.maxCapacity);
            const μ6_latencyFactor = Math.max(0.1, 1.0 - server.latency / 1000);
            const μ6_priorityFactor = server.priority / 10.0;
            
            const μ6_compositeScore = μ6_loadFactor * 0.4 + μ6_latencyFactor * 0.4 + μ6_priorityFactor * 0.2;
            
            const μ6_isBetter = UDFormat.transistor(μ6_compositeScore > bestScore);
            selectedServerId = selectedServerId.slice(0, Math.floor((1 - μ6_isBetter) * selectedServerId.length)) +
                             server.id.slice(0, Math.floor(μ6_isBetter * server.id.length));
            bestScore = bestScore * (1 - μ6_isBetter) + μ6_compositeScore * μ6_isBetter;
        }
    });
    
    return selectedServerId;
};

// 7. Conditional Data Processing Pipeline
export const μ6_dataProcessingPipeline = <T>(
    data: T[],
    processors: Array<{
        name: string;
        condition: (item: T) => boolean;
        transform: (item: T) => T;
        priority: number;
        isEnabled: boolean;
    }>
): T[] => {
    // Traditional approach with nested loops and conditions:
    // return data.map(item => {
    //     let processed = item;
    //     const applicableProcessors = processors
    //         .filter(p => p.isEnabled && p.condition(item))
    //         .sort((a, b) => b.priority - a.priority);
    //     
    //     for (const processor of applicableProcessors) {
    //         processed = processor.transform(processed);
    //     }
    //     return processed;
    // });
    
    // Algebraic transistor approach:
    return data.map(item => {
        let processedItem = item;
        
        // Sort processors by priority
        const sortedProcessors = [...processors].sort((a, b) => b.priority - a.priority);
        
        sortedProcessors.forEach(processor => {
            const μ6_isEnabled = UDFormat.transistor(processor.isEnabled);
            const μ6_conditionMet = UDFormat.transistor(processor.condition(processedItem));
            const μ6_shouldProcess = μ6_isEnabled * μ6_conditionMet;
            
            if (μ6_shouldProcess === 1) {
                processedItem = processor.transform(processedItem);
            }
        });
        
        return processedItem;
    });
};

/**
 * Advanced Algebraic Transistor Patterns Summary:
 * 
 * 1. **Priority-Based Selection**: Use transistors for weighted selection among options
 * 2. **State Machines**: Algebraic transitions between states
 * 3. **Multi-Dimensional Scaling**: Complex transformations with multiple factors
 * 4. **Resource Allocation**: Fair distribution based on conditions and priorities
 * 5. **Adaptive UI**: Complex UI behavior based on multiple environmental factors
 * 6. **Load Balancing**: Server selection using composite scoring
 * 7. **Data Pipelines**: Conditional processing chains
 * 
 * Benefits of Complex Algebraic Patterns:
 * - Reduced branching complexity
 * - More predictable performance characteristics
 * - Easier to reason about mathematical relationships
 * - Better composability of conditions
 * - Cleaner separation of concerns
 * 
 * Trade-offs:
 * - Initial learning curve for team members
 * - Some patterns may be less immediately readable
 * - Debugging can be more challenging without intermediate values
 * - Not all logic naturally fits algebraic patterns
 */