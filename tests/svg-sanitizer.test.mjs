import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeSvgString } from '../src/lib/security/svg-sanitizer.ts';

test('sanitizeSvgString: elimina scripts maliciosos de SVG', () => {
  const dirty = '<svg><script>alert("xss")</script><circle cx="50" cy="50" r="40"/></svg>';
  const clean = sanitizeSvgString(dirty);
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean.includes('alert'), false);
  assert.equal(clean.includes('<circle'), true);
});

test('sanitizeSvgString: elimina eventos inline (onload, onclick)', () => {
  const dirty = '<svg onload="alert(1)" onclick="steal()"><rect width="10" height="10"/></svg>';
  const clean = sanitizeSvgString(dirty);
  assert.equal(clean.includes('onload'), false);
  assert.equal(clean.includes('onclick'), false);
  assert.equal(clean.includes('<rect'), true);
});

test('sanitizeSvgString: elimina enlaces javascript: en href', () => {
  const dirty = '<svg><a href="javascript:alert(1)"><text>Click</text></a></svg>';
  const clean = sanitizeSvgString(dirty);
  assert.equal(clean.includes('javascript:'), false);
});

test('sanitizeSvgString: arroja error si no es un SVG válido', () => {
  const nonSvg = '<div>No soy un svg</div>';
  assert.throws(() => sanitizeSvgString(nonSvg), /El archivo no contiene una estructura SVG válida/);
});
