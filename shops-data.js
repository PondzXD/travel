
/*
=========================================================
ข้อมูลร้านค้าเริ่มต้น
=========================================================
ร้านค้าจะผูกกับสถานที่ด้วย nearbyPlaceIds

ตัวอย่าง:
nearbyPlaceIds: ["thale-noi", "napokae"]

หมายความว่าร้านนี้จะแสดงเป็นร้านค้าใกล้เคียง
ของทะเลน้อยและนาโปแก
=========================================================
*/

const DEFAULT_SHOPS = [
  {
    id: "thale-noi-local-shop",
    nearbyPlaceIds: ["thale-noi"],

    name: {
      th: "ร้านของฝากชุมชนทะเลน้อย",
      en: "Thale Noi Community Shop"
    },

    type: {
      th: "ของฝาก & สินค้าชุมชน",
      en: "Souvenir & Local Products"
    },

    description: {
      th: "ร้านตัวอย่างสำหรับแสดงระบบร้านค้าใกล้สถานที่ มีของฝาก สินค้าชุมชน และผลิตภัณฑ์ท้องถิ่น",
      en: "Demo nearby shop featuring souvenirs and local community products."
    },

    products: {
      th: "ของฝาก ผลิตภัณฑ์จักสาน อาหารพื้นบ้าน และสินค้าชุมชน",
      en: "Souvenirs, woven products, local food, and community products."
    },

    productItems: [
      {
        id: "woven-bag",
        name: { th: "กระเป๋าจักสาน", en: "Woven Bag" },
        price: 250,
        description: { th: "สินค้าชุมชนงานจักสาน", en: "Local handmade woven product" },
        image: ""
      },
      {
        id: "local-snack",
        name: { th: "ขนมพื้นบ้าน", en: "Local Snack" },
        price: 60,
        description: { th: "ขนมพื้นบ้านสำหรับเป็นของฝาก", en: "Traditional local snack" },
        image: ""
      }
    ],

    address: {
      th: "บริเวณใกล้ทะเลน้อย อ.ควนขนุน จ.พัทลุง",
      en: "Near Thale Noi, Khuan Khanun, Phatthalung"
    },

    contact: {
      phone: "—",
      facebook: "",
      line: "",
      website: ""
    },

    hours: {
      th: "ประมาณ 08:00–17:00",
      en: "Approx. 08:00–17:00"
    },

    openTime: "08:00",
    closeTime: "17:00",

    rating: 4.5,
    reviewCount: "120+",

    image: "",
    gallery: [],
    icon: "🛍️",

    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Thale+Noi+Phatthalung",
    embedUrl: "https://www.google.com/maps?q=Thale+Noi+Phatthalung&output=embed",

    lat: 7.7715,
    lng: 100.1430,

    visible: true
  },

  {
    id: "napokae-cafe-demo",
    nearbyPlaceIds: ["napokae"],

    name: {
      th: "คาเฟ่ใกล้นาโปแก",
      en: "Cafe near Napokae"
    },

    type: {
      th: "คาเฟ่ & เครื่องดื่ม",
      en: "Cafe & Drinks"
    },

    description: {
      th: "ร้านตัวอย่างสำหรับระบบร้านค้าใกล้นาโปแก สามารถแก้ไขหรือลบจากหลังบ้านได้",
      en: "Demo cafe near Napokae. You can edit or remove this shop from Admin."
    },

    products: {
      th: "กาแฟ เครื่องดื่ม ขนม และอาหารว่าง",
      en: "Coffee, drinks, desserts, and snacks."
    },

    productItems: [
      {
        id: "iced-coffee",
        name: { th: "กาแฟเย็น", en: "Iced Coffee" },
        price: 65,
        description: { th: "กาแฟเย็นสูตรของร้าน", en: "House iced coffee" },
        image: ""
      },
      {
        id: "cake",
        name: { th: "เค้ก", en: "Cake" },
        price: 89,
        description: { th: "เค้กและของหวาน", en: "Cake and dessert" },
        image: ""
      }
    ],

    address: {
      th: "อ.ควนขนุน จ.พัทลุง",
      en: "Khuan Khanun, Phatthalung"
    },

    contact: {
      phone: "—",
      facebook: "",
      line: "",
      website: ""
    },

    hours: {
      th: "ประมาณ 09:00–18:00",
      en: "Approx. 09:00–18:00"
    },

    openTime: "09:00",
    closeTime: "18:00",

    rating: 4.4,
    reviewCount: "80+",

    image: "",
    gallery: [],
    icon: "☕",

    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Napokae+Phatthalung",
    embedUrl: "https://www.google.com/maps?q=Napokae+Phatthalung&output=embed",

    lat: 7.6250,
    lng: 100.0900,

    visible: true
  }
];
