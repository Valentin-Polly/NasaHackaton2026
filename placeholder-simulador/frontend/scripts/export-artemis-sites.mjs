import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const frontendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = resolve(frontendDirectory, '..', 'backend', 'lunar_navigator_frontend_data.json')
const outputPath = resolve(frontendDirectory, 'src', 'artemis-sites.json')
const dataset = JSON.parse(await readFile(sourcePath, 'utf8'))

if (!Array.isArray(dataset.sites)) {
  throw new Error(`The lunar site dataset at ${sourcePath} has no sites array.`)
}

const artemisSites = dataset.sites.filter(
  (site) => typeof site.site_id === 'string' && site.site_id.startsWith('ART_'),
)

if (artemisSites.length === 0) {
  throw new Error(`The lunar site dataset at ${sourcePath} contains no Artemis sites.`)
}

await writeFile(outputPath, `${JSON.stringify(artemisSites, null, 2)}\n`)
console.log(`Exported ${artemisSites.length} Artemis sites to ${outputPath}`)
