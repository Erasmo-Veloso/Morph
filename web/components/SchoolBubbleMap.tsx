"use client";

import { Circle, CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { SchoolBubble } from "@/lib/capsule";
import "leaflet/dist/leaflet.css";

type Props = {
  bubble: SchoolBubble;
  onCenterChange: (center: SchoolBubble["boundary"]["center"]) => void;
};

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom(), { animate: true });
  return null;
}

function BubbleSelector({ onCenterChange }: Pick<Props, "onCenterChange">) {
  useMapEvents({ click: (event) => onCenterChange({ latitude: event.latlng.lat, longitude: event.latlng.lng }) });
  return null;
}

export function SchoolBubbleMap({ bubble, onCenterChange }: Props) {
  const center: [number, number] = [bubble.boundary.center.latitude, bubble.boundary.center.longitude];
  return (
    <MapContainer center={center} zoom={16} className="school-leaflet-map" scrollWheelZoom>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Recenter center={center} />
      <BubbleSelector onCenterChange={onCenterChange} />
      <Circle center={center} radius={bubble.boundary.radius_meters} pathOptions={{ color: "#287BEA", fillColor: "#287BEA", fillOpacity: 0.16, weight: 2 }} />
      <CircleMarker center={center} radius={8} pathOptions={{ color: "#ffffff", fillColor: "#287BEA", fillOpacity: 1, weight: 3 }} />
    </MapContainer>
  );
}
