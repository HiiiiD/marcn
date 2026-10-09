# marcn

shadcn-style React Native components. Plain `StyleSheet`, no styling library.

## Install

Add the registry to your `components.json`:

    "registries": { "@marcn": "https://<host>/{name}.json" }

Then:

    npx shadcn add @marcn/button

Components install with a shared `theme.ts` in your `lib` alias. Edit its tokens to restyle every component.

## Components

`icon`, `text`, `button`, `badge`, `card`, `input`, `textarea`, `label`, `alert`, `skeleton`, `separator`, `avatar`, `switch`, `checkbox`, `radio-group`, `progress`, plus the `theme` lib item.

Components are designed to be edited in place: once added, the code is yours.
