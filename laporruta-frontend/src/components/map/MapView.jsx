import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export function MapView({
  children,
  center = [-6.2088, 106.8456],
  zoom = 12,
  className = "h-full w-full",
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
}
