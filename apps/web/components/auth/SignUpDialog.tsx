"use client";

import { useState } from "react";
import { Dialog } from "@/components/retroui/Dialog";
import { Button } from "@/components/retroui/Button";
import { signIn, signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { Mail } from "lucide-react";

interface SignUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SignUpDialog({ open, onOpenChange, onSuccess }: SignUpDialogProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp.email({
          email,
          password,
          name,
        });

        if (result.error) {
          toast.error(result.error.message);
        } else {
          toast.success("Account created! Please check your email to verify.");
          onSuccess?.();
          onOpenChange(false);
        }
      } else {
        const result = await signIn.email({
          email,
          password,
        });

        if (result.error) {
          // Check if error is about credential account not found
          if (result.error.message?.toLowerCase().includes('credential account not found') || 
              result.error.message?.toLowerCase().includes('account not found')) {
            toast.error("No password account found for this email", {
              description: "Try signing in with Google or GitHub instead, or create a new account.",
              duration: 6000,
            });
          } else {
            toast.error(result.error.message);
          }
        } else {
          toast.success("Signed in successfully!");
          onSuccess?.();
          onOpenChange(false);
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setIsLoading(true);

    try {
      // Use the current origin as callback URL (without query params)
      // This ensures clean redirects after OAuth
      const callbackURL = window.location.origin + window.location.pathname;
      
      const result = await signIn.social({
        provider,
        callbackURL,
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success("Signed in successfully!");
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="md" className="bg-[#faf9f7] border-[#1a1a1a]/20">
        <Dialog.Header className="bg-[#1a1a1a] text-[#f5f3ef]">
          <span className="font-display font-medium">
            {isSignUp ? "Create Your Account" : "Sign In"}
          </span>
        </Dialog.Header>
        <div className="p-6 space-y-6">
          {/* OAuth Providers */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => handleOAuth("google")}
              disabled={isLoading}
            >
              <img src="https://svgl.app/library/google.svg" alt="Google" className="w-4 h-4" />
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => handleOAuth("github")}
              disabled={isLoading}
            >
              <img src="https://svgl.app/library/github_light.svg" alt="GitHub" className="w-4 h-4" />
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1a1a1a]/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#faf9f7] px-2 text-[#6b6b6b]">or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a]/10 rounded-sm text-sm outline-none focus:border-[#1a1a1a]/30"
                  required
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a]/10 rounded-sm text-sm outline-none focus:border-[#1a1a1a]/30"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border-2 border-[#1a1a1a]/10 rounded-sm text-sm outline-none focus:border-[#1a1a1a]/30"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {isSignUp ? "Create account" : "Sign in"}
                </span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
        <Dialog.Footer position="static">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
