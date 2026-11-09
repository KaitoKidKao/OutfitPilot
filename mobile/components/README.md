# OutfitPilot mobile: shared foundation API

Read this before you build a screen. The design rules come from `DESIGN.md` (repo root).
This file only covers the code. Imports use the `@/` alias, which points at `mobile/`.

## Ground rules

- Use `AppText` for all text. Never use raw `<Text>`, because only `AppText` applies the Inter weights, Dynamic Type caps and the bilingual helper line.
- Take colours only from `colors` / `alpha` in `@/lib/theme`. Do not add hex values.
- Each screen gets one lime action, and that is normally the **dock centre**. `Button variant="next"` is only for a next action that sits outside the dock, such as the retry in an error state.
- Every control needs an `accessibilityLabel`. Touch targets are already `MIN_TARGET` (44 pt on iOS, 48 dp on Android).
- Do not use `useReducedMotion()` checks for layout. The components already turn their animations off when reduced motion is on.
- Do not import `@/lib/decart`, `@/lib/useCamera`, `@/lib/useAppStateGuard` or `@livekit/*` in screens. Go through `@/lib/tryOnSession` and `<TryOnVideo />`. These files are frozen: `lib/decart.ts`, `lib/useCamera.ts`, `lib/useAppStateGuard.ts`, `lib/api.ts`, `livekit-bootstrap.ts`, `app/dev/tryon.tsx`.
- Do not fake AI output:
  - The status reads "AI OFF / preview only" until `tryOn.aiLive` is true.
  - Picks with `source === "fallback"` are labelled with `SOURCE_LABEL.fallback`, never as AI.
  - Make no size or fit claims.

## Tokens: `@/lib/theme`

| Export | Contents |
|---|---|
| `colors` | `paper surface surfaceDeep line ink inkWell inkLine muted mutedDark lime limePress limeSoft limeInk studio danger dangerSoft` |
| `alpha` | `studioOverlay` (status pill / round buttons over video), `studioPanel`, `paper90` (Sample tag), `paper0`, `studio0` (scrim ends), `backdrop`, `paper12` |
| `radii` | `sm 12, md 14, lg 16, xl 18, xxl 20, card 22, hero 24, dock 30, full` |
| `spacing` | `gutter 20, gap 10, stack 16, section 28, dockClearance 168, dockInset 16` |
| `sizes` | `minTarget, topBar 56, dockCenter 64, dockHook 76, dockPadding 10, hookThumb {44,56}, hookRail {24,3}, maxContentWidth 440, dashedBorder 1.5` |
| `MIN_TARGET` | 44 (iOS) or 48 (Android) |
| `typeRamp` | `display headline title topBar section body bodyStrong bodySm caption label button tag studioNumeral studioSeconds`. Each entry is `{fontSize, weight, lineHeight?, letterSpacing? (pt), tabular?, maxScale}` |
| `shadowDock`, `shadowLift`, `shadows` | iOS `shadow*`, Android `elevation`, web `boxShadow`. Use them only on floating things: the dock, toasts, cards over video, and the selected segment |
| `motion` | `easing` (`Easing.bezier(0.16,1,0.3,1)`), `duration {color 200, rise 360, wipe 480, count 1000, hang 520}`, `pressScale 0.96`, `autoCompareMs 8000` |
| `type` | Legacy flat styles for the dev harness. Do not use them in new UI |

Fonts (`@/lib/fonts`): `fontStyle(weight: 400|500|600|700|800)` returns `{fontFamily}` when Inter is loaded, or `{fontWeight}` for the system font. Call it at render time, never inside a module-level `StyleSheet`. `AppText` / `textStyle()` already do this.

## UI kit: `@/components/ui`

```tsx
import { AppText, BrandMark, Button, Chip, ChipGroup, GarmentImage, IconButton, SampleTag,
  Screen, StatusPill, TopBar, Touchable, useDockClearance, useToast, textStyle } from "@/components/ui";
```

### `AppText`

```tsx
<AppText variant="headline" helper="Bạn chuẩn bị cho dịp nào?">What's the occasion?</AppText>
<AppText variant="bodySm" tone="muted" helper="Gợi ý mặc định" helperInline>Default suggestion</AppText>
```

Props: all `TextProps`, plus:

