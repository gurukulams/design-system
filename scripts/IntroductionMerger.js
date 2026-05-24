import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.argv[2];
if (!rootDir) {
  console.error('Error: Please provide the project root directory path.');
  process.exit(1);
}

const EN_ROOT = path.join(rootDir, 'content.en/docs');
const TA_ROOT = path.join(rootDir, 'content.ta/docs');

/**
 * Splits a markdown file into front matter and content body blocks.
 * @param {string} fileContent 
 * @returns {{ frontMatter: string, body: string }}
 */
function parseMarkdown(fileContent) {
  const normalized = fileContent.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (match) {
    return {
      frontMatter: `---\n${match[1]}\n---\n`,
      body: match[2].trim()
    };
  }
  
  // Fallback if there is no valid front matter block detected
  return {
    frontMatter: '',
    body: normalized.trim()
  };
}

/**
 * Recursively walks directories, merging introduction.md content into 
 * _index.md without overriding the _index.md front matter.
 * @param {string} currentDir 
 */
async function mergeInstructions(currentDir) {
  try {
    await fs.access(currentDir);
  } catch {
    console.warn(`Directory not found, skipping: ${currentDir}`);
    return;
  }

  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      await mergeInstructions(fullPath);
    } else if (entry.isFile() && entry.name.toLowerCase() === 'introduction.md') {
      const indexFilePath = path.join(currentDir, '_index.md');

      try {
        console.log(`Processing: ${fullPath}`);
        
        // 1. Read and parse the target introduction.md file
        const introRaw = await fs.readFile(fullPath, 'utf8');
        const introParsed = parseMarkdown(introRaw);

        let finalFrontMatter = introParsed.frontMatter;
        let originalIndexBody = '';

        // 2. Check if _index.md exists to preserve its front matter
        try {
          await fs.access(indexFilePath);
          const indexRaw = await fs.readFile(indexFilePath, 'utf8');
          const indexParsed = parseMarkdown(indexRaw);
          
          if (indexParsed.frontMatter) {
            // Keep the exact front matter belonging to _index.md
            finalFrontMatter = indexParsed.frontMatter;
            originalIndexBody = indexParsed.body;
          }
        } catch {
          // _index.md doesn't exist yet, so we will use introduction.md's front matter entirely
          console.log(`  -> _index.md did not exist. Creating a new one.`);
        }

        // 3. Combine preserved front matter with introduction.md's content body
        // (Includes a spacer newline to cleanly separate text blocks)
        const combinedContent = `${finalFrontMatter}\n${introParsed.body}\n`;

        // 4. Write to _index.md and remove old file
        await fs.writeFile(indexFilePath, combinedContent, 'utf8');
        console.log(`  -> Successfully updated content at: ${indexFilePath}`);

        await fs.unlink(fullPath);
        console.log(`  -> Deleted original file: ${fullPath}`);
      } catch (err) {
        console.error(`Error processing file at ${fullPath}:`, err.message);
      }
    }
  }
}

async function main() {
  console.log('Starting Instruction Merger process (Front Matter Protected)...');
  
  console.log('\n--- Scanning English Content ---');
  await mergeInstructions(EN_ROOT);

  console.log('\n--- Scanning Tamil Content ---');
  await mergeInstructions(TA_ROOT);

  console.log('\nProcess finished successfully.');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});