# Changelog — Riverside Homestay

All notable changes and automation scripts for the Riverside Homestay static site.

## 2026-07-27
- Added GitHub Pages publishing and ensured site is live at https://nikhilnayak02.github.io/riverside-homestay/
- Updated hero and site text to reflect **3 rooms**.
- Updated embedded Google Maps pin and GPS coordinates to dropped-pin: `14.9304564, 74.1836495`.
- Added `copilot-instructions.md` to help Copilot understand project structure and purpose.
- Added `tools/generate-copilot-instructions.js` and workflow `.github/workflows/update-copilot-instructions.yml` to auto-regenerate Copilot instructions on push.
- Calendar integration:
  - Added `data/calendar-config.json` to store OTA iCal feed URLs.
  - Added `tools/fetch-combine-ical.js` to fetch, merge and normalize iCal feeds into `data/calendar.json` and `data/calendar.ics`.
  - Added scheduled GitHub Action `.github/workflows/update-calendar.yml` to run the aggregator hourly and commit updates.
  - Added `calendar/index.html` UI and `/data/calendar.ics` subscribe link.
  - Added `tools/package.json` for calendar tooling dependencies.
- Per-room support:
  - Added `data/rooms.json` with 3 rooms and keywords.
  - Updated aggregator to auto-assign events to rooms when keywords match event summary/location.
  - Added FullCalendar UI at `/calendar/` with room filters and color-coding.
- Added JSON-LD LocalBusiness (`LodgingBusiness`) structured data to `index.html` (name, description, address, geo coords, contact, numberOfRooms).

## Notes
- To enable calendar syncing: add OTA iCal URLs to `data/calendar-config.json`.
- To make the homestay name appear on Google Maps: claim the Google Business Profile for the location (steps in main README or ask me to draft the listing content and photos).
