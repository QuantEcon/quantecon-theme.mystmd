import { Maximize, Minimize } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Tooltip } from '@quantecon/theme-common/components/Tooltip';

export function FullScreenButton({ size }: { size: number }) {
  const [fullScreen, setFullScreen] = useState(false);
  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setFullScreen(false);
    } else {
      document.documentElement.requestFullscreen();
      setFullScreen(true);
    }
  }, []);
  const label = fullScreen ? 'Reset Full Screen' : 'Full Screen';
  return (
    <Tooltip label={label} asChild>
      <button
        onClick={handleFullscreen}
        aria-label={label}
        className="flex items-center cursor-pointer"
      >
        {fullScreen && (
          <Minimize className="opacity-60 hover:scale-110" width={size} height={size} />
        )}
        {!fullScreen && (
          <Maximize className=" opacity-60 hover:scale-110" width={size} height={size} />
        )}
      </button>
    </Tooltip>
  );
}
