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

`icon`, `text`, `button`, `badge`, `card`, `input`, `textarea`, `label`, `alert`, `skeleton`, `separator`, `avatar`, `switch`, `checkbox`, `radio-group`, `progress`, `collapsible`, `accordion`, `tabs`, `toggle`, `toggle-group`, `slider`, `dialog`, `popover`, `sheet`, `alert-dialog`, `tooltip`, `dropdown-menu`, `select`, plus the `theme`, `render`, `use-controllable-state`, `slider-math`, `portal`, `overlay`, `overlay-root`, `popover-position`, `back-stack`, `use-presence`, `use-keyboard-inset`, `use-anchored-position`, `menu-item` and `menu-surface` lib items.

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

## Overlays

`dialog`, `popover` and `sheet` render through a JS portal so they can stack (for example a Dialog opened from a Sheet). Mount `PortalHost` once at your app root; it also provides the `GestureHandlerRootView` that `slider` and `sheet` need and a `SafeAreaProvider` (`react-native-safe-area-context`) so overlays keep clear of the status bar, gesture bar and, on Android, the navigation bar under the keyboard:

    import { PortalHost } from '@/lib/portal';

    export default function App() {
      return <PortalHost>{/* your app */}</PortalHost>;
    }

Without a host, overlays render nothing and log a dev warning. Overlays follow the shadcn/ui prop names (`open`/`defaultOpen`/`onOpenChange`). Differences on native: no react-native-web support and no Tab-key focus trap. Screen-reader focus is contained to the topmost modal layer, moves into the overlay on open and back to the trigger on close; Android back and the iOS accessibility escape gesture dismiss the topmost layer. `Popover` is non-modal by default (`modal` adds a scrim and contains focus), positions with `side`/`align`/offsets and flips or clamps near screen edges (`collisionPadding`). `Sheet` supports `side` and `snapPoints` (fractions of the window or pixels; `snapIndex`/`defaultSnapIndex`/`onSnapIndexChange` pick the current one). Dragging its handle snaps between them, stretches with a spring-back past the largest, and dismisses when pulled down from the smallest. With several snap points the handle is an `adjustable` for screen readers (increment/decrement steps between them). Dialog and Sheet lift above the keyboard; Popover repositions around it. Compose `SheetClose` for a close button; Dialog has a built-in corner close (`showCloseButton`).

## Menus, Select, Tooltip and Alert Dialog

`dropdown-menu`, `select`, `tooltip` and `alert-dialog` use the same `PortalHost` as the other overlays. `DropdownMenu` and `Select` open an anchored, scrollable list under the trigger (flipping or clamping near screen edges). Items follow shadcn names: `DropdownMenuItem` (`variant="destructive"`, `onSelect` with `event.preventDefault()` to keep the menu open), `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`/`DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`. Sub-menus (`DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`) open as a second layer; selecting a nested item closes the whole menu. `Select` takes `value`/`defaultValue`/`onValueChange`; give `SelectItem` a string child (or `label`) so `SelectValue` can show it while the list is closed.

Differences on native: `Tooltip` opens on long press (there is no hover) and closes `duration` ms (default 2000) after release; `AlertDialog` ignores backdrop taps, focuses `Cancel` first, and closes on Android back; `Select` is a popover-style list rather than item-aligned and does not scroll to the selected item; there is no typeahead or keyboard navigation.

## Development

Run `corepack enable` once, then `yarn install` (in the repo root and in `apps/example`). Use `yarn test`, `yarn typecheck`, `yarn registry:validate` and `yarn example:sync`.
