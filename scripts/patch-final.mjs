import fs from 'node:fs';

const edits = [
  // Rail: right-origin fill for Persian value bars (channel share, stock levels)
  {
    file: 'src/video/components/kit.tsx',
    from: `  track = 'rgba(255,255,255,0.07)',
  glow = true,
}: {
  progress: number;
  height?: number;
  color?: string;
  track?: string;
  glow?: boolean;
}) {`,
    to: `  track = 'rgba(255,255,255,0.07)',
  glow = true,
  rtl = false,
}: {
  progress: number;
  height?: number;
  color?: string;
  track?: string;
  glow?: boolean;
  /** Fill from the right edge — correct for Persian value bars. */
  rtl?: boolean;
}) {`,
  },
  {
    file: 'src/video/components/kit.tsx',
    from: `          height: '100%',
          width: \`\${Math.max(0, Math.min(1, progress)) * 100}%\`,
          borderRadius: 99,
          background: \`linear-gradient(90deg, \${rgba(color, 0.55)}, \${color})\`,`,
    to: `          height: '100%',
          width: \`\${Math.max(0, Math.min(1, progress)) * 100}%\`,
          marginLeft: rtl ? 'auto' : undefined,
          borderRadius: 99,
          background: \`linear-gradient(\${rtl ? '270deg' : '90deg'}, \${rgba(color, 0.55)}, \${color})\`,`,
  },

  // Marketing: ROI mini rail + channel rails read right-to-left
  { file: 'src/video/scenes/Marketing.tsx', from: `<Rail progress={ringFill} height={4} />`, to: `<Rail progress={ringFill} height={4} rtl />` },
  {
    file: 'src/video/scenes/Marketing.tsx',
    from: `<Rail progress={width} height={8} color={highlight ? T.goldHi : T.gold} />`,
    to: `<Rail progress={width} height={8} color={highlight ? T.goldHi : T.gold} rtl />`,
  },
  // Marketing: tighten the ratio glyph to the number
  {
    file: 'src/video/scenes/Marketing.tsx',
    from: `<div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>`,
    to: `<div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginTop: 6 }}>`,
  },
  {
    file: 'src/video/scenes/Marketing.tsx',
    from: `                    fontSize: 62,
                    color: rgba(T.goldHi, 0.6),`,
    to: `                    fontSize: 58,
                    color: rgba(T.goldHi, 0.72),`,
  },

  // Inventory: stock-level and demand rails right-to-left
  {
    file: 'src/video/scenes/Inventory.tsx',
    from: `progress={Math.min(1, level / 100)}`,
    to: `progress={Math.min(1, level / 100)}
                        rtl`,
  },
  {
    file: 'src/video/scenes/Inventory.tsx',
    from: `progress={interpolate(frame, [262, 300], [0, 1], {`,
    to: `progress={interpolate(frame, [262, 300], [0, 1], {`,
  },

  // Problem: risk bars are values, not progress
  { file: 'src/video/scenes/Problem.tsx', from: `progress={0.28 + index * 0.12}`, to: `progress={0.28 + index * 0.12}
                        rtl` },

  // Outro caption: parentheses break visually under RTL
  {
    file: 'src/video/script.ts',
    from: `'متن‌باز (MIT) · ساخته‌شده با Remotion · شبیه‌سازی قطعی'`,
    to: `'متن‌باز · MIT · ساخته‌شده با Remotion · شبیه‌سازی قطعی'`,
  },
];

let applied = 0;
let missed = 0;
for (const { file, from, to } of edits) {
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes(from)) {
    console.log(`MISS ${file} :: ${from.slice(0, 60).replace(/\n/g, '\\n')}`);
    missed += 1;
    continue;
  }
  fs.writeFileSync(file, src.replace(from, to));
  console.log(`ok   ${file}`);
  applied += 1;
}
console.log(`\napplied=${applied} missed=${missed}`);
