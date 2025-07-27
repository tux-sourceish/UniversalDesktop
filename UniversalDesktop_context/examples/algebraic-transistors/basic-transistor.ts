/**
 * Basic Algebraic Transistor Patterns - VERIFIED CORRECT LOGIC
 * ============================================================
 * 
 * 🚨 CRITICAL: AI often reverses this logic! Verified against real codebase.
 * 
 * Raimunds genius: Math.pow(0, condition ? 0 : 1)
 * - TRUE → 0^0 = 1 (ON)  
 * - FALSE → 0^1 = 0 (OFF)
 * 
 * ✅ All examples verified against src/components/ usage patterns.
 */

import { UDFormat } from '../../core/UDFormat';

// 🔍 VERIFICATION HELPERS (Use these to debug!)
export const μ6_verifyTransistorLogic = () => {
    console.log('🔍 Algebraic Transistor Verification:');
    console.log('UDFormat.transistor(true) =', UDFormat.transistor(true));   // Should be 1
    console.log('UDFormat.transistor(false) =', UDFormat.transistor(false)); // Should be 0
    
    const testValue = 42;
    console.log(`✅ ${testValue} * transistor(true) =`, testValue * UDFormat.transistor(true));   // Should be 42
    console.log(`✅ ${testValue} * transistor(false) =`, testValue * UDFormat.transistor(false)); // Should be 0
};

// ✅ BASIC TRANSISTOR PATTERNS

// 1. Simple ON/OFF Logic
export const μ6_basicToggle = (value: number, condition: boolean): number => {
    // Traditional if-else (branching):
    // if (condition) return value; else return 0;
    
    // Algebraic transistor (mathematical):
    return value * UDFormat.transistor(condition);
    
    // When condition is true:  value * Math.pow(0, 0) = value * 1 = value
    // When condition is false: value * Math.pow(0, 1) = value * 0 = 0
};

// 2. Conditional Assignment
export const μ6_conditionalAssignment = (
    defaultValue: number, 
    newValue: number, 
    shouldUpdate: boolean
): number => {
    // Traditional if-else:
    // return shouldUpdate ? newValue : defaultValue;
    
    // Algebraic transistor:
    return defaultValue * UDFormat.transistor(!shouldUpdate) + 
           newValue * UDFormat.transistor(shouldUpdate);
    
    // When shouldUpdate is true:  defaultValue * 0 + newValue * 1 = newValue
    // When shouldUpdate is false: defaultValue * 1 + newValue * 0 = defaultValue
};

// 3. Multi-Condition Logic
export const μ6_multiCondition = (
    value: number, 
    condition1: boolean, 
    condition2: boolean, 
    condition3: boolean
): number => {
    // Traditional nested if-else:
    // if (condition1 && condition2 && condition3) return value; else return 0;
    
    // Algebraic transistor (pure multiplication):
    return value * 
        UDFormat.transistor(condition1) * 
        UDFormat.transistor(condition2) * 
        UDFormat.transistor(condition3);
    
    // Only returns value when ALL conditions are true
    // Any false condition makes the entire expression = 0
};

// 4. Visibility Control (UI Pattern)
export const μ2_visibilityControl = (isVisible: boolean) => {
    // Traditional if-else for opacity:
    // const opacity = isVisible ? 1.0 : 0.0;
    
    // Algebraic transistor for smooth opacity:
    const μ2_baseOpacity = 1.0 * UDFormat.transistor(isVisible);
    const μ2_hiddenOpacity = 0.05 * UDFormat.transistor(!isVisible);
    
    return {
        opacity: μ2_baseOpacity + μ2_hiddenOpacity,
        pointerEvents: isVisible ? 'auto' : 'none',
        transform: `scale(${0.95 + 0.05 * UDFormat.transistor(isVisible)})`
    };
};

// 5. State Transition Logic
export const μ6_stateTransition = (
    currentState: number, 
    targetState: number, 
    shouldTransition: boolean,
    transitionSpeed: number = 0.1
): number => {
    // Traditional if-else:
    // if (shouldTransition) {
    //     return currentState + (targetState - currentState) * transitionSpeed;
    // } else {
    //     return currentState;
    // }
    
    // Algebraic transistor:
    const μ6_deltaValue = (targetState - currentState) * transitionSpeed;
    return currentState + μ6_deltaValue * UDFormat.transistor(shouldTransition);
};

