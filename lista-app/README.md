# lista-app

A personal, fully offline shopping-list app for React Native (Expo) — swipe through a categorized product catalog to build your shopping list.

## Built with AI — spec-driven development

This project is built through **spec-driven development with Claude Code**. The owner does not write code by hand here: features start as a written spec/prompt, and Claude Code implements them end to end. The original spec lives at [`specs/plan-implementacion-app-lista.md`](../specs/plan-implementacion-app-lista.md), and the working instructions for the AI agent are in [`CLAUDE.md`](./CLAUDE.md) and [`AGENTS.md`](./AGENTS.md). Any change to this app should keep going through that process rather than manual edits.

## Introduction

The goal of this app is to make grocery shopping faster and less annoying: instead of typing out a list, you swipe (Tinder-style) through a catalog of products grouped by category to quickly build a shopping list, then use that list while you're at the store — checking items off, tracking what you buy most often, and picking up where you left off across multiple trips. It's designed to work fully offline, with everything stored locally on the device.

The app's UI and content are in **Spanish**, since it's built for the owner's personal, everyday use rather than for public distribution.

## Main features

- **Swipe to build a list** — swipe through the product catalog, organized by category, to quickly add items to your active shopping list.
- **Manual add** — add a product (and even a new category) that isn't already in the catalog.
- **Shopping list view** — see your list grouped by category, check items off as you buy them, remove items, and finish the trip when done.
- **Multiple active lists + history** — start and manage several shopping lists at once, and revisit or reactivate a finished list from history.
- **Purchase frequency tracking** — items you buy more often are prioritized, so your most-used products surface first.
- **Fully offline** — no account, no server, no internet connection required; everything is stored locally.

## Tech stack

- **Expo / React Native** (TypeScript) — cross-platform app, SDK 57
- **AsyncStorage** — all data persisted locally on-device, no backend/server
- **react-native-gesture-handler** + **react-native-reanimated** — native swipe gestures
- **lucide-react-native** — icon set

## Build & run

Requirements: Node.js and npm.

```bash
npm install
```

Then, depending on the platform:

```bash
npm start       # Expo dev server (scan QR with Expo Go / dev client)
npm run android # build & run on a connected Android device/emulator
npm run ios     # build & run on iOS simulator/device
npm run web     # run in the browser
```
