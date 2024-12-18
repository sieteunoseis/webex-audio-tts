import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WebexTTSForm from "@/components/WebexTTSForm";
import BackgroundLogo from "@/components/BackgroundLogo";
import { useConfig } from '../config/ConfigContext';

const WebexAuth = () => {
  const config = useConfig();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add this line
  const navigate = useNavigate();
  const location = useLocation();

  const CLIENT_ID = config.webexClientId;
  const REDIRECT_URI = config.webexRedirectUri;
  const SCOPE = config.webexScope;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (code) {
      handleOAuthCallback(code);
    }
  }, [location]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLocations();
    }
  }, [isAuthenticated]);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/data/webex/locations");
      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }
      const data = await response.json();
      setLocations(data);
      setSelectedLocation("global");
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleLocationChange = (value) => {
    setSelectedLocation(value);
  };

  const handleLogin = () => {
    setIsLoading(true); // Add this line
    const authUrl = `https://webexapis.com/v1/authorize?` + `client_id=${CLIENT_ID}&` + `response_type=code&` + `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` + `scope=${encodeURIComponent(SCOPE)}`;

    window.location.href = authUrl;
  };

  const handleOAuthCallback = async (code) => {
    setIsLoading(true); // Add this line
    try {
      const response = await fetch("/api/data/webex/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("Failed to exchange code");
      }

      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Error exchanging code for token:", error);
    } finally {
      setIsLoading(false); // Add this line
    }
  };

  return (
    <div className="min-h-full w-full py-20 relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
      <BackgroundLogo />
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center mb-10">
          <div className="inline-block animate-fade-in">
            <h1 className="text-4xl font-bold mb-1 text-left animate-slide-up">Webex Announcement</h1>
            <h2 className="text-3xl font-bold mb-1 text-left animate-slide-up">Text to Speech Uploader</h2>
            <p className="text-sm text-muted-foreground text-left animate-slide-up-delayed">Powered by ElevenLabs</p>
            <p className="mt-4 text-left">Create new announcements on Webex calling using text to speech. Announcements can be used in various services, such as auto attendant, music on hold or call queue announcements.</p>
          </div>
        </div>
        <Card className="max-w-2xl mx-auto bg-white/10 dark:bg-slate-950/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center">Authenticate via Webex</CardTitle>
            <CardDescription>
              {isAuthenticated && (
                <div className="flex items-center gap-2 text-sm text-green-600 mb-1 mt-2 text-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Connected to Webex
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isAuthenticated && (
              <Button onClick={handleLogin} className="w-full relative overflow-hidden group" disabled={isLoading}>
                <span className="relative z-10">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Connecting...
                    </div>
                  ) : (
                    "Login with Webex"
                  )}
                </span>
                <div className="absolute inset-0 bg-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
              </Button>
            )}
            {isAuthenticated && <WebexTTSForm locations={locations} selectedLocation={selectedLocation} onLocationChange={handleLocationChange} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebexAuth;
