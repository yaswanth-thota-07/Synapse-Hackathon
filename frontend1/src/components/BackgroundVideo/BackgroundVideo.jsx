import { useEffect, useRef } from 'react';
import './BackgroundVideo.css';

export default function BackgroundVideo({ isPaused = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPaused) {
      video.pause();
      return;
    }

    const playVideo = async () => {
      try {
        await video.play();
      } catch {}
    };

    video.addEventListener('canplay', playVideo);
    window.addEventListener('load', playVideo);
    playVideo();

    return () => {
      video.removeEventListener('canplay', playVideo);
      window.removeEventListener('load', playVideo);
    };
  }, [isPaused]);

  return (
    <div className="bg-video" aria-hidden="true">
      <video
        ref={videoRef}
        className="bg-video__element"
        src="https://zxdefgavgwfxastwmmjm.supabase.co/storage/v1/object/public/assets/flux.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="bg-video__scrim" />
    </div>
  );
}