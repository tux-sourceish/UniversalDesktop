# μX-Bagua Bug Fix Prompt

## CRITICAL DEBUGGING CHECKLIST

### Common UniversalDesktop Bug Sources:
1. **Reversed Algebraic Transistor Logic** (Most Common!)
2. **Wrong μX-prefix** causing responsibility confusion  
3. **Missing UDItem integration** breaking transformation history
4. **Import path errors** after file renames
5. **Type mismatches** between modules

## BUG ANALYSIS TEMPLATE

### 1. Identify Bug Category
- [ ] **Algebraic Transistor**: Logic behaving opposite to expected?
- [ ] **μX-Naming**: Function in wrong Bagua category?
- [ ] **UDItem Flow**: Data not persisting or transforming correctly?
- [ ] **Type System**: TypeScript errors or runtime type mismatches?
- [ ] **Build System**: Import/export errors, missing dependencies?

### 2. Algebraic Transistor Debugging (PRIORITY)
If logic behaves opposite to expected:

```typescript
// FIRST: Verify transistor logic
import { UDFormat } from '../core/UDFormat';

console.log('🔍 Transistor Verification:');
console.log('transistor(true) =', UDFormat.transistor(true));   // Should be 1
console.log('transistor(false) =', UDFormat.transistor(false)); // Should be 0

// TEST your specific case:
const yourCondition = true; // Your actual condition
const result = someValue * UDFormat.transistor(yourCondition);
console.log(`Expected when true: ${someValue}, Got: ${result}`);
```

### 3. μX-Responsibility Check
Verify correct Bagua assignment:
- μ1: Creating templates/classes? ✅ 
- μ2: Rendering UI/visuals? ✅
- μ3: Managing flow/procedures? ✅
- μ6: Processing/calculating? ✅
- μ7: Handling events? ✅
- μ8: Managing global/base data? ✅

## COMMON FIXES

### Fix 1: Reversed Transistor Logic
```typescript
// ❌ WRONG (reversed)
const hideElement = UDFormat.transistor(!isVisible);
const opacity = 1.0 * hideElement; // 0 when visible!

// ✅ CORRECT  
const showElement = UDFormat.transistor(isVisible);
const opacity = 1.0 * showElement; // 1 when visible!
```

### Fix 2: Wrong μX-Prefix
```typescript
// ❌ WRONG - UI logic in function module
const μ6_renderWindow = () => { /* rendering */ };

// ✅ CORRECT - UI logic in wind module
const μ2_renderWindow = () => { /* rendering */ };
```

### Fix 3: Missing UDItem Integration
```typescript
// ❌ WRONG - No transformation tracking
const updateItem = (item: UDItem, newData: any) => {
    return { ...item, content: newData };
};

// ✅ CORRECT - With transformation history
const μ6_updateItem = (item: UDItem, newData: any) => {
    const transformation = {
        id: `fix_${Date.now()}`,
        timestamp: Date.now(),
        verb: 'fixed',
        agent: 'system:debug',
        description: 'Bug fix applied'
    };
    
    return {
        ...item,
        content: newData,
        transformation_history: [...item.transformation_history, transformation],
        updated_at: Date.now()
    };
};
```

## DEBUGGING WORKFLOW

### Step 1: Isolate the Issue
1. Check browser console for errors
2. Run `npm run build` - any TypeScript errors?
3. Test with minimal example
4. Use transistor verification helper

### Step 2: Verify Core Systems
```bash
# Check build status
npm run build

# Check development server  
npm run dev

# Check file structure consistency
find src/ -name "*.ts*" | grep -E "(μ|µ)" | head -10
```

### Step 3: Test Fix
```typescript
// Create test function for your fix
export const μ6_testBugFix = () => {
    console.log('🧪 Testing bug fix...');
    
    // Test your specific case
    const testResult = yourFixedFunction(testInput);
    const expectedResult = expectedOutput;
    
    if (testResult === expectedResult) {
        console.log('✅ Bug fix verified!');
        return true;
    } else {
        console.error('❌ Bug still present:', { testResult, expectedResult });
        return false;
    }
};
```

## COMMIT MESSAGE FOR BUG FIX
```
🐛 Fix μX_ComponentName - [Brief Description]

- Fixed [specific issue] in [component/function]
- Root cause: [reversed transistor logic/wrong prefix/etc.]
- Verified with test function
- Preserves Raimund's Bagua system integrity

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

## PREVENTION CHECKLIST
- [ ] Used transistor verification helper during development
- [ ] Followed μX-naming conventions strictly  
- [ ] Added transformation history to UDItem changes
- [ ] Tested build after changes
- [ ] Verified against examples/ patterns