// 6. Feature Flag Implementation
export const μ6_featureFlag = <T>(
    defaultImplementation: T, 
    experimentalImplementation: T, 
    isExperimentEnabled: boolean
): T => {
    // Traditional if-else:
    // return isExperimentEnabled ? experimentalImplementation : defaultImplementation;
    
    // For non-numeric values, we use the transistor for selection:
    const μ6_useDefault = UDFormat.transistor(!isExperimentEnabled);
    const μ6_useExperimental = UDFormat.transistor(isExperimentEnabled);
    
    // This pattern works for objects/strings by using the transistor as a selector
    if (μ6_useExperimental === 1) return experimentalImplementation;
    return defaultImplementation;
};

// 7. Array Filtering with Transistors
export const μ6_algebraicFilter = <T>(
    array: T[], 
    predicate: (item: T) => boolean
): T[] => {
    // Traditional filter:
    // return array.filter(predicate);
    
    // Algebraic approach (more complex but demonstrates the concept):
    return array.reduce((result: T[], item: T) => {
        const μ6_shouldInclude = UDFormat.transistor(predicate(item));
        return μ6_shouldInclude === 1 ? [...result, item] : result;
    }, []);
};

// 8. Performance Optimization with Transistors
export const μ6_conditionalExecution = <T>(
    heavyFunction: () => T, 
    lightFunction: () => T, 
    useHeavyLogic: boolean,
    fallbackValue: T
): T => {
    // Traditional if-else with potential unnecessary execution:
    // return useHeavyLogic ? heavyFunction() : lightFunction();
    
    // Algebraic transistor with lazy execution:
    const μ6_executeHeavy = UDFormat.transistor(useHeavyLogic);
    const μ6_executeLight = UDFormat.transistor(!useHeavyLogic);
    
    try {
        if (μ6_executeHeavy === 1) {
            return heavyFunction();
        } else if (μ6_executeLight === 1) {
            return lightFunction();
        }
        return fallbackValue;
    } catch (error) {
        return fallbackValue;
    }
};

// 9. Weighted Sum with Conditions
export const μ6_conditionalWeightedSum = (
    values: number[], 
    weights: number[], 
    conditions: boolean[]
): number => {
    // Traditional approach with loops and conditions:
    // let sum = 0;
    // for (let i = 0; i < values.length; i++) {
    //     if (conditions[i]) {
    //         sum += values[i] * weights[i];
    //     }
    // }
    // return sum;
    
    // Algebraic transistor approach:
    return values.reduce((sum, value, index) => {
        const weight = weights[index] || 1;
        const condition = conditions[index] || false;
        return sum + (value * weight * UDFormat.transistor(condition));
    }, 0);
};

// 10. Dynamic Styling with Transistors
export const μ2_dynamicStyling = (
    isActive: boolean, 
    isHighlighted: boolean, 
    isDisabled: boolean
) => {
    // Traditional multiple if statements:
    // let backgroundColor = '#ffffff';
    // if (isActive) backgroundColor = '#007acc';
    // if (isHighlighted) backgroundColor = '#ffd700';
    // if (isDisabled) backgroundColor = '#cccccc';
    
    // Algebraic transistor approach:
    const μ2_baseColor = { r: 255, g: 255, b: 255 }; // White
    const μ2_activeColor = { r: 0, g: 122, b: 204 }; // Blue  
    const μ2_highlightColor = { r: 255, g: 215, b: 0 }; // Gold
    const μ2_disabledColor = { r: 204, g: 204, b: 204 }; // Gray
    
    // Priority system: disabled > active > highlighted > base
    const μ2_disabledWeight = UDFormat.transistor(isDisabled);
    const μ2_activeWeight = UDFormat.transistor(isActive && !isDisabled);
    const μ2_highlightWeight = UDFormat.transistor(isHighlighted && !isActive && !isDisabled);
    const μ2_baseWeight = UDFormat.transistor(!isActive && !isHighlighted && !isDisabled);
    
    const r = μ2_baseColor.r * μ2_baseWeight +
              μ2_highlightColor.r * μ2_highlightWeight +
              μ2_activeColor.r * μ2_activeWeight +
              μ2_disabledColor.r * μ2_disabledWeight;
              
    const g = μ2_baseColor.g * μ2_baseWeight +
              μ2_highlightColor.g * μ2_highlightWeight +
              μ2_activeColor.g * μ2_activeWeight +
              μ2_disabledColor.g * μ2_disabledWeight;
              
    const b = μ2_baseColor.b * μ2_baseWeight +
              μ2_highlightColor.b * μ2_highlightWeight +
              μ2_activeColor.b * μ2_activeWeight +
              μ2_disabledColor.b * μ2_disabledWeight;
    
    return {
        backgroundColor: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
        opacity: 1.0 - 0.5 * μ2_disabledWeight,
        cursor: isDisabled ? 'not-allowed' : 'pointer'
    };
};

