/** One-shot polish pass for the film sources (run inside the isolated film copy). */
import { readFileSync, writeFileSync } from 'node:fs';

const edits = [];
const edit = (path, fn) => {
  const before = readFileSync(path, 'utf8');
  const after = fn(before);
  writeFileSync(path, after);
  edits.push({ path, changed: before !== after, bytes: after.length });
};

/* ---------------------------------------------------------------- Problem -- */
edit('src/video/scenes/Problem.tsx', (source) => {
  const header = `          <div style={{ marginTop: 4, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Kicker start={2}>{script.kicker}</Kicker>
            </div>

            <div style={{ marginTop: 18, marginInline: 'auto', maxWidth: 1320 }}>
              <Kinetic
                text="رستوران‌ها با داده می‌جنگند،"
                start={8}
                stagger={3}
                size={82}
                weight={760}
                align="center"
                lineHeight={1.16}
              />
              <div style={{ marginTop: 4 }}>
                <Kinetic
                  text="نه با غذا."
                  start={26}
                  stagger={4}
                  size={82}
                  weight={760}
                  color="rgba(247,242,232,0.34)"
                  align="center"
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 18,
                opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              <span style={{ width: 54, height: 1, background: rgba(T.cream, 0.22) }} />
              <span
                lang="fa"
                style={{ fontSize: 26, color: rgba(T.cream, 0.46), letterSpacing: '-0.01em' }}
              >
                <GlitchLine>سه جای درز، هر شب.</GlitchLine>
              </span>
              <span style={{ width: 54, height: 1, background: rgba(T.cream, 0.22) }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 22, marginTop: 44 }}>`;

  const pattern =
    /<div style=\{\{ marginTop: 46 \}\}>[\s\S]*?<div style=\{\{ display: 'flex', gap: 22, marginTop: 54 \}\}>/;

  if (!source.includes("textAlign: 'center'")) {
    if (!pattern.test(source)) throw new Error('problem header block not found');
    source = source.replace(pattern, header);
  }

  return source
    .replace('padding="26px 28px 30px"', 'padding="26px 28px 26px"')
    .replace('style={{ minHeight: 300 }}', 'style={{ minHeight: 322 }}')
    .replace(
      '<div style={{ height: 128, marginTop: 20, marginBottom: 6 }}>',
      '<div style={{ height: 144, marginTop: 18, marginBottom: 4 }}>',
    );
});

/* ---------------------------------------------------------------- Kitchen -- */
edit('src/video/scenes/Kitchen.tsx', (source) =>
  source
    .replace(
      `                      <span
                        style={{
                          fontSize: 44,`,
      `                      <span
                        dir="ltr"
                        style={{
                          fontSize: 44,`,
    )
    .replace(
      `                      position: 'relative',
                      borderRadius: 6,
                      padding: '26px 26px 30px',`,
      `                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: 452,
                      borderRadius: 6,
                      padding: '26px 26px 30px',`,
    )
    .replace(
      `                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        marginTop: 26,
                      }}`,
      `                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        marginTop: 'auto',
                        paddingTop: 26,
                      }}`,
    ),
);

/* -------------------------------------------------------------- Marketing -- */
edit('src/video/scenes/Marketing.tsx', (source) =>
  source.replace(
    'faPercent(Math.round(snapshot.repeatCustomerRate * 1000) / 10)',
    'faPercent(Math.round(snapshot.repeatCustomerRate * 10) / 10)',
  ),
);

/* ------------------------------------------------------------------ Outro -- */
edit('src/video/scenes/Outro.tsx', (source) =>
  source
    .replace(
      'border: `1px solid ${rgba(T.gold, 0.22)}`',
      'border: `1px solid ${rgba(T.gold, 0.38)}`',
    )
    .replace('background: rgba(T.gold, 0.05),', 'background: rgba(T.gold, 0.09),')
    .replace('color: rgba(T.cream, 0.6),', 'color: rgba(T.cream, 0.82),'),
);

console.log(edits);
