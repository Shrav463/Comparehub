// Centralized asset imports for product images.
// Keep keys in ASSET_IMAGES LOWERCASE to match resolveProductImage() normalization.

import acerAspire5 from "./acer aspire 5.png";
import airpodsse from "./AirPods Pro.png"
import asusRog from "./ASUS ROG.png";
import boseQc45 from "./Bose QC45.png";
import dellXps13 from "./Dell XPS 13.png";
import hpSpectre from "./HP spectre .png";
import iphone15 from "./iphone 15.png";
import jblTune520bt from "./JBL Tune 520BT Bluetooth Wireless On-Ear Headphones.png";
import jblTune670nc from "./JBL Tune 670NC Bluetooth Wireless On-Ear Headphones.png";
import lenovoThinkpad from "./Lenovo Thinkpad.png";
import macbookAir13 from "./Macboo Air 13.png";
import macbookPro14 from "./Macbook pro 14.png";
import microsoftSurfaceLaptop5 from "./Microsoft surface laptop 5.png";
import motorolaEdgePlus from "./Moto edge+.png";
import oneplus11 from "./Oneplus 11.png";
import oneplus12 from "./Oneplus 12.png";
import pixel8 from "./Pixel 8.png";
import pixel8Pro from "./Pixel 8 Pro.png";

// Newly-added images (were present in assets but not wired into the UI)
import galaxyS24Ultra from "./Galaxy S24 Ultra.png";
import galaxyS23 from "./Galaxy S23.png";
import googlePixel7 from "./Google pixel 7.png";
import lggram16 from "./LG Gram 16.png";
import macbookAirM2 from "./Macbook Air M2.png";
import macbookAirM3 from "./Macbook Air M3.png";
import samsungGalaxyS24 from "./Samsung galaxy S24.png";
import samsungGalaxyS25Ultra from "./Samsung galaxy S25 Ultra.png";
import sennheisermomentum from "./Sennheiser Momentum.png";
import xiaomi14 from "./Xiomi14.png";
import sonyXH from "./Sony WH1000XM5.png";
import fitbit from "./Fitbit Sense 3.png";
import beatsstudiopro from "./Beats Studio Pro.png";

// Optional generated fallback (used only if needed)
import genericProduct from "./generated/generic_product.png";

export const ASSETS = {
  acerAspire5,
  airpodsse,
  asusRog,
  beatsstudiopro,
  boseQc45,
  dellXps13,
  fitbit,
  hpSpectre,
  iphone15,
  jblTune520bt,
  jblTune670nc,
  lenovoThinkpad,
  macbookAir13,
  macbookPro14,
  microsoftSurfaceLaptop5,
  motorolaEdgePlus,
   lggram16,
  oneplus12,
  pixel8,
  pixel8Pro,
  sennheisermomentum,
  galaxyS24Ultra,
  galaxyS23,
  googlePixel7,
  macbookAirM2,
  macbookAirM3,
  samsungGalaxyS24,
  samsungGalaxyS25Ultra,
  xiaomi14,
  genericProduct,
  sonyXH,
  oneplus11,
};

export const ASSET_IMAGES = {
  // Phones
  "iphone 15": iphone15,
  "airpods pro":airpodsse,
  "pixel 8": pixel8,
  "beats studio pro":beatsstudiopro,
  "fitbit sense 3":fitbit,
  "pixel 8 pro": pixel8Pro,
  "google pixel 7": googlePixel7,
  "pixel 7": googlePixel7,
  "lg gram 16": lggram16,

  "oneplus 12": oneplus12,
  "oneplus 11": oneplus11,

  "moto edge+": motorolaEdgePlus,
  "sennheiser momentum":sennheisermomentum,

  "galaxy s24 ultra": galaxyS24Ultra,
  "samsung galaxy s24 ultra": galaxyS24Ultra,
  "galaxy s24": samsungGalaxyS24,
  "samsung galaxy s24": samsungGalaxyS24,
  "galaxy s23": galaxyS23,
  "samsung galaxy s23": galaxyS23,
  "galaxy s25 ultra": samsungGalaxyS25Ultra,
  "samsung galaxy s25 ultra": samsungGalaxyS25Ultra,
  "bose qc ultra / qc45": boseQc45,
"bose qc ultra": boseQc45,
"bose qc45": boseQc45,
"sony wh-1000xm5": sonyXH,


  "xiaomi 14": xiaomi14,
  "xiomi14": xiaomi14,

  // Laptops
  "macboo air 13": macbookAir13,
  "macbook air 13": macbookAir13,
  "macbook pro 14": macbookPro14,
  "dell xps 13": dellXps13,
  "hp spectre": hpSpectre,
  "microsoft surface laptop 5": microsoftSurfaceLaptop5,
  "acer aspire 5": acerAspire5,
  "lenovo thinkpad": lenovoThinkpad,
  "asus rog": asusRog,
  "macbook air m2": macbookAirM2,
  "macbook air m3": macbookAirM3,

  // Headphones


  "bose qc ultra / qc45": boseQc45,
  "bose qc ultra": boseQc45,
  "bose qc45": boseQc45,

  "sony wh1000xm5": sonyXH,

  "jbl tune 520bt": jblTune520bt,
  "jbl tune 670nc": jblTune670nc,

};

// Generic fallback for any product without a mapped image
export const FALLBACK_PRODUCT_IMAGE = genericProduct;

export {
  acerAspire5,
  airpodsse,
  asusRog,
  beatsstudiopro,
  boseQc45,
  dellXps13,
  fitbit,
  hpSpectre,
  iphone15,
  jblTune520bt,
  jblTune670nc,
  lenovoThinkpad,
   lggram16,
  macbookAir13,
  macbookPro14,
  microsoftSurfaceLaptop5,
  motorolaEdgePlus,
  oneplus12,
  pixel8,
  pixel8Pro,
  sennheisermomentum,
  galaxyS24Ultra,
  galaxyS23,
  googlePixel7,
  oneplus11,
  macbookAirM2,
  macbookAirM3,
  samsungGalaxyS24,
  samsungGalaxyS25Ultra,
  xiaomi14,
  genericProduct,
  sonyXH,
};
