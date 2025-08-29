mapbox.md

Quick guide for a minimal Mapbox GL JS globe with dark land, blue water, white borders, and no labels. Tuned for Claude Code use, safe for non-premium accounts.

Versions, tokens, install

Library: Mapbox GL JS v3.14.0 is the current stable on npm, betas appear often, pin if you want repeatable builds. 
npm
GitHub

Token: create a public access token in your Mapbox account, expose via env, example NEXT_PUBLIC_MAPBOX_TOKEN or VITE_MAPBOX_TOKEN.

Billing model: web maps are metered by map loads, one load per new mapboxgl.Map(...), panning and toggling layers do not add loads. 
Mapbox

# install
npm i mapbox-gl@^3.14.0

Core idea, how Mapbox GL works

You provide a style JSON that declares sources (data) and layers (how to draw). The map is just a canvas that renders that style. You can change the style at runtime. Start with a tiny, hand-written style so Claude can edit it quickly. 
Mapbox
+1

Projection is part of the map options or can be set later. Use globe for a 3D Earth. Add atmosphere with map.setFog(...). 
Mapbox
+1

Use free Mapbox tilesets:

Countries polygons for land fills, mapbox://mapbox.country-boundaries-v1. Has iso_3166_1_alpha_3, disputed fields. 
Mapbox

Streets v8 for borders and water, mapbox://mapbox.mapbox-streets-v8. Has admin, water layers and a maritime flag for sea boundaries. Apply a worldview filter on admin. 
Mapbox

Minimal map, skeleton only

Use this as a checklist Claude can expand into code.

import mapboxgl from "mapbox-gl";
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const map = new mapboxgl.Map({
  container: "map",
  projection: "globe",
  style: {
    version: 8,
    glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    sources: {
      streets:   { type: "vector", url: "mapbox://mapbox.mapbox-streets-v8" },
      countries: { type: "vector", url: "mapbox://mapbox.country-boundaries-v1" }
    },
    layers: [/* see style blocks below */]
  }
});

map.on("style.load", () => {
  map.setFog({ color: "rgba(13,91,255,0.5)", "horizon-blend": 0.2, "high-color": "rgba(255,255,255,0.15)", "space-color": "#000" });
});


Globe and fog API are documented in the GL JS guides, use them as shown. 
Mapbox

Style blocks, “80-Days” theme

Add these small layer snippets to your layers array. Keep order as listed.

1) Background as ocean

{ id: "bg", type: "background", paint: { "background-color": "#0D5BFF" } }


2) Dark land from free country polygons

{
  id: "land",
  type: "fill",
  source: "countries",
  "source-layer": "country_boundaries",
  filter: ["==", ["get","disputed"], "false"],
  paint: {
    "fill-color": ["interpolate", ["linear"], ["zoom"], 0, "#0F1113", 5, "#0E1012", 8, "#0C0E10"],
    "fill-opacity": 1
  }
}


Countries v1 exposes disputed, hide those for cleaner borders. It carries ISO codes you can target later. 
Mapbox

3) Water above land to carve lakes and coasts

{
  id: "water",
  type: "fill",
  source: "streets",
  "source-layer": "water",
  paint: { "fill-color": "#0D5BFF" }
}


Water polygons come from Streets v8. 
Mapbox

4) White borders, international only

{
  id: "borders-intl",
  type: "line",
  source: "streets",
  "source-layer": "admin",
  filter: ["all",
    ["==", ["get","admin_level"], 0],
    ["==", ["get","maritime"], false],
    ["match", ["get","worldview"], ["US","all","IN","JP","CN"], true, false]
  ],
  paint: { "line-color": "#FFFFFF", "line-width": ["interpolate", ["linear"], ["zoom"], 0, 0.3, 6, 0.8], "line-opacity": 0.9 }
}


The admin layer includes a maritime boolean, filter it out, apply a worldview filter so you do not mix multiple versions. 
Mapbox

5) Optional, faint internal borders

{
  id: "borders-admin1",
  type: "line",
  source: "streets",
  "source-layer": "admin",
  filter: ["all",
    ["==", ["get","admin_level"], 1],
    ["==", ["get","maritime"], false],
    ["match", ["get","worldview"], ["US","all","IN","JP","CN"], true, false]
  ],
  paint: { "line-color": "#FFFFFF", "line-width": 0.3, "line-opacity": 0.45 }
}

Optional polish

Gentle spin, pause on input

let spin = true;
function tick() {
  if (!spin) return;
  const c = map.getCenter();
  map.easeTo({ center: [c.lng + 0.06, c.lat], duration: 200, easing: t => t });
  requestAnimationFrame(tick);
}
map.on("load", tick);
["mousedown","wheel","touchstart"].forEach(ev => map.on(ev, () => { spin = false; }));


Highlight a country by ISO code

map.addLayer({
  id: "country-highlight",
  type: "line",
  source: "countries",
  "source-layer": "country_boundaries",
  filter: ["in", ["get","iso_3166_1_alpha_3"], ["literal", ["ITA","FRA"]]],
  paint: { "line-color": "#FFF", "line-width": 1.2 }
});


ISO codes live on Countries v1, you can also join local data by ISO using match. 
Mapbox

Worldview and disputes, quick notes

Apply a worldview filter on any admin layers, or you will see overlapping boundaries. Pick from US, IN, JP, CN, or all. 
Mapbox

Countries v1 has disputed="true" features, you can hide them or style them differently. 
Mapbox

Performance and cost habits

Reuse one Map object per page, that event is what counts as a map load on v2+, not panning or toggling layers. 
Mapbox

Keep the style small, a handful of layers draws fast on the globe.

Avoid terrain and satellite for this look, you do not need DEMs.

Free plan is fine to start, always confirm pricing on the Mapbox site before launch. 
Mapbox

Claude prompts you can paste

Bootstrap minimal globe

Add Mapbox GL JS v3.14.0, create a small style with background blue, countries fill near-black, water from Streets v8, admin-0 white borders with maritime=false and worldview filter, no labels, set projection "globe", add fog.


Tighten borders

Remove admin-1, leave admin-0 only, boost line-width by 20 percent, keep opacity 0.9.


Switch palettes

Change water to #115DFF, land to #0B0C0E, keep borders white, preserve layer order.


Add ISO highlight

Add a layer that outlines a provided list of ISO alpha-3 codes from Countries v1 in bright white at 1.2 px.

Troubleshooting

You see Mercator, not a globe
Set projection: "globe" or call map.setProjection("globe"). 
Mapbox

Borders look messy
Ensure maritime=false in filters, apply a single worldview filter on each admin layer. 
Mapbox

Atmosphere missing
Call map.setFog(...) after the style loads. 
Mapbox

References

GL JS globe, fog, projections. 
Mapbox
+1

Countries v1 tileset, fields and usage. 
Mapbox

Streets v8 reference, admin, water, maritime, worldview. 
Mapbox

Style spec and layers reference. 
Mapbox
+1

Pricing and map-load definition.