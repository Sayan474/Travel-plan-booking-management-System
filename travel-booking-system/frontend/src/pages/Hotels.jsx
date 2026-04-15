import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useBooking } from "../context/BookingContext";
import styles from "./Hotels.module.css";

const sampleHotels = [
  {
    id: 1,
    hotel_name: "ibis Jaipur City Centre",
    stars: 3,
    location: "Civil Lines, Jaipur, Rajasthan",
    amenities: ["WiFi", "Breakfast", "Parking"],
    price_per_night: 2900,
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=900",
  },
  {
    id: 2,
    hotel_name: "The Fern Residency Kochi",
    stars: 3,
    location: "Edappally, Kochi, Kerala",
    amenities: ["WiFi", "Gym", "Breakfast"],
    price_per_night: 3800,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=900",
  },
  {
    id: 3,
    hotel_name: "Taj Fort Aguada Resort and Spa, Goa",
    stars: 4,
    location: "Sinquerim, Candolim, Goa",
    amenities: ["Pool", "Breakfast", "WiFi"],
    price_per_night: 9800,
    image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=900",
  },
  {
    id: 4,
    hotel_name: "ITC Grand Chola, Chennai",
    stars: 4,
    location: "Guindy, Chennai, Tamil Nadu",
    amenities: ["Spa", "WiFi", "Pool"],
    price_per_night: 11400,
    image: "https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=900",
  },
  {
    id: 5,
    hotel_name: "The Leela Palace New Delhi",
    stars: 5,
    location: "Chanakyapuri, New Delhi",
    amenities: ["Pool", "Spa", "Fine Dining", "WiFi"],
    price_per_night: 16800,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=900",
  },
  {
    id: 6,
    hotel_name: "The Oberoi Udaivilas, Udaipur",
    stars: 5,
    location: "Lake Pichola, Udaipur, Rajasthan",
    amenities: ["Lake View", "Spa", "Airport Shuttle", "WiFi"],
    price_per_night: 32500,
    image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=900",
  },
];

const defaultHotelImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=900";
const hotelImageFallbacks = {
  "The Leela Palace New Delhi": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=900",
};

const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const knownCoords = {
  "new delhi": { lat: 28.6139, lon: 77.209 },
  "chanakyapuri, new delhi": { lat: 28.5921, lon: 77.1885 },
  "civil lines, jaipur, rajasthan": { lat: 26.9157, lon: 75.8066 },
  "edappally, kochi, kerala": { lat: 10.0287, lon: 76.3088 },
  "sinquerim, candolim, goa": { lat: 15.4999, lon: 73.7637 },
  "guindy, chennai, tamil nadu": { lat: 13.0067, lon: 80.2206 },
  "lake pichola, udaipur, rajasthan": { lat: 24.5765, lon: 73.6794 },
  "mumbai": { lat: 19.076, lon: 72.8777 },
  "kolkata": { lat: 22.5726, lon: 88.3639 },
  "bengaluru": { lat: 12.9716, lon: 77.5946 },
  "hyderabad": { lat: 17.385, lon: 78.4867 },
  "chennai": { lat: 13.0827, lon: 80.2707 },
  "jaipur": { lat: 26.9124, lon: 75.7873 },
  "kochi": { lat: 9.9312, lon: 76.2673 },
  "goa": { lat: 15.2993, lon: 74.124 },
  "udaipur": { lat: 24.5854, lon: 73.7125 },
};

const transportModes = {
  car: { label: "Car", speedKmph: 45, mode: "driving" },
  train: { label: "Train", speedKmph: 70, mode: "transit" },
  flight: { label: "Flight", speedKmph: 780, mode: "driving" },
};

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const normalizeLocationKey = (value) => String(value || "").trim().toLowerCase();

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const hashString = (value) => {
  let hash = 0;
  for (let idx = 0; idx < value.length; idx += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(idx);
    hash |= 0;
  }
  return Math.abs(hash);
};

