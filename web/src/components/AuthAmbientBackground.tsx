import { motion } from 'motion/react';

type Props = { reduceMotion: boolean | null };

/** Dense animated backdrop for auth routes (respects reduced motion). */
export default function AuthAmbientBackground({ reduceMotion }: Props) {
  const off = !!reduceMotion;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute inset-0"
        animate={off ? undefined : { opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(ellipse 90% 50% at 50% -20%, rgba(79,70,229,0.14), transparent 55%), radial-gradient(ellipse 70% 45% at 100% 60%, rgba(45,212,191,0.08), transparent 50%), radial-gradient(ellipse 50% 40% at 0% 80%, rgba(167,139,250,0.1), transparent 45%)',
        }}
      />

      {[0, 1, 2].map((i) => (
        <motion.div
          key={`blob-${i}`}
          className="absolute rounded-full mix-blend-screen blur-[80px] md:blur-[100px]"
          style={{
            width: `${180 + i * 90}px`,
            height: `${180 + i * 90}px`,
            left: `${15 + i * 28}%`,
            top: `${20 + i * 15}%`,
            background:
              i === 0
                ? 'linear-gradient(135deg, rgba(79,70,229,0.35), rgba(45,212,191,0.15))'
                : i === 1
                  ? 'linear-gradient(225deg, rgba(45,212,191,0.25), rgba(139,92,246,0.2))'
                  : 'linear-gradient(180deg, rgba(244,114,182,0.12), rgba(79,70,229,0.2))',
          }}
          animate={
            off
              ? undefined
              : {
                  x: [0, 40, -25, 0],
                  y: [0, -30, 20, 0],
                  scale: [1, 1.12, 0.95, 1],
                }
          }
          transition={{
            duration: 14 + i * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 1.2,
          }}
        />
      ))}

      {!off &&
        [...Array(18)].map((_, i) => (
          <motion.span
            key={`dot-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23 + 7) % 100}%`,
              opacity: 0.15 + (i % 5) * 0.08,
            }}
            animate={{
              y: [0, -20 - (i % 4) * 8, 0],
              opacity: [0.2, 0.85, 0.2],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 3.5 + (i % 6) * 0.5,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}

      <motion.div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        animate={off ? undefined : { backgroundPosition: ['0 0', '48px 48px'] }}
        transition={off ? undefined : { duration: 24, repeat: Infinity, ease: 'linear' }}
      />

      <div className="absolute bottom-0 left-0 h-[45vh] w-full bg-gradient-to-t from-black/55 to-transparent" />

      {!off && (
        <motion.div
          className="absolute -left-1/4 top-0 h-[120%] w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
          animate={{ x: ['-20%', '140%'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
        />
      )}
    </div>
  );
}
