# TumorLens — On-Device Brain Tumor Segmentation

TumorLens is a production-quality mobile application that performs on-device brain tumor segmentation using a Qualcomm AI Hub optimized TensorFlow Lite model. Designed for doctors and radiologists working in hospitals or remote clinics where internet connectivity may be unavailable.

The AI model runs entirely on the device. MRI images are never uploaded to a server for inference.

---

## Features

- **On-Device AI Segmentation** — U-Net model (BraTS2020) quantized via Qualcomm AI Hub, running on-device via TensorFlow Lite
- **Multi-Class Segmentation** — Detects Necrotic Core (NCR), Peritumoral Edema (ED), and Enhancing Tumor (ET)
- **Privacy-First** — All MRI data stays on-device; no images are ever sent to a server
- **Offline-First** — Full functionality without internet; syncs reports when connectivity returns
- **Role-Based Access** — Doctor and Radiologist views with appropriate actions
- **Biometric Authentication** — Face ID / Touch ID for secure access
- **PDF Export** — Generate and share radiology reports as PDFs
- **Local SQLite Database** — Patient records, reports, and sync queue stored locally
- **Dark Mode** — Automatic system theme support with a radiology-optimized dark theme

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK ~54.0.34 (React Native 0.81.5) |
| Routing | expo-router (file-based) |
| Language | TypeScript ~5.9.2 |
| Styling | NativeWind v4 (Tailwind CSS for React Native) |
| State | Zustand v5 + React Query v5 |
| Forms | React Hook Form v7 + Zod v4 |
| AI | react-native-fast-tflite v3 + TFLite quantized U-Net |
| Database | expo-sqlite (local SQLite) |
| Auth | expo-secure-store + expo-local-authentication |
| Animations | react-native-reanimated v4 |
| Backend | Express.js + MongoDB + JWT (auth / sync only) |

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Expo CLI** (`npm install -g expo-cli`) or use `npx expo`
- **Expo Go** app on your physical device (iOS or Android) for development
- **Android Studio** / **Xcode** (optional, for native builds)
- **Git**

---

## Installation

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-org/tumorlens.git
cd tumorlens

# Install all dependencies
npm install
```

This installs the core framework and all libraries listed below.

### 2. Core Framework Setup

| Package | Purpose | Install Command |
|---------|---------|----------------|
| **Expo SDK ~54** | Core React Native framework with managed workflow | Bundled — `npx create-expo-app` |
| **expo-router** | File-based routing | `npx expo install expo-router` |
| **React Native 0.81.5** | Mobile UI framework | `npm install react@19.1.0 react-native@0.81.5` |
| **TypeScript ~5.9** | Type safety | `npm install -D typescript` |

### 3. Styling & UI

| Package | Purpose | Install Command |
|---------|---------|----------------|
| **NativeWind v4** | Tailwind CSS for React Native | `npm install nativewind tailwindcss` |
| **react-native-reanimated v4** | Smooth animations | `npx expo install react-native-reanimated` |
| **react-native-gesture-handler** | Touch gestures | `npx expo install react-native-gesture-handler` |
| **react-native-safe-area-context** | Safe area insets | `npx expo install react-native-safe-area-context` |
| **react-native-screens** | Native screen containers | `npx expo install react-native-screens` |
| **expo-blur** | Blur effects | `npx expo install expo-blur` |
| **expo-linear-gradient** | Gradient backgrounds | `npx expo install expo-linear-gradient` |
| **@expo/vector-icons** | Icon library | `npx expo install @expo/vector-icons` |
| **react-native-svg** | SVG rendering for overlays | `npm install react-native-svg` |

### 4. State Management & Data

| Package | Purpose | Install Command |
|---------|---------|----------------|
| **Zustand v5** | Lightweight global state | `npm install zustand` |
| **TanStack Query v5** | Server state & caching | `npm install @tanstack/react-query` |
| **React Hook Form v7** | Form handling | `npm install react-hook-form` |
| **Zod v4** | Schema validation | `npm install zod` |
| **@hookform/resolvers** | Zod integration with RHF | `npm install @hookform/resolvers` |

### 5. AI / ML

| Package | Purpose | Install Command |
|---------|---------|----------------|
| **react-native-fast-tflite v3** | On-device TFLite inference | `npx expo install react-native-fast-tflite` |
| **jpeg-js** | JPEG encoding/decoding | `npm install jpeg-js` |
| **pngjs** | PNG encoding/decoding | `npm install pngjs` |

The quantized U-Net model (`job_j5w14oyzg_optimized_tflite_mnjkw4pkm.tflite`) is bundled at `assets/models/`. No additional download required.

### 6. Storage & Offline

| Package | Purpose | Install Command |
|---------|---------|----------------|
| **expo-sqlite** | Local SQLite database | `npx expo install expo-sqlite` |
| **expo-file-system** | File system access | `npx expo install expo-file-system` |
| **expo-secure-store** | Encrypted token storage | `npx expo install expo-secure-store` |
| **expo-image** | Optimized image loading | `npx expo install expo-image` |
| **@react-native-async-storage/async-storage** | KV storage fallback | `npm install @react-native-async-storage/async-storage` |
| **@react-native-community/netinfo** | Network connectivity | `npm install @react-native-community/netinfo` |

### 7. Camera, Picker & Sharing

| Package | Purpose | Install Command |
|---------|---------|----------------|
| **expo-camera** | Camera capture | `npx expo install expo-camera` |
| **expo-image-picker** | Gallery selection | `npx expo install expo-image-picker` |
| **expo-document-picker** | File system picker | `npx expo install expo-document-picker` |
| **expo-image-manipulator** | Image cropping/resizing | `npx expo install expo-image-manipulator` |
| **expo-print** | HTML-to-PDF generation | `npx expo install expo-print` |
| **expo-sharing** | Native share dialog | `npx expo install expo-sharing` |

### 8. Auth & Notifications

| Package | Purpose | Install Command |
|---------|---------|----------------|
| **expo-local-authentication** | Biometric auth (Face ID / Touch ID) | `npx expo install expo-local-authentication` |
| **expo-notifications** | Push & local notifications | `npx expo install expo-notifications` |
| **axios** | HTTP client for backend API | `npm install axios` |

### 9. Environment Setup

```bash
# Create environment file
cp .env.example .env

