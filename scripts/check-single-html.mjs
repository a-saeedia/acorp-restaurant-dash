import { readFile } from 'node:fs/promises';
const h = await readFile('acorp-dashboard.html', 'utf8');
const count = (re) => (h.match(re) || []).length;
console.log('bytes       ', Buffer.byteLength(h));
console.log('script tags ', count(/<script/gi));
console.log('style tags  ', count(/<style/gi));
console.log('inline fonts', count(/data:font\/woff2/g));
console.log('ext refs    ', count(/(?:src|href)="(?:https?:)?\/\//g));
console.log('asset refs  ', count(/(?:src|href)="\/assets\//g));
