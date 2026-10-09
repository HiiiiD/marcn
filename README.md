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

`icon`, `text`, `button`, `badge`, `card`, `input`, `textarea`, `label`, `alert`, `skeleton`, `separator`, `avatar`, `switch`, `checkbox`, `radio-group`, `progress`, plus the `theme` and `render` lib items.

Components are designed to be edited in place: once added, the code is yours.

## The `render` prop

Button, Text, Badge and Card (root) accept `render`, like Base UI: pass an element to swap the underlying component while keeping marcn's styling, accessibility props and handlers, or a function `(props, state) => element`.

    <Button render={<Link href="/settings" />}>Settings</Button>
    <Card render={<Animated.View entering={FadeIn} />} />
    <Button render={(props, { pressed }) => <MyPressable {...props} />}>Go</Button>

Merging: the element's own props win; `style` becomes `[marcn, element]`; `onX` handlers run element first, then marcn's (skipped if the event is default-prevented); refs are merged. Children come from the marcn component. With `render`, Button tracks `pressed` via `onPressIn`/`onPressOut`, so the rendered element must forward those to a pressable. In function form, attach `props.ref` yourself. Requires React 19 (`ref` as a prop).

## Development

Run `corepack enable` once, then `yarn install` (in the repo root and in `apps/example`). Use `yarn test`, `yarn typecheck`, `yarn registry:validate` and `yarn example:sync`.
