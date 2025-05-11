"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [configData, setConfigData] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      setResults({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const checkConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await fetch("/api/auth-debug");
      const data = await response.json();
      setConfigData(data);
    } catch (error) {
      setConfigData({ error: String(error) });
    } finally {
      setConfigLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Authentication Debug Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Check Supabase Configuration</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Login API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
} 