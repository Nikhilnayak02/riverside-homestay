const fs = require('fs');
const path = require('path');
const ical = require('node-ical');
let icalGen = require('ical-generator');
if (icalGen && typeof icalGen !== 'function' && icalGen.default) icalGen = icalGen.default;

const ROOT = path.resolve(__dirname, '..');
const CONFIG = path.join(ROOT, 'data', 'calendar-config.json');
const OUT_ICS = path.join(ROOT, 'data', 'calendar.ics');
const OUT_JSON = path.join(ROOT, 'data', 'calendar.json');
const ROOMS_FILE = path.join(ROOT, 'data', 'rooms.json');

async function fetchText(url) {
  try {
    const res = await fetch(url, { timeout: 20000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    console.error('Failed fetch', url, e.message);
    return null;
  }
}

function normalizeEvent(ev, roomMatchers) {
  const summary = ev.summary || 'Booking';
  const location = ev.location || '';
  let matchedRoom = null;
  const textToCheck = (summary + ' ' + location).toLowerCase();
  for (const r of roomMatchers) {
    for (const kw of r.keywords) {
      if (textToCheck.includes(kw.toLowerCase())) { matchedRoom = r.id; break; }
    }
    if (matchedRoom) break;
  }

  return {
    uid: ev.uid || `${summary}-${ev.start}`,
    start: ev.start ? new Date(ev.start).toISOString() : null,
    end: ev.end ? new Date(ev.end).toISOString() : null,
    summary,
    description: ev.description || '',
    location,
    room: matchedRoom
  };
}

async function main() {
  const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  const feeds = Array.isArray(cfg.feeds) ? cfg.feeds.filter(Boolean) : [];

  const eventsByUid = new Map();
  const roomMatchers = (() => { try { return JSON.parse(fs.readFileSync(ROOMS_FILE,'utf8')); } catch(e){ return []; }})();

  for (const url of feeds) {
    console.log('Fetching', url);
    const text = await fetchText(url);
    if (!text) continue;
    try {
      const parsed = ical.parseICS(text);
      for (const k of Object.keys(parsed)) {
        const item = parsed[k];
        if (item.type === 'VEVENT') {
          const e = normalizeEvent(item, roomMatchers);
          eventsByUid.set(e.uid, e);
        }
      }
    } catch (e) {
      console.error('Parse error for', url, e.message);
    }
  }

  const events = Array.from(eventsByUid.values()).sort((a,b) => {
    return new Date(a.start) - new Date(b.start);
  });

  // write JSON
  fs.writeFileSync(OUT_JSON, JSON.stringify({ generated_at: new Date().toISOString(), count: events.length, events }, null, 2));
  console.log('Wrote', OUT_JSON);

  // write ICS
  const cal = icalGen({ name: 'Riverside Homestay bookings (combined)' });
  events.forEach(e => {
    cal.createEvent({ id: e.uid, start: e.start ? new Date(e.start) : null, end: e.end ? new Date(e.end) : null, summary: e.summary, description: e.description, location: e.location });
  });
  fs.writeFileSync(OUT_ICS, cal.toString());
  console.log('Wrote', OUT_ICS);
}

main().catch(err => { console.error(err); process.exit(1); });
