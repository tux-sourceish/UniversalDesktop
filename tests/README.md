# 🧪 UniversalDesktop v2.1 Test Suite

Comprehensive testing infrastructure for the Universal Context Menu System and File-Manager implementation, following μX-Bagua architecture principles.

## 📋 Test Overview

This test suite validates all success criteria from `SYSTEM-PROMPT.md` and ensures the Universal Context Menu serves as the primary interaction pattern across all UniversalDesktop elements.

### 🎯 Test Coverage

- **Unit Tests**: Individual component and hook functionality
- **Integration Tests**: Component interaction patterns and context menu integration
- **Performance Tests**: Response times, memory usage, and scalability
- **Accessibility Tests**: WCAG 2.1 AA compliance and screen reader support
- **Compatibility Tests**: Tauri/web dual environment support
- **E2E Tests**: Complete user workflows and real-world scenarios

## 🏗️ Architecture

The test suite follows the same μX-Bagua principles as the main codebase:

```
tests/
├── setup.ts                    # μ4_ BERG - Test initialization & configuration
├── vitest.config.ts            # μ4_ BERG - Build system configuration
├── unit/                       # μ1_ HIMMEL - Core component testing
│   ├── contextMenu/            # μ7_ DONNER - Event/interaction tests
│   └── hooks/                  # μ6_ FEUER - Function/logic tests
├── integration/                # μ3_ WASSER - Flow/process tests
├── performance/                # μ6_ FEUER - Performance validation
├── accessibility/              # μ2_ WIND - UI/UX compliance
├── compatibility/              # μ8_ ERDE - Platform compatibility
└── e2e/                       # μ3_ WASSER - End-to-end workflows
```

## 🚀 Quick Start

### Prerequisites

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:performance
npm run test:accessibility
npm run test:e2e

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Environment Variables

```bash
# Skip long-running tests
SKIP_LONG_TESTS=true npm test

# Skip performance tests
SKIP_PERFORMANCE_TESTS=true npm test

# Skip E2E tests
SKIP_E2E_TESTS=true npm test
```

## 📊 Test Categories

### 1. Unit Tests (`tests/unit/`)

Testing individual components and hooks in isolation.

#### Context Menu Tests (`contextMenu/μ7_UnifiedContextMenu.test.tsx`)
- ✅ Visibility and positioning logic
- ✅ Menu item rendering and algebraic transistor integration
- ✅ Canvas, window, and content context modes
- ✅ Keyboard navigation and accessibility
- ✅ Error handling and edge cases

#### File Manager Tests (`hooks/useFileManager.test.ts`)
- ✅ File system operations (navigation, selection, operations)
- ✅ Dual-mode support (GUI/TUI preparation)
- ✅ Search, filtering, and sorting
- ✅ Drag & drop functionality
- ✅ Bookmarks and recent files

#### Context Manager Tests (`hooks/µ6_useContextManager.test.ts`)
- ✅ Token estimation and management
- ✅ Auto-optimization when limits exceeded
- ✅ Context history and undo functionality
- ✅ Vision-ready context generation
- ✅ Bagua integration patterns

### 2. Integration Tests (`tests/integration/`)

Testing component interactions and universal patterns.

#### Context Menu Integration (`contextMenuIntegration.test.tsx`)
- ✅ File manager context menu integration
- ✅ Universal interaction pattern consistency
- ✅ State management across components
- ✅ Bagua-aware action grouping
- ✅ TUI mode preparation

### 3. Performance Tests (`tests/performance/`)

Validating response times and resource usage.

#### Performance Benchmarks (`contextMenuPerformance.test.ts`)
- ✅ Context menu render time (<50ms)
- ✅ Large file list handling (10,000+ items)
- ✅ Memory leak prevention
- ✅ 60fps interaction responsiveness
- ✅ Concurrent operation efficiency

### 4. Accessibility Tests (`tests/accessibility/`)

Ensuring WCAG 2.1 AA compliance and inclusive design.

#### Accessibility Compliance (`contextMenuAccessibility.test.tsx`)
- ✅ No axe-core violations
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ High contrast mode support
- ✅ Touch accessibility (44px minimum targets)
- ✅ Reduced motion preferences

### 5. Compatibility Tests (`tests/compatibility/`)

Testing dual Tauri/web environment support.

#### Tauri Compatibility (`tauriCompatibility.test.ts`)
- ✅ Environment detection
- ✅ File system API abstraction
- ✅ Dialog integration (native vs web)
- ✅ Clipboard operations
- ✅ Window management
- ✅ Graceful fallbacks

### 6. E2E Tests (`tests/e2e/`)

Complete user workflow validation.

#### User Workflows (`userWorkflows.test.tsx`)
- ✅ File browsing and management
- ✅ Context menu interactions
- ✅ Multi-file operations
- ✅ Search and filtering workflows
- ✅ Accessibility user journeys
- ✅ Error recovery scenarios

