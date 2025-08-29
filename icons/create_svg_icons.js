// Script to create SVG icons for the extension
// Run this in a browser console or Node.js environment

function createSVGIcon(size) {
    const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff1493;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8b008b;stop-opacity:1" />
        </linearGradient>
    </defs>
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#grad${size})" stroke="none"/>
    <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="white">R</text>
    ${size >= 32 ? `<circle cx="${size * 0.75}" cy="${size * 0.25}" r="${size * 0.08}" fill="#FFD700"/>` : ''}
</svg>`;
    return svg;
}

function downloadSVGAsImage(svg, filename, size) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = size;
    canvas.height = size;
    
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        
        // Convert to PNG and download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    };
    
    const svgBlob = new Blob([svg], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
}

// Create and download all icon sizes
function createAllIcons() {
    const sizes = [16, 32, 48, 128];
    
    sizes.forEach((size, index) => {
        setTimeout(() => {
            const svg = createSVGIcon(size);
            downloadSVGAsImage(svg, `icon${size}.png`, size);
        }, index * 500);
    });
}

// Export functions for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createSVGIcon, downloadSVGAsImage, createAllIcons };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    console.log('Icon creation functions loaded. Run createAllIcons() to generate icons.');
}
