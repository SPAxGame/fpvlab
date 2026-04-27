/**
 * Skrypt dodający produkty FPV do bazy danych.
 * Pobiera zdjęcia z CDN i aktualizuje data/products.json
 *
 * Uruchomienie: node scripts/add-products.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PRODUCTS_FILE = path.join(ROOT, 'data', 'products.json');
const IMAGES_DIR = path.join(ROOT, 'public', 'products');

// ─────────────────────────────────────────────────────────────────
// Image download map:  filename → sourceURL
// ─────────────────────────────────────────────────────────────────
const IMAGES = [
  // FRAMES
  ['rama-axisflying-manta-5-se-20260405-100001.jpg',
   'https://oscarliang.com/wp-content/uploads/2024/12/AxisFlying-Manta-5-SE-Frame-budget-5inch-fpv-drone.jpg'],
  ['rama-geprc-vapor-d5-5inch-20260405-100002.jpg',
   'https://oscarliang.com/wp-content/uploads/2025/04/GEPRC-Vapor-X5-D5-Frame-DJI-O4-Pro.jpg'],
  ['rama-tbs-source-one-v5-20260405-100003.jpg',
   'https://oscarliang.com/wp-content/uploads/2022/10/tbs-source-one-v5-fpv-drone-frame.jpg'],
  ['rama-flyfishrc-volador-vd5-20260405-100004.jpg',
   'https://oscarliang.com/wp-content/uploads/2023/04/FlyFish-Volador-VD5-Frames-builid.jpg'],
  // MOTORS
  ['silniki-t-motor-velox-v3-2207-1750kv-20260405-100005.jpg',
   'https://oscarliang.com/wp-content/uploads/2022/12/T-Motor-Velox-V3-V2207-1750Kv-Motor.jpg'],
  ['silniki-rcinpower-wasp-major-226-1860kv-20260405-100006.jpg',
   'https://oscarliang.com/wp-content/uploads/2022/09/RCINPOWER-Wasp-Major-22.6-6.5-1860KV-motor.jpg'],
  ['silniki-emax-eco-ii-2207-1900kv-20260405-100007.jpg',
   'https://oscarliang.com/wp-content/uploads/2020/07/EMAX-ECO-II-2207-motor.jpg'],
  ['silniki-iflight-xing2-2207-1855kv-20260405-100008.jpg',
   'https://oscarliang.com/wp-content/uploads/2022/03/iFlight-Xing2-2207-2306-motors-fpv-drone.jpg'],
  ['silniki-rcinpower-ex2207-2550kv-20260405-100009.jpg',
   'https://oscarliang.com/wp-content/uploads/2025/04/how-to-build-fpv-drone-2026-rcinpower-ex2207-motors.jpg'],
  // STACKS
  ['stack-speedybee-f405-mini-bls-35a-20260405-100010.jpg',
   'https://oscarliang.com/wp-content/uploads/2023/08/SpeedyBee-F405-Mini-Stack-flight-controller-esc.jpg'],
  ['stack-rushfpv-blade-f722-45a-20260405-100011.jpg',
   'https://oscarliang.com/wp-content/uploads/2021/06/RushFPV-Blade-f722-fc-analog-digital-top-connectors.jpg'],
  // VIDEO BUNDLES
  ['zestaw-video-dji-o3-air-unit-20260405-100012.jpg',
   'https://oscarliang.com/wp-content/uploads/2022/11/dji-o3-air-unit-vtx-video-transmitter.jpg'],
  ['zestaw-video-walksnail-avatar-hd-vtx-v2-20260405-100013.jpg',
   'https://oscarliang.com/wp-content/uploads/2023/03/Walksnail-Avatar-HD-Pro-V2-Kit-vtx-solder-pads-connector.jpg'],
  ['zestaw-video-walksnail-moonlight-kit-20260405-100014.jpg',
   'https://oscarliang.com/wp-content/uploads/2024/01/Walksnail-Moonlight-VTX-Camera-Kit-heatsink-25x25mm-mounting.jpg'],
  // CAMERAS
  ['kamera-foxeer-t-rex-micro-1200tvl-20260405-100015.jpg',
   'https://oscarliang.com/wp-content/uploads/2019/09/foxeer-t-rex-micro-fpv-camera.jpg'],
  ['kamera-caddx-ratel-2-1200tvl-20260405-100016.jpg',
   'https://oscarliang.com/wp-content/uploads/2019/09/caddx-ratel-2-fpv-camera.jpg'],
  ['kamera-foxeer-razer-micro-1200tvl-20260405-100017.jpg',
   'https://oscarliang.com/wp-content/uploads/2019/10/Foxeer-Razer-Micro-fpv-camera.jpg'],
  ['kamera-caddx-ant-lite-nano-1200tvl-20260405-100018.jpg',
   'https://oscarliang.com/wp-content/uploads/2024/05/caddx-ant-lite-nano-fpv-camera.jpg'],
  ['kamera-foxeer-predator-micro-v5-20260405-100019.jpg',
   'https://oscarliang.com/wp-content/uploads/2018/01/foxeer-predator-micro-fpv-camera.jpg'],
  ['kamera-runcam-night-eagle-3-20260405-100020.jpg',
   'https://oscarliang.com/wp-content/uploads/2024/04/runcam-night-eagle-3-fpv-camera-low-light.jpg'],
  // VTX
  ['nadajnik-vtx-tbs-unify-pro32-hv-1000mw-20260405-100021.jpg',
   'https://oscarliang.com/wp-content/uploads/2018/09/tbs-unify-pro32-hv-vtx-video-transmitter-mmcx.jpg'],
  ['nadajnik-vtx-rush-tank-ultimate-plus-800mw-20260405-100022.jpg',
   'https://oscarliang.com/wp-content/uploads/2019/12/RUSH-TANK-PLUS-vtx-top.jpg'],
  ['nadajnik-vtx-eachine-tx805-800mw-20260405-100023.jpg',
   'https://oscarliang.com/wp-content/uploads/2019/03/Eachine-TX805-Video-Transmitter.jpg'],
  ['nadajnik-vtx-hglrc-zeus-nano-400mw-20260405-100024.jpg',
   'https://oscarliang.com/wp-content/uploads/2021/02/HGLRC-Zeus-Nano-vtx-top-heatsink.jpg'],
  ['nadajnik-vtx-tbs-unify-pro32-nano-500mw-20260405-100025.jpg',
   'https://oscarliang.com/wp-content/uploads/2018/09/tbs-unify-pro32-nano-vtx-video-transmitter-ufl-ipex.jpg'],
  // ANTENNAS
  ['antena-foxeer-lollipop-4-plus-rhcp-20260405-100026.jpg',
   'https://oscarliang.com/wp-content/uploads/2024/04/Foxeer-Lollipop-antenna-v4-4-plus.jpg'],
  ['antena-truerc-matchstick-rhcp-20260405-100027.jpg',
   'https://oscarliang.com/wp-content/uploads/2022/06/TrueRC-Matchstick-5.8ghz-fpv-antenna.jpg'],
  ['antena-foxeer-micro-lollipop-rhcp-20260405-100028.jpg',
   'https://oscarliang.com/wp-content/uploads/2024/04/Foxeer-Micro-Lollipop-antenna.jpg'],
  ['antena-truerc-singularity-short-ufl-20260405-100029.jpg',
   'https://oscarliang.com/wp-content/uploads/2024/04/TrueRC-Singularity-antenna-Short-40mm-UFL.jpg'],
  ['antena-truerc-singularity-stubby-rhcp-20260405-100030.jpg',
   'https://oscarliang.com/wp-content/uploads/2024/04/TrueRC-Singularity-antenna-Stubby-RHCP-sma.jpg'],
  ['antena-rush-cherry-rhcp-20260405-100031.jpg',
   'https://oscarliang.com/wp-content/uploads/2020/07/rush-cherry-fpv-antenna.jpg'],
  ['antena-lumenier-axii-2-rhcp-20260405-100032.jpg',
   'https://oscarliang.com/wp-content/uploads/2018/09/lumenier-axxi-2-fpv-5.8ghz-antenna.jpg'],
  ['antena-truerc-x-air-mkii-rhcp-20260405-100033.jpg',
   'https://oscarliang.com/wp-content/uploads/2023/02/truerc-x-air-5.8ghz-mkii-directional-patch-antenna-dji-goggles-2-fpv-front.jpg'],
  ['antena-foxeer-pagoda-pro-rhcp-20260405-100034.jpg',
   'https://oscarliang.com/wp-content/uploads/2017/05/Realacc-Pagoda-Antenna-top-bottom-connector.jpg'],
  // GPS
  ['modul-gps-hglrc-m100-mini-20260405-100035.jpg',
   'https://oscarliang.com/wp-content/uploads/2023/03/HGLRC-M100-Mini-gps-bottom.jpg'],
  ['modul-gps-flywoo-goku-gm10-nano-v3-20260405-100036.jpg',
   'https://oscarliang.com/wp-content/uploads/2023/03/flywoo-goku-gm10-nano-v3-gps-bottom-solder-pads.jpg'],
  // BUZZERS
  ['buzzer-vifly-finder-mini-3g-100db-20260405-100037.jpg',
   'https://oscarliang.com/wp-content/uploads/2021/02/ViFly-Finder-Mini-buzzer-size-compare-v2-beeper.jpg'],
  // BATTERIES
  ['akumulator-gnb-1300mah-6s-160c-lihv-20260405-100038.jpg',
   'https://oscarliang.com/wp-content/uploads/2024/12/GNB-6s-1300mah-160C-LiHV-battery.jpg'],
  ['akumulator-tattu-r-line-6s-1050mah-120c-20260405-100039.jpg',
   'https://oscarliang.com/wp-content/uploads/2024/12/tattu-r-line-6s-1050mah-120c-lipo-battery.jpg'],
  ['akumulator-dogcom-1500mah-6s-100c-20260405-100040.jpg',
   'https://oscarliang.com/wp-content/uploads/2023/01/dogcom-6s-4s-lipo-battery-fpv-drone.jpg'],
  ['akumulator-betafpv-lava-6s-1100mah-100c-20260405-100041.jpg',
   'https://oscarliang.com/wp-content/uploads/2024/12/betafpv-lava-6s-1100mah-100C-lipo-battery.jpg'],
];

// ─────────────────────────────────────────────────────────────────
// New products to add
// ─────────────────────────────────────────────────────────────────
let _ts = 1780000000000;
const nextId = () => `p-${_ts++}`;

const NEW_PRODUCTS = [

  // ────── FRAMES (+9) ──────
  {
    id: nextId(), inStock: true, category: 'frame',
    name: 'AxisFlying Manta 5 SE',
    price: 185,
    description: 'AxisFlying Manta 5 SE to lekka i budżetowa rama klasy 5 cali o układzie True-X. Wykonana z wysokiej jakości carbonu 3K, doskonała do freestyle i FPV cinematic. Montaż kamery: mikro (19 mm). Kompatybilna z systemem DJI O3/O4 oraz analogowym.',
    image: 'rama-axisflying-manta-5-se-20260405-100001.jpg',
    frameType: 'X', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'frame',
    name: 'GEPRC Vapor D5 5"',
    price: 249,
    description: 'GEPRC Vapor D5 to smukła rama 5-calowa klasy X, zaprojektowana specjalnie pod systemy cyfrowe DJI O3/O4 Pro. Wykonana z carbonu T700, zapewnia wyjątkową sztywność przy niskiej wadze 74 g. Posiada przestrzeń na elektronikę HD i wygodny dostęp do stosu FC/ESC.',
    image: 'rama-geprc-vapor-d5-5inch-20260405-100002.jpg',
    frameType: 'X', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'frame',
    name: 'TBS Source One V5 5"',
    price: 165,
    description: 'TBS Source One V5 to kultowa rama open-source w układzie True-X (235 mm), dostępna do dowolnego użytku. Ramiona 5 mm z carbonu 3K, bardzo dobra wytrzymałość na crash\'e. Popularna wśród pilotów freestyle i wyścigowych na całym świecie.',
    image: 'rama-tbs-source-one-v5-20260405-100003.jpg',
    frameType: 'X', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'frame',
    name: 'FlyFishRC Volador VD5',
    price: 195,
    description: 'FlyFishRC Volador VD5 to klasyczna 5-calowa rama o geometrii X (220 mm), idealna do freestyle. Ramiona o grubości 5 mm zapewniają doskonałą sztywność. Lekka konstrukcja (ok. 90 g), szeroka kompatybilność komponentów 30×30 mm.',
    image: 'rama-flyfishrc-volador-vd5-20260405-100004.jpg',
    frameType: 'X', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'frame',
    name: 'iFlight Cidora SL5-E V2 5"',
    price: 279,
    description: 'iFlight Cidora SL5-E V2 to 5-calowa rama HD o układzie DC (stretch-X), stworzona z myślą o nagrywaniu materiałów cinematic. Kompatybilna z kamerami DJI O3/O4 i GoPro Naked. Ramiona 4 mm, cały carbon T700.',
    frameType: 'DC', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'frame',
    name: 'Diatone Roma F5 V2 5"',
    price: 235,
    description: 'Diatone Roma F5 V2 łączy estetyczny design z wytrzymałością klasy wyścigowej. Układ True-X (215 mm), ramiona 6 mm, wbudowane otwory na kamery analogowe i micro HD. Jeden z najlepiej ocenianych frameów w swojej klasie cenowej.',
    frameType: 'X', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'frame',
    name: 'ImpulseRC Reverb HD 5"',
    price: 329,
    description: 'ImpulseRC Reverb HD to autorska rama premium klasy 5 cali z układem DC (stretch X), stworzona z myślą o nagrywaniu filmów HD z kamerami GoPro Naked lub DJI O3/O4. Grubość ramion 5 mm, carbon premium, elegancki wygląd.',
    frameType: 'DC', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'frame',
    name: 'SpeedyBee Master 5 HD V2',
    price: 220,
    description: 'SpeedyBee Master 5 HD V2 to 5-calowa rama all-in-one do HD freestyle. Układ X (225 mm), grubość ramion 5,5 mm. Kompatybilna z systemami cyfrowymi DJI, Walksnail i HDZero. Ideal do DJI O3/O4 i analogowych zestawów kamerowych.',
    frameType: 'X', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'frame',
    name: 'GEPRC Mark5 HD 5"',
    price: 259,
    description: 'GEPRC Mark5 HD to wytrzymała rama 5-calowa przeznaczona do montażu kamer HD. Układ True-X, ramiona 5 mm z T700 carbon. Posiada wbudowany slot na kamery DJI oraz otwory 30×30 mm na stack. Waga około 96 g bez śrub.',
    frameType: 'X', includesStraps: false,
  },

  // ────── MOTORS (+9) ──────
  {
    id: nextId(), inStock: true, category: 'motor',
    name: 'T-Motor Velox V3 2207 1750KV',
    price: 199,
    description: 'T-Motor Velox V3 2207 to wysokiej jakości silnik freestyle dla baterii 6S. KV: 1750, średnica/wysokość: 22×7 mm, masa: 34 g, max moc: 1350 W. Solidna konstrukcja, długa żywotność łożysk, doskonały stosunek mocy do wagi.',
    image: 'silniki-t-motor-velox-v3-2207-1750kv-20260405-100005.jpg',
    kv: 1750, includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'motor',
    name: 'RCINPower Wasp Major 22.6 1860KV',
    price: 185,
    description: 'RCINPower Wasp Major 22.6 to motor o niestandardowej geometrii 2206.5 (22.6×6.5 mm), oferujący wyjątkową efektywność i moc. KV: 1860, masa: 30.5 g. Doskonały do śmigieł 5 cali na bateriach 4S–6S. Bardzo popularny w segmencie freestyle.',
    image: 'silniki-rcinpower-wasp-major-226-1860kv-20260405-100006.jpg',
    kv: 1860, includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'motor',
    name: 'EMAX ECO II 2207 1900KV',
    price: 129,
    description: 'EMAX ECO II 2207 to budżetowy silnik wysokiej jakości. Rozmiar 2207, KV: 1900, idealny dla baterii 4S. Masa: 30 g, max moc: 950 W. Model polecany dla początkujących i pilotów szukających tanich ale niezawodnych silników do dronów freestyle 5".',
    image: 'silniki-emax-eco-ii-2207-1900kv-20260405-100007.jpg',
    kv: 1900, includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'motor',
    name: 'iFlight XING2 2207 1855KV',
    price: 219,
    description: 'iFlight XING2 2207 to ulepszona wersja popularnej serii XING. Rozmiar 2207, KV: 1855, masa: 32.9 g, max moc: 1252 W. Nowy układ wirnika z 12-biegunowym magnetycznym rdzeniem zapewnia płynne działanie i niski poziom hałasu. Idealny do 5" freestyle.',
    image: 'silniki-iflight-xing2-2207-1855kv-20260405-100008.jpg',
    kv: 1855, includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'motor',
    name: 'RCINPower EX2207 2550KV',
    price: 195,
    description: 'RCINPower EX2207 2550KV to wysokoobratrowy silnik stworzony z myślą o wyścigach i szybkim freestyle. Rozmiar 2207, KV: 2550, przeznaczony dla baterii 4S. Zaktualizowana geometria wirnika i cewek zwiększa wydajność w porównaniu z poprzednią generacją.',
    image: 'silniki-rcinpower-ex2207-2550kv-20260405-100009.jpg',
    kv: 2550, includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'motor',
    name: 'BrotherHobby Returner R5 2207 1700KV',
    price: 185,
    description: 'BrotherHobby Returner R5 2207 to starannie wykonany silnik klasy freestyle. KV: 1700, masa: 34 g, optymalny dla baterii 6S i śmigieł 5". Stator 9N12P z ulepszonymi uzwojeniami, łożyska NSK, zadbana jakość wykonania. Popularny wśród pilotów FPV.',
    kv: 1700, includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'motor',
    name: 'Foxeer Reaper 2207 1800KV',
    price: 189,
    description: 'Foxeer Reaper 2207 to solidny silnik do freestyle z KV 1800, idealny do 5S i 6S. Masa: 33 g, gwint M3 na wale, łożyska hybrydowe ceramic. Dobrze zbalansowany wirnik, niska temperatura pracy. Sprawdza się zarówno w codziennym lataniu jak i intensywnym freestyle.',
    kv: 1800, includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'motor',
    name: 'GEPRC GR2207 1850KV',
    price: 169,
    description: 'GEPRC GR2207 1850KV to wydajny silnik freestyle od renomowanego producenta. Masa: 33.5 g, napięcie 4S–6S, stator N52 neodymowy. Solidna konstrukcja z aluminiową podstawą, anodyzowany wirnik CNC. Doskonały wybór do dronów freestyle 5 cali.',
    kv: 1850, includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'motor',
    name: 'HGLRC Specter 2207 1750KV',
    price: 175,
    description: 'HGLRC Specter 2207 1750KV to silnik do freestyle i wyścigów na 6S. Masa: 33 g, max moc: 1300 W. Stator N52 z miedzianymi uzwojeniami OFC, wirnik CNC anodyzowany. Dobra efektywność w zakresie 0-100% mocy, niski poziom vibrations.',
    kv: 1750, includesStraps: false,
  },

  // ────── STACKS (+9) ──────
  {
    id: nextId(), inStock: true, category: 'stack',
    name: 'SpeedyBee F405 Mini BLS 35A',
    price: 299,
    description: 'SpeedyBee F405 Mini BLS 35A to kompaktowy stack FC+ESC w standardzie 20×20 mm. Kontroler lotu na STM32F405, ESC BLHeli_S 35A 4-in-1 na 2-6S. Bluetooth dla konfiguracji bez USB, kompatybilny z Betaflight. Idealny dla 3" i 5" dronów freestyle.',
    image: 'stack-speedybee-f405-mini-bls-35a-20260405-100010.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'stack',
    name: 'RushFPV Blade F7 FC + 45A ESC',
    price: 349,
    description: 'RushFPV Blade F7 to stack premium z kontrolerem lotu F7 dual gyro i 45A BLHeli_32 ESC. Obsługuje systemy cyfrowe i analogowe, posiada wyjście video OSD art. Napięcie 3-6S, styki pad-only dla łatwego montażu. Ceniona niezawodność w środowisku wyścigowym.',
    image: 'stack-rushfpv-blade-f722-45a-20260405-100011.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'stack',
    name: 'Holybro Kakute H7 Mini + Tekko32 35A',
    price: 379,
    description: 'Holybro Kakute H7 Mini to zaawansowany kontroler lotu STM32H743 z obsługą Betaflight, iNav i ArduCopter. Tekko32 F3 Metal 35A to ESC 4-in-1 BLHeli_32 klasy premium. Stack 20×20 mm, zasilanie 2-6S. Doskonały stosunek funkcji do ceny, popularny w freestyle i GPS.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'stack',
    name: 'Mamba F405 MK2 50A AIO',
    price: 289,
    description: 'Mamba F405 MK2 to all-in-one stack na STM32F405 z 50A 4-in-1 BLHeli_S ESC. Montaż 30×30 mm, napięcie 3-6S. Zintegrowana płyta ogranicza kable i upraszcza budowę. Jedna z najpopularniejszych opcji budżetowych dla entuzjastów 5" freestyle.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'stack',
    name: 'GEPRC F722 45A 4-in-1 Stack',
    price: 329,
    description: 'GEPRC F722 Stack to solidny zestaw FC+ESC na STM32F722 i ESC 45A BLHeli_32. Montaż 30×30 mm, kompatybilny z GPS i systemami cyfrowymi. Zintegrowane napięcie BEC 9V/12V dla VTX HD. Popularny w build\'ach freestyle z DJI i Walksnail.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'stack',
    name: 'iFlight SucceX-E F4 45A Stack',
    price: 289,
    description: 'iFlight SucceX-E F4 45A to popularny stack FC+ESC dla dronów freestyle 5". Kontroler lotu F4 z 8 portami UART, ESC 4-in-1 BLHeli_S 45A na 2-6S. Montaż 30×30 mm. Prosta instalacja, sprawdzona niezawodność w trudnych warunkach.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'stack',
    name: 'HGLRC Zeus F745 55A Stack',
    price: 375,
    description: 'HGLRC Zeus F745 to zaawansowany stack na podwójnym żyroskopie STM32F745 i 55A ESC 4-in-1 BLHeli_32 AM32. Obsługuje Betaflight, napięcie 4-6S. Dodatkowe pady 9V i 12V dla kamer i VTX HD. Dualna magistrala I2C dla GPS.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'stack',
    name: 'SpeedyBee F7 V3 55A Stack',
    price: 419,
    description: 'SpeedyBee F7 V3 to zaawansowany stack FC+ESC z STM32F745, 55A BLHeli_32 ESC na 4-6S. Wbudowany bluetooth, barometr i czujnik napięcia. Obsługuje DJI, Walksnail i analog. Montaż 30×30 mm. Świetna opcja dla zaawansowanych frameów HD freestyle.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'stack',
    name: 'Diatone Mamba F722 MK3 60A',
    price: 395,
    description: 'Diatone Mamba F722 MK3 to stack przeznaczony do ciężkich dronów freestyle 5-7". FC STM32F722, ESC 60A BLHeli_32 4-in-1 na 4-8S. Metalowe pady antykurzowe, montaż 30×30 mm. Idealny do aplikacji 6S/8S freestyle i wyścigów.',
    includesStraps: false,
  },

  // ────── VIDEO BUNDLES (+9) ──────
  {
    id: nextId(), inStock: true, category: 'video_bundle',
    name: 'DJI O3 Air Unit',
    price: 889,
    description: 'DJI O3 Air Unit to poprzednik DJI O4, nadal jeden z najlepszych systemów HD dla freestyle i cinematic. Kamera 4K@60fps z nagrywaniem onboard, zasięg do 10 km, opóźnienie 30 ms. Kompatybilny z DJI Goggles 2 i Goggles Integra. Waga systemu: 36.4 g.',
    image: 'zestaw-video-dji-o3-air-unit-20260405-100012.jpg',
    videoType: 'digital', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'video_bundle',
    name: 'Walksnail Avatar HD VTX Kit V2',
    price: 619,
    description: 'Walksnail Avatar HD VTX Kit V2 to popularny, budżetowy system cyfrowy HD. VTX z 32 GB pamięci wewnętrznej, kamera 1080p z niskim opóźnieniem. Kompatybilny z goglami Walksnail Avatar i niektórymi innymi. Montaż 20×20 mm i 25×25 mm. Waga: ~25 g.',
    image: 'zestaw-video-walksnail-avatar-hd-vtx-v2-20260405-100013.jpg',
    videoType: 'digital', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'video_bundle',
    name: 'Walksnail Avatar Moonlight Kit',
    price: 779,
    description: 'Walksnail Avatar Moonlight to system cyfrowy 4K z wyjątkową wydajnością przy słabym oświetleniu. Kamera z matrycą 1/1.8", nagrywanie 4K@60fps z Gyroflow. VTX z dwoma antenami dla lepszego zasięgu. Kompatybilny z goglami Walksnail HD. Waga zestawu: ~42 g.',
    image: 'zestaw-video-walksnail-moonlight-kit-20260405-100014.jpg',
    videoType: 'digital', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'video_bundle',
    name: 'DJI O4 Air Unit (Standard)',
    price: 949,
    description: 'DJI O4 Air Unit (wersja standard, bez Pro) to kompaktowy system cyfrowy HD z kamerą 1/2.3" CMOS, nagrywaniem 2.7K@60fps i zasięgiem do 13 km. Opóźnienie ok. 24 ms, waga 38.5 g. Kompatybilny z DJI Goggles 2 i RC Motion 3. Świetna opcja all-round.',
    videoType: 'digital', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'video_bundle',
    name: 'HDZero Race V2 Kit',
    price: 649,
    description: 'HDZero Race V2 to cyfrowy system FPV z zerowym opóźnieniem (sub-ms), idealny dla wyścigów i freestyle. Rozdzielczość 720p/60fps, transmisja w czasie rzeczywistym. Zestaw zawiera VTX i kamerę Runcam Nano 90. Kompatybilny z goglami HDZero.',
    videoType: 'digital', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'video_bundle',
    name: 'RunCam Link Wasp Kit',
    price: 379,
    description: 'RunCam Link Wasp Kit to zaawansowany zestaw analogowy z kamerą RunCam Racer 5 (1100TVL, FOV 155°) i nadajnikiem VTX 25-200mW na 5.8 GHz. Idealny do wyścigów FPV. Głęboki czerń w cieniu, szybka elektronika migawki. Waga: ~15 g.',
    videoType: 'analog', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'video_bundle',
    name: 'Zestaw analogowy: SpeedyBee TX800 + Foxeer Razer Micro + Antena',
    price: 249,
    description: 'Gotowy zestaw analogowy do drona freestyle: nadajnik SpeedyBee TX800 800mW + kamera Foxeer Razer Micro 1200TVL + antena Pagoda RHCP. Kompletne rozwiązanie do analogowego FPV w jednej skrzynce. Idealne dla początkujących i pilotów szukających prostej konfiguracji.',
    videoType: 'analog', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'video_bundle',
    name: 'Walksnail Avatar 1S Nano Lite Kit',
    price: 379,
    description: 'Walksnail Avatar 1S Nano Lite to lekki cyfrowy system HD dla micro dronów i tiny whoopów. VTX 8.7 g, kamera nano 1.5 g, łączna waga ~10 g. Nagrywanie 720p/1080p z 8 GB pamięci onboard. Zasilanie 1S (3.1–5V). Świetny wybór do smallest FPV builds.',
    videoType: 'digital', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'video_bundle',
    name: 'Zestaw budżetowy: Eachine TX805 + Foxeer Razer Nano + Dipol',
    price: 149,
    description: 'Najtańszy sprawdzony zestaw analogowy do drona FPV: nadajnik Eachine TX805 800mW + kamera Foxeer Razer Nano 1200TVL + antena dopolarna dipol. Doskonały wybór do pierwszego build\'u FPV lub jako zestaw zapasowy. Waga: ~18 g.',
    videoType: 'analog', includesStraps: false,
  },

  // ────── CAMERAS (+10) ──────
  {
    id: nextId(), inStock: true, category: 'camera',
    name: 'Foxeer T-Rex Micro 1200TVL',
    price: 85,
    description: 'Foxeer T-Rex Micro to jedna z najostrzejszych kamer analogowych FPV dostępnych na rynku. Rozmiar micro (19×19 mm), sensor 1/2" StarLight Plus, 1200 TVL, FOV 130°. Doskonała jakość obrazu w dzień i w nocy. Napięcie 5–40V.',
    image: 'kamera-foxeer-t-rex-micro-1200tvl-20260405-100015.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'camera',
    name: 'Caddx Ratel 2 Micro 1200TVL',
    price: 95,
    description: 'Caddx Ratel 2 Micro to popularna kamera startlight z matrycą STARVIS 1/1.8". Rozmiar micro (19 mm), FOV 155° (2.1 mm), 1200 TVL, szeroki zakres dynamiczny WDR. Naturalne kolory, minimalne szumy w słabym świetle. Napięcie 5–36V. Łatwy montaż.',
    image: 'kamera-caddx-ratel-2-1200tvl-20260405-100016.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'camera',
    name: 'Foxeer Razer Micro 1200TVL',
    price: 75,
    description: 'Foxeer Razer Micro to budżetowa kamera FPV z sensorem SuperNight. Rozmiar micro (19 mm), FOV 120°/145° (do wyboru), 1200 TVL. Najlepsza cena w tej klasie kamery micro. Napięcie 5–40V, waga 10 g. Idealna dla zaczynających przygodę z FPV.',
    image: 'kamera-foxeer-razer-micro-1200tvl-20260405-100017.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'camera',
    name: 'Caddx Ant Lite Nano 1200TVL',
    price: 65,
    description: 'Caddx Ant Lite Nano to ultralekka kamera nano (14×14 mm) przeznaczona do micro dronów i TinyWhoop. Sensor 1/3", FOV 150°, 1200 TVL, waga zaledwie 4 g. Wbudowana w wiele BNF modeli jako kamera domyślna. Napięcie 5–36V.',
    image: 'kamera-caddx-ant-lite-nano-1200tvl-20260405-100018.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'camera',
    name: 'Foxeer Predator Micro V5 1000TVL',
    price: 90,
    description: 'Foxeer Predator Micro V5 to kamera wyścigowa z niskim opóźnieniem i wysokim kontrastem, najlepsza dla pilotów skupionych na szybkości. Rozmiar micro (19 mm), sensor globalny Super WDR, FOV 128°, 1000 TVL. Żywe kolory, ostre krawędzie obiektów.',
    image: 'kamera-foxeer-predator-micro-v5-20260405-100019.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'camera',
    name: 'RunCam Night Eagle 3 1200TVL',
    price: 119,
    description: 'RunCam Night Eagle 3 to czarno-biała kamera FPV z wyjątkową czułością na światło, idealna do nocnych lotów. Sensor STARVIS Gen3 1/2", 1200 TVL, FOV 155°, min. czułość 0.00001 Lux. Najlepsze w klasie widzenie nocne w środowisku analogowym.',
    image: 'kamera-runcam-night-eagle-3-20260405-100020.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'camera',
    name: 'Foxeer Arrow Micro Pro 1200TVL',
    price: 85,
    description: 'Foxeer Arrow Micro Pro to analogowa kamera FPV z wyjątkowym WDR i kolorowymi tonami. Sensor 1/2.9" CMOS, 1200 TVL, FOV 115°, rozmiar micro (19 mm). Napięcie 5–40V, waga 9.6 g. Bardzo dobra jakość obrazu na treningach freestyle.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'camera',
    name: 'RunCam Phoenix 2 Micro 1000TVL',
    price: 109,
    description: 'RunCam Phoenix 2 Micro to kamera FPV do freestyle i racing z ultra-low latency i szerokim WDR. Sensor 1/2" CMOS, 1000 TVL, FOV 155° (2.1 mm), rozmiar micro (19 mm). Jedno z najniższych opóźnień w klasie analogowej. Napięcie 5–36V.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'camera',
    name: 'Caddx Ratel Pro Micro 1200TVL',
    price: 105,
    description: 'Caddx Ratel Pro Micro to ulepszona wersja Ratel 2 z lepszą wydajnością w słabym oświetleniu. Sensor 1/1.8" StarLight, FOV 160° (1.8 mm), 1200 TVL, rozmiar micro. WDR 130 dB, cyfrowy reduktor szumów. Jeden z najlepszych wyborów dla freestyle dzień/noc.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'camera',
    name: 'Foxeer Cat 3 Micro 1200TVL',
    price: 79,
    description: 'Foxeer Cat 3 Micro to kompaktowa kamera do budżetowych dronów FPV. Sensor 1/3" CMOS, 1200 TVL, FOV 130°, rozmiar micro (19 mm). Minimalna czułość 0.0001 Lux, wbudowany filtr IR. Prosta instalacja, niska waga 10 g. Napięcie 5–40V.',
    includesStraps: false,
  },

  // ────── VTX (+9) ──────
  {
    id: nextId(), inStock: true, category: 'vtx',
    name: 'TBS Unify Pro32 HV 1000mW',
    price: 219,
    description: 'TBS Unify Pro32 HV to topowy nadajnik VTX marki Team BlackSheep. Moc 25–1000 mW, pasmo 5.8 GHz, 48 kanałów. Obsługa SmartAudio V2, złącze MMCX. Napięcie 5–26V (HV). Masa 7 g. Doskonała jakość sygnału i stabilność częstotliwości. Klasa premium.',
    image: 'nadajnik-vtx-tbs-unify-pro32-hv-1000mw-20260405-100021.jpg',
    videoType: 'analog', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'vtx',
    name: 'Rush Tank Ultimate Plus 800mW',
    price: 165,
    description: 'Rush Tank Ultimate Plus to niezawodny VTX analogowy z mocą 25–800 mW i wbudowanym mikrofonem. Pasmo 5.8 GHz, 48 kanałów, SmartAudio V2. Montaż 30×30 mm lub compact. Napięcie 7–24V, masa 8 g. Doskonały wybór do dronów freestyle i miejskich lotów.',
    image: 'nadajnik-vtx-rush-tank-ultimate-plus-800mw-20260405-100022.jpg',
    videoType: 'analog', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'vtx',
    name: 'Eachine TX805 800mW',
    price: 55,
    description: 'Eachine TX805 to najtańszy VTX analogowy godny polecenia. Moc 25–800 mW, pasmo 5.8 GHz, 48 kanałów, SmartAudio V1. Montaż 30×30 mm, napięcie 7–24V, masa 9 g. Idealny do pierwszego drona freestyle lub jako zapasowy VTX w szafce pilota.',
    image: 'nadajnik-vtx-eachine-tx805-800mw-20260405-100023.jpg',
    videoType: 'analog', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'vtx',
    name: 'HGLRC Zeus Nano VTX 400mW',
    price: 79,
    description: 'HGLRC Zeus Nano to kompaktowy VTX analogowy z wbudowanym mikrofonem. Moc 25–400 mW, pasmo 5.8 GHz, 48 kanałów, SmartAudio. Elastyczny montaż (opaski, pady), napięcie 5–24V, masa 5.5 g. Dobry budżetowy wybór dla dronów freestyle 3-5 cali.',
    image: 'nadajnik-vtx-hglrc-zeus-nano-400mw-20260405-100024.jpg',
    videoType: 'analog', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'vtx',
    name: 'TBS Unify Pro32 Nano 5G8 500mW',
    price: 189,
    description: 'TBS Unify Pro32 Nano to najmniejszy VTX premium na rynku (15×13×2 mm, 1 g). Moc 25–500 mW, pasmo 5.8 GHz, złącze U.FL. Zasilanie 2S–3S LiPo bezpośrednio lub 5V. SmartAudio V2, TBS Crossfire integration. Ideał dla micro dronów i TinyWhoop HD.',
    image: 'nadajnik-vtx-tbs-unify-pro32-nano-500mw-20260405-100025.jpg',
    videoType: 'analog', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'vtx',
    name: 'Rush Tank SOLO 1600mW',
    price: 289,
    description: 'Rush Tank SOLO to najpotężniejszy klasyczny VTX analogowy na rynku. Moc 25–1600 mW (wersja 1.6W SOLO). Obudowa aluminiowa jako radiator, pasmo 5.8 GHz. Idealny do długodystansowych lotów i penetracji obiektów. SmartAudio V2, napięcie 7–25V.',
    videoType: 'analog', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'vtx',
    name: 'ImmersionRC Tramp HV 600mW',
    price: 239,
    description: 'ImmersionRC Tramp HV to niezawodny VTX premium klas wyścigowej. Moc 25–600 mW, pasmo 5.8 GHz, 48 kanałów, Tramp protocol (i SmartAudio). Napięcie 5.5–9V, masa 6.8 g, złącze SMA. Wysoka precyzja częstotliwości transmisji, minimalne zakłócenia sąsiednich kanałów.',
    videoType: 'analog', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'vtx',
    name: 'SpeedyBee TX500 SA V2 500mW',
    price: 119,
    description: 'SpeedyBee TX500 to budżetowy VTX analogowy z mocą do 500 mW. Pasmo 5.8 GHz, 48 kanałów, SmartAudio V2. Złącze U.FL, napięcie 5–26V, masa 6 g. Montaż przez kabel lub pady. Dobry stosunek jakości do ceny dla dronów freestyle i wyścigowych.',
    videoType: 'analog', includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'vtx',
    name: 'AKK FX3 Ultimate 7W',
    price: 139,
    description: 'AKK FX3 Ultimate to VTX analogowy z największą mocą w klasie budżetowej — do 7W (wymagana licencja HAM). Standardowo 25–1200 mW bez licencji. Pasmo 5.8 GHz. Obudowa z radiatorem. Zasilanie 5–36V. Dobry zasięg w terenie zurbanizowanym.',
    videoType: 'analog', includesStraps: false,
  },

  // ────── ANTENNAS (+10) ──────
  {
    id: nextId(), inStock: true, category: 'antenna',
    name: 'Foxeer Lollipop 4+ RHCP SMA',
    price: 35,
    description: 'Foxeer Lollipop 4+ RHCP SMA to popularna antena FPV do nadajnika wideo. Pasmo 5.8 GHz, polaryzacja prawoskrętna RHCP. Wytrzymała plastikowa osłona, złącze SMA. Waga 5 g, długość 70 mm. Sprawdzona we freestyle, jedna z najlepszych w budżetowej kategorii.',
    polarization: 'RHCP', includesStraps: false,
    image: 'antena-foxeer-lollipop-4-plus-rhcp-20260405-100026.jpg',
  },
  {
    id: nextId(), inStock: true, category: 'antenna',
    name: 'TrueRC Matchstick 5.8G RHCP',
    price: 75,
    description: 'TrueRC Matchstick to premium antena VTX z wzmocnioną obudową dla lepszej odporności na crash\'e. Pasmo 5.8 GHz, polaryzacja RHCP. Sprawność 99%, doskonały axial ratio. Złącze SMA, waga 5 g. Najwyższa jakość w segmencie omni CP anteny do VTX.',
    polarization: 'RHCP', includesStraps: false,
    image: 'antena-truerc-matchstick-rhcp-20260405-100027.jpg',
  },
  {
    id: nextId(), inStock: true, category: 'antenna',
    name: 'Foxeer Micro Lollipop RHCP U.FL',
    price: 28,
    description: 'Foxeer Micro Lollipop RHCP to miniaturowa antena CP do micro dronów i VTX z złączem U.FL. Pasmo 5.8 GHz, polaryzacja RHCP. Bardzo mała i lekka (ok. 2 g), krótsza gałąź. Doskonały wybór dla TinyWhoop czy micro quadów z U.FL VTX.',
    polarization: 'RHCP', includesStraps: false,
    image: 'antena-foxeer-micro-lollipop-rhcp-20260405-100028.jpg',
  },
  {
    id: nextId(), inStock: true, category: 'antenna',
    name: 'TrueRC Singularity Short 40mm U.FL RHCP',
    price: 59,
    description: 'TrueRC Singularity Short RHCP to kompaktowa, 40-mm antena premium do U.FL VTX w micro dronach. Pasmo 5.8 GHz, polaryzacja RHCP. Sprawność >98%, zysk 1.5 dBi, waga 2.4 g. Klasa premium dla wymagających pilotów micro FPV.',
    polarization: 'RHCP', includesStraps: false,
    image: 'antena-truerc-singularity-short-ufl-20260405-100029.jpg',
  },
  {
    id: nextId(), inStock: true, category: 'antenna',
    name: 'TrueRC Singularity Stubby RHCP SMA',
    price: 65,
    description: 'TrueRC Singularity Stubby RHCP SMA to antena premium klasy stub do VTX. Pasmo 5.8 GHz, polaryzacja RHCP. Bardzo krótka (30 mm), idealna do ciasnych dronów freestyle. Sprawność >98%, axial ratio <1 dB. Masa 3 g. Polecana alternatywa dla Lollipop do FPV.',
    polarization: 'RHCP', includesStraps: false,
    image: 'antena-truerc-singularity-stubby-rhcp-20260405-100030.jpg',
  },
  {
    id: nextId(), inStock: true, category: 'antenna',
    name: 'Rush Cherry RHCP SMA',
    price: 30,
    description: 'Rush Cherry RHCP SMA to solidna antena VTX dla pilotów poza rynkiem USA (dostępna globalnie). Pasmo 5.8 GHz, polaryzacja RHCP. Twarda obudowa chroni elementy przed crash\'em. Złącze SMA lub RP-SMA do wyboru. Waga 7 g.',
    polarization: 'RHCP', includesStraps: false,
    image: 'antena-rush-cherry-rhcp-20260405-100031.jpg',
  },
  {
    id: nextId(), inStock: true, category: 'antenna',
    name: 'Lumenier AXII 2 RHCP SMA',
    price: 55,
    description: 'Lumenier AXII 2 to najpopularniejsza antena VTX premium na rynku. Mała, wytrzymała, równomierny zasięg w każdym kierunku. 5.8 GHz, RHCP, złącza SMA/RP-SMA/MMCX/UFL do wyboru. Waga 3.6–6.2 g w zależności od wersji. Sprawdzona w setkach konfiguracji.',
    polarization: 'RHCP', includesStraps: false,
    image: 'antena-lumenier-axii-2-rhcp-20260405-100032.jpg',
  },
  {
    id: nextId(), inStock: true, category: 'antenna',
    name: 'TrueRC X-Air MKII RHCP Patch (kierunkowa)',
    price: 195,
    description: 'TrueRC X-Air MKII to premium kierunkowa antena patch do gogli/VRX. Pasmo 5.8 GHz, RHCP, zysk 10 dBi, kąt przyjęcia 120°. Waga 35 g. Idealna do gogli DJI jako antena kierunkowa. Doskonała dla lotów długodystansowych i penetracji obiektów.',
    polarization: 'RHCP', includesStraps: false,
    image: 'antena-truerc-x-air-mkii-rhcp-20260405-100033.jpg',
  },
  {
    id: nextId(), inStock: true, category: 'antenna',
    name: 'Foxeer Pagoda Pro RHCP SMA',
    price: 39,
    description: 'Foxeer Pagoda Pro RHCP SMA to antena PCB o cylindrycznym kształcie. Pasmo 5.8 GHz, polaryzacja RHCP, wytrzymała obudowa. Dobra odporność na crash, lekka (8 g). Tradycyjna sprawdzona konstrukcja pagoda, doskonała do standardowych freestyle i analogowych aplikacji FPV.',
    polarization: 'RHCP', includesStraps: false,
    image: 'antena-foxeer-pagoda-pro-rhcp-20260405-100034.jpg',
  },
  {
    id: nextId(), inStock: true, category: 'antenna',
    name: 'Foxeer Lollipop 4+ LHCP SMA',
    price: 35,
    description: 'Foxeer Lollipop 4+ LHCP SMA to odpowiednik RHCP, przeznaczony dla systemów cyfrowych DJI i Walksnail. Pasmo 5.8 GHz, polaryzacja lewoskrętna LHCP. Producenci DJI i Walksnail zalecają LHCP do swoich systemów. Wytrzymała osłona plastikowa, złącze SMA.',
    polarization: 'LHCP', includesStraps: false,
  },

  // ────── ELRS (+9) ──────
  {
    id: nextId(), inStock: true, category: 'elrs',
    name: 'RadioMaster RP2 ELRS 2.4GHz',
    price: 119,
    description: 'RadioMaster RP2 ELRS 2.4GHz to ulepszona wersja RP1 z dodanymi padami do lutowania sygnałów CRSF i wbudowanym buzzerem. Obsługuje ELRS 2.4 GHz, Wi-Fi OTA update. Waga: 1.7 g. Niezawodny i popularny odbiornik dla dronów freestyle i tricki FPV.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'elrs',
    name: 'BetaFPV SuperP 2.4GHz ELRS',
    price: 95,
    description: 'BetaFPV SuperP ELRS 2.4GHz to kompaktowy odbiornik z wbudowaną anteną ceramiczną do TinyWhoop i micro dronów. Waga: 0.9 g, zasilanie 3.3V–5V. Obsługuje pełny ELRS 2.4 GHz, Wi-Fi update. Idealne do bardzo małych buildów gdzie każdy gram ma znaczenie.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'elrs',
    name: 'SpeedyBee Nano ELRS 2.4GHz',
    price: 99,
    description: 'SpeedyBee Nano ELRS 2.4GHz to lekki i kompaktowy odbiornik ELRS z kabelkiem JST. Waga: 1.4 g, obsługuje CRSF i Wi-Fi OTA update. Kompatybilny ze wszystkimi nadajnikami ELRS 2.4 GHz. Prosta instalacja przez kabel UART lub mostek FC.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'elrs',
    name: 'GEPRC Nano ELRS 868MHz',
    price: 89,
    description: 'GEPRC Nano ELRS 868MHz to odbiornik używający pasma 868/915 MHz, oferujące lepszy zasięg niż 2.4 GHz w terenie zurbanizowanym i lesistym. Waga: 1.3 g, Wi-Fi OTA update. Świetna opcja dla długodystansowych lotów i manualnego FPV na otwartym terenie.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'elrs',
    name: 'Matek ELRS-R24-P ELRS 2.4GHz',
    price: 109,
    description: 'Matek ELRS-R24-P to odbiornik ELRS 2.4 GHz z padami lutowniczymi zamiast kabla. Obsługuje CRSF/UART, Wi-Fi OTA. Waga: 1.4 g. Prosta lutownica przez pady zamiast kabla połączeniowego — mniej kabelków w buildzie. Kompatybilny z Betaflight i iNav.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'elrs',
    name: 'HappyModel EP2 ELRS 2.4GHz',
    price: 75,
    description: 'HappyModel EP2 ELRS 2.4GHz to podstawowy odbiornik ELRS z zewnętrzną anteną diwersity T. Waga: 1.0 g, obsługuje Wi-Fi OTA update. Jedna z najtańszych i najlżejszych opcji ELRS dla dronów freestyle 5". Prosta instalacja przez UART.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'elrs',
    name: 'iFlight ELRS Nano RX 2.4GHz',
    price: 99,
    description: 'iFlight ELRS Nano RX to dedykowany odbiornik dla dronów iFlight, kompatybilny z wszystkimi nadajnikami ELRS 2.4 GHz. Waga: 1.3 g, CRSF protokół, Wi-Fi update. Prosta instalacja przez kabel UART do FC. Zapewniona długoterminowa kompatybilność.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'elrs',
    name: 'BetaFPV ELRS Lite RX 915MHz',
    price: 85,
    description: 'BetaFPV ELRS Lite RX 915MHz to odbiornik długiego zasięgu pasmo 915 MHz (LoRa). Waga: 1.2 g, Wi-Fi OTA update. Doskonały zasięg ponad 10 km przy dobrze skonfigurowanym nadajniku. Ideał do longrange FPV i eksploracji terenu.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'elrs',
    name: 'HappyModel EPEX5 ELRS 2.4GHz Diversity',
    price: 69,
    description: 'HappyModel EPEX5 ELRS 2.4GHz to tani odbiornik diversify z dwiema antenami dla lepszej niezawodności połączenia. Waga: 1.8 g, CRSF/UART. Wi-Fi OTA update. Dwie anteny T tworzą lepszą odporność na wielościeżkowe zakłócenia. Dobry wybór dla pierwszego drona FPV.',
    includesStraps: false,
  },

  // ────── GPS (+9) ──────
  {
    id: nextId(), inStock: true, category: 'gps',
    name: 'HGLRC M100 Mini GPS+Baro',
    price: 95,
    description: 'HGLRC M100 Mini to kompaktowy moduł GPS+Baro dla dronów FPV. Chip u-blox M10, obsługa GPS+GLONASS+BeiDou+Galileo. Magnetometr QMC5883L i barometr DPS310. Waga: 10 g, montaż 20×20 mm. Przez UART lub I2C, kompatybilny z Betaflight i iNav.',
    image: 'modul-gps-hglrc-m100-mini-20260405-100035.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'gps',
    name: 'Flywoo GOKU GM10 Nano V3 GPS',
    price: 105,
    description: 'Flywoo GOKU GM10 Nano V3 to ultralekki moduł GPS dla freestyle. Chip u-blox M10, GPS+GLONASS+BeiDou. Waga: 6.5 g, rozmiar 16×16 mm. Prędkość 10 Hz, niesformowane pady do lutowania. Idealny dla lekkich dronów freestyle.',
    image: 'modul-gps-flywoo-goku-gm10-nano-v3-20260405-100036.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'gps',
    name: 'Beitian BN-220T GPS+GLONASS',
    price: 55,
    description: 'Beitian BN-220T to podstawowy, budżetowy moduł GPS z chipem u-blox M8N. Obsługa GPS+GLONASS, prędkość aktualizacji 5 Hz, konektor 4-pin UART. Waga: 10 g, interfejs UART 3.3V/5V. Popularny wybór do iNav i Betaflight GPS Rescue.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'gps',
    name: 'Matek M8Q-5883 GPS+Compass',
    price: 119,
    description: 'Matek M8Q-5883 to moduł GPS z wbudowanym kompasem QMC5883L i chipem u-blox M8Q. GPS+GLONASS+BeiDou, prędkość 5 Hz. Waga 18 g, rozmiar 20×20 mm. Złącze 6-pin dla UART i I2C. Solidny wybór do iNav longrange.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'gps',
    name: 'Holybro M9N GPS',
    price: 149,
    description: 'Holybro M9N to zaawansowany moduł GPS z chipem u-blox M9N i wysokoczułą anteną patch. GPS+GLONASS+GALILEO+BeiDou, prędkość 25 Hz. Waga: 19.5 g, rozmiar 30×30 mm. Złącze 4-pin UART. Jeden z najdokładniejszych modułów GPS dla FC Betaflight.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'gps',
    name: 'SpeedyBee M10 Mini GPS',
    price: 99,
    description: 'SpeedyBee M10 Mini to kompaktowy moduł GPS z chipem u-blox M10. Obsługa GPS+GLONASS+BeiDou+Galileo, prędkość 10 Hz. Waga: 8 g, rozmiar 22×22 mm. Prosta instalacja przez UART lub I2C. Dedykowany do ekosystemu SpeedyBee FC/ESC.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'gps',
    name: 'BN-880 GPS+Compass',
    price: 69,
    description: 'BN-880 to popularny budżetowy moduł GPS+Kompas z chipem u-blox M8N i magnetometrem HMC5883L. GPS+GLONASS, prędkość 5–10 Hz, interfejs UART+I2C. Waga: 17 g. Jeden z najpopularniejszych modułów dla pilotów zaczynających przygodę z iNav.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'gps',
    name: 'Matek SAM-M10Q GPS',
    price: 139,
    description: 'Matek SAM-M10Q to ultralekki moduł GPS premium z chipem SAM-M10Q i zintegrowaną anteną patch. GPS+GLONASS+BeiDou+GALILEO, prędkość 10 Hz. Waga: 7 g. Jeden z najlżejszych modułów GPS z zewnętrzną anteną patch. Idealny do dronów freestyle z GPS Rescue.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'gps',
    name: 'iFlight GPS M8N Micro',
    price: 95,
    description: 'iFlight GPS M8N Micro to kompaktowy moduł GPS z chipem u-blox M8N, kompatybilny z dronami iFlight i wszystkimi FC z UART. Prędkość 5 Hz, GPS+GLONASS. Waga: 12 g, rozmiar 22×22 mm. Płaski kształt ułatwia montaż na tylnej płycie ramy.',
    includesStraps: false,
  },

  // ────── BUZZERS (+9) ──────
  {
    id: nextId(), inStock: true, category: 'buzzer',
    name: 'ViFly Finder Mini 3g 100dB',
    price: 35,
    description: 'ViFly Finder Mini to lekki, autonomiczny buzzer z własnym akumulatorem wbudowanym. Waga: 3 g, głośność: 100 dB. Po wyłączeniu napięcia startuje automatycznie i cyka przez kilka godzin. Idealny do odnajdywania zgubionego drona w trudnym terenie.',
    image: 'buzzer-vifly-finder-mini-3g-100db-20260405-100037.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'buzzer',
    name: 'Aktywny brzęczyk piezo 5V 95dB',
    price: 8,
    description: 'Prosty, aktywny brzęczyk piezo do drona FPV. Zasilanie 5V z FC BEC, 95 dB. Sterowany przez pin GPIO kontrolera lotu. Najtańsze rozwiązanie dla basic FPV build. Waga: 1.5 g. Programowalny w Betaflight przez piny BEEPER.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'buzzer',
    name: 'HGLRC M100 Buzzer BT 100dB',
    price: 39,
    description: 'HGLRC M100 Buzzer BT to buzzer z możliwością lokalizacji przez Bluetooth przez aplikację mobilną. Głośność 100 dB klasyczny dźwięk + BT beacon dla smarfona. Waga: 5 g, zasilanie 3–6S lub 5V BEC. Nowoczesne podejście do problemu zgubionego drona.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'buzzer',
    name: 'iFlight Buzzer Active 5V 100dB',
    price: 15,
    description: 'iFlight Active Buzzer to prosta, niezawodna opcja dla każdego drona FPV. Zasilanie 5V, głośność 100 dB. Złącze JST-1.25 2-pin. Waga: 2 g. Programowalny jako beeper w Betaflight. Polecany do dronów freestyle i wyścigowych jako standardowy wyposażenie.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'buzzer',
    name: 'SpeedyBee Buzzer 95dB 3-6S',
    price: 12,
    description: 'SpeedyBee Buzzer to aktywny brzęczyk zasilany bezpośrednio z 3–6S LiPo lub 5V BEC. Głośność 95 dB, waga 2 g. Prosta instalacja przez konektor 2-pin. Kompatybilny z Betaflight, ArduCopter. Polecany do dronów z ekosystemem SpeedyBee.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'buzzer',
    name: 'VIFLY StoreFinder 2 Mini',
    price: 45,
    description: 'VIFLY StoreFinder 2 to autonomiczny buzzer ze wbudowaną baterią LiPo. Po odcięciu napięcia drona automatycznie cyka przez 24+ godziny. Głośność: 105 dB. Waga: 5 g. Dużo głośniejszy niż pasywne brzęczyki z FC. Niezawodny w trudnym terenie.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'buzzer',
    name: 'ImpulseRC Buzzer 5V 105dB',
    price: 18,
    description: 'ImpulseRC Buzzer to wysokiej jakości buzzer zaprojektowany dla dronów freestyle premium. Głośność: 105 dB, zasilanie 5V. Złącze z przewodem, kompatybilny z Betaflight. Waga: 2.5 g. Doskonały do dronów ImpulseRC Apex, ale kompatybilny z każdym FC.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'buzzer',
    name: 'Matek MICROBUZ Aktywny 5V 100dB',
    price: 14,
    description: 'Matek MICROBUZ to małe, aktywne buzzer od Matek Systems. Zasilanie 5V (lub 3.3V), głośność 100 dB. Złącze JST 1.25 2-pin z kablem. Waga: 1.5 g. Prosta, niezawodna opcja polecana przez społeczność FPV. Kompatybilny z Betaflight i iNav.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'buzzer',
    name: 'BetaFPV 1S Buzzer Active 5V',
    price: 10,
    description: 'BetaFPV Active Buzzer to lekki buzzer dedykowany do micro dronów. Zasilanie 5V lub 1S LiPo, głośność 95 dB. Waga: 1.2 g. Bardzo mały rozmiar, złącze 1.25 mm JST. Idealne dla TinyWhoop, micro quadów i małych 2S dronów. Programowalny w Betaflight.',
    includesStraps: false,
  },

  // ────── BATTERY STRAPS (+9) ──────
  {
    id: nextId(), inStock: true, category: 'battery_strap',
    name: '5x HGLRC Velcro Battery Strap 250mm',
    price: 18,
    description: 'Zestaw 5 pasków velcro do mocowania akumulatora LiPo 250×20 mm. Nylonowa pętelka z rzepem, dobra przyczepność antypoślizgowa. Materiał nie uszkadza baterii. Pasuje do większości dronów 5-calowych.',
    includesStraps: true,
  },
  {
    id: nextId(), inStock: true, category: 'battery_strap',
    name: '5x TBS Battery Strap 20x200mm',
    price: 25,
    description: 'Oryginalne paski Team BlackSheep do akumulatorów LiPo. Rozmiar 20×200 mm, materiał nylon z powłoką antypoślizgową. Zestaw 5 sztuk. Bardzo dobra jakość wykonania i trwałość. Polecane do dronów wyścigowych i freestyle.',
    includesStraps: true,
  },
  {
    id: nextId(), inStock: true, category: 'battery_strap',
    name: '5x Ethix Strap 20x220mm',
    price: 29,
    description: 'Paski Ethix (marka należąca do TBS) to jedne z najtrwalszych pasków na rynku. Rozmiar 20×220 mm, silikonowa pętelka, rzepowe zamknięcie. Zestaw 5 sztuk. Długość 220 mm pozwala na mocowanie nawet większych akumulatorów 6S.',
    includesStraps: true,
  },
  {
    id: nextId(), inStock: true, category: 'battery_strap',
    name: '5x BetaFPV Battery Strap 240mm',
    price: 15,
    description: 'Komplet 5 pasków BetaFPV do akumulatorów. Rozmiar 240×20 mm, nylon z paskiem rzepowym. Nieślizgająca się powierzchnia gumowa po stronie baterii. Tania i sprawdzona opcja dla micro i 5-calowych dronów freestyle.',
    includesStraps: true,
  },
  {
    id: nextId(), inStock: true, category: 'battery_strap',
    name: '5x iFlight Silikonowa Podkładka+Pasek 200mm',
    price: 20,
    description: 'Zestaw 5 silikonowych podkładek antypoślizgowych z paskami 20×200 mm. Gumowa podkładka zapobiega zsuwaniu się baterii podczas lotu i crash\'ów. Kompatybilna z bateriami 4S i 6S. Lekkie i trwałe rozwiązanie od iFlight.',
    includesStraps: true,
  },
  {
    id: nextId(), inStock: true, category: 'battery_strap',
    name: '10x Jomurema GT01 Non-Slip 25mm',
    price: 19,
    description: 'Komplet 10 pasków Jomurema GT01 o szerokości 25 mm do mocowania baterii LiPo. Antypoślizgowa silikonowa nakładka, solidne rzepowe zapięcie. Doskonały wybór ekonomiczny — większy zestaw w niskiej cenie.',
    includesStraps: true,
  },
  {
    id: nextId(), inStock: true, category: 'battery_strap',
    name: '5x RJX Silicone Strap 20x200mm',
    price: 17,
    description: 'Paski silikonowe RJX 20×200 mm do akumulatorów LiPo. Wykonane w całości z silikonu — nie ślizgają się na baterii ani na ramie. Zestaw 5 sztuk. Elastyczne i trwałe, doskonałe do freestyle gdzie drone wykonuje gwałtowne manewry.',
    includesStraps: true,
  },
  {
    id: nextId(), inStock: true, category: 'battery_strap',
    name: '5x GEPRC Premium Anti-Slip Strap',
    price: 28,
    description: 'Oryginalne paski GEPRC z silikonowym pełnym pokryciem. Rozmiar 20×220 mm, rdzeń nylonowy z silikonową powłoką po obu stronach. Zestaw 5 sztuk. Najlepsza adhezja do baterii — nie wymagają podkładki. Polecane do krytycznych buildów freestyle i race.',
    includesStraps: true,
  },
  {
    id: nextId(), inStock: true, category: 'battery_strap',
    name: '10x SkyRC LiPo Strap 25x300mm',
    price: 22,
    description: 'Zestaw 10 pasków SkyRC dla większych akumulatorów. Rozmiar 25×300 mm — nadają się do dużych 6S/8S baterii oraz konfiguracji podwójnych. Wysoka jakość rzepowego zamknięcia, długa żywotność paska.',
    includesStraps: true,
  },

  // ────── BATTERIES (+8) ──────
  {
    id: nextId(), inStock: true, category: 'battery',
    name: 'GNB 1300mAh 6S 160C LiHV XT60',
    price: 175,
    description: 'GNB 1300 mAh 6S 160C to wysokowydajny akumulator kolekcji LiHV (napięcie maks. 4.35V na celę). Wysoka gęstość mocy, mała waga. Świetny wybór dla wyścigów 6S i agresywnego freestyle. Wtyczka XT60. Wydajność trwałości deklarowana powyżej 300 cykli.',
    image: 'akumulator-gnb-1300mah-6s-160c-lihv-20260405-100038.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'battery',
    name: 'Tattu R-Line V4.0 1050mAh 6S 120C XT60',
    price: 195,
    description: 'Tattu R-Line V4.0 1050 mAh 6S 120C to flagowy akumulator marki Tattu dla wyścigów profesjonalnych. Masa: 198 g, gęstość energii klasa A, specjalna synteza chemiczna. Polecany przez zawodowych pilotów wyścigowych na całym świecie. Wtyczka XT60.',
    image: 'akumulator-tattu-r-line-6s-1050mah-120c-20260405-100039.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'battery',
    name: 'Dogcom 1500mAh 6S 100C XT60',
    price: 169,
    description: 'Dogcom 1500 mAh 6S 100C to akumulator dla pilotów szukających kompromisu między pojemnością a wagą. Masa: 260 g. Dobra wydajność rozładowania, długi czas lotu przy freestyle. Pojemność 1500 mAh daje ~5–6 min lotu freestyle na 6S. Wtyczka XT60.',
    image: 'akumulator-dogcom-1500mah-6s-100c-20260405-100040.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'battery',
    name: 'BetaFPV LAVA 6S 1100mAh 100C XT60',
    price: 165,
    description: 'BetaFPV LAVA 6S 1100 mAh 100C to nowa generacja akumulatorów od BetaFPV dla dronów freestyle. Masa: 202 g, pojemność 1100 mAh, wysoka gęstość energii LAVA. Dobra stabilność napięcia pod wysokim obciążeniem. Wtyczka XT60, kompatybilna z 5" dronami 6S.',
    image: 'akumulator-betafpv-lava-6s-1100mah-100c-20260405-100041.jpg',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'battery',
    name: 'Tattu R-Line 4S 1400mAh 95C XT60',
    price: 155,
    description: 'Tattu R-Line 4S 1400 mAh 95C to klasyk dla pilotów 4S. Masa: 177 g, wysoka wydajność rozładowania. Dobry czas lotu 4–5 min freestyle. Polecany jako akumulator treningowy dla begin pilotów na 4S. Wtyczka XT60.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'battery',
    name: 'CNHL MiniStar 1100mAh 4S 100C XT60',
    price: 115,
    description: 'CNHL MiniStar 1100 mAh 4S 100C to budżetowy akumulator klasy premium dla entuzjastów 4S. Masa: 155 g, mały rozmiar. Dobra stabilność napięcia pod różnymi obciążeniami, polecany przez community FPV jako dobry stosunek ceny do wydajności. Wtyczka XT60.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'battery',
    name: 'HRB 1500mAh 6S 100C XT60',
    price: 149,
    description: 'HRB 1500 mAh 6S 100C to akumulator łączący dobrą pojemność z wysoką mocą rozładowania. Masa: ~265 g. Doskonały do freestyle długodystansowego 6S. Twardsza celka, dobra trwałość cykli. Wtyczka XT60, standardowy rozmiar 5" freestyle.',
    includesStraps: false,
  },
  {
    id: nextId(), inStock: true, category: 'battery',
    name: 'Ovonic 1550mAh 4S 100C XT60',
    price: 135,
    description: 'Ovonic 1550 mAh 4S 100C to budżetowy akumulator 4S o dobrej pojemności. Masa: 200 g. Świetna opcja dla pilotów 4S freestyle szukających dłuższego czasu lotu. Dobra reputacja marki Ovonic w segmencie FPV. Wtyczka XT60.',
    includesStraps: false,
  },
];

// ─────────────────────────────────────────────────────────────────
// Download images
// ─────────────────────────────────────────────────────────────────
async function downloadImage(filename, url) {
  const dest = path.join(IMAGES_DIR, filename);
  if (fs.existsSync(dest)) {
    console.log(`  [SKIP] ${filename} already exists`);
    return true;
  }
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FPV-Configurator-Bot/1.0)' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error(`  [ERR]  ${filename} → HTTP ${res.status}`);
      return false;
    }
    const buf = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buf));
    console.log(`  [OK]   ${filename} (${(buf.byteLength / 1024).toFixed(1)} KB)`);
    return true;
  } catch (e) {
    console.error(`  [ERR]  ${filename} → ${e.message}`);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Downloading product images ===');
  let downloaded = 0;
  let failed = 0;
  for (const [filename, url] of IMAGES) {
    const ok = await downloadImage(filename, url);
    if (ok) downloaded++; else failed++;
  }
  console.log(`\nImages: ${downloaded} OK, ${failed} failed\n`);

  // Remove image references for products whose image download failed
  const downloadedSet = new Set(
    fs.readdirSync(IMAGES_DIR)
  );
  for (const p of NEW_PRODUCTS) {
    if (p.image && !downloadedSet.has(p.image)) {
      console.warn(`  [WARN] Image not found, clearing: ${p.image}`);
      delete p.image;
    }
  }

  console.log('=== Updating products.json ===');
  const existing = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
  const existingIds = new Set(existing.map(p => p.id));

  const toAdd = NEW_PRODUCTS.filter(p => !existingIds.has(p.id));
  const merged = [...existing, ...toAdd];

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`Added ${toAdd.length} new products.`);
  console.log(`Total products: ${merged.length}`);

  // Summary by category
  const counts = {};
  for (const p of merged) counts[p.category] = (counts[p.category] || 0) + 1;
  console.log('\nProducts per category:');
  for (const [cat, n] of Object.entries(counts).sort()) {
    console.log(`  ${cat.padEnd(16)}: ${n}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
