import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

function getFilesRecursively(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

test('Verificar que ningún archivo en src/ importe datos mock o fixtures', () => {
  const srcDir = path.resolve(process.cwd(), 'src');
  const allSrcFiles = getFilesRecursively(srcDir);
  
  assert.ok(allSrcFiles.length > 0, 'Debe haber archivos en src/');

  const forbiddenPatterns = [
    { regex: /from\s+['"][^'"]*mock[^'"]*['"]/i, description: 'importación de mock' },
    { regex: /from\s+['"][^'"]*fixtures[^'"]*['"]/i, description: 'importación de fixtures' },
    { regex: /require\(['"][^'"]*mock[^'"]*['"]\)/i, description: 'require de mock' },
    { regex: /require\(['"][^'"]*fixtures[^'"]*['"]\)/i, description: 'require de fixtures' },
    { regex: /iori-demo-admin/i, description: 'referencia a cookie de demo' },
  ];

  const violations = [];

  for (const file of allSrcFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    for (const { regex, description } of forbiddenPatterns) {
      if (regex.test(content)) {
        const relative = path.relative(process.cwd(), file);
        violations.push(`${relative}: coincide con ${description}`);
      }
    }
  }

  assert.deepStrictEqual(
    violations,
    [],
    `Se encontraron importaciones o referencias prohibidas en src/:\n${violations.join('\n')}`
  );
});

test('Verificar que src/data/mock.ts no exista en el código fuente de producción', () => {
  const mockPath = path.resolve(process.cwd(), 'src/data/mock.ts');
  assert.strictEqual(
    fs.existsSync(mockPath),
    false,
    'src/data/mock.ts NO debe existir en el código de producción'
  );
});