- `variant?: TypeVariant`. Default `"body"`.
- `tone?: "ink"|"muted"|"paper"|"mutedDark"|"lime"|"limeInk"|"danger"`. Default `"ink"`.
- `weight?: 400|500|600|700|800`
- `align?`
- `tabular?`
- `helper?: string`: the Vietnamese line, shown smaller and muted.
- `helperInline?`: puts the helper on the same line after " · ".
- `helperTone?`: defaults to `muted`, or `mutedDark` when `tone="paper"`.
- `helperVariant?`: default `"bodySm"`.
- `containerStyle?`: styles the wrapper View that holds a stacked helper.

Behaviour:

- `display`, `headline` and `title` automatically get `accessibilityRole="header"`.
- `allowFontScaling` is on. `maxFontSizeMultiplier` defaults to the variant's `maxScale`, which is never below 1.3 except for the studio numerals.

`textStyle(variant, weight?, tabular?)` returns the resolved `TextStyle`, for the rare case where you need it.

### `Button`

```tsx
<Button label="Try again" variant="next" icon={RotateCcw} onPress={retry} loading={busy} />
```

- `label`, `onPress`
- `variant?`: default `"quiet"`.
  - `"next"` or `"lime"`: lime, 48 tall
  - `"ink"`: ink, 52 tall
  - `"quiet"`: surface, 44/48 tall
  - `"ghost"`: transparent
  - `"onDark"`: white pill, for the studio
  - `"danger"`: surface with danger text, presses to danger-soft
- `icon?: LucideIcon`, `iconPosition?: "left"|"right"`
- `loading?`, `loadingLabel?`, `disabled?`. These set `accessibilityState.disabled` and `busy`.
- `fullWidth?`, `accessibilityLabel?`, `accessibilityHint?`, `style?`, `testID?`

Press feedback is a 200 ms colour ease.

### `IconButton`

```tsx
<IconButton icon={SwitchCamera} accessibilityLabel="Flip camera" variant="onDark" onPress={tryOn.flip} />
```

- `icon`, `accessibilityLabel` (required), `onPress`
- `variant?: "ghost"|"quiet"|"onDark"`
- `disabled?`, `selected?`, `iconSize?` (default 22), `accessibilityHint?`, `style?`

The button is a 44/48 square. It has radius 14, or is a circle for `onDark`. The icon stroke is 1.75.

### `Screen`

```tsx
<Screen header={<TopBar title="AI Picks" />} overlay={<FittingDock … />}>…content…</Screen>
```

- `tone?: "light"|"dark"`: default light. Dark gives the studio background and a light status bar.
- `scroll?`: default true.
- `dockClearance?`: default true. It pads the bottom by 168 + the bottom inset.
- `header?`: pinned above the scroll area.
- `overlay?`: an absolute layer for the dock and sheets.
- `gutter?`: default true (20 pt).
- `safeTop?`: default true.
- `contentStyle?`, `scrollRef?`, `testID?`

The content column has a max width of 440 and is centred. `useDockClearance()` returns `168 + insets.bottom` for custom layouts.

### `TopBar`

```tsx
<TopBar title="Camera setup" right={<Button label="Saved 2" onPress={open} />} />
<TopBar left={<BrandMark />} showBack={false} />
<TopBar tone="dark" onBack={exit} backLabel="Exit fitting room" right={<Button variant="onDark" label="Finish" onPress={finish} />} />
```

- `title?`, `onBack?` (default `router.back()`)
- `showBack?`: default `router.canGoBack() || !!onBack`
- `backLabel?`: default "Back"
- `left?`, `right?`, `tone?`

The bar is 56 tall with a 44/48 back button. The system back gesture and the Android Back button are never blocked.

### `BrandMark`

`<BrandMark showName? />` shows the "OP" lime-on-ink mark next to the "OutfitPilot" wordmark. It is announced as a header.

### `Chip` and `ChipGroup`

```tsx
<ChipGroup accessibilityLabel="Style">
  {STYLE_OPTIONS.map(s => <Chip key={s.value} label={s.label} helper={s.labelVi}
    selected={style === s.value} onPress={() => setStyle(s.value)} />)}
</ChipGroup>
```

`Chip` props:

- `label`, `selected`, `onPress`
- `helper?`: spoken. It is also shown inline when `showHelper` is set.
- `disabled?`, `icon?`
- `role?: "radio"|"checkbox"|"button"`: default `"radio"`. It sets `accessibilityState.selected`, plus `checked` for radio and checkbox.

