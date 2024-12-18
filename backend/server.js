const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

dotenv.config();

const app = express();
const PORT = 5000;
const saveWavFiles = process.env.SAVE_WAV_FILES === 'true';

// Promise wrapper for ffmpeg
const convertAudio = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat("wav")
      .audioChannels(1)
      .audioFrequency(8000)
      .audioBitrate("16k")
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        reject(err);
      })
      .on("end", () => {
        resolve();
      })
      .save(outputPath);
  });
};

// Enable CORS
app.use(cors());
app.use(express.json());

// Webex token endpoint
app.post("/api/data/webex/token", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is required" });
  }

  try {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.WEBEX_CLIENT_ID,
      client_secret: process.env.WEBEX_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.WEBEX_REDIRECT_URI,
    });

    const response = await fetch("https://webexapis.com/v1/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await response.json();

    // Store token in memory
    webexToken = {
      access_token: tokenData.access_token,
      expires_at: Date.now() + tokenData.expires_in * 1000,
    };

    res.json({ success: true });
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    res.status(500).json({ error: "Failed to exchange code for token" });
  }
});

// Eleven Labs API endpoints
app.get("/api/data/elevenlabs/voices", async (req, res) => {
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch voices");
    }

    const data = await response.json();
    res.json(data.voices);
  } catch (error) {
    console.error("Error fetching voices:", error);
    res.status(500).json({ error: "Failed to fetch voices" });
  }
});

app.post("/api/data/webex-tts", async (req, res) => {
  const { voiceId, text, locationId, filename } = req.body;

  if (!voiceId || !text || !locationId || !filename) {
    return res.status(400).json({ error: "Voice ID, text, location, and label are required" });
  }

  if (!webexToken || !webexToken.access_token) {
    return res.status(401).json({ error: "Not authenticated with Webex" });
  }

  if (!process.env.WEBEX_ORG_ID) {
    return res.status(500).json({ error: "Webex organization ID is not configured" });
  }

  let originalFile = null;
  let convertedFile = null;

  try {
    // Sanitize filename: remove special characters and spaces, convert to lowercase
    const sanitizedFilename = filename
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Generate unique filenames
    originalFile = path.join(dataDir, `${Date.now()}_original.wav`);
    convertedFile = path.join(dataDir, `${sanitizedFilename}.wav`);

    // Generate speech with ElevenLabs
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        Accept: "audio/wav",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
      }),
    });

    if (!ttsResponse.ok) {
      throw new Error("Failed to generate speech");
    }

    // Save original audio file
    const arrayBuffer = await ttsResponse.arrayBuffer();
    fs.writeFileSync(originalFile, Buffer.from(arrayBuffer));

    // Convert to required format
    await convertAudio(originalFile, convertedFile);

    // Read converted file
    const audioData = fs.readFileSync(convertedFile);

    const body = new FormData();
    const blob = new Blob([audioData], {
      type: "audio/wav",
    });
    body.set("name", filename);
    body.set("file", blob, `${sanitizedFilename}.wav`);

    // Construct the appropriate URL based on locationId
    const baseUrl = "https://webexapis.com/v1/telephony/config";
    const announcementUrl = locationId === "global" ? `${baseUrl}/announcements?orgId=${process.env.WEBEX_ORG_ID}` : `${baseUrl}/locations/${locationId}/announcements?orgId=${process.env.WEBEX_ORG_ID}`;

    // Send to Webex Telephony Announcements
    const webexResponse = await fetch(announcementUrl, {
      method: "POST",
      body: body,
      headers: {
        Authorization: `Bearer ${webexToken.access_token}`,
        Accept: "application/json",
      },
    });

    if (!webexResponse.ok) {
      const errorText = await webexResponse.text();
      console.error("Webex API error:", errorText);
      throw new Error(`Failed to upload announcement to Webex: ${errorText}`);
    }

    await webexResponse.json();
    res.json({ success: true });
  } catch (error) {
    console.error("Error processing TTS request:", error);
    res.status(500).json({ error: error.message });
  } finally {
    // Clean up data files
    try {
      if (originalFile && fs.existsSync(originalFile)) {
        fs.unlinkSync(originalFile);
      }
      // Only delete the converted file if the environment variable is not set
      if(!saveWavFiles) {
        if (convertedFile && fs.existsSync(convertedFile)) {
          fs.unlinkSync(convertedFile);
        }
      }
    } catch (error) {
      console.error("Error cleaning up data files:", error);
    }
  }
});
// Add this endpoint in server.js
app.get("/api/data/webex/locations", async (req, res) => {
  if (!webexToken || !webexToken.access_token) {
    return res.status(401).json({ error: "Not authenticated with Webex" });
  }

  try {
    const response = await fetch(`https://webexapis.com/v1/locations?orgId=${process.env.WEBEX_ORG_ID}`, {
      headers: {
        Authorization: `Bearer ${webexToken.access_token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch locations");
    }

    const data = await response.json();

    // Add Global option and format the locations
    const locations = [
      { id: "global", name: "Global" },
      ...data.items.map((location) => ({
        id: location.id,
        name: location.name,
      })),
    ];

    res.json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
