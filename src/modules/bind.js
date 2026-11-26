import { brand, contact } from '../config.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const links = {
  whatsapp: (text = `Hi ${brand.name}! I’d like to place an order.`) =>
    `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`,
  instagramDm: () => `https://ig.me/m/${contact.instagram}`,
  instagramProfile: () => `https://www.instagram.com/${contact.instagram}/`,
  phone: () => `tel:${contact.phone.replace(/[^\d+]/g, '')}`,
  email: () => `mailto:${contact.email}`,
};

/* Fill every [data-bind] / [data-href] in the page from config.js */
export function bindContact() {
  const text = {
    established: brand.established,
    city: brand.city,
    phone: contact.phone,
    email: contact.email,
    instagramAt: '@' + contact.instagram,
    leadTime: contact.leadTime,
    year: new Date().getFullYear(),
  };
  Object.entries(text).forEach(([k, v]) =>
    document.querySelectorAll(`[data-bind="${k}"]`).forEach((el) => (el.textContent = v))
  );

  document.querySelectorAll('[data-bind="address"]').forEach((el) => {
    el.innerHTML = contact.address.map(esc).join('<br>');
  });
  document.querySelectorAll('[data-bind="hours"]').forEach((el) => {
    el.innerHTML = contact.hours.map(([d, h]) => `<div><dt>${esc(d)}</dt><dd>${esc(h)}</dd></div>`).join('');
  });

  const hrefs = {
    whatsapp: links.whatsapp(),
    instagram: links.instagramDm(),
    'instagram-profile': links.instagramProfile(),
    phone: links.phone(),
    email: links.email(),
  };
  document.querySelectorAll('[data-href]').forEach((el) => {
    const h = hrefs[el.dataset.href];
    if (h) el.setAttribute('href', h);
  });
}
