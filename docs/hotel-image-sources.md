# Hotel image sources and licence manifest

Internal record of every photo shown in the tour **Accommodation** sections
(`src/data/hotelData.js` → `HotelModal`). One row per image file.

**Rules this manifest exists to enforce**

- No photos scraped or reused from Booking.com, Google, TripAdvisor, Expedia, Instagram, Facebook or any other third-party platform.
- No watermark removal, no stripping of legally required attribution, no obscuring of a source.
- Safe sources, in priority order: (1) images already in this project, (2) hotel-supplied images, (3) hotel official site / press kit where reuse is permitted, (4) written permission from the hotel, (5) properly licensed stock that genuinely represents the property.
- If rights are unclear, **no image is added** — the hotel is listed in the missing-image report instead.

---

## ⚠️ Provenance status of the pre-existing library

**No images were added, replaced or removed in this change.** All 124 files below
predate it. They are documented here for the first time, and the honest position is:

- **108 files — `UNVERIFIED — no source recorded`.** The repository contains no record
  of where these came from or under what licence. That is not evidence of a problem, but
  it is not clearance either, and it cannot be reconstructed after the fact.
- **16 files (4 hotels) — `UNVERIFIED — comment claims official site / public listing`.**
  `hotelData.js` carries one note saying these are "each hotel's own images (from their
  official sites / public listings)". "Public listings" is too vague to treat as a licence.

**Recommended follow-up:** confirm in writing with each property that we may use its
photos on hikasustravel.com, and record the reply date in the Source column below.
Until then treat the library as unverified rather than cleared.

---

## Photo audit, 2026-08-30 — what each photograph actually shows

Every one of the 131 referenced photographs was **looked at**, as per-hotel contact
sheets, and classified by content. Each classification was then compared with the
image's `alt` text and with the caption the page was displaying.

**No photograph was found to belong to a different property, and none was removed.**
Where a hotel's own signage appears (West Way, Boutique Hotel 32, Monarch, Gudauri Inn,
Crystal, Newport, Mestia Inn, Lileo, Ambassadori, Rooms Hotel, Akhaltsikhe Inn) it matches
the hotel it is filed under. For properties without visible signage, identity could not be
confirmed from the file alone; nothing about those images contradicted their filing.

**What was wrong was the caption, not the photograph.** The four labels were read off a
fixed `['Exterior','Lobby','Room','Bathroom']` list *by array position*, so a hotel whose
photos were not exactly those four shots in exactly that order was captioned wrongly.
**23 of 131 captions described something the photo was not:**

| Hotel | Position | Said | Actually shows |
|---|---|---|---|
| Sandali Metekhi | 1 | Exterior | MICHELIN Guide plaque on an interior wall |
| Sandali Metekhi | 4 | Bathroom | Balcony with Old Town views |
| Hotel West Way | 3 | Room | Reception desk |
| Hotel & Wine Cellar ARGE | 1 | Exterior | Guest room with balcony doors |
| Hotel & Wine Cellar ARGE | 3 | Room | Seating area (could not classify with confidence) |
| Ginger Hotel | 2 | Lobby | Meeting room |
| Ambassadori | 4 | Bathroom | Suite living room |
| Gudauri Lodge | 4 | Bathroom | Suite living area |
| Rooms Hotel Kazbegi | 4 | Bathroom | Fireplace lounge |
| Boutique Hotel Argo | 4 | Bathroom | Table laid for dinner |
| Boutique Hotel 32 | 2 | Lobby | View over the seafront park |
| Tsinandali Estate | 3 | Room | Outdoor pool terrace |
| Park Hotel Tsinandali | 2 | Lobby | Guest room |
| Park Hotel Tsinandali | 3 | Room | Guest bathroom |
| Park Hotel Tsinandali | 4 | Bathroom | Indoor swimming pool |
| Akhaltsikhe Inn | 4 | Bathroom | Changing room |
| Hotel Gino Wellness Rabati | 4 | Bathroom | A second guest room |
| Hotel Beni | 2 | Lobby | Garden steps, outdoors |
| Hotel Beni | 4 | Bathroom | A second guest room |
| Boutique Hotel Borjomi Verde | 2 | Lobby | Outdoor terrace |
| Lileo Inn | 2 | Lobby | Guest room |
| Lileo Inn | 3 | Room | Guest bathroom |
| Lileo Inn | 4 | Bathroom | A second guest room |

**The `alt` text was correct in all 23 cases.** It already said "Table set for dinner",
"Indoor swimming pool", "Changing room". So nothing was ever mis-described to a screen
reader, a crawler or a translated page — the six localized `imageAlts` arrays were right
too. Only the visible English caption guessed, and it guessed from position.

**Fix:** each image in `hotelData.js` now carries its own `category`, and the caption is
rendered from that. An image with no category renders no caption, which is the honest
outcome where classification was not certain (one image: `hotel-arge-3.jpg`). No
photograph, filename, `alt` string or locale file was changed, so this is invisible to the
six translated sites and to search engines.

### Categories genuinely missing

These hotels are short of one of the four standard shots. Nothing was substituted to fill
the slot — a hotel now simply shows the photos it has, correctly labelled.

| Hotel | Has no |
|---|---|
| Sandali Metekhi By Old Hospitality | exterior, bathroom |
| Hotel West Way | guest room |
| Hotel & Wine Cellar ARGE | exterior |
| Ginger Hotel | lobby |
| Ambassadori | bathroom |
| Gudauri Lodge | bathroom |
| Rooms Hotel Kazbegi | bathroom |
| Boutique Hotel Argo | bathroom |
| Boutique Hotel 32 | exterior (only an entrance sign), lobby |
| Tsinandali Estate | guest room |
| Park Hotel Tsinandali | lobby |
| Akhaltsikhe Inn | bathroom |
| Hotel Gino Wellness Rabati | bathroom |
| Hotel Beni | lobby, bathroom |
| Boutique Hotel Borjomi Verde | lobby |
| Lileo Inn | lobby |
| Kokhta Bakuriani | bathroom |
| Crystal Hotel & Spa | bathroom |

