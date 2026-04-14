import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import TranslatorScreen from './components/TranslatorScreen';
import AvatarConfigScreen from './components/AvatarConfigScreen';
import PracticeScreen from './components/PracticeScreen';
import NotebookLMScreen from './components/NotebookLMScreen';
import { DEFAULT_AVATAR1, DEFAULT_AVATAR2 } from './utils/avatarPresets';
import { useTranslation } from './hooks/useTranslation';

const KEY1 = 'vt-avatar1';
const KEY2 = 'vt-avatar2';

function load(key, def) {
  try {
    const s = localStorage.getItem(key);
    return s ? { ...def, ...JSON.parse(s) } : def;
  } catch {
    return def;
  }
}

function App() {
  const [screen, setScreen] = useState('HOME'); // HOME | TRANSLATOR | AVATAR_CONFIG
  const [prevScreen, setPrevScreen] = useState('HOME');
  const [avatar1, setAvatar1] = useState(() => load(KEY1, DEFAULT_AVATAR1));
  const [avatar2, setAvatar2] = useState(() => load(KEY2, DEFAULT_AVATAR2));

  // Pre-load both translation models at app startup
  const translation = useTranslation();

  const goTo = (s) => { setPrevScreen(screen); setScreen(s); };

  const handleSaveAvatars = (a1, a2) => {
    setAvatar1(a1);
    setAvatar2(a2);
    localStorage.setItem(KEY1, JSON.stringify(a1));
    localStorage.setItem(KEY2, JSON.stringify(a2));
    setScreen(prevScreen === 'TRANSLATOR' ? 'TRANSLATOR' : 'HOME');
  };

  const handleCancelAvatars = () =>
    setScreen(prevScreen === 'TRANSLATOR' ? 'TRANSLATOR' : 'HOME');

  return (
    <div className="app">
      {screen === 'HOME' && (
        <HomeScreen
          avatar1={avatar1}
          avatar2={avatar2}
          onStart={() => goTo('TRANSLATOR')}
          onPractice={() => goTo('PRACTICE')}
          onNotebookLM={() => goTo('NOTEBOOKLM')}
          onConfigureAvatars={() => goTo('AVATAR_CONFIG')}
        />
      )}

      {screen === 'PRACTICE' && (
        <PracticeScreen onBack={() => setScreen('HOME')} />
      )}

      {screen === 'NOTEBOOKLM' && (
        <NotebookLMScreen onBack={() => setScreen('HOME')} />
      )}

      {screen === 'TRANSLATOR' && (
        <TranslatorScreen
          avatar1={avatar1}
          avatar2={avatar2}
          translation={translation}
          onBack={() => setScreen('HOME')}
          onConfigureAvatars={() => goTo('AVATAR_CONFIG')}
        />
      )}

      {screen === 'AVATAR_CONFIG' && (
        <AvatarConfigScreen
          avatar1={avatar1}
          avatar2={avatar2}
          onSave={handleSaveAvatars}
          onCancel={handleCancelAvatars}
        />
      )}
    </div>
  );
}

export default App;