# Edit the API URL to point to your backend
# .env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL | `http://192.168.29.157:8000` |

---

## Development

```bash
# Start the Expo development server
npx expo start

# Start for specific platforms
npm run ios       # iOS (requires Xcode)
npm run android   # Android (requires Android Studio)
npm run web       # Web (experimental)
```

Scan the QR code with **Expo Go** (iOS/Android) to run on your device.

---

## Project Structure

```
tumorlens/
├── app/                    # Expo Router file-based pages
│   ├── (auth)/             # Authentication screens
│   ├── (tabs)/             # Main tab navigator screens
│   ├── patients/           # Patient CRUD screens
│   ├── _layout.tsx         # Root layout (providers, navigation gate)
│   ├── report-details.tsx  # Single report view
│   └── result.tsx          # AI analysis result screen
├── components/
│   ├── auth/               # Authentication UI components
│   ├── dashboard/          # Dashboard cards and widgets
│   ├── offline/            # Offline status components
│   ├── patients/           # Patient list/detail components
│   ├── profile/            # Profile/settings components
│   ├── reports/            # Report list, search, filters
│   ├── ui/                 # Base UI components (Button, Input, Layout, etc.)
│   ├── upload/             # MRI upload components
│   └── viewer/             # MRI viewer, overlay, legend
├── config/                 # App configuration (model path, API settings)
├── constants/              # Mock data
├── contexts/               # Auth context provider
├── database/               # SQLite database service, storage service
├── hooks/                  # Custom hooks (patients, reports, network, etc.)
├── repositories/           # Data access layer (SQLite CRUD)
├── services/               # AI service, API client, image picker, notifications, PDF export
├── store/                  # Zustand stores (scan, app)
├── theme/                  # Colors, typography, spacing, shadows
├── types/                  # TypeScript interfaces
├── utils/                  # Image utils, mask parsing, tensor processing, responsive helpers
├── assets/                 # Images, fonts (fonts/ is empty — uses system fonts), TFLite model
├── backend/                # Backend API client functions
├── assets/models/          # TFLite model file
├── tailwind.config.js      # NativeWind configuration
└── package.json
```

---

## AI Pipeline

```
MRI Image → Preprocessing → Tensor Conversion → TFLite Inference → Segmentation Mask → Overlay Generation → Statistics → Report → Save
```

The model is a quantized U-Net trained on the BraTS2020 dataset, optimized via Qualcomm AI Hub for on-device inference. The `.tflite` model file is located at `assets/models/`.

Key files:
- `services/aiService.ts` — Model loading, inference, and cleanup
- `services/predictionService.ts` — Prediction orchestration and report formatting
- `utils/tensorUtils.ts` — Image preprocessing and tensor conversion
- `utils/maskUtils.ts` — Output tensor parsing to segmentation mask

---

## Build & Deploy

### Android

```bash
# Build Android APK/AAB
npx expo run:android

# Or use EAS Build for cloud builds
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

### iOS

```bash
# Build iOS IPA
npx expo run:ios

# Or use EAS Build
eas build --platform ios --profile production
```

### Web (Static Export)

```bash
npx expo export --platform web
```

Output in `dist/` — deploy to any static hosting (Vercel, Netlify, S3, etc.).

### EAS Build Profiles

Configure `eas.json` in the project root:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

---

## Linting

```bash
npm run lint
```

Runs `expo lint` with ESLint configured via `eslint.config.js`.

---

## Backend Setup (Optional)

The backend is only responsible for authentication, user management, report sync, and notifications. Inference does not depend on the backend.

```bash
cd backend
npm install
cp .env.example .env     # Configure MongoDB URI and JWT secret
npm run dev
```

### Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Authenticate user |
| `/api/auth/register` | POST | Register new user |
| `/api/patients` | GET/POST | Patient CRUD sync |
| `/api/predictions` | POST | Upload prediction result |
| `/api/sync` | POST | Queue synchronization |

---

## Architecture Decisions

- **No Redux** — Zustand is lighter and sufficient for this app's state needs
- **SQLite over AsyncStorage** — Structured data with queries, migrations, and relationships
- **Repository Pattern** — Data access separated from business logic (hooks call repositories)
- **Offline Queue** — Mutations are queued in SQLite and synced when connectivity returns
- **Feature-based component folders** — Components grouped by domain (dashboard, reports, upload, etc.)
- **File-based routing** — expo-router for intuitive navigation structure

---

## Offline Behavior

- Reports, patients, and AI results are stored locally in SQLite
- A sync queue tracks pending mutations (inserts, updates, deletes)
- `useNetwork` hook monitors connectivity via `@react-native-community/netinfo`
- `OfflineBanner` component displays sync status
- Queue automatically processes when internet is restored (with retry logic)

---

## Security

- JWT tokens stored in `expo-secure-store` (Keychain / EncryptedSharedPreferences)
- Biometric authentication via `expo-local-authentication`
- No plain-text passwords stored locally
- All AI inference happens on-device — no MRI data leaves the device
- HIPAA-aligned data handling recommendations in UI

---

## License

Proprietary. All rights reserved.
