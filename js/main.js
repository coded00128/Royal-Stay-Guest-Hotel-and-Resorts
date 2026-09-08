/* ============================================================
   ROYAL STAY — Hotels & Resorts
   Shared front-end logic
   ============================================================ */

/* ---------- Config ---------- */
var RS_CONFIG = {
  phoneDisplay: '0916 133 0967',
  phoneTel: 'tel:+2349161330967',
  whatsapp: '2349161330967',
  email: 'reservations@royalstay.com',
  address: '12 Adetokunbo Ademola Street, Victoria Island, Lagos, Nigeria',
  currency: '\u20A6' // Naira
};

/* ---------- Helpers ---------- */
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

function getParams() {
  var p = {};
  var q = location.search.replace(/^\?/, '');
  if (!q) return p;
  q.split('&').forEach(function (kv) {
    var bits = kv.split('=');
    if (bits[0]) p[decodeURIComponent(bits[0])] = decodeURIComponent(bits[1] || '');
  });
  return p;
}

function fmtNaira(n) {
  return RS_CONFIG.currency + Number(n).toLocaleString('en-US');
}

function fmtDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function todayISO(offsetDays) {
  var d = new Date();
  d.setDate(d.getDate() + (offsetDays || 0));
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}

function nightsBetween(checkin, checkout) {
  var a = new Date(checkin + 'T00:00:00');
  var b = new Date(checkout + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

function toast(msg) {
  var t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>' + msg + '</span>';
  document.body.appendChild(t);
  requestAnimationFrame(function () { t.classList.add('show'); });
  setTimeout(function () {
    t.classList.remove('show');
    setTimeout(function () { t.remove(); }, 400);
  }, 3200);
}

/* ---------- Image fallback (works offline) ---------- */
var FALLBACK_IMG = "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>" +
  "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
  "<stop offset='0' stop-color='%230a1e3c'/><stop offset='1' stop-color='%231d4e89'/></linearGradient></defs>" +
  "<rect width='800' height='600' fill='url(%23g)'/>" +
  "<text x='400' y='290' font-family='Georgia,serif' font-size='36' fill='%23e5c170' text-anchor='middle'>ROYAL STAY</text>" +
  "<text x='400' y='330' font-family='Arial,sans-serif' font-size='16' fill='%23ffffff' text-anchor='middle' opacity='0.75'>Luxury Hotels %26 Resorts</text></svg>";

window.imgFallback = function (img) {
  if (img && img.dataset.fbk !== '1') {
    img.dataset.fbk = '1';
    img.src = FALLBACK_IMG;
  }
};

/* ---------- Icons ---------- */
var ICONS = {
  users: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  bed: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>',
  area: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3H3v18h18V3z"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>',
  calendar: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  search: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  chev: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  phone: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mail: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  pin: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  whatsapp: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>'
};

/* ---------- Room data ---------- */
var ROOMS = [
  {
    id: 'standard', name: 'Standard Room', badge: '',
    price: 35000, capacity: 2, bed: '1 Queen Bed', size: '28 m\u00B2',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=70',
    tagline: 'Comfortable and cosy with everything you need for a restful night.',
    features: ['Free Wi-Fi', 'Smart TV', 'Work desk', 'Air conditioning', 'Rain shower', 'Daily housekeeping']
  },
  {
    id: 'deluxe', name: 'Deluxe Room', badge: 'Most Popular',
    price: 45000, capacity: 2, bed: '1 King Bed', size: '34 m\u00B2',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=70',
    tagline: 'A refined retreat with city views, plush bedding and modern comforts.',
    features: ['Free Wi-Fi', 'Smart TV', 'Work desk', 'Air conditioning', 'Rain shower', 'Mini bar', 'City view']
  },
  {
    id: 'executive', name: 'Executive Room', badge: '',
    price: 65000, capacity: 2, bed: '1 King Bed', size: '40 m\u00B2',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=70',
    tagline: 'Executive comfort with lounge access and panoramic skyline views.',
    features: ['Free Wi-Fi', 'Smart TV', 'Executive lounge access', 'Air conditioning', 'Bathtub', 'Mini bar', 'City view', 'Late checkout']
  },
  {
    id: 'family', name: 'Family Room', badge: 'Great for Families',
    price: 85000, capacity: 4, bed: '2 Queen Beds', size: '46 m\u00B2',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=70',
    tagline: 'Spacious living area and two queen beds, perfect for the whole family.',
    features: ['Free Wi-Fi', 'Smart TV', 'Separate living area', 'Air conditioning', 'Rain shower', 'Kids amenities', 'Mini bar']
  },
  {
    id: 'suite', name: 'Suite Room', badge: '',
    price: 95000, capacity: 4, bed: '1 King Bed + Sofa Bed', size: '58 m\u00B2',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=70',
    tagline: 'A stylish split-level suite with a lounge, dining corner and skyline views.',
    features: ['Free Wi-Fi', 'Smart TV', 'Separate lounge & dining', 'Air conditioning', 'Bathtub', 'Mini bar', 'City view', 'Butler on call']
  },
  {
    id: 'presidential', name: 'Presidential Suite', badge: 'Ultimate Luxury',
    price: 150000, capacity: 6, bed: '2 King Beds', size: '96 m\u00B2',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=70',
    tagline: 'Our signature suite: private dining, panoramic views and white-glove service.',
    features: ['Free Wi-Fi', 'Smart TV', 'Private dining room', 'Separate lounge & study', 'Jacuzzi bathtub', 'Mini bar', 'Panoramic view', 'Private butler', 'Airport limousine']
  }
];

/* Optional: adopt the room catalog managed from the demo backend (manage/).
   When the management console saves rooms, it writes them to this key and
   the live website shows exactly what the console publishes. */
try {
  var _managedCatalog = JSON.parse(localStorage.getItem('rs_rooms_override') || 'null');
  if (Array.isArray(_managedCatalog) && _managedCatalog.length) {
    ROOMS = _managedCatalog;
  }
} catch (_err) {}

function getRoom(id) {
  for (var i = 0; i < ROOMS.length; i++) {
    if (ROOMS[i].id === id) return ROOMS[i];
  }
  return null;
}

/* ---------- Navbar ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var toggle = $('#navToggle');
  var nav = $('#mainNav');
  var overlay = $('#navOverlay');
  if (toggle && nav) {
    function closeNav() {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      if (overlay) overlay.classList.remove('show');
      document.body.classList.remove('menu-open');
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      if (overlay) overlay.classList.toggle('show', open);
      document.body.classList.toggle('menu-open', open);
    });
    if (overlay) overlay.addEventListener('click', closeNav);
    $$('.nav-link', nav).forEach(function (l) { l.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  // Give mobile users a Login / Sign Up link inside the drawer
  $$('.nav-cta-mobile').forEach(function (wrap) {
    if (wrap && !$('.nav-login-mobile', wrap)) {
      var lnk = document.createElement('a');
      lnk.className = 'nav-login-mobile';
      lnk.href = 'guest-login.html';
      lnk.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Guest Login';
      wrap.insertBefore(lnk, wrap.firstChild);
    }
  });

  // If a guest session exists, show a user menu in the header and mobile drawer
  (function () {
    try {
      var guestRaw = localStorage.getItem('rs_guest_auth');
      if (!guestRaw) return;
      var guest = null;
      try { guest = JSON.parse(guestRaw); } catch (e) { guest = null; }
      var firstName = guest && guest.name ? (guest.name.split(' ')[0] || guest.name) : 'Guest';
      function safe(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

      // Header: convert .login-link into a user menu toggle
      var navActions = document.querySelector('.nav-actions');
      if (navActions) navActions.style.position = navActions.style.position || 'relative';
      var headerToggleCreated = false;
      $$('.login-link').forEach(function (el) {
        headerToggleCreated = true;
        el.classList.add('user-menu-toggle');
        el.href = '#';
        el.innerHTML = '<span class="um-greet">Hi, ' + safe(firstName) + '</span> <span class="um-caret">▾</span>';
        el.addEventListener('click', function (e) {
          e.preventDefault();
          var menu = document.querySelector('.user-menu');
          if (menu) menu.classList.toggle('open');
        });
      });

      // Remove any legacy guest-logout-link elements to avoid duplicates
      $$('.guest-logout-link').forEach(function (g) {
        if (!g.classList.contains('user-menu-toggle')) {
          try { g.parentNode && g.parentNode.removeChild(g); } catch (e) {}
        }
      });

      // Create the header user menu if it doesn't exist
      if (headerToggleCreated && !document.querySelector('.user-menu')) {
        var menu = document.createElement('div');
        menu.className = 'user-menu';
        menu.innerHTML = '' +
          '<a class="um-item" href="guest-dashboard.html">My Dashboard</a>' +
          '<button class="um-item um-logout" type="button">Logout</button>';
        if (navActions) navActions.appendChild(menu);
        menu.querySelector('.um-logout').addEventListener('click', function () {
          try { localStorage.removeItem('rs_guest_auth'); } catch (err) {}
          toast('Signed out');
          setTimeout(function () { location.href = 'index.html'; }, 400);
        });
        // Close menu when clicking outside
        document.addEventListener('click', function (ev) {
          var menuEl = document.querySelector('.user-menu');
          var toggle = document.querySelector('.user-menu-toggle');
          if (!menuEl) return;
          if (menuEl.contains(ev.target) || (toggle && toggle.contains(ev.target))) return;
          menuEl.classList.remove('open');
        });
      }

      // Mobile drawer: reuse existing logout if present, otherwise add dashboard + logout
      $$('.nav-login-mobile').forEach(function (el) {
        el.href = '#';
        el.innerHTML = '<span class="nav-mobile-greet">Hi, ' + safe(firstName) + '</span>';
        var wrap = el.parentNode;
        // Dashboard link
        if (wrap && !wrap.querySelector('.nav-mobile-dashboard')) {
          var dash = document.createElement('a');
          dash.className = 'nav-mobile-dashboard';
          dash.href = 'guest-dashboard.html';
          dash.classList.add('btn', 'btn-outline-light');
          dash.style.display = 'block';
          dash.style.textAlign = 'center';
          dash.style.marginTop = '8px';
          dash.textContent = 'My Dashboard';
          wrap.appendChild(dash);
        }
        // Logout: if an existing mobile logout button exists, reuse it and attach handler;
        // otherwise create one. Ensure only one logout button remains.
        if (wrap) {
          var existing = wrap.querySelector('.mobile-logout-btn');
          if (existing) {
            // Normalize classes and ensure single click handler
            existing.classList.add('nav-mobile-logout');
            existing.removeEventListener && existing.removeEventListener('click', function () {});
            existing.addEventListener('click', function () {
              try { localStorage.removeItem('rs_guest_auth'); } catch (err) {}
              toast('Signed out');
              setTimeout(function () { location.href = 'index.html'; }, 400);
            });
            // If there are multiple elements with .mobile-logout-btn, remove the extras
            var all = wrap.querySelectorAll('.mobile-logout-btn');
            if (all.length > 1) {
              for (var i = 1; i < all.length; i++) { all[i].parentNode && all[i].parentNode.removeChild(all[i]); }
            }
          } else if (!wrap.querySelector('.nav-mobile-logout')) {
            var out = document.createElement('button');
            out.className = 'nav-mobile-logout btn btn-outline-light mobile-logout-btn';
            out.type = 'button';
            out.style.display = 'block';
            out.style.marginTop = '8px';
            out.textContent = 'Logout';
            out.addEventListener('click', function () {
              try { localStorage.removeItem('rs_guest_auth'); } catch (err) {}
              toast('Signed out');
              setTimeout(function () { location.href = 'index.html'; }, 400);
            });
            wrap.appendChild(out);
          }
        }
      });
    } catch (e) {}
  })();
});

/* ---------- Search widget ---------- */
function buildSearchWidget(el, opts) {
  opts = opts || {};
  var checkin = opts.checkin || todayISO(1);
  var checkout = opts.checkout || todayISO(4);
  var guests = opts.guests || 2;
  var rooms = opts.rooms || 1;
  var compact = !!opts.compact;

  el.innerHTML =
    '<form class="search-widget' + (compact ? ' sw-compact' : '') + '" id="searchWidgetForm" novalidate>' +
      '<div class="sw-field">' +
        '<label>' + ICONS.calendar + 'Check-in</label>' +
        '<input type="date" id="swCheckin" value="' + checkin + '" min="' + todayISO(0) + '" required>' +
      '</div>' +
      '<div class="sw-field">' +
        '<label>' + ICONS.calendar + 'Check-out</label>' +
        '<input type="date" id="swCheckout" value="' + checkout + '" min="' + todayISO(1) + '" required>' +
      '</div>' +
      '<div class="sw-field">' +
        '<label>' + ICONS.users + 'Guests &amp; Rooms</label>' +
        '<button type="button" class="sw-select-btn" id="swGuestsBtn" aria-expanded="false">' +
          '<span id="swGuestsLabel">' + guests + ' Guests, ' + rooms + ' Room' + (rooms > 1 ? 's' : '') + '</span>' +
          '<span class="chev">' + ICONS.chev + '</span>' +
        '</button>' +
        '<div class="sw-dropdown" id="swGuestsDropdown">' +
          '<div class="stepper-row"><div class="sr-label">Guests<small>Adults &amp; children</small></div><div class="stepper"><button type="button" data-step="guests" data-dir="-1">\u2212</button><span class="val" id="swGuestsVal">' + guests + '</span><button type="button" data-step="guests" data-dir="1">+</button></div></div>' +
          '<div class="stepper-row"><div class="sr-label">Rooms<small>Number of rooms</small></div><div class="stepper"><button type="button" data-step="rooms" data-dir="-1">\u2212</button><span class="val" id="swRoomsVal">' + rooms + '</span><button type="button" data-step="rooms" data-dir="1">+</button></div></div>' +
        '</div>' +
      '</div>' +
      '<button type="submit" class="btn btn-gold btn-search">' + ICONS.search + 'Search Availability</button>' +
    '</form>';

  var form = $('#searchWidgetForm', el);
  var inEl = $('#swCheckin', el);
  var outEl = $('#swCheckout', el);
  var btnEl = $('#swGuestsBtn', el);
  var ddEl = $('#swGuestsDropdown', el);
  var gvEl = $('#swGuestsVal', el);
  var rvEl = $('#swRoomsVal', el);
  var labelEl = $('#swGuestsLabel', el);
  var g = guests, r = rooms;

  function syncLabel() {
    labelEl.textContent = g + ' Guest' + (g > 1 ? 's' : '') + ', ' + r + ' Room' + (r > 1 ? 's' : '');
  }

  function toggleDD(force) {
    var open = force !== undefined ? force : !ddEl.classList.contains('open');
    ddEl.classList.toggle('open', open);
    btnEl.setAttribute('aria-expanded', open);
  }

  btnEl.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleDD();
  });
  document.addEventListener('click', function (e) {
    if (!el.contains(e.target)) toggleDD(false);
  });

  $$('.stepper button', ddEl).forEach(function (b) {
    b.addEventListener('click', function () {
      var kind = b.dataset.step;
      var dir = parseInt(b.dataset.dir, 10);
      if (kind === 'guests') {
        g = Math.min(12, Math.max(1, g + dir));
        gvEl.textContent = g;
      } else {
        r = Math.min(6, Math.max(1, r + dir));
        rvEl.textContent = r;
      }
      syncLabel();
    });
  });

  inEl.addEventListener('change', function () {
    if (outEl.value && inEl.value >= outEl.value) {
      outEl.value = todayISO(nightsBetween(inEl.value, todayISO(0)) + 1 + 1);
    }
    outEl.min = todayISO(nightsBetween(inEl.value, todayISO(0)) + 1);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!inEl.value || !outEl.value) { toast('Please select your check-in and check-out dates.'); return; }
    if (outEl.value <= inEl.value) { toast('Check-out must be after check-in.'); return; }
    var q = 'checkin=' + encodeURIComponent(inEl.value) +
            '&checkout=' + encodeURIComponent(outEl.value) +
            '&guests=' + g +
            '&rooms=' + r;
    location.href = 'rooms.html?' + q;
  });
}

