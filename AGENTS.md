# marcn

shadcn-style component registry for React Native. Plain `StyleSheet` (no NativeWind, Tailwind, Unistyles or cva), no primitives library. Consumers install items with `npx shadcn add @marcn/<name>` and then own and edit the code.

## Layout

- `registry.json` lists every item; source lives in `registry/marcn/lib` and `registry/marcn/ui`.
- `tests/` mirrors the registry (`tests/lib`, `tests/ui`); `tests/setup.ts` mocks `useColorScheme`, `react-native-reanimated` and `react-native-worklets`.
- `apps/example` is a showcase app. Its `components/ui` and `lib` are generated and gitignored.
- `docs/` is gitignored on purpose (specs and plans). Never `git add` it.

## Commands

Two separate Yarn Berry projects (root and `apps/example`, each with its own `yarn.lock`). Run `corepack enable` once.

- `yarn test`, `yarn typecheck`, `yarn registry:validate`, `yarn registry:build`
- `yarn example:sync` builds the registry, serves it on 127.0.0.1:4000 and installs every item into `apps/example`. Re-run it after changing `registry/`. Revert the CLI's churn in `apps/example/package.json` and `yarn.lock` instead of committing it.

## Registry rules (enforced by `scripts/validate-registry.js`)

- Registry-internal imports use `@/registry/marcn/<lib|ui>/<name>`; the CLI rewrites them to the consumer's aliases. No relative imports between registry files.
- Every `registryDependencies` entry is `@marcn/<name>` and must cover every registry item the file imports.
- Every npm package a file imports must be in that item's `dependencies` (`react` and `react-native` are always allowed).

## Component conventions

- Styles come from `useStyles(createStyles)` with a module-level `createStyles(theme)`; use theme tokens, not literals.
- Variants are typed style maps (`variant`, `size`).
- Set accessibility props by hand. Alert and Progress views set `accessible`; the RadioGroup container deliberately does not (it would swallow its radios).
- Spread the caller's props last; merge `style` as `[base, variant, style]`.
- String/number children are wrapped in `Text`. Components that restyle child text (Button, Badge, AvatarFallback) provide `TextStyleContext`.
- A new item needs a `registry.json` entry, a test file, and a README mention.

## The `render` prop

Components that render a single host element (Button, Text, Badge, Card root) accept `render?: RenderProp<HostProps, State>` (an element or `(props, state) => element`) and a typed `ref`.

- Build the props (style, accessibility props, handlers, children), then `return renderElement(HostComponent, render, props, state)` from `@/registry/marcn/lib/render`. Add `@marcn/render` to the item's `registryDependencies`.
- Keep `TextStyleContext.Provider` outside the `renderElement` call.
- Merge rules live in `mergeProps`: the element's props win, except `style` (`[marcn, element]`, function styles stay functions), `on*` handlers (element first, then marcn's, skipped if the event is default-prevented unless listed in `always`), `ref` (merged, stable identity) and `children` (always marcn's). `undefined` element props are ignored.
- State that `Pressable` would normally provide (Button's `pressed`) must be tracked by the component on the `render` path, because the rendered element may not accept function styles. Keep the default path unchanged.
- Tests: element form, function form (props and state), ref reaching the host, and `TextStyleContext` inheritance. Do not add an `asChild` prop; `render` is the only mechanism.

## Testing notes

- RNTL v13: `getByRole` only matches accessible elements; pass `{ includeHiddenElements: true }` for views hidden from accessibility.
- Type `jest.fn` mocks with a parameter if you read `mock.calls[0][0]` (TypeScript 6).

## Git

- No `Co-Authored-By` or Claude/Anthropic trailer in commit messages.
- Commit only intended files; untracked tool leftovers such as `apps/example/.claude/` stay out.
- Keep comments minimal (why-only) and split files over about 300 lines.
- `lucide-react-native` is capped at `^1.53.0` in both `package.json` files because of the Yarn age gate on 1.54.0.
