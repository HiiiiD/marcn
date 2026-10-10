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

`icon`, `text`, `button`, `badge`, `card`, `input`, `textarea`, `label`, `alert`, `skeleton`, `separator`, `spinner`, `empty`, `item`, `avatar`, `switch`, `checkbox`, `radio-group`, `progress`, `collapsible`, `accordion`, `tabs`, `toggle`, `toggle-group`, `slider`, `dialog`, `popover`, `sheet`, `alert-dialog`, `tooltip`, `dropdown-menu`, `context-menu`, `select`, `combobox`, `calendar`, `date-picker`, `input-otp`, `field`, `sonner`, plus the `theme`, `render`, `use-controllable-state`, `slider-math`, `calendar-math`, `calendar-styles`, `calendar-range-drag`, `calendar-month`, `calendar-picker`, `portal`, `overlay`, `overlay-root`, `popover-position`, `back-stack`, `use-presence`, `use-keyboard-inset`, `use-anchored-position`, `menu-item`, `menu-surface`, `menu-parts`, `combobox-filter`, `combobox-state`, `combobox-popup`, `combobox-input`, `combobox-chips`, `combobox-list`, `otp-state`, `otp-caret`, `toast-store`, `toast-stack`, `use-toast-timer`, `toast-view` and `toast-layer` lib items.

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

## Calendar

`calendar` takes `mode="single" | "multiple" | "range"` with `selected`/`defaultSelected`/`onSelect` (`Date`, `Date[]`, `{ from, to }`), controllable `month`/`onMonthChange`, `startMonth`/`endMonth` bounds, `disabled` matchers (`Date`, `{ before }`, `{ after }`, `{ from, to }`, `{ dayOfWeek }`, a function, or an array of them), `weekStartsOn`, `showOutsideDays`, `fixedWeeks`, `numberOfMonths` and `captionLayout="label" | "dropdown"`.

Differences from shadcn/ui on native:
- `captionLayout="dropdown"` makes the caption tappable and swaps the grid for an inline month picker, with a year picker one tap further. It does not use native selects.
- `numberOfMonths > 1` stacks the months vertically, steps one month per arrow, and hides outside days.
- In range mode, after the first tap you can also press and drag across the grid (any direction, across months), then release on the end day. While a range start is pending the calendar claims every touch on its grid, so it will not scroll a parent `ScrollView` and taps are resolved by hit-testing; the arrows and the rest of the screen are unaffected, and the claim ends once the range is complete.
- Month and weekday names come from `Intl` via `locale` (Hermes ships Intl in current React Native). `weekStartsOn` is not derived from the locale.

## Date Picker

`date-picker` is the shadcn/ui Date Picker recipe as one component: an outline `Button` (calendar icon plus the formatted date, or `placeholder`) that opens a `Calendar` in a `Popover`, so it needs `PortalHost` like the other overlays.

```tsx
<DatePicker selected={date} onSelect={setDate} />
<DatePicker mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
```

