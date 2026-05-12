import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';

interface VoiceSelectProps {
  selectedVoiceURI: string | null;
  onChange: (uri: string) => void;
}

export default function VoiceSelect({ selectedVoiceURI, onChange }: VoiceSelectProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
      setVoices(availableVoices);
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (voices.length > 0 && !selectedVoiceURI) {
      // Default to a Google voice or the first available English voice
      const defaultVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha')) || voices[0];
      if (defaultVoice) {
        onChange(defaultVoice.voiceURI);
      }
    }
  }, [voices, selectedVoiceURI, onChange]);

  const handleChange = (uri: string) => {
    onChange(uri);
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Hello, testing voice.");
      const voice = voices.find(v => v.voiceURI === uri);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (voices.length === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
      <Volume2 size={16} className="text-gray-400" />
      <select
        value={selectedVoiceURI || ''}
        onChange={(e) => handleChange(e.target.value)}
        className="text-xs bg-transparent text-gray-700 focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[200px] truncate"
        title="音声を選択"
      >
        {voices.map(v => (
          <option key={v.voiceURI} value={v.voiceURI}>
            {v.name}
          </option>
        ))}
      </select>
    </div>
  );
}
