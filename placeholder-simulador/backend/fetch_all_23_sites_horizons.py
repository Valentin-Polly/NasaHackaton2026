"""
Extractor 100% Real de JPL Horizons para los 23 sitios (6 Apolo + 17 Artemis).
Requisitos:
    pip install requests pandas
Ejecución:
    python fetch_all_23_sites_horizons.py
"""
import requests
import pandas as pd
import time

# 23 Sitios Oficiales (Coordenadas verificadas LROC / NASA Artemis)
# Para las regiones de Artemis donde la elevación de cada punto exacto se mide en LOLA,
# usamos 0.0 km como referencia esférica base en Horizons (o editalo con el valor que leas en QuickMap).
SITES = [
    # --- 6 SITIOS APOLO (Elevación exacta medida por LOLA en km sobre radio medio 1737.4 km) ---
    {"id": "APOLLO_11", "name": "Apollo 11 LM", "lat": 0.67416, "lon": 23.47314, "elev_km": -1.926},
    {"id": "APOLLO_12", "name": "Apollo 12 LM", "lat": -3.01280, "lon": 336.57810, "elev_km": -1.422},
    {"id": "APOLLO_14", "name": "Apollo 14 LM", "lat": -3.64589, "lon": 342.52806, "elev_km": -1.062},
    {"id": "APOLLO_15", "name": "Apollo 15 LM", "lat": 26.13239, "lon": 3.63330, "elev_km": -1.931},
    {"id": "APOLLO_16", "name": "Apollo 16 LM", "lat": -8.97340, "lon": 15.50110, "elev_km": 0.008},
    {"id": "APOLLO_17", "name": "Apollo 17 LM", "lat": 20.19110, "lon": 30.77230, "elev_km": -2.626},
    # --- 17 REGIONES CANDIDATAS ARTEMIS ---
    {"id": "ART_01", "name": "Peak Near Shackleton", "lat": -88.811, "lon": 123.690, "elev_km": 0.0},
    {"id": "ART_02", "name": "Connecting Ridge", "lat": -89.463, "lon": 222.510, "elev_km": 0.0},
    {"id": "ART_03", "name": "Connecting Ridge Extension", "lat": -89.032, "lon": 258.001, "elev_km": 0.0},
    {"id": "ART_04", "name": "de Gerlache Rim 1", "lat": -88.683, "lon": 292.068, "elev_km": 0.0},
    {"id": "ART_05", "name": "de Gerlache Rim 2", "lat": -88.230, "lon": 295.372, "elev_km": 0.0},
    {"id": "ART_06", "name": "de Gerlache-Kocher Massif", "lat": -85.830, "lon": 243.678, "elev_km": 0.0},
    {"id": "ART_07", "name": "Haworth", "lat": -86.764, "lon": 337.223, "elev_km": 0.0},
    {"id": "ART_08", "name": "Malapert Massif", "lat": -85.995, "lon": 359.764, "elev_km": 0.0},
    {"id": "ART_09", "name": "Leibnitz Beta Plateau", "lat": -85.427, "lon": 31.743, "elev_km": 0.0},
    {"id": "ART_10", "name": "Mons Mouton", "lat": -85.423, "lon": 31.586, "elev_km": 0.0},
    {"id": "ART_11", "name": "Mons Mouton Plateau", "lat": -84.232, "lon": 29.926, "elev_km": 0.0},
    {"id": "ART_12", "name": "Nobile Rim 1", "lat": -85.438, "lon": 37.367, "elev_km": 0.0},
    {"id": "ART_13", "name": "Nobile Rim 2", "lat": -83.954, "lon": 58.822, "elev_km": 0.0},
    {"id": "ART_14", "name": "Amundsen Rim", "lat": -84.229, "lon": 69.444, "elev_km": 0.0},
    {"id": "ART_15", "name": "Faustini Rim A", "lat": -87.890, "lon": 90.000, "elev_km": 0.0},
    {"id": "ART_16", "name": "Slater Plain", "lat": -87.149, "lon": 126.134, "elev_km": 0.0},
    {"id": "ART_17", "name": "Peak near Cabeus B", "lat": -83.661, "lon": 290.986, "elev_km": 0.0}
]

START_TIME = "2027-01-01"
STOP_TIME = "2027-01-31"
STEP_SIZE = "6h"

def fetch_horizons_target(site, target_id):
    url = "https://ssd.jpl.nasa.gov/api/horizons.api"
    lon_east = site["lon"] if site["lon"] >= 0 else 360.0 + site["lon"]
    site_coord = f"'{lon_east:.5f},{site['lat']:.5f},{site['elev_km']:.3f}'"
    
    params = {
        "format": "json",
        "COMMAND": f"'{target_id}'",
        "OBJ_DATA": "'NO'",
        "MAKE_EPHEM": "'YES'",
        "EPHEM_TYPE": "'OBSERVER'",
        "CENTER": "'coord@301'",
        "COORD_TYPE": "'GEODETIC'",
        "SITE_COORD": site_coord,
        "START_TIME": f"'{START_TIME}'",
        "STOP_TIME": f"'{STOP_TIME}'",
        "STEP_SIZE": f"'{STEP_SIZE}'",
        "QUANTITIES": "'4,20'",
        "CSV_FORMAT": "'YES'"
    }
    resp = requests.get(url, params=params, timeout=30)
    resp.raise_for_status()
    raw_text = resp.json().get("result", "")
    
    if "$$SOE" not in raw_text or "$$EOE" not in raw_text:
        raise ValueError(f"Error en Horizons para {site['name']}: {raw_text[:300]}")
    
    block = raw_text.split("$$SOE")[1].split("$$EOE")[0].strip()
    rows = []
    for line in block.splitlines():
        parts = [p.strip() for p in line.split(",")]
        if len(parts) >= 5:
            rows.append((parts[0], float(parts[3]), float(parts[4])))
    return rows

all_records = []
for idx, site in enumerate(SITES, 1):
    print(f"[{idx}/23] Descargando JPL Horizons para {site['name']}...")
    sun_rows = fetch_horizons_target(site, "10")    # 10 = Sol
    earth_rows = fetch_horizons_target(site, "399") # 399 = Tierra
    
    for (dt_s, sun_az, sun_el), (dt_e, earth_az, earth_el) in zip(sun_rows, earth_rows):
        all_records.append({
            "timestamp_utc": dt_s,
            "site_id": site["id"],
            "site_name": site["name"],
            "lat_deg": site["lat"],
            "lon_deg": site["lon"],
            "sun_azimuth_deg": sun_az,
            "sun_elevation_deg": sun_el,
            "earth_azimuth_deg": earth_az,
            "earth_elevation_deg": earth_el
        })
    time.sleep(0.4)

pd.DataFrame(all_records).to_csv("real_jpl_horizons_23_sites.csv", index=False)
print("Listo! Archivo real_jpl_horizons_23_sites.csv generado con éxito.")
