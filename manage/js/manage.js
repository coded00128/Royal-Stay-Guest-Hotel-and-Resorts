/* ============================================================
   ROYAL STAY — Demo Backend / Management Console
   manage/js/manage.js

   A LOCAL DEMO "backend". Everything runs in the browser on
   localStorage so the whole demo works offline. No real server.
   ============================================================ */

/* ============================ Config ============================ */
var DB_KEY = 'rs_backend_db';
var AUTH_KEY = 'rs_auth';
var ROOM_OVERRIDE_KEY = 'rs_rooms_override';
var SITE_BOOKING_KEY = 'rs_last_booking';
var TAX_RATE = 7.5; // default % — overridable in Settings

/* ============================ Utilities ============================ */
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function uid(prefix) {
  return (prefix || 'id') + '-' + Date.now().toString(36).toUpperCase().slice(-5) +
    Math.random().toString(36).toUpperCase().slice(2, 6);
}

function pad(n) { return (n < 10 ? '0' : '') + n; }

function dateISO(offsetDays) {
  var d = new Date();
  d.setDate(d.getDate() + (offsetDays || 0));
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function isoHoursAgo(h) { return new Date(Date.now() - (h || 0) * 3600000).toISOString(); }

function daysBetween(a, b) {
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
}

function fmtMoney(n) {
  var s = settings().currency;
  return s + Number(n || 0).toLocaleString('en-US');
}

function fmtDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso.indexOf('T') > -1 ? iso : iso + 'T00:00:00');
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDT(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function initials(name) {
  return String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2)
    .map(function (w) { return w[0]; }).join('').toUpperCase();
}

/* Icons — feather-style line icons */
var ICONS = {
  dash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  rooms: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>',
  bookings: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 15 11.5 17.5 15 13.5"/></svg>',
  admissions: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><polyline points="9 13 11 15 15 11"/></svg>',
  users: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  roles: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
  txns: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><line x1="5" y1="14" x2="9" y2="14"/></svg>',
  activity: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  api: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  settings: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  eye: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  out: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  warn: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  key: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
  refresh: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>'
};

