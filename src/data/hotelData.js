const hotelData = {
  'Sandali Metekhi By Old Hospitality': {
    images: [
      { src: '/images/hotels/sandali-metekhi.jpg', alt: 'Sandali Metekhi By Old Hospitality hotel building exterior in Tbilisi Old Town, Georgia' },
      { src: '/images/hotels/sandali-metekhi-2.jpg', alt: 'Sandali Metekhi hotel lobby and reception area with Art Deco interior design, Tbilisi' },
      { src: '/images/hotels/sandali-metekhi-3.jpg', alt: 'Sandali Metekhi hotel guest room with elegant furnishings, Tbilisi' },
      { src: '/images/hotels/sandali-metekhi-4.jpg', alt: 'Sandali Metekhi hotel bathroom with bathtub and modern amenities, Tbilisi' },
    ],
    stars: 4,
    description: 'An Art Deco boutique hotel nestled in Tbilisi\'s historic Metekhi district. With a stunning rooftop bar offering panoramic views of Narikala Fortress and the Old Town, Sandali Metekhi blends Georgian charm with modern luxury for an unforgettable stay.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'Rooftop Bar & Restaurant' },
      { icon: 'ac', label: 'Air Conditioning' },
      { icon: 'parking', label: 'Private Parking' },
      { icon: 'concierge', label: '24/7 Concierge' },
    ],
    locationHighlights: [
      'Walking distance to Metekhi Bridge & Old Town',
      'Views of Narikala Fortress from rooftop terrace',
      'Steps away from the famous sulfur baths district',
    ],
  },
  'Best View Kazbegi': {
    images: [
      { src: '/images/hotels/best-view-kazbegi.jpg', alt: 'Best View Kazbegi hotel building exterior in Stepantsminda with Caucasus mountain backdrop' },
      { src: '/images/hotels/best-view-kazbegi-2.jpg', alt: 'Best View Kazbegi hotel lobby and common area with comfortable seating, Stepantsminda' },
      { src: '/images/hotels/best-view-kazbegi-3.jpg', alt: 'Best View Kazbegi hotel guest room with mountain views in Stepantsminda, Georgia' },
      { src: '/images/hotels/best-view-kazbegi-4.jpg', alt: 'Best View Kazbegi hotel bathroom with shower in Stepantsminda, Georgia' },
    ],
    stars: 4,
    description: 'Perched high in the Greater Caucasus mountains with a 9.7 guest rating, Best View Kazbegi lives up to its name. Wake up to jaw-dropping panoramas of Mount Kazbek and the iconic Gergeti Trinity Church, all from the comfort of your cozy mountain retreat.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'Mountain-View Restaurant' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'terrace', label: 'Panoramic Terrace' },
      { icon: 'heating', label: 'Central Heating' },
    ],
    locationHighlights: [
      'Direct views of Gergeti Trinity Church',
      'Gateway to Kazbegi National Park hiking trails',
      'Just minutes from Stepantsminda town center',
    ],
  },
  'Hotel West Way': {
    images: [
      { src: '/images/hotels/hotel-west-way.jpg', alt: 'Hotel West Way building exterior in Kutaisi, Georgia' },
      { src: '/images/hotels/hotel-west-way-2.jpg', alt: 'Hotel West Way lobby and reception area in Kutaisi, Georgia' },
      { src: '/images/hotels/hotel-west-way-3.jpg', alt: 'Hotel West Way comfortable guest room in Kutaisi, Georgia' },
      { src: '/images/hotels/hotel-west-way-4.jpg', alt: 'Hotel West Way bathroom with shower in Kutaisi, Georgia' },
    ],
    stars: 4,
    description: 'A welcoming hotel in the heart of Kutaisi featuring lush gardens and a BBQ area perfect for relaxing evenings. Hotel West Way serves as the ideal base for exploring the magnificent Prometheus Cave, Sataplia Nature Reserve, and the ancient Gelati Monastery.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'On-Site Restaurant' },
      { icon: 'garden', label: 'Garden & BBQ Area' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'ac', label: 'Air Conditioning' },
    ],
    locationHighlights: [
      'Base for Prometheus Cave & Martvili Canyon trips',
      'Close to UNESCO-listed Gelati Monastery',
      'Walking distance to Kutaisi city center',
    ],
  },
  'Hotel Phaliashvili': {
    images: [
      { src: '/images/hotels/hotel-phaliashvili.jpg', alt: 'Hotel Phaliashvili building exterior with balconies in Batumi, Georgia' },
      { src: '/images/hotels/hotel-phaliashvili-2.jpg', alt: 'Hotel Phaliashvili lobby and interior staircase with ornate railings, Batumi' },
      { src: '/images/hotels/hotel-phaliashvili-3.jpg', alt: 'Hotel Phaliashvili comfortable guest room near Batumi Boulevard' },
      { src: '/images/hotels/hotel-phaliashvili-4.jpg', alt: 'Hotel Phaliashvili bathroom with shower and modern fixtures, Batumi' },
    ],
    stars: 3,
    description: 'A charming seaside hotel in Batumi with a 9.2 guest rating, Hotel Phaliashvili offers a fantastic rooftop terrace with Black Sea views. Located steps from the famous Batumi Boulevard, it\'s the perfect home base for exploring Georgia\'s vibrant coastal city.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'terrace', label: 'Rooftop Terrace' },
      { icon: 'ac', label: 'Air Conditioning' },
      { icon: 'concierge', label: '24/7 Reception' },
      { icon: 'breakfast', label: 'Daily Breakfast' },
    ],
    locationHighlights: [
      'Steps from Batumi Boulevard & Black Sea beach',
      'Near the charming Piazza Square',
      'Walking distance to Batumi Old Town',
    ],
  },
  // Canonical record for the Arge vineyard hotel in Ruispiri near Telavi.
  // This used to be two entries — "Hotel & Wine Cellar ARGE" and "Hotel Arge" —
  // pointing at the same four photos but carrying different descriptions and
  // amenities. They are merged here, and the tour data now uses this one
  // spelling everywhere. Facts below are the verified set; only confirmed
  // details are listed. The old spelling still resolves via `hotelAliases`.
  'Hotel & Wine Cellar ARGE': {
    images: [
      { src: '/images/hotels/hotel-arge.jpg', alt: 'Hotel and Wine Cellar ARGE building exterior with garden in Telavi, Kakheti wine region, Georgia' },
      { src: '/images/hotels/hotel-arge-2.jpg', alt: 'Hotel ARGE lobby and lounge area in Telavi, Georgia' },
      { src: '/images/hotels/hotel-arge-3.jpg', alt: 'Hotel ARGE guest room with vineyard views in Kakheti, Georgia' },
      { src: '/images/hotels/hotel-arge-4.jpg', alt: 'Hotel ARGE bathroom with modern amenities in Telavi, Georgia' },
    ],
    stars: null,
    description: 'A vineyard hotel in the village of Ruispiri, a few kilometres from Telavi, welcoming guests since 2018. Hotel Arge has its own wine cellar for tastings, an outdoor pool and a garden restaurant, with most rooms opening onto balconies that look out over the Alazani Valley and the Greater Caucasus.',
    amenities: [
      { icon: 'wine', label: 'Wine Cellar & Tasting' },
      { icon: 'pool', label: 'Swimming Pool' },
      { icon: 'garden', label: 'Private Vineyards' },
      { icon: 'restaurant', label: 'Garden Restaurant' },
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'parking', label: 'Free Parking' },
    ],
    locationHighlights: [
      'Ruispiri village, about 3 km from Telavi',
      'Views over the Alazani Valley & Caucasus Mountains',
      'In the heart of the Kakheti wine country',
    ],
  },
  'Rooms Hotel Tbilisi': {
    images: [
      { src: '/images/hotels/rooms-hotel-tbilisi.jpg', alt: 'Rooms Hotel Tbilisi building exterior on the banks of the Mtkvari River, Georgia' },
      { src: '/images/hotels/rooms-hotel-tbilisi-2.jpg', alt: 'Rooms Hotel Tbilisi stylish lobby and lounge with designer furniture' },
      { src: '/images/hotels/rooms-hotel-tbilisi-3.jpg', alt: 'Rooms Hotel Tbilisi guest room with contemporary design and city views' },
      { src: '/images/hotels/rooms-hotel-tbilisi-4.jpg', alt: 'Rooms Hotel Tbilisi bathroom with modern fixtures, Tbilisi' },
    ],
    stars: 4,
    description: 'A design-forward boutique hotel housed in a converted Soviet-era publishing house on the banks of the Mtkvari River. Rooms Hotel Tbilisi is a cultural landmark in its own right, blending industrial-chic aesthetics with warm Georgian hospitality, a vibrant lobby bar, and a celebrated restaurant.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'Restaurant & Lobby Bar' },
      { icon: 'ac', label: 'Air Conditioning' },
      { icon: 'concierge', label: '24/7 Concierge' },
      { icon: 'gym', label: 'Fitness Center' },
    ],
    locationHighlights: [
      'On the Mtkvari River in Vera district',
      'Walking distance to Rustaveli Avenue & Opera House',
      'Near Fabrika and Tbilisi\'s trendy café scene',
    ],
  },
  'Ibis Styles Tbilisi Center': {
    images: [
      { src: '/images/hotels/ibis-styles-tbilisi.jpg', alt: 'Ibis Styles Tbilisi Center modern hotel building on Rustaveli Avenue, Georgia' },
      { src: '/images/hotels/ibis-styles-tbilisi-2.jpg', alt: 'Ibis Styles Tbilisi Center lobby and reception area' },
      { src: '/images/hotels/ibis-styles-tbilisi-3.jpg', alt: 'Ibis Styles Tbilisi Center bright guest room with modern furnishings' },
      { src: '/images/hotels/ibis-styles-tbilisi-4.jpg', alt: 'Ibis Styles Tbilisi Center bathroom with contemporary design' },
    ],
    stars: 4,
    description: 'A colorful and contemporary hotel right on Tbilisi\'s main Rustaveli Avenue. Ibis Styles Tbilisi Center offers reliable international-standard comfort with a playful design, complimentary breakfast, and an unbeatable central location for exploring the capital.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'breakfast', label: 'Complimentary Breakfast' },
      { icon: 'ac', label: 'Air Conditioning' },
      { icon: 'concierge', label: '24/7 Reception' },
      { icon: 'parking', label: 'Parking Available' },
    ],
    locationHighlights: [
      'Directly on Rustaveli Avenue',
      'Steps from the Georgian National Museum',
      'Easy access to Liberty Square & Old Town',
    ],
  },
  'Ginger Hotel': {
    images: [
      { src: '/images/hotels/ginger-hotel.jpg', alt: 'Ginger Hotel building exterior in Tbilisi Old Town, Georgia' },
      { src: '/images/hotels/ginger-hotel-2.jpg', alt: 'Ginger Hotel lobby and common area in Tbilisi' },
      { src: '/images/hotels/ginger-hotel-3.jpg', alt: 'Ginger Hotel clean and comfortable guest room in Tbilisi' },
      { src: '/images/hotels/ginger-hotel-4.jpg', alt: 'Ginger Hotel bathroom with modern amenities in Tbilisi' },
    ],
    stars: 3,
    description: 'A cheerful budget-friendly hotel tucked into the winding streets of Tbilisi\'s Old Town. Ginger Hotel offers clean, comfortable rooms with a warm atmosphere and friendly staff, making it a great-value base for travelers who want to be in the heart of the action.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'breakfast', label: 'Daily Breakfast' },
      { icon: 'ac', label: 'Air Conditioning' },
      { icon: 'concierge', label: '24/7 Reception' },
      { icon: 'laundry', label: 'Laundry Service' },
    ],
    locationHighlights: [
      'In the heart of Tbilisi Old Town',
      'Walking distance to sulfur baths & Narikala Fortress',
      'Surrounded by cafés, restaurants & shops',
    ],
  },
  // Hotels used by the 7-Day Gudauri Ski Tour. Photos are each hotel's own images
  // (from their official sites / public listings). Descriptions are our own
  // wording; facts (stars, ski access, spa/pool, altitude, location) are from
  // public hotel information.
  'Ambassadori': {
    images: [
      { src: '/images/hotels/ambassadori.jpg', alt: 'Ambassadori Tbilisi Hotel grand entrance and facade in the city centre, Georgia' },
      { src: '/images/hotels/ambassadori-2.jpg', alt: 'Ambassadori Tbilisi Hotel lobby with chandelier and marble floor' },
      { src: '/images/hotels/ambassadori-3.jpg', alt: 'Ambassadori Tbilisi Hotel elegant classic guest room' },
      { src: '/images/hotels/ambassadori-4.jpg', alt: 'Ambassadori Tbilisi Hotel suite living room with city views' },
    ],
    stars: 5,
    description: 'A polished five-star retreat on historic Shavteli Street, right in the heart of Tbilisi\'s Old Town. Ambassadori pairs elegant, spacious rooms with a full spa and indoor pool, two restaurants and a rooftop terrace — a refined, central base within easy walking distance of the sulfur baths, Narikala Fortress and the city\'s landmarks.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'pool', label: 'Indoor Pool' },
      { icon: 'spa', label: 'Spa & Sauna' },
      { icon: 'restaurant', label: 'Two Restaurants' },
      { icon: 'gym', label: 'Fitness Center' },
      { icon: 'parking', label: 'Free Parking' },
    ],
    locationHighlights: [
      'On Shavteli Street in the historic Old Town',
      'Walking distance to the sulfur baths & Narikala Fortress',
      'Rooftop terrace overlooking old Tbilisi',
    ],
  },
  'Gudauri Lodge': {
    images: [
      { src: '/images/hotels/gudauri-lodge.webp', alt: 'Gudauri Lodge modern hotel building in the snowy Caucasus mountains, Gudauri, Georgia' },
      { src: '/images/hotels/gudauri-lodge-2.webp', alt: 'Gudauri Lodge suite living room with snowy mountain views' },
      { src: '/images/hotels/gudauri-lodge-3.webp', alt: 'Gudauri Lodge contemporary twin guest room' },
      { src: '/images/hotels/gudauri-lodge-4.webp', alt: 'Gudauri Lodge library and lounge area' },
    ],
    stars: 5,
    description: 'A contemporary five-star mountain lodge set right beside the pistes in the center of Gudauri, with genuine ski-in, ski-out access. After a day on the snow you can unwind in the wellness center — indoor and outdoor pools, an outdoor hot tub, sauna and steam room — then dine in the signature Georgian restaurant. Spacious modern rooms, a ski depot and a sun terrace make it a comfortable, self-contained base for a ski week.',
    amenities: [
      { icon: 'pool', label: 'Indoor & Outdoor Pools' },
      { icon: 'spa', label: 'Spa, Sauna & Hot Tub' },
      { icon: 'gym', label: 'Fitness Center' },
      { icon: 'restaurant', label: 'Restaurant & Bar' },
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'terrace', label: 'Sun Terrace' },
    ],
    locationHighlights: [
      'Ski-in, ski-out — right beside the slopes',
      'In the center of Gudauri, next to the lifts',
      'Wellness center with indoor & outdoor pools',
    ],
  },
  'Marco Polo': {
    images: [
      { src: '/images/hotels/marco-polo.webp', alt: 'Marco Polo Hotel Gudauri illuminated at night in the winter mountains, Georgia' },
      { src: '/images/hotels/marco-polo-2.webp', alt: 'Marco Polo Hotel Gudauri indoor swimming pool with mountain views' },
      { src: '/images/hotels/marco-polo-3.webp', alt: 'Marco Polo Hotel Gudauri lobby lounge with sofas and staircase' },
      { src: '/images/hotels/marco-polo-4.webp', alt: 'Marco Polo Hotel Gudauri comfortable guest room' },
    ],
    stars: 5,
    description: 'Gudauri\'s original ski hotel, welcoming guests since 1988 and still one of the resort\'s landmarks. Marco Polo sits slope-side at around 2,000 metres with ski-in, ski-out access, backed by a large spa and wellness center — indoor and outdoor pools, saunas and a hot tub — plus a bowling alley, padel courts and the Soliko restaurant serving Georgian and European cuisine. A lively, full-service base in the middle of the resort.',
    amenities: [
      { icon: 'pool', label: 'Indoor & Outdoor Pools' },
      { icon: 'spa', label: 'Spa, Sauna & Hot Tub' },
      { icon: 'restaurant', label: 'Soliko Restaurant' },
      { icon: 'gym', label: 'Fitness Center' },
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'concierge', label: '24/7 Reception' },
    ],
    locationHighlights: [
      'Ski-in, ski-out in central Gudauri',
      'Slope-side at around 2,000 m',
      'Bowling, padel courts & spa on site',
    ],
  },
  'Gudauri Inn': {
    images: [
      { src: '/images/hotels/gudauri-inn.webp', alt: 'Gudauri Inn mountain-view lounge with hanging chairs, Gudauri, Georgia' },
      { src: '/images/hotels/gudauri-inn-2.webp', alt: 'Gudauri Inn comfortable double guest room' },
      { src: '/images/hotels/gudauri-inn-3.webp', alt: 'Gudauri Inn bright twin guest room' },
      { src: '/images/hotels/gudauri-inn-4.webp', alt: 'Gudauri Inn twin guest room with balcony and mountain views' },
    ],
    stars: 4,
    description: 'A comfortable, easy-going hotel in the heart of Gudauri at 2,200 metres, with a relaxed mountain atmosphere and wide views over the surrounding peaks. It has its own wellness center with an indoor pool, jacuzzi and sauna, a restaurant serving Georgian and international dishes, and a bar for local wines. Good value and welcoming, it makes a solid classic-tier base for a Gudauri ski trip.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'pool', label: 'Indoor Pool' },
      { icon: 'spa', label: 'Sauna & Jacuzzi' },
      { icon: 'restaurant', label: 'Restaurant & Bar' },
      { icon: 'parking', label: 'Free Parking' },
    ],
    locationHighlights: [
      'In the center of Gudauri at 2,200 m',
      'Wellness center with indoor pool, jacuzzi & sauna',
      'Panoramic Greater Caucasus views',
    ],
  },
  'Rooms Hotel Kazbegi': {
    images: [
      { src: '/images/hotels/rooms-hotel-kazbegi.jpg', alt: 'Rooms Hotel Kazbegi striking modern building against the Greater Caucasus mountains, Stepantsminda' },
      { src: '/images/hotels/rooms-hotel-kazbegi-2.jpg', alt: 'Rooms Hotel Kazbegi lobby and reception with mountain views' },
      { src: '/images/hotels/rooms-hotel-kazbegi-3.jpg', alt: 'Rooms Hotel Kazbegi luxurious guest room with Mount Kazbek views' },
      { src: '/images/hotels/rooms-hotel-kazbegi-4.jpg', alt: 'Rooms Hotel Kazbegi bathroom with modern fixtures, Stepantsminda' },
    ],
    stars: 4,
    description: 'A design masterpiece set against the dramatic backdrop of Mount Kazbek. Rooms Hotel Kazbegi is one of Georgia\'s most iconic luxury retreats, offering floor-to-ceiling mountain views, a crackling fireplace lounge, an indoor pool, and a spa — the ultimate mountain escape.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'Restaurant & Bar' },
      { icon: 'pool', label: 'Indoor Pool' },
      { icon: 'spa', label: 'Spa & Sauna' },
      { icon: 'parking', label: 'Free Parking' },
    ],
    locationHighlights: [
      'Iconic views of Mount Kazbek & Gergeti Trinity Church',
      'Gateway to Kazbegi National Park trails',
      'In the center of Stepantsminda village',
    ],
  },
  'Northgate Hotel': {
    images: [
      { src: '/images/hotels/northgate-hotel.jpg', alt: 'Northgate Hotel building exterior in Stepantsminda, Kazbegi region, Georgia' },
      { src: '/images/hotels/northgate-hotel-2.jpg', alt: 'Northgate Hotel lobby and rest area with mountain views in Kazbegi' },
      { src: '/images/hotels/northgate-hotel-3.jpg', alt: 'Northgate Hotel comfortable guest room with balcony in Stepantsminda' },
      { src: '/images/hotels/northgate-hotel-4.jpg', alt: 'Northgate Hotel bathroom with modern amenities in Stepantsminda' },
    ],
    stars: 3,
    description: 'A comfortable mid-range hotel in the heart of Stepantsminda with warm hospitality and mountain views. Northgate Hotel provides a cozy retreat after a day of Caucasus adventures, with a welcoming restaurant serving hearty Georgian cuisine and well-appointed rooms.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'On-Site Restaurant' },
      { icon: 'heating', label: 'Central Heating' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'terrace', label: 'Mountain-View Terrace' },
    ],
    locationHighlights: [
      'Central Stepantsminda location',
      'Close to Gergeti Trinity Church trailhead',
      'Views of the Greater Caucasus range',
    ],
  },
  'Hotel Horizon': {
    images: [
      { src: '/images/hotels/hotel-horizon.jpg', alt: 'Hotel Horizon building exterior in Stepantsminda with mountain scenery, Kazbegi' },
      { src: '/images/hotels/hotel-horizon-2.jpg', alt: 'Hotel Horizon lobby and common area in Kazbegi' },
      { src: '/images/hotels/hotel-horizon-3.jpg', alt: 'Hotel Horizon guest room with views in Stepantsminda, Georgia' },
      { src: '/images/hotels/hotel-horizon-4.jpg', alt: 'Hotel Horizon bathroom with shower in Stepantsminda, Georgia' },
    ],
    stars: 3,
    description: 'A budget-friendly guesthouse-style hotel in Stepantsminda offering simple, clean rooms and genuine Georgian warmth. Hotel Horizon is perfect for travelers who want to explore the Kazbegi region without breaking the bank, with home-cooked meals and a friendly atmosphere.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'Home-Cooked Meals' },
      { icon: 'heating', label: 'Central Heating' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'terrace', label: 'Garden Terrace' },
    ],
    locationHighlights: [
      'Quiet location in Stepantsminda',
      'Easy access to Kazbegi hiking trails',
      'Views of the surrounding Caucasus peaks',
    ],
  },
  'Newport Hotel Kutaisi': {
    images: [
      { src: '/images/hotels/newport-hotel-kutaisi.jpg', alt: 'Newport Hotel Kutaisi elegant building exterior in the center of Kutaisi, Georgia' },
      { src: '/images/hotels/newport-hotel-kutaisi-2.jpg', alt: 'Newport Hotel Kutaisi lobby and reception area' },
      { src: '/images/hotels/newport-hotel-kutaisi-3.jpg', alt: 'Newport Hotel Kutaisi spacious guest room with contemporary design' },
      { src: '/images/hotels/newport-hotel-kutaisi-4.jpg', alt: 'Newport Hotel Kutaisi bathroom with modern fixtures' },
    ],
    stars: 4,
    description: 'A stylish and modern hotel in the center of Kutaisi, Georgia\'s second-largest city. Newport Hotel offers spacious rooms with contemporary interiors, an excellent restaurant, and a prime location for exploring the region\'s UNESCO World Heritage sites and natural wonders.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'Restaurant & Bar' },
      { icon: 'ac', label: 'Air Conditioning' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'concierge', label: '24/7 Reception' },
    ],
    locationHighlights: [
      'Central Kutaisi, near the White Bridge',
      'Base for Prometheus Cave & Martvili Canyon',
      'Close to UNESCO-listed Bagrati Cathedral',
    ],
  },
  'Boutique Hotel Argo': {
    images: [
      { src: '/images/hotels/boutique-hotel-argo.jpg', alt: 'Boutique Hotel Argo building exterior in central Kutaisi, Georgia' },
      { src: '/images/hotels/boutique-hotel-argo-2.jpg', alt: 'Boutique Hotel Argo reception and lobby area in Kutaisi' },
      { src: '/images/hotels/boutique-hotel-argo-3.jpg', alt: 'Boutique Hotel Argo well-appointed guest room in Kutaisi' },
      { src: '/images/hotels/boutique-hotel-argo-4.jpg', alt: 'Boutique Hotel Argo bathroom with modern amenities in Kutaisi' },
    ],
    stars: 3,
    description: 'A charming boutique hotel in central Kutaisi named after the legendary Argonauts who sailed to ancient Colchis. Boutique Hotel Argo offers comfortable rooms, warm service, and a great location for discovering Kutaisi\'s rich history and the stunning natural attractions of Imereti.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'breakfast', label: 'Daily Breakfast' },
      { icon: 'ac', label: 'Air Conditioning' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'concierge', label: 'Tour Assistance' },
    ],
    locationHighlights: [
      'Central Kutaisi location',
      'Near Kutaisi Market & Colchis Fountain',
      'Easy access to Gelati Monastery & Sataplia Reserve',
    ],
  },
  'Rooms Hotel': {
    images: [
      { src: '/images/hotels/rooms-hotel-batumi.jpg', alt: 'Rooms Hotel Batumi striking exterior on the Black Sea waterfront, Georgia' },
      { src: '/images/hotels/rooms-hotel-batumi-2.jpg', alt: 'Rooms Hotel Batumi lobby lounge with stylish interior design' },
      { src: '/images/hotels/rooms-hotel-batumi-3.jpg', alt: 'Rooms Hotel Batumi elegant guest suite with sea views' },
      { src: '/images/hotels/rooms-hotel-batumi-4.jpg', alt: 'Rooms Hotel Batumi bathroom with premium fixtures and amenities' },
    ],
    stars: 5,
    description: 'The crown jewel of Batumi\'s waterfront, Rooms Hotel Batumi is a luxury design hotel with a stunning rooftop pool overlooking the Black Sea. With world-class dining, impeccable service, and interiors that blend industrial chic with coastal elegance, it\'s the finest address on Georgia\'s coast.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'Fine Dining Restaurant' },
      { icon: 'pool', label: 'Rooftop Pool' },
      { icon: 'spa', label: 'Spa & Wellness' },
      { icon: 'concierge', label: '24/7 Concierge' },
    ],
    locationHighlights: [
      'Prime Batumi Boulevard waterfront location',
      'Steps from the Black Sea beach',
      'Near Batumi\'s vibrant nightlife & Old Town',
    ],
  },
  'Hotel Monarch': {
    images: [
      { src: '/images/hotels/hotel-monarch.jpg', alt: 'Hotel Monarch modern building exterior in Batumi, Georgia' },
      { src: '/images/hotels/hotel-monarch-2.jpg', alt: 'Hotel Monarch lobby and reception area in Batumi' },
      { src: '/images/hotels/hotel-monarch-3.jpg', alt: 'Hotel Monarch comfortable guest room with balcony views in Batumi' },
      { src: '/images/hotels/hotel-monarch-4.jpg', alt: 'Hotel Monarch bathroom with modern amenities in Batumi' },
    ],
    stars: 4,
    description: 'A polished mid-range hotel in the heart of Batumi offering modern rooms, many with balconies and sea views. Hotel Monarch combines comfort and value with a convenient location near Batumi Boulevard, making it an excellent choice for exploring Georgia\'s sunny Black Sea coast.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'breakfast', label: 'Complimentary Breakfast' },
      { icon: 'ac', label: 'Air Conditioning' },
      { icon: 'concierge', label: '24/7 Reception' },
      { icon: 'laundry', label: 'Laundry Service' },
    ],
    locationHighlights: [
      'Short walk to Batumi Boulevard & beach',
      'Near Piazza Square & Europe Square',
      'Close to Batumi\'s restaurants & nightlife',
    ],
  },
  'Boutique Hotel 32': {
    images: [
      { src: '/images/hotels/boutique-hotel-32.jpg', alt: 'Boutique Hotel 32 building exterior in Batumi, Georgia' },
      { src: '/images/hotels/boutique-hotel-32-2.jpg', alt: 'Boutique Hotel 32 entrance and reception area in Batumi' },
      { src: '/images/hotels/boutique-hotel-32-3.jpg', alt: 'Boutique Hotel 32 guest room with warm décor in Batumi' },
      { src: '/images/hotels/boutique-hotel-32-4.jpg', alt: 'Boutique Hotel 32 bathroom with modern fixtures in Batumi' },
    ],
    stars: 3,
    description: 'A cozy and affordable boutique hotel tucked into a quiet street in Batumi. Boutique Hotel 32 offers a personal touch with tastefully decorated rooms, friendly staff, and a location that puts you just minutes from the seaside promenade and Old Town attractions.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'breakfast', label: 'Daily Breakfast' },
      { icon: 'ac', label: 'Air Conditioning' },
      { icon: 'concierge', label: '24/7 Reception' },
      { icon: 'laundry', label: 'Laundry Service' },
    ],
    locationHighlights: [
      'Quiet street near Batumi Old Town',
      'Walking distance to the Black Sea beach',
      'Close to local restaurants & markets',
    ],
  },
  'Tsinandali Estate, A Radisson Collection Hotel': {
    images: [
      { src: '/images/hotels/tsinandali-estate.jpg', alt: 'Tsinandali Estate Radisson Collection Hotel grand exterior surrounded by historic gardens, Telavi' },
      { src: '/images/hotels/tsinandali-estate-2.jpg', alt: 'Tsinandali Estate hotel lobby and lounge with elegant interior design' },
      { src: '/images/hotels/tsinandali-estate-3.jpg', alt: 'Tsinandali Estate luxurious guest room with elegant Georgian décor' },
      { src: '/images/hotels/tsinandali-estate-4.jpg', alt: 'Tsinandali Estate hotel bathroom with premium amenities and marble finishes' },
    ],
    stars: 5,
    description: 'Set within the legendary 19th-century Tsinandali Estate, this Radisson Collection property is the pinnacle of luxury in Georgia\'s wine country. Surrounded by historic gardens, a renowned wine cellar, and the Caucasus foothills, it offers an unforgettable blend of heritage, wine culture, and world-class hospitality.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'Fine Dining Restaurant' },
      { icon: 'pool', label: 'Outdoor Pool' },
      { icon: 'spa', label: 'Spa & Wellness Center' },
      { icon: 'wine', label: 'Historic Wine Cellar' },
    ],
    locationHighlights: [
      'Within the historic Tsinandali Estate grounds',
      'Heart of the Kakheti wine region',
      'Near Telavi Old Town & Batonis Tsikhe fortress',
    ],
  },
  'Park Hotel Tsinandali': {
    images: [
      { src: '/images/hotels/park-hotel-tsinandali.jpg', alt: 'Park Hotel Tsinandali building exterior surrounded by greenery in Kakheti, Georgia' },
      { src: '/images/hotels/park-hotel-tsinandali-2.jpg', alt: 'Park Hotel Tsinandali lobby and interior common area' },
      { src: '/images/hotels/park-hotel-tsinandali-3.jpg', alt: 'Park Hotel Tsinandali comfortable guest room with contemporary furnishings' },
      { src: '/images/hotels/park-hotel-tsinandali-4.jpg', alt: 'Park Hotel Tsinandali bathroom with modern amenities' },
    ],
    stars: 4,
    description: 'A modern and comfortable hotel set amid the lush greenery of the Tsinandali area in Kakheti. Park Hotel Tsinandali offers a peaceful retreat with well-appointed rooms, a lovely garden terrace, and easy access to the region\'s famous wineries and historic estates.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'On-Site Restaurant' },
      { icon: 'garden', label: 'Garden & Terrace' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'ac', label: 'Air Conditioning' },
    ],
    locationHighlights: [
      'Near the famous Tsinandali Estate',
      'Surrounded by Kakheti vineyards & wineries',
      'Easy access to Telavi center',
    ],
  },
  'Akhaltsikhe Inn (Junior Suite Room)': {
    images: [
      { src: '/images/hotels/akhaltsikhe-inn.jpg', alt: 'Akhaltsikhe Inn building exterior near Rabati Castle, Akhaltsikhe, Georgia' },
      { src: '/images/hotels/akhaltsikhe-inn-2.jpg', alt: 'Akhaltsikhe Inn lobby and reception area in Akhaltsikhe' },
      { src: '/images/hotels/akhaltsikhe-inn-3.jpg', alt: 'Akhaltsikhe Inn spacious Junior Suite guest room with luxurious furnishings' },
      { src: '/images/hotels/akhaltsikhe-inn-4.jpg', alt: 'Akhaltsikhe Inn bathroom with modern amenities' },
    ],
    stars: 5,
    description: 'A premium boutique inn offering luxurious Junior Suite rooms just steps from the magnificent Rabati Castle. Akhaltsikhe Inn combines elegant interiors with stunning views of the historic fortress and surrounding valley, providing the finest accommodation in this ancient southern Georgian town.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'breakfast', label: 'Gourmet Breakfast' },
      { icon: 'ac', label: 'Air Conditioning' },
      { icon: 'terrace', label: 'Panoramic Terrace' },
      { icon: 'concierge', label: '24/7 Concierge' },
    ],
    locationHighlights: [
      'Steps from the magnificent Rabati Castle',
      'Gateway to Vardzia cave monastery',
      'Views of the Potskhovi River valley',
    ],
  },
  'Hotel Gino Wellness Rabati': {
    images: [
      { src: '/images/hotels/hotel-gino-wellness-rabati.jpg', alt: 'Hotel Gino Wellness Rabati building exterior near Rabati Castle, Akhaltsikhe, Georgia' },
      { src: '/images/hotels/hotel-gino-wellness-rabati-2.jpg', alt: 'Hotel Gino Wellness Rabati lobby and reception area in Akhaltsikhe' },
      { src: '/images/hotels/hotel-gino-wellness-rabati-3.jpg', alt: 'Hotel Gino Wellness Rabati comfortable guest room in Akhaltsikhe' },
      { src: '/images/hotels/hotel-gino-wellness-rabati-4.jpg', alt: 'Hotel Gino Wellness Rabati bathroom with modern amenities' },
    ],
    stars: 4,
    description: 'A modern wellness hotel right beside the historic Rabati Castle in Akhaltsikhe. Hotel Gino features an indoor pool, sauna, and full wellness center, making it ideal for relaxation after exploring the Vardzia cave monastery and the dramatic landscapes of southern Georgia.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'pool', label: 'Indoor Pool' },
      { icon: 'spa', label: 'Sauna & Wellness' },
      { icon: 'restaurant', label: 'On-Site Restaurant' },
      { icon: 'parking', label: 'Free Parking' },
    ],
    locationHighlights: [
      'Adjacent to Rabati Castle',
      'Base for Vardzia & Khertvisi Fortress trips',
      'In the center of Akhaltsikhe',
    ],
  },
  'Hotel Beni': {
    images: [
      { src: '/images/hotels/hotel-beni.jpg', alt: 'Hotel Beni building exterior in Akhaltsikhe, southern Georgia' },
      { src: '/images/hotels/hotel-beni-2.jpg', alt: 'Hotel Beni lobby and interior common area in Akhaltsikhe' },
      { src: '/images/hotels/hotel-beni-3.jpg', alt: 'Hotel Beni clean and comfortable guest room in Akhaltsikhe' },
      { src: '/images/hotels/hotel-beni-4.jpg', alt: 'Hotel Beni bathroom with modern amenities in Akhaltsikhe' },
    ],
    stars: 3,
    description: 'A friendly and affordable hotel in Akhaltsikhe offering clean, comfortable rooms and genuine southern Georgian hospitality. Hotel Beni is a great-value base for exploring Rabati Castle, the Vardzia cave city, and the scenic Samtskhe-Javakheti region.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'breakfast', label: 'Daily Breakfast' },
      { icon: 'ac', label: 'Air Conditioning' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'concierge', label: 'Tour Assistance' },
    ],
    locationHighlights: [
      'Walking distance to Rabati Castle',
      'Easy access to Vardzia cave monastery',
      'In the heart of Akhaltsikhe',
    ],
  },
  'Crowne Plaza Borjomi': {
    images: [
      { src: '/images/hotels/crowne-plaza-borjomi.jpg', alt: 'Crowne Plaza Borjomi grand resort hotel surrounded by forested mountains, Georgia' },
      { src: '/images/hotels/crowne-plaza-borjomi-2.jpg', alt: 'Crowne Plaza Borjomi lobby and reception with elegant interior design' },
      { src: '/images/hotels/crowne-plaza-borjomi-3.jpg', alt: 'Crowne Plaza Borjomi guest room with views of Borjomi-Kharagauli National Park' },
      { src: '/images/hotels/crowne-plaza-borjomi-4.jpg', alt: 'Crowne Plaza Borjomi bathroom with premium fixtures and amenities' },
    ],
    stars: 5,
    description: 'A world-class resort hotel in the legendary spa town of Borjomi, surrounded by pristine forested mountains. Crowne Plaza Borjomi offers mineral water spa treatments, an indoor pool, multiple restaurants, and luxurious rooms — the ultimate wellness retreat in the heart of the Caucasus.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'Multiple Restaurants' },
      { icon: 'pool', label: 'Indoor Pool' },
      { icon: 'spa', label: 'Mineral Water Spa' },
      { icon: 'gym', label: 'Fitness Center' },
    ],
    locationHighlights: [
      'In the famous Borjomi spa resort town',
      'Gateway to Borjomi-Kharagauli National Park',
      'Near the Borjomi mineral water springs',
    ],
  },
  'Bridge Hotel': {
    images: [
      { src: '/images/hotels/bridge-hotel.jpg', alt: 'Bridge Hotel building exterior along the river in Borjomi, Georgia' },
      { src: '/images/hotels/bridge-hotel-2.jpg', alt: 'Bridge Hotel lobby and reception area in Borjomi' },
      { src: '/images/hotels/bridge-hotel-3.jpg', alt: 'Bridge Hotel comfortable guest room in the heart of Borjomi' },
      { src: '/images/hotels/bridge-hotel-4.jpg', alt: 'Bridge Hotel bathroom with shower and modern fixtures in Borjomi' },
    ],
    stars: 4,
    description: 'A well-appointed hotel in the center of Borjomi, nestled along the river with lovely mountain views. Bridge Hotel offers comfortable rooms, a welcoming restaurant, and a perfect location for strolling to the famous mineral water park and exploring the surrounding national park.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'Riverside Restaurant' },
      { icon: 'ac', label: 'Air Conditioning' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'concierge', label: '24/7 Reception' },
    ],
    locationHighlights: [
      'Central Borjomi, along the river',
      'Walking distance to Borjomi Central Park',
      'Close to the mineral water springs',
    ],
  },
  'Boutique Hotel Borjomi Verde': {
    images: [
      { src: '/images/hotels/borjomi-verde.jpg', alt: 'Boutique Hotel Borjomi Verde building exterior surrounded by greenery, Borjomi, Georgia' },
      { src: '/images/hotels/borjomi-verde-2.jpg', alt: 'Boutique Hotel Borjomi Verde terrace and outdoor common area' },
      { src: '/images/hotels/borjomi-verde-3.jpg', alt: 'Boutique Hotel Borjomi Verde clean and inviting guest room' },
      { src: '/images/hotels/borjomi-verde-4.jpg', alt: 'Boutique Hotel Borjomi Verde bathroom with modern amenities' },
    ],
    stars: 3,
    description: 'A charming budget-friendly boutique hotel in Borjomi surrounded by lush greenery. Borjomi Verde offers a peaceful garden setting, clean and comfortable rooms, and a warm atmosphere that captures the relaxing spirit of this famous Georgian spa town.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'breakfast', label: 'Daily Breakfast' },
      { icon: 'garden', label: 'Garden Terrace' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'heating', label: 'Central Heating' },
    ],
    locationHighlights: [
      'Peaceful green setting in Borjomi',
      'Near Borjomi Central Park & mineral springs',
      'Access to Borjomi-Kharagauli National Park trails',
    ],
  },
  'Hotel Posta': {
    images: [
      { src: '/images/hotels/hotel-posta.jpg', alt: 'Hotel Posta building exterior in the heart of Mestia, Svaneti, Georgia' },
      { src: '/images/hotels/hotel-posta-2.jpg', alt: 'Hotel Posta reception and lobby area in Mestia' },
      { src: '/images/hotels/hotel-posta-3.jpg', alt: 'Hotel Posta guest room with mountain views in Mestia' },
      { src: '/images/hotels/hotel-posta-4.jpg', alt: 'Hotel Posta bathroom with modern amenities in Mestia' },
    ],
    stars: 4,
    description: 'The premier hotel in Mestia, the capital of the legendary Svaneti region. Hotel Posta offers refined mountain hospitality with panoramic views of medieval Svan towers and snow-capped Caucasus peaks, a superb restaurant, and a warm fireplace lounge perfect after a day of alpine adventure.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'Svan Cuisine Restaurant' },
      { icon: 'heating', label: 'Central Heating' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'terrace', label: 'Mountain-View Terrace' },
    ],
    locationHighlights: [
      'Central Mestia with Svan tower views',
      'Gateway to Ushguli & Chalaadi Glacier trails',
      'Near the Mestia History Museum & ski lifts',
    ],
  },
  'Mestia Inn': {
    images: [
      { src: '/images/hotels/mestia-inn.jpg', alt: 'Mestia Inn building exterior in Mestia, Svaneti, Georgia' },
      { src: '/images/hotels/mestia-inn-2.jpg', alt: 'Mestia Inn lobby and common area with mountain views' },
      { src: '/images/hotels/mestia-inn-3.jpg', alt: 'Mestia Inn comfortable guest room with wooden interiors in Mestia' },
      { src: '/images/hotels/mestia-inn-4.jpg', alt: 'Mestia Inn bathroom with modern amenities in Mestia' },
    ],
    stars: 3,
    description: 'A welcoming mid-range inn in Mestia offering comfortable rooms with traditional wooden interiors and mountain views. Mestia Inn serves hearty Svan cuisine and provides a warm, family-run atmosphere that embodies the legendary hospitality of the Svaneti highlands.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'Traditional Svan Meals' },
      { icon: 'heating', label: 'Central Heating' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'terrace', label: 'Balcony Views' },
    ],
    locationHighlights: [
      'In the heart of Mestia village',
      'Close to medieval Svan towers',
      'Base for Ushguli & glacier hikes',
    ],
  },
  'Lileo Inn': {
    images: [
      { src: '/images/hotels/lileo-inn.jpg', alt: 'Lileo Inn building exterior in Mestia, Svaneti, Georgia' },
      { src: '/images/hotels/lileo-inn-2.jpg', alt: 'Lileo Inn lobby and common area in Mestia' },
      { src: '/images/hotels/lileo-inn-3.jpg', alt: 'Lileo Inn guest room with traditional Svan décor in Mestia' },
      { src: '/images/hotels/lileo-inn-4.jpg', alt: 'Lileo Inn bathroom with modern amenities in Mestia' },
    ],
    stars: 3,
    description: 'An authentic Svan family guesthouse in Mestia offering a genuine highland experience. Lileo Inn serves delicious home-cooked Svan meals, provides simple but clean rooms, and gives guests a taste of the warm family hospitality that Svaneti is famous for.',
    amenities: [
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'restaurant', label: 'Home-Cooked Svan Meals' },
      { icon: 'heating', label: 'Central Heating' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'garden', label: 'Garden Area' },
    ],
    locationHighlights: [
      'Authentic Svan village setting in Mestia',
      'Walking distance to Mestia center',
      'Near trailheads for Koruldi Lakes & Ushguli',
    ],
  },

  // --- Kakheti / Telavi hotels for the "Savor the Flavors of Kakheti" tour.
  // Details verified from official sites and reputable booking sources; only
  // confirmed facts are listed. Photos are pending for the text-only entries.
  'Communal Hotel Telavi': {
    images: [],
    stars: null,
    description: 'A boutique hotel set in a restored historic villa in central Telavi, with Moorish archways, a rooftop sunroom and a courtyard swimming pool. Part of the Communal Hotels family, it pairs preserved period architecture with a lively poolside bar and a relaxed, sociable atmosphere in the heart of the Kakheti wine region.',
    amenities: [
      { icon: 'pool', label: 'Courtyard Swimming Pool' },
      { icon: 'restaurant', label: 'Restaurant & Bar' },
      { icon: 'ac', label: 'Air Conditioning' },
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'parking', label: 'Free Parking' },
      { icon: 'terrace', label: 'Rooftop Terrace' },
    ],
    locationHighlights: [
      'Central Telavi, near cafés and shops',
      '7-minute walk to Batonistsikhe Fortress',
      '10-minute walk to Nadikvari Park',
    ],
  },
  'Boutique Hotel Kviria': {
    images: [],
    stars: null,
    description: 'A smart, eco-friendly boutique hotel that opened in 2021, blending Georgian tradition with contemporary design across 14 individually styled rooms. Kviria has its own winery and poolside bar, a landscaped garden and a seasonal outdoor pool, a short drive from central Telavi.',
    amenities: [
      { icon: 'wine', label: 'On-site Winery' },
      { icon: 'pool', label: 'Outdoor Swimming Pool' },
      { icon: 'garden', label: 'Garden' },
      { icon: 'restaurant', label: 'Restaurant' },
      { icon: 'breakfast', label: 'Breakfast Included' },
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'parking', label: 'Free Parking' },
    ],
    locationHighlights: [
      '51 Gogebashvili Street, Telavi',
      'About 10 minutes from downtown Telavi',
      'Surrounded by Kakheti countryside',
    ],
  },
  'Seventeen Rooms': {
    images: [],
    stars: null,
    description: 'An intimate hotel in central Telavi with seventeen comfortable rooms, a seasonal outdoor pool and a leafy garden. The on-site restaurant serves Georgian and European dishes alongside local Kakhetian wines, and the relaxed communal lounge makes it an easy base for exploring the old town.',
    amenities: [
      { icon: 'pool', label: 'Seasonal Outdoor Pool' },
      { icon: 'garden', label: 'Garden' },
      { icon: 'restaurant', label: 'Restaurant & Bar' },
      { icon: 'ac', label: 'Air Conditioning' },
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'parking', label: 'Free Private Parking' },
    ],
    locationHighlights: [
      'Leonidze Street, central Telavi',
      '10-minute walk to the Erekle II Palace (Batonistsikhe)',
      'Close to Telavi old town',
    ],
  },
  'Villa Lapa': {
    images: [],
    stars: null,
    description: 'A welcoming family-run villa in a quiet, green setting about five minutes from central Telavi. Rooms open onto balconies with sweeping views of the Alazani Valley and the Caucasus peaks, and guests can unwind by the outdoor pool, in the garden or on the terrace after a day in the vineyards.',
    amenities: [
      { icon: 'pool', label: 'Outdoor Swimming Pool' },
      { icon: 'garden', label: 'Garden' },
      { icon: 'restaurant', label: 'Restaurant & Bar' },
      { icon: 'terrace', label: 'Terrace & Verandas' },
      { icon: 'wifi', label: 'Free Wi-Fi' },
      { icon: 'parking', label: 'Free Private Parking' },
    ],
    locationHighlights: [
      'About 5 minutes from central Telavi',
      'Balcony views of the Alazani Valley & Caucasus Mountains',
      'Quiet, garden setting on the edge of town',
    ],
  },
  'Chateau Orberi': {
    images: [],
    stars: null,
    description: 'A small vineyard guesthouse in the village of Ikalto near Telavi, where the host family makes its own organic wine in a traditional marani. Surrounded by vines with a garden and outdoor pool, Chateau Orberi offers warm, home-style Kakhetian hospitality a short drive from the historic Ikalto Monastery.',
    amenities: [
      { icon: 'wine', label: 'Family Wine Cellar (Marani)' },
      { icon: 'pool', label: 'Outdoor Swimming Pool' },
      { icon: 'garden', label: 'Garden & Vineyards' },
    ],
    locationHighlights: [
      'Ikalto village, a short drive from Telavi',
      'Set among its own vineyards',
      'Near the Ikalto Monastery & Academy',
    ],
  },
  // The three Bakuriani hotels on the 11-day winter ski tour. Facts come from
  // each hotel's own site (silkhospitality.com/kokhta-bakuriani, hotelcrystal.ge).
  // Bakuriani Inn's site sits behind a Cloudflare bot check that neither curl
  // nor a headless browser can pass, so its record claims only what we can
  // stand behind — no stars, amenities or location highlights.
  'Kokhta Bakuriani': {
    images: [],
    stars: 5,
    description: 'A five-star hotel by the Kokhta slopes in Bakuriani, part of the Silk Hospitality group, built in natural materials that sit easily against the surrounding forest and ridges. It has 92 rooms across standard, superior, deluxe and suite categories, a full-service restaurant and bar with in-room dining, and a guests-only fitness center open around the clock two floors above the rooms. An entertainment zone adds indoor ice skating and a children’s indoor playground for days off the slopes.',
    amenities: [
      { icon: 'restaurant', label: 'Restaurant & Bar' },
      { icon: 'gym', label: 'Fitness Center' },
      { icon: 'concierge', label: 'In-Room Dining' },
    ],
    locationHighlights: [
      'By the Kokhta / Kokhta-Mitarbi ski zone',
      'Indoor ice rink & children’s playground',
      'Meeting and event rooms on site',
    ],
  },
  'Crystal Hotel & Spa': {
    images: [],
    stars: 5,
    description: 'A five-star hotel in Bakuriani, 185 km from Tbilisi and a few minutes from the Didveli ski lift. It forms part of the Crystal Resort complex, which brings gondola and chairlift systems, 12 km of snowmaking-equipped slopes with night skiing, a 1,500-metre toboggan run, an ice rink, ski rental and instructors together in one place. The hotel itself has an indoor swimming pool and spa, with cafes, restaurants and bars across the resort.',
    amenities: [
      { icon: 'pool', label: 'Indoor Pool' },
      { icon: 'spa', label: 'Spa & Wellness' },
      { icon: 'restaurant', label: 'Restaurants & Bars' },
    ],
    locationHighlights: [
      'Minutes from the Didveli ski lift',
      'Part of the Crystal Resort complex',
      '1,500 m toboggan run & ice rink',
    ],
  },
  'Bakuriani Inn': {
    images: [],
    description: 'The classic-tier base for the Bakuriani nights of our winter ski tour, in the pine-forested ski town on the northern slope of the Trialeti Range.',
  },
}

// Retired spellings that map onto a canonical entry. Nothing in tours.js uses
// these today — they are kept because tours.js is generated by
// scripts/extract-tour-data.js, so a re-extraction from the source pages could
// reintroduce an old name. An alias makes that resolve to the right hotel
// instead of silently dropping back to unlinked plain text.
export const hotelAliases = {
  'Hotel Arge': 'Hotel & Wine Cellar ARGE',
}

// Resolve a name as written in the tour data to its canonical hotelData key,
// or undefined when we hold no record for it (the caller then renders the name
// as plain text, exactly as before).
export function resolveHotelKey(name) {
  if (!name) return undefined
  if (hotelData[name]) return name
  const alias = hotelAliases[name]
  return alias && hotelData[alias] ? alias : undefined
}

export default hotelData
