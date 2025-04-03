# Thalia - Your Story Companion

Thalia is a mobile application that helps users create and manage AI-generated stories. This React Native application uses Expo for cross-platform compatibility.

## Features

- Create AI-generated stories from text prompts
- Track story generation progress in real-time
- Listen to audio versions of stories
- User account management (login, signup, profile)
- Password reset functionality
- Dark/light theme support
- Multilingual support (English and Turkish)
- Favorite stories
- Share stories

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or newer)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/)
- For mobile testing:
  - [Expo Go](https://expo.dev/client) app on your iOS or Android device, or
  - iOS Simulator (macOS only) or Android Emulator

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd ThaliaFrontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   Create a `.env` file in the root directory with the following variables:

   ```env
   EXPO_PUBLIC_BACKEND_URL=http://your-backend-url:8000
   EXPO_PUBLIC_WEBSOCKET_URL=ws://your-backend-url:8000/ws
   ```

   Replace `your-backend-url` with the actual URL of your backend server.

## Running the Application

### Development Mode

To start the development server:

```bash
npx expo start
```

This will start the Expo development server and provide you with a QR code. You can:

- Scan the QR code with the Expo Go app on your mobile device
- Press `a` in the terminal to open the app in an Android emulator
- Press `i` in the terminal to open the app in an iOS simulator (macOS only)
- Press `w` to open the app in a web browser (limited functionality)

### Building for Production

For Android:

```bash
eas build -p android --profile preview
```

For iOS:

```bash
eas build -p ios --profile preview
```

For detailed instructions on building, refer to the [Expo Application Services documentation](https://docs.expo.dev/build/setup/).

## Project Structure

```plaintext
ThaliaFrontend/
├── assets/               # Images, fonts, etc.
├── components/           # Reusable UI components
├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── locales/              # Translation files
├── pages/                # Application screens organized by feature
│   ├── home/             # Home page components
│   ├── library/          # Library page components
│   ├── login/            # Authentication components
│   └── profile/          # User profile components
├── utils/                # Utility functions and configuration
├── App.js                # Main application component
└── index.js              # Entry point
```

## Troubleshooting

- **WebSocket connection issues**: Ensure your backend server is running and the WebSocket URL is correct in your environment variables.
- **Authentication errors**: Check that your backend authentication endpoints are configured correctly.
- **Expo build errors**: Refer to the [Expo documentation](https://docs.expo.dev/troubleshooting/build-errors/) for common build issues.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [i18next](https://www.i18next.com/) for internationalization
- All other open-source libraries used in this project