Chips are 44/48 tall with radius 14. A selected chip is ink with a check icon. Chips never turn lime.

`ChipGroup` has `radiogroup` semantics and wraps its chips.

### `StatusPill`

```tsx
<StatusPill label={tryOn.statusLabel} dot={tryOn.aiLive ? "live" : tryOn.cameraStatus === "on" ? "on" : "off"}
  ai={tryOn.aiLive ? "live" : "off"} aiLabel={tryOn.aiLive ? undefined : "AI OFF · preview only"} />
```

- `label`
- `dot?: "live"|"on"|"off"|"warn"`: lime, paper, muted-dark or danger.
- `ai?: "off"|"live"|null`
- `aiLabel?`, `style?`

It is a dark translucent pill with a polite live region.

### `SampleTag`

`<SampleTag label?="Sample" on?="photo"|"surface" />`. `GarmentImage` already shows it for you.

### `GarmentImage`

```tsx
<GarmentImage garmentId={rec.garmentId} />                         // 4:5, radius 20, Sample tag
<GarmentImage garmentId={id} width={56} radius={12} showSampleTag={false} />
<GarmentImage garmentId={null} emptyLabel="Empty" />               // dashed empty frame
```

- `garmentId: GarmentId | null | undefined`
- `width?`: default "100%".
- `aspectRatio?`: default 4/5.
- `radius?`: default 20.
- `showSampleTag?`: default true.
- `emptyLabel?`, `emptyTone?: "light"|"dark"`, `accessibilityLabel?`
- `children?`: an overlay layer, for example a slot badge positioned absolute.
- `style?`

It uses expo-image with `contentFit="cover"` and shows the surface colour while loading.

### `Touchable`

This is the base pressable for custom tappable surfaces such as occasion cards. It takes all `PressableProps`, plus:

- `bg?`
- `pressedBg?`
- `pressScale?`: use `motion.pressScale` (0.96) for dock-like controls only.
- `style?`

It eases the colour over 200 ms. Under reduced motion the change is instant and there is no scale. You still pass the a11y props yourself:

```tsx
<Touchable accessibilityRole="radio" accessibilityState={{ selected, checked: selected }}
  accessibilityLabel={`${o.label}, ${o.labelVi}`} bg={colors.paper} pressedBg={colors.surface}
  onPress={() => setOccasion(o.id)} style={{ borderRadius: radii.xxl, borderWidth: 1, borderColor: selected ? colors.ink : colors.line, padding: 18 }}>
```

### `useToast()`

- `toast.show(message, { durationMs?: number (default 2600), announcement?: string })`
- `toast.hide()`

The toast is an ink pill at the top under the safe area. It rises in over 360 ms and is announced through `AccessibilityInfo.announceForAccessibility`. A new toast replaces the current one. `ToastProvider` is already mounted in `app/_layout.tsx`.

## `@/components/FittingDock`

```tsx
import { FittingDock, DOCK_BODY_HEIGHT, type DockSlot } from "@/components/FittingDock";

// 1 Choose Occasion: empty hooks, lime "Style me"
<FittingDock hooks={[null, null]} center={{ label: "Style me", accessibilityLabel: "Style me: get two picks", icon: Sparkles, tone: "lime", onPress, disabled: !occasionId }} />
// 2 AI Picks / 3 Setup: hooks hold the picks
<FittingDock hooks={hookIds} lit={activeLook} onHookPress={setActiveLook} center={{ label: "Set up camera", accessibilityLabel: "Set up camera", icon: Camera, tone: "lime", onPress }} />
// 4 Live Fitting Room: switch mode, dark scrim, Auto compare / Stop
<FittingDock mode="switch" scrim="dark" hooks={hookIds} lit={activeLook} onSelect={showLook} hooksDisabled={tryOn.state === "switching"}
  center={autoRunning ? { label: "Stop", accessibilityLabel: "Stop auto compare", icon: Square, tone: "light", onPress: stopAuto }
                      : { label: "Auto compare", accessibilityLabel: "Auto compare every 8 seconds", icon: Repeat, tone: "lime", onPress: startAuto }}
  above={<ProgressBar … />} />
// 5 Final Look: keep mode (both hooks become lime "Keep A" / "Keep B")
<FittingDock mode="keep" hooks={hookIds} onKeep={(slot) => keepLook(slot)} center={{ label: "Start over", accessibilityLabel: "Start over", icon: RotateCcw, tone: "quiet", onPress: restart }} />
```

