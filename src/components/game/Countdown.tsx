
import { useState, useEffect } from "react";

type CountdownProps = {
  onComplete: () => void;
};

const Countdown = ({ onComplete }: CountdownProps) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 800);
      return () => clearTimeout(timer);
    } else {
      const goTimer = setTimeout(onComplete, 500);
      return () => clearTimeout(goTimer);
    }
  }, [count, onComplete]);

  return (
    <div className="text-center animate-fade-in">
      <h2
        key={count}
        className="text-9xl font-bold text-primary animate-countdown-pop"
      >
        {count > 0 ? count : "GO!"}
      </h2>
    </div>
  );
};

export default Countdown;
