import os
import glob
import math
import json
import pandas as pd

# Buscar automáticamente el archivo Excel en la carpeta actual o en Descargas
search_paths = [
    "plantilla_23_sitios*.xlsx",
    os.path.expanduser("~/Descargas/plantilla_23_sitios*.xlsx"),
    os.path.expanduser("~/Downloads/plantilla_23_sitios*.xlsx"),
]
candidates = []
for pattern in search_paths:
    candidates.extend(glob.glob(pattern))

if not candidates:
    raise FileNotFoundError("No se encontró ningún archivo 'plantilla_23_sitios*.xlsx' ni en backend/ ni en ~/Descargas.")

EXCEL_FILE = max(candidates, key=os.path.getmtime)
print(f"Usando archivo Excel encontrado: {EXCEL_FILE}")

HORIZONS_CSV = "real_jpl_horizons_23_sites.csv"
OUTPUT_JSON = "lunar_navigator_frontend_data.json"
OUTPUT_CSV = "lunar_23_sites_final_verified.csv"

PEAK_MEASUREMENTS = {
    "ART_04": {"h_pico_m": 1796.0, "d_km": 5.330},
    "ART_05": {"h_pico_m": 1514.0, "d_km": 6.810},
    "ART_07": {"h_pico_m": 4562.0, "d_km": 43.109},
    "ART_11": {"h_pico_m": 6659.0, "d_km": 29.736},
    "ART_12": {"h_pico_m": 6768.0, "d_km": 5.211},
    "ART_13": {"h_pico_m": 5190.0, "d_km": 34.799},
    "ART_16": {"h_pico_m": 532.0,  "d_km": 4.386},
}

R_MOON_M = 1_737_400.0

def calc_horizon_angle_deg(h_site_m, h_peak_m, d_km):
    d_m = d_km * 1000.0
    if d_m <= 0:
        return 0.0
    tan_theta = ((h_peak_m - h_site_m) / d_m) - (d_m / (2.0 * R_MOON_M))
    angle_deg = math.degrees(math.atan(tan_theta))
    return round(max(0.0, angle_deg), 3)

xls = pd.ExcelFile(EXCEL_FILE)
df_sites = pd.read_excel(EXCEL_FILE, sheet_name=xls.sheet_names[0])
df_sites = df_sites[df_sites["site_id"].notna() & df_sites["site_id"].astype(str).str.startswith(("APOLLO_", "ART_"))].copy()

horizon_angles = []
for _, row in df_sites.iterrows():
    sid = row["site_id"]
    h_site = float(row["elevation_lola_m"])
    if sid in PEAK_MEASUREMENTS:
        m = PEAK_MEASUREMENTS[sid]
        angle = calc_horizon_angle_deg(h_site, m["h_pico_m"], m["d_km"])
    else:
        angle = 0.0
    horizon_angles.append(angle)

df_sites["horizon_mask_deg"] = horizon_angles

df_eph = pd.read_csv(HORIZONS_CSV)
site_lookup = df_sites.set_index("site_id").to_dict(orient="index")

sunlit_flags, dte_flags, solar_kw_m2 = [], [], []

for _, row in df_eph.iterrows():
    sid = row["site_id"]
    meta = site_lookup[sid]
    h_mask = meta["horizon_mask_deg"]
    
    sun_el = float(row["sun_elevation_deg"])
    earth_el = float(row["earth_elevation_deg"])
    
    is_sunlit = int(sun_el > h_mask)
    has_dte = int(earth_el > h_mask)
    
    if is_sunlit:
        if meta["center_lat_deg"] < -80.0:
            eff_factor = math.cos(math.radians(max(0.0, sun_el)))
        else:
            eff_factor = math.sin(math.radians(max(0.0, sun_el)))
        kw = round(1.361 * 0.28 * eff_factor, 3)
    else:
        kw = 0.0
        
    sunlit_flags.append(is_sunlit)
    dte_flags.append(has_dte)
    solar_kw_m2.append(kw)

df_eph["is_sunlit"] = sunlit_flags
df_eph["has_dte_comm"] = dte_flags
df_eph["solar_power_kw_per_m2"] = solar_kw_m2

summary_stats = df_eph.groupby("site_id").agg(
    jan2027_sunlight_pct=("is_sunlit", lambda x: round(x.mean() * 100, 1)),
    jan2027_dte_comm_pct=("has_dte_comm", lambda x: round(x.mean() * 100, 1)),
    max_sun_elevation_deg=("sun_elevation_deg", lambda x: round(x.max(), 2)),
    min_sun_elevation_deg=("sun_elevation_deg", lambda x: round(x.min(), 2)),
    max_earth_elevation_deg=("earth_elevation_deg", lambda x: round(x.max(), 2)),
    min_earth_elevation_deg=("earth_elevation_deg", lambda x: round(x.min(), 2)),
    avg_solar_power_kw_m2=("solar_power_kw_per_m2", lambda x: round(x.mean(), 3))
).reset_index()

