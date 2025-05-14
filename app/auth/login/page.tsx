"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    toast({
      title: "Signing you in…",
      description: "Please wait while we log you in.",
    });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("rate limit")) {
          setCooldown(30); // 30 seconds
          toast({
            title: "Too many attempts",
            description: "Please wait 30 seconds before trying again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "Redirecting to your dashboard…",
        });
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4 bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="w-full max-w-md space-y-8 bg-white/60 backdrop-blur-md border border-white/40 shadow-2xl rounded-2xl p-8 animate-fade-in-up transition-all">
        <div className="flex flex-col items-center gap-2 mb-2">
          <Image src="/yohannes-logo.png" alt="Yohannes Logo" width={180} height={60} className="shadow-lg border border-green-200 bg-white/80 object-contain" priority />
          <h1 className="text-3xl font-bold mt-2">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/80 backdrop-blur rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 shadow-sm focus:shadow-green-100"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/80 backdrop-blur rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 shadow-sm focus:shadow-green-100"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-green-600 text-white hover:bg-green-700 focus:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg focus:shadow-green-200 relative overflow-hidden"
            disabled={loading || cooldown > 0}
          >
            {cooldown > 0
              ? `Wait ${cooldown}s`
              : loading
              ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  Signing you in…
                </span>
              )
              : "Sign in"}
            <span className="absolute inset-0 pointer-events-none" />
          </Button>
        </form>
        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link href="/auth/register" className="font-medium underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
