#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Disallowed global directories that should not be created or expanded
const bad = [
    'apps/web/src/components',
    'apps/web/src/utils',
    'apps/web/src/services',
    'services/api-gateway/src/services',
    'services/api-gateway/src/utils'
];

// Get the project root (two levels up from this script)
const projectRoot = path.join(__dirname, '..', '..');
const errors = [];

// Check each disallowed directory
bad.forEach(dir => {
    const fullPath = path.join(projectRoot, dir);
    if (fs.existsSync(fullPath)) {
        errors.push(dir);
    }
});

// If any disallowed directories are found, exit with error
if (errors.length > 0) {
    console.error('❌ Disallowed global directories found:');
    errors.forEach(dir => {
        console.error(`   - ${dir}`);
    });
    console.error('\n💡 These directories violate feature-first architecture principles.');
    console.error('   Instead, place code in feature-specific folders:');
    console.error('   - Web: src/features/<feature>/{components,hooks,api,state,schemas}');
    console.error('   - API: src/modules/<module>/{http,app,infra}');
    console.error('\n   See the feature templates for proper structure:');
    console.error('   - apps/web/src/features/_TEMPLATE/README.md');
    console.error('   - services/api-gateway/src/modules/_TEMPLATE/README.md');
    process.exit(1);
}

console.log('✅ Project structure check passed - no disallowed global directories found');