/* ---------- Booking steps ---------- */
function buildSteps(el, current) {
  var steps = [
    ['Search', 'rooms.html'],
    ['Available Rooms', 'rooms.html'],
    ['Select Room', null],
    ['Guest Details', null],
    ['Confirmation', null]
  ];
  var html = '';
  for (var i = 0; i < steps.length; i++) {
    var cls = '';
    if (i < current) cls = 'done';
    else if (i === current) cls = 'active';
    html += '<div class="step ' + cls + '">' +
              '<span class="step-dot">' + (i < current ? '\u2713' : (i + 1)) + '</span>' +
              '<span class="step-label">' + steps[i][0] + '</span>' +
            '</div>';
  }
  el.innerHTML = html;
}

/* ---------- Room card ---------- */
function roomCardHTML(r, q) {
  var query = q ? '&' + q : '';
  var meta =
    '<span>' + ICONS.users + r.capacity + ' Guests</span>' +
    '<span>' + ICONS.bed + r.bed + '</span>' +
    '<span>' + ICONS.area + r.size + '</span>';
  return (
    '<article class="room-card">' +
      '<a class="room-card-img" href="room-details.html?room=' + r.id + query + '">' +
        '<img src="' + r.image + '" alt="' + r.name + '" loading="lazy" onerror="imgFallback(this)">' +
        (r.badge ? '<span class="room-badge">' + r.badge + '</span>' : '') +
      '</a>' +
      '<div class="room-card-body">' +
        '<a href="room-details.html?room=' + r.id + query + '"><h3 class="room-card-title">' + r.name + '</h3></a>' +
        '<div class="room-card-meta">' + meta + '</div>' +
        '<div class="room-card-foot">' +
          '<div class="room-price"><strong>' + fmtNaira(r.price) + '</strong><span>/ night</span></div>' +
          '<a href="room-details.html?room=' + r.id + query + '" class="btn btn-gold">Book Now</a>' +
        '</div>' +
      '</div>' +
    '</article>'
  );
}