Plus the six hotels holding **no** photographs at all (see the missing-image report above):
Communal Hotel Telavi, Boutique Hotel Kviria, Seventeen Rooms, Villa Lapa, Chateau Orberi,
Bakuriani Inn.

### Why nothing was added

Filling these gaps needs a source, and there is none available that clears the rules at the
top of this file:

- **The project itself.** Six files sit in `public/images/hotels/` unreferenced —
  `gudauri-inn-3.webp`, `gudauri-inn-4.webp`, `gudauri-lodge.webp`, `hotel-monarch-4.jpg`,
  `marco-polo-4.webp`, `rooms-hotel-tbilisi-4.jpg`. All six were viewed. Every one belongs
  to a hotel that already has that category covered, so none fills a gap.
  `hotel-monarch-4.jpg` is in any case unusable: it shows a nude model in a bathtub with a
  champagne glass. It stays unreferenced.
- **The owner's photo library.** `Images for tours/` holds 3,798 images across 113
  packages. None is hotel photography — no file matches any hotel name and there is no
  accommodation folder.
- **Everywhere else** is barred: OTAs, review sites, image search, social media, stock
  previews. The 2026-07-26 licence check found no openly licensed photograph of any of
  these properties, and re-checking would not change that.

An official hotel site being publicly readable is not a grant of reuse, so those are
recorded as **NEEDS SOURCE / RIGHTS APPROVAL**, not published. The route to filling every
gap above is the permission request below, sent to the properties.

---

## Missing-image report

Hotels shown on a live tour page that have **no** usable photos. No safe, licensed
imagery for these exists anywhere in the project (checked: `public/images/hotels/`,
`Images for tours/` incl. `telavi-images-package/`, `Packages/`), so nothing was added.

All five are on `3-day-kakheti-wine-and-food-tour-from-tbilisi`, and all five need the same
four shots: **exterior, lobby/common area, room, bathroom.**

| Hotel | Package | Official site | Email | Phone | Address |
|---|---|---|---|---|---|
| Communal Hotel Telavi | Premium | communalhotels.com/home/telavi-2/ | via site form | +995 599 66 99 77 | 11 Kakutsa Cholokashvili St, Telavi 2200 |
| Boutique Hotel Kviria | Mid-Range | kviria.ge | info@kviria.ge | +995 599 44 22 66 | 51 Gogebashvili St, Telavi |
| Seventeen Rooms | Mid-Range | none found — OTA listings only | — | +995 514 17 17 11 | 3 Giorgi Leonidze St, Telavi 2200 |
| Villa Lapa | Classic | villalapa.com | ask@villalapa.com | +995 551 08 89 85 / +995 511 22 11 03 | Tbilisi St (Mere), Vardisubani, Telavi |
| Chateau Orberi | Classic | none found — OTA listings only | — | +995 599 87 69 88 | Building 6, 2 Ikalto Lane, Ikalto 2200 |

**Licence check performed 2026-07-26.** No Creative Commons or otherwise openly licensed
photographs of any of these five properties exist (Wikimedia Commons and general search).
Every available image sits on the hotel's own site, an OTA (Booking.com, TripAdvisor,
Expedia, Agoda, Hotels.com) or Facebook. Communal Hotels' site carries `© Communal 2023`
with no media kit and no reuse grant; the others state no reuse terms either. **Silence is
not permission**, so none of these are usable and nothing was taken from them.

The properties themselves are the fix. A hotel that receives bookings from a tour operator
almost always says yes, and usually sends better originals than anything on a listing page.

### Ready-to-send permission request

> **Subject:** Photo permission request — Hikasus Travel tour page
>
> Dear [hotel name] team,
>
> We are Hikasus Travel, a tour operator based in Georgia. We feature your property as the
> accommodation on our 3-Day Kakheti Wine and Food Tour, and we would like to show your
> hotel properly on the tour page at www.hikasustravel.com.
>
> Could you send us 4–6 photographs we may publish — ideally the exterior, a common area or
> lobby, a guest room and a bathroom — together with written confirmation that Hikasus
> Travel may use them on our website and in related promotional material?
>
> Please tell us if you require a specific photo credit, and we will display it.
>
> Thank you,
> Hikasus Travel

Log each reply date in the Source column of the manifest below, then follow the
"Adding a new hotel image" checklist at the end of this document.

Also flagged, not an image issue: the **8-Day Georgia Culture and Adventure Tour**
lists `Local Cottage or Guesthouse` for Lagodekhi across all three packages. No property
is named, so there is nothing to photograph or link. Needs a decision: name the
property, or keep it deliberately generic.

---

## Manifest — every image currently referenced

`Source` and `Permission/licence status` record what the repository can actually
evidence. Do not upgrade a row to "cleared" without a written reply on file.

