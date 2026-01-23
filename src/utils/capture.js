export const captureImage = (videoElement, filter = 'none', arEnabled = false, faceLandmarks = null) => {
  if (!videoElement) return null;

  const canvas = document.createElement('canvas');
  const width = videoElement.videoWidth;
  const height = videoElement.videoHeight;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  // Flip horizontally to match the mirrored video
  ctx.translate(width, 0);
  ctx.scale(-1, 1);

  // Apply Filter
  if (filter && filter !== 'none') {
    ctx.filter = filter;
  }

  ctx.drawImage(videoElement, 0, 0, width, height);

  // Apply AR Overlay if enabled
  if (arEnabled && faceLandmarks && faceLandmarks.length > 0) {
    const landmarks = faceLandmarks[0];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    if (leftEye && rightEye) {
      const eyeCenterX = (leftEye.x + rightEye.x) / 2 * width;
      const eyeCenterY = (leftEye.y + rightEye.y) / 2 * height;

      const eyeDistance = Math.sqrt(
        Math.pow((rightEye.x - leftEye.x) * width, 2) +
        Math.pow((rightEye.y - leftEye.y) * height, 2)
      );

      const glassesWidth = eyeDistance * 2.5;
      const glassesHeight = glassesWidth * 0.5;

      const angle = Math.atan2(
        (rightEye.y - leftEye.y) * height,
        (rightEye.x - leftEye.x) * width
      );

      ctx.filter = 'none';

      ctx.translate(eyeCenterX, eyeCenterY);
      ctx.rotate(angle);

      const img = new Image();
      img.src = '/sunglasses.png';
      ctx.drawImage(img, -glassesWidth / 2, -glassesHeight / 2, glassesWidth, glassesHeight);

      ctx.rotate(-angle);
      ctx.translate(-eyeCenterX, -eyeCenterY);
    }
  }

  return canvas.toDataURL('image/png');
};
