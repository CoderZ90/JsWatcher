// /**chokidar version
//  *      ██╗███████╗    ██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗███████╗██████╗
//  *      ██║██╔════╝    ██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║██╔════╝██╔══██╗
//  *      ██║███████╗    ██║ █╗ ██║███████║   ██║   ██║     ███████║█████╗  ██████╔╝
//  * ██   ██║╚════██║    ██║███╗██║██╔══██║   ██║   ██║     ██╔══██║██╔══╝  ██╔══██╗
//  * ╚█████╔╝███████║    ╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║███████╗██║  ██║
//  *  ╚════╝ ╚══════╝     ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
//  *
//  */

const chokidar = require('chokidar');
const path = require('path');
const { exec } = require('child_process');
const chalk = require('chalk');
const gracefulFs = require('graceful-fs');
const fs = require('fs');
gracefulFs.gracefulify(fs);

const courseRoot = __dirname;

console.log(
  chalk.redBright(`
    ██╗███████╗    ██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗███████╗██████╗ 
    ██║██╔════╝    ██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║██╔════╝██╔══██╗
    ██║███████╗    ██║ █╗ ██║███████║   ██║   ██║     ███████║█████╗  ██████╔╝
██   ██║╚════██║    ██║███╗██║██╔══██║   ██║   ██║     ██╔══██║██╔══╝  ██╔══██╗
╚█████╔╝███████║    ╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║███████╗██║  ██║
 ╚════╝ ╚══════╝     ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
`)
);

const debounceMap = new Map();

function debounceRun(fullPath, delay = 200) {
  if (debounceMap.has(fullPath)) {
    clearTimeout(debounceMap.get(fullPath));
  }
  const timeout = setTimeout(() => {
    runFile(fullPath);
    debounceMap.delete(fullPath);
  }, delay);
  debounceMap.set(fullPath, timeout);
}

function runFile(fullPath) {
  const resolvedPath = path.resolve(fullPath);
  console.clear();  // Optional: comment out if slow
  console.log(`▶ ${chalk.redBright("DIRECTORY")}: ${resolvedPath}\n`);
  console.log(`📦 Detected change in: ${chalk.magentaBright(path.basename(fullPath))}`);

  exec(`node "${resolvedPath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(`❌ Error: ${err.message}`);
    }
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.error(stderr);
    }
  });
}

const ignoredDirs = ['node_modules', '.git', 'dist', 'logs', 'coverage', 'build'];
const ignoredRegex = new RegExp(`(^|[\\/\\\\])(${ignoredDirs.join('|')})([\\/\\\\]|$)`);

const watcher = chokidar.watch(courseRoot, {
  ignored: ignoredRegex,
  persistent: true,
  ignoreInitial: true,
  usePolling: false,
  awaitWriteFinish: {
    stabilityThreshold: 100,
    pollInterval: 50,
  },
  depth: 5,
  atomic: true,
});

watcher.on('change', (filePath) => {
  debounceRun(filePath);
});

console.log(chalk.green.bold("🚀 Watching for changes in `.js` files..."));