## 🛠️ Test Utilities

### TestUtils (`tests/setup.ts`)

Provides comprehensive testing utilities following μX-Bagua patterns:

```typescript
// Mock data creation
TestUtils.createMockUDItem(overrides)
TestUtils.createMockFileItem(overrides)
TestUtils.createMockContextMenu(overrides)

// Interaction simulation
TestUtils.simulateKeyboard(key, options)
TestUtils.simulateMouse(type, options)

// Async utilities
TestUtils.waitForNextTick()
TestUtils.waitForAnimationFrame()

// Bagua-aware data
TestUtils.generateBaguaDescriptor()
```

### Test Configuration (`TestConfig`)

```typescript
// Performance thresholds
defaultTimeout: 5000
animationTimeout: 1000
apiTimeout: 3000

// Environment flags
skipLongRunningTests
skipPerformanceTests
skipE2ETests
```

## 📈 Coverage Requirements

Minimum coverage thresholds are enforced:

- **Global**: 80% lines, 75% branches, 75% functions
- **Critical Components**: 
  - Context Menu: 90% lines, 85% branches
  - File Manager Hook: 85% lines, 80% branches
  - Context Manager Hook: 85% lines, 80% branches

## 🎯 Success Criteria Validation

All tests validate the success criteria from `SYSTEM-PROMPT.md`:

### ✅ Universal Context Menu System
- Right-click anywhere shows helpful context menu
- Every action teaches its keyboard shortcut
- Context menu serves as the interaction cheatsheet
- Quality control checkpoint for all operations

### ✅ File-Manager Dual-Mode Operations
- Browser compatibility with native preparation
- TUI mode infrastructure (Norton Commander style)
- Seamless switching between modes (F12)
- Context-menu driven operations

### ✅ Integration Patterns
- Universal interaction pattern across all elements
- Consistent behavior in different contexts
- Bagua-aware action organization
- Performance optimization

### ✅ Tauri/Web Compatibility
- Dual environment support
- Native API integration with web fallbacks
- File system abstraction
- Dialog and clipboard consistency

### ✅ Performance & Accessibility
- <50ms context menu render time
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Touch accessibility

## 🐛 Debugging Tests

### Running Individual Tests

```bash
# Specific test file
npm test -- contextMenu

# Specific test case
npm test -- --grep "should render context menu"

# Debug mode with console output
npm test -- --reporter=verbose
```

### Mock Debugging

```bash
# Enable mock debugging
DEBUG_MOCKS=true npm test

# Mock specific APIs
MOCK_TAURI=true npm test
MOCK_FILE_SYSTEM=true npm test
```

### Coverage Analysis

```bash
# Generate detailed coverage report
npm run test:coverage

# Open coverage report
open coverage/index.html
```

## 🔧 CI/CD Integration

### GitHub Actions

```yaml
- name: Run Tests
  run: |
    npm ci
    npm run test:ci
    npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Test Commands

```bash
# CI-optimized test run
npm run test:ci

# Parallel test execution
npm run test:parallel

# Test with coverage upload
npm run test:coverage:upload
```

## 📝 Writing New Tests

### Test Structure

Follow the established patterns:

```typescript
describe('Component/Feature Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature Group', () => {
    it('should describe specific behavior', async () => {
      // Arrange
      const mockProps = TestUtils.createMockProps();
      
      // Act
      render(<Component {...mockProps} />);
      
      // Assert
      expect(screen.getByText('Expected')).toBeInTheDocument();
    });
  });
});
```

### Best Practices

1. **Use descriptive test names** that explain behavior
2. **Follow AAA pattern** (Arrange, Act, Assert)
3. **Mock external dependencies** appropriately
4. **Test edge cases** and error conditions
5. **Ensure cleanup** in afterEach hooks
6. **Use realistic data** with TestUtils
7. **Test accessibility** from the start
8. **Consider performance** implications

### Mock Guidelines

```typescript
// ✅ Good: Descriptive mocks
vi.mock('@/hooks/useFileManager', () => ({
  useFileManager: vi.fn(() => createRealisticFileManager())
}));

// ✅ Good: Behavior verification
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);

// ❌ Avoid: Over-mocking implementation details
// ❌ Avoid: Mocks that don't reflect real behavior
```

## 🤝 Contributing

When adding new features:

1. **Write tests first** (TDD approach)
2. **Update this README** with new test categories
3. **Ensure coverage thresholds** are met
4. **Add performance tests** for critical paths
5. **Include accessibility tests** for UI components
6. **Test both Tauri and web** environments

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest-Axe for Accessibility](https://github.com/nickcolley/jest-axe)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [μX-Bagua Architecture Guide](../AI_KNOWLEDGE_BASE.md)

---

**Test Coverage**: Comprehensive validation of all UniversalDesktop functionality
**Philosophy**: Tests as living documentation of the Universal Context Menu system
**Goal**: 100% confidence in the interaction patterns that define UniversalDesktop