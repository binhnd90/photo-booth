import { useState } from 'react'; // Ensure useState is imported
import StartScreen from './components/StartScreen';
import CameraScreen from './components/CameraScreen';
import ReviewScreen from './components/ReviewScreen';

function App() {
  const [screen, setScreen] = useState('START'); // START, CAMERA, REVIEW
  const [image, setImage] = useState(null);

  const handleStart = () => setScreen('CAMERA');
  const handleBack = () => setScreen('START');

  const handleCapture = (imgData) => {
    setImage(imgData);
    setScreen('REVIEW');
  };

  const handleRetake = () => {
    setImage(null);
    setScreen('CAMERA');
  };

  const handleDownload = () => {
    if (image) {
      const link = document.createElement('a');
      link.href = image;
      link.download = `photo-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div className="app-container" style={{ width: '100%', height: '100%' }}>
      {screen === 'START' && <StartScreen onStart={handleStart} />}
      {screen === 'CAMERA' && <CameraScreen onBack={handleBack} onCapture={handleCapture} />}
      {screen === 'REVIEW' && <ReviewScreen image={image} onRetake={handleRetake} onDownload={handleDownload} />}
    </div>
  );
}

export default App;
