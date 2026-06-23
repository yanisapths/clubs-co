/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = "./features";

function toPascalCase(filename) {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);

  return (
    basename
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join("") + ext
  );
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!entry.name.endsWith(".tsx")) continue;

    const newName = toPascalCase(entry.name);

    if (entry.name !== newName) {
      const newPath = path.join(dir, newName);

      console.log(`${entry.name} → ${newName}`);
      execSync(`git mv "${fullPath}" "${newPath}"`);
    }
  }
}

walk(ROOT_DIR);
