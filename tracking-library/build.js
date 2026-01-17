const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const sourceFile = path.join(__dirname, 'src/tracker.js');
const outputDir = path.join(__dirname, 'dist');
const outputFile = path.join(outputDir, 'pulse-tracker.min.js');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function build() {
    console.log('Building Pulse Tracker library...');
    
    try {
        // Read source file
        const sourceCode = fs.readFileSync(sourceFile, 'utf8');
        
        // Minify the code
        const result = await minify(sourceCode, {
            compress: {
                drop_console: true,
                drop_debugger: true
            },
            mangle: {
                toplevel: true
            },
            format: {
                comments: false
            }
        });
        
        if (result.error) {
            throw result.error;
        }
        
        // Write minified code
        fs.writeFileSync(outputFile, result.code);
        
        // Also write non-minified version for development
        const devOutputFile = path.join(outputDir, 'pulse-tracker.js');
        fs.writeFileSync(devOutputFile, sourceCode);
        
        console.log(`Build successful!`);
        console.log(`- Minified: ${outputFile} (${result.code.length} bytes)`);
        console.log(`- Development: ${devOutputFile} (${sourceCode.length} bytes)`);
        
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

// Handle watch mode
if (process.argv.includes('--watch')) {
    console.log('Watching for changes...');
    fs.watch(path.dirname(sourceFile), { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.js')) {
            console.log(`File ${filename} changed, rebuilding...`);
            build();
        }
    });
    build(); // Initial build
} else {
    build();
}
