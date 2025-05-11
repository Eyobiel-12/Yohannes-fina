"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthDebugPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [configData, setConfigData] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [urlDebug, setUrlDebug] = useState<any>(null);

  async function checkConfig() {
    setConfigLoading(true);
    try {
      const response = await fetch('/api/auth-debug');
      const data = await response.json();
      setConfigData(data);
    } catch (error) {
      console.error('Error checking config:', error);
      setConfigData({ error: String(error) });
    } finally {
      setConfigLoading(false);
    }
  }

  async function testLogin() {
    if (!email || !password) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/direct-auth-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error testing login:', error);
      setResults({ error: String(error) });
    } finally {
      setLoading(false);
    }
  }

  // Debug the window location and URL settings
  function debugUrls() {
    if (typeof window === 'undefined') return;
    
    setUrlDebug({
      currentUrl: window.location.href,
      host: window.location.host,
      origin: window.location.origin,
      protocol: window.location.protocol,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    });
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Authentication Debug Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Check Supabase Configuration</h2>
        <Button 
          onClick={checkConfig} 
          disabled={configLoading}
          className="mb-4"
        >
          {configLoading ? "Checking..." : "Check Configuration"}
        </Button>
        
        {configData && (
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(configData, null, 2)}
          </pre>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Test Direct Login</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>
          
          <div>
            <label className="block mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          
          <Button
            onClick={testLogin}
            disabled={loading || !email || !password}
          >
            {loading ? "Testing..." : "Test Login"}
          </Button>
          
          {results && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Results:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">URL Debug Info</h2>
        <Button onClick={debugUrls} className="mb-4">
          Check URLs
        </Button>
        
        {urlDebug && (
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(urlDebug, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
} 