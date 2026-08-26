/**
 * Dumps the SPA's curated mock datasets to JSON so the Laravel seeders load the
 * exact same records the prototype was demoed with.
 *
 *   node scripts/dump-mock-data.mjs
 */
import { build } from 'esbuild';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'resources/js/src');
const outDir = resolve(root, 'database/seeders/data');
const bundle = resolve(root, 'node_modules/.cache/mock-data.mjs');

/** Output file name -> export name in resources/js/src/data. */
const datasets = {
    investigations: 'investigations',
    allegations: 'allegations',
    witnesses: 'witnesses',
    interviews: 'interviews',
    evidence: 'evidence',
    'timeline-events': 'timelineEvents',
    documents: 'documents',
};

const entry = `
export { investigations } from '~/data/investigations';
export { allegations } from '~/data/allegations';
export { witnesses } from '~/data/witnesses';
export { interviews } from '~/data/interviews';
export { evidence } from '~/data/evidence';
export { timelineEvents } from '~/data/timeline-events';
export { documents } from '~/data/documents';
`;

mkdirSync(dirname(bundle), { recursive: true });
mkdirSync(outDir, { recursive: true });

await build({
    stdin: { contents: entry, resolveDir: src, loader: 'ts' },
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: bundle,
    alias: { '~': src },
    logLevel: 'warning',
});

const data = await import(pathToFileURL(bundle).href);
rmSync(bundle);

for (const [file, exportName] of Object.entries(datasets)) {
    const rows = data[exportName];
    if (!Array.isArray(rows)) {
        throw new Error(`dataset "${exportName}" missing`);
    }
    writeFileSync(resolve(outDir, `${file}.json`), JSON.stringify(rows, null, 2) + '\n');
    console.log(`${file}.json — ${rows.length} rows`);
}
