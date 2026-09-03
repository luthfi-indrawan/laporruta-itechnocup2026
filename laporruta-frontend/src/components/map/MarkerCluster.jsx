import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

export function MarkerCluster({ reports, onMarkerClick }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !reports?.length) return;

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (cluster) => {
        return L.divIcon({
          html: `<div class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-neo-yellow font-display text-sm font-black shadow-neo-sm">${cluster.getChildCount()}</div>`,
          className: "custom-cluster-icon",
          iconSize: [40, 40],
        });
      },
    });

    reports.forEach((report) => {
      if (!report.lat || !report.lng) return;

      const marker = L.marker([report.lat, report.lng], {
        icon: L.divIcon({
          html: `<div class="h-4 w-4 rounded-full border-2 border-black" style="background-color: ${report.category?.color || "#3A86EF"}"></div>`,
          className: "custom-marker",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      });

      marker.on("click", () => onMarkerClick?.(report));
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, reports, onMarkerClick]);

  return null;
}
