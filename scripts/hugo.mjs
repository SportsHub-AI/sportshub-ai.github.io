import { chmodSync, copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const binDir = join(root, '.hugo', 'bin');
const hugoBin = join(binDir, process.platform === 'win32' ? 'hugo.exe' : 'hugo');
const hugoVersion = process.env.HUGO_VERSION || '0.161.1';

async function download(url, dest) {
  const response = await fetch(url, { headers: { 'User-Agent': 'sportshub-web-build' } });
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  writeFileSync(dest, Buffer.from(await response.arrayBuffer()));
}

function findFile(dir, name) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isFile() && entry.name === name) return path;
    if (entry.isDirectory()) {
      const found = findFile(path, name);
      if (found) return found;
    }
  }
  return null;
}

async function ensureHugo() {
  if (existsSync(hugoBin)) return;

  mkdirSync(binDir, { recursive: true });
  const cacheDir = join(root, '.hugo', 'cache');
  rmSync(cacheDir, { recursive: true, force: true });
  mkdirSync(cacheDir, { recursive: true });

  const release = await (await fetch(`https://api.github.com/repos/gohugoio/hugo/releases/tags/v${hugoVersion}`, {
    headers: { 'User-Agent': 'sportshub-web-build' },
  })).json();

  const version = release.tag_name.replace(/^v/, '');
  const arch = process.arch === 'arm64' ? 'arm64' : 'amd64';
  let asset;

  if (process.platform === 'darwin') {
    asset = release.assets.find((item) => item.name === `hugo_${version}_darwin-universal.pkg`);
  } else if (process.platform === 'linux') {
    asset = release.assets.find((item) => item.name === `hugo_${version}_linux-${arch}.tar.gz`);
  }

  if (!asset) {
    throw new Error(`No Hugo binary asset found for ${process.platform}/${process.arch}`);
  }

  const archive = join(cacheDir, asset.name);
  await download(asset.browser_download_url, archive);

  if (archive.endsWith('.pkg')) {
    const expanded = join(cacheDir, 'expanded');
    execFileSync('pkgutil', ['--expand-full', archive, expanded], { stdio: 'inherit' });
    const extracted = findFile(expanded, 'hugo');
    if (!extracted) throw new Error('Downloaded Hugo package did not contain a hugo binary');
    copyFileSync(extracted, hugoBin);
  } else {
    execFileSync('tar', ['-xzf', archive, '-C', cacheDir], { stdio: 'inherit' });
    const extracted = findFile(cacheDir, 'hugo');
    if (!extracted) throw new Error('Downloaded Hugo archive did not contain a hugo binary');
    copyFileSync(extracted, hugoBin);
  }

  chmodSync(hugoBin, 0o755);
}

await ensureHugo();

const result = spawnSync(hugoBin, process.argv.slice(2), {
  cwd: root,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
