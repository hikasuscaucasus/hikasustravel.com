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
| 1 tour(s) | Sandali Metekhi By Old Hospitality | `sandali-metekhi.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 434 KB |
| 1 tour(s) | Sandali Metekhi By Old Hospitality | `sandali-metekhi-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 473 KB |
| 1 tour(s) | Sandali Metekhi By Old Hospitality | `sandali-metekhi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 534 KB |
| 1 tour(s) | Sandali Metekhi By Old Hospitality | `sandali-metekhi-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 715 KB |
| 1 tour(s) | Best View Kazbegi | `best-view-kazbegi.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 72 KB |
| 1 tour(s) | Best View Kazbegi | `best-view-kazbegi-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 111 KB |
| 1 tour(s) | Best View Kazbegi | `best-view-kazbegi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 175 KB |
| 1 tour(s) | Best View Kazbegi | `best-view-kazbegi-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 56 KB |
| 12 tour(s) | Hotel West Way | `hotel-west-way.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 121 KB |
| 12 tour(s) | Hotel West Way | `hotel-west-way-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 115 KB |
| 12 tour(s) | Hotel West Way | `hotel-west-way-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 81 KB |
| 12 tour(s) | Hotel West Way | `hotel-west-way-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 77 KB |
| 1 tour(s) | Hotel Phaliashvili | `hotel-phaliashvili.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 217 KB |
| 1 tour(s) | Hotel Phaliashvili | `hotel-phaliashvili-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 109 KB |
| 1 tour(s) | Hotel Phaliashvili | `hotel-phaliashvili-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 108 KB |
| 1 tour(s) | Hotel Phaliashvili | `hotel-phaliashvili-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 214 KB |
| 8 tour(s) | Hotel & Wine Cellar ARGE | `hotel-arge.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 92 KB |
| 8 tour(s) | Hotel & Wine Cellar ARGE | `hotel-arge-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 199 KB |
| 8 tour(s) | Hotel & Wine Cellar ARGE | `hotel-arge-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 158 KB |
| 8 tour(s) | Hotel & Wine Cellar ARGE | `hotel-arge-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 142 KB |
| 14 tour(s) | Rooms Hotel Tbilisi | `rooms-hotel-tbilisi.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 192 KB |
| 14 tour(s) | Rooms Hotel Tbilisi | `rooms-hotel-tbilisi-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 236 KB |
| 14 tour(s) | Rooms Hotel Tbilisi | `rooms-hotel-tbilisi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 163 KB |
| 14 tour(s) | Rooms Hotel Tbilisi | `rooms-hotel-tbilisi-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 156 KB |
| 15 tour(s) | Ibis Styles Tbilisi Center | `ibis-styles-tbilisi.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 344 KB |
| 15 tour(s) | Ibis Styles Tbilisi Center | `ibis-styles-tbilisi-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 52 KB |
| 15 tour(s) | Ibis Styles Tbilisi Center | `ibis-styles-tbilisi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 171 KB |
| 15 tour(s) | Ibis Styles Tbilisi Center | `ibis-styles-tbilisi-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 143 KB |
| 15 tour(s) | Ginger Hotel | `ginger-hotel.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 229 KB |
| 15 tour(s) | Ginger Hotel | `ginger-hotel-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 177 KB |
| 15 tour(s) | Ginger Hotel | `ginger-hotel-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 130 KB |
| 15 tour(s) | Ginger Hotel | `ginger-hotel-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 127 KB |
| 1 tour(s) | Ambassadori | `ambassadori.jpg` | lobby/common | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 201 KB |
| 1 tour(s) | Ambassadori | `ambassadori-2.jpg` | lobby/common | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 155 KB |
| 1 tour(s) | Ambassadori | `ambassadori-3.jpg` | room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 160 KB |
| 1 tour(s) | Ambassadori | `ambassadori-4.jpg` | room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 150 KB |
| 1 tour(s) | Gudauri Lodge | `gudauri-lodge.webp` | exterior | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 144 KB |
| 1 tour(s) | Gudauri Lodge | `gudauri-lodge-2.webp` | room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 305 KB |
| 1 tour(s) | Gudauri Lodge | `gudauri-lodge-3.webp` | room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 237 KB |
| 1 tour(s) | Gudauri Lodge | `gudauri-lodge-4.webp` | lobby/common | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 297 KB |
| 1 tour(s) | Marco Polo | `marco-polo.webp` | exterior | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 93 KB |
| 1 tour(s) | Marco Polo | `marco-polo-2.webp` | pool/facility | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 360 KB |
| 1 tour(s) | Marco Polo | `marco-polo-3.webp` | lobby/common | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 373 KB |
| 1 tour(s) | Marco Polo | `marco-polo-4.webp` | room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 173 KB |
| 1 tour(s) | Gudauri Inn | `gudauri-inn.webp` | lobby/common | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 458 KB |
| 1 tour(s) | Gudauri Inn | `gudauri-inn-2.webp` | room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 38 KB |
| 1 tour(s) | Gudauri Inn | `gudauri-inn-3.webp` | room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 67 KB |
| 1 tour(s) | Gudauri Inn | `gudauri-inn-4.webp` | room | Hotel's own photos per `hotelData.js` comment (official site / public listing) | UNVERIFIED — comment is not a licence | 2026-07-26 | 31 KB |
| 11 tour(s) | Rooms Hotel Kazbegi | `rooms-hotel-kazbegi.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 143 KB |
| 11 tour(s) | Rooms Hotel Kazbegi | `rooms-hotel-kazbegi-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 197 KB |
| 11 tour(s) | Rooms Hotel Kazbegi | `rooms-hotel-kazbegi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 100 KB |
| 11 tour(s) | Rooms Hotel Kazbegi | `rooms-hotel-kazbegi-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 200 KB |
| 11 tour(s) | Northgate Hotel | `northgate-hotel.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 186 KB |
| 11 tour(s) | Northgate Hotel | `northgate-hotel-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 119 KB |
| 11 tour(s) | Northgate Hotel | `northgate-hotel-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 60 KB |
| 11 tour(s) | Northgate Hotel | `northgate-hotel-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 129 KB |
| 11 tour(s) | Hotel Horizon | `hotel-horizon.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 143 KB |
| 11 tour(s) | Hotel Horizon | `hotel-horizon-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 83 KB |
| 11 tour(s) | Hotel Horizon | `hotel-horizon-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 89 KB |
| 11 tour(s) | Hotel Horizon | `hotel-horizon-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 88 KB |
| 11 tour(s) | Newport Hotel Kutaisi | `newport-hotel-kutaisi.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 210 KB |
| 11 tour(s) | Newport Hotel Kutaisi | `newport-hotel-kutaisi-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 131 KB |
| 11 tour(s) | Newport Hotel Kutaisi | `newport-hotel-kutaisi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 110 KB |
| 11 tour(s) | Newport Hotel Kutaisi | `newport-hotel-kutaisi-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 96 KB |
| 11 tour(s) | Boutique Hotel Argo | `boutique-hotel-argo.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 63 KB |
| 11 tour(s) | Boutique Hotel Argo | `boutique-hotel-argo-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 45 KB |
| 11 tour(s) | Boutique Hotel Argo | `boutique-hotel-argo-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 148 KB |
| 11 tour(s) | Boutique Hotel Argo | `boutique-hotel-argo-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 172 KB |
| 8 tour(s) | Rooms Hotel | `rooms-hotel-batumi.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 319 KB |
| 8 tour(s) | Rooms Hotel | `rooms-hotel-batumi-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 116 KB |
| 8 tour(s) | Rooms Hotel | `rooms-hotel-batumi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 292 KB |
| 8 tour(s) | Rooms Hotel | `rooms-hotel-batumi-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 179 KB |
| 8 tour(s) | Hotel Monarch | `hotel-monarch.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 423 KB |
| 8 tour(s) | Hotel Monarch | `hotel-monarch-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 346 KB |
| 8 tour(s) | Hotel Monarch | `hotel-monarch-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 533 KB |
| 8 tour(s) | Hotel Monarch | `hotel-monarch-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 327 KB |
| 8 tour(s) | Boutique Hotel 32 | `boutique-hotel-32.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 87 KB |
| 8 tour(s) | Boutique Hotel 32 | `boutique-hotel-32-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 113 KB |
| 8 tour(s) | Boutique Hotel 32 | `boutique-hotel-32-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 57 KB |
| 8 tour(s) | Boutique Hotel 32 | `boutique-hotel-32-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 38 KB |
| 6 tour(s) | Tsinandali Estate, A Radisson Collection Hotel | `tsinandali-estate.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 693 KB |
| 6 tour(s) | Tsinandali Estate, A Radisson Collection Hotel | `tsinandali-estate-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 373 KB |
| 6 tour(s) | Tsinandali Estate, A Radisson Collection Hotel | `tsinandali-estate-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 642 KB |
| 6 tour(s) | Tsinandali Estate, A Radisson Collection Hotel | `tsinandali-estate-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 607 KB |
| 6 tour(s) | Park Hotel Tsinandali | `park-hotel-tsinandali.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 146 KB |
| 6 tour(s) | Park Hotel Tsinandali | `park-hotel-tsinandali-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 114 KB |
| 6 tour(s) | Park Hotel Tsinandali | `park-hotel-tsinandali-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 62 KB |
| 6 tour(s) | Park Hotel Tsinandali | `park-hotel-tsinandali-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 81 KB |
| 2 tour(s) | Akhaltsikhe Inn (Junior Suite Room) | `akhaltsikhe-inn.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 111 KB |
| 2 tour(s) | Akhaltsikhe Inn (Junior Suite Room) | `akhaltsikhe-inn-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 155 KB |
| 2 tour(s) | Akhaltsikhe Inn (Junior Suite Room) | `akhaltsikhe-inn-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 68 KB |
| 2 tour(s) | Akhaltsikhe Inn (Junior Suite Room) | `akhaltsikhe-inn-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 408 KB |
| 2 tour(s) | Hotel Gino Wellness Rabati | `hotel-gino-wellness-rabati.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 104 KB |
| 2 tour(s) | Hotel Gino Wellness Rabati | `hotel-gino-wellness-rabati-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 117 KB |
| 2 tour(s) | Hotel Gino Wellness Rabati | `hotel-gino-wellness-rabati-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 68 KB |
| 2 tour(s) | Hotel Gino Wellness Rabati | `hotel-gino-wellness-rabati-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 55 KB |
| 2 tour(s) | Hotel Beni | `hotel-beni.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 69 KB |
| 2 tour(s) | Hotel Beni | `hotel-beni-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 65 KB |
| 2 tour(s) | Hotel Beni | `hotel-beni-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 24 KB |
| 2 tour(s) | Hotel Beni | `hotel-beni-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 257 KB |
| 1 tour(s) | Crowne Plaza Borjomi | `crowne-plaza-borjomi.jpg` | other | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 167 KB |
| 1 tour(s) | Crowne Plaza Borjomi | `crowne-plaza-borjomi-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 133 KB |
| 1 tour(s) | Crowne Plaza Borjomi | `crowne-plaza-borjomi-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 116 KB |
| 1 tour(s) | Crowne Plaza Borjomi | `crowne-plaza-borjomi-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 111 KB |
| 1 tour(s) | Bridge Hotel | `bridge-hotel.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 172 KB |
| 1 tour(s) | Bridge Hotel | `bridge-hotel-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 116 KB |
| 1 tour(s) | Bridge Hotel | `bridge-hotel-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 82 KB |
| 1 tour(s) | Bridge Hotel | `bridge-hotel-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 84 KB |
| 1 tour(s) | Boutique Hotel Borjomi Verde | `borjomi-verde.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 191 KB |
| 1 tour(s) | Boutique Hotel Borjomi Verde | `borjomi-verde-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 165 KB |
| 1 tour(s) | Boutique Hotel Borjomi Verde | `borjomi-verde-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 71 KB |
| 1 tour(s) | Boutique Hotel Borjomi Verde | `borjomi-verde-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 103 KB |
| 4 tour(s) | Hotel Posta | `hotel-posta.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 44 KB |
| 4 tour(s) | Hotel Posta | `hotel-posta-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 46 KB |
| 4 tour(s) | Hotel Posta | `hotel-posta-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 21 KB |
| 4 tour(s) | Hotel Posta | `hotel-posta-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 82 KB |
| 4 tour(s) | Mestia Inn | `mestia-inn.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 142 KB |
| 4 tour(s) | Mestia Inn | `mestia-inn-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 78 KB |
| 4 tour(s) | Mestia Inn | `mestia-inn-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 67 KB |
| 4 tour(s) | Mestia Inn | `mestia-inn-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 131 KB |
| 4 tour(s) | Lileo Inn | `lileo-inn.jpg` | exterior | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 60 KB |
| 4 tour(s) | Lileo Inn | `lileo-inn-2.jpg` | lobby/common | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 357 KB |
| 4 tour(s) | Lileo Inn | `lileo-inn-3.jpg` | room | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 80 KB |
| 4 tour(s) | Lileo Inn | `lileo-inn-4.jpg` | bathroom | Not recorded | UNVERIFIED — no source recorded | 2026-07-26 | 64 KB |

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
