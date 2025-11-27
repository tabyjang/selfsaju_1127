import React, { useState } from 'react';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      onApiKeySet(apiKey.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔮 AI 사주 분석
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gemini API 키가 필요합니다
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API 키 입력
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            시작하기
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>💡 API 키는 어떻게 받나요?</strong>
          </p>
          <ol className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1 list-decimal list-inside">
            <li><a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Google AI Studio</a>에 접속</li>
            <li>Google 계정으로 로그인</li>
            <li>"Create API Key" 클릭</li>
            <li>생성된 키를 복사하여 입력</li>
          </ol>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
            ℹ️ API 키는 브라우저에만 저장되며, 서버로 전송되지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
};
