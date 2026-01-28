# Ambassador App

A React Native Expo application built with Expo Router, Redux Toolkit, and TypeScript.

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- For device testing: Expo Go app installed on your iOS/Android device

### Installation

```bash
npm install
# or
yarn install
```

## Running the App

### On Replit

The app uses LAN mode by default (tunnel mode often times out on Replit).

**Option 1: Using Replit Port Forwarding (Recommended)**
1. Click the "Run" button or run `npm start`
2. Wait for the Expo dev server to start (usually on port 8081)
3. In Replit, look for the port forwarding section or use the "Open in Browser" feature
4. Copy the forwarded URL (e.g., `https://your-repl.repl.co`)
5. In Expo Go app, manually enter the connection URL: `exp://your-repl.repl.co:8081`

**Option 2: Try Smart Start (Auto-fallback)**
```bash
npm run start:smart
```
This tries tunnel mode first, then falls back to LAN if it fails.

**Option 3: Force Tunnel Mode**
```bash
npm run start:tunnel
```
Note: This may timeout on Replit due to network restrictions.

### Running Locally

#### On Device (LAN Mode - Default)
```bash
npm start
# or
npm run start:lan
```
Uses your local network. Works best when device and computer are on the same Wi-Fi.

#### On Device (Tunnel Mode - Works from anywhere)
```bash
npm run start:tunnel
```
Uses Expo's tunnel service. May timeout on Replit - use `npm run start:smart` for auto-fallback.

#### Web Browser
```bash
npm run start:web
# or
npm run web
```

#### iOS Simulator
```bash
npm run ios
```

#### Android Emulator
```bash
npm run android
```

## Connecting Your Device

1. **Install Expo Go** on your device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the dev server** with `npm start`

3. **Scan the QR code**:
   - **iOS**: Open Camera app and tap the notification
   - **Android**: Open Expo Go app and tap "Scan QR code"

4. The app will load on your device!

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout
│   └── (tabs)/            # Tab navigation screens
├── components/            # Reusable UI components
├── constants/             # App constants (colors, fonts)
├── hooks/                 # Custom React hooks
├── store/                 # Redux store and API layer
│   ├── api/              # API client and endpoints
│   ├── features/         # Feature-specific types
│   ├── hooks/            # Store-related hooks
│   └── slices/           # Redux slices
└── assets/               # Static assets
```

## Features

- ✅ Expo Router for file-based routing
- ✅ Redux Toolkit for state management
- ✅ TypeScript for type safety
- ✅ Web-compatible React Native components
- ✅ Responsive design
- ✅ Dark/Light theme support
- ✅ Device connection via tunnel mode

## Development

### Linting
```bash
npm run lint
```

### Testing
```bash
npm test
```

### Clear Cache
```bash
npm run start:clear
```

## Environment Configuration

The app supports multiple API environments (DEV, STAGE, PROD). See `store/settings.ts` for configuration.

## Troubleshooting

### ngrok tunnel timeout error
- **On Replit**: Use LAN mode (`npm start`) instead of tunnel mode
- Use Replit's port forwarding feature to expose the dev server
- Or try `npm run start:smart` which auto-falls back to LAN mode

### Device won't connect
- **On Replit**: Use port forwarding and manually enter the URL in Expo Go
- Make sure your device has internet access
- Try restarting the dev server with `npm run start:clear`
- Check that the port (usually 8081) is accessible

### QR code not appearing
- Make sure the dev server is fully started
- Check the console for any error messages
- Try running `npm run start:clear` to clear the cache
- On Replit, you may need to manually enter the connection URL in Expo Go

## License

Private project