/* ============================ Settings / DB ============================ */
function defaultCatalog() {
  // Mirrors the website's default room catalog (js/main.js) — the console owns it.
  return [
    { id: 'standard', name: 'Standard Room', badge: '', price: 35000, capacity: 2, bed: '1 Queen Bed', size: '28 m\u00B2', active: true, image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=70', tagline: 'Comfortable and cosy with everything you need for a restful night.', features: ['Free Wi-Fi', 'Smart TV', 'Work desk', 'Air conditioning', 'Rain shower', 'Daily housekeeping'] },
    { id: 'deluxe', name: 'Deluxe Room', badge: 'Most Popular', price: 45000, capacity: 2, bed: '1 King Bed', size: '34 m\u00B2', active: true, image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=70', tagline: 'A refined retreat with city views, plush bedding and modern comforts.', features: ['Free Wi-Fi', 'Smart TV', 'Work desk', 'Air conditioning', 'Rain shower', 'Mini bar', 'City view'] },
    { id: 'executive', name: 'Executive Room', badge: '', price: 65000, capacity: 2, bed: '1 King Bed', size: '40 m\u00B2', active: true, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=70', tagline: 'Executive comfort with lounge access and panoramic skyline views.', features: ['Free Wi-Fi', 'Smart TV', 'Executive lounge access', 'Air conditioning', 'Bathtub', 'Mini bar', 'City view', 'Late checkout'] },
    { id: 'family', name: 'Family Room', badge: 'Great for Families', price: 85000, capacity: 4, bed: '2 Queen Beds', size: '46 m\u00B2', active: true, image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=70', tagline: 'Spacious living area and two queen beds, perfect for the whole family.', features: ['Free Wi-Fi', 'Smart TV', 'Separate living area', 'Air conditioning', 'Rain shower', 'Kids amenities', 'Mini bar'] },
    { id: 'suite', name: 'Suite Room', badge: '', price: 95000, capacity: 4, bed: '1 King Bed + Sofa Bed', size: '58 m\u00B2', active: true, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=70', tagline: 'A stylish split-level suite with a lounge, dining corner and skyline views.', features: ['Free Wi-Fi', 'Smart TV', 'Separate lounge & dining', 'Air conditioning', 'Bathtub', 'Mini bar', 'City view', 'Butler on call'] },
    { id: 'presidential', name: 'Presidential Suite', badge: 'Ultimate Luxury', price: 150000, capacity: 6, bed: '2 King Beds', size: '96 m\u00B2', active: true, image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=70', tagline: 'Our signature suite: private dining, panoramic views and white-glove service.', features: ['Free Wi-Fi', 'Smart TV', 'Private dining room', 'Separate lounge & study', 'Jacuzzi bathtub', 'Mini bar', 'Panoramic view', 'Private butler', 'Airport limousine'] }
  ];
}

function defaultRoles() {
  return {
    admin: { label: 'Administrator', color: 'rc-gold', perms: { rooms: true, bookings: true, admissions: true, users: true, roles: true, transactions: true, activity: true, api: true, settings: true } },
    staff: { label: 'Front Desk Staff', color: 'rc-green', perms: { rooms: true, bookings: true, admissions: true, users: false, roles: false, transactions: true, activity: true, api: false, settings: false } },
    guest: { label: 'Guest', color: '', perms: { rooms: false, bookings: true, admissions: false, users: false, roles: false, transactions: false, activity: false, api: false, settings: false } }
  };
}

function defaultDB() {
  var today = dateISO(0);
  var catRooms = defaultCatalog();
  var catByName = {};
  catRooms.forEach(function (r) { catByName[r.name] = r; });
  function mkBooking(o) {
    var cat = catByName[o.roomName] || {};
    var nights = o.nights || daysBetween(o.checkin, o.checkout);
    var roomsN = o.rooms || 1;
    var sub = (o.price || 0) * nights * roomsN;
    var tax = Math.round(sub * (TAX_RATE / 100));
    return {
      id: 'bk-' + o.ref,
      ref: o.ref,
      roomId: o.roomId || cat.id || '',
      roomName: o.roomName || 'Room',
      roomImage: o.roomImage || cat.image || '',
      guestName: o.guestName || 'Guest',
      guestEmail: o.guestEmail || '',
      guestPhone: o.guestPhone || '',
      checkin: o.checkin, checkout: o.checkout, nights: nights,
      guests: o.guests || 2, rooms: roomsN,
      sub: sub, tax: tax, total: sub + tax,
      payment: o.payment || 'Pay at Hotel',
      status: o.status || 'pending',
      source: o.source || 'console',
      created: o.created || isoHoursAgo(24)
    };
  }
  return {
    schema: 1,
    settings: {
      brandName: 'ROYAL STAY', brandSub: 'HOTELS & RESORTS',
      tagline: 'Experience Comfort, Excellence & Elegance',
      address: '12 Adetokunbo Ademola Street, Victoria Island, Lagos, Nigeria',
      phoneDisplay: '0916 133 0967', phoneTel: '+2349161330967', whatsapp: '2349161330967',
      email: 'reservations@royalstay.com',
      currency: '\u20A6', taxRate: 7.5, cancelHours: 48,
      allowOnlineBookings: true, maintenanceMode: false
    },
    rooms: defaultCatalog(),
    users: [
      { id: 'u-admin', name: 'Adaeze Okonkwo', email: 'admin@royalstay.com', password: 'admin123', role: 'admin', phone: '0916 133 0967', created: isoHoursAgo(24 * 90) },
      { id: 'u-staff', name: 'Emeka Okafor', email: 'manager@royalstay.com', password: 'manager123', role: 'staff', phone: '0803 221 7788', created: isoHoursAgo(24 * 40) },
      { id: 'u-tunde', name: 'Tunde Bakare', email: 'tunde@example.com', password: 'guest123', role: 'guest', phone: '0805 600 1122', created: isoHoursAgo(24 * 12) },
      { id: 'u-chiamaka', name: 'Chiamaka Nwosu', email: 'chiamaka@example.com', password: 'guest123', role: 'guest', phone: '0812 004 5566', created: isoHoursAgo(24 * 6) }
    ],
    roles: defaultRoles(),
    bookings: [
      mkBooking({ ref: 'RS-A7K2P9', roomId: 'executive', roomName: 'Executive Room', price: 65000, checkin: dateISO(1), checkout: dateISO(4), guests: 2, rooms: 1, guestName: 'Tunde Bakare', guestEmail: 'tunde@example.com', guestPhone: '0805 600 1122', payment: 'Pay at Hotel', status: 'confirmed', created: isoHoursAgo(26) }),
      mkBooking({ ref: 'RS-Q5M3D8', roomId: 'deluxe', roomName: 'Deluxe Room', price: 45000, checkin: dateISO(3), checkout: dateISO(6), guests: 2, rooms: 1, guestName: 'Amara Eze', guestEmail: 'amara.eze@mail.com', guestPhone: '0809 344 2110', payment: 'Card (paid now)', status: 'confirmed', created: isoHoursAgo(30) }),
      mkBooking({ ref: 'RS-B9W6K1', roomId: 'standard', roomName: 'Standard Room', price: 35000, checkin: dateISO(-1), checkout: dateISO(1), guests: 2, rooms: 1, guestName: 'Tunde Bakare', guestEmail: 'tunde@example.com', guestPhone: '0805 600 1122', payment: 'Card (paid now)', status: 'checked-in', created: isoHoursAgo(70) }),
      mkBooking({ ref: 'RS-C4R8T3', roomId: 'suite', roomName: 'Suite Room', price: 95000, checkin: dateISO(-10), checkout: dateISO(-7), guests: 4, rooms: 1, guestName: 'Chiamaka Nwosu', guestEmail: 'chiamaka@example.com', guestPhone: '0812 004 5566', payment: 'Pay at Hotel', status: 'completed', created: isoHoursAgo(24 * 11) }),
      mkBooking({ ref: 'RS-J2H7V5', roomId: 'presidential', roomName: 'Presidential Suite', price: 150000, checkin: dateISO(5), checkout: dateISO(8), guests: 4, rooms: 1, guestName: 'Amara Eze', guestEmail: 'amara.eze@mail.com', guestPhone: '0809 344 2110', payment: 'Card (paid now)', status: 'cancelled', created: isoHoursAgo(24 * 2) })
    ],
    admissionRequests: [
      { id: 'adm-1', guest: 'Oluchi Adeyemi', phone: '0803 900 3344', room: 'Deluxe Room', roomId: 'deluxe', arrival: dateISO(0), time: '14:00', type: 'Early check-in', notes: 'Flying in from Abuja — asked to check in before 2pm.', status: 'pending', created: isoHoursAgo(6) },
      { id: 'adm-2', guest: 'Musa Ibrahim', phone: '0701 118 9020', room: 'Presidential Suite', roomId: 'presidential', arrival: dateISO(1), time: '22:30', type: 'Late arrival', notes: 'Landing at 21:45, please keep reception informed.', status: 'pending', created: isoHoursAgo(9) },
      { id: 'adm-3', guest: 'Funke Alabi', phone: '0802 660 7710', room: 'Executive Room', roomId: 'executive', arrival: dateISO(-1), time: '08:10', type: 'Airport pickup', notes: 'Needs limousine pickup from MMA2 terminal.', status: 'approved', created: isoHoursAgo(50) },
      { id: 'adm-4', guest: 'David Osei', phone: '0810 227 4455', room: 'Family Room', roomId: 'family', arrival: dateISO(2), time: '16:00', type: 'VIP escort', notes: 'Corporate VIP — arrange welcome amenity.', status: 'pending', created: isoHoursAgo(3) }
    ],
    transactions: [
      { id: 'txn-1', ref: 'TXN-88412', bookingRef: 'RS-Q5M3D8', guest: 'Amara Eze', desc: 'Website payment — Deluxe Room', method: 'Card', amount: 145125, status: 'paid', created: isoHoursAgo(30) },
      { id: 'txn-2', ref: 'TXN-77390', bookingRef: 'RS-B9W6K1', guest: 'Tunde Bakare', desc: 'Website payment — Standard Room', method: 'Card', amount: 75250, status: 'paid', created: isoHoursAgo(70) },
      { id: 'txn-3', ref: 'TXN-65421', bookingRef: 'RS-C4R8T3', guest: 'Chiamaka Nwosu', desc: 'Hotel payment — Suite Room (settled at front desk)', method: 'Cash', amount: 306375, status: 'paid', created: isoHoursAgo(24 * 10) },
      { id: 'txn-4', ref: 'TXN-60218', bookingRef: 'RS-J2H7V5', guest: 'Amara Eze', desc: 'Refund — cancelled Presidential Suite', method: 'Card', amount: 483750, status: 'refunded', created: isoHoursAgo(24 * 2) },
      { id: 'txn-5', ref: 'TXN-91820', bookingRef: 'RS-A7K2P9', guest: 'Tunde Bakare', desc: 'Deposit on arrival — Executive Room', method: 'Pay at Hotel', amount: 65000, status: 'pending', created: isoHoursAgo(26) }
    ],
    logs: [
      { id: 'log-1', actor: 'Emeka Okafor', action: 'booking.checked_in', module: 'Bookings', detail: 'Marked RS-B9W6K1 (Standard Room) as checked-in.', created: isoHoursAgo(20) },
      { id: 'log-2', actor: 'Adaeze Okonkwo', action: 'room.updated', module: 'Rooms', detail: 'Updated pricing on Presidential Suite.', created: isoHoursAgo(40) },
      { id: 'log-3', actor: 'System', action: 'auth.login', module: 'Users', detail: 'Adaeze Okonkwo signed in to the console.', created: isoHoursAgo(44) },
      { id: 'log-4', actor: 'Chiamaka Nwosu', action: 'booking.created', module: 'Bookings', detail: 'New booking RS-C4R8T3 for the Suite Room.', created: isoHoursAgo(24 * 11) },
      { id: 'log-5', actor: 'Emeka Okafor', action: 'admission.approved', module: 'Admissions', detail: 'Approved early admission for Funke Alabi.', created: isoHoursAgo(48) },
      { id: 'log-6', actor: 'System', action: 'system.seeded', module: 'System', detail: 'Demo database initialised with sample data.', created: isoHoursAgo(24 * 100) }
    ],
    api: {
      key: 'rs_live_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10),
      mode: 'sandbox',
      endpoints: [
        { method: 'GET', path: '/api/v1/rooms', desc: 'List all rooms & rates', active: true },
        { method: 'GET', path: '/api/v1/rooms/:id', desc: 'Fetch a single room', active: true },
        { method: 'GET', path: '/api/v1/availability', desc: 'Room availability by date range', active: true },
        { method: 'GET', path: '/api/v1/offers', desc: 'Active offers & promotions', active: true },
        { method: 'GET', path: '/api/v1/bookings', desc: 'List reservations', active: true },
        { method: 'POST', path: '/api/v1/bookings', desc: 'Create a reservation', active: true },
        { method: 'PUT', path: '/api/v1/bookings/:id/status', desc: 'Update reservation status', active: true },
        { method: 'DELETE', path: '/api/v1/bookings/:id', desc: 'Cancel / remove reservation', active: true },
        { method: 'POST', path: '/api/v1/webhooks/whatsapp', desc: 'WhatsApp message intake', active: false }
      ]
    }
  };
}

var __cache = null;

function db() {
  if (__cache) return __cache;
  var raw = null;
  try { raw = localStorage.getItem(DB_KEY); } catch (e) {}
  if (raw) {
    try { __cache = JSON.parse(raw); } catch (e) { __cache = null; }
  }
  if (!__cache || !__cache.schema) {
    __cache = defaultDB();
    saveDB();
  }
  return __cache;
}

function saveDB() {
  try { localStorage.setItem(DB_KEY, JSON.stringify(__cache)); } catch (e) {}
}

function settings() { return db().settings; }

function log(action, moduleName, detail, actorName) {
  var d = db();
  var actor = actorName || (session() && session().name) || 'System';
  d.logs.unshift({
    id: uid('log'), actor: actor, action: action,
    module: moduleName || 'System',
    detail: detail || '', created: new Date().toISOString()
  });
  if (d.logs.length > 200) d.logs.length = 200;
  saveDB();
}

function actorName() { var s = session(); return s ? s.name : 'System'; }

/* ---------- Sync the managed catalog out to the website ---------- */
function syncSiteCatalog() {
  var d = db();
  var live = d.rooms.filter(function (r) { return r.active !== false; });
  try {
    if (!live.length) { localStorage.removeItem(ROOM_OVERRIDE_KEY); }
    else {
      var out = live.map(function (r) {
        return { id: r.id, name: r.name, badge: r.badge || '', price: r.price, capacity: r.capacity,
          bed: r.bed, size: r.size, image: r.image, tagline: r.tagline, features: r.features || [] };
      });
      localStorage.setItem(ROOM_OVERRIDE_KEY, JSON.stringify(out));
    }
  } catch (e) {}
}

/* ============================ Auth ============================ */
function session() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch (e) { return null; }
}
function saveSession(u) {
  try { localStorage.setItem(AUTH_KEY, JSON.stringify({ id: u.id, name: u.name, email: u.email, role: u.role })); } catch (e) {}
}
function clearSession() { try { localStorage.removeItem(AUTH_KEY); } catch (e) {} }

function roleLabel(role) {
  var r = db().roles[role];
  return r ? r.label : (role || '—');
}

/* ============================ Import website bookings ============================ */
function importSiteBooking() {
  var d = db();
  var raw = null;
  try { raw = localStorage.getItem(SITE_BOOKING_KEY); } catch (e) {}
  if (!raw) return;
  var b = null;
  try { b = JSON.parse(raw); } catch (e) {}
  if (!b || !b.ref || b._imported === 1) return;
  var exists = d.bookings.some(function (x) { return x.ref === b.ref; });
  if (exists) { try { b._imported = 1; localStorage.setItem(SITE_BOOKING_KEY, JSON.stringify(b)); } catch (e) {} return; }

  var guest = b.guest || {};
  var row = {
    id: 'bk-' + b.ref, ref: b.ref,
    roomId: b.roomId || '', roomName: b.roomName || 'Room', roomImage: b.roomImage || '',
    guestName: guest.name || '', guestEmail: guest.email || '', guestPhone: guest.phone || '',
    checkin: b.checkin || dateISO(1), checkout: b.checkout || dateISO(4),
    nights: b.nights || 1, guests: b.guests || 1, rooms: b.rooms || 1,
    sub: b.sub || 0, tax: b.tax || 0, total: b.total || 0,
    payment: b.paymentMethod || 'Pay at Hotel',
    status: 'pending', source: 'website', created: b.created || new Date().toISOString()
  };
  d.bookings.unshift(row);
  d.transactions.unshift({
    id: uid('txn'), ref: 'TXN-' + Math.floor(10000 + Math.random() * 89999),
    bookingRef: b.ref, guest: guest.name || 'Guest',
    desc: 'Website booking received — ' + (b.roomName || ''),
    method: (b.paymentMethod || '').indexOf('Card') > -1 ? 'Card' : 'Pay at Hotel',
    amount: b.total || 0,
    status: (b.paymentMethod || '').indexOf('Card') > -1 ? 'paid' : 'pending',
    created: row.created
  });
  log('booking.received', 'Bookings', 'New booking ' + b.ref + ' arrived from the website (' + (guest.name || 'guest') + ').', guest.name || 'Guest');
  try { b._imported = 1; localStorage.setItem(SITE_BOOKING_KEY, JSON.stringify(b)); } catch (e) {}
}

/* ============================ Console chrome ============================ */
var NAV = [
  { group: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dash', roles: ['admin', 'staff', 'guest'] }
  ] },
  { group: 'Front Desk', items: [
    { id: 'rooms', label: 'Rooms & Rates', icon: 'rooms', roles: ['admin', 'staff'] },
    { id: 'bookings', label: 'Bookings', icon: 'bookings', roles: ['admin', 'staff', 'guest'], badgeKey: 'pendingBookings' },
    { id: 'admissions', label: 'Admission Requests', icon: 'admissions', roles: ['admin', 'staff'], badgeKey: 'pendingAdmissions' }
  ] },
  { group: 'Management', items: [
    { id: 'users', label: 'Users', icon: 'users', roles: ['admin'] },
    { id: 'roles', label: 'Roles & Permissions', icon: 'roles', roles: ['admin'] },
    { id: 'transactions', label: 'Transactions', icon: 'txns', roles: ['admin', 'staff'] }
  ] },
  { group: 'System', items: [
    { id: 'activity', label: 'Activity Log', icon: 'activity', roles: ['admin', 'staff'] },
    { id: 'api', label: 'API Controls', icon: 'api', roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: 'settings', roles: ['admin'] }
  ] }
];

var VIEW_TITLES = {
  dashboard: ['Dashboard', 'Live overview of bookings, admissions and activity'],
  rooms: ['Rooms & Rates', 'Control the room catalog published on the hotel website'],
  bookings: ['Bookings', 'Every reservation made through the console or the website'],
  admissions: ['Admission Requests', 'Pre-arrival guest admission & registration requests'],
  users: ['Users', 'Accounts on the platform — guests, staff and administrators'],
  roles: ['Roles & Permissions', 'Who can do what inside the console'],
  transactions: ['Transactions', 'Payments, deposits and refunds'],
  activity: ['Activity Log', 'An audit trail of every action on the demo backend'],
  api: ['API Controls', 'Demo endpoints that power the website integration'],
  settings: ['Settings', 'Hotel identity, booking rules and demo controls']
};

function myNav() {
  var u = session(); if (!u) return [];
  var out = [];
  NAV.forEach(function (grp) {
    var items = grp.items.filter(function (it) { return it.roles.indexOf(u.role) > -1; });
    if (items.length) out.push({ group: grp.group, items: items });
  });
  return out;
}

function badgeCounts() {
  var d = db();
  var u = session();
  var bookings = d.bookings;
  if (u && u.role === 'guest') {
    bookings = bookings.filter(function (b) {
      return b.guestEmail && b.guestEmail.toLowerCase() === u.email.toLowerCase();
    });
  }
  return {
    pendingBookings: bookings.filter(function (b) { return b.status === 'pending'; }).length,
    pendingAdmissions: d.admissionRequests.filter(function (a) { return a.status === 'pending'; }).length
  };
}

function initConsole() {
  var u = session();
  if (!u) { location.href = 'login.html'; return; }
  // If the demo DB was reset (or is missing) the signed-in user may be gone.
  var stillThere = db().users.some(function (x) { return x.email.toLowerCase() === u.email.toLowerCase(); });
  if (!stillThere) { clearSession(); location.href = 'login.html'; return; }
  importSiteBooking();
  buildSidebar();
  buildTopbar();
  bindConsoleEvents();
  route();
  window.addEventListener('hashchange', route);
  // Make sure the site catalog is in sync with the console DB.
  syncSiteCatalog();
}

function brandHTML(small) {
  var s = settings();
  return '<div class="brand-mark">RS</div>' +
    '<div class="brand-text"><strong>' + esc(s.brandName) + '</strong><small>' + esc(s.brandSub) + '</small></div>';
}

function buildSidebar() {
  var nav = $('#appNav'); if (!nav) return;
  var html = '';
  myNav().forEach(function (grp) {
    html += '<div class="nav-group">' + esc(grp.group) + '</div>';
    grp.items.forEach(function (it) {
      var bc = grp.group === '_' ? null : null;
      html += '<a class="nav-item" data-nav="' + it.id + '" href="#/' + it.id + '">' +
        (ICONS[it.icon] || '') + '<span>' + esc(it.label) + '</span>' +
        (it.badgeKey ? '<span class="nav-badge" data-badge="' + it.badgeKey + '"></span>' : '') +
      '</a>';
    });
  });
  nav.innerHTML = html;

  var foot = $('#sideFoot');
  if (foot) {
    var u = session();
    var roleColor = (db().roles[u.role] || {}).color || '';
    foot.innerHTML =
      '<a class="view-site-btn" href="../index.html">' + ICONS.globe + 'Back to Website</a>' +
      '<div class="side-user">' +
        '<span class="avatar av-navy">' + esc(initials(u.name)) + '</span>' +
        '<div class="su-name">' + esc(u.name) + '<small>' + esc(roleLabel(u.role)) + '</small></div>' +
        '<button class="side-logout" data-act="logout" title="Sign out">' + ICONS.out + '</button>' +
      '</div>';
  }
  refreshBadges();
}

function buildTopbar() {
  var u = session();
  var roleColor = (db().roles[u.role] || {}).color || '';
  $('#tbUser').innerHTML =
    '<span class="avatar av-navy">' + esc(initials(u.name)) + '</span>' +
    '<div class="tb-user-info"><strong>' + esc(u.name) + '</strong>' +
    '<small><span class="role-chip ' + roleColor + '">' + esc(roleLabel(u.role)) + '</span></small></div>';
}

function refreshBadges() {
  var counts = badgeCounts();
  $$('[data-badge]').forEach(function (el) {
    var n = counts[el.dataset.badge] || 0;
    el.textContent = n;
    el.style.display = n ? 'inline-flex' : 'none';
  });
}

function setTitles() {
  var id = currentView();
  var t = VIEW_TITLES[id] || ['Console', ''];
  $('#pageTitle').textContent = t[0];
  $('#pageSub').textContent = t[1];
  $$('.nav-item').forEach(function (el) {
    el.classList.toggle('active', el.dataset.nav === id);
  });
}

function currentView() {
  var h = (location.hash || '').replace(/^#\/?/, '');
  return h || 'dashboard';
}

function route() {
  var id = currentView();
  var allowed = myNav().some(function (g) {
    return g.items.some(function (it) { return it.id === id; });
  });
  if (!allowed) {
    location.hash = '#/dashboard';
    return;
  }
  setTitles();
  var host = $('#appContent');
  closeSide();
  renderView(id, host);
  decorateTables(host);
}

/* Add column labels to every cell so narrow screens can render rows as cards. */
function decorateTables(host) {
  $$('.tbl', host).forEach(function (t) {
    var ths = $$('thead th', t).map(function (th) { return th.textContent.replace(/\s+/g, ' ').trim(); });
    $$('tbody tr', t).forEach(function (tr) {
      var tds = tr.querySelectorAll('td');
      for (var i = 0; i < tds.length; i++) {
        tds[i].setAttribute('data-label', ths[i] || '');
      }
    });
  });
}

function renderView(id, host) {
  host.scrollTop = 0;
  if (id === 'dashboard') return renderDashboard(host);
  if (id === 'rooms') return renderRooms(host);
  if (id === 'bookings') return renderBookings(host);
  if (id === 'admissions') return renderAdmissions(host);
  if (id === 'users') return renderUsers(host);
  if (id === 'roles') return renderRoles(host);
  if (id === 'transactions') return renderTransactions(host);
  if (id === 'activity') return renderActivity(host);
  if (id === 'api') return renderApi(host);
  if (id === 'settings') return renderSettings(host);
  host.innerHTML = emptyState('Where are we?', 'That section does not exist.');
}

function viewHead(title, sub, rightHTML) {
  return '<div class="view-head"><div><h2>' + title + '</h2><p>' + sub + '</p></div>' +
    (rightHTML ? '<div class="flex">' + rightHTML + '</div>' : '') + '</div>';
}

/* ============================ Status helpers ============================ */
function bookBadge(status) {
  return '<span class="badge b-' + (status || 'pending') + '">' + esc((status || 'pending').replace(/-/g, ' ')) + '</span>';
}
function txnBadge(status) {
  var map = { paid: 'b-paid', refunded: 'b-refunded', pending: 'b-pending', failed: 'b-failed' };
  return '<span class="badge ' + (map[status] || 'b-pending') + '">' + esc(status) + '</span>';
}
function admBadge(status) {
  var map = { pending: 'b-pending', approved: 'b-approved', rejected: 'b-rejected' };
  return '<span class="badge ' + (map[status] || 'b-pending') + '">' + esc(status) + '</span>';
}

function statusOptions() {
  return ['pending', 'confirmed', 'checked-in', 'completed', 'cancelled'];
}

/* ============================ Toast + modal ============================ */
function toast(msg, isErr) {
  var t = $('#cToast');
  if (!t) return;
  t.className = 'c-toast' + (isErr ? ' err' : '');
  t.innerHTML = (isErr ? ICONS.warn : ICONS.check) + '<span>' + esc(msg) + '</span>';
  requestAnimationFrame(function () { t.classList.add('show'); });
  clearTimeout(toast._t);
  toast._t = setTimeout(function () {
    t.classList.remove('show');
    setTimeout(function () { t.className = 'c-toast'; }, 350);
  }, 3000);
}

function openModal(title, bodyHTML, wide) {
  closeModal();
  var ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.id = 'modalOverlay';
  ov.innerHTML =
    '<div class="modal' + (wide ? ' modal-wide' : '') + '">' +
      '<div class="modal-head"><h3>' + title + '</h3>' +
      '<button class="modal-x" data-act="modal-close" aria-label="Close">' + ICONS.x + '</button></div>' +
      '<div class="modal-body">' + bodyHTML + '</div>' +
    '</div>';
  document.body.appendChild(ov);
  requestAnimationFrame(function () { ov.classList.add('open'); });
  return ov;
}
function closeModal() {
  var ov = $('#modalOverlay');
  if (!ov) return;
  ov.classList.remove('open');
  setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 180);
}

function emptyState(title, sub, icon) {
  return '<div class="panel"><div class="empty-state">' +
    '<div style="width:44px;margin:0 auto 12px;color:var(--muted)">' + (ICONS[icon] || ICONS.info) + '</div>' +
    '<h4>' + esc(title) + '</h4><p>' + esc(sub) + '</p></div></div>';
}

function restrictedPanel() {
  return emptyState('Access restricted', 'Your role does not allow you to open this section. Contact an administrator.', 'roles');
}

/* ============================ Dashboard ============================ */
function renderDashboard(host) {
  var u = session();
  if (u.role === 'guest') return renderGuestDashboard(host);
  var d = db();
  var s = settings();
  var today = dateISO(0);
  var activeRooms = d.rooms.filter(function (r) { return r.active !== false; }).length;
  var live = d.bookings.filter(function (b) {
    return (b.status === 'confirmed' || b.status === 'checked-in') &&
      b.checkin <= today && b.checkout > today;
  }).length;
  var occupancy = activeRooms ? Math.min(100, Math.round((live / activeRooms) * 100)) : 0;
  var month = new Date().getMonth();
  var year = new Date().getFullYear();
  var revenue = d.transactions.reduce(function (sum, t) {
    var cd = new Date(t.created);
    if (t.status === 'paid' && cd.getMonth() === month && cd.getFullYear() === year) return sum + t.amount;
    return sum;
  }, 0);
  var pendingAdm = d.admissionRequests.filter(function (a) { return a.status === 'pending'; }).length;

  var html = viewHead('Good day, ' + esc(u.name.split(' ')[0]) + ' \u2014 ' + esc(s.brandName), VIEW_TITLES.dashboard[1],
    '<a class="btn btn-navy btn-sm" href="../rooms.html" target="_blank" rel="noopener">' + ICONS.globe + ' View Website</a>');

  html += '<div class="kpi-grid">' +
    kpi('ic-gold', 'bookings', d.bookings.length, 'Total bookings', 'bk-blue') +
    kpi('ic-navy', 'activity', pendingAdm, 'Pending admission requests', '') +
    kpi('ic-green', 'txns', fmtMoney(revenue), 'Revenue this month', '') +
    kpi('ic-red', 'dash', occupancy + '%', 'Occupancy today', '') +
  '</div>';

  // Rooms by bookings (mini chart) + recent bookings
  var counts = {};
  d.bookings.filter(function (b) { return b.status !== 'cancelled'; }).forEach(function (b) {
    counts[b.roomName] = (counts[b.roomName] || 0) + 1;
  });
  var rows = Object.keys(counts).map(function (k) { return { name: k, n: counts[k] }; })
    .sort(function (a, b) { return b.n - a.n; }).slice(0, 5);
  var maxN = rows.length ? rows[0].n : 1;
  var bars = rows.length ? rows.map(function (r) {
    var pct = Math.max(6, Math.round((r.n / maxN) * 100));
    return '<div class="bar-row"><span class="b-name" title="' + esc(r.name) + '">' + esc(r.name) + '</span>' +
      '<div class="b-track"><div class="b-fill" style="width:' + pct + '%"></div></div><span class="b-val">' + r.n + '</span></div>';
  }).join('') : '<p class="muted small">No bookings recorded yet.</p>';

  var recentB = d.bookings.slice().sort(function (a, b) { return b.created > a.created ? 1 : -1; }).slice(0, 5);
  html += '<div class="dash-cols">' +
    '<div>' +
      '<div class="panel"><div class="panel-head"><h3>Bookings by room type</h3><span class="panel-sub">All time (excl. cancelled)</span></div>' +
        '<div class="bars">' + bars + '</div></div>' +
      '<div class="panel"><div class="panel-head"><h3>Recent bookings</h3>' +
        '<a class="mini-btn" href="#/bookings">View all</a></div>' +
        recentTable(recentB) + '</div>' +
    '</div>' +
    '<div>' +
      '<div class="panel"><div class="panel-head"><h3>Latest activity</h3>' +
        '<a class="mini-btn" href="#/activity">Log</a></div>' +
        feedHTML(d.logs.slice(0, 7)) + '</div>' +
      '<div class="panel"><div class="panel-head"><h3>Quick actions</h3></div>' +
        '<div class="quick-actions" style="grid-template-columns:1fr 1fr">' +
          qa('plus', 'Add a room', 'Create a new room & rate', 'data-act="open-room-modal"') +
          qa('bookings', 'New website booking', 'Open the booking flow', 'data-href="../rooms.html"') +
          qa('admissions', 'Admission request', 'Review pending arrivals', 'data-href="#/admissions"') +
          qa('settings', 'Site settings', 'Branding & booking rules', 'data-href="#/settings"') +
        '</div></div>' +
    '</div>' +
  '</div>';

  host.innerHTML = html;
  bindQuickLinks(host);
}

function kpi(ico, icon, val, label, trend) {
  return '<div class="kpi"><div class="k-ico ' + ico + '">' + (ICONS[icon] || ICONS.dash) + '</div>' +
    '<div><strong>' + val + '</strong><span>' + esc(label) + '</span></div></div>';
}

function qa(icon, title, sub, at) {
  return '<button class="qa" ' + at + '>' + (ICONS[icon] || '') +
    '<span>' + esc(title) + '</span><small>' + esc(sub) + '</small></button>';
}

function bindQuickLinks(host) {
  $$('[data-href]', host).forEach(function (el) {
    el.addEventListener('click', function () {
      var target = el.dataset.href;
      if (target.charAt(0) === '#') location.hash = target;
      else window.open(target, '_blank');
    });
  });
}

function recentTable(list) {
  if (!list.length) return '<p class="muted small">Nothing yet.</p>';
  var rows = list.map(function (b) {
    return '<tr>' +
      '<td><span class="cell-main">' + esc(b.ref) + '</span><span class="cell-sub">' + esc(b.guestName) + '</span></td>' +
      '<td>' + esc(b.roomName) + '</td>' +
      '<td>' + fmtDate(b.checkin) + '</td>' +
      '<td class="money">' + fmtMoney(b.total) + '</td>' +
      '<td>' + bookBadge(b.status) + '</td>' +
    '</tr>';
  }).join('');
  return '<div class="tbl-scroll"><table class="tbl"><thead><tr>' +
    '<th>Ref / Guest</th><th>Room</th><th>Check-in</th><th>Total</th><th>Status</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>';
}

function feedHTML(list) {
  if (!list.length) return '<p class="muted small">No activity recorded.</p>';
  var dot = { booking: 'fd-gold', room: 'fd-blue', auth: 'fd-green', admission: 'fd-blue' };
  return list.map(function (l) {
    var kind = (l.action || '').split('.')[0];
    var color = dot[kind] || 'fd-blue';
    return '<div class="feed-item"><span class="feed-dot ' + color + '"></span>' +
      '<p><b>' + esc(l.actor) + '</b> — ' + esc(l.detail || l.action) + '</p>' +
      '<time>' + esc(fmtDT(l.created)) + '</time></div>';
  }).join('');
}

function renderGuestDashboard(host) {
  var u = session();
  var d = db();
  var mine = d.bookings.filter(function (b) { return b.guestEmail && b.guestEmail.toLowerCase() === u.email.toLowerCase(); });
  var upcoming = mine.filter(function (b) { return b.status === 'pending' || b.status === 'confirmed'; });
  var html = viewHead('Welcome, ' + esc(u.name.split(' ')[0]), 'Your stays at Royal Stay — view and manage your reservations here.');
  html += '<div class="kpi-grid">' +
    '<div class="kpi"><div class="k-ico ic-gold">' + ICONS.bookings + '</div><div><strong>' + mine.length + '</strong><span>Total bookings</span></div></div>' +
    '<div class="kpi"><div class="k-ico ic-green">' + ICONS.clock + '</div><div><strong>' + upcoming.length + '</strong><span>Upcoming stays</span></div></div>' +
  '</div>';
  html += '<div class="panel"><div class="panel-head"><h3>My bookings</h3>' +
    '<a class="mini-btn" href="#/bookings">Manage bookings</a></div>' +
    recentTable(mine.slice().sort(function (a, b) { return b.created > a.created ? 1 : -1; })) + '</div>';
  html += '<div class="note-banner nb-warn mt-2">' + ICONS.info +
    '<span>This is a <b>demo backend</b>. Bookings you make on the website with the email <b>' + esc(u.email) +
    '</b> automatically appear here after you open this console.</span></div>';
  host.innerHTML = html;
}

/* ============================ Rooms ============================ */
function renderRooms(host) {
  var d = db();
  var active = d.rooms.filter(function (r) { return r.active !== false; }).length;
  var html = viewHead('Rooms & Rates', VIEW_TITLES.rooms[1],
    '<button class="btn btn-gold btn-sm" data-act="open-room-modal">' + ICONS.plus + ' Add Room</button>');
  html += '<div class="note-banner">' + ICONS.info +
    '<span>Changes here are published to the hotel website instantly: <b>' + active + ' of ' + d.rooms.length +
    ' rooms live</b>. Turn a room off to hide it from the website, or delete it entirely.</span></div>';

  if (!d.rooms.length) { html += emptyState('No rooms yet', 'Add your first room with the "Add Room" button.', 'rooms'); host.innerHTML = html; return; }

  var rows = d.rooms.map(function (r) {
    return '<tr>' +
      '<td><div class="room-cell"><img class="room-thumb" src="' + esc(r.image) + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">' +
        '<div><span class="cell-main">' + esc(r.name) + '</span>' +
        '<span class="cell-sub">' + esc(r.tagline || '') + '</span></div></div></td>' +
      '<td>' + esc(r.bed || '—') + '</td>' +
      '<td>' + esc(r.capacity) + ' guests</td>' +
      '<td class="money">' + fmtMoney(r.price) + '<span class="cell-sub"> / night</span></td>' +
      '<td>' + (r.active === false
        ? '<span class="badge b-inactive">hidden</span>'
        : '<span class="badge b-active">live</span>') + '</td>' +
      '<td><label class="switch" title="Toggle visibility on website"><input type="checkbox" ' + (r.active !== false ? 'checked' : '') +
        ' data-chg="room-active" data-id="' + esc(r.id) + '"><span class="slider"></span></label></td>' +
      '<td><div class="ta-actions">' +
        '<button class="mini-btn" data-act="edit-room" data-id="' + esc(r.id) + '">' + ICONS.edit + ' Edit</button>' +
        '<button class="mini-btn danger" data-act="del-room" data-id="' + esc(r.id) + '">' + ICONS.trash + '</button>' +
      '</div></td>' +
    '</tr>';
  }).join('');

  html += '<div class="panel"><div class="tbl-scroll"><table class="tbl"><thead><tr>' +
    '<th>Room</th><th>Bed</th><th>Capacity</th><th>Price</th><th>Status</th><th>On website</th><th style="text-align:right">Actions</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  host.innerHTML = html;
}

function roomModal(id) {
  var d = db();
  var r = id ? d.rooms.filter(function (x) { return x.id === id; })[0] : null;
  var editing = !!r;
  var body =
    '<div class="form-error" id="roomErr"></div>' +
    '<form data-form="roomForm" novalidate>' +
      '<input type="hidden" id="rId" value="' + esc(r ? r.id : '') + '">' +
      '<div class="form-row">' +
        '<div class="form-field"><label>Room name <span class="req">*</span></label><input id="rName" value="' + esc(r ? r.name : '') + '" placeholder="e.g. Garden Suite"></div>' +
        '<div class="form-field"><label>Badge (optional)</label><input id="rBadge" value="' + esc(r ? r.badge : '') + '" placeholder="e.g. Most Popular"></div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="form-field"><label>Price per night (₦) <span class="req">*</span></label><input id="rPrice" type="number" min="1" value="' + (r ? r.price : '') + '" placeholder="45000"></div>' +
        '<div class="form-field"><label>Capacity (guests)</label><input id="rCapacity" type="number" min="1" max="20" value="' + (r ? r.capacity : 2) + '"></div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="form-field"><label>Bed type</label><input id="rBed" value="' + esc(r ? r.bed : '') + '" placeholder="1 King Bed"></div>' +
        '<div class="form-field"><label>Size</label><input id="rSize" value="' + esc(r ? r.size : '') + '" placeholder="34 m²"></div>' +
      '</div>' +
      '<div class="form-field"><label>Photo URL</label><input id="rImage" value="' + esc(r ? r.image : '') + '" placeholder="https://…/room.jpg"></div>' +
      '<div class="form-field"><label>Short description</label><textarea id="rTagline" placeholder="One line about this room">' + esc(r ? r.tagline : '') + '</textarea></div>' +
      '<div class="form-field"><label>Amenities (one per line)</label><textarea id="rFeatures" placeholder="Free Wi-Fi&#10;Smart TV&#10;Mini bar">' + esc(r ? (r.features || []).join('\n') : '') + '</textarea></div>' +
      '<div class="set-row" style="border:none;padding:6px 0 0"><div class="sr-text"><h4 style="font-family:var(--sans);font-weight:600">Show on website</h4>' +
      '<p>When on, guests can see and book this room.</p></div>' +
      '<label class="switch"><input type="checkbox" id="rActive" ' + (!r || r.active !== false ? 'checked' : '') + '><span class="slider"></span></label></div>' +
      '<div class="modal-foot" style="padding:18px 0 0"><button class="btn btn-outline" type="button" data-act="modal-close">Cancel</button>' +
      '<button class="btn btn-navy" type="submit">' + (editing ? 'Save changes' : 'Add room') + '</button></div>' +
    '</form>';
  openModal(editing ? 'Edit room — ' + r.name : 'Add a new room', body);
}

/* ============================ Bookings ============================ */
var bookingFilter = 'all';

function renderBookings(host) {
  var u = session();
  var d = db();
  var mine = u.role === 'guest';
  var list = mine
    ? d.bookings.filter(function (b) { return b.guestEmail && b.guestEmail.toLowerCase() === u.email.toLowerCase(); })
    : d.bookings.slice();
  list = list.slice().sort(function (a, b) { return b.created > a.created ? 1 : -1; });

  var filter = mine ? 'all' : (bookingFilter || 'all');
  var shown = list;
  if (filter !== 'all') shown = shown.filter(function (b) { return b.status === filter; });

  var chips = ['all', 'pending', 'confirmed', 'checked-in', 'completed', 'cancelled'];
  var chipHTML = chips.map(function (c) {
    var n = c === 'all' ? list.length : list.filter(function (b) { return b.status === c; }).length;
    var isOn = filter === c;
    return '<button class="mini-btn' + (isOn ? ' gold' : '') + '" data-act="filter-book" data-f="' + c + '"' +
      (mine && c === 'all' ? ' style="display:none"' : '') + '>' +
      esc(c === 'all' ? 'All' : c.replace(/-/g, ' ')) + ' <b>(' + n + ')</b></button>';
  }).join('');

  var right = mine ? '<span class="muted small">Bookings tied to <b>' + esc(u.email) + '</b></span>' : chipHTML;
  var html = viewHead(
    mine ? 'My Bookings' : 'Bookings',
    mine ? 'Your reservation history — cancel free up to 48h before arrival.' : VIEW_TITLES.bookings[1],
    right);

  if (!shown.length) {
    html += emptyState(mine ? 'No bookings yet' : 'No bookings found',
      mine ? 'Complete a booking on the website with your account email and it will show up here.' : 'Try another status filter above.', 'bookings');
    host.innerHTML = html; return;
  }

  var rows = shown.map(function (b) {
    var cancelBtn = (b.status === 'pending' || b.status === 'confirmed') ? '' : '';
    var actions;
    if (mine) {
      actions = '<div class="ta-actions">' +
        '<button class="mini-btn" data-act="view-booking" data-id="' + esc(b.id) + '">' + ICONS.eye + ' Details</button>' +
        ((b.status === 'pending' || b.status === 'confirmed')
          ? '<button class="mini-btn danger" data-act="cancel-my-booking" data-id="' + esc(b.id) + '">Cancel</button>' : '') +
      '</div>';
    } else {
      actions = '<div class="ta-actions">' +
        '<button class="mini-btn" data-act="view-booking" data-id="' + esc(b.id) + '">' + ICONS.eye + ' Details</button>' +
      '</div>';
    }
    return '<tr>' +
      '<td><span class="cell-main">' + esc(b.ref) + '</span>' +
        (b.source === 'website' ? '<span class="badge b-gold" style="margin-top:4px">from website</span>' : '') + '</td>' +
      '<td><span class="cell-main">' + esc(b.guestName) + '</span><span class="cell-sub">' + esc(b.guestPhone || b.guestEmail || '') + '</span></td>' +
      '<td><div class="room-cell"><img class="room-thumb" src="' + esc(b.roomImage) + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
        '<div><span class="cell-main">' + esc(b.roomName) + '</span><span class="cell-sub">' + b.nights + ' night' + (b.nights > 1 ? 's' : '') + '</span></div></div></td>' +
      '<td><span class="cell-main">' + fmtDate(b.checkin) + '</span><span class="cell-sub">→ ' + fmtDate(b.checkout) + '</span></td>' +
      '<td class="money">' + fmtMoney(b.total) + '</td>' +
      '<td>' + (mine ? bookBadge(b.status)
        : '<select class="status-select" data-chg="book-status" data-id="' + esc(b.id) + '">' +
            statusOptions().map(function (s) {
              return '<option value="' + s + '"' + (s === b.status ? ' selected' : '') + '>' + esc(s.replace(/-/g, ' ')) + '</option>';
            }).join('') +
          '</select>') + '</td>' +
      '<td>' + actions + '</td>' +
    '</tr>';
  }).join('');

  html += '<div class="panel"><div class="tbl-scroll"><table class="tbl"><thead><tr>' +
    '<th>Ref</th><th>Guest</th><th>Room</th><th>Dates</th><th>Total</th><th>Status</th><th style="text-align:right">Actions</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<p class="muted small mt-2">Bookings made on the hotel website are imported automatically with a "from website" tag.</p></div>';
  host.innerHTML = html;
}

function setBookingStatus(id, status) {
  var d = db();
  var b = d.bookings.filter(function (x) { return x.id === id; })[0];
  if (!b) return;
  var was = b.status;
  b.status = status;
  if (status === 'cancelled' && was !== 'cancelled' && b.payment && b.payment.indexOf('Card') > -1) {
    d.transactions.unshift({
      id: uid('txn'), ref: 'TXN-' + Math.floor(10000 + Math.random() * 89999),
      bookingRef: b.ref, guest: b.guestName,
      desc: 'Automatic refund — cancelled ' + b.roomName, method: 'Card',
      amount: b.total, status: 'refunded', created: new Date().toISOString()
    });
  }
  log('booking.' + status.replace('-', '_'), 'Bookings', b.ref + ' (' + b.roomName + ') set to ' + status + '.');
  saveDB();
  refreshBadges();
}

function bookingModal(id) {
  var d = db();
  var b = d.bookings.filter(function (x) { return x.id === id; })[0];
  if (!b) return;
  var rows =
    '<div class="cd-item"><small>Reference</small><strong>' + esc(b.ref) + '</strong></div>' +
    '<div class="cd-item"><small>Status</small><strong>' + bookBadge(b.status) + '</strong></div>' +
    '<div class="cd-item"><small>Guest</small><strong>' + esc(b.guestName) + '</strong></div>' +
    '<div class="cd-item"><small>Contact</small><strong>' + esc(b.guestPhone || '—') + '<br>' + esc(b.guestEmail || '') + '</strong></div>' +
    '<div class="cd-item"><small>Room</small><strong>' + esc(b.roomName) + '</strong></div>' +
    '<div class="cd-item"><small>Payment</small><strong>' + esc(b.payment) + '</strong></div>' +
    '<div class="cd-item"><small>Check-in</small><strong>' + fmtDate(b.checkin) + '</strong></div>' +
    '<div class="cd-item"><small>Check-out</small><strong>' + fmtDate(b.checkout) + '</strong></div>' +
    '<div class="cd-item"><small>Nights / Guests / Rooms</small><strong>' + b.nights + ' · ' + b.guests + ' · ' + b.rooms + '</strong></div>' +
    '<div class="cd-item"><small>Total</small><strong class="money">' + fmtMoney(b.total) + '</strong></div>';
  var body = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px 22px">' + rows + '</div>' +
    '<div class="modal-foot" style="padding:18px 0 0"><a class="btn btn-outline btn-sm" href="../room-details.html?room=' + esc(b.roomId || '') + '" target="_blank" rel="noopener">' + ICONS.globe + ' Open room page</a>' +
    '<button class="btn btn-navy btn-sm" data-act="modal-close">Close</button></div>';
  openModal('Booking ' + b.ref, body);
}

/* ============================ Admission requests ============================ */
function renderAdmissions(host) {
  var d = db();
  var list = d.admissionRequests.slice().sort(function (a, b) { return b.created > a.created ? 1 : -1; });
  var html = viewHead('Admission Requests', VIEW_TITLES.admissions[1],
    '<button class="btn btn-gold btn-sm" data-act="add-admission">' + ICONS.plus + ' New Request</button>');
  html += '<div class="note-banner">' + ICONS.info +
    '<span>Guests submit admission requests before arrival — early check-in, late arrival, airport pickup, VIP escort. Approve or reject each request here.</span></div>';

  if (!list.length) { html += emptyState('Nothing pending', 'No admission requests have been submitted.', 'admissions'); host.innerHTML = html; return; }

  var rows = list.map(function (a) {
    return '<tr>' +
      '<td><span class="cell-main">' + esc(a.guest) + '</span><span class="cell-sub">' + esc(a.phone) + '</span></td>' +
      '<td>' + esc(a.room) + '</td>' +
      '<td><span class="cell-main">' + fmtDate(a.arrival) + '</span><span class="cell-sub">' + esc(a.time) + '</span></td>' +
      '<td><span class="badge b-gold">' + esc(a.type) + '</span>' +
        (a.notes ? '<div class="cell-sub" style="margin-top:4px;max-width:200px">' + esc(a.notes) + '</div>' : '') + '</td>' +
      '<td>' + admBadge(a.status) + '</td>' +
      '<td><div class="ta-actions">' +
        (a.status === 'pending'
          ? '<button class="mini-btn ok" data-act="approve-admission" data-id="' + esc(a.id) + '">' + ICONS.check + ' Approve</button>' +
            '<button class="mini-btn danger" data-act="reject-admission" data-id="' + esc(a.id) + '">Reject</button>'
          : '<span class="muted small">' + esc(fmtDT(a.updated || a.created)) + '</span>') +
      '</div></td>' +
    '</tr>';
  }).join('');

  html += '<div class="panel"><div class="tbl-scroll"><table class="tbl"><thead><tr>' +
    '<th>Guest</th><th>Room</th><th>Arrival</th><th>Request</th><th>Status</th><th style="text-align:right">Actions</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  host.innerHTML = html;
}

function admissionModal() {
  var d = db();
  var rooms = d.rooms.filter(function (r) { return r.active !== false; });
  var roomOpts = rooms.map(function (r) {
    return '<option value="' + esc(r.name) + '">' + esc(r.name) + '</option>';
  }).join('');
  var body =
    '<div class="form-error" id="admErr"></div>' +
    '<form data-form="admissionForm" novalidate>' +
      '<div class="form-row">' +
        '<div class="form-field"><label>Guest full name <span class="req">*</span></label><input id="aGuest" placeholder="e.g. Oluchi Adeyemi"></div>' +
        '<div class="form-field"><label>Phone</label><input id="aPhone" placeholder="0803 000 0000"></div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="form-field"><label>Room</label><select id="aRoom">' + roomOpts + '</select></div>' +
        '<div class="form-field"><label>Request type</label><select id="aType">' +
          ['Early check-in', 'Late arrival', 'Airport pickup', 'VIP escort', 'Extra bed', 'Other'].map(function (t) {
            return '<option>' + t + '</option>';
          }).join('') + '</select></div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="form-field"><label>Arrival date <span class="req">*</span></label><input id="aDate" type="date" min="' + dateISO(0) + '" value="' + dateISO(0) + '"></div>' +
        '<div class="form-field"><label>Arrival time</label><input id="aTime" type="time" value="14:00"></div>' +
      '</div>' +
      '<div class="form-field"><label>Notes</label><textarea id="aNotes" placeholder="Anything the front desk should know"></textarea></div>' +
      '<div class="modal-foot" style="padding:18px 0 0"><button class="btn btn-outline" type="button" data-act="modal-close">Cancel</button>' +
      '<button class="btn btn-navy" type="submit">Submit request</button></div>' +
    '</form>';
  openModal('New admission request', body);
}

/* ============================ Users ============================ */
function renderUsers(host) {
  var d = db();
  var me = session();
  var html = viewHead('Users', VIEW_TITLES.users[1],
    '<button class="btn btn-gold btn-sm" data-act="add-user">' + ICONS.plus + ' Add User</button>');
  html += '<div class="note-banner">' + ICONS.info +
    '<span>Everyone with an account on the platform. Guests sign up from the <a href="../index.html" style="text-decoration:underline">website</a> or the registration page.</span></div>';

  var rows = d.users.map(function (u) {
    var isMe = me && me.id === u.id;
    var roleColor = (d.roles[u.role] || {}).color || '';
    return '<tr>' +
      '<td><div class="room-cell"><span class="avatar av-navy">' + esc(initials(u.name)) + '</span>' +
        '<div><span class="cell-main">' + esc(u.name) + (isMe ? ' <span class="badge b-gold">you</span>' : '') + '</span>' +
        '<span class="cell-sub">' + esc(u.email) + '</span></div></div></td>' +
      '<td><span class="cell-main">' + esc(u.phone || '—') + '</span></td>' +
      '<td>' + (isMe
        ? '<span class="role-chip ' + roleColor + '">' + esc(roleLabel(u.role)) + '</span>'
        : '<select class="status-select" data-chg="role-user" data-id="' + esc(u.id) + '">' +
            ['admin', 'staff', 'guest'].map(function (r) {
              return '<option value="' + r + '"' + (r === u.role ? ' selected' : '') + '>' + esc(roleLabel(r)) + '</option>';
            }).join('') + '</select>') + '</td>' +
      '<td><span class="cell-sub">' + fmtDate(u.created) + '</span></td>' +
      '<td><div class="ta-actions">' +
        (isMe ? '' : '<button class="mini-btn danger" data-act="del-user" data-id="' + esc(u.id) + '">' + ICONS.trash + ' Remove</button>') +
      '</div></td>' +
    '</tr>';
  }).join('');

  html += '<div class="panel"><div class="tbl-scroll"><table class="tbl"><thead><tr>' +
    '<th>User</th><th>Phone</th><th>Role</th><th>Joined</th><th style="text-align:right">Actions</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  host.innerHTML = html;
}

function userModal() {
  var body =
    '<div class="form-error" id="userErr"></div>' +
    '<form data-form="userForm" novalidate>' +
      '<div class="form-row">' +
        '<div class="form-field"><label>Full name <span class="req">*</span></label><input id="uName" placeholder="e.g. Ada Obi"></div>' +
        '<div class="form-field"><label>Phone</label><input id="uPhone" placeholder="0803 000 0000"></div>' +
      '</div>' +
      '<div class="form-field"><label>Email <span class="req">*</span></label><input id="uEmail" type="email" placeholder="name@example.com"></div>' +
      '<div class="form-row">' +
        '<div class="form-field"><label>Password <span class="req">*</span></label><input id="uPass" type="text" placeholder="min 6 characters"></div>' +
        '<div class="form-field"><label>Role</label><select id="uRole">' +
          ['guest', 'staff', 'admin'].map(function (r) {
            return '<option value="' + r + '">' + esc(roleLabel(r)) + '</option>';
          }).join('') + '</select></div>' +
      '</div>' +
      '<p class="form-hint">Demo only — passwords are stored in plain text inside your browser.</p>' +
      '<div class="modal-foot" style="padding:18px 0 0"><button class="btn btn-outline" type="button" data-act="modal-close">Cancel</button>' +
      '<button class="btn btn-navy" type="submit">Create user</button></div>' +
    '</form>';
  openModal('Add a new user', body);
}

/* ============================ Roles ============================ */
var PERM_LABELS = [
  ['rooms', 'Rooms & Rates'],
  ['bookings', 'Bookings'],
  ['admissions', 'Admission Requests'],
  ['transactions', 'Transactions'],
  ['activity', 'Activity Log'],
  ['users', 'Users'],
  ['roles', 'Roles & Permissions'],
  ['api', 'API Controls'],
  ['settings', 'Settings']
];

function renderRoles(host) {
  var d = db();
  var html = viewHead('Roles & Permissions', VIEW_TITLES.roles[1]);
  html += '<div class="note-banner">' + ICONS.info +
    '<span>Each account belongs to one role. Toggle what each role can access. <b>Administrator</b> always has full access and is locked.</span></div>';

  var roles = ['admin', 'staff', 'guest'];
  var head = '<tr><th>Permission</th>' + roles.map(function (r) {
    return '<th class="pc">' + esc(d.roles[r].label.split(' ')[0]) + '</th>';
  }).join('') + '</tr>';

  var rows = PERM_LABELS.map(function (p) {
    var tds = roles.map(function (r) {
      var locked = r === 'admin';
      var checked = d.roles[r].perms[p[0]];
      return '<td class="pc">' +
        '<label class="switch"><input type="checkbox" data-chg="role-perm" data-role="' + r + '" data-perm="' + p[0] + '"' +
        (checked ? ' checked' : '') + (locked ? ' disabled' : '') + '><span class="slider"></span></label></td>';
    }).join('');
    return '<tr><td><b style="color:var(--navy)">' + esc(p[1]) + '</b></td>' + tds + '</tr>';
  }).join('');

  html += '<div class="panel"><div class="perm-scroll"><table class="perm-matrix" style="min-width:520px">' +
    '<thead>' + head + '</thead><tbody>' + rows + '</tbody></table>' +
    '<p class="form-hint mt-2">Staff and Guest toggles update instantly (demo).</p></div>';
  host.innerHTML = html;
}

/* ============================ Transactions ============================ */
function renderTransactions(host) {
  var d = db();
  var list = d.transactions.slice().sort(function (a, b) { return b.created > a.created ? 1 : -1; });
  var paid = d.transactions.filter(function (t) { return t.status === 'paid'; }).reduce(function (s, t) { return s + t.amount; }, 0);
  var refunded = d.transactions.filter(function (t) { return t.status === 'refunded'; }).reduce(function (s, t) { return s + t.amount; }, 0);
  var pending = d.transactions.filter(function (t) { return t.status === 'pending'; }).length;

  var html = viewHead('Transactions', VIEW_TITLES.transactions[1],
    '<span class="panel-sub">' +
      '<span class="badge b-paid">collected ' + fmtMoney(paid) + '</span> ' +
      '<span class="badge b-refunded">refunded ' + fmtMoney(refunded) + '</span> ' +
      '<span class="badge b-pending">' + pending + ' pending</span></span>');

  if (!list.length) { html += emptyState('No transactions', 'Payments will appear here.', 'txns'); host.innerHTML = html; return; }

  var rows = list.map(function (t) {
    return '<tr>' +
      '<td><span class="cell-main mono">' + esc(t.ref) + '</span><span class="cell-sub">' + fmtDT(t.created) + '</span></td>' +
      '<td><span class="cell-main">' + esc(t.guest) + '</span><span class="cell-sub mono">' + esc(t.bookingRef) + '</span></td>' +
      '<td>' + esc(t.desc) + '</td>' +
      '<td><span class="badge b-gold">' + esc(t.method) + '</span></td>' +
      '<td class="money">' + (t.status === 'refunded' ? '−' : '') + fmtMoney(t.amount) + '</td>' +
      '<td>' + txnBadge(t.status) + '</td>' +
    '</tr>';
  }).join('');

  html += '<div class="panel"><div class="tbl-scroll"><table class="tbl"><thead><tr>' +
    '<th>Ref</th><th>Guest</th><th>Description</th><th>Method</th><th>Amount</th><th>Status</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<p class="form-hint mt-2">When a Card-paid booking is cancelled from the Bookings screen, an automatic refund row is created here.</p></div>';
  host.innerHTML = html;
}

/* ============================ Activity ============================ */
function renderActivity(host) {
  var d = db();
  var list = d.logs;
  var html = viewHead('Activity Log', VIEW_TITLES.activity[1],
    '<button class="btn btn-outline btn-sm" data-act="clear-logs">Clear log</button>');

  if (!list.length) { html += emptyState('Log is empty', 'Actions performed in the console are recorded here.', 'activity'); host.innerHTML = html; return; }

  var rows = list.slice(0, 100).map(function (l) {
    return '<tr>' +
      '<td><span class="cell-sub">' + fmtDT(l.created) + '</span></td>' +
      '<td><span class="cell-main">' + esc(l.actor) + '</span></td>' +
      '<td><span class="badge b-gold mono" style="letter-spacing:.02em">' + esc(l.action) + '</span></td>' +
      '<td>' + esc(l.module) + '</td>' +
      '<td>' + esc(l.detail) + '</td>' +
    '</tr>';
  }).join('');

  html += '<div class="panel"><div class="tbl-scroll"><table class="tbl"><thead><tr>' +
    '<th>When</th><th>Actor</th><th>Action</th><th>Module</th><th>Details</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<p class="form-hint mt-2">Showing the most recent ' + Math.min(100, list.length) + ' of ' + list.length + ' records.</p></div>';
  host.innerHTML = html;
}

/* ============================ API Controls ============================ */
function renderApi(host) {
  var d = db();
  var a = d.api;
  var liveEndpoints = a.endpoints.filter(function (e) { return e.active; }).length;

  var html = viewHead('API Controls', VIEW_TITLES.api[1]);

  html += '<div class="kpi-grid">' +
    '<div class="kpi"><div class="k-ico ic-green">' + ICONS.api + '</div><div><strong style="color:var(--green)">Operational</strong><span>Status</span></div></div>' +
    '<div class="kpi"><div class="k-ico ic-navy">' + ICONS.dash + '</div><div><strong>' + a.mode + '</strong><span>Environment</span></div></div>' +
    '<div class="kpi"><div class="k-ico ic-gold">' + ICONS.bookings + '</div><div><strong>' + liveEndpoints + '/' + a.endpoints.length + '</strong><span>Endpoints enabled</span></div></div>' +
    '<div class="kpi"><div class="k-ico ic-red">' + ICONS.activity + '</div><div><strong>0ms</strong><span>Avg latency (demo)</span></div></div>' +
  '</div>';

  html += '<div class="panel"><div class="panel-head"><h3>API key</h3>' +
    '<button class="btn btn-outline btn-sm" data-act="regenerate-key">' + ICONS.refresh + ' Regenerate</button></div>' +
    '<div class="api-key">' + ICONS.key + '<code>' + esc(a.key) + '</code></div>' +
    '<p class="form-hint mt-2">The hotel website calls these endpoints through this demo backend. Key is stored locally — regenerate to simulate rotation.</p></div>';

  var rows = a.endpoints.map(function (e, i) {
    var cls = { GET: 'm-get', POST: 'm-post', PUT: 'm-put', DELETE: 'm-del' }[e.method] || 'm-get';
    return '<tr>' +
      '<td><span class="method-chip ' + cls + '">' + e.method + '</span></td>' +
      '<td class="endpoint-path"><code>' + esc(e.path) + '</code></td>' +
      '<td>' + esc(e.desc) + '</td>' +
      '<td>' + (e.active ? '<span class="badge b-on">enabled</span>' : '<span class="badge b-off">disabled</span>') + '</td>' +
      '<td><label class="switch"><input type="checkbox" data-chg="api-endpoint" data-i="' + i + '"' + (e.active ? ' checked' : '') + '><span class="slider"></span></label></td>' +
    '</tr>';
  }).join('');

  html += '<div class="panel mt-3"><div class="panel-head"><h3>Endpoints</h3><span class="panel-sub">Toggle what the website can call</span></div>' +
    '<div class="tbl-scroll"><table class="tbl"><thead><tr>' +
    '<th>Method</th><th>Path</th><th>Purpose</th><th>State</th><th>Enabled</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  host.innerHTML = html;
}

/* ============================ Settings ============================ */
function renderSettings(host) {
  var d = db();
  var s = d.settings;
  var html = viewHead('Settings', VIEW_TITLES.settings[1]);

  html += '<div class="grid-2">' +
    '<div>' +
      '<div class="panel"><div class="panel-head"><h3>Hotel identity</h3></div>' +
      '<form data-form="settingsForm" novalidate>' +
        '<div class="form-row">' +
          '<div class="form-field"><label>Brand name</label><input id="sBrand" value="' + esc(s.brandName) + '"></div>' +
          '<div class="form-field"><label>Brand sub-line</label><input id="sBrandSub" value="' + esc(s.brandSub) + '"></div>' +
        '</div>' +
        '<div class="form-field"><label>Tagline</label><input id="sTagline" value="' + esc(s.tagline) + '"></div>' +
        '<div class="form-field"><label>Address</label><input id="sAddress" value="' + esc(s.address) + '"></div>' +
        '<div class="form-row">' +
          '<div class="form-field"><label>Display phone</label><input id="sPhone" value="' + esc(s.phoneDisplay) + '"></div>' +
          '<div class="form-field"><label>Email</label><input id="sEmail" value="' + esc(s.email) + '"></div>' +
        '</div>' +
        '<div class="form-row">' +
          '<div class="form-field"><label>WhatsApp number (digits only)</label><input id="sWa" value="' + esc(s.whatsapp) + '"></div>' +
          '<div class="form-field"><label>Currency</label><select id="sCurrency">' +
            ['\u20A6', '$', '\u20AC', '\u00A3'].map(function (c) {
              return '<option' + (c === s.currency ? ' selected' : '') + '>' + c + '</option>';
            }).join('') + '</select></div>' +
        '</div>' +
        '<div class="set-row" style="border:none;padding:14px 0 0">' +
          '<button class="btn btn-navy" type="submit">Save identity</button>' +
          '<span class="muted small">Applied to console chrome & settings</span></div>' +
      '</form></div>' +

      '<div class="panel"><div class="panel-head"><h3>Booking rules</h3></div>' +
      '<form data-form="bookingRulesForm">' +
        '<div class="form-row">' +
          '<div class="form-field"><label>Tax & service charge (%)</label><input id="sTax" type="number" step="0.1" min="0" value="' + s.taxRate + '"></div>' +
          '<div class="form-field"><label>Free cancellation window (hours)</label><input id="sCancel" type="number" min="0" value="' + s.cancelHours + '"></div>' +
        '</div>' +
        '<div class="modal-foot" style="padding:12px 0 0"><button class="btn btn-navy btn-sm" type="submit">Save rules</button></div>' +
      '</form></div>' +
    '</div>' +

    '<div>' +
      '<div class="panel"><div class="panel-head"><h3>Website behaviour</h3></div>' +
        '<div class="set-row"><div class="sr-text"><h4>Online bookings</h4><p>Allow guests to reserve rooms on the website.</p></div>' +
          '<label class="switch"><input type="checkbox" id="swOnline" data-chg="set-online"' + (s.allowOnlineBookings ? ' checked' : '') + '><span class="slider"></span></label></div>' +
        '<div class="set-row"><div class="sr-text"><h4>Maintenance mode</h4><p>Hide the booking flow while you work (demo flag only).</p></div>' +
          '<label class="switch"><input type="checkbox" id="swMaint" data-chg="set-maint"' + (s.maintenanceMode ? ' checked' : '') + '><span class="slider"></span></label></div>' +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>Demo controls</h3></div>' +
        '<div class="set-row"><div class="sr-text"><h4>Reset demo data</h4><p>Restore rooms, bookings, users and logs to the original sample set.</p></div>' +
          '<button class="btn btn-danger btn-sm" data-act="reset-demo">Reset</button></div>' +
        '<div class="set-row" style="border:none"><div class="sr-text"><h4>Open the website</h4><p>Jump to the public hotel website (front end).</p></div>' +
          '<a class="btn btn-outline btn-sm" href="../index.html" target="_blank" rel="noopener">' + ICONS.globe + ' Open</a></div>' +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>Session</h3></div>' +
        '<div class="set-row" style="border:none"><div class="sr-text"><h4>Sign out</h4><p>End your console session. The demo data stays on this device.</p></div>' +
          '<button class="btn btn-outline btn-sm" data-act="logout">' + ICONS.out + ' Log out</button></div>' +
      '</div>' +
    '</div>' +
  '</div>';

  host.innerHTML = html;
}

/* ============================ Form handlers ============================ */
function roomFormSubmit() {
  var err = $('#roomErr');
  err.classList.remove('show');
  var name = $('#rName').value.trim();
  var price = parseFloat($('#rPrice').value);
  if (!name) { err.textContent = 'Room name is required.'; err.classList.add('show'); return; }
  if (!price || price <= 0) { err.textContent = 'Enter a valid price per night.'; err.classList.add('show'); return; }

  var d = db();
  var id = $('#rId').value;
  var data = {
    name: name,
    badge: $('#rBadge').value.trim(),
    price: Math.round(price),
    capacity: Math.max(1, parseInt($('#rCapacity').value, 10) || 2),
    bed: $('#rBed').value.trim() || '1 Queen Bed',
    size: $('#rSize').value.trim() || '—',
    image: $('#rImage').value.trim(),
    tagline: $('#rTagline').value.trim(),
    features: $('#rFeatures').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean),
    active: $('#rActive').checked
  };
  if (!data.image) data.image = '';

  if (id) {
    var room = d.rooms.filter(function (x) { return x.id === id; })[0];
    if (room) {
      // keep slug stable
      var slug = room.id;
      Object.keys(data).forEach(function (k) { room[k] = data[k]; });
      room.id = slug;
      log('room.updated', 'Rooms', 'Updated ' + room.name + (room.active === false ? ' and hid it from the website.' : '.'));
    }
  } else {
    data.id = slugify(name);
    if (d.rooms.some(function (r) { return r.id === data.id; })) data.id += '-' + uid('r').slice(-4);
    d.rooms.unshift(data);
    log('room.created', 'Rooms', 'Added new room "' + data.name + '" at ' + fmtMoney(data.price) + '/night.');
  }
  saveDB();
  syncSiteCatalog();
  closeModal();
  toast(id ? 'Room updated — the website has been refreshed.' : 'Room added — it is now live on the website.');
  route();
}

function slugify(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'room';
}

function admissionFormSubmit() {
  var err = $('#admErr');
  err.classList.remove('show');
  var guest = $('#aGuest').value.trim();
  var date = $('#aDate').value;
  if (!guest) { err.textContent = 'Guest name is required.'; err.classList.add('show'); return; }
  if (!date) { err.textContent = 'Choose an arrival date.'; err.classList.add('show'); return; }
  var d = db();
  d.admissionRequests.unshift({
    id: uid('adm'), guest: guest, phone: $('#aPhone').value.trim(),
    room: $('#aRoom').value, roomId: '',
    arrival: date, time: $('#aTime').value || '14:00',
    type: $('#aType').value, notes: $('#aNotes').value.trim(),
    status: 'pending', created: new Date().toISOString()
  });
  log('admission.created', 'Admissions', 'New admission request for ' + guest + ' (' + $('#aType').value + ').');
  saveDB();
  refreshBadges();
  closeModal();
  toast('Admission request logged for ' + guest + '.');
  route();
}

function userFormSubmit() {
  var err = $('#userErr');
  err.classList.remove('show');
  var name = $('#uName').value.trim();
  var email = $('#uEmail').value.trim().toLowerCase();
  var pass = $('#uPass').value;
  if (!name) { err.textContent = 'Full name is required.'; err.classList.add('show'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Enter a valid email address.'; err.classList.add('show'); return; }
  if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters.'; err.classList.add('show'); return; }
  var d = db();
  if (d.users.some(function (u) { return u.email.toLowerCase() === email; })) {
    err.textContent = 'A user with that email already exists.'; err.classList.add('show'); return;
  }
  var role = $('#uRole').value;
  var user = { id: uid('u'), name: name, email: email, password: pass, role: role, phone: $('#uPhone').value.trim(), created: new Date().toISOString() };
  d.users.push(user);
  log('user.created', 'Users', 'Created ' + role + ' account for ' + name + ' (' + email + ').');
  saveDB();
  closeModal();
  toast('User created — ' + name + ' can now sign in.');
  route();
}

function settingsFormSubmit() {
  var d = db();
  var s = d.settings;
  s.brandName = $('#sBrand').value.trim() || 'ROYAL STAY';
  s.brandSub = $('#sBrandSub').value.trim() || 'HOTELS & RESORTS';
  s.tagline = $('#sTagline').value.trim();
  s.address = $('#sAddress').value.trim();
  s.phoneDisplay = $('#sPhone').value.trim();
  s.email = $('#sEmail').value.trim();
  s.whatsapp = $('#sWa').value.trim();
  s.currency = $('#sCurrency').value;
  log('settings.updated', 'Settings', 'Hotel identity updated by ' + actorName() + '.');
  saveDB();
  toast('Identity settings saved.');
  route();
}

function bookingRulesSubmit() {
  var d = db();
  var s = d.settings;
  var tax = parseFloat($('#sTax').value);
  var cancel = parseInt($('#sCancel').value, 10);
  if (!isNaN(tax) && tax >= 0) s.taxRate = tax;
  if (!isNaN(cancel) && cancel >= 0) s.cancelHours = cancel;
  log('settings.updated', 'Settings', 'Booking rules updated (tax ' + s.taxRate + '%, cancellation ' + s.cancelHours + 'h).');
  saveDB();
  toast('Booking rules saved.');
  route();
}

/* ============================ Delegated events (console) ============================ */
var ACT = {
  'open-room-modal': function () { roomModal(null); },
  'edit-room': function (el) { roomModal(el.dataset.id); },
  'del-room': function (el) {
    var d = db();
    var r = d.rooms.filter(function (x) { return x.id === el.dataset.id; })[0];
    if (!r) return;
    if (!confirm('Delete "' + r.name + '"? It will disappear from the hotel website.')) return;
    d.rooms = d.rooms.filter(function (x) { return x.id !== el.dataset.id; });
    log('room.deleted', 'Rooms', 'Deleted room "' + r.name + '".');
    saveDB(); syncSiteCatalog(); toast('Room deleted.'); route();
  },
  'view-booking': function (el) { bookingModal(el.dataset.id); },
  'filter-book': function (el) { bookingFilter = el.dataset.f; route(); },
  'cancel-my-booking': function (el) {
    if (!confirm('Cancel this reservation? Free within 48h of arrival.')) return;
    setBookingStatus(el.dataset.id, 'cancelled');
    toast('Your booking was cancelled.');
    route();
  },
  'add-admission': function () { admissionModal(); },
  'approve-admission': function (el) {
    var d = db();
    var a = d.admissionRequests.filter(function (x) { return x.id === el.dataset.id; })[0];
    if (!a) return;
    a.status = 'approved'; a.updated = new Date().toISOString();
    log('admission.approved', 'Admissions', 'Approved admission for ' + a.guest + ' (' + a.type + ').');
    saveDB(); refreshBadges(); toast('Admission approved for ' + a.guest + '.'); route();
  },
  'reject-admission': function (el) {
    var d = db();
    var a = d.admissionRequests.filter(function (x) { return x.id === el.dataset.id; })[0];
    if (!a) return;
    a.status = 'rejected'; a.updated = new Date().toISOString();
    log('admission.rejected', 'Admissions', 'Rejected admission for ' + a.guest + ' (' + a.type + ').');
    saveDB(); refreshBadges(); toast('Admission rejected.', true); route();
  },
  'add-user': function () { userModal(); },
  'del-user': function (el) {
    var d = db();
    var me = session();
    var u = d.users.filter(function (x) { return x.id === el.dataset.id; })[0];
    if (!u) return;
    if (me && me.id === u.id) { toast('You cannot remove yourself.', true); return; }
    var admins = d.users.filter(function (x) { return x.role === 'admin'; });
    if (u.role === 'admin' && admins.length <= 1) { toast('At least one administrator is required.', true); return; }
    if (!confirm('Remove ' + u.name + '? They will no longer be able to sign in.')) return;
    d.users = d.users.filter(function (x) { return x.id !== u.id; });
    log('user.deleted', 'Users', 'Removed ' + u.role + ' account ' + u.name + '.');
    saveDB(); toast('User removed.'); route();
  },
  'regenerate-key': function () {
    var d = db();
    d.api.key = 'rs_live_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
    log('api.key_rotated', 'API', 'API key was regenerated.');
    saveDB(); toast('New API key generated (demo).'); route();
  },
  'clear-logs': function () {
    if (!confirm('Clear the entire activity log?')) return;
    var d = db();
    d.logs = [];
    log('system.logs_cleared', 'System', 'Activity log was cleared.');
    toast('Activity log cleared.'); route();
  },
  'reset-demo': function () {
    if (!confirm('Reset ALL demo data to the original sample set? This wipes rooms, bookings, users and logs.')) return;
    __cache = null;
    try { localStorage.removeItem(DB_KEY); } catch (e) {}
    db();
    log('system.reset', 'System', 'Demo database was reset to defaults.');
    syncSiteCatalog();
    toast('Demo data reset.'); route();
  },
  'logout': function () {
    clearSession();
    location.href = 'login.html';
  },
  'modal-close': function () { closeModal(); }
};

var CHG = {
  'room-active': function (el) {
    var d = db();
    var r = d.rooms.filter(function (x) { return x.id === el.dataset.id; })[0];
    if (!r) return;
    r.active = el.checked;
    log(r.active ? 'room.published' : 'room.hidden', 'Rooms', (r.active ? 'Published ' : 'Hid ') + r.name + (r.active ? ' on the website.' : ' from the website.'));
    saveDB(); syncSiteCatalog();
    toast(r.active ? r.name + ' is now live on the website.' : r.name + ' hidden from the website.');
    route();
  },
  'book-status': function (el) {
    setBookingStatus(el.dataset.id, el.value);
    toast('Booking status updated.');
    route();
  },
  'role-user': function (el) {
    var d = db();
    var me = session();
    var u = d.users.filter(function (x) { return x.id === el.dataset.id; })[0];
    if (!u) return;
    if (me && me.id === u.id) { toast('You cannot change your own role.', true); route(); return; }
    if (u.role === 'admin' && el.value !== 'admin') {
      var admins = d.users.filter(function (x) { return x.role === 'admin'; });
      if (admins.length <= 1) { toast('At least one administrator is required.', true); route(); return; }
    }
    u.role = el.value;
    log('user.role_changed', 'Users', u.name + ' is now ' + roleLabel(u.role) + '.');
    saveDB(); toast(u.name + ' is now ' + roleLabel(u.role) + '.'); route();
  },
  'role-perm': function (el) {
    var d = db();
    d.roles[el.dataset.role].perms[el.dataset.perm] = el.checked;
    var label = PERM_LABELS.filter(function (p) { return p[0] === el.dataset.perm; })[0];
    log('roles.permission_toggled', 'Roles', (el.checked ? 'Granted' : 'Revoked') + ' "' + label[1] + '" for ' + d.roles[el.dataset.role].label + '.');
    saveDB(); toast('Permission updated (demo).');
  },
  'api-endpoint': function (el) {
    var d = db();
    var e = d.api.endpoints[parseInt(el.dataset.i, 10)];
    if (!e) return;
    e.active = el.checked;
    log('api.endpoint_toggled', 'API', (e.active ? 'Enabled ' : 'Disabled ') + e.method + ' ' + e.path + '.');
    saveDB(); toast(e.path + ' ' + (e.active ? 'enabled' : 'disabled') + '.');
  },
  'set-online': function (el) {
    var d = db();
    d.settings.allowOnlineBookings = el.checked;
    log('settings.updated', 'Settings', 'Online bookings ' + (el.checked ? 'enabled' : 'disabled') + '.');
    saveDB(); toast('Online bookings ' + (el.checked ? 'enabled' : 'disabled') + ' (demo).');
  },
  'set-maint': function (el) {
    var d = db();
    d.settings.maintenanceMode = el.checked;
    log('settings.updated', 'Settings', 'Maintenance mode ' + (el.checked ? 'turned on' : 'turned off') + '.');
    saveDB(); toast('Maintenance mode ' + (el.checked ? 'ON — booking flow flagged' : 'off') + '.');
  }
};

var FORM = {
  'roomForm': roomFormSubmit,
  'admissionForm': admissionFormSubmit,
  'userForm': userFormSubmit,
  'settingsForm': settingsFormSubmit,
  'bookingRulesForm': bookingRulesSubmit
};

function bindConsoleEvents() {
  document.addEventListener('click', function (e) {
    var ov = $('#modalOverlay');
    if (ov && e.target === ov) closeModal();

    var actEl = e.target.closest ? e.target.closest('[data-act]') : null;
    if (actEl && ACT[actEl.dataset.act]) { ACT[actEl.dataset.act](actEl); return; }
  });

  document.addEventListener('change', function (e) {
    var chgEl = e.target.closest ? e.target.closest('[data-chg]') : null;
    if (chgEl && CHG[chgEl.dataset.chg]) { CHG[chgEl.dataset.chg](chgEl); }
  });

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form && form.dataset && form.dataset.form && FORM[form.dataset.form]) {
      e.preventDefault();
      FORM[form.dataset.form]();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); closeSide(); }
  });

  // Sidebar (mobile) toggle
  var t = $('#sideToggle'), side = $('#appSide'), overlay = $('#appOverlay');
  if (t && side && overlay) {
    t.addEventListener('click', function () {
      var open = side.classList.toggle('open');
      overlay.classList.toggle('show', open);
      document.body.classList.toggle('side-open', open);
    });
    overlay.addEventListener('click', closeSide);
  }
}

function closeSide() {
  var side = $('#appSide'), overlay = $('#appOverlay');
  if (side) side.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
  document.body.classList.remove('side-open');
}

/* ============================ Auth pages ============================ */
function showFormErr(id, msg) {
  var el = $('#' + id);
  if (el) { el.textContent = msg; el.classList.add('show'); }
}

function initLogin() {
  if (session()) { location.href = 'console.html'; return; }
  var form = $('#loginForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('#loginEmail').value.trim().toLowerCase();
    var pass = $('#loginPassword').value;
    var u = db().users.filter(function (x) { return x.email.toLowerCase() === email && x.password === pass; })[0];
    if (!u) { showFormErr('loginError', 'Wrong email or password. Try the demo account below.'); return; }
    saveSession(u);
    log('auth.login', 'Users', u.name + ' signed in to the console.', u.name);
    location.href = 'console.html';
  });

  // Demo quick-fill buttons
  var adminBtn = $('#demoAdmin'), managerBtn = $('#demoManager');
  if (adminBtn) adminBtn.addEventListener('click', function () {
    $('#loginEmail').value = 'admin@royalstay.com';
    $('#loginPassword').value = 'admin123';
  });
  if (managerBtn) managerBtn.addEventListener('click', function () {
    $('#loginEmail').value = 'manager@royalstay.com';
    $('#loginPassword').value = 'manager123';
  });
}

