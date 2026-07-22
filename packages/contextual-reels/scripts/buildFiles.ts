import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

/** Recursively lists all files under a directory, returning paths relative to that directory. */
export function getFilesRecursively(dir: string, basePath: string = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getFilesRecursively(fullPath, basePath));
    } else {
      files.push(path.relative(basePath, fullPath));
    }
  }
  return files;
}

/**
 * Discovers all dist/ files that should be uploaded.
 * QA: includes source maps. Production: excludes source maps.
 */
export function getBuildFiles(): string[] {
  const NODE_ENV = process.env.NODE_ENV ?? 'qa';
  const isProduction = NODE_ENV === 'production';

  const allFiles = getFilesRecursively('dist').map((f) => path.join('dist', f));

  const buildFiles = allFiles.filter((file) => {
    const filename = path.basename(file);
    const ext = path.extname(file);

    // Stable loader
    if (filename === 'gen_ext.min.js') return true;
    // Hashed core bundle: gen_ext-[hash].js
    if (/^gen_ext-[A-Za-z0-9_-]+\.js$/.test(filename)) return true;
    // CSS assets: cxr-[hash].css
    if (file.includes('assets/') && ext === '.css' && /^cxr-[A-Za-z0-9_-]+\.css$/.test(filename)) return true;
    // Chunks
    if (file.includes('chunks/') && ext === '.js') return true;
    // Source maps — QA only
    if (!isProduction && ext === '.map') return true;

    return false;
  });

  console.log(chalk.blue(`\nDiscovered ${buildFiles.length} files to upload:`));
  buildFiles.forEach((f) => console.log(chalk.gray(`  • ${f}`)));

  return buildFiles;
}

/** Content type for an upload, based on file extension. */
export function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.js') return 'application/javascript';
  if (ext === '.css') return 'text/css';
  if (ext === '.map') return 'application/json';
  return 'application/octet-stream';
}

/**
 * Cache-Control for an upload. The stable loader must revalidate every load so new
 * releases are picked up; hashed files are content-addressed and cache forever.
 */
export function cacheControlFor(filePath: string): string {
  const filename = path.basename(filePath);
  if (filename === 'gen_ext.min.js') return 'no-cache';
  return 'public, max-age=31536000, immutable';
}
