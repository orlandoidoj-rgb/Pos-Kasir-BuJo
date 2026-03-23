/**
 * playOrderNotification
 * 
 * Main sound saat pesanan online baru masuk (status: Paid).
 */
export function playOrderNotification(): void {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(err => {
      console.warn('Autoplay blocked or audio missing:', err);
    });
  } catch (err) {
    console.error('Sound error:', err);
  }
}

/**
 * unlockAudio
 * Panggil saat user pertama kali interact (klik tombol login/buka shift).
 */
export function unlockAudio(): void {
  // Creating and playing a silent buffer to unlock audio on iOS/Safari/Chrome
  const audio = new Audio();
  audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
  audio.play().catch(() => {});
}
