const PHOTOS = [
  "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/38dfbae8-4f76-4c65-b4e7-30530dc58047/1312x894.jpg?v=37332dadff0b4b16a6d962c876b326fa",
  "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/c0827f7e-2263-40bf-bd35-36f7da01e485/1312x894.jpg?v=db6cdcf9d4f87aef292f240b572b5811",
  "https://static.shared.propertyfinder.ae/media/images/listing/9BJQV0N99N39JXJNEYXSZYBB30/2a899c33-a537-4c25-9958-970688372f05/1312x894.jpg?v=54216c2c02c269169798bb7b198761d1",
];

export const SAMPLES = [
  { title: "Hayat Townhouses", updated: "Sep 14, 4:12 PM", photo: PHOTOS[1] },
  { title: "District One Villas", updated: "Sep 12, 11:03 AM", photo: PHOTOS[0] },
  { title: "Untitled listing", updated: "Not saved yet", photo: "" },
];

export const CARD_DESIGNS = [
  {
    id: "current",
    name: "Current",
    note: "What /app uses now. Title, date, two buttons. No photo.",
  },
  {
    id: "photo-overlay",
    name: "Photo overlay",
    note: "Main listing photo fills the card. Title sits on the image.",
  },
  {
    id: "photo-poster",
    name: "Photo poster",
    note: "Tall main photo, then title and gold Open.",
  },
  {
    id: "photo-banner",
    name: "Photo banner",
    note: "Wide main photo across the top of a white card.",
  },
  {
    id: "photo-square",
    name: "Photo square",
    note: "The listing square crop, cream caption underneath.",
  },
  {
    id: "photo-row",
    name: "Photo row",
    note: "List rows with a large main-photo thumb.",
  },
  {
    id: "photo-deep",
    name: "Photo + deep",
    note: "Main photo on top, landing-slab caption below.",
  },
  {
    id: "cover",
    name: "Cover tile",
    note: "Main photo on top. Title and actions below.",
  },
  {
    id: "open",
    name: "Whole card",
    note: "Main photo, click the card to open, delete is an icon.",
  },
  {
    id: "editorial",
    name: "Editorial",
    note: "Date as an eyebrow. Big title. Gold open bar. No photo.",
  },
  {
    id: "rows",
    name: "Rows",
    note: "A list with a small main-photo thumb.",
  },
  {
    id: "cream",
    name: "Cream paper",
    note: "Main photo on Valley cream cards.",
  },
  {
    id: "deep",
    name: "Deep slab",
    note: "Landing-slab cards. No photo.",
  },
  {
    id: "compact",
    name: "Compact",
    note: "Tighter tiles with a 4:3 main photo.",
  },
];