df_sites_final = pd.merge(df_sites, summary_stats, on="site_id", how="left")
df_sites_final.to_csv(OUTPUT_CSV, index=False)

challenges = [
    {
        "challenge_id": "CH_01",
        "title": "Operación Luz Eterna (Energía Solar Crítica)",
        "difficulty": "Fácil",
        "mission_type": "Estación de Energía Robótica",
        "fixed_variable": "Fecha fija: Enero 2027 | Batería de reserva mínima: requiere > 85% de iluminación mensual",
        "player_task": "Elegir una región de Artemis con baja pendiente (< 6°) e iluminación casi continua",
        "max_slope_deg": 6.0,
        "min_sun_illumination_pct": 85.0,
        "require_dte_comm": True,
        "educational_lesson": "En el Polo Sur el Sol nunca sube más de ~1.5° sobre el horizonte, pero en las crestas altas con horizonte despejado (0° de máscara) roza el horizonte casi todo el mes. Los paneles solares deben instalarse VERTICALES y giratorios."
    },
    {
        "challenge_id": "CH_02",
        "title": "La Trampa de los Cráteres Profundos",
        "difficulty": "Media",
        "mission_type": "Módulo de Exploración Polar",
        "fixed_variable": "Comparar sitios en depresiones (ej. Nobile Rim 2 o Slater Plain) vs. mesetas altas",
        "player_task": "Evitar sitios donde el borde del cráter tape el Sol y la Tierra simultáneamente",
        "max_slope_deg": 8.0,
        "min_sun_illumination_pct": 50.0,
        "require_dte_comm": True,
        "educational_lesson": "Cuando un sitio está hundido respecto a un borde cercano, el ángulo de máscara del horizonte supera la baja elevación del Sol polar (~1.5°), dejando la nave a oscuras y sin línea de visión directa hacia la Tierra."
    },
    {
        "challenge_id": "CH_03",
        "title": "Descenso Seguro: Tolerancia de Pendiente",
        "difficulty": "Media",
        "mission_type": "Aterrizador Tripulado de Gran Altura (HLS)",
        "fixed_variable": "Tolerancia estricta de inclinación: Pendiente LOLA < 3.0° para evitar vuelco",
        "player_task": "Descartar bordes escarpados (como Faustini Rim A con 21.2°) y elegir la meseta más plana del Polo Sur",
        "max_slope_deg": 3.0,
        "min_sun_illumination_pct": 60.0,
        "require_dte_comm": True,
        "educational_lesson": "Una nave alta tiene un centro de gravedad elevado: aterrizar en pendientes mayores a 5°–8° arriesga el vuelco. Mons Mouton ofrece una cumbre de más de 5.300 m con apenas 1.65° de pendiente."
    },
    {
        "challenge_id": "CH_04",
        "title": "Apolo vs. Artemis: Ecuador vs. Polo Sur",
        "difficulty": "Difícil",
        "mission_type": "Análisis Comparativo de Misiones",
        "fixed_variable": "Comparar el ciclo solar de un sitio Apolo (ej. Apolo 11 o 16) frente a un sitio Artemis",
        "player_task": "Identificar por qué las misiones Apolo duraban solo unos días terrestres mientras Artemis busca semanas de luz",
        "max_slope_deg": 6.0,
        "min_sun_illumination_pct": 40.0,
        "require_dte_comm": True,
        "educational_lesson": "En el ecuador lunar (Apolo), el Sol sube hasta casi 90° pero luego hay 14 días seguidos de noche absoluta y frío extremo. En el Polo Sur (Artemis), el Sol nunca sube alto, pero en los picos elevados evita la noche lunar de 14 días."
    }
]

sites_records = json.loads(df_sites_final.to_json(orient="records"))
ephemeris_records = json.loads(df_eph.to_json(orient="records"))

bundle = {
    "metadata": {
        "project": "NASA Space Apps 2026 - Lunar Landing Site Navigator",
        "data_provenance": "100% Real: NASA JPL Horizons Ephemeris + LROC/LOLA Topography",
        "coordinate_system": "Lunar Mean Earth / Polar Axes (DE421)",
        "time_range_utc": f"{df_eph['timestamp_utc'].min()} to {df_eph['timestamp_utc'].max()}",
        "total_sites": len(sites_records),
        "total_ephemeris_points": len(ephemeris_records)
    },
    "sites": sites_records,
    "challenges": challenges,
    "ephemeris": ephemeris_records
}

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(bundle, f, ensure_ascii=False, indent=2)

print("\n=== TABLA FINAL VERIFICADA (23 SITIOS) ===")
print(df_sites_final[["site_id", "name", "elevation_lola_m", "slope_lola_deg", "horizon_mask_deg", "jan2027_sunlight_pct", "jan2027_dte_comm_pct"]].to_string(index=False))
print(f"\nArchivos generados: {OUTPUT_JSON} y {OUTPUT_CSV}")
