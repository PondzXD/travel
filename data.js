/*
=========================================================
ข้อมูลเว็บไซต์ทั้งหมดอยู่ไฟล์นี้
เวลาจะเพิ่ม "จังหวัด" หรือ "สถานที่" ให้เพิ่มที่นี่เป็นหลัก
=========================================================
*/

const SITE_DATA = {
  regions: [
    {
      id: "north",
      name: { th: "ภาคเหนือ", en: "North" },
      icon: "⛰️",
      provinces: [
        { id: "chiang-mai", name: { th: "เชียงใหม่", en: "Chiang Mai" } },
        { id: "chiang-rai", name: { th: "เชียงราย", en: "Chiang Rai" } },
        { id: "lampang", name: { th: "ลำปาง", en: "Lampang" } },
        { id: "lamphun", name: { th: "ลำพูน", en: "Lamphun" } },
        { id: "mae-hong-son", name: { th: "แม่ฮ่องสอน", en: "Mae Hong Son" } },
        { id: "nan", name: { th: "น่าน", en: "Nan" } },
        { id: "phayao", name: { th: "พะเยา", en: "Phayao" } },
        { id: "phrae", name: { th: "แพร่", en: "Phrae" } },
        { id: "uttaradit", name: { th: "อุตรดิตถ์", en: "Uttaradit" } },
      ],
    },

    {
      id: "south",
      name: { th: "ภาคใต้", en: "South" },
      icon: "🌴",
      provinces: [
        { id: "krabi", name: { th: "กระบี่", en: "Krabi" } },
        { id: "chumphon", name: { th: "ชุมพร", en: "Chumphon" } },
        { id: "trang", name: { th: "ตรัง", en: "Trang" } },
        { id: "nakhon-si-thammarat", name: { th: "นครศรีธรรมราช", en: "Nakhon Si Thammarat" } },
        { id: "narathiwat", name: { th: "นราธิวาส", en: "Narathiwat" } },
        { id: "pattani", name: { th: "ปัตตานี", en: "Pattani" } },
        { id: "phang-nga", name: { th: "พังงา", en: "Phang Nga" } },
        { id: "phatthalung", name: { th: "พัทลุง", en: "Phatthalung" } },
        { id: "phuket", name: { th: "ภูเก็ต", en: "Phuket" } },
        { id: "yala", name: { th: "ยะลา", en: "Yala" } },
        { id: "ranong", name: { th: "ระนอง", en: "Ranong" } },
        { id: "songkhla", name: { th: "สงขลา", en: "Songkhla" } },
        { id: "satun", name: { th: "สตูล", en: "Satun" } },
        { id: "surat-thani", name: { th: "สุราษฎร์ธานี", en: "Surat Thani" } },
      ],
    },

    {
      id: "east",
      name: { th: "ภาคตะวันออก", en: "East" },
      icon: "🌊",
      provinces: [
        { id: "chanthaburi", name: { th: "จันทบุรี", en: "Chanthaburi" } },
        { id: "chachoengsao", name: { th: "ฉะเชิงเทรา", en: "Chachoengsao" } },
        { id: "chonburi", name: { th: "ชลบุรี", en: "Chonburi" } },
        { id: "trat", name: { th: "ตราด", en: "Trat" } },
        { id: "prachinburi", name: { th: "ปราจีนบุรี", en: "Prachinburi" } },
        { id: "rayong", name: { th: "ระยอง", en: "Rayong" } },
        { id: "sa-kaeo", name: { th: "สระแก้ว", en: "Sa Kaeo" } },
      ],
    },

    {
      id: "west",
      name: { th: "ภาคตะวันตก", en: "West" },
      icon: "🌄",
      provinces: [
        { id: "kanchanaburi", name: { th: "กาญจนบุรี", en: "Kanchanaburi" } },
        { id: "tak", name: { th: "ตาก", en: "Tak" } },
        { id: "prachuap-khiri-khan", name: { th: "ประจวบคีรีขันธ์", en: "Prachuap Khiri Khan" } },
        { id: "phetchaburi", name: { th: "เพชรบุรี", en: "Phetchaburi" } },
        { id: "ratchaburi", name: { th: "ราชบุรี", en: "Ratchaburi" } },
      ],
    },
  ],

  /*
  =========================================================
  วิธีเพิ่มสถานที่ใหม่
  copy object ตัวอย่างด้านล่าง แล้วเปลี่ยนข้อมูล

  {
    id: "unique-place-id",
    regionId: "south",
    provinceId: "phatthalung",
    category: "nature", // nature | history | activity

    name: {
      th: "ชื่อภาษาไทย",
      en: "English Name"
    },

    district: {
      th: "อำเภอ...",
      en: "District..."
    },

    description: {
      th: "รายละเอียดภาษาไทย",
      en: "English description"
    },

    address: {
      th: "ที่อยู่ภาษาไทย",
      en: "English address"
    },

    hours: {
      th: "08:00–17:00",
      en: "08:00–17:00"
    },

    phone: "012 345 6789",
    rating: 4.5,
    reviewCount: "120+",

    // ใส่ URL รูปจริงตรงนี้ได้
    image: "https://example.com/photo.jpg",

    // ถ้าไม่มี image จะแสดง emoji แทน
    icon: "🌿",

    // Google Maps
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=...",
    embedUrl: "https://www.google.com/maps?q=...&output=embed"
  }
  =========================================================
  */

  places: [
    // =====================================================
    // ภาคใต้ > พัทลุง > ธรรมชาติ
    // =====================================================

    {
      id: "thale-noi",
      lat: 7.7715,
      lng: 100.143,
      regionId: "south",
      provinceId: "phatthalung",
      category: "nature",

      name: {
        th: "ทะเลน้อย",
        en: "Thale Noi Bird Watching Park",
      },

      district: {
        th: "ควนขนุน",
        en: "Khuan Khanun",
      },

      description: {
        th: "พื้นที่ชุ่มน้ำชื่อดังของพัทลุง เหมาะกับการล่องเรือชมบัว ดูนก และสัมผัสวิถีชุมชนรอบทะเลน้อย",
        en: "A famous wetland in Phatthalung, known for boat trips, lotus fields, bird watching, and local community life.",
      },

      address: {
        th: "ต.พนางตุง อ.ควนขนุน จ.พัทลุง",
        en: "Phanang Tung, Khuan Khanun, Phatthalung",
      },

      hours: {
        th: "ประมาณ 05:00–17:00",
        en: "Approx. 05:00–17:00",
      },

      phone: "—",
      rating: 4.4,
      reviewCount: "1.6K+",

      image: "",

      // รูปสำหรับแกลเลอรีในหน้ารายละเอียด
      gallery: [
        "./images/phatthalung/thale-noi-1.jpg",
        "./images/phatthalung/thale-noi-2.jpg",
        "./images/phatthalung/thale-noi-3.jpg",
      ],
      icon: "🌿",

      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=%E0%B8%97%E0%B8%B0%E0%B9%80%E0%B8%A5%E0%B8%99%E0%B9%89%E0%B8%AD%E0%B8%A2+%E0%B8%9E%E0%B8%B1%E0%B8%97%E0%B8%A5%E0%B8%B8%E0%B8%87",

      embedUrl:
        "https://www.google.com/maps?q=%E0%B8%97%E0%B8%B0%E0%B9%80%E0%B8%A5%E0%B8%99%E0%B9%89%E0%B8%AD%E0%B8%A2+%E0%B8%9E%E0%B8%B1%E0%B8%97%E0%B8%A5%E0%B8%B8%E0%B8%87&output=embed",
    },

    {
      id: "khao-pu-khao-ya",
      lat: 7.606,
      lng: 99.958,
      regionId: "south",
      provinceId: "phatthalung",
      category: "nature",

      name: {
        th: "อุทยานแห่งชาติเขาปู่–เขาย่า",
        en: "Khao Pu - Khao Ya National Park",
      },

      district: {
        th: "ศรีบรรพต",
        en: "Si Banphot",
      },

      description: {
        th: "อุทยานแห่งชาติที่มีป่าดิบชื้น น้ำตก และเส้นทางศึกษาธรรมชาติ เหมาะกับผู้ที่ชอบเดินป่าและธรรมชาติ",
        en: "A national park featuring rainforest, waterfalls, and nature trails for hikers and outdoor travelers.",
      },

      address: {
        th: "ต.เขาปู่ อ.ศรีบรรพต จ.พัทลุง",
        en: "Khao Pu, Si Banphot, Phatthalung",
      },

      hours: {
        th: "08:30–16:30",
        en: "08:30–16:30",
      },

      phone: "093 578 9749",
      rating: 4.3,
      reviewCount: "1K+",

      image: "",

      // รูปสำหรับแกลเลอรีในหน้ารายละเอียด
      gallery: [
        "./images/phatthalung/khao-pu-khao-ya-1.jpg",
        "./images/phatthalung/khao-pu-khao-ya-2.jpg",
        "./images/phatthalung/khao-pu-khao-ya-3.jpg",
      ],
      icon: "🌳",

      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Khao+Pu+Khao+Ya+National+Park",

      embedUrl:
        "https://www.google.com/maps?q=Khao+Pu+Khao+Ya+National+Park&output=embed",
    },

    {
      id: "khao-khram-waterfall",
      lat: 7.548,
      lng: 99.994,
      regionId: "south",
      provinceId: "phatthalung",
      category: "nature",

      name: {
        th: "น้ำตกเขาคราม",
        en: "Khao Khram Waterfall",
      },

      district: {
        th: "ศรีนครินทร์",
        en: "Srinagarindra",
      },

      description: {
        th: "น้ำตกบรรยากาศร่มรื่น รายล้อมด้วยพื้นที่สีเขียว เหมาะสำหรับพักผ่อน เล่นน้ำ และถ่ายรูป",
        en: "A refreshing waterfall surrounded by greenery, suitable for relaxing, swimming, and photography.",
      },

      address: {
        th: "ต.บ้านนา อ.ศรีนครินทร์ จ.พัทลุง",
        en: "Ban Na, Srinagarindra, Phatthalung",
      },

      hours: {
        th: "ประมาณ 09:00–17:00",
        en: "Approx. 09:00–17:00",
      },

      phone: "—",
      rating: 4.6,
      reviewCount: "200+",

      image: "",

      // รูปสำหรับแกลเลอรีในหน้ารายละเอียด
      gallery: [
        "./images/phatthalung/khao-khram-waterfall-1.jpg",
        "./images/phatthalung/khao-khram-waterfall-2.jpg",
        "./images/phatthalung/khao-khram-waterfall-3.jpg",
      ],
      icon: "💧",

      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Khao+Khram+Waterfall+Phatthalung",

      embedUrl:
        "https://www.google.com/maps?q=Khao+Khram+Waterfall+Phatthalung&output=embed",
    },


    // =====================================================
    // ภาคใต้ > พัทลุง > ประวัติศาสตร์
    // =====================================================

    {
      id: "wat-khuha-sawan",
      lat: 7.6178,
      lng: 100.077,
      regionId: "south",
      provinceId: "phatthalung",
      category: "history",

      name: {
        th: "วัดคูหาสวรรค์",
        en: "Wat Khuha Sawan",
      },

      district: {
        th: "เมืองพัทลุง",
        en: "Mueang Phatthalung",
      },

      description: {
        th: "วัดและถ้ำสำคัญของเมืองพัทลุง ภายในมีพระพุทธรูปและร่องรอยทางประวัติศาสตร์ที่น่าสนใจ",
        en: "An important temple and cave in Phatthalung featuring Buddha images and notable historical traces.",
      },

      address: {
        th: "ถ.ราเมศวร์ ต.คูหาสวรรค์ อ.เมืองพัทลุง จ.พัทลุง",
        en: "Rames Road, Khuha Sawan, Mueang Phatthalung, Phatthalung",
      },

      hours: {
        th: "ตรวจสอบก่อนเดินทาง",
        en: "Check before visiting",
      },

      phone: "—",
      rating: 4.4,
      reviewCount: "300+",

      image: "",

      // รูปสำหรับแกลเลอรีในหน้ารายละเอียด
      gallery: [
        "./images/phatthalung/wat-khuha-sawan-1.jpg",
        "./images/phatthalung/wat-khuha-sawan-2.jpg",
        "./images/phatthalung/wat-khuha-sawan-3.jpg",
      ],
      icon: "🛕",

      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Wat+Khuha+Sawan+Phatthalung",

      embedUrl:
        "https://www.google.com/maps?q=Wat+Khuha+Sawan+Phatthalung&output=embed",
    },

    {
      id: "phatthalung-governor-residence",
      lat: 7.617,
      lng: 100.074,
      regionId: "south",
      provinceId: "phatthalung",
      category: "history",

      name: {
        th: "วังเจ้าเมืองพัทลุง",
        en: "Residence of Phatthalung Governor",
      },

      district: {
        th: "เมืองพัทลุง",
        en: "Mueang Phatthalung",
      },

      description: {
        th: "วังเก่า–วังใหม่ อดีตที่พักของเจ้าเมืองพัทลุง เหมาะสำหรับเรียนรู้ประวัติศาสตร์และสถาปัตยกรรมท้องถิ่น",
        en: "Historic governor residences known as the old and new palaces, showcasing local history and architecture.",
      },

      address: {
        th: "ต.ลำปำ อ.เมืองพัทลุง จ.พัทลุง",
        en: "Lampam, Mueang Phatthalung, Phatthalung",
      },

      hours: {
        th: "ตรวจสอบก่อนเดินทาง",
        en: "Check before visiting",
      },

      phone: "—",
      rating: 4.5,
      reviewCount: "40+",

      image: "",

      // รูปสำหรับแกลเลอรีในหน้ารายละเอียด
      gallery: [
        "./images/phatthalung/governor-residence-1.jpg",
        "./images/phatthalung/governor-residence-2.jpg",
        "./images/phatthalung/governor-residence-3.jpg",
      ],
      icon: "🏛️",

      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Residence+of+Phatthalung+Governor",

      embedUrl:
        "https://www.google.com/maps?q=Residence+of+Phatthalung+Governor&output=embed",
    },

    {
      id: "wat-wang",
      lat: 7.6105,
      lng: 100.081,
      regionId: "south",
      provinceId: "phatthalung",
      category: "history",

      name: {
        th: "วัดวัง",
        en: "Wat Wang",
      },

      district: {
        th: "เมืองพัทลุง",
        en: "Mueang Phatthalung",
      },

      description: {
        th: "วัดเก่าใกล้วังเจ้าเมือง มีจิตรกรรมฝาผนังและงานศิลปกรรมที่สะท้อนวัฒนธรรมท้องถิ่น",
        en: "A historic temple near the governor residence, known for murals and traditional local artwork.",
      },

      address: {
        th: "ถ.อภัยบริรักษ์ ต.ลำปำ อ.เมืองพัทลุง จ.พัทลุง",
        en: "Aphai Borirak Road, Lampam, Mueang Phatthalung, Phatthalung",
      },

      hours: {
        th: "ประมาณ 08:30–17:00",
        en: "Approx. 08:30–17:00",
      },

      phone: "—",
      rating: 4.5,
      reviewCount: "100+",

      image: "",

      // รูปสำหรับแกลเลอรีในหน้ารายละเอียด
      gallery: [
        "./images/phatthalung/wat-wang-1.jpg",
        "./images/phatthalung/wat-wang-2.jpg",
        "./images/phatthalung/wat-wang-3.jpg",
      ],
      icon: "🏯",

      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Wat+Wang+Phatthalung",

      embedUrl:
        "https://www.google.com/maps?q=Wat+Wang+Phatthalung&output=embed",
    },


    // =====================================================
    // ภาคใต้ > พัทลุง > ที่เที่ยว & กิจกรรม
    // =====================================================

    {
      id: "lad-tainod",
      lat: 7.647,
      lng: 100.102,
      regionId: "south",
      provinceId: "phatthalung",
      category: "activity",

      name: {
        th: "หลาดใต้โหนด",
        en: "Lad Tainod Green Market",
      },

      district: {
        th: "ควนขนุน",
        en: "Khuan Khanun",
      },

      description: {
        th: "ตลาดสีเขียวที่รวมอาหารพื้นบ้าน ขนม งานคราฟต์ และสินค้าท้องถิ่น เหมาะกับการเดินชิมและสัมผัสวิถีชุมชน",
        en: "A green market featuring local food, desserts, crafts, and community products.",
      },

      address: {
        th: "บ้านศาลาม่วง ต.ดอนทราย อ.ควนขนุน จ.พัทลุง",
        en: "Ban Sala Muang, Don Sai, Khuan Khanun, Phatthalung",
      },

      hours: {
        th: "อาทิตย์ ประมาณ 08:00–17:00",
        en: "Sunday approx. 08:00–17:00",
      },

      phone: "074 673 616",
      rating: 4.4,
      reviewCount: "1.9K+",

      image: "",

      // รูปสำหรับแกลเลอรีในหน้ารายละเอียด
      gallery: [
        "./images/phatthalung/lad-tainod-1.jpg",
        "./images/phatthalung/lad-tainod-2.jpg",
        "./images/phatthalung/lad-tainod-3.jpg",
      ],
      icon: "🧺",

      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Lad+Tainod+Phatthalung",

      embedUrl:
        "https://www.google.com/maps?q=Lad+Tainod+Phatthalung&output=embed",
    },

    {
      id: "napokae",
      lat: 7.625,
      lng: 100.09,
      regionId: "south",
      provinceId: "phatthalung",
      category: "activity",

      name: {
        th: "นาโปแก",
        en: "Napokae Learning & Tourism Center",
      },

      district: {
        th: "ควนขนุน",
        en: "Khuan Khanun",
      },

      description: {
        th: "แหล่งเรียนรู้วิถีชาวนา มีทุ่งนา คาเฟ่ ศาลาไม้ สินค้าพื้นบ้าน และจุดถ่ายรูปสำหรับครอบครัว",
        en: "A rice-farming learning center with fields, café, wooden pavilions, local products, and family photo spots.",
      },

      address: {
        th: "ต.มะกอกเหนือ อ.ควนขนุน จ.พัทลุง",
        en: "Makok Nuea, Khuan Khanun, Phatthalung",
      },

      hours: {
        th: "ประมาณ 08:30–18:30",
        en: "Approx. 08:30–18:30",
      },

      phone: "062 591 6632",
      rating: 4.5,
      reviewCount: "Popular",

      image: "",

      // รูปสำหรับแกลเลอรีในหน้ารายละเอียด
      gallery: [
        "./images/phatthalung/napokae-1.jpg",
        "./images/phatthalung/napokae-2.jpg",
        "./images/phatthalung/napokae-3.jpg",
      ],
      icon: "🌾",

      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Napokae+Phatthalung",

      embedUrl:
        "https://www.google.com/maps?q=Napokae+Phatthalung&output=embed",
    },

    {
      id: "delong-garden",
      lat: 7.635,
      lng: 100.086,
      regionId: "south",
      provinceId: "phatthalung",
      category: "activity",

      name: {
        th: "เดอลองการ์เด้น",
        en: "Delong Garden",
      },

      district: {
        th: "เมืองพัทลุง",
        en: "Mueang Phatthalung",
      },

      description: {
        th: "สถานที่ท่องเที่ยวและกิจกรรมสำหรับครอบครัว มีคาเฟ่ ของฝาก จุดถ่ายรูป และพื้นที่พักผ่อน",
        en: "A family-friendly attraction with a café, souvenirs, photo spots, and leisure areas.",
      },

      address: {
        th: "ต.นาโหนด อ.เมืองพัทลุง จ.พัทลุง",
        en: "Na Not, Mueang Phatthalung, Phatthalung",
      },

      hours: {
        th: "ประมาณ 08:00–18:00",
        en: "Approx. 08:00–18:00",
      },

      phone: "085 366 6661",
      rating: 4.6,
      reviewCount: "800+",

      image: "",

      // รูปสำหรับแกลเลอรีในหน้ารายละเอียด
      gallery: [
        "./images/phatthalung/delong-garden-1.jpg",
        "./images/phatthalung/delong-garden-2.jpg",
        "./images/phatthalung/delong-garden-3.jpg",
      ],
      icon: "🎡",

      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Delong+Garden+Phatthalung",

      embedUrl:
        "https://www.google.com/maps?q=Delong+Garden+Phatthalung&output=embed",
    },
  ],
};


