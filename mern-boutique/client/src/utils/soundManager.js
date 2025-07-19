// Create Audio instances for each notification type
const NOTIFICATION_SOUNDS = {
  success: new Audio('/success-sound.mp3'),
  error: new Audio('/error-sound.mp3'),
  warning: new Audio('/warning-sound.mp3'),
  info: new Audio('/info-sound.mp3')
};

// Keep track of currently playing sounds to prevent overlap
let currentlyPlaying = null;

const playSound = (type = 'info') => {
  // Stop any currently playing sound
  if (currentlyPlaying) {
    currentlyPlaying.pause();
    currentlyPlaying.currentTime = 0;
  }

  // Get the appropriate sound for the notification type
  const sound = NOTIFICATION_SOUNDS[type] || NOTIFICATION_SOUNDS.info;

  // Play the new sound
  try {
    currentlyPlaying = sound;
    sound.currentTime = 0; // Reset to start
    const playPromise = sound.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Sound started playing successfully
          sound.addEventListener('ended', () => {
            currentlyPlaying = null;
          }, { once: true });
        })
        .catch(error => {
          // Auto-play was prevented or there was another error
          console.warn('Sound playback failed:', error);
          currentlyPlaying = null;
        });
    }
  } catch (error) {
    console.warn('Sound playback error:', error);
    currentlyPlaying = null;
  }
};

// Preload sounds
const preloadSounds = () => {
  Object.values(NOTIFICATION_SOUNDS).forEach(sound => {
    sound.load();
  });
};

// Initialize sounds when the module loads
preloadSounds();

export { playSound }; 