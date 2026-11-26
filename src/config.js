/* ============================================================
   SALT & CRUMB — everything you'd want to edit lives here.
   ------------------------------------------------------------
   • Contact details  → `contact`
   • Products/prices  → `products`
   • Photos           → put files in /public/images/products/
                         then set `image: '/images/products/<file>'`
                         on the product. Until a photo is set, the
                         site shows a custom illustration instead.
   ============================================================ */

export const brand = {
  name: 'Salt & Crumb',
  tagline: 'Small-batch bakery & craft kitchen',
  established: '2024',
  city: 'Your City', // shown in the hero + footer
  currency: '₹',
};

export const contact = {
  // WhatsApp: country code + number, digits only (no +, spaces or dashes)
  whatsapp: '919999999999',
  // Instagram handle without the @
  instagram: 'saltandcrumb.in',
  phone: '+91 99999 99999',
  email: 'hello@saltandcrumb.in',
  address: ['Kitchen address, line one', 'Neighbourhood, City 000000'],
  hours: [
    ['Tue – Sun', '10 am – 8 pm'],
    ['Monday', 'Oven’s resting'],
  ],
  leadTime: 'Order a day ahead for boxes of 6 or more.',
};

export const categories = [
  { id: 'all', label: 'Everything' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'bars', label: 'Brownies & Bars' },
  { id: 'pastry', label: 'Pastry' },
  { id: 'loaves', label: 'Muffins & Loaves' },
];

/*  `art` drives the illustration shown when there's no photo.
    kinds: cookie | brownie | croissant | roll | muffin | loaf | box
    `tone` is the soft backdrop colour behind each product.        */
export const products = [
  {
    id: 'sea-salt-dark',
    name: 'Sea Salt Dark Chocolate',
    category: 'cookies',
    price: 140,
    unit: 'each',
    description: 'Brown-butter dough, puddles of 72% dark chocolate, finished with flaky sea salt.',
    tag: 'Signature',
    image: null,
    tone: '#E7D3B8',
    art: { kind: 'cookie', seed: 7, dough: '#C98E55', edge: '#9C6434', chunk: '#2B1710', chunks: 9, flakes: 7 },
  },
  {
    id: 'brown-butter-chunk',
    name: 'Brown Butter Chocolate Chunk',
    category: 'cookies',
    price: 120,
    unit: 'each',
    description: 'Nutty, toffee-ish brown butter with milk and dark chunks. Crisp edge, gooey middle.',
    tag: 'Bestseller',
    image: null,
    tone: '#EAD9BF',
    art: { kind: 'cookie', seed: 21, dough: '#D29D62', edge: '#A8703D', chunk: '#4A2A1A', chunks: 11 },
  },
  {
    id: 'red-velvet',
    name: 'Red Velvet Cream Cheese',
    category: 'cookies',
    price: 150,
    unit: 'each',
    description: 'Cocoa-red dough, white chocolate chips and a tangy cream-cheese heart.',
    tag: 'Stuffed',
    image: null,
    tone: '#EBD0C8',
    art: { kind: 'cookie', seed: 33, dough: '#93302D', edge: '#6E2020', chunk: '#F4E8D6', chunks: 8, filling: '#F6EEE2' },
  },
  {
    id: 'biscoff-stuffed',
    name: 'Biscoff Stuffed',
    category: 'cookies',
    price: 160,
    unit: 'each',
    description: 'Cinnamon-spiced dough wrapped around a molten speculoos cookie-butter centre.',
    tag: 'Stuffed',
    image: null,
    tone: '#E9CFAE',
    art: { kind: 'cookie', seed: 48, dough: '#BC7A41', edge: '#8F5528', chunk: '#6B3518', chunks: 6, filling: '#A9662F' },
  },
  {
    id: 'pistachio-rose',
    name: 'Pistachio Rose',
    category: 'cookies',
    price: 170,
    unit: 'each',
    description: 'Roasted pistachios, dried rose petals and white chocolate. Our little love letter to mithai.',
    tag: 'New',
    image: null,
    tone: '#DDDCC0',
    art: { kind: 'cookie', seed: 61, dough: '#DDBB85', edge: '#B8925A', chunk: '#7E9447', chunks: 10, petals: '#C46D78' },
  },
  {
    id: 'crumb-box',
    name: 'The Crumb Box',
    category: 'cookies',
    price: 780,
    unit: 'box of 6',
    description: 'Six cookies, baker’s choice or yours. Tied with twine and ready to gift.',
    tag: 'Gift-ready',
    image: null,
    tone: '#E4D2B4',
    art: { kind: 'box', seed: 5 },
  },
  {
    id: 'triple-choc-brownie',
    name: 'Triple Chocolate Brownie',
    category: 'bars',
    price: 110,
    unit: 'each',
    description: 'Fudgy, crackle-topped and three chocolates deep. Best slightly warm.',
    tag: 'Fudgy',
    image: null,
    tone: '#E2CDB7',
    art: { kind: 'brownie', seed: 12, base: '#3E2417', top: '#5A3523', chunk: '#1E110A' },
  },
  {
    id: 'walnut-blondie',
    name: 'Brown Sugar Walnut Blondie',
    category: 'bars',
    price: 110,
    unit: 'each',
    description: 'Deep caramel brown sugar, toasted walnuts and a chewy, crackly top.',
    tag: null,
    image: null,
    tone: '#ECDDC4',
    art: { kind: 'brownie', seed: 27, base: '#C38B4E', top: '#D9A766', chunk: '#7A4A26' },
  },
  {
    id: 'butter-croissant',
    name: 'All-Butter Croissant',
    category: 'pastry',
    price: 140,
    unit: 'each',
    description: 'Laminated over three days for shattering layers and a honeycomb crumb.',
    tag: 'Weekends',
    image: null,
    tone: '#EFDDBE',
    art: { kind: 'croissant', seed: 3 },
  },
  {
    id: 'cardamom-roll',
    name: 'Cardamom Cinnamon Roll',
    category: 'pastry',
    price: 150,
    unit: 'each',
    description: 'Soft brioche swirled with cinnamon and cardamom sugar, brown-butter glaze on top.',
    tag: null,
    image: null,
    tone: '#E8D6C0',
    art: { kind: 'roll', seed: 9 },
  },
  {
    id: 'blueberry-crumb-muffin',
    name: 'Blueberry Crumb Muffin',
    category: 'loaves',
    price: 120,
    unit: 'each',
    description: 'Bursting with blueberries under a buttery streusel crown.',
    tag: null,
    image: null,
    tone: '#DCD6D9',
    art: { kind: 'muffin', seed: 14 },
  },
  {
    id: 'banana-walnut-loaf',
    name: 'Banana Walnut Loaf',
    category: 'loaves',
    price: 450,
    unit: 'loaf',
    description: 'Very ripe bananas, toasted walnuts and a crackly demerara top. Slices beautifully.',
    tag: null,
    image: null,
    tone: '#E9DAC0',
    art: { kind: 'loaf', seed: 18 },
  },
];