| Tour(s) | Hotel name | Filename | Type | Source | Permission/licence status | Date checked | Notes |
|---|---|---|---|---|---|---|---|
| 1 tour(s) | Sandali Metekhi By Old Hospitality | `sandali-metekhi.jpg` | michelin guide plaque | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 434 KB |
| 1 tour(s) | Sandali Metekhi By Old Hospitality | `sandali-metekhi-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 473 KB |
| 1 tour(s) | Sandali Metekhi By Old Hospitality | `sandali-metekhi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 534 KB |
| 1 tour(s) | Sandali Metekhi By Old Hospitality | `sandali-metekhi-4.jpg` | balcony | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 715 KB |
| 1 tour(s) | Best View Kazbegi | `best-view-kazbegi.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 72 KB |
| 1 tour(s) | Best View Kazbegi | `best-view-kazbegi-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 111 KB |
| 1 tour(s) | Best View Kazbegi | `best-view-kazbegi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 175 KB |
| 1 tour(s) | Best View Kazbegi | `best-view-kazbegi-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 56 KB |
| 12 tour(s) | Hotel West Way | `hotel-west-way.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 121 KB |
| 12 tour(s) | Hotel West Way | `hotel-west-way-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 115 KB |
| 12 tour(s) | Hotel West Way | `hotel-west-way-3.jpg` | reception | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 81 KB |
| 12 tour(s) | Hotel West Way | `hotel-west-way-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 77 KB |
| 1 tour(s) | Hotel Phaliashvili | `hotel-phaliashvili.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 217 KB |
| 1 tour(s) | Hotel Phaliashvili | `hotel-phaliashvili-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 109 KB |
| 1 tour(s) | Hotel Phaliashvili | `hotel-phaliashvili-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 108 KB |
| 1 tour(s) | Hotel Phaliashvili | `hotel-phaliashvili-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 214 KB |
| 8 tour(s) | Hotel & Wine Cellar ARGE | `hotel-arge.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 92 KB |
| 8 tour(s) | Hotel & Wine Cellar ARGE | `hotel-arge-2.jpg` | lounge | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 199 KB |
| 8 tour(s) | Hotel & Wine Cellar ARGE | `hotel-arge-3.jpg` | uncategorised | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 158 KB |
| 8 tour(s) | Hotel & Wine Cellar ARGE | `hotel-arge-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 142 KB |
| 14 tour(s) | Rooms Hotel Tbilisi | `rooms-hotel-tbilisi.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 192 KB |
| 14 tour(s) | Rooms Hotel Tbilisi | `rooms-hotel-tbilisi-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 236 KB |
| 14 tour(s) | Rooms Hotel Tbilisi | `rooms-hotel-tbilisi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 163 KB |
| 14 tour(s) | Rooms Hotel Tbilisi | `rooms-hotel-tbilisi-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 156 KB |
| 15 tour(s) | Ibis Styles Tbilisi Center | `ibis-styles-tbilisi.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 344 KB |
| 15 tour(s) | Ibis Styles Tbilisi Center | `ibis-styles-tbilisi-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 52 KB |
| 15 tour(s) | Ibis Styles Tbilisi Center | `ibis-styles-tbilisi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 171 KB |
| 15 tour(s) | Ibis Styles Tbilisi Center | `ibis-styles-tbilisi-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 143 KB |
| 15 tour(s) | Ginger Hotel | `ginger-hotel.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 229 KB |
| 15 tour(s) | Ginger Hotel | `ginger-hotel-2.jpg` | meeting room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 177 KB |
| 15 tour(s) | Ginger Hotel | `ginger-hotel-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 130 KB |
| 15 tour(s) | Ginger Hotel | `ginger-hotel-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 127 KB |
| 1 tour(s) | Ambassadori | `ambassadori.jpg` | exterior | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 201 KB |
| 1 tour(s) | Ambassadori | `ambassadori-2.jpg` | lobby | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 155 KB |
| 1 tour(s) | Ambassadori | `ambassadori-3.jpg` | room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 160 KB |
| 1 tour(s) | Ambassadori | `ambassadori-4.jpg` | suite living room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 150 KB |
| 1 tour(s) | Gudauri Lodge | `gudauri-lodge.webp` | exterior | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 144 KB |
| 1 tour(s) | Gudauri Lodge | `gudauri-lodge-2.webp` | suite living area | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 305 KB |
| 1 tour(s) | Gudauri Lodge | `gudauri-lodge-3.webp` | room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 237 KB |
| 1 tour(s) | Gudauri Lodge | `gudauri-lodge-4.webp` | library lounge | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 297 KB |
| 1 tour(s) | Marco Polo | `marco-polo.webp` | exterior | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 93 KB |
| 1 tour(s) | Marco Polo | `marco-polo-2.webp` | indoor pool | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 360 KB |
| 1 tour(s) | Marco Polo | `marco-polo-3.webp` | lobby | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 373 KB |
| 1 tour(s) | Marco Polo | `marco-polo-4.webp` | room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 173 KB |
| 1 tour(s) | Gudauri Inn | `gudauri-inn.webp` | lounge | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 458 KB |
| 1 tour(s) | Gudauri Inn | `gudauri-inn-2.webp` | room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 38 KB |
| 1 tour(s) | Gudauri Inn | `gudauri-inn-3.webp` | room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 67 KB |
| 1 tour(s) | Gudauri Inn | `gudauri-inn-4.webp` | room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 31 KB |
| 11 tour(s) | Rooms Hotel Kazbegi | `rooms-hotel-kazbegi.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 143 KB |
| 11 tour(s) | Rooms Hotel Kazbegi | `rooms-hotel-kazbegi-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 197 KB |
| 11 tour(s) | Rooms Hotel Kazbegi | `rooms-hotel-kazbegi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 100 KB |
| 11 tour(s) | Rooms Hotel Kazbegi | `rooms-hotel-kazbegi-4.jpg` | fireplace lounge | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 200 KB |
| 11 tour(s) | Northgate Hotel | `northgate-hotel.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 186 KB |
| 11 tour(s) | Northgate Hotel | `northgate-hotel-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 119 KB |
| 11 tour(s) | Northgate Hotel | `northgate-hotel-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 60 KB |
| 11 tour(s) | Northgate Hotel | `northgate-hotel-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 129 KB |
| 11 tour(s) | Hotel Horizon | `hotel-horizon.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 143 KB |
| 11 tour(s) | Hotel Horizon | `hotel-horizon-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 83 KB |
| 11 tour(s) | Hotel Horizon | `hotel-horizon-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 89 KB |
| 11 tour(s) | Hotel Horizon | `hotel-horizon-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 88 KB |
| 11 tour(s) | Newport Hotel Kutaisi | `newport-hotel-kutaisi.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 210 KB |
| 11 tour(s) | Newport Hotel Kutaisi | `newport-hotel-kutaisi-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 131 KB |
| 11 tour(s) | Newport Hotel Kutaisi | `newport-hotel-kutaisi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 110 KB |
| 11 tour(s) | Newport Hotel Kutaisi | `newport-hotel-kutaisi-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 96 KB |
| 11 tour(s) | Boutique Hotel Argo | `boutique-hotel-argo.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 63 KB |
| 11 tour(s) | Boutique Hotel Argo | `boutique-hotel-argo-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 45 KB |
| 11 tour(s) | Boutique Hotel Argo | `boutique-hotel-argo-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 148 KB |
| 11 tour(s) | Boutique Hotel Argo | `boutique-hotel-argo-4.jpg` | dining setup | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 172 KB |
| 8 tour(s) | Rooms Hotel | `rooms-hotel-batumi.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 319 KB |
| 8 tour(s) | Rooms Hotel | `rooms-hotel-batumi-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 116 KB |
| 8 tour(s) | Rooms Hotel | `rooms-hotel-batumi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 292 KB |
| 8 tour(s) | Rooms Hotel | `rooms-hotel-batumi-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 179 KB |
| 8 tour(s) | Hotel Monarch | `hotel-monarch.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 423 KB |
| 8 tour(s) | Hotel Monarch | `hotel-monarch-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 346 KB |
| 8 tour(s) | Hotel Monarch | `hotel-monarch-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 533 KB |
| 8 tour(s) | Hotel Monarch | `hotel-monarch-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 327 KB |
| 8 tour(s) | Boutique Hotel 32 | `boutique-hotel-32.jpg` | entrance | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 87 KB |
| 8 tour(s) | Boutique Hotel 32 | `boutique-hotel-32-2.jpg` | view from the hotel | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 113 KB |
| 8 tour(s) | Boutique Hotel 32 | `boutique-hotel-32-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 57 KB |
| 8 tour(s) | Boutique Hotel 32 | `boutique-hotel-32-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 38 KB |
| 6 tour(s) | Tsinandali Estate, A Radisson Collection Hotel | `tsinandali-estate.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 693 KB |
| 6 tour(s) | Tsinandali Estate, A Radisson Collection Hotel | `tsinandali-estate-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 373 KB |
| 6 tour(s) | Tsinandali Estate, A Radisson Collection Hotel | `tsinandali-estate-3.jpg` | pool terrace | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 642 KB |
| 6 tour(s) | Tsinandali Estate, A Radisson Collection Hotel | `tsinandali-estate-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 607 KB |
| 6 tour(s) | Park Hotel Tsinandali | `park-hotel-tsinandali.jpg` | indoor pool | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 146 KB |
| 6 tour(s) | Park Hotel Tsinandali | `park-hotel-tsinandali-2.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 114 KB |
| 6 tour(s) | Park Hotel Tsinandali | `park-hotel-tsinandali-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 62 KB |
| 6 tour(s) | Park Hotel Tsinandali | `park-hotel-tsinandali-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 81 KB |
| 2 tour(s) | Akhaltsikhe Inn (Junior Suite Room) | `akhaltsikhe-inn.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 111 KB |
| 2 tour(s) | Akhaltsikhe Inn (Junior Suite Room) | `akhaltsikhe-inn-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 155 KB |
| 2 tour(s) | Akhaltsikhe Inn (Junior Suite Room) | `akhaltsikhe-inn-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 68 KB |
| 2 tour(s) | Akhaltsikhe Inn (Junior Suite Room) | `akhaltsikhe-inn-4.jpg` | changing room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 408 KB |
| 2 tour(s) | Hotel Gino Wellness Rabati | `hotel-gino-wellness-rabati.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 104 KB |
| 2 tour(s) | Hotel Gino Wellness Rabati | `hotel-gino-wellness-rabati-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 117 KB |
| 2 tour(s) | Hotel Gino Wellness Rabati | `hotel-gino-wellness-rabati-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 68 KB |
| 2 tour(s) | Hotel Gino Wellness Rabati | `hotel-gino-wellness-rabati-4.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 55 KB |
| 2 tour(s) | Hotel Beni | `hotel-beni.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 69 KB |
| 2 tour(s) | Hotel Beni | `hotel-beni-2.jpg` | garden | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 65 KB |
| 2 tour(s) | Hotel Beni | `hotel-beni-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 24 KB |
| 2 tour(s) | Hotel Beni | `hotel-beni-4.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 257 KB |
| 1 tour(s) | Crowne Plaza Borjomi | `crowne-plaza-borjomi.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 167 KB |
| 1 tour(s) | Crowne Plaza Borjomi | `crowne-plaza-borjomi-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 133 KB |
| 1 tour(s) | Crowne Plaza Borjomi | `crowne-plaza-borjomi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 116 KB |
| 1 tour(s) | Crowne Plaza Borjomi | `crowne-plaza-borjomi-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 111 KB |
| 1 tour(s) | Bridge Hotel | `bridge-hotel.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 172 KB |
| 1 tour(s) | Bridge Hotel | `bridge-hotel-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 116 KB |
| 1 tour(s) | Bridge Hotel | `bridge-hotel-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 82 KB |
| 1 tour(s) | Bridge Hotel | `bridge-hotel-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 84 KB |
| 1 tour(s) | Boutique Hotel Borjomi Verde | `borjomi-verde.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 191 KB |
| 1 tour(s) | Boutique Hotel Borjomi Verde | `borjomi-verde-2.jpg` | terrace | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 165 KB |
| 1 tour(s) | Boutique Hotel Borjomi Verde | `borjomi-verde-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 71 KB |
| 1 tour(s) | Boutique Hotel Borjomi Verde | `borjomi-verde-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 103 KB |
| 4 tour(s) | Hotel Posta | `hotel-posta.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 44 KB |
| 4 tour(s) | Hotel Posta | `hotel-posta-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 46 KB |
| 4 tour(s) | Hotel Posta | `hotel-posta-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 21 KB |
| 4 tour(s) | Hotel Posta | `hotel-posta-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 82 KB |
| 4 tour(s) | Mestia Inn | `mestia-inn.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 142 KB |
| 4 tour(s) | Mestia Inn | `mestia-inn-2.jpg` | lobby | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 78 KB |
| 4 tour(s) | Mestia Inn | `mestia-inn-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 67 KB |
| 4 tour(s) | Mestia Inn | `mestia-inn-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 131 KB |
| 4 tour(s) | Lileo Inn | `lileo-inn.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 60 KB |
| 4 tour(s) | Lileo Inn | `lileo-inn-2.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 357 KB |
| 4 tour(s) | Lileo Inn | `lileo-inn-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 80 KB |
| 4 tour(s) | Lileo Inn | `lileo-inn-4.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 64 KB |

