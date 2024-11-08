// SwipeableCard.jsx
import React, { useState } from 'react';
import { useSpring, animated, interpolate } from 'react-spring';
import { useGesture } from 'react-use-gesture';
import '../styles/SwipeableCard.css';

const SwipeableCard = ({ index, currentIndex, onSwipeLeft, onSwipeRight, children }) => {
  const [gone, setGone] = useState(false);

  const [{ x, y, rot, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rot: 0,
    scale: 1,
    config: { tension: 300, friction: 30 },
  }));

  const bind = useGesture(
    {
      onDrag: ({ down, movement: [mx], direction: [xDir], velocity }) => {
        const trigger = velocity > 0.2;
        const dir = xDir < 0 ? -1 : 1; // -1 = left, 1 = right

        if (!down && trigger) {
          // Swiped
          api.start({ x: dir * window.innerWidth * 1.25, rot: dir * 45, scale: 1 });
          setGone(true);
          if (dir === -1) onSwipeLeft();
          else onSwipeRight();
        } else if (!gone) {
          // Not swiped yet
          api.start({ x: down ? mx : 0, rot: down ? mx / 100 : 0, scale: down ? 1.1 : 1 });
        }
      },
    },
    { drag: { filterTaps: true, axis: 'x' } }
  );

  if (gone) return null;

  return (
    <animated.div
      {...bind()}
      className="swipeable-card"
      style={{
        x,
        y,
        rotateZ: rot,
        scale,
        zIndex: index === currentIndex ? 1 : -index,
      }}
    >
      {children}
    </animated.div>
  );
};

export default SwipeableCard;
