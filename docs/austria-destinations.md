# Austria: 12 destination profiles

The Austrian extension adds twelve draft catalog entries to the 149 existing profiles. It does not publish canonical destination routes or add editorial cards to the home page, season pages or monthly pages. The translated text, four recommendations and seasonal months are tourist guidance, not live weather, schedules, availability or prices.

## Airports and ground access

| Profile | Own commercial arrival airport | Alternative arrival airports requiring ground travel | Notes |
| --- | --- | --- | --- |
| Vienna | VIE | — | Austria's principal international gateway. |
| Salzburg | SZG | — | Some connections vary by season; check the current timetable. |
| Innsbruck | INN | — | Alpine gateway with important seasonal variation. |
| Graz | GRZ | — | Check the current route and timetable. |
| Linz | LNZ | — | Check the current route and timetable. |
| Klagenfurt | KLU | — | Limited network; do not assume direct flights. |
| Hallstatt | — | SZG, LNZ | Continue by train or bus. Hallstatt station is across the lake; check the ferry. |
| Wachau Valley | — | VIE, LNZ | Continue by rail/bus to the Danube valley. |
| Zell am See | — | SZG, INN | Continue by rail or bus. |
| Kitzbühel | — | INN, SZG | Continue by rail or bus. |
| Bregenz | — | FDH (Germany), ACH and ZRH (Switzerland) | Cross-border transfer required; ACH has limited service. |
| Bad Gastein | — | SZG | Continue by rail or bus. |

The six Austrian airport codes VIE, SZG, INN, GRZ, LNZ and KLU were checked against the [Austrian AIP](https://eaip.austrocontrol.at/lo/250515/PART_1/LO_GEN_3_4_en.pdf), [Austria Tourism's airport guide](https://www.austria.info/en-gb/planning/austria-by-plane/) and public, token-free [Travelpayouts places2](https://autocomplete.travelpayouts.com/places2) responses captured in `tests/fixtures/austria-places.json` on 2026-10-22. The provider's presence of an IATA code does not imply a flight is available for a particular route or date. Seasonal/limited service was cross-checked with airport schedules for [Salzburg](https://www.salzburg-airport.com/en/flights-arrival/flights/flight-schedule/), [Innsbruck](https://www.innsbruck-airport.com/en/), [Graz](https://graz-airport.at/en/passengers/passengers-destinations/flight-schedule/), [Linz](https://www.linz-airport.com/flugplan/) and [Klagenfurt](https://www.klagenfurt-airport.at/en/flight-schedule). No railway station code is passed as a flight IATA.

Ground access is supported by [Austria Tourism's rail guide](https://www.austria.info/en-gb/planning/austria-by-train/), [Hallstatt itinerary](https://www.austria.info/en-us/recommendations/discover-austria/all-of-austria-by-train/), [Wachau guide](https://www.austria.info/en-gb/regions/wachau-valley/), [Bregenz guide](https://www.austria.info/de-ch/staedte-und-orte/bregenz/) and [Kitzbühel guide](https://www.austria.info/en-gb/recommendations/365-days/kitzbuehel/). These are arrival options, not promised connections. Always recheck current timetables.

## Images

Each entry in `lib/destinations/austria-images.ts` records the 960px Wikimedia Commons thumbnail, original file page, named credit and direct Creative Commons license link. Metadata was read from Wikimedia Commons imageinfo on 2026-10-22. All selected photos use CC BY or CC BY-SA; no NC/ND license is used. The source page remains available so the attribution and any share-alike obligations can be inspected. Image delivery is checked separately against the Vercel Preview.

## Catalog behavior

City/airport autocomplete overlays the six verified physical airports and the local-language city aliases onto Travelpayouts' public response. Hallstatt, Wachau, Zell am See, Kitzbühel, Bregenz and Bad Gastein are code-free tourist suggestions; choosing one opens its catalog profile and uses a verified access airport only when explicitly selecting a flight search. For these six profiles `airports` and `iataCodes` remain empty. An access airport is stored separately in `accessAirports`. The price API, affiliate links and voice model are unchanged.