**Total: 124 image files across 31 hotels.**

---

## Adding a new hotel image

1. Confirm the source is safe (see priority list above). If unclear — stop, and add the hotel to the missing-image report.
2. Drop the file in `public/images/hotels/` using a descriptive name: `hotel-arge-exterior-georgia.webp`.
3. Add it to the hotel's `images[]` in `src/data/hotelData.js` with English alt text.
4. Add the matching alt string to `imageAlts` in **all six** `src/i18n/locales/<lang>/hotels.json` files. Array lengths must match `images[]` exactly, or that locale falls back to English for the whole hotel (see `src/i18n/useHotel.js`).
5. Add a row here with a real source and licence status.
6. If the licence requires visible credit, raise it before publishing — the modal has no credit slot today.

---

## 2026-08-29 — hotel information audit

Every hotel record was checked against the four required categories by **looking at each
photograph**, not by reading its filename or alt text. Nine photographs were added, all
taken from the property’s own website. Sizes below are after conversion to WebP
(long edge capped at 1600 px, never upscaled).

| Hotel | Category | Source URL (official site) | Local file | Size |
|---|---|---|---|---|
| Kokhta Bakuriani | exterior | https://silkhospitality.com/media/c2jgvmm2/kokhta-bakuriani.jpg | `kokhta-bakuriani.webp` | 1600x1144, 338 KB |
| Kokhta Bakuriani | lobby | https://silkhospitality.com/media/wo0foa1q/lobby_roomshotelkokhta_3.jpg | `kokhta-bakuriani-2.webp` | 1600x1067, 176 KB |
| Kokhta Bakuriani | standard room | https://silkhospitality.com/media/aqrf41tw/mountain_view_standard-king.jpg | `kokhta-bakuriani-3.webp` | 1600x1067, 174 KB |
| Crystal Hotel & Spa | exterior | https://hotelcrystal.ge/wp-content/uploads/2022/07/cr_sastumro_32.jpg | `crystal-hotel-spa.webp` | 1200x804, 188 KB |
| Crystal Hotel & Spa | lobby | https://hotelcrystal.ge/wp-content/uploads/2022/07/cr_sastumro_27.jpg | `crystal-hotel-spa-2.webp` | 1200x800, 87 KB |
| Crystal Hotel & Spa | standard room | https://hotelcrystal.ge/wp-content/uploads/2022/07/oradgiliani_stand_1.jpg | `crystal-hotel-spa-3.webp` | 1200x800, 62 KB |
| Gudauri Lodge | exterior | https://gudaurilodge.com/wp-content/uploads/2026/07/home-the-resort.webp | `gudauri-lodge-5.webp` | 1600x1067, 196 KB |
| Marco Polo | standard room | https://marcopolo.ge/img/62c92550f3afa8a1.webp | `marco-polo-6.webp` | 1280x1024, 142 KB |
| Hotel Monarch | bathroom | https://hotelmonarch.ge/wp-content/uploads/2018/09/Standard-Room-10-scaled.jpg | `hotel-monarch-5.webp` | 1600x1067, 123 KB |