function initRegister() {
  if (session()) { location.href = 'console.html'; return; }
  var form = $('#registerForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#regName').value.trim();
    var email = $('#regEmail').value.trim().toLowerCase();
    var phone = $('#regPhone').value.trim();
    var pass = $('#regPass').value;
    var pass2 = $('#regPass2').value;
    var roleEl = $('input[name="regRole"]:checked');
    var role = roleEl ? roleEl.value : 'guest';

    if (!name) { showFormErr('regError', 'Please enter your full name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFormErr('regError', 'Enter a valid email address.'); return; }
    if (pass.length < 6) { showFormErr('regError', 'Password must be at least 6 characters.'); return; }
    if (pass !== pass2) { showFormErr('regError', 'Passwords do not match.'); return; }

    var d = db();
    if (d.users.some(function (u) { return u.email.toLowerCase() === email; })) {
      showFormErr('regError', 'An account with that email already exists — try signing in.'); return;
    }
    var user = { id: uid('u'), name: name, email: email, password: pass, role: role, phone: phone, created: new Date().toISOString() };
    d.users.push(user);
    log('auth.register', 'Users', name + ' created a ' + role + ' account.', name);
    saveDB();
    saveSession(user);
    location.href = 'console.html';
  });
}

/* ============================ Boot ============================ */
document.addEventListener('DOMContentLoaded', function () {
  if ($('#appShell')) initConsole();
  if ($('#loginForm')) initLogin();
  if ($('#registerForm')) initRegister();
});
