"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenuinIcon } from "@icons/genuin-icon";
import bg from "@images/gradientBG.webp";

import { verifyCredentials } from "./actions";

export function AuthWallComponent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use server action to verify credentials
      const isValid = await verifyCredentials(username, password);

      if (isValid) {
        // The secure cookie is now set server-side in the verifyCredentials action
        // Redirect to the original URL
        router.push(returnUrl);
      } else {
        setError("Invalid username or password");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="bg-tertiary-200 flex min-h-screen flex-col items-center justify-center bg-cover bg-no-repeat p-4"
      style={{ backgroundImage: `url(${bg.src})` }}>
      <div className="bg-background w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <GenuinIcon.logo className="fill-new-off-black h-12 w-auto" />
        </div>

        <h1 className="text-title-3-bold mb-6 text-center">Protected Content</h1>

        <p className="mb-6 text-center text-gray-600">
          This content requires authentication. Please enter your credentials to continue.
        </p>

        {error && <div className="text-body-1-med mb-4 rounded-md bg-red-50 p-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              disabled={isLoading}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              disabled={isLoading}
              placeholder="Enter password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Authenticating..." : "Access Content"}
          </Button>
        </form>
      </div>
    </div>
  );
}