Added in the preceding change (8-day tour pass), recorded here for completeness:

| Hotel | Category | Source URL (official site) | Local file |
|---|---|---|---|
| Gudauri Inn | exterior | https://gudauriinn.org/ | `gudauri-inn-5.webp` |
| Gudauri Inn | bathroom | https://gudauriinn.org/ | `gudauri-inn-6.webp` |
| Marco Polo | bathroom | https://marcopolo.ge/ | `marco-polo-5.webp` |

### Retired from the core sets

Still on disk, no longer referenced by any record:

| File | Hotel | Why |
|---|---|---|
| `gudauri-lodge.webp` | Gudauri Lodge | Building was a dark sliver against the mountain; replaced by a clear exterior. |
| `marco-polo-4.webp` | Marco Polo | An outdoor pool, held in the record as the "guest room"; a real room now fills that slot. |
| `gudauri-inn-3.webp`, `gudauri-inn-4.webp` | Gudauri Inn | Third and fourth near-identical twin-room frames. |
| `hotel-monarch-4.jpg` | Hotel Monarch | Staged glamour shot of a model in a bathtub, not a usable guest-bathroom photograph. |

### Still outstanding — NEEDS SOURCE / RIGHTS APPROVAL

Judged by looking at every photograph, not at filenames or alt text. Nothing was
substituted from a banned source (OTA, Google, Pinterest, social) to fill these.

