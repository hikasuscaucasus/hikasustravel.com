# Georgia content-page image audit — 2026-09-28

Scope: every **published** Georgia Region, City and Place-to-Visit page in `src/data/places.js` (`publishedDestinationPages()` filtered to Georgia; hub pages themselves excluded from changes).

| | |
|---|---|
| Published region pages | 12 |
| Published city pages | 26 |
| Published places-to-visit pages | 185 |
| **Total audited** | **223** |
| GOOD (hero present, unchanged) | 93 |
| Missing imagery before (noHero band) | 130 |
| Updated / corrected | 5 (4 updated, 1 corrected) |
| No suitable owner photo — unchanged | 125 |

## How images were vetted

- **Every candidate was provenance-checked, not just looked at.** 465 of the 747 raw originals in `Images for tours` carry a C2PA manifest signed by *OpenAI Media Service* (`gpt-image`, `trainedAlgorithmicMedia`). Those were rejected as sources, as were shipped ladders cut from them. See [Provenance finding](#provenance-finding).
- Only genuine camera files were used: `David Gareja.jpg`, `Peace Bridge.jpg`, `New folder/Mtkvari River.jpg`, `New folder/View from Narikala.jpg`, `New folder/Rezo Gabriadze Clock Tower.jpg`, Pixel phone shot `PXL_20260730_171224767.jpg`.
- The repo has no `tools/image-pipeline/` (RULES.md / pipeline.config.json / manifest.json do not exist); the site's real recipe was used: `sharp`, WebP q82 + AVIF q60, no upscaling, metadata stripped, EXIF orientation applied, light output sharpening only.

## Changed pages — forensics

| Page | Source file | Subject (visually verified) | Confidence | Provenance | Role | Placement | Production path |
|---|---|---|---|---|---|---|---|
| David Gareja | `Heros only/David Gareja/David Gareja.jpg` 4233×2826 | Lavra courtyard: stone buildings, wooden galleries, small bell tower, sandstone cliff | high | camera JPG, no C2PA/AI marks; pixel-identical (Δ4.2/255) to shipped 20-day ladder | hero | top | `tours/20-day-georgia-grand-tour-wine-hiking-and-culture/david-gareja-monastery-georgia-1600.{webp,avif}` (reused) + `files/david-gareja-monastery-georgia-og-1200x630.{jpg,webp}` (new) |
| Rike Park | `AAA completed/Peace Bridge/Peace Bridge.jpg` 4096×2730 | Bridge of Peace with landscaped Rike Park beds in foreground (owner-package identification) | high | camera JPG, no marks; shipped ladder Δ4.2 vs this file (Δ77/63 vs the AI `Peace Bridge 3/4.png`) | hero | top | existing `.hero--bridge-of-peace` ladder + `bridge-of-peace-tbilisi-georgia-og.jpg` (reused, nothing new) |
| Rike Park | `New folder/View from Narikala.jpg` 4032×2833 | Old Town roofs, Mtkvari, Bridge of Peace, Rike Park "tubes", domed former presidential palace | high | camera JPG, no marks | body figure | end of "The two modern landmarks" | `files/rike-park-bridge-of-peace-panorama-tbilisi-georgia-{768,1200,1536}.{webp,avif}` |
| Metekhi Church | `New folder/Mtkvari River.jpg` 5616×3744 | Metekhi cliff, church on the rim, old houses, river reflection | high (church small in frame) | camera JPG, no marks; the shipped `metekhi-cliff*` / `mtkvari-river-old-tbilisi-cliffs` ladders match the AI PNG instead (Δ6.1) and were NOT reused | hero | top | `files/metekhi-church-cliff-mtkvari-tbilisi-georgia-1600.{webp,avif}` + `…-og-1200x630.{jpg,webp}` |
| Batumi Dancing Fountains | `AAA completed/Batumi/PXL_20260730_171224767.jpg` 4080×3072 | Illuminated fountain jets in a round pool, chequered promenade, blue-lit building (owner labels the scene "dancing fountains of Batumi Boulevard") | medium — Ardagani Lake itself is NOT visible, caption kept neutral | Pixel phone JPG, no marks | hero | top | `batumi/batumi-dancing-fountains-boulevard-night-georgia-1600.{webp,avif}` + `…-og-1200x630.{jpg,webp}` |
| Rezo Gabriadze Theatre & Clock Tower | `New folder/Rezo Gabriadze Clock Tower.jpg` 2421×3441 | Leaning brick clock tower: belfry, bell, gold clock face, planted roof | high | camera JPG, no marks; the shipped `gabriadze-clock-tower*` ladders match the AI PNG (Δ3.2) and were NOT reused | body figure | end of "The clock and the tower" | `files/rezo-gabriadze-leaning-clock-tower-tbilisi-georgia-{768,1200,1536}.{webp,avif}` (pre-cut to the 4:3 frame `BodyFigure` displays) |

## Rejected candidates

| Candidate | Why rejected |
|---|---|
| Colchis Fountain (Kutaisi 1/2.png + shipped ladders) | OpenAI-signed source |
| Metekhi via `Rike-Narikala Cable Car.png` | OpenAI-signed source |
| Gabriadze `Rezo Gabriadze Clock Tower.png`, Peace Bridge 3/4, Batumi Boulevard.png, Dmanisi Sioni 1/2, Bolnisi Museum 1–6 | OpenAI-signed |
| Ninoskhevi Waterfall (Lagodekhi) | raw original absent, 941×1672 gpt-image export size — unverifiable |
| Miniatures Park (31 real photos) | photographs of scale MODELS, not the real buildings |
| Martvili Canyon / Green Bazaar name hits | different places |
| Enguri Dam ("Svaneti photos") | AI folder |
| `Batumi Botanical Garden.jpg`, `shaori-reservoir.jpg` | no provenance, identity unverifiable |

<a id="provenance-finding"></a>
## Provenance finding

Pixel-tracing every hero / body image of the 223 audited pages back to the library found **74 pages that currently ship at least one image cut from an OpenAI-signed original** (heuristic 24×24 greyscale match, Δ<9; verify before acting). They are marked in the last column below. **They were not changed** — replacing them is an owner decision outside this task — but the site's JSON-LD credits them to "Hikasus Travel" as photographs. Tours, things-to-do guides and blogs were not scanned.


## Regions (12)

| Page | URL | Hero | Body imgs | Status | Outcome | AI-derived image on page |
|---|---|---|---|---|---|---|
| Adjara | `/georgia/regions/adjara` | adjara-black-sea-coast-georgia-1448.webp | 7 | GOOD | GOOD — unchanged |  |
| Guria | `/georgia/regions/guria` | ureki-beach-shoreline-guria-georgia-1448.webp | 4 | GOOD | GOOD — unchanged | Ureki Beach 6.png, Ureki Beach 1.png |
| Imereti | `/georgia/regions/imereti` | gelati-monastery-kutaisi-georgia-1491.webp | 7 | GOOD | GOOD — unchanged | Gelati Monastery.png |
| Kakheti | `/georgia/regions/kakheti` | sighnaghi-sunrise-alazani-valley-kakheti-georgia-1448.webp | 15 | GOOD | GOOD — unchanged | Sighnaghi.jpg, Qvevri (Clay Vessels).png +2 |
| Kvemo Kartli | `/georgia/regions/kvemo-kartli` | diamond-bridge-dashbashi-canyon-georgia-1445.webp | 10 | GOOD | GOOD — unchanged | Diamond Bridge at Tsalka (Dashbashi) Canyon.png, Zipline at Tsalka (Dashbashi Canyon).png +1 |
| Lechkhumi | `/georgia/regions/lechkhumi` | khvamli-mountain-georgia-1086.webp | 4 | GOOD | GOOD — unchanged | Khvamli Mountain 4.png, Khvamli Mountain 1.png |
| Mtskheta-Mtianeti | `/georgia/regions/mtskheta-mtianeti` | Ananuri Fortress and Zhinvali Reservoir.jpg | 9 | GOOD | GOOD — unchanged | Gudauri ski tour hero photo.jpeg |
| Racha | `/georgia/regions/racha` | racha-mountains-georgia-1672.webp | 0 | GOOD | GOOD — unchanged |  |
| Samegrelo | `/georgia/regions/samegrelo` | martvili-canyon-turquoise-river-georgia-1086.webp | 4 | GOOD | GOOD — unchanged | Martvili Canyon 2.png, Martvili Canyon 1.png |
| Samtskhe-Javakheti | `/georgia/regions/samtskhe-javakheti` | vardzia-cave-monastery-cliff-face-georgia-1448.webp | 13 | GOOD | GOOD — unchanged | Vardzia 2.png, Vardzia 1.png +3 |
| Shida Kartli | `/georgia/regions/shida-kartli` | uplistsikhe-mtkvari-valley-view-georgia-1448.webp | 10 | GOOD | GOOD — unchanged | Uplistsikhe 6.png, Uplistsikhe 3.png +2 |
| Svaneti | `/georgia/regions/svaneti` | Koruldi Lakes.jpg | 15 | GOOD | GOOD — unchanged | Svanetii.jpg, Glacier.jpg +3 |

## Cities (26)

| Page | URL | Hero | Body imgs | Status | Outcome | AI-derived image on page |
|---|---|---|---|---|---|---|
| Tbilisi | `/georgia/tbilisi` | tbilisi-old-town-narikala-mtkvari-georgia-1448.webp | 8 | GOOD | GOOD — unchanged | Tbilisi.png, Mtkvari River.png +2 |
| Akhaltsikhe | `/georgia/akhaltsikhe` | akhaltsikhe-rabati-fortress-ramparts-georgia-1448.webp | 3 | GOOD | GOOD — unchanged | Akhaltsikhe.png |
| Ambrolauri | `/georgia/ambrolauri` | title band (noHero) | 1 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Bakuriani | `/georgia/bakuriani` | bakuriani-ski-slope-georgia-1600w.webp | 8 | GOOD | GOOD — unchanged | Bakuriani 2.png, Bakuriani 1.png +1 |
| Bakhmaro | `/georgia/bakhmaro` | bakhmaro-guria-georgia-1086.webp | 0 | GOOD | GOOD — unchanged |  |
| Kutaisi | `/georgia/kutaisi` | colchis-fountain-kutaisi-georgia-1448w.webp | 4 | GOOD | GOOD — unchanged | Kutaisi 1.png, Kutaisi 2.png +1 |
| Tskaltubo | `/georgia/tskaltubo` | prometheus-cave-illuminated-chamber-imereti-georgia-1536w.webp | 4 | GOOD | GOOD — unchanged | Prometheus Cave 2.png, Prometheus Cave 3.png +1 |
| Chiatura | `/georgia/chiatura` | chiatura-town-panorama-imereti-georgia-1448w.webp | 16 | GOOD | GOOD — unchanged | Chiatura 1.png, Chiatura Cable Car 1.png +5 |
| Batumi | `/georgia/batumi` | batumi-skyline-beach-georgia-1448.webp | 0 | GOOD | GOOD — unchanged | Batumi 3.png, Batumi Beach 1.png +4 |
| Mtskheta | `/georgia/mtskheta` | jvari-monastery-confluence-mtskheta-georgia-1448.webp | 0 | GOOD | GOOD — unchanged | Svetitskhoveli.png, Svetitskhoveli 2.png +2 |
| Ushguli | `/georgia/ushguli` | ushguli-svan-towers-village-svaneti-georgia-2000w.webp | 0 | GOOD | GOOD — unchanged | Ushguli 2.png, Ushguli 1.png +3 |
| Mestia | `/georgia/mestia` | mestia-town-svaneti-georgia-1448.webp | 5 | GOOD | GOOD — unchanged |  |
| Zugdidi | `/georgia/zugdidi` | dadiani-palace-zugdidi-georgia-1448.webp | 0 | GOOD | GOOD — unchanged | Dadiani Palace Zugdidi.png, Svan towers.png |
| Martvili | `/georgia/martvili` | martvili-canyon-turquoise-river-georgia-1086.webp | 0 | GOOD | GOOD — unchanged | Martvili Canyon 2.png, Martvili Canyon 1.png |
| Telavi | `/georgia/telavi` | telavi-town-view-erekle-ii-monument-kakheti-georgia-1600w.webp | 4 | GOOD | GOOD — unchanged |  |
| Oni | `/georgia/oni` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Name hits examined, none of this subject |  |
| Gurjaani | `/georgia/gurjaani` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Sighnaghi | `/georgia/sighnaghi` | georgia-home.jpg | 0 | GOOD | GOOD — unchanged |  |
| Rustavi | `/georgia/rustavi` | rustavi-fortress-georgia-1448w.webp | 8 | GOOD | GOOD — unchanged | Rustavi Fortress.png |
| Kvareli | `/georgia/kvareli` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Gori | `/georgia/gori` | gori-town-panorama-georgia-1448w.webp | 10 | GOOD | GOOD — unchanged | Gori 4.png, Uplistsikhe Cave Town.png +3 |
| Borjomi | `/georgia/borjomi` | borjomi-central-park-pavilion-georgia-1672.webp | 0 | GOOD | GOOD — unchanged | Borjomi Park 1.png, Borjomi Park 2.png |
| Kazbegi (Stepantsminda) | `/georgia/kazbegi` | kazbegi-mountains-village-georgia-1024.webp | 0 | GOOD | GOOD — unchanged | Kazbegi.png |
| Gudauri | `/georgia/gudauri` | gudauri-ski-resort-caucasus-georgia-1024.webp | 0 | GOOD | GOOD — unchanged | Gudauri.png |
| Dmanisi | `/georgia/dmanisi` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Only AI sources (Dmanisi Sioni / Bolnisi Museum PNGs are OpenAI-signed) |  |
| Bolnisi | `/georgia/bolnisi` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Only AI museum PNGs; page text does not discuss the museum anyway |  |

## Places to visit (185)

| Page | URL | Hero | Body imgs | Status | Outcome | AI-derived image on page |
|---|---|---|---|---|---|---|
| Gomismta (Gomi Mountain) | `/georgia/gomismta` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Tsageri History Museum | `/georgia/racha-lechkhumi/tsageri-history-museum` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Sairme Pillars | `/georgia/racha-lechkhumi/sairme-pillars` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Rachkha Waterfall | `/georgia/racha-lechkhumi/rachkha-waterfall` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Verdzistava Waterfall | `/georgia/racha-lechkhumi/verdzistava-waterfall` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Zubi Fortress | `/georgia/racha-lechkhumi/zubi-fortress` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Orbeli Fortress | `/georgia/racha-lechkhumi/orbeli-fortress` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Lailashi Pool (Okronishi) | `/georgia/racha-lechkhumi/lailashi-pool-okronishi` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Kulbaki Lakes | `/georgia/racha-lechkhumi/kulbaki-lakes` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Cholevi Lake (Lake of Love) | `/georgia/racha-lechkhumi/cholevi-lake` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Khvanchkara Wine Monument | `/georgia/ambrolauri/khvanchkara-wine-monument` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Love Waterfall (Sikvaruli) | `/georgia/racha-lechkhumi/love-waterfall` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Minda Fortress | `/georgia/racha-lechkhumi/minda-fortress` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Nikortsminda Cathedral | `/georgia/racha-lechkhumi/nikortsminda-cathedral` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Library holds only the Georgia-in-Miniature MODEL of it — not the building |  |
| The Oni Synagogue | `/georgia/oni/oni-synagogue` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Library holds only the Georgia-in-Miniature MODEL of it (Miniatures Park) — not the building |  |
| Shaori Lake | `/georgia/racha-lechkhumi/shaori-lake` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. shaori-reservoir.jpg (1600x1200, legacy file, no provenance, identity not verifiable from the frame) — not used |  |
| Udziro Lake | `/georgia/racha-lechkhumi/udziro-lake` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Khvamli Mountain | `/georgia/racha-lechkhumi/khvamli-mountain` | khvamli-mountain-georgia-1086.webp | 9 | GOOD | GOOD — unchanged | Khvamli Mountain 4.png, Khvamli Mountain 2.png +2 |
| Ghvirishi Waterfall | `/georgia/racha-lechkhumi/ghvirishi-waterfall` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Askhi Massif | `/georgia/racha-lechkhumi/askhi-massif` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Dekhviri Fortress | `/georgia/racha-lechkhumi/dekhviri-fortress` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Dmanisi Museum Reserve | `/georgia/dmanisi/dmanisi-museum-reserve` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Only AI sources (Dmanisi Sioni / Bolnisi Museum PNGs are OpenAI-signed) |  |
| Dmanisi Sioni Cathedral | `/georgia/dmanisi/dmanisi-sioni-cathedral` | dmanisi-sioni-cathedral-georgia-1448.webp | 3 | GOOD | GOOD — unchanged | Dmanisi Sioni 1.png, Dmanisi Sioni 2.png |
| Rustavi Central Park | `/georgia/rustavi/rustavi-central-park` | rustavi-central-park-lake.jpg | 4 | GOOD | GOOD — unchanged | 6.jpg |
| Rustavi Fortress | `/georgia/rustavi/rustavi-fortress` | rustavi-fortress.jpg | 3 | GOOD | GOOD — unchanged | 14.jpg |
| The Rustavi History Museum | `/georgia/rustavi/rustavi-history-museum` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Algeti National Park | `/georgia/kvemo-kartli/algeti-national-park` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Birtvisi Fortress | `/georgia/kvemo-kartli/birtvisi-fortress` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Bolnisi Museum | `/georgia/bolnisi/bolnisi-museum` | bolnisi-museum-medieval-hall-georgia-1448.webp | 15 | GOOD | GOOD — unchanged | Bolnisi Museum 1.png, Bolnisi Museum 2.png +4 |
| Bolnisi Sioni Cathedral | `/georgia/bolnisi/bolnisi-sioni-cathedral` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Tsughrughasheni Church | `/georgia/bolnisi/tsughrughasheni-church` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Tsalka (Dashbashi) Canyon | `/georgia/kvemo-kartli/tsalka-dashbashi-canyon` | diamond-bridge-dashbashi-canyon-georgia-1445w.webp | 6 | GOOD | GOOD — unchanged | Diamond Bridge at Tsalka (Dashbashi) Canyon.png, Diamond Bridge.png +2 |
| Ujarma Fortress | `/georgia/kakheti/ujarma-fortress` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Tsinandali Estate | `/georgia/telavi/tsinandali-estate` | tsinandali-estate-chavchavadze-house-kakheti-georgia-1536w.webp | 3 | GOOD | GOOD — unchanged |  |
| The Telavi Bazaar | `/georgia/telavi/telavi-bazaar` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Sighnaghi Museum | `/georgia/sighnaghi/sighnaghi-museum` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Library holds Sighnaghi town views only (and the New folder/Sighnaghi.jpg is OpenAI-signed) — no museum photo |  |
| Shumi Winery | `/georgia/telavi/shumi-winery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Shuamta Monasteries | `/georgia/telavi/shuamta-monasteries` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Rtveli: The Georgian Grape Harvest | `/georgia/kakheti/rtveli-georgian-grape-harvest` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Pankisi Gorge | `/georgia/kakheti/pankisi-gorge` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Kvetera Fortress | `/georgia/kakheti/kvetera-fortress` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Nekresi Monastery | `/georgia/kvareli/nekresi-monastery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Lagodekhi National Park | `/georgia/kakheti/lagodekhi-national-park` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Only the shipped Ninoskhevi ladder exists (941x1672, gpt-image export size, raw original absent) — provenance unverifiable; not used |  |
| Vashlovani National Park | `/georgia/kakheti/vashlovani-national-park` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Kvareli Wine Cave (Khareba) | `/georgia/kvareli/kvareli-wine-cave-khareba` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Ikalto Monastery | `/georgia/telavi/ikalto-monastery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Gurjaani Kvelatsminda | `/georgia/gurjaani/gurjaani-kvelatsminda` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Gremi Archangels' Complex | `/georgia/kakheti/gremi-archangels-complex` | gremi-archangels-complex-kakheti-georgia-1448.webp | 3 | GOOD | GOOD — unchanged | Gremi 1.png, Gremi 2.png |
| The Gombori Pass | `/georgia/kakheti/gombori-pass` | gombori-pass-kakheti-georgia-1536.webp | 0 | GOOD | GOOD — unchanged | Gombori Pass.png |
| The Giant Plane Tree of Telavi | `/georgia/telavi/giant-plane-tree-telavi` | giant-plane-tree-telavi.jpg | 0 | GOOD | GOOD — unchanged |  |
| Equestrian Statue of King Erekle II | `/georgia/telavi/erekle-ii-statue-telavi` | erekle-ii-statue-telavi.jpg | 0 | GOOD | GOOD — unchanged |  |
| David Gareja | `/georgia/kakheti/david-gareja-monastery` | david-gareja-monastery-georgia-1600.webp | 0 | MISSING → UPDATED | UPDATED — Hero added (real JPG, existing 20-day ladder reused) + new social crop |  |
| Bodbe Monastery | `/georgia/sighnaghi/bodbe-monastery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Batonistsikhe Fortress | `/georgia/telavi/batonistsikhe-fortress` | batonis-tsikhe-telavi-kakheti-georgia-1600w.webp | 0 | GOOD | GOOD — unchanged |  |
| Alaverdi Cathedral | `/georgia/telavi/alaverdi-monastery` | alaverdi-cathedral-georgia-1448.webp | 0 | GOOD | GOOD — unchanged | Alaverdi Cathedral.png |
| Ali & Nino Statue | `/georgia/batumi/ali-and-nino-statue` | Ali and Nino Statue Sunset.jpg | 0 | GOOD | GOOD — unchanged |  |
| Alphabetic Tower | `/georgia/batumi/alphabetic-tower` | alphabet-tower-batumi-night-georgia-1122.webp | 6 | GOOD | GOOD — unchanged | Alphabetic Tower 9.png, Alphabetic Tower 8.png +1 |
| Argo Cable Car | `/georgia/batumi/argo-cable-car` | title band (noHero) | 0 | PLACEHOLDER (no hero band) | NO SUITABLE PHOTO — unchanged. No photo in the library (Batumi phone set contains none) |  |
| Batumi Boulevard | `/georgia/batumi/batumi-boulevard` | batumi-boulevard-georgia-1445.webp | 0 | GOOD | GOOD — unchanged | Batumi Boulevard.png |
| Batumi Central Mosque | `/georgia/batumi/batumi-central-mosque` | title band (noHero) | 0 | PLACEHOLDER (no hero band) | NO SUITABLE PHOTO — unchanged. No photo in the library (Batumi phone set contains none) |  |
| Batumi Dolphinarium | `/georgia/batumi/batumi-dolphinarium` | batumi-dolphinarium-building-georgia-1448.webp | 9 | GOOD | GOOD — unchanged | Batumi Dolphinarium 1.png, Batumi Dolphinarium 3.png +2 |
| Batumi Piazza | `/georgia/batumi/batumi-piazza` | Batumi.jpg | 0 | GOOD | GOOD — unchanged |  |
| Batumi Dancing Fountains | `/georgia/batumi/batumi-dancing-fountains` | batumi-dancing-fountains-boulevard-night-georgia-1600.webp | 0 | MISSING → CORRECTED | CORRECTED — Hero added (real phone photo); replaced unrelated "Batumi Black Sea Coast" as the page image; hub card deliberately left as it was |  |
| Europe Square | `/georgia/batumi/europe-square-batumi` | europe-square-batumi-georgia-1448.webp | 3 | GOOD | GOOD — unchanged | Batumi Europe Square.png, Medea Statue, Europe Square.png |
| Goderdzi Pass | `/georgia/batumi/goderdzi-pass` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Gonio Fortress | `/georgia/batumi/gonio-fortress` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Machakhela National Park | `/georgia/batumi/machakhela-national-park` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Makhuntseti Waterfall & Queen Tamar Bridge | `/georgia/batumi/makhuntseti-waterfall-queen-tamar-bridge` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Mtirala National Park | `/georgia/batumi/mtirala-national-park` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Petra Fortress | `/georgia/batumi/petra-fortress` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Georgia in Miniatures Park | `/georgia/guria/georgia-in-miniatures-shekvetili` | uplistsikhe-miniature-shekvetili-georgia-1448.webp | 15 | GOOD | GOOD — unchanged | Uplistsikhe Miniature.png, Svetitskhoveli Miniature.png +4 |
| Musicians Park | `/georgia/guria/musicians-park-shekvetili` | beatles-statue-musicians-park-shekvetili-georgia-1448.webp | 12 | GOOD | GOOD — unchanged | The Beatles.png, Georgians.png +3 |
| Shekvetili Dendrological Park | `/georgia/guria/shekvetili-dendrological-park` | shekvetili-dendrological-park-guria-georgia-1448.webp | 4 | GOOD | GOOD — unchanged | Dendrological Park 2.png, Dendrological Park 3.png +3 |
| Shemokmedi Monastery | `/georgia/guria/shemokmedi-monastery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Ureki Beach | `/georgia/guria/ureki-beach` | ureki-black-magnetic-sand-beach-guria-georgia-1448.webp | 9 | GOOD | GOOD — unchanged | Ureki Beach 1.png, Ureki Beach 4.png +2 |
| Narikala Fortress | `/georgia/tbilisi/narikala-fortress` | narikala-fortress-gate-tbilisi-georgia-1537.webp | 0 | GOOD | GOOD — unchanged | Narikala Fortress.png |
| National Botanical Garden of Georgia | `/georgia/tbilisi/national-botanical-garden-of-georgia` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Tbilisi Opera and Ballet Theatre | `/georgia/tbilisi/tbilisi-opera-and-ballet-theatre` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Parliament of Georgia | `/georgia/tbilisi/parliament-of-georgia` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Rezo Gabriadze Marionette Theatre and Clock Tower | `/georgia/tbilisi/rezo-gabriadze-marionette-theatre` | title band (noHero) | 1 | MISSING → UPDATED | UPDATED — 1 body figure (real portrait JPG cut to the 4:3 figure frame); hero stays a title band |  |
| Rike Park | `/georgia/tbilisi/rike-park` | bridge-of-peace-tbilisi-georgia-2400.webp | 1 | MISSING → UPDATED | UPDATED — Hero added (real Bridge of Peace JPG via existing .hero--bridge-of-peace) + 1 body figure (real Narikala panorama) |  |
| Rike–Narikala Cable Car | `/georgia/tbilisi/rike-narikala-cable-car` | rike-narikala-cable-car-tbilisi-georgia-1024.webp | 0 | GOOD | GOOD — unchanged | Rike-Narikala Cable Car.png |
| Rustaveli Avenue | `/georgia/tbilisi/rustaveli-avenue` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Jan Shardeni Street | `/georgia/tbilisi/shardeni-street` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Sioni Cathedral | `/georgia/tbilisi/sioni-cathedral` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Name hits are Dmanisi Sioni / Bolnisi (different churches; AI PNGs) — none of Tbilisi Sioni |  |
| Tamada (Toastmaster) Statue | `/georgia/tbilisi/tamada-statue` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Tbilisi Juma Mosque | `/georgia/tbilisi/tbilisi-juma-mosque` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Tbilisi Zoo | `/georgia/tbilisi/tbilisi-zoo` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Georgian Museum of Fine Arts | `/georgia/tbilisi/georgian-museum-of-fine-arts` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Korneli Kekelidze Georgian National Centre of Manuscripts | `/georgia/tbilisi/national-centre-of-manuscripts` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Museum of History of Georgian Jews (David Baazov Museum) | `/georgia/tbilisi/museum-history-georgian-jews` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Georgian National Museum (Simon Janashia Museum) | `/georgia/tbilisi/georgian-national-museum` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Name hits examined, none of this subject |  |
| Tbilisi Open Air Museum of Ethnography (Giorgi Chitaia Museum) | `/georgia/tbilisi/open-air-museum-of-ethnography` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Tbilisi Funicular | `/georgia/tbilisi/tbilisi-funicular` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No funicular photograph in the library |  |
| Abanotubani Sulfur Baths | `/georgia/tbilisi/abanotubani-sulfur-baths` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Chreli Abano (Orbeliani Baths) | `/georgia/tbilisi/chreli-abano` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Anchiskhati Basilica | `/georgia/tbilisi/anchiskhati-basilica` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Library holds only the Georgia-in-Miniature MODEL of it — not the building |  |
| The Ateshgah Fire Temple | `/georgia/tbilisi/ateshgah-fire-temple` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Bazari Orbeliani | `/georgia/tbilisi/bazari-orbeliani` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Dezerter Bazaar | `/georgia/tbilisi/dezerter-bazaar` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Dry Bridge Market | `/georgia/tbilisi/dry-bridge-market` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Freedom Square | `/georgia/tbilisi/freedom-square` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Great Synagogue of Tbilisi | `/georgia/tbilisi/great-synagogue-tbilisi` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Holy Trinity Cathedral (Sameba) | `/georgia/tbilisi/holy-trinity-cathedral-sameba` | sameba-holy-trinity-cathedral-tbilisi-georgia-1600.webp | 6 | GOOD | GOOD — unchanged | Sameba 3.png, Sameba 1.png +1 |
| Leghvtakhevi Waterfall | `/georgia/tbilisi/leghvtakhevi-waterfall` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Metekhi Church | `/georgia/tbilisi/metekhi-church` | metekhi-church-cliff-mtkvari-tbilisi-georgia-1600.webp | 0 | MISSING → UPDATED | UPDATED — Hero added (real "Mtkvari River.jpg", new ladder rung + social crop) |  |
| Mother of Georgia (Kartlis Deda) | `/georgia/tbilisi/mother-of-georgia-kartlis-deda` | kartlis-deda-statue-tbilisi-georgia-1448.webp | 3 | GOOD | GOOD — unchanged | Mother of Kartli 1.png, Mother of Kartli 2.png |
| Mtatsminda Park | `/georgia/tbilisi/mtatsminda-park` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Only the legacy tbilisi-metekhi-mtatsminda.jpg (hill seen from the river; no summit/park/funicular in frame) — not used |  |
| The Bridge of Peace | `/georgia/tbilisi/bridge-of-peace` | bridge-of-peace-tbilisi-georgia-2400.webp | 0 | GOOD | GOOD — unchanged |  |
| The Chronicles of Georgia | `/georgia/tbilisi/chronicles-of-georgia` | chronicles-of-georgia-monument-tbilisi-georgia-1448.webp | 3 | GOOD | GOOD — unchanged | Chronicles of Georgia.png, Chronicles of Georgia 2.png |
| Jvari Monastery | `/georgia/mtskheta/jvari-monastery` | jvari-monastery-mtskheta-georgia-1540.webp | 6 | GOOD | GOOD — unchanged | Jvari Monastery.png, Jvari Monaster 2.png +1 |
| Samtavro Monastery | `/georgia/mtskheta/samtavro-monastery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Shio-Mgvime Monastery | `/georgia/mtskheta/shio-mgvime-monastery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Svetitskhoveli Cathedral | `/georgia/mtskheta/svetitskhoveli-cathedral` | svetitskhoveli-cathedral-mtskheta-georgia-1540.webp | 3 | GOOD | GOOD — unchanged | Svetitskhoveli.png, Svetitskhoveli 2.png |
| Gudauri Panorama | `/georgia/gudauri/gudauri-panorama` | gudauri-panorama-friendship-monument-georgia-1448.webp | 3 | GOOD | GOOD — unchanged | Gudauri Panorama.png, Gudauri Panorama 2.png |
| Ananuri Fortress | `/georgia/mtskheta-mtianeti/ananuri-fortress` | Ananuri Fortress and Zhinvali Reservoir.jpg | 5 | GOOD | GOOD — unchanged |  |
| Uplistsikhe | `/georgia/gori/uplistsikhe` | uplistsikhe-princes-church-basilica-georgia-1600w.webp | 10 | GOOD | GOOD — unchanged | Uplistsikhe 2.png, Uplistsikhe 5.png +1 |
| Ateni Sioni | `/georgia/gori/ateni-sioni` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Bateti Lake | `/georgia/shida-kartli/bateti-lake` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Kintsvisi Monastery | `/georgia/shida-kartli/kintsvisi-monastery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Kvatakhevi Monastery | `/georgia/shida-kartli/kvatakhevi-monastery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Samtavisi Cathedral | `/georgia/shida-kartli/samtavisi-cathedral` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Giorgi Tatulashvili Ceramics Studio & Museum | `/georgia/gori/giorgi-tatulashvili-ceramics-studio` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Gori Fortress | `/georgia/gori/gori-fortress` | gori-fortress-georgia-1264w.webp | 6 | GOOD | GOOD — unchanged | Gori Fortress 1.png |
| Stalin Museum | `/georgia/gori/stalin-museum-gori` | stalin-museum-gori-building-georgia-1370w.webp | 6 | GOOD | GOOD — unchanged | Stalin Museum 1.png, Stalin Museum.png +2 |
| Prometheus Cave | `/georgia/imereti/prometheus-cave` | prometheus-cave-imereti-georgia-1536w.webp | 10 | GOOD | GOOD — unchanged | Prometheus Cave 1.png, Prometheus Cave 2.png +4 |
| Gelati Monastery | `/georgia/kutaisi/gelati-monastery` | gelati-monastery-kutaisi-georgia-1491.webp | 0 | GOOD | GOOD — unchanged | Gelati Monastery.png |
| Motsameta Monastery | `/georgia/kutaisi/motsameta-monastery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Vardzia | `/georgia/samtskhe-javakheti/vardzia` | vardzia-cave-monastery-cliff-face-georgia-1448.webp | 3 | GOOD | GOOD — unchanged | Vardzia 2.png, Vardzia 1.png |
| Gergeti Trinity Church | `/georgia/kazbegi/gergeti-trinity-church` | gergeti-trinity-church-kazbegi-georgia-1448.webp | 0 | GOOD | GOOD — unchanged | Gergeti.png |
| Gveleti Waterfalls | `/georgia/kazbegi/gveleti-waterfalls` | gveleti-waterfall-kazbegi-georgia-1200.webp | 0 | GOOD | GOOD — unchanged |  |
| Juta & the Chaukhi Massif | `/georgia/kazbegi/juta` | juta-valley-chaukhi-massif-hammocks-georgia-2400.webp | 9 | GOOD | GOOD — unchanged | Juta Camp.png, Chaukhi Valley.png +1 |
| Truso Valley | `/georgia/kazbegi/truso-valley` | truso-valley-defensive-tower-church-georgia-2400.webp | 0 | GOOD | GOOD — unchanged |  |
| Arsha Waterfall | `/georgia/kazbegi/arsha-waterfall` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Elia Hill (St. Elias Church) | `/georgia/kazbegi/elia-hill-kazbegi` | elia-church-hill-kazbegi-georgia-1448.webp | 0 | GOOD | GOOD — unchanged | Elia Hill Kazbegi.png |
| Gergeti Glacier | `/georgia/kazbegi/gergeti-glacier` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Batumi Botanical Garden | `/georgia/batumi/batumi-botanical-garden` | title band (noHero) | 0 | PLACEHOLDER (no hero band) | NO SUITABLE PHOTO — unchanged. Page already points at "Batumi Botanical Garden.jpg" (1023x1537, no provenance recorded anywhere; portrait) — not verifiable as owner photo; left as the 08-25 noHero decision |  |
| Martvili Canyon | `/georgia/martvili/martvili-canyon` | martvili-canyon-georgia-1086.webp | 3 | GOOD | GOOD — unchanged | Martvili Canyon 1.png, Martvili Canyon 2.png |
| Martvili Monastery (Chkondidi) | `/georgia/martvili/martvili-monastery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Library photos are of Martvili Canyon (a different attraction) — not used |  |
| Nokalakevi (Archaeopolis) | `/georgia/samegrelo/nokalakevi` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Tobavarchkhili (the Silver Lakes) | `/georgia/samegrelo/tobavarchkhili-lakes` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Paliastomi Lake & Kolkheti National Park | `/georgia/samegrelo/paliastomi-lake-kolkheti-national-park` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Dadiani Palace Museum | `/georgia/zugdidi/dadiani-palace-museum` | dadiani-palace-zugdidi-georgia-1448.webp | 0 | GOOD | GOOD — unchanged | Dadiani Palace Zugdidi.png |
| The Enguri Dam | `/georgia/samegrelo/enguri-dam` | title band (noHero) | 3 | NO HERO (body figures only) | NO SUITABLE PHOTO — unchanged. Only the "Svaneti photos" folder (AI-generated); none shows the dam structure. Three body figures from earlier passes untouched |  |
| The Intsra Waterfall | `/georgia/samegrelo/intsra-waterfall` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Kolkheti National Park | `/georgia/samegrelo/kolkheti-national-park` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Chalaadi Glacier | `/georgia/mestia/chalaadi-glacier` | chalaadi-glacier-panorama-svaneti-georgia-1448.webp | 3 | GOOD | GOOD — unchanged |  |
| Mikheil Khergiani House Museum | `/georgia/mestia/mikheil-khergiani-house-museum` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Svaneti Museum of History and Ethnography | `/georgia/mestia/svaneti-museum-history-ethnography` | svaneti-museum-exterior-mestia-georgia-1448.webp | 4 | GOOD | GOOD — unchanged | 62.png, 54.png |
| Koruldi Lakes | `/georgia/mestia/koruldi-lakes` | koruldi-lakes-svaneti-georgia-1364.webp | 3 | GOOD | GOOD — unchanged | Koruldi Lakes.jpg |
| Mount Ushba | `/georgia/svaneti/mount-ushba` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Tetnuldi Ski Resort | `/georgia/mestia/tetnuldi-ski-resort` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Cross Over Mestia | `/georgia/mestia/cross-over-mestia` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Shkhara Glacier | `/georgia/ushguli/shkhara-glacier` | shkhara-glacier-ushguli-svaneti-georgia-1086.webp | 3 | GOOD | GOOD — unchanged | Shkhara Glacier 1.png, Shkhara Glacier 2.png |
| Svan Towers | `/georgia/svaneti/svan-towers` | svan-towers-svaneti-georgia-1024.webp | 2 | GOOD | GOOD — unchanged | Svan towers.png |
| Lamaria Church | `/georgia/ushguli/lamaria-church` | lamaria-church-shkhara-ushguli-svaneti-georgia-1448.webp | 3 | GOOD | GOOD — unchanged |  |
| Margiani House Museum | `/georgia/mestia/margiani-house-museum` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Katskhi Pillar | `/georgia/chiatura/katskhi-pillar` | katskhi-pillar-summit-church-imereti-georgia-1536w.webp | 4 | GOOD | GOOD — unchanged | Katskhi Pillar 2.png, Katskhi Pillar.png +1 |
| Abastumani Astrophysical Observatory | `/georgia/abastumani/abastumani-observatory` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Akhaltsikhe Synagogue | `/georgia/akhaltsikhe/akhaltsikhe-synagogue` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Rabati Fortress | `/georgia/akhaltsikhe/rabati-fortress` | rabati-fortress-akhaltsikhe-georgia-1448.webp | 0 | GOOD | GOOD — unchanged | Rabati Fortress.png |
| Borjomi Central Park | `/georgia/borjomi/borjomi-central-park` | borjomi-central-park-pavilion-georgia-1672.webp | 3 | GOOD | GOOD — unchanged | Borjomi Park 1.png, Borjomi Park 2.png |
| Borjomi Sulphur Pools | `/georgia/borjomi/borjomi-sulphur-pools` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Borjomi-Kharagauli National Park | `/georgia/samtskhe-javakheti/borjomi-kharagauli-national-park` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| The Green Monastery (Mtsvane Monastery) | `/georgia/borjomi/green-monastery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Name hits were the Kutaisi Green Bazaar — different place |  |
| Sapara Monastery | `/georgia/akhaltsikhe/sapara-monastery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Timotesubani Monastery | `/georgia/borjomi/timotesubani-monastery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Khertvisi Fortress | `/georgia/samtskhe-javakheti/khertvisi-fortress` | khertvisi-fortress-towers-georgia-1448.webp | 0 | GOOD | GOOD — unchanged | Khertvisi Fortress.png |
| Tmogvi Fortress | `/georgia/samtskhe-javakheti/tmogvi-fortress` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Lake Paravani | `/georgia/samtskhe-javakheti/lake-paravani` | lake-paravani-javakheti-georgia-1448.webp | 0 | GOOD | GOOD — unchanged | Paravani Lake.png |
| Poka Nunnery (St. Nino Monastery of Poka) | `/georgia/samtskhe-javakheti/poka-nunnery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Vani Archaeological Museum | `/georgia/imereti/vani-archaeological-museum` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Ubisa Monastery | `/georgia/imereti/ubisa-monastery` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Tskaltubo Sanatoriums | `/georgia/tskaltubo/tskaltubo-sanatoriums` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Tetra Cave | `/georgia/tskaltubo/tetra-cave` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Sataplia Nature Reserve | `/georgia/imereti/sataplia-nature-reserve` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Okatse (Kinchkha) Waterfall | `/georgia/imereti/okatse-kinchkha-waterfall` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Mghvimevi Monastery | `/georgia/chiatura/mghvimevi-monastery` | mghvimevi-monastery-cliff-path-imereti-georgia-1600w.webp | 4 | GOOD | GOOD — unchanged |  |
| Chiatura Cable Cars | `/georgia/chiatura/chiatura-cable-cars` | chiatura-cable-car-gondola-georgia-1536.webp | 0 | GOOD | GOOD — unchanged | Chiatura Cable Car.png |
| Bagrati Cathedral | `/georgia/kutaisi/bagrati-cathedral` | bagrati-cathedral-kutaisi-georgia-1600.webp | 0 | GOOD | GOOD — unchanged | Bagrati Cathedral.png |
| Colchis Fountain | `/georgia/kutaisi/colchis-fountain-kutaisi` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. Only sources are AI: Kutaisi 1/2.png (OpenAI-signed) and the shipped colchis-fountain ladders cut from them |  |
| White Bridge | `/georgia/kutaisi/white-bridge-kutaisi` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Green Bazaar (Mtsvane Bazari) | `/georgia/kutaisi/green-bazaar-kutaisi` | kutaisi-green-bazaar-produce-stalls-georgia-1448.webp | 0 | GOOD | GOOD — unchanged | Kutaisi Green Bazaar.png |
| Kutaisi State Historical Museum | `/georgia/kutaisi/kutaisi-state-historical-museum` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
| Kutaisi Synagogue | `/georgia/kutaisi/kutaisi-synagogue` | title band (noHero) | 0 | NO EDITORIAL IMAGERY | NO SUITABLE PHOTO — unchanged. No owner photo of this subject in the library |  |
