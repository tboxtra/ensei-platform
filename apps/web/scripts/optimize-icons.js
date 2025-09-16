/**
 * Icon Optimization Script
 * Optimizes SVG files for web use
 */

const fs = require('fs');
const path = require('path');

function optimizeSVG(svgContent) {
    // Basic SVG optimization
    return svgContent
        // Remove comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove unnecessary whitespace
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        // Ensure proper attributes
        .replace(/<svg([^>]*)>/g, (match, attrs) => {
            // Add width and height if missing
            if (!attrs.includes('width=')) {
                attrs += ' width="24"';
            }
            if (!attrs.includes('height=')) {
                attrs += ' height="24"';
            }
            // Add viewBox if missing
            if (!attrs.includes('viewBox=')) {
                attrs += ' viewBox="0 0 24 24"';
            }
            // Add fill="currentColor" for better theming
            if (!attrs.includes('fill=') && !svgContent.includes('fill=')) {
                attrs += ' fill="currentColor"';
            }
            return `<svg${attrs}>`;
        })
        .trim();
}

function optimizeIcons() {
    const baseDir = path.join(__dirname, '..', 'public', 'icons');
    const categories = ['brand', 'platforms', 'navigation', 'tasks', 'status', 'actions'];

    console.log('🔧 Optimizing SVG Icons...\n');

    let totalOptimized = 0;

    categories.forEach(category => {
        const categoryDir = path.join(baseDir, category);

        if (!fs.existsSync(categoryDir)) {
            console.log(`📁 ${category}/ - Directory not found, skipping`);
            return;
        }

        const files = fs.readdirSync(categoryDir).filter(file => file.endsWith('.svg'));

        if (files.length === 0) {
            console.log(`📁 ${category}/ - No SVG files found`);
            return;
        }

        console.log(`📁 ${category}/ - Optimizing ${files.length} files:`);

        files.forEach(file => {
            const filePath = path.join(categoryDir, file);

            try {
                const originalContent = fs.readFileSync(filePath, 'utf8');
                const optimizedContent = optimizeSVG(originalContent);

                // Only write if content changed
                if (originalContent !== optimizedContent) {
                    fs.writeFileSync(filePath, optimizedContent);
                    console.log(`   ✅ ${file} - Optimized`);
                    totalOptimized++;
                } else {
                    console.log(`   ⚪ ${file} - Already optimized`);
                }
            } catch (error) {
                console.log(`   ❌ ${file} - Error: ${error.message}`);
            }
        });

        console.log('');
    });

    console.log(`🎉 Optimization complete! ${totalOptimized} files optimized.`);

    // Create optimization report
    const report = {
        timestamp: new Date().toISOString(),
        totalOptimized,
        categories: categories.map(category => {
            const categoryDir = path.join(baseDir, category);
            if (!fs.existsSync(categoryDir)) return { category, count: 0 };

            const files = fs.readdirSync(categoryDir).filter(file => file.endsWith('.svg'));
            return { category, count: files.length };
        })
    };

    const reportPath = path.join(__dirname, '..', 'icon-optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Report saved to: ${reportPath}`);
}

// Run optimization
if (require.main === module) {
    optimizeIcons();
}

module.exports = { optimizeIcons };
