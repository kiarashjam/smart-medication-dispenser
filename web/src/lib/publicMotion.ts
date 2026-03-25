/** Shared easing for public-site Motion components */
export const publicEase = [0.22, 1, 0.36, 1] as const;

export const publicTransition = {
  duration: 0.45,
  ease: publicEase,
} as const;

export const publicViewport = {
  once: true,
  margin: '-10% 0px -10% 0px' as const,
};

/** Spring for accordion / interactive panels */
export const publicSpring = { type: 'spring' as const, stiffness: 380, damping: 32 };
