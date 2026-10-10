# marcn

shadcn-style React Native components. Plain `StyleSheet`, no styling library.

## Setup

In an Expo / React Native app without a `components.json`, install the native deps first so versions match your Expo SDK:

    npx expo install react-native-svg react-native-reanimated react-native-gesture-handler lucide-react-native

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

`icon`, `text`, `button`, `badge`, `card`, `input`, `textarea`, `label`, `alert`, `skeleton`, `separator`, `avatar`, `switch`, `checkbox`, `radio-group`, `progress`, `collapsible`, `accordion`, `tabs`, `toggle`, `toggle-group`, `slider`, plus the `theme`, `render`, `use-controllable-state` and `slider-math` lib items.

Components are designed to be edited in place: once added, the code is yours.

## The `render` prop

Button, Text, Badge and Card (root) accept `render`, like Base UI: pass an element to swap the underlying component while keeping marcn's styling, accessibility props and handlers, or a function `(props, state) => element`.

    <Button render={(props) => <Link href="/settings" asChild><Pressable {...props} /></Link>}>Settings</Button>
    <Card render={<Animated.View entering={FadeIn} />} />
    <Button render={(props, { pressed }) => <MyPressable {...props} />}>Go</Button>

Merging: the element's own props win; `style` becomes `[marcn, element]`; `onX` handlers run element first, then marcn's (skipped if the event is default-prevented); refs are merged. Children come from the marcn component. With `render`, Button tracks `pressed` via `onPressIn`/`onPressOut`, so the rendered element must forward those to a pressable. In function form, attach `props.ref` yourself. Requires React 19 (`ref` as a prop). expo-router's `Link` renders a `Text` unless `asChild` is set, so wrap a `Pressable` as shown instead of passing `<Link />` directly.

## Form controls

`collapsible`, `accordion`, `tabs`, `toggle`, `toggle-group` and `slider` follow the shadcn/ui prop names (`value`/`defaultValue`/`onValueChange`, `type="single" | "multiple"`, `value: number[]` for Slider). Differences on native: no keyboard or focus navigation, no RTL, `Tabs` `activationMode` is accepted but both modes select on press, and Collapsible animates height with reanimated.

`slider` needs `react-native-gesture-handler`: wrap your app root in `GestureHandlerRootView` (`style={{ flex: 1 }}`). A `render` element on Slider must be a native view that accepts a ref.

## Development

Run `corepack enable` once, then `yarn install` (in the repo root and in `apps/example`). Use `yarn test`, `yarn typecheck`, `yarn registry:validate` and `yarn example:sync`.
