# BirdX

🔥 Modern self-hosted chat & file sharing platform

Repository: https://github.com/iPmartNetwork/BirdX

Orginal Repository: https://github.com/bllackbull/Songbird

## Version

Current release: `2.1.0`

## Highlights

- Real-time direct messages, groups, channels, and saved messages
- WebRTC voice calls with Socket.IO signaling
- TURN/STUN configuration for reliable audio on mobile and restricted networks
- Incoming call screen with ringtone while the app is open
- Push notification for incoming calls when the PWA is installed or running in the background
- Message reactions with live updates
- Voice messages with waveform support
- File sharing with size and retention controls
- Read receipts, typing indicators, presence, mute controls, and chat search
- Progressive Web App install support for Android, iOS, and desktop browsers
- Service worker cache management and update recovery
- Dark mode and responsive mobile UI

## Requirements

- Node.js `24+`
- npm `11+`
- HTTPS in production
- A public domain for production deployment
- A TURN server such as `coturn` for reliable voice calls across strict NAT/mobile networks

## Quick Start

## Install (One-line)
bash <(curl -fsSL https://raw.githubusercontent.com/iPmartNetwork/BirdX/master/install.sh)

## Manual Install
git clone https://github.com/iPmartNetwork/BirdX 

cd BirdX 

npm install 

npm run build

## Screenshots
(تصاویر UI)

## Environment

Create a `.env` file in the project root. Use `.env.example` as a starting point.

Important production values:

```env
SERVER_PORT=5174
CLIENT_PORT=443
APP_ENV=production
APP_DEBUG=false
ACCOUNT_CREATION=true

FILE_UPLOAD=true
FILE_UPLOAD_MAX_SIZE=26214400
FILE_UPLOAD_MAX_TOTAL_SIZE=78643200
FILE_UPLOAD_MAX_FILES=10

MESSAGE_MAX_CHARS=4000
MESSAGE_FILE_RETENTION=0
MESSAGE_TEXT_RETENTION=0

CHAT_MESSAGE_FETCH_LIMIT=300
CHAT_MESSAGE_PAGE_SIZE=60
CHAT_LIST_REFRESH_INTERVAL=20000
CHAT_PRESENCE_PING_INTERVAL=5000

APP_TURN_URLS=turn:turn.domain.com:3478?transport=udp turn:turn.domain.com:3478?transport=tcp
APP_TURN_USERNAME=birdx
APP_TURN_CREDENTIAL=your_turn_password
```

Do not change `STORAGE_ENCRYPTION_KEY` after first run. It protects stored application data.

## Voice Calls

BirdX voice calls use WebRTC for peer audio and Socket.IO for signaling.

For best call reliability, configure a TURN server:

```env
APP_TURN_URLS=turn:turn.domain.com:3478?transport=udp turn:turn.domain.com:3478?transport=tcp
APP_TURN_USERNAME=birdx
APP_TURN_CREDENTIAL=your_turn_password
```

Recommended TURN ports:

```text
3478 TCP
3478 UDP
49152-65535 UDP
```

Without TURN, WebRTC may work on normal networks but can fail on some mobile carriers, corporate networks, or strict NAT connections.

## PWA And Notifications

BirdX includes a web app manifest and service worker for installable PWA behavior.

For Android installation:

- Serve the app over HTTPS
- Keep the manifest available at `/manifest.webmanifest`
- Keep the service worker available at `/sw.js`
- Make sure notification permission is granted by the user

Incoming call notifications use Web Push. Configure valid VAPID keys in `.env`.

## Server Scripts

The server includes database helper scripts:

```bash
npm --prefix server run db:help
npm --prefix server run db:backup
npm --prefix server run db:restore
npm --prefix server run db:migrate
```

## Release Notes

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT
