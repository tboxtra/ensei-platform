'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🧪 Testing API call...');
      
      // Test 1: Simple fetch without any headers
      const response = await fetch('https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/missions');
      
      console.log('📊 Response:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Data received:', data);
      
      setResult({
        success: true,
        status: response.status,
        dataLength: Array.isArray(data) ? data.length : 0,
        firstMission: Array.isArray(data) && data.length > 0 ? data[0] : null,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('❌ API Test Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testWithHeaders = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🧪 Testing API call with headers...');
      
      const response = await fetch('https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/missions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('📊 Response with headers:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Data received with headers:', data);
      
      setResult({
        success: true,
        status: response.status,
        dataLength: Array.isArray(data) ? data.length : 0,
        firstMission: Array.isArray(data) && data.length > 0 ? data[0] : null,
        timestamp: new Date().toISOString(),
        method: 'with-headers'
      });
      
    } catch (err) {
      console.error('❌ API Test with Headers Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🧪 API Test Page</h1>
        
        <div className="space-y-6">
          {/* Test Buttons */}
          <div className="flex gap-4">
            <button
              onClick={testApi}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold"
            >
              {loading ? '🔄 Testing...' : '🧪 Test Simple API'}
            </button>
            
            <button
              onClick={testWithHeaders}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold"
            >
              {loading ? '🔄 Testing...' : '🧪 Test API with Headers'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <h2 className="text-red-400 font-bold text-xl mb-2">❌ Error:</h2>
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {result && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <h2 className="text-green-400 font-bold text-xl mb-4">✅ Success!</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Status:</strong> {result.status}</p>
                <p><strong>Data Length:</strong> {result.dataLength}</p>
                <p><strong>Timestamp:</strong> {result.timestamp}</p>
                {result.method && <p><strong>Method:</strong> {result.method}</p>}
              </div>
              
              {result.firstMission && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">First Mission:</h3>
                  <div className="bg-gray-800 rounded p-4">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(result.firstMission, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Instructions</h2>
            <div className="space-y-2 text-gray-300">
              <p>1. Click "Test Simple API" to test basic fetch without headers</p>
              <p>2. Click "Test API with Headers" to test with proper headers</p>
              <p>3. Check browser console for detailed logs</p>
              <p>4. If you see "message port closed" errors, they're likely from browser extensions</p>
            </div>
          </div>

          {/* Browser Info */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🌐 Browser Info</h2>
            <div className="space-y-2 text-sm text-gray-300">
              <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
              <p><strong>Online:</strong> {typeof window !== 'undefined' ? navigator.onLine ? 'Yes' : 'No' : 'N/A'}</p>
              <p><strong>Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

