import fs from 'fs';
import path from 'path';

const filePath = 'd:/Dropbox/80_Vault/00_2nd-brain/IMG_6548.txt';

try {
    const text = fs.readFileSync(filePath, 'utf-8');
    const lines = text.split(/\r?\n/);

    const NOISE_PATTERNS = [
        { reason: 'Plugin Error', regex: /^If the transition isn.*t working/i },
        { reason: 'Plugin Error', regex: /^visit:misterhorse/i },
        // Simplified regex for the test to match TS logic
        { reason: 'Metadata', regex: /^\d{2}:\d{2}:\d{2}:\d{2}$/ },
        { reason: 'Empty', regex: /^\s*$/ },
    ];

    let noiseCount = 0;
    let misterHorseCount = 0;
    let validCount = 0;

    console.log(`Processing file: ${filePath}`);
    console.log(`Total lines: ${lines.length}`);

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        // Timestamp range check (same as TS)
        const timestampMatch = trimmed.match(/^(\d{2}:\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}:\d{2}:\d{2}:\d{2})/);
        if (timestampMatch) {
            // It's a timestamp line
            return;
        }

        let isNoise = false;
        for (const pattern of NOISE_PATTERNS) {
            if (pattern.regex.test(trimmed)) {
                isNoise = true;
                if (trimmed.includes('misterhorse') || trimmed.includes('transition')) {
                    misterHorseCount++;
                }
                break;
            }
        }

        if (trimmed.length > 0) {
            if (isNoise) {
                noiseCount++;
            } else {
                validCount++;
                // Print first 5 valid lines to check quality
                if (validCount <= 5) {
                    console.log(`[VALID] ${trimmed}`);
                }
            }
        }
    });

    console.log('--- Results ---');
    console.log(`Noise lines removed: ${noiseCount}`);
    console.log(`"MisterHorse" errors caught: ${misterHorseCount}`);
    console.log(`Valid content lines: ${validCount}`);

    if (misterHorseCount > 0) {
        console.log('SUCCESS: MisterHorse noise detected and filtered.');
    } else {
        console.log('WARNING: No MisterHorse noise detected. Check Regex.');
    }

} catch (err) {
    console.error('Error reading file:', err);
}
