(* Current weather for a place, from the open-meteo public API, no key needed.
   Run it through this repo's own server: Get["examples/weather.wl"] in the
   evaluator tool, or wolframscript -file examples/weather.wl. *)

fetchWeather[lat_?NumberQ, lon_?NumberQ] :=
  URLExecute[
    "https://api.open-meteo.com/v1/forecast",
    {
      "latitude" -> lat,
      "longitude" -> lon,
      "current" -> "temperature_2m,wind_speed_10m,weather_code"
    },
    "RawJSON"
  ]

weatherLabel[code_Integer] :=
  Which[
    code == 0, "clear skies",
    code < 50, "clouds or fog",
    code < 80, "rain",
    True, "storms"
  ]

describeWeather[place_String, lat_?NumberQ, lon_?NumberQ] :=
  Module[{current = fetchWeather[lat, lon]["current"], label},
    label = weatherLabel[current["weather_code"]];
    StringTemplate["`1`: `2`\[Degree]C, wind `3` km/h, `4`"][
      place,
      current["temperature_2m"],
      current["wind_speed_10m"],
      label
    ]
  ]

describeWeather["Champaign, IL", 40.1164, -88.2434]
