// /**
//  *      ██╗███████╗    ██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗███████╗██████╗
//  *      ██║██╔════╝    ██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║██╔════╝██╔══██╗
//  *      ██║███████╗    ██║ █╗ ██║███████║   ██║   ██║     ███████║█████╗  ██████╔╝
//  * ██   ██║╚════██║    ██║███╗██║██╔══██║   ██║   ██║     ██╔══██║██╔══╝  ██╔══██╗
//  * ╚█████╔╝███████║    ╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║███████╗██║  ██║
//  *  ╚════╝ ╚══════╝     ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
//  *
//  */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const chalk = require("chalk");

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

const courseRoot = __dirname;

// Track watched files to prevent duplicate watchers
const watchedFiles = new Set();
// Debounce map to avoid running multiple times for one save
const debounceMap = new Map();
const debounceRunFile = (fullPath, delay = 100) => {
  clearTimeout(debounceMap.get(fullPath));

  const timeout = setTimeout(() => {
    runFile(fullPath);
    debounceMap.delete(fullPath);
  }, delay);

  debounceMap.set(fullPath, timeout);
};

const runFile = (fullPath) => {
  const resolvedPath = path.resolve(fullPath);

  console.clear();
  // console.log(`\n▶ Running: ${resolvedPath}\n`);

  console.log(`▶ ${chalk.redBright("DIRECTORY")}: ${resolvedPath}\n`);
  console.log(
    `📦 Detected change in: ${chalk.magentaBright(path.basename(fullPath))}`
  );

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
};

const watchFile = (fullPath) => {
  if (watchedFiles.has(fullPath)) return;
  watchedFiles.add(fullPath);

  fs.watch(fullPath, (eventType) => {
    if (eventType === "change") {
      debounceRunFile(fullPath);
    }
  });
};

const ignoredDirs = ["node_modules", ".git", "dist", "logs"];
const shouldIgnore = (dir) => {
  return ignoredDirs.some((ignored) => dir.includes(ignored));
};

const watchDirectory = (dir) => {
  if (shouldIgnore(dir)) return;

  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      watchDirectory(fullPath);
    } else if (file.endsWith(".js") || file.endsWith(".mjs")) {
      watchFile(fullPath);
    }
  });
};

watchDirectory(courseRoot);
console.log(chalk.green.bold("🚀 Watching for changes in `.js` files..."));