Props:

- `mode?: "display"|"switch"|"keep"`: default `"display"`.
- `hooks: readonly [GarmentId|null, GarmentId|null]`
- `lit?: "a"|"b"|null`: the lit (lime) hook in display and switch modes. Keep mode lights both hooks.
- `onHookPress?(slot)`: display mode. Without it, the hooks are not buttons.
- `onSelect?(slot)`: switch mode. It sets `accessibilityState.selected` on the lit hook.
- `onKeep?(slot)`: keep mode.
- `hooksDisabled?`
- `center: DockCenter`, where `DockCenter` is:
  - `label?`
  - `accessibilityLabel` (required)
  - `accessibilityHint?`
  - `icon?: LucideIcon`
  - `tone: "lime"|"light"|"quiet"`
  - `onPress`
  - `disabled?`
  - `loading?`
- `above?: ReactNode`: a slot above the dock body, with a gap of 10.
- `scrim?: "light"|"dark"|"none"`: default light. It is a gradient behind the dock.
- `hookLabels?: {a, b}`: default "Look A" / "Look B".
- `testID?`

Layout and behaviour:

- Render the dock inside `<Screen overlay>`. It positions itself absolute at the bottom, `insets.bottom + 16` up, with a max width of 440 plus 16 side padding.
- The dock body is ink with radius 30, padding 10 and the dock shadow. It is a 3-column row: hook · centre (96 wide) · hook; the hooks share the remaining width (about 113 pt each on a 390 pt phone).
- Each hook is 76 tall with radius 22. It holds a 44x56 thumbnail that hangs from a 24x3 rail. An empty hook shows a dashed frame and "Empty".
- The thumbnail swings in (`hang`, 520 ms) whenever the garment on a hook changes. This is off under reduced motion.
- `DOCK_BODY_HEIGHT` is 96.

## `@/components/SavedSheet`

```tsx
<SavedSheet visible={open} onClose={() => setOpen(false)} onRemoved={(l) => toast.show("Removed · Đã xoá")} />
```

- On iOS it opens as a native page sheet, which the user can swipe down to dismiss.
- On Android and web it is a bottom sheet over a backdrop. It closes on a backdrop tap, the close button, or the Back button.
- It reads `saved` from the store. Each row shows a thumbnail, the garment name, the occasion and date, the source label (honest, bilingual) and a remove button. An empty store shows a dashed empty state.
- Render it inside `Screen overlay`, next to the dock.

## `@/components/TryOnVideo`

`<TryOnVideo stream={tryOn.videoStream} mirror={tryOn.mirror} objectFit?="cover"|"contain" style={StyleSheet.absoluteFill} zOrder?={0} />`

On native it is an RTCView. On web it renders nothing, so show your own frame together with `tryOn.platformNote`. It renders null when `stream` is null.

## `@/lib/tryOnSession`: `useTryOnSession(options?)`

On native it wraps the frozen Decart, camera and AppState-guard modules. On web, `lib/tryOnSession.web.ts` is a stub that always reports `"preview"`, has no camera, and sets `platformNote` = "Web preview — camera and AI run only in the app".

```tsx
const { consentGiven, activeLook, pickFor } = useAppStore();
const tryOn = useTryOnSession({ consentGiven, autoStartCamera: true });
useEffect(() => { tryOn.preload(hookIds.filter(Boolean) as GarmentId[]); }, [hookIds]);
await tryOn.start(hookIds[0]!);              // GarmentId or a raw decart Look
await tryOn.switchLook(hookIds[1]!);
```

Options: `{ consentGiven?: boolean; facing?: "user"|"environment"; autoStartCamera?: boolean }`. `start()` does nothing until `consentGiven` is true.

Returned fields:

