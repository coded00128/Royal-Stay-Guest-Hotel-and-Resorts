/* ============================================================
   ROYAL STAY — Guest Authentication
   guest-auth.js

   Completely separate from the management console (manage/).
   Guests sign in here to view their bookings and profile.
   ============================================================ */

var GUEST_AUTH_KEY = 'rs_guest_auth';
var GUEST_USERS_KEY = 'rs_guest_users';
var GUEST_BOOKINGS_KEY = 'rs_guest_bookings';

/* ---------- Demo guest accounts ---------- */
function defaultGuestUsers() {
  return [
    { id: 'g-1', name: 'coded', email: 'coded@gmail.com', password: 'guest123', phone: '0803 221 7788', created: new Date(Date.now() - 86400000 * 30).toISOString() }
  ];
}

/* ---------- Demo guest bookings ---------- */
function defaultGuestBookings() {
  var today = new Date();
  var d = function (offset) {
    var dt = new Date(today);
    dt.setDate(dt.getDate() + offset);
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
  };
  return [
    { id: 'gb-1', ref: 'RS-A7K2P9', roomName: 'Executive Room', roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=70', pricePerNight: 65000, checkin: d(2), checkout: d(5), nights: 3, guests: 2, rooms: 1, total: 157312, paymentMethod: 'Pay at Hotel', status: 'confirmed', guestName: 'coded', guestEmail: 'coded@gmail.com', guestPhone: '0803 221 7788', created: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 'gb-2', ref: 'RS-Q5M3D8', roomName: 'Deluxe Room', roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=70', pricePerNight: 45000, checkin: d(-8), checkout: d(-5), nights: 3, guests: 2, rooms: 1, total: 145125, paymentMethod: 'Card (paid now)', status: 'completed', guestName: 'coded', guestEmail: 'coded@gmail.com', guestPhone: '0803 221 7788', created: new Date(Date.now() - 86400000 * 15).toISOString() },
    { id: 'gb-3', ref: 'RS-B9W6K1', roomName: 'Suite Room', roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=70', pricePerNight: 95000, checkin: d(14), checkout: d(17), nights: 3, guests: 2, rooms: 1, total: 228375, paymentMethod: 'Card (paid now)', status: 'pending', guestName: 'coded', guestEmail: 'coded@gmail.com', guestPhone: '0805 600 1122', created: new Date(Date.now() - 86400000 * 2).toISOString() }
  ];
}

/* ---------- Data helpers ---------- */
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function getGuestUsers() {
  try { var raw = localStorage.getItem(GUEST_USERS_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  var users = defaultGuestUsers();
  try { localStorage.setItem(GUEST_USERS_KEY, JSON.stringify(users)); } catch (e) {}
  return users;
}

function saveGuestUsers(users) {
  try { localStorage.setItem(GUEST_USERS_KEY, JSON.stringify(users)); } catch (e) {}
}

function getGuestBookings() {
  try { var raw = localStorage.getItem(GUEST_BOOKINGS_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  var bookings = defaultGuestBookings();
  try { localStorage.setItem(GUEST_BOOKINGS_KEY, JSON.stringify(bookings)); } catch (e) {}
  return bookings;
}

function saveGuestBookings(bookings) {
  try { localStorage.setItem(GUEST_BOOKINGS_KEY, JSON.stringify(bookings)); } catch (e) {}
}

function guestSession() {
  try { return JSON.parse(localStorage.getItem(GUEST_AUTH_KEY) || 'null'); } catch (e) { return null; }
}

function saveGuestSession(user) {
  try { localStorage.setItem(GUEST_AUTH_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email, phone: user.phone })); } catch (e) {}
}

function clearGuestSession() {
  try { localStorage.removeItem(GUEST_AUTH_KEY); } catch (e) {}
}

/* ---------- Auth actions ---------- */
function guestLogin(email, password) {
  var users = getGuestUsers();
  var user = users.find(function (u) { return u.email.toLowerCase() === email.toLowerCase() && u.password === password; });
  if (!user) return false;
  saveGuestSession(user);
  return true;
}

function guestSignup(name, email, phone, password) {
  var users = getGuestUsers();
  if (users.some(function (u) { return u.email.toLowerCase() === email.toLowerCase(); })) {
    return 'exists';
  }
  var newUser = { id: 'g-' + Date.now().toString(36), name: name, email: email, phone: phone || '', password: password, created: new Date().toISOString() };
  users.push(newUser);
  saveGuestUsers(users);
  saveGuestSession(newUser);
  syncGuestToBackend(newUser);
  return true;
}

function syncGuestToBackend(user) {
  try {
    var raw = localStorage.getItem('rs_backend_db');
    var db = raw ? JSON.parse(raw) : null;
    if (!db || !db.users) return;
    if (db.users.some(function (u) { return u.email && u.email.toLowerCase() === user.email.toLowerCase(); })) return;
    db.users.push({
      id: 'u-guest-' + user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: 'guest',
      phone: user.phone || '',
      created: user.created
    });
    localStorage.setItem('rs_backend_db', JSON.stringify(db));
  } catch (e) {}
}

function guestLogout() {
  clearGuestSession();
}

/* ---------- Booking helpers ---------- */
function getGuestMyBookings() {
  var s = guestSession();
  if (!s) return [];
  var all = getGuestBookings();
  return all.filter(function (b) { return b.guestEmail && b.guestEmail.toLowerCase() === s.email.toLowerCase(); })
    .sort(function (a, b) { return new Date(b.created) - new Date(a.created); });
}

function getGuestUpcomingBookings() {
  return getGuestMyBookings().filter(function (b) { return b.status === 'pending' || b.status === 'confirmed'; });
}

function getGuestPastBookings() {
  return getGuestMyBookings().filter(function (b) { return b.status === 'completed' || b.status === 'cancelled' || b.status === 'checked-in'; });
}

function cancelGuestBooking(id) {
  var bookings = getGuestBookings();
  var idx = bookings.findIndex(function (b) { return b.id === id; });
  if (idx > -1) {
    var s = guestSession();
    if (bookings[idx].guestEmail && bookings[idx].guestEmail.toLowerCase() === (s ? s.email.toLowerCase() : '')) {
      bookings[idx].status = 'cancelled';
      saveGuestBookings(bookings);
      return true;
    }
  }
  return false;
}

/* ---------- Toast ---------- */
function showToast(msg, isError) {
  var existing = document.querySelector('.g-toast');
  if (existing) existing.remove();
  var t = document.createElement('div');
  t.className = 'g-toast' + (isError ? ' err' : '');
  t.innerHTML = (isError ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>') + '<span>' + esc(msg) + '</span>';
  document.body.appendChild(t);
  requestAnimationFrame(function () { t.classList.add('show'); });
  setTimeout(function () {
    t.classList.remove('show');
    setTimeout(function () { if (t.parentNode) t.remove(); }, 400);
  }, 3200);
}

/* ---------- Protected route guard ---------- */
function requireGuestAuth() {
  if (!guestSession()) {
    location.href = 'guest-login.html';
    return false;
  }
  return true;
}

function redirectIfGuestLoggedIn() {
  if (guestSession()) {
    location.href = 'guest-dashboard.html';
  }
}