/* ============================================================
   PAGE: Home (index.html)
   ============================================================ */
function initHome() {
  var sw = $('#searchWidget');
  if (sw) buildSearchWidget(sw, {});

  var featured = $('#featuredRooms');
  if (featured) {
    var ids = ['deluxe', 'executive', 'suite', 'presidential'];
    var html = '';
    ids.forEach(function (id) {
      var r = getRoom(id);
      if (r) html += roomCardHTML(r, '');
    });
    featured.innerHTML = html;
  }
}

/* ============================================================
   PAGE: Rooms (rooms.html)
   ============================================================ */
function initRoomsPage() {
  var grid = $('#roomsGrid');
  if (!grid) return;
  var p = getParams();
  var q = (p.checkin ? 'checkin=' + encodeURIComponent(p.checkin) : '') +
          (p.checkout ? '&checkout=' + encodeURIComponent(p.checkout) : '') +
          (p.guests ? '&guests=' + encodeURIComponent(p.guests) : '') +
          (p.rooms ? '&rooms=' + encodeURIComponent(p.rooms) : '');

  var sw = $('#searchWidget');
  if (sw) {
    buildSearchWidget(sw, {
      checkin: p.checkin || todayISO(1),
      checkout: p.checkout || todayISO(4),
      guests: parseInt(p.guests, 10) || 2,
      rooms: parseInt(p.rooms, 10) || 1
    });
  }

  var recap = $('#searchRecap');
  if (recap) {
    if (p.checkin && p.checkout) {
      var nights = nightsBetween(p.checkin, p.checkout);
      recap.innerHTML =
        '<div class="recap-chip show">' + ICONS.calendar + '<span><strong>' + fmtDate(p.checkin) + '</strong> \u2013 <strong>' + fmtDate(p.checkout) + '</strong> \u00B7 ' + nights + ' night' + (nights > 1 ? 's' : '') + '</span></div>' +
        '<div class="recap-chip show">' + ICONS.users + '<span><strong>' + (p.guests || 2) + '</strong> Guests \u00B7 <strong>' + (p.rooms || 1) + '</strong> Room' + ((p.rooms || 1) > 1 ? 's' : '') + '</span></div>';
    }
  }

  var guests = parseInt(p.guests, 10) || 0;
  var list = [];
  ROOMS.forEach(function (r) {
    if (!guests || r.capacity >= guests) list.push(r);
  });

  var count = $('#roomsCount');
  if (count) count.textContent = list.length;

  var html = '';
  list.forEach(function (r) { html += roomCardHTML(r, q); });
  grid.innerHTML = html || '<p class="lead">No rooms match your search. Try reducing the number of guests or <a href="rooms.html">view all rooms</a>.</p>';
}

