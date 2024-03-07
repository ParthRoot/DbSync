import * as fs from 'fs';
import * as path from 'path';
import getSize from 'get-folder-size';
import { fileURLToPath } from 'url';

const logger = console;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cachePath = path.resolve(__dirname, '../node_modules/.cache/nx');
const maxCacheMb = 1024;

/**
 * It will delete the NX cache from the file
 * @returns {Promise<void>}
 */
async function deleteNxCache() {
  logger.log(`*** Nx cache path '${cachePath}'`);
  if (fs.existsSync(cachePath)) {
    const size = await getSize(cachePath);
    if (size.errors) {
      size.errors.forEach((err) => {
        console.error(err);
      });
      return;
    }
    const MBSize = Number((size.size / 1024 / 1024).toFixed(2));
    logger.log(`*** NX cache size is ${MBSize} Megabytes`);
    if (MBSize > maxCacheMb) {
      logger.log('*** CLEARING NX CACHE ***');
      fs.rmSync(cachePath, { recursive: true });
      logger.log('*** CLEARED NX CACHE ***');
    }
  }
}

deleteNxCache().then(r => r);
