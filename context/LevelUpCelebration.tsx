import { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

type ParticleProps = {
  delay: number;
  x: number;
  y: number;
  angle: number;
  color: string;
};

const Particle = ({ delay, x, y, angle, color }: ParticleProps) => {
  const translateX = useSharedValue(x);
  const translateY = useSharedValue(y);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const distance = 140 + Math.random() * 80; // more spread for fantasy feel
    const dx = distance * Math.cos(angle);
    const dy = distance * Math.sin(angle);

    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.3, { damping: 10 }),
        withSpring(0.9, { damping: 12 })
      )
    );

    translateX.value = withDelay(
      delay,
      withSpring(x + dx, { damping: 14, stiffness: 80 })
    );

    translateY.value = withDelay(
      delay,
      withSpring(y + dy, { damping: 14, stiffness: 80 })
    );

    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 1200 })
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: color,
    shadowColor: color,
    shadowOpacity: 0.7,
    shadowRadius: 10,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return <Animated.View style={style} />;
};

type Props = {
  onComplete?: () => void;
};

export const LevelUpCelebration = ({ onComplete }: Props) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const particles = [];
  const particleCount = 40;
  const centerY = height * 0.4;

  const colors = [
    '#7D3C98', // mystical purple
    '#00FFFF', // ethereal cyan
    '#E1BEE7', // soft violet glow
    '#9C27B0', // arcane purple
    '#64FFDA', // greenish aura
  ];

  // Left burst
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.PI / 2 + (Math.PI / 3) * Math.random();
    particles.push(
      <Particle
        key={`left-${i}`}
        delay={i * 25}
        x={width * 0.25}
        y={centerY}
        angle={angle}
        color={colors[Math.floor(Math.random() * colors.length)]}
      />
    );
  }

  // Right burst
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.PI + Math.PI / 6 + (Math.PI / 3) * Math.random();
    particles.push(
      <Particle
        key={`right-${i}`}
        delay={i * 25}
        x={width * 0.75}
        y={centerY}
        angle={angle}
        color={colors[Math.floor(Math.random() * colors.length)]}
      />
    );
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {particles}
    </View>
  );
};
