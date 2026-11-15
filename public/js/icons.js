/* Simple line icons (24x24, stroke = currentColor). */
(function (root) {
  root.LL = root.LL || {};
  var s = function (d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + "</svg>";
  };
  root.LL.icons = {
    fire: s('<path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-2 1-3 1.5-4 .5 1.5 1.5 2 2 2C11 7.5 11 5 12 3z"/><path d="M5 21h14"/>'),
    bath: s('<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2z"/><path d="M6 12V6a2 2 0 0 1 4 0"/><path d="M7 19l-1 2M17 19l1 2"/>'),
    shower: s('<path d="M4 20V8a4 4 0 0 1 8 0"/><path d="M9 8h6"/><path d="M11 12v1M14 12v1M17 12v1M12.5 15v1M15.5 15v1M14 18v1"/>'),
    wifi: s('<path d="M2.5 9a14 14 0 0 1 19 0"/><path d="M5.5 12.5a9.5 9.5 0 0 1 13 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r=".8" fill="currentColor"/>'),
    kitchen: s('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16"/><circle cx="8" cy="6" r=".8" fill="currentColor"/><circle cx="12" cy="6" r=".8" fill="currentColor"/><rect x="7" y="12" width="10" height="6" rx="1"/>'),
    coffee: s('<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/>'),
    tv: s('<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>'),
    patio: s('<path d="M3 21h18"/><path d="M12 4v9"/><path d="M5 9a7 7 0 0 1 14 0z"/><path d="M8 21v-5h8v5"/>'),
    linen: s('<path d="M4 7h16v12H4z"/><path d="M4 11h16"/><path d="M8 3h8l1 4H7z"/>'),
    parking: s('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>'),
    dog: s('<path d="M10 5l-3-1-2 4 2 1"/><path d="M14 5l3-1 2 4-2 1"/><path d="M7 9c0 6 2 10 5 10s5-4 5-10a5 5 0 0 0-10 0z"/><circle cx="10" cy="11" r=".8" fill="currentColor"/><circle cx="14" cy="11" r=".8" fill="currentColor"/><path d="M11 15h2l-1 1z"/>'),
    garden: s('<path d="M12 21v-8"/><path d="M12 13c-4 0-6-3-6-7 4 0 6 3 6 7z"/><path d="M12 15c3 0 5-2 5-5-3 0-5 2-5 5z"/><path d="M4 21h16"/>'),
    ev: s('<rect x="4" y="4" width="10" height="17" rx="2"/><path d="M9 8l-2 4h4l-2 4"/><path d="M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-2-2"/>'),
    washer: s('<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4.5"/><path d="M7 6h2"/>'),
    hottub: s('<path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-3z"/><path d="M8 4c-1 1.5 1 2.5 0 4M12 4c-1 1.5 1 2.5 0 4M16 4c-1 1.5 1 2.5 0 4"/>'),
    access: s('<circle cx="12" cy="4.5" r="1.8"/><path d="M8 8.5h8M12 8.5v5l4 6M12 13.5l-4 6"/>'),
    bed: s('<path d="M3 18v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8"/><path d="M3 14h18M3 18v2M21 18v2"/><path d="M7 11h3"/>'),
    users: s('<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.5A5 5 0 0 1 21 19"/>'),
    car: s('<path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3z"/><circle cx="7.5" cy="13" r=".8" fill="currentColor"/><circle cx="16.5" cy="13" r=".8" fill="currentColor"/>'),
    clock: s('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    pin: s('<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
    heart: s('<path d="M12 20s-7.5-4.6-9-9.5A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 9 4.5C19.5 15.4 12 20 12 20z"/>'),
    chat: s('<path d="M4 5h16v11H9l-5 4z"/>'),
    tag: s('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>'),
    pound: s('<path d="M16 6.5A4 4 0 0 0 9 9v11"/><path d="M6 13h8M6 20h12"/>'),
    calendar: s('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    leaf: s('<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19l8-8"/>'),
    chevL: s('<path d="M15 18l-6-6 6-6"/>'),
    chevR: s('<path d="M9 18l6-6-6-6"/>'),
    close: s('<path d="M6 6l12 12M18 6L6 18"/>'),
    download: s('<path d="M12 4v11M7 10l5 5 5-5"/><path d="M4 20h16"/>'),
    lantern: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="38" r="22" fill="#d9993b" opacity=".18"/><path d="M26 10h12M32 4v6" stroke="#1f2a22" stroke-width="3" stroke-linecap="round"/><path d="M22 18h20l-3-6H25z" fill="#2f5d46"/><rect x="22" y="18" width="20" height="30" rx="4" fill="#f6e3c2" stroke="#2f5d46" stroke-width="3"/><path d="M32 26c2 3 4 4.5 4 8a4 4 0 0 1-8 0c0-2 1.5-3 2-4.5.6 1.4 1.4 1.7 2 1.5z" fill="#d9993b"/><path d="M20 48h24v4a2 2 0 0 1-2 2H22a2 2 0 0 1-2-2z" fill="#2f5d46"/></svg>'
  };
})(typeof window !== "undefined" ? window : globalThis);
