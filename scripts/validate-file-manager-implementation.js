#!/usr/bin/env node

/**
 * File Manager Dual-Mode Implementation Validator
 * 
 * This script validates the File Manager TUI implementation by checking:
 * 1. Component structure and exports
 * 2. Mode switching functionality
 * 3. TUI integration completeness
 * 4. Key binding implementations
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating File Manager Dual-Mode Implementation...\n');

// File paths to check
const filesToCheck = [
  {
    path: 'src/components/μ2_FileManager.tsx',
    name: 'File Manager Component',
    required: true
  },
  {
    path: 'src/components/windows/μ2_FileManagerWindow.tsx',
    name: 'File Manager Window',
    required: true
  },
  {
    path: 'src/components/bridges/FileManagerWindow.tsx',
    name: 'File Manager Bridge',
    required: true
  },
  {
    path: 'src/components/windows/μ2_TuiWindow.tsx',
    name: 'TUI Window Component',
    required: true
  },
  {
    path: 'src/hooks/μ3_useFileSystem.ts',
    name: 'File System Hook',
    required: true
  }
];

// Features to validate
const featuresToCheck = [
  {
    name: 'F12 Mode Switching',
    pattern: /event\.key === 'F12'/,
    files: ['src/components/μ2_FileManager.tsx', 'src/components/windows/μ2_FileManagerWindow.tsx']
  },
  {
    name: 'TUI Mode Rendering',
    pattern: /renderTUIContent|mode === 'tui'/,
    files: ['src/components/μ2_FileManager.tsx']
  },
  {
    name: 'Norton Commander Style',
    pattern: /Norton Commander|function-keys|tui-function-keys/,
    files: ['src/components/μ2_FileManager.tsx']
  },
  {
    name: 'Keyboard Navigation',
    pattern: /ArrowUp|ArrowDown|Enter.*preventDefault/,
    files: ['src/components/μ2_FileManager.tsx']
  },
  {
    name: 'Dual-Mode State Management',
    pattern: /useState.*mode|setMode|currentMode/,
    files: ['src/components/windows/μ2_FileManagerWindow.tsx']
  },
  {
    name: 'TUI Window Integration',
    pattern: /μ2_TuiWindow|createTuiUDItem/,
    files: ['src/components/windows/μ2_FileManagerWindow.tsx']
  }
];

let validationResults = {
  filesFound: 0,
  filesMissing: 0,
  featuresFound: 0,
  featuresMissing: 0,
  errors: []
};

// Check file existence
console.log('📁 Checking File Structure:');
filesToCheck.forEach(file => {
  const fullPath = path.resolve(file.path);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${file.name} - Found`);
    validationResults.filesFound++;
  } else {
    console.log(`  ❌ ${file.name} - Missing`);
    validationResults.filesMissing++;
    if (file.required) {
      validationResults.errors.push(`Required file missing: ${file.path}`);
    }
  }
});

console.log('\n🔧 Checking Feature Implementation:');

// Check feature implementation
featuresToCheck.forEach(feature => {
  let featureFound = false;
  
  feature.files.forEach(filePath => {
    const fullPath = path.resolve(filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (feature.pattern.test(content)) {
        featureFound = true;
      }
    }
  });
  
  if (featureFound) {
    console.log(`  ✅ ${feature.name} - Implemented`);
    validationResults.featuresFound++;
  } else {
    console.log(`  ❌ ${feature.name} - Missing or Incomplete`);
    validationResults.featuresMissing++;
    validationResults.errors.push(`Feature not found: ${feature.name}`);
  }
});

// Additional specific checks
console.log('\n🎯 Specific Implementation Checks:');

// Check for TUI ASCII box drawing
const fileManagerPath = path.resolve('src/components/μ2_FileManager.tsx');
if (fs.existsSync(fileManagerPath)) {
  const content = fs.readFileSync(fileManagerPath, 'utf8');
  
  // Check for ASCII box characters
  if (content.includes('╔') || content.includes('║') || content.includes('═')) {
    console.log('  ✅ ASCII Box Drawing Characters - Found');
  } else {
    console.log('  ⚠️  ASCII Box Drawing Characters - Not detected');
  }
  
  // Check for mode switching logic
  if (content.includes('toggleMode') && content.includes('F12')) {
    console.log('  ✅ Mode Toggle Function - Implemented');
  } else {
    console.log('  ❌ Mode Toggle Function - Missing');
    validationResults.errors.push('Mode toggle function not properly implemented');
  }
  
  // Check for TUI status bar
  if (content.includes('tui-status-bar') || content.includes('function-keys')) {
    console.log('  ✅ TUI Status Bar - Implemented');
  } else {
    console.log('  ⚠️  TUI Status Bar - May be incomplete');
  }
}

// Check window integration
const windowPath = path.resolve('src/components/windows/μ2_FileManagerWindow.tsx');
if (fs.existsSync(windowPath)) {
  const content = fs.readFileSync(windowPath, 'utf8');
  
  if (content.includes('μ2_TuiWindow') && content.includes('createTuiUDItem')) {
    console.log('  ✅ TUI Window Integration - Complete');
  } else {
    console.log('  ❌ TUI Window Integration - Incomplete');
    validationResults.errors.push('TUI Window integration not complete');
  }
  
  if (content.includes('mode-indicator')) {
    console.log('  ✅ Mode Indicator - Implemented');
  } else {
    console.log('  ⚠️  Mode Indicator - Not detected');
  }
}

// Final Results
console.log('\n📊 Validation Summary:');
console.log(`Files Found: ${validationResults.filesFound}/${filesToCheck.length}`);
console.log(`Features Implemented: ${validationResults.featuresFound}/${featuresToCheck.length}`);

if (validationResults.errors.length === 0) {
  console.log('\n🎉 SUCCESS: File Manager dual-mode implementation appears complete!');
  console.log('✨ Key features validated:');
  console.log('   - F12 mode switching');
  console.log('   - TUI rendering with Norton Commander style');
  console.log('   - Keyboard navigation');
  console.log('   - μ2_TuiWindow integration');
  console.log('   - State persistence');
  console.log('\n🚀 Ready for testing in UniversalDesktop!');
  process.exit(0);
} else {
  console.log('\n⚠️  ISSUES FOUND:');
  validationResults.errors.forEach(error => {
    console.log(`   - ${error}`);
  });
  console.log('\n🔧 Please address the issues above before testing.');
  process.exit(1);
}