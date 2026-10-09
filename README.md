# marcn

shadcn-style React Native components. Plain `StyleSheet`, no styling library.

## Setup

In an Expo / React Native app without a `components.json`, install the native deps first so versions match your Expo SDK:

    npx expo install react-native-svg react-native-reanimated lucide-react-native

Add `"@/*"` to `compilerOptions.paths` in `tsconfig.json`:

    "paths": { "@/*": ["./*"] }

Create `components.json` at the app root:

    {
      "$schema": "https://ui.shadcn.com/schema.json",
      "style": "new-york",
      "rsc": false,
      "tsx": true,
      "tailwind": { "config": "", "css": "", "baseColor": "neutral", "cssVariables": false },
      "aliases": {
        "components": "@/components",
        "ui": "@/components/ui",
        "lib": "@/lib",
        "utils": "@/lib/utils",
        "hooks": "@/hooks"
      },
      "registries": { "@marcn": "https://<host>/{name}.json" }
    }

## Install

Add the registry to your `components.json`:

    "registries": { "@marcn": "https://<host>/{name}.json" }

Then:

    npx shadcn add @marcn/button

Components install with a shared `theme.ts` in your `lib` alias. Edit its tokens to restyle every component.

## Components

`icon`, `text`, `button`, `badge`, `card`, `input`, `textarea`, `label`, `alert`, `skeleton`, `separator`, `avatar`, `switch`, `checkbox`, `radio-group`, `progress`, plus the `theme` lib item.

Components are designed to be edited in place: once added, the code is yours.

## Development

Run `corepack enable` once, then `yarn install` (in the repo root and in `apps/example`). Use `yarn test`, `yarn typecheck`, `yarn registry:validate` and `yarn example:sync`.
