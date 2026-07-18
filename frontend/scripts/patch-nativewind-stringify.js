const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../node_modules/react-native-css-interop/dist/runtime/native/render-component.js');

const original = fs.readFileSync(filePath, 'utf-8');
const patched = original.replace(
  `function stringify(object) {`,
  `function stringify(object) {`
);

const oldCode = `        for (const entry of Object.entries(value)) {
            newValue[entry[0]] = replace(entry[0], entry[1]);
        }`;
const newCode = `        try {
            for (const entry of Object.entries(value)) {
                try {
                    newValue[entry[0]] = replace(entry[0], entry[1]);
                } catch {}
            }
        } catch {}`;

if (original.includes(newCode)) {
  console.log('[patch-nativewind-stringify] Already patched');
  process.exit(0);
}

if (!original.includes(oldCode)) {
  console.error('[patch-nativewind-stringify] Failed: old code pattern not found');
  process.exit(1);
}

const result = original.replace(oldCode, newCode);
fs.writeFileSync(filePath, result, 'utf-8');
console.log('[patch-nativewind-stringify] Patched successfully');