/*
=========================================================
ข้อความสำหรับระบบ TH / ENG
ปกติไม่ต้องแก้ เว้นแต่ต้องการเปลี่ยนข้อความหน้าเว็บ
=========================================================
*/
const TRANSLATIONS = {
  th: {
    siteName: "แนะนำสถานที่ท่องเที่ยวในประเทศไทย",
    home: "หน้าแรก",
    destinations: "สถานที่ท่องเที่ยว",
    regions: "เลือกภาค",
    reviews: "รีวิว",
    about: "เกี่ยวกับเรา",

    heroKicker: "EXPLORE THAILAND",
    heroTitle: "ออกเดินทาง<br>ค้นพบประเทศไทย",
    heroAccent: "ในแบบของคุณ",
    heroDescription:
      "ค้นหาสถานที่ท่องเที่ยวทั่วประเทศไทย เลือกจากภาค จังหวัด และหมวดหมู่ พร้อมข้อมูลสำคัญ รีวิว และแผนที่สำหรับการเดินทาง",

    searchPlaceholder: "ค้นหาชื่อสถานที่ จังหวัด หรือหมวดหมู่...",
    searchButton: "ค้นหา",

    chooseRegion: "เลือกภาคที่ต้องการเที่ยว",
    chooseRegionSub: "เลือกภาคก่อน แล้วเลือกจังหวัดเพื่อดูสถานที่ท่องเที่ยว",
    chooseProvince: "เลือกจังหวัด",

    placesTitle: "สถานที่แนะนำ",
    placesSub: "เลือกจังหวัดและหมวดหมู่เพื่อดูสถานที่",

    categoryAll: "ทั้งหมด",
    categoryNature: "ธรรมชาติ",
    categoryHistory: "ประวัติศาสตร์",
    categoryActivity: "ที่เที่ยว & กิจกรรม",

    noData: "จังหวัดนี้ยังไม่มีข้อมูลสถานที่",
    noDataSub: "สามารถเพิ่มข้อมูลใหม่ได้ที่ไฟล์ data.js",

    address: "ที่อยู่",
    hours: "เวลา",
    phone: "โทร",
    rating: "คะแนน",
    map: "เปิด Google Maps",
  },

  en: {
    siteName: "Thailand Travel Recommendations",
    home: "Home",
    destinations: "Destinations",
    regions: "Regions",
    reviews: "Reviews",
    about: "About",

    heroKicker: "EXPLORE THAILAND",
    heroTitle: "Start Your Journey<br>Discover Thailand",
    heroAccent: "Your Way",
    heroDescription:
      "Explore destinations across Thailand by region, province, and category, with useful details, reviews, and maps.",

    searchPlaceholder: "Search place, province, or category...",
    searchButton: "Search",

    chooseRegion: "Choose a Region",
    chooseRegionSub: "Select a region first, then choose a province.",
    chooseProvince: "Choose a Province",

    placesTitle: "Recommended Places",
    placesSub: "Select a province and category to explore destinations.",

    categoryAll: "All",
    categoryNature: "Nature",
    categoryHistory: "History",
    categoryActivity: "Attractions & Activities",

    noData: "No destination data for this province yet.",
    noDataSub: "You can add new data in data.js",

    address: "Address",
    hours: "Hours",
    phone: "Phone",
    rating: "Rating",
    map: "Open Google Maps",
  },
};
