// Test Google Drive conversion với file ID có dấu gạch ngang kép
console.log("=== Test Google Drive Link Conversion ===");

// Simulate the functions (since we can't import ES modules directly)
function extractGoogleDriveFileId(url) {
    if (!url || typeof url !== 'string') return null;

    const cleanUrl = url.trim();
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,
        /[?&]id=([a-zA-Z0-9_-]+)/,
        /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
        /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
        /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match && match[1]) {
            let fileId = match[1];
            fileId = fileId.split('&')[0].split('?')[0];
            return fileId;
        }
    }

    return null;
}

function convertGoogleDriveLink(url) {
    if (!url || typeof url !== 'string') return url;

    if (url.includes('drive.google.com/uc?id=') && !url.includes('export=view')) {
        return url;
    }

    const fileId = extractGoogleDriveFileId(url);
    if (!fileId) return url;

    return `https://drive.google.com/uc?id=${fileId}`;
}

// Test cases
const testCases = [
    "https://drive.google.com/uc?id=1BI3P_--YCN0OQvrpeEWVK1l0dbIPFLOt",
    "https://drive.google.com/file/d/1BI3P_--YCN0OQvrpeEWVK1l0dbIPFLOt/view?usp=sharing",
    "https://drive.google.com/uc?export=view&id=1BI3P_--YCN0OQvrpeEWVK1l0dbIPFLOt",
    "https://drive.google.com/open?id=1BI3P_--YCN0OQvrpeEWVK1l0dbIPFLOt"
];

const expectedId = "1BI3P_--YCN0OQvrpeEWVK1l0dbIPFLOt";
const expectedUrl = "https://drive.google.com/uc?id=1BI3P_--YCN0OQvrpeEWVK1l0dbIPFLOt";

testCases.forEach((testUrl, index) => {
    console.log(`\nTest ${index + 1}:`);
    console.log("Input:", testUrl);
    const extractedId = extractGoogleDriveFileId(testUrl);
    const convertedUrl = convertGoogleDriveLink(testUrl);
    console.log("Extracted ID:", extractedId);
    console.log("Converted URL:", convertedUrl);
    console.log("ID Match:", extractedId === expectedId ? "✅" : "❌");
    console.log("URL Match:", convertedUrl === expectedUrl ? "✅" : "❌");
});

console.log("\nExpected ID:", expectedId);
console.log("Expected URL:", expectedUrl);
