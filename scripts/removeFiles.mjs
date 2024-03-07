import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const logger = console;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function removeFile(location) {
  try {
    const shouldDelete = path.resolve(__dirname, location);
    fs.rmSync(shouldDelete, { recursive: true });
    logger.debug(`[removed] file from ${shouldDelete}`);
  } catch (e) {
    logger.error(e.message);
  }
}

async function removeFiles() {
  // root
  removeFile('../node_modules');
  removeFile('../.pnpm-store');

  // apps
  removeFile('../apps/backend/build');
  removeFile('../apps/backend/dist');
  removeFile('../apps/backend/node_modules');
  removeFile('../apps/backend/tsconfig.build.tsbuildinfo');
  removeFile('../apps/frontend/.next');
  removeFile('../apps/frontend/.next');
  removeFile('../apps/frontend/.build');
  removeFile('../apps/frontend/node_modules');
  removeFile('../apps/frontend/tsconfig.build.tsbuildinfo');

}

removeFiles().then(r => r);
