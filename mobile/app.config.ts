import type { ExpoConfig } from "expo/config"

const config: ExpoConfig = {
  name: "ESTHETIQUE",
  slug: "canned-clothing-mobile",
  scheme: "cannedclothing",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  splash: {
    backgroundColor: "#060a06",
  },
  ios: { supportsTablet: false },
  android: {},
  web: {
    bundler: "metro",
  },
  plugins: ["expo-router"],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  },
}

export default config