/* ============================================================
   PAGE: Room details (room-details.html)
   ============================================================ */
function initRoomDetails() {
  var wrap = $('#roomDetailWrap');
  if (!wrap) return;
  var p = getParams();
  var room = getRoom(p.room);
  var q = (p.checkin ? 'checkin=' + encodeURIComponent(p.checkin) : '') +
          (p.checkout ? '&checkout=' + encodeURIComponent(p.checkout) : '') +
          (p.guests ? '&guests=' + encodeURIComponent(p.guests) : '') +
          (p.rooms ? '&rooms=' + encodeURIComponent(p.rooms) : '');

  if (!room) {
    wrap.innerHTML = '<div class="text-center panel"><h2>Room not found</h2><p class="lead mt-1">The room you are looking for does not exist.</p><a class="btn btn-gold mt-3" href="rooms.html">View All Rooms</a></div>';
    return;
  }

  var features = '';
  room.features.forEach(function (f) {
    features += '<li><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' + f + '</li>';
  });

  var nights = 1;
  if (p.checkin && p.checkout) {
    nights = Math.max(1, nightsBetween(p.checkin, p.checkout));
  }
  var total = room.price * nights;

  wrap.innerHTML =
    '<div class="room-detail-main">' +
      '<div class="rd-gallery">' +
        '<img src="' + room.image + '" alt="' + room.name + '" onerror="imgFallback(this)">' +
      '</div>' +
      '<div class="rd-info">' +
        '<span class="eyebrow">' + (room.badge || 'Royal Stay') + '</span>' +
        '<h1 class="serif">' + room.name + '</h1>' +
        '<p class="lead">' + room.tagline + '</p>' +
        '<div class="rd-meta">' +
          '<div class="rd-meta-item">' + ICONS.users + '<div><small>Capacity</small><strong>' + room.capacity + ' Guests</strong></div></div>' +
          '<div class="rd-meta-item">' + ICONS.bed + '<div><small>Bed</small><strong>' + room.bed + '</strong></div></div>' +
          '<div class="rd-meta-item">' + ICONS.area + '<div><small>Size</small><strong>' + room.size + '</strong></div></div>' +
        '</div>' +
        '<h2 class="serif rd-sub">Amenities</h2>' +
        '<ul class="rd-features">' + features + '</ul>' +
      '</div>' +
    '</div>' +
    '<div class="rd-book">' +
      '<div class="panel">' +
        '<h2 class="serif">Book This Room</h2>' +
        '<form id="rdForm" novalidate>' +
          '<div class="form-grid">' +
            '<div class="form-field"><label>Check-in</label><input type="date" id="rdCheckin" value="' + (p.checkin || todayISO(1)) + '" min="' + todayISO(0) + '"></div>' +
            '<div class="form-field"><label>Check-out</label><input type="date" id="rdCheckout" value="' + (p.checkout || todayISO(4)) + '" min="' + todayISO(1) + '"></div>' +
            '<div class="form-field"><label>Guests</label><input type="number" id="rdGuests" value="' + (p.guests || 2) + '" min="1" max="' + room.capacity + '"></div>' +
            '<div class="form-field"><label>Rooms</label><input type="number" id="rdRooms" value="' + (p.rooms || 1) + '" min="1" max="6"></div>' +
          '</div>' +
          '<div class="rd-price-box mt-2">' +
            '<div class="sum-line"><span>' + fmtNaira(room.price) + ' \u00D7 ' + nights + ' night' + (nights > 1 ? 's' : '') + '</span><strong id="rdSubtotal">' + fmtNaira(total) + '</strong></div>' +
            '<div class="sum-line"><span>Taxes &amp; service charge (7.5%)</span><strong id="rdTax">' + fmtNaira(Math.round(total * 0.075)) + '</strong></div>' +
            '<div class="sum-total"><span>Total</span><strong id="rdTotal">' + fmtNaira(total + Math.round(total * 0.075)) + '</strong></div>' +
          '</div>' +
          '<button type="submit" class="btn btn-gold btn-block mt-3">Proceed to Guest Details ' + ICONS.arrow + '</button>' +
          '<p class="form-note text-center mt-2">Free cancellation up to 48 hours before check-in.</p>' +
        '</form>' +
      '</div>' +
    '</div>';

  var inEl = $('#rdCheckin'), outEl = $('#rdCheckout');
  var gEl = $('#rdGuests'), rEl = $('#rdRooms');

  function recalc() {
    var n = nightsBetween(inEl.value, outEl.value);
    if (isNaN(n) || n < 1) n = 1;
    var g = parseInt(gEl.value, 10) || 1;
    var roomsN = parseInt(rEl.value, 10) || 1;
    var sub = room.price * n * roomsN;
    var tax = Math.round(sub * 0.075);
    $('#rdSubtotal').textContent = fmtNaira(sub);
    $('#rdTax').textContent = fmtNaira(tax);
    $('#rdTotal').textContent = fmtNaira(sub + tax);
  }
  [inEl, outEl, gEl, rEl].forEach(function (i) { i.addEventListener('input', recalc); });
  inEl.addEventListener('change', function () {
    if (outEl.value && inEl.value >= outEl.value) outEl.value = todayISO(nightsBetween(inEl.value, todayISO(0)) + 2);
    recalc();
  });

  $('#rdForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!inEl.value || !outEl.value || outEl.value <= inEl.value) { toast('Please pick valid dates.'); return; }
    var g = parseInt(gEl.value, 10) || 1;
    if (g > room.capacity) { toast('This room accommodates up to ' + room.capacity + ' guests.'); return; }
    var url = 'booking.html?room=' + room.id +
      '&checkin=' + encodeURIComponent(inEl.value) +
      '&checkout=' + encodeURIComponent(outEl.value) +
      '&guests=' + g +
      '&rooms=' + (parseInt(rEl.value, 10) || 1);
    location.href = url;
  });

  var similar = $('#similarRooms');
  if (similar) {
    var others = ROOMS.filter(function (r) { return r.id !== room.id; }).slice(0, 3);
    var sh = '';
    others.forEach(function (r) { sh += roomCardHTML(r, q); });
    similar.innerHTML = sh;
  }
}