const estimatePricePerNight = (name, stars) => {
  const safeStars = clamp(Number(stars) || 3, 2, 5);
  const base = 2200 + safeStars * 1700;
  const variance = hashString(String(name || "hotel")) % 4200;
  return Math.round((base + variance) / 100) * 100;
};

const geocodePlace = async (query) => {
  const fallback = knownCoords[normalizeLocationKey(query)] || null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      return fallback;
    }
    const results = await response.json();
    if (!results.length) {
      return fallback;
    }
    return {
      lat: Number(results[0].lat),
      lon: Number(results[0].lon),
    };
  } catch (error) {
    return fallback;
  }
};

const haversineDistanceKm = (origin, destination) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const radius = 6371;
  const dLat = toRad(destination.lat - origin.lat);
  const dLon = toRad(destination.lon - origin.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) * Math.sin(dLon / 2) ** 2;
  return radius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const fetchRoadRoute = async (origin, destination) => {
  try {
    const routeResponse = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`
    );
    if (!routeResponse.ok) {
      return null;
    }
    const routeData = await routeResponse.json();
    const bestRoute = routeData?.routes?.[0];
    if (!bestRoute) {
      return null;
    }
    return {
      points: bestRoute.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
      distanceKm: bestRoute.distance / 1000,
      durationHrs: bestRoute.duration / 3600,
    };
  } catch (error) {
    return null;
  }
};

const buildMapsEmbedUrl = ({ origin, destination, travelMode }) => {
  if (!origin || !destination) return "";

  if (GOOGLE_MAPS_KEY) {
    const mode = transportModes[travelMode]?.mode || "driving";
    return `https://www.google.com/maps/embed/v1/directions?key=${encodeURIComponent(
      GOOGLE_MAPS_KEY
    )}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}`;
  }

  return `https://www.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&output=embed`;
};