| Field | Meaning |
|---|---|
| `isSupported`, `platformNote` | `false` / a note on web |
| `state` | `"preview"\|"connecting"\|"live"\|"switching"\|"lost"` |
| `aiLive` | True only when there is a remote stream. Use it to drive the AI LIVE vs AI OFF label |
| `statusLabel`, `statusLabelVi` | Honest labels: Camera preview, Connecting to AI, Live AI try-on, Switching look, Connection lost |
| `cameraStatus` | `"off"\|"starting"\|"on"\|"denied"\|"error"` |
| `facing`, `mirror` | Which camera is in use, and whether to mirror it |
| `localStream`, `remoteStream`, `videoStream`, `showingAi` | `videoStream` is the AI output when live, otherwise the camera |
| `error`, `notice`, `settling`, `sessionActive` | Error text, an informational notice, whether a stopped session is still settling, and whether a paid session is in progress |
| `secondsLeft`, `maxSeconds` (120) | Seconds left of the session cap |
| `startBlocker` | Why `start()` would do nothing right now, or null |
| `startCamera(): Promise<boolean>`, `stopCamera()` | Turn the camera on or off |
| `start(look)`, `switchLook(look)`, `stop(notice?)`, `flip()` | `flip()` ends a running paid session first |
| `preload(ids)` | Converts catalog photos ahead of time |
| `needsResumeConsent`, `dismissResumePrompt()`, `resumeCamera()` | After the app returns from the background |

Built-in safety:

- When the screen loses focus (a push, back, or unmount), the hook stops the session and the camera.
- When the app goes to the background, it stops the session and the camera, and does not resume automatically.
- The session is capped at 120 s.
- After a session ends, the hook re-captures the camera.

## `@/lib/store`: `useAppStore()`

`AppStoreProvider` is already in `app/_layout.tsx`.

State:

- `occasionId: OccasionId|null`
- `style: "none"|"minimal"|"casual"|"smart"`
- `locale: "en"|"vi"`: default "en".
- `picks: StyleResponse|null`: `{recommendations: [A, B], source: "llm"|"fallback"}`
- `picksStatus: "idle"|"loading"|"ready"|"error"`
- `picksError: string|null`
- `activeLook: "a"|"b"`
- `consentGiven: boolean`: kept in memory only and asked again on each launch.
- `saved: SavedLook[]`, where `SavedLook` is `{id, garmentId, occasionId, reason, pairWith, source, savedAt}`
- `savedLoaded: boolean`

Actions:

- `setOccasion(id)` and `setStyle(s)`: each drops stale picks.
- `setLocale(l)`
- `fetchPicks({force?})`: returns `Promise<StyleResponse|null>` and never throws. It reuses cached picks when they match.
- `setActiveLook(slot)`
- `giveConsent()`, `revokeConsent()`
- `keepLook(slot)`: returns `SavedLook|null`. It is persisted to AsyncStorage `outfitpilot.saved.v1` and deduped by garment + occasion.
- `removeSaved(id)`
- `clear()`: resets the flow but keeps saved looks.
- `clearSaved()`

Derived:

- `pickFor(slot)`: `Recommendation|null`
- `garmentFor(slot)`: `Garment|null`
- `hookIds`: `[GarmentId|null, GarmentId|null]`

## `@/lib/occasions`

- `OCCASION_OPTIONS`: `{id, label, labelVi, descriptor, descriptorVi, icon}[]` for Job Interview, Campus Day and Coffee Date.
- `getOccasionOption(id)`
- `STYLE_OPTIONS`: `{value, label, labelVi}[]` for None, Minimal, Casual and Smart.
- `StyleChoice`, `isStyleChoice`
- `SOURCE_LABEL`:
  - `llm`: "AI Stylist pick · Gợi ý từ AI Stylist"
  - `fallback`: "Default suggestion · Gợi ý mặc định"

## `@/lib/catalog` (extended)

`Garment` now has:

- `image: number` (a `require` of `assets/garments/G0X.jpg`, 1000x1250)
- `imagePath`
- `sample: true`
- `credit: {author, source, url?, license?}`, taken from `assets/garments/CREDITS.md`

`getGarment(id)` and `tryOnPrompt(g)` are unchanged.

## Web preview (screenshots only)

Run `EXPO_PUBLIC_PREVIEW_SEED=1 npx expo start --web`, then open `/picks?seed=picks`, `/setup?seed=setup`, `/fitting?seed=fitting` or `/final?seed=final`. The seed fills the store with the server's rule-based **fallback** pair for Job Interview (G01 + G02), which is labelled as a default suggestion. Without that env var, or on native, the seed does nothing.

The web build swaps in no-op versions of these files: `livekit-bootstrap.web.ts`, `lib/tryOnSession.web.ts`, `components/TryOnVideo.web.tsx` and `app/dev/tryon.web.tsx`.