/* ============================================================
   PAGE: Booking / guest details (booking.html)
   ============================================================ */
function initBookingPage() {
  var wrap = $('#bookingWrap');
  if (!wrap) return;
  var p = getParams();
  var room = getRoom(p.room);

  if (!room || !p.checkin || !p.checkout) {
    wrap.innerHTML = '<div class="text-center panel"><h2>No room selected</h2><p class="lead mt-1">Please choose a room and dates first.</p><a class="btn btn-gold mt-3" href="rooms.html">Browse Rooms</a></div>';
    return;
  }

  var nights = Math.max(1, nightsBetween(p.checkin, p.checkout));
  var guests = parseInt(p.guests, 10) || 1;
  var roomsN = parseInt(p.rooms, 10) || 1;
  var sub = room.price * nights * roomsN;
  var tax = Math.round(sub * 0.075);
  var total = sub + tax;

  wrap.innerHTML =
    '<div class="booking-layout">' +
      '<div class="panel">' +
        '<h2 class="serif">Guest Details</h2>' +
        '<form id="guestForm" novalidate>' +
          '<div class="form-grid">' +
            '<div class="form-field full"><label>Full Name <span class="req">*</span></label><input type="text" id="gName" placeholder="e.g. Ada Obi" required></div>' +
            '<div class="form-field"><label>Email Address <span class="req">*</span></label><input type="email" id="gEmail" placeholder="you@example.com" required></div>' +
            '<div class="form-field"><label>Phone Number <span class="req">*</span></label><input type="tel" id="gPhone" placeholder="e.g. 09161330967" required></div>' +
            '<div class="form-field"><label>Country</label><input type="text" id="gCountry" placeholder="e.g. Nigeria"></div>' +
            '<div class="form-field"><label>Special Requests</label><textarea id="gRequests" placeholder="Early check-in, airport pickup, celebration setup\u2026"></textarea></div>' +
          '</div>' +
          '<h3 class="serif mt-3 mb-2">Payment Method</h3>' +
          '<div class="pay-options">' +
            '<label class="pay-option selected"><input type="radio" name="pay" value="pay-at-hotel" checked><span><strong>Pay at Hotel</strong><small>Reserve now \u2014 settle your bill in cash or card at reception.</small></span></label>' +
            '<label class="pay-option"><input type="radio" name="pay" value="card"><span><strong>Card Payment</strong><small>Pay securely now with your debit/credit card (demo).</small></span></label>' +
          '</div>' +
          '<div id="cardFields" class="form-grid" style="display:none">' +
            '<div class="form-field full"><label>Card Number</label><input type="text" id="gCard" placeholder="1234 5678 9012 3456" maxlength="19"></div>' +
            '<div class="form-field"><label>Expiry</label><input type="text" id="gExp" placeholder="MM/YY" maxlength="5"></div>' +
            '<div class="form-field"><label>CVV</label><input type="text" id="gCvv" placeholder="123" maxlength="3"></div>' +
          '</div>' +
          '<button type="submit" class="btn btn-gold btn-block mt-3">Confirm Booking &amp; Continue ' + ICONS.arrow + '</button>' +
          '<p class="form-note text-center mt-2">By continuing you agree to our reservation terms and cancellation policy.</p>' +
        '</form>' +
      '</div>' +
      '<aside class="panel summary-panel">' +
        '<h3 class="serif">Your Stay</h3>' +
        '<div class="summary-room">' +
          '<img src="' + room.image + '" alt="' + room.name + '" onerror="imgFallback(this)">' +
          '<div><h4>' + room.name + '</h4><p>' + room.capacity + ' Guests \u00B7 ' + room.bed + '</p><p>' + fmtNaira(room.price) + '/night</p></div>' +
        '</div>' +
        '<div class="sum-line"><span>Check-in</span><strong>' + fmtDate(p.checkin) + '</strong></div>' +
        '<div class="sum-line"><span>Check-out</span><strong>' + fmtDate(p.checkout) + '</strong></div>' +
        '<div class="sum-line"><span>Nights</span><strong>' + nights + '</strong></div>' +
        '<div class="sum-line"><span>Rooms</span><strong>' + roomsN + '</strong></div>' +
        '<div class="sum-line"><span>' + fmtNaira(room.price) + ' \u00D7 ' + nights + ' night' + (nights > 1 ? 's' : '') + ' \u00D7 ' + roomsN + '</span><strong>' + fmtNaira(sub) + '</strong></div>' +
        '<div class="sum-line"><span>Taxes &amp; charges (7.5%)</span><strong>' + fmtNaira(tax) + '</strong></div>' +
        '<div class="sum-total"><span>Total</span><strong>' + fmtNaira(total) + '</strong></div>' +
        '<p class="sum-note"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Free cancellation up to 48 hours before arrival.</p>' +
      '</aside>' +
    '</div>';

  $$('.pay-option', wrap).forEach(function (opt) {
    opt.addEventListener('click', function () {
      $$('.pay-option', wrap).forEach(function (o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
      var radio = $('input', opt);
      radio.checked = true;
      $('#cardFields').style.display = radio.value === 'card' ? 'grid' : 'none';
    });
  });

  $('#guestForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#gName').value.trim();
    var email = $('#gEmail').value.trim();
    var phone = $('#gPhone').value.trim();
    if (!name) { toast('Please enter your full name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Please enter a valid email address.'); return; }
    if (phone.length < 7) { toast('Please enter a valid phone number.'); return; }

    var pay = ($('input[name="pay"]:checked', wrap) || {}).value || 'pay-at-hotel';
    if (pay === 'card') {
      var card = $('#gCard').value.replace(/\s/g, '');
      if (card.length < 12) { toast('Please enter a valid card number.'); return; }
    }

    var ref = 'RS-' + Date.now().toString(36).toUpperCase().slice(-4) + Math.random().toString(36).toUpperCase().slice(2, 5);
    var booking = {
      ref: ref,
      roomId: room.id,
      roomName: room.name,
      roomImage: room.image,
      pricePerNight: room.price,
      checkin: p.checkin,
      checkout: p.checkout,
      nights: nights,
      guests: guests,
      rooms: roomsN,
      sub: sub,
      tax: tax,
      total: total,
      paymentMethod: pay === 'card' ? 'Card (paid now)' : 'Pay at Hotel',
      guest: { name: name, email: email, phone: phone, country: $('#gCountry').value.trim(), requests: $('#gRequests').value.trim() },
      created: new Date().toISOString()
    };
    try { localStorage.setItem('rs_last_booking', JSON.stringify(booking)); } catch (err) {}
    location.href = 'confirmation.html';
  });
}

