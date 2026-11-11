OUTFITPILOT — MEN ACCESSORIES MOCK (30 ITEMS)

FILES
- assets/other/male/    30 separate JPG images (640x640px)
- catalog.json          JSON catalog suitable for mock data
- data/maleAccessories.ts  Expo / React Native static-require catalog
- preview.jpg           Contact sheet

EXPO INTEGRATION
Copy 'assets/' and 'data/' folders to the root of your Expo/React Native project.
Import: import { maleAccessories } from './data/maleAccessories';
Merge the array into your catalog or filter by type === 'other' && gender === 'men'.
Static require() paths in maleAccessories.ts are essential for Metro bundling.
Adapt the import path to your application structure.

METADATA
- gender: men
- type: other
- category: other
- kind: accessory
- subCategory: shoes / watches / belts / bags / hats / eyewear / scarves / wallets / jewelry
- isMock: true
- vton_tested: false

LIMITATIONS
Mock graphics were isolated by cropping an AI-generated accessory concept sheet.
They are NOT original high-resolution retail product photography; fine details and logos may be imperfect.
Use for accessory selection / catalog UI, not as proof that accessories work in Decart Lucy VTON.