- `mode="single"` (default) or `"range"` with `selected`/`defaultSelected`/`onSelect`; the other Calendar props (`locale`, `disabled`, `startMonth`/`endMonth`, `captionLayout`, ...) are forwarded. Passing `selected` makes it controlled even while it is `undefined`, so `useState<Date>()` works and setting it back to `undefined` clears the label. `mode="multiple"` is not supported.
- The label uses `Intl` with `locale` (`dateStyle: 'long'`, ranges as `Jan 20, 2024 – Feb 09, 2024`); pass `formatDate` to override.
- The popover closes when a date is picked, or when a range has both ends; set `closeOnSelect={false}` to keep it open. `open`/`defaultOpen`/`onOpenChange` control it, `side`/`align`/`sideOffset`/`alignOffset` place it, `contentStyle` styles it.
- `style`, `ref` and `testID` go to the trigger. Use `triggerDisabled` to disable it (`disabled` is the Calendar's day matcher).
- The calendar opens on the selected month each time.

## Overlays

`dialog`, `popover` and `sheet` render through a JS portal so they can stack (for example a Dialog opened from a Sheet). Mount `PortalHost` once at your app root; it also provides the `GestureHandlerRootView` that `slider` and `sheet` need and a `SafeAreaProvider` (`react-native-safe-area-context`) so overlays keep clear of the status bar, gesture bar and, on Android, the navigation bar under the keyboard:

    import { PortalHost } from '@/lib/portal';

    export default function App() {
      return <PortalHost>{/* your app */}</PortalHost>;
    }

Without a host, overlays render nothing and log a dev warning. Overlays follow the shadcn/ui prop names (`open`/`defaultOpen`/`onOpenChange`). Differences on native: no react-native-web support and no Tab-key focus trap. Screen-reader focus is contained to the topmost modal layer, moves into the overlay on open and back to the trigger on close; Android back and the iOS accessibility escape gesture dismiss the topmost layer. `Popover` is non-modal by default (`modal` adds a scrim and contains focus), positions with `side`/`align`/offsets and flips or clamps near screen edges (`collisionPadding`). `Sheet` supports `side` and `snapPoints` (fractions of the window, pixels, or `'auto'` to fit the content, measured once on open; `snapIndex`/`defaultSnapIndex`/`onSnapIndexChange` pick the current one). The body drags too (`dragBody`, on by default): use `SheetScrollView`/`SheetFlatList` for lists inside a sheet so a downward drag hands over to the sheet once the list is at its top (for other list libraries pass `SheetScrollView` as their scroll component, e.g. FlashList's `renderScrollComponent={SheetScrollView}`; anything else needs `dragBody={false}`). Dragging snaps between the snap points, stretches with a spring-back past the largest, and dismisses when pulled down from the smallest. With several snap points the handle is an `adjustable` for screen readers (increment/decrement steps between them). Dialog and Sheet lift above the keyboard; Popover repositions around it. Compose `SheetClose` for a close button; Dialog has a built-in corner close (`showCloseButton`).

## Menus, Select, Tooltip and Alert Dialog

`dropdown-menu`, `select`, `tooltip` and `alert-dialog` use the same `PortalHost` as the other overlays. `DropdownMenu` and `Select` open an anchored, scrollable list under the trigger (flipping or clamping near screen edges). Items follow shadcn names: `DropdownMenuItem` (`variant="destructive"`, `onSelect` with `event.preventDefault()` to keep the menu open), `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`/`DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`. Sub-menus (`DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`) open as a second layer; selecting a nested item closes the whole menu. `ContextMenu` opens on a long press of `ContextMenuTrigger`, anchored at the touch point (flipping or clamping near screen edges), and shares its item components with `DropdownMenu`; it has no sub-menus. The trigger also exposes an "Open menu" accessibility action that anchors the menu to the trigger, for screen-reader users who cannot long-press precisely. `Select` takes `value`/`defaultValue`/`onValueChange`; give `SelectItem` a string child (or `label`) so `SelectValue` can show it while the list is closed.

Differences on native: `Tooltip` opens on long press (there is no hover) and closes `duration` ms (default 2000) after release; `AlertDialog` ignores backdrop taps, focuses `Cancel` first, and closes on Android back; `Select` is a popover-style list rather than item-aligned and does not scroll to the selected item; there is no typeahead or keyboard navigation.

`combobox` follows the Base UI version of shadcn's Combobox: the text input is the control. `<Combobox items={...}>` holds `ComboboxInput` (an inline field; `showTrigger` chevron on by default, `showClear` off) and `ComboboxContent` with `ComboboxEmpty` and `ComboboxList`. Typing, focusing or tapping the input opens a popup anchored to it and filters the list; picking fills the input and closes. Items are strings, `{ value, label?, disabled?, keywords? }` (extra fields reach the list's render function, `<ComboboxList>{(item) => <ComboboxItem value={item.value}>...</ComboboxItem>}</ComboboxList>`; without one it renders a row per item) or groups `{ value, items }` (the default list draws a label per group; custom lists use `ComboboxGroup`, `ComboboxLabel`, `ComboboxCollection`, `ComboboxSeparator`). For `multiple`, replace the input with `ComboboxChips` holding `ComboboxValue` (render a `ComboboxChip value=...` per selected option) and `ComboboxChipsInput`; picking toggles, clears the typed text and keeps the popup open, and Backspace on an empty input removes the last chip. It takes `value`/`defaultValue`/`onValueChange` (`string | null`, or `string[]` with `multiple`), `inputValue`/`defaultInputValue`/`onInputValueChange`, `open`/`onOpenChange` and `filter` (default: case- and accent-insensitive match on label and keywords; `null` to filter the items yourself). Only text you typed filters, so opening with the selected label showing lists everything, and emptying the text clears a single value. Enter picks the first enabled match. On mobile the popup has no scrim but a backdrop with a hole over the input, sits above the input when the keyboard leaves no room below, and the list keeps taps working while the keyboard is up; Android Back hides the keyboard first, then the popup. The screen's ScrollView needs `keyboardShouldPersistTaps="handled"`, otherwise the first tap on the chevron, clear or chip buttons only hides the keyboard. `disabled` goes on `Combobox` (or on `ComboboxInput`). Not ported: the input-inside-popup layout, arrow-key highlight, `autoHighlight`, `inline`/`grid`/virtualized lists.

## Input OTP

`input-otp` follows shadcn/ui (`InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`): `maxLength`, `value`/`defaultValue`/`onChange`, `onComplete`, `pattern` (a single-character RegExp, digits by default). A transparent `TextInput` sits over the slots, so paste and SMS autofill (`oneTimeCode`) work; `inputRef` reaches it and `ref` reaches the container. The caret is always at the end (no mid-code editing) and slots are bordered individually. Every part accepts `render`.

## Field

`field` follows shadcn/ui (`Field`, `FieldGroup`, `FieldSet`, `FieldLegend`, `FieldLabel`, `FieldDescription`, `FieldError`) and only lays things out: `orientation="vertical" | "horizontal"` (use horizontal for checkbox and switch rows) and `invalid`/`disabled`, which tint and dim `FieldLabel`. Controls are not wired automatically; pass `aria-invalid` and `disabled` to the control yourself, or read them with `useField()`. `FieldError` takes `message` or children and renders nothing when empty. `Field` accepts `render`.

## Spinner, Empty, Item

These follow shadcn/ui. `Spinner` is a rotating `Loader2` icon (16px) that takes its color from a parent `TextStyleContext`, so it matches Button text. `Empty` has no border by default, as in shadcn; pass `style={{ borderWidth: 1 }}` for the dashed outline. `Item` is not pressable by itself: use `render={<Pressable onPress={...} />}`. Icons inside `EmptyMedia`/`ItemMedia` need an explicit `size` (24 and 16 in shadcn).

## Toasts

`sonner` follows Sonner: mount `<Toaster position="top" | "bottom" visibleToasts={3} duration={4000} />` once inside `PortalHost`, then call `toast('Saved')` from anywhere, including outside React. `toast.success/error/info/warning/loading`, `toast.custom((id) => <View />)`, `toast.promise(promise, { loading, success, error })` and `toast.dismiss(id?)` are available; options are `description`, `duration` (`Infinity` to persist), `dismissible`, `action`, `cancel`, `onDismiss`, `onAutoClose`. Passing an existing `id` updates that toast in place.

Differences on native: toasts stack newest-in-front; tap the stack to expand it and tap again to collapse (it also collapses after 5 s idle). Timers pause while a toast is touched or the stack is expanded. Swipe toward the screen edge or sideways to dismiss. There is no per-toast position and no hover behavior. The toast layer keeps the stacking position it got when the first toast appeared: a toast fired while a modal is open (and no toasts were showing) appears above it, but while toasts are already showing, new ones sit under a modal opened later until it closes.

## Development

Run `corepack enable` once, then `yarn install` (in the repo root and in `apps/example`). Use `yarn test`, `yarn typecheck`, `yarn registry:validate` and `yarn example:sync`.