/* ============================================================
   PAGE: Confirmation (confirmation.html)
   ============================================================ */
function initConfirmation() {
  var wrap = $('#confirmationWrap');
  if (!wrap) return;
  var booking = null;
  try { booking = JSON.parse(localStorage.getItem('rs_last_booking')); } catch (err) {}

  if (!booking || !booking.roomName) {
    wrap.innerHTML = '<div class="panel text-center"><h2>No booking found</h2><p class="lead mt-1">We could not find a recent booking on this device.</p><a class="btn btn-gold mt-3" href="rooms.html">Start a New Booking</a></div>';
    return;
  }

  var waText = 'Hello Royal Stay! I just made a booking.\n\n' +
    'Booking Ref: ' + booking.ref + '\n' +
    'Room: ' + booking.roomName + '\n' +
    'Check-in: ' + fmtDate(booking.checkin) + '\n' +
    'Check-out: ' + fmtDate(booking.checkout) + '\n' +
    'Guests: ' + booking.guests + ' \u00B7 Rooms: ' + booking.rooms + '\n' +
    'Total: ' + fmtNaira(booking.total) + '\n' +
    'Guest: ' + booking.guest.name + ' (' + booking.guest.phone + ')';
  var waLink = 'https://wa.me/' + RS_CONFIG.whatsapp + '?text=' + encodeURIComponent(waText);

  wrap.innerHTML =
    '<div class="confirm-wrap">' +
      '<div class="confirm-hero">' +
        '<div class="confirm-icon"><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' +
        '<h1 class="serif">Booking Confirmed!</h1>' +
        '<p>Thank you, <strong>' + booking.guest.name.split(' ')[0] + '</strong> \u2014 your reservation is confirmed. A confirmation has been sent to <strong>' + booking.guest.email + '</strong>.</p>' +
        '<div class="confirm-ref">' + booking.ref + '</div>' +
      '</div>' +
      '<div class="confirm-details">' +
        '<h3 class="serif">Booking Summary</h3>' +
        '<div class="cd-grid">' +
          '<div class="cd-item"><small>Room</small><strong>' + booking.roomName + '</strong></div>' +
          '<div class="cd-item"><small>Payment</small><strong>' + booking.paymentMethod + '</strong></div>' +
          '<div class="cd-item"><small>Check-in</small><strong>' + fmtDate(booking.checkin) + '</strong></div>' +
          '<div class="cd-item"><small>Check-out</small><strong>' + fmtDate(booking.checkout) + '</strong></div>' +
          '<div class="cd-item"><small>Nights</small><strong>' + booking.nights + '</strong></div>' +
          '<div class="cd-item"><small>Guests \u00B7 Rooms</small><strong>' + booking.guests + ' \u00B7 ' + booking.rooms + '</strong></div>' +
          '<div class="cd-item"><small>Guest</small><strong>' + booking.guest.name + '</strong></div>' +
          '<div class="cd-item"><small>Phone</small><strong>' + booking.guest.phone + '</strong></div>' +
          '<div class="cd-item"><small>Amount paid</small><strong>' + fmtNaira(booking.total) + '</strong></div>' +
          '<div class="cd-item"><small>Hotel Contact</small><strong><a href="' + RS_CONFIG.phoneTel + '">09161330967</a></strong></div>' +
        '</div>' +
        (booking.guest.requests ? '<p class="lead mt-2" style="font-size:13.5px"><strong>Special requests:</strong> ' + booking.guest.requests + '</p>' : '') +
      '</div>' +
      '<div class="confirm-actions">' +
        '<a class="btn btn-wa" href="' + waLink + '" target="_blank" rel="noopener">' + ICONS.whatsapp + ' Send Details to WhatsApp</a>' +
        '<button class="btn btn-navy" id="printBtn">Print / Save PDF</button>' +
        '<a class="btn btn-outline" href="index.html">Back to Home</a>' +
      '</div>' +
    '</div>';

  $('#printBtn').addEventListener('click', function () { window.print(); });
}