| Hotel | Tours | Missing / weak category | Why it is still open |
|---|---|---|---|
| Bakuriani Inn | 1 | exterior, lobby, standard room, bathroom | bakurianiinn.org is behind a Cloudflare challenge that blocks automated access; no other official source found |
| Communal Hotel Telavi | 1 | all four | already in the missing-image report above; no images anywhere in the project |
| Boutique Hotel Kviria | 1 | all four | as above |
| Seventeen Rooms | 1 | all four | as above — no official site, OTA listings only |
| Villa Lapa | 1 | all four | as above |
| Chateau Orberi | 1 | all four | as above — no official site, OTA listings only |
| Kokhta Bakuriani | 1 | bathroom | the operator publishes no guest-bathroom photograph (whole media library checked) |
| Crystal Hotel & Spa | 1 | bathroom | hotelcrystal.ge publishes no guest-bathroom photograph; the only candidate is a toiletries close-up |
| Gudauri Lodge | 3 | bathroom | gudaurilodge.com publishes no guest-bathroom photograph |
| Rooms Hotel Kazbegi | 11 | bathroom (currently a fireplace lounge) | the only bathroom frame on roomshotels.com is an extreme crop of a bathtub foot |
| Hotel West Way | 14 | standard room (currently a second lobby shot) | no official website; OTA listings only |
| Boutique Hotel Argo | 13 | standard room is model-dominated; bathroom is a dinner table | no official website; hotelargo.ge is a different property in Tskaltubo |
| Ginger Hotel | 15 | lobby (currently a meeting room) | no official website found |
| Sandali Metekhi By Old Hospitality | 1 | exterior (currently a MICHELIN plaque); bathroom (currently a balcony) | no official website found |
| Hotel & Wine Cellar ARGE | 8 | exterior | no official website found |
| Ambassadori | 1 | bathroom (currently a suite lounge) | no official website found |
| Boutique Hotel 32 | 8 | exterior (currently a signboard); lobby (currently a sea view) | no official website found |
| Tsinandali Estate, A Radisson Collection Hotel | 6 | standard room (currently a pool terrace) | not yet sourced from the Radisson brand site |
| Park Hotel Tsinandali | 6 | lobby | no official website found; order corrected so the pool no longer leads |
| Akhaltsikhe Inn (Junior Suite Room) | 2 | bathroom (currently a changing room) | no official website found |
| Hotel Gino Wellness Rabati | 2 | bathroom (currently a second room) | no official website found |
| Hotel Beni | 2 | lobby (garden steps); bathroom (second room) | no official website found |
| Crowne Plaza Borjomi | 1 | exterior is a distant aerial in which the hotel is very small | not yet sourced from the IHG brand site |
| Boutique Hotel Borjomi Verde | 1 | lobby (currently a terrace) | no official website found |
| Lileo Inn | 4 | lobby | no official website found; order corrected so the bathroom no longer leads |
| Rooms Hotel | 8 | lobby frame is very dark | usable, but a brighter common-area frame would be better |

**26 hotels still have at least one gap.** Every one of them is clickable, has a
description in all seven languages, and has correct alt text for the photographs it
does hold — the gap is the photograph itself.

---

## 2026-09-12 — Yerevan hotel photos (10-Day Georgia and Armenia Tour)

Two of the three Yerevan properties added to `hotelData.js` on 2026-09-11 (with
`images: []`) now have real photographs, each pulled from the property's own official
site and viewed individually before use — same process as the 2026-08-29 pass. No
OTA, Google, review-site or social-media imagery was used. Converted to WebP, long
edge capped at 1600 px, never upscaled.

| Hotel | Category | Source URL (official site) | Local file | Size |
|---|---|---|---|---|
| Yerevan Place | exterior | https://yerevanplace.com/ (homepage hero) | `yerevan-place.webp` | 1600x583, 115 KB |
| Yerevan Place | lobby / reception | https://yerevanplace.com/gallery/ | `yerevan-place-2.webp` | 600x365, 36 KB |
| Yerevan Place | standard room | https://yerevanplace.com/rooms/standard-king-room/ | `yerevan-place-3.webp` | 1200x500, 46 KB |
| Yerevan Place | bathroom | https://yerevanplace.com/rooms/standard-king-room/ | `yerevan-place-4.webp` | 1200x500, 56 KB |
| Ani Central Inn | lobby | https://anicentralinnyerevan.com/ (homepage slide) | `ani-central-inn.webp` | 1500x1012, 181 KB |
| Ani Central Inn | standard room | https://anicentralinnyerevan.com/rooms/double-twin/ | `ani-central-inn-2.webp` | 1110x720, 43 KB |
| Ani Central Inn | bathroom | https://anicentralinnyerevan.com/rooms/double-twin/ | `ani-central-inn-3.webp` | 1110x720, 48 KB |

**Still outstanding as of 2026-09-12:**

| Hotel | Missing category | Why it is still open |
|---|---|---|
| Ani Central Inn | exterior | No standalone building photograph anywhere on anicentralinnyerevan.com (homepage, about-us, contacts and hotel pages all checked). The hotel appears to share a building with sister properties under the same operator (Dali Holding); nothing was substituted. |

Both gaps were closed on 2026-09-13 when the owner supplied photos directly — DoubleTree
by Hilton Yerevan City Centre and Ani Central Inn's exterior are covered in the sections
below.

---

## 2026-09-13 — DoubleTree by Hilton Yerevan City Centre (owner-supplied)

The owner supplied all nine of the property's own photographs directly, dropped in
`Images for tours/Hotels/Double Tree by Hilton in Yerevan/` outside the repo. Each was
viewed individually before use (same standard as every other row in this manifest): the
exterior shows the building's own signage, and the lobby has a visible "DoubleTree by
Hilton — Yerevan City Centre" sign, confirming the property. Converted to WebP; the
source files were already under the 1600px long-edge cap, so none were resized.

