# μX-Bagua Feature Development Prompt

## CRITICAL SETUP
Before implementing any feature in UniversalDesktop:

1. **Read**: `UniversalDesktop_context/PHILOSOPHY.md` - Understand Raimund's Bagua system
2. **Study**: `examples/μX-naming-patterns/` - See correct μX-prefix patterns  
3. **Verify**: `examples/algebraic-transistors/CRITICAL-CORRECT-LOGIC.md` - Avoid logic reversal!
4. **Check**: Current build status with `npm run build` 

## FEATURE DEVELOPMENT CHECKLIST

### μX-Naming Convention (MANDATORY)
- [ ] Function has correct μX-prefix based on Bagua responsibility:
  - μ1: Templates/Classes → WindowFactory, ComponentTemplate
  - μ2: Views/UI → Windows, Panels, Visual rendering
  - μ3: Procedures/Flow → Navigation, Animation, Data flow
  - μ4: Init/Setup → Authentication, Configuration
  - μ5: Properties → Settings, Territory, Attributes
  - μ6: Functions → Calculations, AI processing, Transformations
  - μ7: Events → Click handlers, Keyboard, User interaction
  - μ8: Global/Base → Canvas, Core data, Foundation

### Algebraic Transistor Usage (CRITICAL)
- [ ] Using `UDFormat.transistor(condition)` instead of if-else where possible
- [ ] Verified logic: `true → 1`, `false → 0`
- [ ] Tested with verification helper: `μ6_verifyTransistorLogic()`

### UDItem Integration
- [ ] Feature works with complete UDItem structure
- [ ] Transformation history tracked for all changes
- [ ] Origin tracking (human vs AI) implemented
- [ ] Context integration (📌 button) supported

### Campus-Modell Architecture
- [ ] Hook follows "One Hook = One Responsibility" principle
- [ ] No monolithic functions > 50 lines
- [ ] Clear separation of μX responsibilities
- [ ] Proper polar relationships respected (μ1↔μ8, μ2↔μ7, μ3↔μ6, μ4↔μ5)

## IMPLEMENTATION TEMPLATE

```typescript
// μX_newFeature.ts - Replace X with correct Bagua number
import { UDFormat } from '../core/UDFormat';

export const μX_newFeature = () => {
    // μ4_ Setup/Init (if needed)
    const μ4_initialize = useCallback(() => {
        // Initialization logic
    }, []);

    // μ5_ Properties (computed values)
    const μ5_computedProps = useMemo(() => {
        // Property calculations
    }, [dependencies]);

    // μ6_ Functions (active processing)
    const μ6_processData = useCallback((data: any, condition: boolean) => {
        // CRITICAL: Verify transistor logic!
        return data * UDFormat.transistor(condition);
    }, []);

    // μ7_ Events (user interactions)
    const μ7_handleUserAction = useCallback((event: Event) => {
        // Event handling
    }, []);

    return {
        // Export only what's needed
        μ5_computedProps,
        μ6_processData,
        μ7_handleUserAction
    };
};
```

## TESTING REQUIREMENTS
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors (warnings OK)
- [ ] Feature works in browser: `npm run dev`
- [ ] Algebraic transistor logic verified with test function
- [ ] UDItem transformation history includes new feature usage

## COMMIT MESSAGE FORMAT
```
✨ Add μX_FeatureName - [Brief Description]

- Implements Raimund's Bagua pattern μX_ELEMENT
- Uses algebraic transistors for [specific logic]
- Integrates with UDItem transformation history
- [Any breaking changes or special notes]

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

## POST-IMPLEMENTATION
1. Update FEATURES.md with new feature status
2. Add feature to examples/ if it demonstrates new patterns
3. Document any new μX-patterns discovered
4. Test feature integration with existing μX-components