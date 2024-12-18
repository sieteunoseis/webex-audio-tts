# Webex Text-to-Speech Announcement Uploader

A modern web application that allows users to create and upload text-to-speech announcements to Webex calling services. This tool integrates with ElevenLabs for text-to-speech conversion and can be used for various services such as auto attendant, music on hold, or call queue announcements.

## Features

- 🔐 Secure Webex OAuth authentication
- 🎯 Multiple location support for announcement deployment
- 🌓 Light/Dark mode with system preference detection
- 🎨 Modern UI with responsive design
- 🔄 Real-time status updates
- 📱 Mobile-friendly interface

## Technologies Used

- React 
- TypeScript
- React Router for navigation
- Tailwind CSS for styling
- shadcn/ui component library
- Webex APIs
- ElevenLabs API for text-to-speech conversion

## Prerequisites

Before you begin, ensure you have:
- Node.js installed (v14 or higher)
- A Webex developer account with API access
- Webex OAuth Intergration with the following API scopes:
  - `spark-admin:telephony_config_write`
  - `spark-admin:locations_read`

## Installation

### Development

1. Clone the repository:
```bash
git clone https://github.com/sieteunoseis/webex-audio-tts.git
```

2. Install dependencies:
```bash
npm run install-all
```

3. Create a `.env` file in the frontend directory and add your Webex credentials:
```env
VITE_WEBEX_CLIENT_ID=your-client-id
VITE_WEBEX_REDIRECT_URI=http://localhost:5173/oauth
VITE_WEBEX_SCOPE=spark-admin:telephony_config_write spark-admin:locations_read
```

4. Create a `.env` file in the backend directory and add the following:
```env
ELEVENLABS_API_KEY=elevenlabs-api-key
WEBEX_CLIENT_ID=webex-client-id
WEBEX_REDIRECT_URI=http://localhost:5173/oauth
WEBEX_CLIENT_SECRET=webex-client-secret
WEBEX_ORG_ID=webex-org-id
SAVE_WAV_FILES=true
```

Note: Development mode uses port 5173 for the frontend. In production, the application will run on port 3000 or whatever port you specify in the docker-compose file.

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production

1. Download docker-compose.yml file from this repository
```
wget -O docker-compose.yaml https://raw.githubusercontent.com/sieteunoseis/webex-audio-tts/refs/heads/master/docker-compose.yaml
```

#### 2. Create a frontend.env file with the following content
```
touch frontend.env
```

| Variable Name | Explanation | Example | Required |
|--------------|-------------|-----------------|----------|
| VITE_WEBEX_CLIENT_ID | Client ID from your Webex Developer account |  | Yes |
| VITE_WEBEX_REDIRECT_URI | OAuth callback URL for authentication | http://localhost:3000/oauth | Yes |
| VITE_WEBEX_SCOPE | Space-separated list of required API permissions | spark-admin:telephony_config_write spark-admin:locations_read | Yes |
| VITE_BRANDING_NAME | Organization name for branding purposes in NavBar | `Automate Builders` | `no` | 
| VITE_BRANDING_URL | URL for organization branding/website in NavBar | `http://automate.builders` | `no` |

#### 3. Create a backend.env file with the following content
```
touch backend.env
```
| Variable Name | Explanation | Example | Required |
|--------------|-------------|-----------------|----------|
| ELEVENLABS_API_KEY | API key for ElevenLabs text-to-speech service |  | Yes |
| WEBEX_CLIENT_ID | Client ID from your Webex Developer account |  | Yes |
| WEBEX_CLIENT_SECRET | Client Secret from your Webex Developer account |  | Yes |
| WEBEX_REDIRECT_URI | OAuth callback URL for authentication | http://localhost:3000/oauth | Yes |
| WEBEX_ORG_ID | Your Webex Organization ID |  | Yes |
| SAVE_WAV_FILES | Toggle to save generated audio files locally | true | No |

#### 4. Run the application via Docker Compose
```bash
docker-compose up -d
```
#### 5. Access the app
```
http://localhost:3000
```

#### 6. Optionally add local volume to persist data
```
# Create directories if they don't exist
mkdir -p ./data

# Set permissions (replace 1000:1000 with your actual UID:GID if different)
chown -R 1000:1000 ./data
chmod 755 ./data
```
Add the following line to the docker-compose.yml file for the backend service.
``` 
user: "${UID:-1000}:${GID:-1000}"
volumes:
  - ./data:/usr/src/app/data
```
Note: that the data directory will be used to store the audio files and the db directory will be used to store the sqlite database.

## Configuration

### Webex Setup

1. Create a Webex Developer account at [developer.webex.com](https://developer.webex.com)
2. Create a new app integration [here](https://developer.webex.com/my-apps/new)
    1. Set the Redirect URI to `http://localhost:5173/oauth` or your production URL
    2. Enable the following scopes:
        - `spark-admin:telephony_config_write`
        - `spark-admin:locations_read`
3. Copy the Client ID and Client Secret for use in `frontend.env` and `backend.env` file(s)

## Usage

1. Launch the application
2. Click "Login with Webex" to authenticate
3. Select ElevenLabs voice to use for text-to-speech conversion
4. Select the location you wish to upload the file to from the dropdown
5. Enter a label for the announcement
6. Enter your announcement text
7. Upload the announcement to [Webex Announcement Repository](https://admin.webex.com/calling/features/announcements/announcementFiles)

## Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── theme-provider.tsx # Theme configuration
└── App.jsx           # Main application component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Screenshots

## Troubleshooting

Frontend container is not able to reach backend container.

Try pinging from frontend to backend container:

```
docker exec webex-tts-frontend ping webex-tts-backend
```

Backend container is not able to save the audio files.

```
docker exec webex-tts-backend ls -l /usr/src/app/data
```

Try to create a file in the data directory and check the permissions.

```
docker exec webex-tts-backend touch /usr/src/app/data/test.txt
```

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Webex APIs](https://developer.webex.com/) for communication services
- [ElevenLabs](https://elevenlabs.io/) for text-to-speech capabilities

## Giving Back

If you would like to support my work and the time I put in creating the code, you can click the image below to get me a coffee. I would really appreciate it (but is not required).

<a href="https://www.buymeacoffee.com/automatebldrs" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>