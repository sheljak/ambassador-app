# TAP Store API Project

## Overview
This is an Expo React Native application with a Redux Toolkit store system and an API client that supports multiple environments (DEV, STAGE, PROD).

## Project Structure

```
├── app/                    # Expo Router pages
├── components/             # Reusable UI components
├── constants/              # App constants (colors, etc.)
├── hooks/                  # Custom React hooks
├── store/                  # Redux store and API layer
│   ├── api/               # API client and endpoints
│   │   ├── client.ts      # HTTP client with environment switching
│   │   └── endpoints.ts   # API endpoint functions
│   ├── features/          # Feature-specific types
│   │   ├── dialogs/       # Dialog/messaging types
│   │   ├── feeds/         # Feed types
│   │   ├── shared/        # Shared types (User, Image, etc.)
│   │   └── system/        # Account/auth types
│   ├── hooks/             # Store-related hooks
│   │   └── useApi.ts      # Environment switching hook
│   ├── slices/            # Redux slices
│   │   ├── appSlice.ts    # App state (environment, online status)
│   │   ├── authSlice.ts   # Authentication state
│   │   ├── dialogsSlice.ts # Dialogs state
│   │   └── feedsSlice.ts  # Feeds state
│   ├── api-types.ts       # Re-exported API types
│   ├── index.ts           # Store configuration and exports
│   ├── settings.ts        # Environment configuration
│   └── types.ts           # All type definitions
└── assets/                # Static assets
```

## Environment Configuration

The app supports three environments:

- **DEV**: Development environment (`api-dev.tap.st`)
- **STAGE**: Staging environment (`api-staging.tap.st`) - Default
- **PROD**: Production environment (`api.theaccessplatform.com`)

### Switching Environments

```typescript
import { useEnvironment } from '@/store/hooks/useApi';

const { currentEnvironment, changeEnvironment, environments } = useEnvironment();

// Switch to production
changeEnvironment('PROD');
```

Or directly via the API client:

```typescript
import { apiClient, setEnvironment } from '@/store';

setEnvironment('DEV');
apiClient.switchEnvironment('PROD');
```

## Using the Store

```typescript
import { useAppDispatch, useAppSelector } from '@/store';
import { login, fetchAccount } from '@/store/slices/authSlice';

const dispatch = useAppDispatch();
const { user, isAuthenticated } = useAppSelector(state => state.auth);

// Login
dispatch(login({ email: 'user@example.com', password: 'password' }));
```

## API Usage

```typescript
import { api } from '@/store/api/endpoints';

// Using endpoint functions directly
const response = await api.auth.login({ email, password });
const feeds = await api.feeds.getFeeds({ type: 'trending', page: 1 });
```

## Available Commands

- `npm start` - Start Expo development server
- `npm run web` - Start for web
- `npm run android` - Start for Android
- `npm run ios` - Start for iOS

## Recent Changes
- Added Redux Toolkit store with auth, feeds, dialogs slices
- Implemented API client with environment switching
- Added TypeScript types for all API endpoints
- Integrated store provider into app layout

## Dependencies Added
- @reduxjs/toolkit
- react-redux