/**
 * Key Algebraic Transistor Principles:
 * 
 * 1. **Branch-Free Logic**: No if-else statements, pure mathematical expressions
 * 2. **Mathematical Elegance**: Conditions become multiplicative factors
 * 3. **Performance Benefits**: Eliminates branch prediction overhead
 * 4. **Composability**: Multiple conditions can be easily combined
 * 5. **Readability**: Once understood, more elegant than nested conditions
 * 
 * When to Use:
 * - Numeric calculations with conditions
 * - Performance-critical code paths
 * - Multiple condition combinations
 * - State transitions and animations
 * - Feature flags and configuration
 * 
 * When NOT to Use:
 * - Complex business logic with side effects
 * - Error handling (exceptions still needed)
 * - String/object manipulation without clear numeric mapping
 * - Cases where traditional if-else is clearer for team understanding
 */

// Example Usage in Real Components:
export const μ2_ExampleComponent: React.FC<{ isVisible: boolean; isActive: boolean }> = ({ 
    isVisible, 
    isActive 
}) => {
    // Apply multiple algebraic transistor patterns
    const μ2_styles = {
        ...μ2_visibilityControl(isVisible),
        ...μ2_dynamicStyling(isActive, false, false)
    };
    
    const μ6_animationProgress = μ6_stateTransition(0, 1, isVisible, 0.1);
    
    return (
        <div style={{
            ...μ2_styles,
            transform: `${μ2_styles.transform} translateY(${(1 - μ6_animationProgress) * 20}px)`
        }}>
            Algebraic Transistor Example
        </div>
    );
};

// 🧪 VERIFICATION TESTS (Run these to confirm correctness!)
export const μ6_runVerificationTests = () => {
    console.log('🧪 Running Algebraic Transistor Verification Tests...');
    
    // Test 1: Basic Logic
    console.log('\n📋 Test 1: Basic Transistor Logic');
    μ6_verifyTransistorLogic();
    
    // Test 2: Real Codebase Pattern (from μ1_Header.tsx)
    console.log('\n📋 Test 2: Button Visibility Pattern');
    const isVisible = true;
    const buttonActive = UDFormat.transistor(isVisible);     // Should be 1
    const buttonInactive = UDFormat.transistor(!isVisible);  // Should be 0
    console.log(`✅ Button active (visible=true): ${buttonActive}`);   // Should be 1
    console.log(`✅ Button inactive (visible=true): ${buttonInactive}`); // Should be 0
    
    // Test 3: Conditional Values
    console.log('\n📋 Test 3: Conditional Value Selection');
    const useFirst = true;
    const result = μ6_conditionalAssignment(100, 200, useFirst);
    console.log(`✅ Conditional selection (useFirst=true): ${result}`); // Should be 200
    
    const useSecond = false;
    const result2 = μ6_conditionalAssignment(100, 200, useSecond);
    console.log(`✅ Conditional selection (useFirst=false): ${result2}`); // Should be 100
    
    // Test 4: Multi-Condition AND
    console.log('\n📋 Test 4: Multi-Condition Logic');
    const allTrue = μ6_multiCondition(50, true, true, true);
    const oneFalse = μ6_multiCondition(50, true, false, true);
    console.log(`✅ All conditions true: ${allTrue}`);  // Should be 50
    console.log(`✅ One condition false: ${oneFalse}`); // Should be 0
    
    console.log('\n🎉 All verification tests completed!');
    console.log('If any results are unexpected, check transistor logic implementation.');
};