import fs from 'node:fs';

const file = 'src/video/scenes/Inventory.tsx';
let src = fs.readFileSync(file, 'utf8');

const edits = [
  // Ring centre: the hero figure was wider than the ring hole
  {
    from: `                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: 34,`,
    to: `                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: 14,`,
  },
  {
    from: `                    style={{ fontSize: 16, color: rgba(T.cream, 0.42), marginBottom: 6 }}`,
    to: `                    style={{ fontSize: 15, color: rgba(T.cream, 0.42), marginBottom: 10 }}`,
  },
  {
    from: `                      fontSize: 62,
                      fontWeight: 780,
                      letterSpacing: '-0.03em',`,
    to: `                      fontSize: 44,
                      fontWeight: 780,
                      letterSpacing: '-0.02em',`,
  },
  {
    from: `                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 8,
                    }}
                  >
                    {faNumber(Math.round(heroValue))}
                    <span style={{ fontSize: 18, color: rgba(T.cream, 0.45), fontWeight: 500 }}>`,
    to: `                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'center',
                      gap: 5,
                      maxWidth: 200,
                    }}
                  >
                    {faNumber(Math.round(heroValue))}
                    <span style={{ fontSize: 14, color: rgba(T.cream, 0.45), fontWeight: 500 }}>`,
  },
  {
    from: `                  <div lang="fa" style={{ fontSize: 15, color: rgba(T.cream, 0.38), marginTop: 8 }}>
                    آستانه: {faNumber(threshold)} {hero?.ingredient.unitLabelFa}
                  </div>`,
    to: `                  <div lang="fa" style={{ fontSize: 13, color: rgba(T.cream, 0.38), marginTop: 6 }}>
                    آستانه: {faNumber(threshold)} {hero?.ingredient.unitLabelFa}
                  </div>`,
  },
  {
    from: `                        marginTop: 14,
                        display: 'inline-flex',`,
    to: `                        marginTop: 10,
                        display: 'inline-flex',
                        fontSize: 13,`,
  },
];

let n = 0;
for (const e of edits) {
  if (!src.includes(e.from)) {
    console.log('MISS', e.from.slice(0, 50).replace(/\n/g, '\\n'));
    continue;
  }
  src = src.replace(e.from, e.to);
  n += 1;
}
fs.writeFileSync(file, src);
console.log('applied', n, 'of', edits.length);
