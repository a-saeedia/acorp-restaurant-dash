import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/video/scenes/OrderFlow.tsx';
let source = readFileSync(path, 'utf8');

const stages = `const STEP_GAP = 24;

const STAGES = [
  { label: 'ثبت', glyph: '۱' },
  { label: 'تأیید', glyph: '۲' },
  { label: 'آشپزخانه', glyph: '۳' },
  { label: 'آماده', glyph: '۴' },
  { label: 'تحویل', glyph: '۵' },
];`;

if (!source.includes('const STAGES')) {
  source = source.replace('const STEP_GAP = 24;', stages);
}

const oldLabel = `                      <span
                        lang="fa"
                        style={{
                          fontSize: 19,
                          color: isLast ? T.cream : rgba(T.cream, 0.62),
                          flex: 1,
                        }}
                      >
                        {event.titleFa}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: rgba(T.cream, 0.28),
                          fontVariantNumeric: 'tabular-nums',
                          direction: 'ltr',
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>`;

const newLabel = `                      <span
                        lang="fa"
                        style={{
                          fontSize: 19,
                          color: isLast ? T.cream : rgba(T.cream, 0.62),
                        }}
                      >
                        {event.titleFa}
                      </span>
                      <span style={{ flex: 1 }} />
                      <span
                        lang="fa"
                        style={{
                          fontSize: 12.5,
                          padding: '3px 11px',
                          borderRadius: 999,
                          color: isLast ? T.goldHi : rgba(T.cream, 0.3),
                          border: \`1px solid \${isLast ? rgba(T.gold, 0.4) : 'rgba(255,255,255,0.06)'}\`,
                          background: isLast ? rgba(T.gold, 0.1) : 'transparent',
                        }}
                      >
                        {isLast ? 'در جریان' : 'ثبت شد'}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: rgba(T.cream, 0.28),
                          fontVariantNumeric: 'tabular-nums',
                          direction: 'ltr',
                          width: 22,
                          textAlign: 'center',
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>`;

if (!source.includes('در جریان')) {
  if (!source.includes(oldLabel)) throw new Error('label block not found');
  source = source.replace(oldLabel, newLabel);
}

const pipeline = `          <div
            style={{
              marginTop: 30,
              display: 'flex',
              alignItems: 'flex-start',
              opacity: interpolate(frame, [96, 124], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            {STAGES.map((stage, index) => {
              const reached = stageIndex >= index;
              const active = stageIndex === index;
              return (
                <div
                  key={stage.label}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    flex: index === STAGES.length - 1 ? '0 0 auto' : 1,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 9,
                      minWidth: 104,
                    }}
                  >
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 13,
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 15,
                        fontWeight: 750,
                        border: \`1px solid \${active ? T.gold : reached ? rgba(T.gold, 0.45) : 'rgba(255,255,255,0.09)'}\`,
                        background: active
                          ? \`linear-gradient(160deg, \${T.goldHi}, \${T.gold})\`
                          : reached
                            ? rgba(T.gold, 0.12)
                            : 'rgba(255,255,255,0.02)',
                        color: active ? T.void : reached ? T.goldHi : rgba(T.cream, 0.24),
                        boxShadow: active ? \`0 0 38px -8px \${rgba(T.gold, 0.9)}\` : undefined,
                      }}
                    >
                      {stage.glyph}
                    </span>
                    <span
                      lang="fa"
                      style={{
                        fontSize: 15,
                        color: active
                          ? T.cream
                          : reached
                            ? rgba(T.cream, 0.6)
                            : rgba(T.cream, 0.22),
                      }}
                    >
                      {stage.label}
                    </span>
                  </div>

                  {index < STAGES.length - 1 ? (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        marginTop: 19,
                        marginInline: 8,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,0.07)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: \`\${Math.max(0, Math.min(1, stageProgress - index)) * 100}%\`,
                          background: \`linear-gradient(90deg, \${T.gold}, \${T.goldHi})\`,
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
`;

const anchor = `        </Frame>

        <AbsoluteFill style={{ pointerEvents: 'none' }}>`;

if (!source.includes('stageProgress - index')) {
  if (!source.includes(anchor)) throw new Error('pipeline anchor not found');
  source = source.replace(
    anchor,
    `${pipeline}        </Frame>\n\n        <AbsoluteFill style={{ pointerEvents: 'none' }}>`,
  );
}

if (!source.includes('const stageIndex')) {
  source = source.replace(
    `  const done = interpolate(frame, [318, 350], [0, 1], {`,
    `  const stageProgress = Math.min(
    4,
    Math.floor((visible / Math.max(1, events.length)) * 4.999),
  );
  const stageIndex = stageProgress;
  const done = interpolate(frame, [318, 350], [0, 1], {`,
  );
}

writeFileSync(path, source);
console.log('patched:', {
  stages: source.includes('const STAGES'),
  rows: source.includes('در جریان'),
  pipeline: source.includes('stageProgress - index'),
  index: source.includes('const stageIndex'),
});