| Hotel | Category | Source | Local file | Size |
|---|---|---|---|---|
| DoubleTree by Hilton Yerevan City Centre | exterior | Owner-supplied (property's own photo) | `doubletree-yerevan.webp` | 652x768, 103 KB |
| DoubleTree by Hilton Yerevan City Centre | lobby | Owner-supplied (property's own photo) | `doubletree-yerevan-2.webp` | 1024x703, 71 KB |
| DoubleTree by Hilton Yerevan City Centre | standard room | Owner-supplied (property's own photo) | `doubletree-yerevan-3.webp` | 1024x683, 43 KB |
| DoubleTree by Hilton Yerevan City Centre | bathroom | Owner-supplied (property's own photo) | `doubletree-yerevan-4.webp` | 1024x683, 49 KB |
| DoubleTree by Hilton Yerevan City Centre | breakfast restaurant | Owner-supplied (property's own photo) | `doubletree-yerevan-5.webp` | 1024x683, 55 KB |
| DoubleTree by Hilton Yerevan City Centre | gym | Owner-supplied (property's own photo) | `doubletree-yerevan-6.webp` | 1024x697, 60 KB |
| DoubleTree by Hilton Yerevan City Centre | spa | Owner-supplied (property's own photo) | `doubletree-yerevan-7.webp` | 1024x683, 80 KB |
| DoubleTree by Hilton Yerevan City Centre | sauna | Owner-supplied (property's own photo) | `doubletree-yerevan-8.webp` | 1024x683, 57 KB |
| DoubleTree by Hilton Yerevan City Centre | massage room | Owner-supplied (property's own photo) | `doubletree-yerevan-9.webp` | 1024x640, 51 KB |

DoubleTree by Hilton Yerevan City Centre is no longer in the outstanding table above.

---

## 2026-09-13 — Global hotel-image replacement (owner-supplied)

The owner supplied photos for five more properties directly in
`Images for tours/Hotels/<hotel name>/`, alongside DoubleTree above. Each file was
viewed individually before use. These are shared registry entries in `hotelData.js`,
so replacing each hotel's `images[]` once propagates to every tour that names it:
Ginger Hotel (15 tours), Rooms Hotel Kazbegi (12 tours), Tsinandali Estate, A Radisson
Collection Hotel (7 tours), Yerevan Place and Ani Central Inn (1 tour each — both only
appear on the 10-Day Georgia and Armenia Tour). The prior image sets (unsourced
`UNVERIFIED` files, or the 2026-09-12 official-site pulls for Yerevan Place/Ani Central
Inn) were fully replaced, not appended, and the now-orphaned old files
(`ginger-hotel*.jpg`, `rooms-hotel-kazbegi*.jpg`, `tsinandali-estate*.jpg` under
`public/images/hotels/`) were deleted after confirming no other reference (the
`/images/files/tsinandali-estate.jpg` used in a tour's inline gallery is a different file
in a different directory and was left untouched). Converted to WebP; all source files
were already under the 1600px long-edge cap, so none were resized.

| Hotel | Category | Local file | Size |
|---|---|---|---|
| Ani Central Inn | exterior | `ani-central-inn.webp` | 1024x708, 159 KB |
| Ani Central Inn | lobby | `ani-central-inn-2.webp` | 1024x682, 75 KB |
| Ani Central Inn | room | `ani-central-inn-3.webp` | 1024x650, 52 KB |
| Ani Central Inn | bathroom | `ani-central-inn-4.webp` | 1110x720, 45 KB |
| Ani Central Inn | breakfast | `ani-central-inn-5.webp` | 1024x680, 112 KB |
| Ani Central Inn | swimming pool | `ani-central-inn-6.webp` | 1024x683, 59 KB |
| Ani Central Inn | sauna | `ani-central-inn-7.webp` | 1024x683, 50 KB |
| Ginger Hotel | exterior | `ginger-hotel.webp` | 1200x800, 165 KB |
| Ginger Hotel | lobby | `ginger-hotel-2.webp` | 1024x758, 136 KB |
| Ginger Hotel | room | `ginger-hotel-3.webp` | 1024x683, 82 KB |
| Ginger Hotel | bathroom | `ginger-hotel-4.webp` | 1024x683, 75 KB |
| Rooms Hotel Kazbegi | exterior | `rooms-hotel-kazbegi.webp` | 1024x683, 138 KB |
| Rooms Hotel Kazbegi | lobby (library lounge) | `rooms-hotel-kazbegi-2.webp` | 1024x683, 112 KB |
| Rooms Hotel Kazbegi | room | `rooms-hotel-kazbegi-3.webp` | 1024x683, 83 KB |
| Rooms Hotel Kazbegi | bathroom | `rooms-hotel-kazbegi-4.webp` | 1024x768, 45 KB |
| Rooms Hotel Kazbegi | swimming pool | `rooms-hotel-kazbegi-5.webp` | 1024x768, 142 KB |
| Rooms Hotel Kazbegi | terrace | `rooms-hotel-kazbegi-6.webp` | 1024x683, 128 KB |
| Rooms Hotel Kazbegi | fireplace lounge | `rooms-hotel-kazbegi-7.webp` | 1200x531, 165 KB |
| Tsinandali Estate, A Radisson Collection Hotel | exterior | `tsinandali-estate.webp` | 1199x800, 275 KB |
| Tsinandali Estate, A Radisson Collection Hotel | lobby | `tsinandali-estate-2.webp` | 1200x800, 132 KB |
| Tsinandali Estate, A Radisson Collection Hotel | room | `tsinandali-estate-3.webp` | 1200x800, 53 KB |
| Tsinandali Estate, A Radisson Collection Hotel | bathroom | `tsinandali-estate-4.webp` | 1200x800, 112 KB |
| Tsinandali Estate, A Radisson Collection Hotel | breakfast | `tsinandali-estate-5.webp` | 1200x800, 192 KB |
| Tsinandali Estate, A Radisson Collection Hotel | wine cellar | `tsinandali-estate-6.webp` | 1200x800, 114 KB |
| Tsinandali Estate, A Radisson Collection Hotel | covered pool | `tsinandali-estate-7.webp` | 1200x800, 99 KB |
| Tsinandali Estate, A Radisson Collection Hotel | rooftop pool | `tsinandali-estate-8.webp` | 1200x800, 276 KB |
| Tsinandali Estate, A Radisson Collection Hotel | sauna | `tsinandali-estate-9.webp` | 1200x800, 159 KB |
| Tsinandali Estate, A Radisson Collection Hotel | massage room | `tsinandali-estate-10.webp` | 1200x800, 77 KB |
| Tsinandali Estate, A Radisson Collection Hotel | gym | `tsinandali-estate-11.webp` | 1200x800, 170 KB |
| Tsinandali Estate, A Radisson Collection Hotel | terrace lounge | `tsinandali-estate-12.webp` | 1200x800, 200 KB |
| Tsinandali Estate, A Radisson Collection Hotel | garden | `tsinandali-estate-13.webp` | 1200x800, 297 KB |
| Yerevan Place | exterior | `yerevan-place.webp` | 1024x709, 76 KB |
| Yerevan Place | lobby | `yerevan-place-2.webp` | 1024x683, 79 KB |
| Yerevan Place | room | `yerevan-place-3.webp` | 1024x683, 27 KB |
| Yerevan Place | bathroom | `yerevan-place-4.webp` | 1024x683, 54 KB |
| Yerevan Place | breakfast | `yerevan-place-5.webp` | 1024x683, 114 KB |
| Yerevan Place | gym | `yerevan-place-6.webp` | 1024x683, 102 KB |

Ani Central Inn's exterior gap (noted above as still outstanding on 2026-09-12) is
closed by this pass.

**Future workflow:** for any new tour or hotel entry, check
`Images for tours/Hotels/` for owner-supplied photos FIRST, before falling back to the
official-site / press-kit route this manifest otherwise documents.

---

## 2026-09-19 — Park Hotel Tsinandali (owner-supplied)

The owner supplied six of the property's own photographs directly, dropped in
`Images for tours/Hotels/Park Hotel Tsinandali/` outside the repo (exterior, terrace,
guest room, bathroom, indoor pool, outdoor pool). Each was viewed individually before
use. This is a shared registry entry in `hotelData.js` (`Park Hotel Tsinandali`, not to
be confused with the separate `Tsinandali Estate, A Radisson Collection Hotel` record),
so replacing its `images[]` once propagates to every tour that names it: 7 private
tours currently do. The prior four-photo set (unsourced `UNVERIFIED` files, order
already corrected on 2026-08-29 so the pool no longer led) was fully replaced, not
appended.

Four of the six supplied photos were used, keeping this hotel at the same four-image
convention most records in this file follow. The property has no lobby of its own —
noted as a gap on 2026-08-29 — so its terrace photo fills that slot, the same
substitution already accepted for Boutique Hotel Borjomi Verde. The two pool photos
(indoor and outdoor) were not used: the hotel's description and amenities list make no
mention of a pool, and exterior/terrace/room/bathroom is a stronger guest-oriented set
within a four-image gallery. Converted to WebP; all source files were already under the
1600px long-edge cap, so none were resized.

| Hotel | Category | Local file | Size |
|---|---|---|---|
| Park Hotel Tsinandali | exterior | `park-hotel-tsinandali.webp` | 1024x683, 174 KB |
| Park Hotel Tsinandali | terrace | `park-hotel-tsinandali-2.webp` | 1024x683, 116 KB |
| Park Hotel Tsinandali | room | `park-hotel-tsinandali-3.webp` | 1200x675, 97 KB |
| Park Hotel Tsinandali | bathroom | `park-hotel-tsinandali-4.webp` | 1024x683, 66 KB |

Park Hotel Tsinandali's "lobby" gap (noted above as still outstanding on 2026-08-29) is
closed by this pass via the terrace substitute.

Not used, retained on disk outside the repo in the owner's own folder (not copied into
`public/images/hotels/`): `Indoor Pool.jpg`, `Outdoor Pool.jpg`.

The four prior files (`park-hotel-tsinandali.jpg`, `-2.jpg`, `-3.jpg`, `-4.jpg`) were
superseded by this change and, once no other reference to them remained in the
repository, deleted from `public/images/hotels/` on 2026-09-19 with owner confirmation.

---

## 2026-09-19 — Hotel & Wine Cellar ARGE (owner-supplied)

The owner supplied six of the property's own photographs directly, dropped in
`Images for tours/Hotels/Hotel & Wine Cellar ARGE/` outside the repo (exterior,
lobby, guest room, bathroom, swimming pool, front yard/garden). Each was viewed
individually before use. This is a shared registry entry in `hotelData.js`
(`Hotel & Wine Cellar ARGE`, also resolved from the older `Hotel Arge` spelling via
`hotelAliases`), so replacing its `images[]` once propagates to every tour that names
it: 9 tours currently do (1 group tour, 8 private tours). The prior four-photo set
(unsourced `UNVERIFIED` files, one held with no confident category) was fully
replaced, not appended.

Four of the six supplied photos were used initially, filling the "exterior" gap
flagged on 2026-08-29. Converted to WebP; all source files were already under the
1600px long-edge cap, so none were resized.

| Hotel | Category | Local file | Size |
|---|---|---|---|
| Hotel & Wine Cellar ARGE | exterior | `hotel-arge.webp` | 1024x683, 120 KB |
| Hotel & Wine Cellar ARGE | lobby | `hotel-arge-2.webp` | 1024x683, 145 KB |
| Hotel & Wine Cellar ARGE | room | `hotel-arge-3.webp` | 1024x683, 54 KB |
| Hotel & Wine Cellar ARGE | bathroom | `hotel-arge-4.webp` | 1024x683, 22 KB |

Hotel & Wine Cellar ARGE's "exterior" gap (noted above as still outstanding on
2026-08-29) is closed by this pass. The uncategorised third photo noted in the
2026-08-29 audit (`hotel-arge-3.jpg`, "could not classify with confidence") is also
retired by this replacement — the new room photo is confidently categorised.

The four prior files (`hotel-arge.jpg`, `-2.jpg`, `-3.jpg`, `-4.jpg`) were superseded by
this change and, once no other reference to them remained in the repository, deleted
from `public/images/hotels/` on 2026-09-19 with owner confirmation.

**Follow-up, same day:** the owner asked for the remaining two supplied photos
(front yard, swimming pool) to be added as well, so the gallery now runs to six
images — front yard resized to a 1200px long edge (the source PNG's foliage detail
made the full 1536px WebP unusually large at 506 KB; 1200px brings it in line with
this file's other garden/terrace shots).

| Hotel | Category | Local file | Size |
|---|---|---|---|
| Hotel & Wine Cellar ARGE | front yard | `hotel-arge-5.webp` | 1200x800, 312 KB |
| Hotel & Wine Cellar ARGE | swimming pool | `hotel-arge-6.webp` | 1024x683, 75 KB |
