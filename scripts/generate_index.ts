
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src/data/experiments_index.json');
const QWEN_DIR = path.join(PUBLIC_DIR, 'output_qwen');
const CHATGPT_DIR = path.join(PUBLIC_DIR, 'output_chatgpt');

interface ExperimentIndexItem {
    id: string;
    source: 'qwen' | 'chatgpt';
    title: string;
    path: string;
    fullPath: string;
}

function scanDirectory(baseDir: string, source: 'qwen' | 'chatgpt'): ExperimentIndexItem[] {
    const items: ExperimentIndexItem[] = [];

    if (!fs.existsSync(baseDir)) {
        console.warn(`Warning: Directory not found: ${baseDir}`);
        return [];
    }

    const entries = fs.readdirSync(baseDir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const expPath = path.join(baseDir, entry.name);
            let reportPath = path.join(expPath, 'mas_report.json');

            if (fs.existsSync(reportPath) || true) { // Allow trying nested logic check below even if initial is false
                // Parse ID and Title from directory name
                // Format: output_TIMESTAMP_ID_CASE...
                const dirName = entry.name;
                let title = dirName;

                // Try to extract case info for title
                const parts = dirName.split('_');
                if (parts.length >= 5) {
                    // Example: output_20251208_..._0000_45-55
                    const caseId = parts[parts.length - 2];
                    const range = parts[parts.length - 1];
                    title = `${caseId} (${range})`;

                    // Add musical key info if possible (manually mapped or extracted later)
                    // For now use the directory name parts
                }

                // Important: generated path should be relative to web root (public)
                // Use absolute paths from root for consistent resolving
                let relativePath = `/${source === 'qwen' ? 'output_qwen' : 'output_chatgpt'}/${entry.name}/mas_report.json`;

                // Check for nested timestamp dir if direct report doesn't exist
                if (!fs.existsSync(reportPath)) {
                     const subEntries = fs.readdirSync(expPath, { withFileTypes: true });
                     const timestampDir = subEntries.find(e => e.isDirectory() && e.name.startsWith('output_'));
                     if (timestampDir) {
                         reportPath = path.join(expPath, timestampDir.name, 'mas_report.json');
                         relativePath = `/${source === 'qwen' ? 'output_qwen' : 'output_chatgpt'}/${entry.name}/${timestampDir.name}/mas_report.json`;
                     }
                }

                if (fs.existsSync(reportPath)) {
                     items.push({
                        id: dirName,
                        source: source,
                        title: title,
                        path: relativePath,
                        fullPath: reportPath
                    });
                }
            }
        }
    }

    return items;
}

const qwenExperiments = scanDirectory(QWEN_DIR, 'qwen');
const chatgptExperiments = scanDirectory(CHATGPT_DIR, 'chatgpt');
const experiments = [...qwenExperiments, ...chatgptExperiments];

// Ensure output dir exists
if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(experiments, null, 2));
console.log(`Generated index with ${experiments.length} experiments at ${OUTPUT_FILE}`);
