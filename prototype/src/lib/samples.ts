import type { Product } from "./types";

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=720&h=900&q=72&fit=crop&auto=format`;

/**
 * Demo pieces so the flow is explorable on first open.
 *
 * Provenance: every photo is hot-linked from images.unsplash.com under the Unsplash
 * Licence (sourced 2026-11-09, verified HTTP 200). The photo id in each URL is the
 * Unsplash asset id; photographer credit is on that photo's Unsplash page and has
 * not been recorded here yet: add it before any public release.
 * Shops use the reserved .example domain and prices are marked as user-entered;
 * replace both with real data.
 */
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "s-bomber",
    name: "Rust bomber jacket",
    shop: "northline.example",
    price: "890.000₫",
    url: "https://northline.example/bomber",
    image: u("1591047139829-d91aecb6caea"),
    sample: true,
    addedAt: 6,
  },
  {
    id: "s-leather",
    name: "Black leather biker",
    shop: "ateliernoir.example",
    price: "1.450.000₫",
    url: "https://ateliernoir.example/biker",
    image: u("1551028719-00167b16eac5"),
    sample: true,
    addedAt: 5,
  },
  {
    id: "s-shirt",
    name: "Printed chambray shirt",
    shop: "linenhouse.example",
    price: "520.000₫",
    url: "https://linenhouse.example/chambray",
    image: u("1596755094514-f87e34085b2c"),
    sample: true,
    addedAt: 4,
  },
  {
    id: "s-crochet",
    name: "Crochet fringe top",
    shop: "saltandsun.example",
    image: u("1434389677669-e08b4cac3105"),
    sample: true,
    addedAt: 3,
  },
  {
    id: "s-tee",
    name: "Black logo tee",
    shop: "basicsco.example",
    price: "290.000₫",
    image: u("1583743814966-8936f5b7be1a"),
    sample: true,
    addedAt: 2,
  },
  {
    id: "s-dress",
    name: "Red maxi dress",
    shop: "maisonrouge.example",
    price: "1.190.000₫",
    url: "https://maisonrouge.example/maxi",
    image: u("1595777457583-95e059d581b8"),
    sample: true,
    addedAt: 1,
  },
];
