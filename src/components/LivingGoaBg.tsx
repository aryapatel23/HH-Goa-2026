import React, { useEffect, useRef, useState } from 'react';

/**
 * Full-bleed looping Goa beach video background.
 * Uses /loop_animate_this.mp4 from public/. Soft green tint keeps UI readable.
 */
export const LivingGoaBg: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduced) return;
    v.muted = true;
    v.playsInline = true;
    const play = () => { v.play().catch(() => setFailed(true)); };
    if (v.readyState >= 2) play();
    else v.addEventListener('canplay', play, { once: true });
  }, [reduced]);

  return (
    <div className="living-goa-bg" aria-hidden>
      {!failed && !reduced ? (
        <video
          ref={videoRef}
          className="living-goa-video"
          src="/loop_animate_this.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="living-goa-video-fallback" />
      )}

      {/* Layered tints so panels / text stay readable */}
      <div className="living-goa-tint living-goa-tint-base" />
      <div className="living-goa-tint living-goa-tint-vignette" />
    </div>
  );
};