/* ============================================================
   PAGE: Contact (contact.html) — WhatsApp form
   ============================================================ */
function initContact() {
  var form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#cName').value.trim();
    var email = $('#cEmail').value.trim();
    var phone = $('#cPhone').value.trim();
    var subject = $('#cSubject').value.trim();
    var message = $('#cMessage').value.trim();

    if (!name || !message) { toast('Please fill in your name and message.'); return; }

    var text = 'Hello Royal Stay! New message from your website.\n\n' +
      'Name: ' + name + '\n' +
      'Email: ' + (email || 'Not provided') + '\n' +
      'Phone: ' + (phone || 'Not provided') + '\n' +
      'Subject: ' + (subject || 'General enquiry') + '\n\n' +
      'Message:\n' + message;

    var url = 'https://wa.me/' + RS_CONFIG.whatsapp + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
    toast('Opening WhatsApp with your message\u2026');
    form.reset();
  });
}

/* ============================================================
   PAGE: Gallery lightbox
   ============================================================ */
function initGallery() {
  var items = $$('.gallery-item');
  if (!items.length) return;
  var images = items.map(function (it) {
    return { src: $('img', it).src, label: it.dataset.label || '' };
  });
  var index = 0;

  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML =
    '<button class="lb-btn lb-close" aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
    '<button class="lb-btn lb-prev" aria-label="Previous"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>' +
    '<img alt="Gallery image">' +
    '<button class="lb-btn lb-next" aria-label="Next"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>' +
    '<div class="lb-caption"></div>';
  document.body.appendChild(lb);

  function show(i) {
    index = (i + images.length) % images.length;
    $('img', lb).src = images[index].src;
    $('.lb-caption', lb).textContent = images[index].label;
  }

  items.forEach(function (it, i) {
    it.addEventListener('click', function () { show(i); lb.classList.add('open'); });
  });
  $('.lb-close', lb).addEventListener('click', function () { lb.classList.remove('open'); });
  $('.lb-prev', lb).addEventListener('click', function () { show(index - 1); });
  $('.lb-next', lb).addEventListener('click', function () { show(index + 1); });
  lb.addEventListener('click', function (e) {
    if (e.target === lb) lb.classList.remove('open');
  });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') lb.classList.remove('open');
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
}

/* ---------- Newsletter (demo) ---------- */
function initNewsletter() {
  $$('.newsletter form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('input', f);
      if (!input.value || input.value.indexOf('@') < 0) { toast('Please enter a valid email address.'); return; }
      toast('Subscribed! Watch your inbox for exclusive offers.');
      f.reset();
    });
  });
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', function () {
  initHome();
  initRoomsPage();
  initRoomDetails();
  initBookingPage();
  initConfirmation();
  initContact();
  initGallery();
  initNewsletter();
});