
import { useState, useEffect, useRef } from 'react';

// Sound types available in the app
export type SoundType = 'meditation' | 'ambient' | 'nature' | 'chimes' | 'beep' | 'success' | 'failure' | 'notification';

// Preloaded sound URLs - using free assets from Mixkit
const soundLibrary: Record<SoundType, string> = {
  meditation: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-sound-2293.mp3',
  ambient: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-stream-ambience-1186.mp3',
  nature: 'https://assets.mixkit.co/sfx/preview/mixkit-birds-in-forest-loop-1236.mp3',
  chimes: 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3',
  beep: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3',
  success: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3',
  failure: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
  notification: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3'
};

export interface SoundOptions {
  volume?: number;
  loop?: boolean;
  onEnded?: () => void;
}

const useSounds = () => {
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});
  const [isLoaded, setIsLoaded] = useState<Record<SoundType, boolean>>({
    meditation: false,
    ambient: false,
    nature: false,
    chimes: false,
    beep: false,
    success: false,
    failure: false,
    notification: false
  });
  const [isMuted, setIsMuted] = useState(false);
  const [activeAudios, setActiveAudios] = useState<Set<HTMLAudioElement>>(new Set());

  // Preload sounds
  useEffect(() => {
    console.log('Starting to preload sounds...');
    
    const loadSound = async (type: SoundType, url: string) => {
      try {
        // Create audio element
        const audio = new Audio();
        audio.preload = 'auto';
        
        // Create a promise to track loading
        const loadPromise = new Promise<void>((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => {
            console.log(`Sound loaded successfully: ${type}`);
            setIsLoaded(prev => ({ ...prev, [type]: true }));
            resolve();
          }, { once: true });
          
          audio.addEventListener('error', (error) => {
            console.error(`Error loading sound ${type}:`, error);
            reject(error);
          }, { once: true });
        });
        
        // Set the source after attaching event listeners
        audio.src = url;
        audioElementsRef.current[type] = audio;
        
        // Load the audio
        audio.load();
        
        // Wait for loading to complete or timeout after 5 seconds
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Loading ${type} timed out`)), 5000)
          );
          await Promise.race([loadPromise, timeoutPromise]);
        } catch (err) {
          console.warn(`Could not fully preload ${type}, continuing anyway:`, err);
          // Mark as loaded anyway to prevent blocking
          setIsLoaded(prev => ({ ...prev, [type]: true }));
        }
      } catch (err) {
        console.warn(`Failed to load sound ${type}:`, err);
        // Mark as loaded anyway to avoid blocking the app
        setIsLoaded(prev => ({ ...prev, [type]: true }));
      }
    };
    
    // Load all sounds in parallel
    const loadAllSounds = async () => {
      const loadPromises = Object.entries(soundLibrary).map(
        ([type, url]) => loadSound(type as SoundType, url)
      );
      
      try {
        await Promise.all(loadPromises);
        console.log('All sounds preloaded successfully.');
      } catch (error) {
        console.warn('Some sounds failed to preload but app will continue:', error);
      }
    };
    
    loadAllSounds();
    
    return () => {
      // Clean up all audio elements when the hook unmounts
      Object.values(audioElementsRef.current).forEach(audio => {
        try {
          audio.pause();
          audio.src = '';
        } catch (e) {
          console.error('Error cleaning up audio:', e);
        }
      });
    };
  }, []);

  const play = (type: SoundType, options: SoundOptions = {}): HTMLAudioElement | null => {
    const { volume = 0.5, loop = false, onEnded } = options;
    
    try {
      // For better reliability, create a new audio instance for each play
      let audio: HTMLAudioElement;
      
      // If we already have this sound type playing and it's set to loop,
      // reuse the same audio element to avoid overlapping sounds
      const existingAudio = audioElementsRef.current[type];
      if (loop && existingAudio && existingAudio.loop) {
        audio = existingAudio;
        
        // If it's already playing, just adjust volume and return
        if (!audio.paused) {
          audio.volume = isMuted ? 0 : volume;
          return audio;
        }
      } else {
        // Create a new audio element
        audio = new Audio(soundLibrary[type]);
        audioElementsRef.current[type] = audio;
      }
      
      // Configure the audio
      audio.volume = isMuted ? 0 : volume;
      audio.loop = loop;
      
      if (onEnded) {
        audio.onended = () => {
          onEnded();
          setActiveAudios(current => {
            const updated = new Set(current);
            updated.delete(audio);
            return updated;
          });
        };
      }
      
      // Play the audio with better error handling
      const playPromise = audio.play();
      
      if (playPromise) {
        playPromise.then(() => {
          // Add to active audios set
          setActiveAudios(current => {
            const updated = new Set(current);
            updated.add(audio);
            return updated;
          });
          console.log(`Playing sound ${type}`);
        }).catch(error => {
          // Handle autoplay restrictions
          console.error(`Failed to play ${type}:`, error);
          if (error.name === 'NotAllowedError') {
            console.log('Autoplay restricted. User interaction required.');
            
            // Create a one-time click handler that will try to play the sound
            const unlockAudio = () => {
              audio.play().catch(e => console.error(`Still couldn't play ${type}:`, e));
              document.removeEventListener('click', unlockAudio);
              document.removeEventListener('touchstart', unlockAudio);
            };
            
            document.addEventListener('click', unlockAudio, { once: true });
            document.addEventListener('touchstart', unlockAudio, { once: true });
          }
        });
      }
      
      return audio;
    } catch (error) {
      console.error(`Error playing sound ${type}:`, error);
      return null;
    }
  };

  const setGlobalMute = (muted: boolean) => {
    setIsMuted(muted);
    
    // Apply to all currently active audios
    activeAudios.forEach(audio => {
      if (audio) {
        audio.muted = muted;
      }
    });
  };

  const pause = (type: SoundType) => {
    const audio = audioElementsRef.current[type];
    if (audio) {
      audio.pause();
      setActiveAudios(current => {
        const updated = new Set(current);
        updated.delete(audio);
        return updated;
      });
    }
  };

  const resume = (type: SoundType) => {
    const audio = audioElementsRef.current[type];
    if (audio) {
      audio.play().catch(error => console.error(`Error resuming sound ${type}:`, error));
      setActiveAudios(current => {
        const updated = new Set(current);
        updated.add(audio);
        return updated;
      });
    }
  };

  const stop = (type: SoundType) => {
    const audio = audioElementsRef.current[type];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setActiveAudios(current => {
        const updated = new Set(current);
        updated.delete(audio);
        return updated;
      });
    }
  };

  const stopAll = () => {
    activeAudios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setActiveAudios(new Set());
  };

  const setVolume = (type: SoundType, volume: number) => {
    const audio = audioElementsRef.current[type];
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume)); // Ensure volume is between 0 and 1
    }
  };

  const isPlaying = (type: SoundType): boolean => {
    const audio = audioElementsRef.current[type];
    return audio ? !audio.paused : false;
  };

  return { 
    play, 
    pause,
    resume,
    stop, 
    stopAll, 
    setVolume,
    setGlobalMute,
    isPlaying,
    isLoaded,
    isMuted
  };
};

export default useSounds;
