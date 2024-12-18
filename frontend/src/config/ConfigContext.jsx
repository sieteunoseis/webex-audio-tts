import { createContext, useContext, useEffect, useState } from "react";

const ConfigContext = createContext(null);

const getConfigValues = () => {
  // Development environment
  if (import.meta.env.DEV) {
    const config = {
      webexClientId: import.meta.env.VITE_WEBEX_CLIENT_ID || "",
      webexRedirectUri: import.meta.env.VITE_WEBEX_REDIRECT_URI || "",
      webexScope: import.meta.env.VITE_WEBEX_SCOPE || "",
      brandingUrl: import.meta.env.VITE_BRANDING_URL || "https://automate.builders",
      brandingName: import.meta.env.VITE_BRANDING_NAME || "Automate Builders",
    };
    return config;
  }

  // Production environment
  const config = {
    webexClientId: window.APP_CONFIG?.WEBEX_CLIENT_ID || "",
    webexRedirectUri: window.APP_CONFIG?.WEBEX_REDIRECT_URI || "",
    webexScope: window.APP_CONFIG?.WEBEX_SCOPE || "",
    brandingUrl: window.APP_CONFIG?.BRANDING_URL || "https://automate.builders",
    brandingName: window.APP_CONFIG?.BRANDING_NAME || "Automate Builders",
  };
  return config;
};

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // Wait for config to be available
    const checkConfig = () => {
      if (import.meta.env.DEV || window.APP_CONFIG) {
        setConfig(getConfigValues());
      } else {
        setTimeout(checkConfig, 100);
      }
    };

    checkConfig();
  }, []);

  if (!config) {
    return <div>Loading configuration...</div>; // Or your loading component
  }

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
