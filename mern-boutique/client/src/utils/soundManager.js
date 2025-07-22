// Create Audio instances for each notification type
const NOTIFICATION_SOUNDS = {
  success: null,
  error: null,
  warning: null,
  info: null
};

// Keep track of currently playing sounds to prevent overlap
let currentlyPlaying = null;
let isInitialized = false;
let hasUserInteraction = false;

// Initialize sounds
const initializeSounds = () => {
  if (isInitialized) return;
  
  const soundFiles = {
    success: '/success-sound.mp3',
    error: '/error-sound.mp3',
    warning: '/warning-sound.mp3',
    info: '/info-sound.mp3'
  };

  // Create and configure audio instances
  Object.entries(soundFiles).forEach(([type, path]) => {
    const audio = new Audio(path);
    audio.volume = 0.5;
    audio.preload = 'auto';
    audio.muted = true; // Start muted until user interaction
    NOTIFICATION_SOUNDS[type] = audio;
  });

  isInitialized = true;

  // Listen for user interaction
  const enableAudio = () => {
    if (!hasUserInteraction) {
      hasUserInteraction = true;
      Object.values(NOTIFICATION_SOUNDS).forEach(sound => {
        if (sound) sound.muted = false;
      });
      // Remove listeners after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    }
  };

  document.addEventListener('click', enableAudio);
  document.addEventListener('touchstart', enableAudio);
  document.addEventListener('keydown', enableAudio);
};

const playSound = (type = 'info') => {
  // Initialize sounds if not already done
  if (!isInitialized) {
    initializeSounds();
  }

  // Stop any currently playing sound
  if (currentlyPlaying) {
    currentlyPlaying.pause();
    currentlyPlaying.currentTime = 0;
  }

  // Get the appropriate sound for the notification type
  const sound = NOTIFICATION_SOUNDS[type] || NOTIFICATION_SOUNDS.info;
  if (!sound) return;

  // Play the new sound
  try {
    currentlyPlaying = sound;
    sound.currentTime = 0; // Reset to start
    
    // Create a promise to handle the play attempt
    const playPromise = sound.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Sound started playing successfully
          sound.addEventListener('ended', () => {
            currentlyPlaying = null;
          }, { once: true });
        })
        .catch(() => {
          // Silently handle autoplay restriction
          currentlyPlaying = null;
        });
    }
  } catch (error) {
    // Silently handle any errors
    currentlyPlaying = null;
  }
};

// Initialize sounds when the document is ready
if (document.readyState === 'complete') {
  initializeSounds();
} else {
  window.addEventListener('load', initializeSounds);
}

export { playSound }; 