const buildMapsExternalUrl = ({ origin, destination, travelMode }) => {
  const mode = transportModes[travelMode]?.mode || "driving";
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(
    destination
  )}&travelmode=${mode}`;
};

const normalizeLiveHotel = (record, cityName) => {
  const tags = record.tags || {};
  const name = tags.name || "Unnamed Hotel";
  const stars = clamp(Number(tags.stars) || 3, 2, 5);
  const amenities = [
    tags.internet_access ? "WiFi" : null,
    tags["contact:phone"] ? "Support" : null,
    tags["wheelchair"] === "yes" ? "Accessible" : null,
    tags.breakfast ? "Breakfast" : null,
  ].filter(Boolean);

  const locationParts = [
    tags["addr:street"],
    tags["addr:city"],
    tags["addr:state"],
    cityName,
  ].filter(Boolean);

  return {
    id: `live-${record.type}-${record.id}`,
    hotel_name: name,
    stars,
    location: locationParts.join(", ") || cityName,
    amenities: amenities.length ? amenities : ["WiFi"],
    price_per_night: estimatePricePerNight(name, stars),
    image: defaultHotelImage,
    source: "live",
    coords: {
      lat: Number(record.lat ?? record.center?.lat ?? 0),
      lon: Number(record.lon ?? record.center?.lon ?? 0),
    },
  };
};

const fetchHotelsNearCity = async (cityName) => {
  const cityCoords = await geocodePlace(cityName);
  if (!cityCoords) {
    throw new Error("Could not locate the city.");
  }

  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["tourism"="hotel"](around:20000,${cityCoords.lat},${cityCoords.lon});
      way["tourism"="hotel"](around:20000,${cityCoords.lat},${cityCoords.lon});
      relation["tourism"="hotel"](around:20000,${cityCoords.lat},${cityCoords.lon});
    );
    out center tags 60;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: overpassQuery,
  });

  if (!response.ok) {
    throw new Error("Live hotel API is temporarily unavailable.");
  }

  const data = await response.json();
  const elements = Array.isArray(data.elements) ? data.elements : [];

  const uniqueByName = new Map();
  elements.forEach((element) => {
    const hotel = normalizeLiveHotel(element, cityName);
    if (!hotel.hotel_name || hotel.hotel_name === "Unnamed Hotel") return;
    const key = `${hotel.hotel_name.toLowerCase()}-${hotel.location.toLowerCase()}`;
    if (!uniqueByName.has(key)) {
      uniqueByName.set(key, hotel);
    }
  });

  return Array.from(uniqueByName.values());
};

const computeRouteProfiles = ({ distanceKm, roadDistanceKm, roadDurationHrs }) => {
  const carDistance = roadDistanceKm || distanceKm * 1.2;
  const trainDistance = distanceKm * 1.12;
  const flightDistance = distanceKm * 0.98;

  return {
    car: {
      distanceKm: carDistance,
      durationHrs: roadDurationHrs || carDistance / transportModes.car.speedKmph,
      mode: transportModes.car.label,
    },
    train: {
      distanceKm: trainDistance,
      durationHrs: trainDistance / transportModes.train.speedKmph + 0.8,
      mode: transportModes.train.label,
    },
    flight: {
      distanceKm: flightDistance,
      durationHrs: flightDistance / transportModes.flight.speedKmph + 1.2,
      mode: transportModes.flight.label,
    },
  };
};

export default function Hotels() {
  const navigate = useNavigate();
  const { searchData, setSelection } = useBooking();
  const [filters, setFilters] = useState({ maxPrice: 35000, stars: "all", amenity: "all" });
  const [cityQuery, setCityQuery] = useState(searchData.destination || "New Delhi");
  const [checkIn, setCheckIn] = useState(searchData.dateFrom || "");
  const [checkOut, setCheckOut] = useState(searchData.dateTo || "");
  const [guests, setGuests] = useState(searchData.passengers || 1);
  const [hotelInventory, setHotelInventory] = useState(sampleHotels);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsError, setHotelsError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [routeFrom, setRouteFrom] = useState("New Delhi");
  const [routeTo, setRouteTo] = useState(sampleHotels[0]?.location || "Mumbai");
  const [travelMode, setTravelMode] = useState("car");
  const [selectedHotelId, setSelectedHotelId] = useState(sampleHotels[0]?.id || null);
  const [routeProfiles, setRouteProfiles] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");

  const amenities = useMemo(() => {
    const set = new Set();
    hotelInventory.forEach((hotel) => {
      (hotel.amenities || []).forEach((amenity) => set.add(amenity));
    });
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [hotelInventory]);

  const hotels = useMemo(() => {
    let list = [...hotelInventory].filter((h) => h.price_per_night <= filters.maxPrice);
    if (filters.stars !== "all") list = list.filter((h) => h.stars === Number(filters.stars));
    if (filters.amenity !== "all") list = list.filter((h) => h.amenities.includes(filters.amenity));
    return list.sort((a, b) => a.price_per_night - b.price_per_night);
  }, [filters, hotelInventory]);

  const selectedHotel = useMemo(
    () => hotels.find((hotel) => hotel.id === selectedHotelId) || hotels[0] || null,
    [hotels, selectedHotelId]
  );

  useEffect(() => {
    if (!hotels.length) {
      setSelectedHotelId(null);
      return;
    }
    if (!hotels.some((hotel) => hotel.id === selectedHotelId)) {
      setSelectedHotelId(hotels[0].id);
    }
  }, [hotels, selectedHotelId]);

  useEffect(() => {
    if (selectedHotel?.location) {
      setRouteTo(selectedHotel.location);
    }
  }, [selectedHotel]);

  const runLiveHotelSearch = useCallback(async () => {
    if (!cityQuery.trim()) {
      setHotelsError("Enter a city to fetch hotels.");
      return;
    }

    setHotelsLoading(true);
    setHotelsError("");
    try {
      const liveHotels = await fetchHotelsNearCity(cityQuery.trim());
      if (!liveHotels.length) {
        setHotelInventory(sampleHotels);
        setHotelsError("No live hotels found for this city. Showing curated list.");
      } else {
        setHotelInventory(liveHotels);
        setRouteFrom(cityQuery.trim());
      }
    } catch (error) {
      setHotelInventory(sampleHotels);
      setHotelsError(error.message || "Could not fetch live hotels right now.");
    } finally {
      setHotelsLoading(false);
    }
  }, [cityQuery]);

  useEffect(() => {
    runLiveHotelSearch();
  }, [runLiveHotelSearch]);

  const loadRealtimeRoute = useCallback(async () => {
    if (!routeFrom || !routeTo) {
      setMapError("Enter valid From and Destination locations.");
      return;
    }

    setMapLoading(true);
    setMapError("");
    try {
      const [origin, destination] = await Promise.all([
        geocodePlace(routeFrom),
        geocodePlace(routeTo),
      ]);

      if (!origin || !destination) {
        setMapError("Could not locate origin or destination on map.");
        setRouteProfiles(null);
        setRouteInfo(null);
        return;
      }

      const distanceKm = haversineDistanceKm(origin, destination);
      const roadRoute = await fetchRoadRoute(origin, destination);
      const profiles = computeRouteProfiles({
        distanceKm,
        roadDistanceKm: roadRoute?.distanceKm,
        roadDurationHrs: roadRoute?.durationHrs,
      });
      setRouteProfiles(profiles);
      setRouteInfo(profiles[travelMode]);
    } catch (error) {
      setMapError("Could not compute route for this input. Try another From/Destination.");
      setRouteProfiles(null);
      setRouteInfo(null);
    } finally {
      setMapLoading(false);
    }
  }, [routeFrom, routeTo, travelMode]);

  useEffect(() => {
    if (showMap) {
      loadRealtimeRoute();
    }
  }, [showMap, loadRealtimeRoute]);

  useEffect(() => {
    if (routeProfiles) {
      setRouteInfo(routeProfiles[travelMode]);
    }
  }, [travelMode, routeProfiles]);

  const mapEmbedUrl = useMemo(
    () => buildMapsEmbedUrl({ origin: routeFrom, destination: routeTo, travelMode }),
    [routeFrom, routeTo, travelMode]
  );

  const externalMapsUrl = useMemo(
    () => buildMapsExternalUrl({ origin: routeFrom, destination: routeTo, travelMode }),
    [routeFrom, routeTo, travelMode]
  );

  return (
    <main className="page">
      <h1 className="section-title">Hotels</h1>
      <div className={styles.searchTop}>
        <input
          className="input"
          value={cityQuery}
          placeholder="Search city for live hotels"
          onChange={(e) => setCityQuery(e.target.value)}
        />
        <input className="input" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        <input className="input" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        <input
          className="input"
          type="number"
          placeholder="Guests"
          min={1}
          value={guests}
          onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
        />
        <button className="btn btn-primary" type="button" onClick={runLiveHotelSearch} disabled={hotelsLoading}>
          {hotelsLoading ? "Searching..." : "Find Live Hotels"}
        </button>
      </div>
      {hotelsError && <p className={styles.errorText}>{hotelsError}</p>}

      <div className={styles.layout}>
        <aside className={`${styles.filters} card`}>
          <h3>Filters</h3>
          <label>Max Price {formatINR(filters.maxPrice)}</label>
          <input type="range" min="2000" max="35000" step="500" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })} />
          <label>Stars</label>
          <select className="select" value={filters.stars} onChange={(e) => setFilters({ ...filters, stars: e.target.value })}>
            <option value="all">All</option>
            <option value="5">5 Star</option>
            <option value="4">4 Star</option>
            <option value="3">3 Star</option>
          </select>
          <label>Amenities</label>
          <select className="select" value={filters.amenity} onChange={(e) => setFilters({ ...filters, amenity: e.target.value })}>
            {amenities.map((amenity) => (
              <option key={amenity} value={amenity}>
                {amenity === "all" ? "All" : amenity}
              </option>
            ))}
          </select>
        </aside>

        <section>
          <div className={styles.mapToolbar}>
            <button className="btn" onClick={() => setShowMap((prev) => !prev)}>
              {showMap ? "Hide Route Map" : "Map Toggle"}
            </button>
            {showMap && (
              <>
                <input
                  className="input"
                  value={routeFrom}
                  placeholder="From (e.g. Kolkata)"
                  onChange={(e) => setRouteFrom(e.target.value)}
                />
                <input
                  className="input"
                  value={routeTo}
                  placeholder="Destination (e.g. Chanakyapuri, New Delhi)"
                  onChange={(e) => setRouteTo(e.target.value)}
                />
                <select className="select" value={travelMode} onChange={(e) => setTravelMode(e.target.value)}>
                  <option value="car">Car Route</option>
                  <option value="train">Train Route</option>
                  <option value="flight">Flight Route</option>
                </select>
                <button className="btn btn-primary" onClick={loadRealtimeRoute} disabled={mapLoading}>
                  {mapLoading ? "Updating..." : "Show Route"}
                </button>
              </>
            )}
          </div>

          {showMap && (
            <div className={`${styles.mapPanel} card`}>
              <h3>Trip Route: {routeFrom} to {routeTo || "Destination"}</h3>
              {routeInfo && (
                <p className={styles.routeMeta}>
                  {routeInfo.mode} Distance: {routeInfo.distanceKm.toFixed(1)} km | Estimated Time: {routeInfo.durationHrs.toFixed(1)} hrs
                </p>
              )}
              {routeProfiles && (
                <div className={styles.routeGrid}>
                  {Object.entries(routeProfiles).map(([mode, info]) => (
                    <div key={mode} className={`${styles.routeChip} ${travelMode === mode ? styles.activeChip : ""}`}>
                      <strong>{info.mode}</strong>
                      <span>{info.distanceKm.toFixed(1)} km</span>
                      <span>{info.durationHrs.toFixed(1)} hrs</span>
                    </div>
                  ))}
                </div>
              )}
              {mapError && <p className={styles.mapError}>{mapError}</p>}
              {mapEmbedUrl && (
                <iframe
                  title="Google Maps Route"
                  className={styles.mapFrame}
                  src={mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              )}
              <div className={styles.mapActions}>
                <a className="btn" href={externalMapsUrl} target="_blank" rel="noreferrer">
                  Open in Google Maps
                </a>
                {selectedHotel && (
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => {
                      setSelection(selectedHotel);
                      navigate("/booking");
                    }}
                  >
                    Book This Hotel
                  </button>
                )}
              </div>
            </div>
          )}

          <div className={styles.results}>
            {!hotels.length && <p className={styles.errorText}>No hotels match your filters. Try widening the filters.</p>}
            {hotels.map((h) => (
              <article
                className={`${styles.hotelCard} card ${selectedHotel?.id === h.id ? styles.selected : ""}`}
                key={h.id}
                onClick={() => {
                  setSelectedHotelId(h.id);
                  setRouteTo(h.location);
                }}
              >
                <img
                  src={h.image}
                  alt={h.hotel_name}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = hotelImageFallbacks[h.hotel_name] || defaultHotelImage;
                  }}
                />
                <div>
                  <h4>{h.hotel_name}</h4>
                  <p>{"★".repeat(h.stars)} • {h.location}</p>
                  {h.source === "live" && <p className={styles.liveTag}>Live listing • Price is estimated per night</p>}
                  <div className={styles.chips}>
                    {h.amenities.map((a) => (
                      <span key={a}>{a}</span>
                    ))}
                  </div>
                </div>
                <strong>{formatINR(h.price_per_night)}/night</strong>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    setSelection(h);
                    navigate("/booking");
                  }}
                >
                  Book
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
