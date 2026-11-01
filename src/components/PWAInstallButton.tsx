import React, { useState } from 'react';
import { DownloadCloud, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, don't show
  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="text-xs font-medium px-3 py-1.5 rounded-xl bg-[#272727] hover:bg-[#333333] border border-[#383838] text-purple-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        title="Install app to your home screen or desktop"
      >
        <DownloadCloud className="w-3.5 h-3.5 text-purple-400" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="text-xs font-medium px-3 py-1.5 rounded-xl bg-[#272727] hover:bg-[#333333] border border-[#383838] text-purple-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Install on iOS Home Screen"
        >
          <Smartphone className="w-3.5 h-3.5 text-purple-400" />
          <span>Install PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="relative w-full max-w-sm rounded-3xl bg-[#272727] border border-[#383838] p-5 text-white">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#141414] border border-[#383838] flex items-center justify-center text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-sm font-semibold text-white">Install on iPhone / iPad</h3>
              <div className="mt-3 space-y-2 text-xs text-zinc-300 leading-relaxed bg-[#141414] p-3 rounded-2xl border border-[#383838]">
                <p>1. Tap the <strong>Share</strong> button in Safari toolbar.</p>
                <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                <p>3. Launch directly from your home screen for full offline use.</p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-2 bg-[#7c3aed] text-white text-xs font-semibold rounded-xl"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
