import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.argv[2];
if (!rootDir) process.exit(1);

const EN_ROOT = path.join(rootDir, 'content.en/docs');
const TA_ROOT = path.join(rootDir, 'content.ta/docs');

/**
 * Extracts the number (9.2) and the text separately
 */
const parseHeader = (line) => {
    const match = line.replace(/^##\s+/, '').match(/^([0-9.]+)(.*)/);
    if (match) {
        return {
            number: match[1].trim(),
            text: match[2].trim()
        };
    }
    return null;
};

const toTitleCase = (str) => str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const slugify = (text) => {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
};

const getSectionsMap = (content) => {
    const sections = content.split(/\n(?=## )/);
    const map = new Map();
    sections.forEach((section, index) => {
        const lines = section.trim().split('\n');
        const headerInfo = parseHeader(lines[0]);
        if (headerInfo) {
            map.set(headerInfo.number, {
                title: headerInfo.text,
                body: lines.slice(1).join('\n').trim(),
                order: index
            });
        }
    });
    return { firstSection: sections[0], sectionMap: map };
};

const processFiles = (enPath) => {
    const relPath = path.relative(EN_ROOT, path.dirname(enPath));
    const taPath = path.join(TA_ROOT, relPath, '_index.md');

    if (!fs.existsSync(taPath)) {
        console.warn(`Tamil version not found for ${enPath}, skipping sync split.`);
        return;
    }

    const enData = getSectionsMap(fs.readFileSync(enPath, 'utf8'));
    const taData = getSectionsMap(fs.readFileSync(taPath, 'utf8'));

    // 1. Update _index.md files with the intro text
    fs.writeFileSync(enPath, enData.firstSection.trim() + '\n');
    fs.writeFileSync(taPath, taData.firstSection.trim() + '\n');

    // 2. Iterate through English sections and find Tamil matches
    let weight = 1;
    enData.sectionMap.forEach((enInfo, num) => {
        const fileName = `${slugify(enInfo.title)}.md`;
        const taInfo = taData.sectionMap.get(num);

        const enFrontMatter = `---\ntitle: "${toTitleCase(enInfo.title)}"\nweight: ${weight}\n---\n\n`;
        
        // Write English file
        fs.writeFileSync(path.join(EN_ROOT, relPath, fileName), enFrontMatter + enInfo.body);

        // Write Tamil file (using the same filename but Tamil title and body)
        if (taInfo) {
            const taFrontMatter = `---\ntitle: "${taInfo.title}"\nweight: ${weight}\n---\n\n`;
            fs.writeFileSync(path.join(TA_ROOT, relPath, fileName), taFrontMatter + taInfo.body);
        } else {
            // Fallback if numbers don't match: Create empty Tamil file
            const taFrontMatter = `---\ntitle: "Pending Translation: ${num}"\nweight: ${weight}\n---\n\n`;
            fs.writeFileSync(path.join(TA_ROOT, relPath, fileName), taFrontMatter);
        }
        weight++;
    });
};

// Start Recursion
const getFiles = (dir, list = []) => {
    fs.readdirSync(dir).forEach(f => {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) getFiles(p, list);
        else if (f === '_index.md') list.push(p);
    });
    return list;
};

getFiles(EN_ROOT).forEach(processFiles);