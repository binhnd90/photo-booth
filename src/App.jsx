import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import TranslatorScreen from './components/TranslatorScreen';
import AvatarConfigScreen from './components/AvatarConfigScreen';
import { DEFAULT_AVATAR } from './utils/avatarPresets';
import { useTranslation } from './hooks/useTranslation';

const STORAGE_KEY = 'vt-avatar-config';

function loadSavedAvatar() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_AVATAR, ...JSON.parse(saved) } : DEFAULT_AVATAR;
  } catch {
    return DEFAULT_AVATAR;
  }
}

function App() {
  const [screen, setScreen] = useState('HOME'); // HOME | TRANSLATOR | AVATAR_CONFIG
  const [prevScreen, setPrevScreen] = useState('HOME');
  const [avatarConfig, setAvatarConfig] = useState(loadSavedAvatar);

  // Load translation model at app level so it starts immediately
  const translation = useTranslation();

  const goTo = (s) => {
    setPrevScreen(screen);
    setScreen(s);
  };

  const handleSaveAvatar = (config) => {
    setAvatarConfig(config);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setScreen(prevScreen === 'TRANSLATOR' ? 'TRANSLATOR' : 'HOME');
  };

  const handleCancelAvatar = () => {
    setScreen(prevScreen === 'TRANSLATOR' ? 'TRANSLATOR' : 'HOME');
  };

  return (
    <div className="app">
      {screen === 'HOME' && (
        <HomeScreen
          avatarConfig={avatarConfig}
          onStart={() => goTo('TRANSLATOR')}
          onConfigureAvatar={() => goTo('AVATAR_CONFIG')}
        />
      )}

      {screen === 'TRANSLATOR' && (
        <TranslatorScreen
          avatarConfig={avatarConfig}
          translation={translation}
          onBack={() => setScreen('HOME')}
          onConfigureAvatar={() => goTo('AVATAR_CONFIG')}
        />
      )}

      {screen === 'AVATAR_CONFIG' && (
        <AvatarConfigScreen
          currentConfig={avatarConfig}
          onSave={handleSaveAvatar}
          onCancel={handleCancelAvatar}
        />
      )}
    </div>
  );
}

export default App;
