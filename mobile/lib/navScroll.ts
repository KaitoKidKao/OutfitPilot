// Scroll state shared by every Screen and the NavBar (Sang, 14/11): the bar fades
// while the page is being scrolled and comes back ~250 ms after scrolling stops.
import { makeMutable } from "react-native-reanimated";

/** 1 while a Screen is scrolling, 0 when at rest. Read by NavBar on the UI thread. */
export const navScrolling = makeMutable(0);

let restTimer: ReturnType<typeof setTimeout> | null = null;
let momentum = false;

function settle(delay = 250) {
  if (restTimer) clearTimeout(restTimer);
  restTimer = setTimeout(() => {
    navScrolling.value = 0;
  }, delay);
}

export const navScrollHandlers = {
  onScrollBeginDrag: () => {
    if (restTimer) clearTimeout(restTimer);
    momentum = false;
    navScrolling.value = 1;
  },
  onScrollEndDrag: () => {
    // Give momentum a moment to start; if it doesn't, settle.
    settle(300);
  },
  onMomentumScrollBegin: () => {
    if (restTimer) clearTimeout(restTimer);
    momentum = true;
    navScrolling.value = 1;
  },
  onMomentumScrollEnd: () => {
    if (momentum) settle();
    momentum = false;
  },
};

/** Show the bar right away (e.g. when it is touched). */
export function showNavNow() {
  if (restTimer) clearTimeout(restTimer);
  navScrolling.value = 0;
}
