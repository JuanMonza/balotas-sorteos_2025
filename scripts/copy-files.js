const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const distPath = path.join(projectRoot, 'dist');

  if (fsSync.rm) {
    await fs.rm(distPath, { recursive: true, force: true });
  } else {
    await fs.rmdir(distPath, { recursive: true });
  }
  await fs.mkdir(distPath, { recursive: true });

  const publicPath = path.join(projectRoot, 'public');
  const targetPublicPath = path.join(distPath, 'public');
  await copyDirectory(publicPath, targetPublicPath);

  await fs.copyFile(path.join(projectRoot, 'index.html'), path.join(distPath, 'index.html'));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});