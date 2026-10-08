# STYLESORT

Find It. Sort It. Wear It.

A mobile-first fashion marketplace launching in Enugu and built to ship across Nigeria. Women and men, 18–40, sorted by size, budget, colour, style, occasion and location. Prices are in Nigerian Naira.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server binds to `0.0.0.0` so it can be previewed.

## Shop

- Home, women, men, kids, new arrivals, deals
- Filters: gender, category, price, size (XS–XXXL and plus), colour, occasion, style, seller location, availability
- Sort: featured, newest, best selling, price, rating, popularity
- Search understands phrases such as `red dress under ₦20K`, `men's wedding outfit`, `church outfit size 12`, `complete outfit under ₦50K`
- Product pages: gallery, look film, sizes, size guide, seller, delivery, reviews with photos, complete the look, related and recently viewed
- Slide-out bag, persistent in this browser
- Checkout: contact, address, delivery, payment (card, transfer, OPay, PalmPay, USSD, Enugu pay on delivery), review, confirmation
- Complete looks, shop by budget, shop by occasion, Build My Outfit, upload a photo to match by colour
- Wishlist, accounts, saved sizes, style and budget preferences, Insider, referrals
- Seller applications and seller storefronts with the STYLESORT Verified badge
- WhatsApp support on every page

## Staff

Open `/admin`. PIN: `stylesort`.

The desk saves to the server. A price, photo, stock change or new piece shows up for every visitor, not only in the browser that made the edit. Change a garment from Clothes: upload a photo, pick one already on the site, or paste an image URL, then save. Add a piece from the Add tab. Removed pieces can be restored under More. The PIN can be changed there too. Recovery is `data/desk.json`.

Seed clothes still live in `lib/products.ts`. Desk edits are stored in `data/catalog.json` and override the seed.

### Clothes API

Staff routes need the PIN in `x-stylesort-pin` or `Authorization: Bearer <pin>`.

```bash
curl -H "x-stylesort-pin: stylesort" http://localhost:3000/api/catalog?manage=1
curl -X PATCH http://localhost:3000/api/catalog \
  -H "content-type: application/json" -H "x-stylesort-pin: stylesort" \
  -d '{"id":"ss001","patch":{"price":17500,"inventory":12}}'
curl -X POST http://localhost:3000/api/catalog/image \
  -H "x-stylesort-pin: stylesort" \
  -F "productId=ss001" -F "file=@photo.jpg"
```

`GET /api/catalog` is the public shop list. `POST /api/orders` records a checkout and reduces stock.

### Plugins

Install another tool with `POST /api/plugins`. The contract, slots and events are at `GET /api/plugins/manifest`.

```bash
curl -X POST http://localhost:3000/api/plugins \
  -H "content-type: application/json" -H "x-stylesort-pin: stylesort" \
  -d '{"name":"Friday note","kind":"html","enabled":true,"slots":["home-after-hero"],"html":"<p>New drop Friday, 6pm.</p>"}'
```

Slots: `announcement`, `home-after-hero`, `home-before-footer`, `product-aside`, `cart-note`, `checkout-aside`, `footer`. Kinds: `html`, `script`, `link`, `webhook`. A webhook plugin receives shop events such as `add_to_cart` and `payment_completed`. HTML is shown in the slot. Script tags inside HTML are removed. A script plugin loads `scriptSrc` on every page.

## Codes

`WELCOME10` first order · `ENUGU2K` Enugu delivery · `SORT5` over ₦40,000 · `INSIDER15` members · `WEEKEND` Friday to Sunday

## Events

The store records product view, search, filter use, add to cart, wishlist, checkout started, payment, purchase, coupon use, seller conversion and referral conversion. Events are kept in the browser and posted to `/api/events`.

## Payments

Checkout confirms orders in the STYLESORT system. Connect Paystack or your bank webhook before taking live card payments. Transfer details on the payment step are the house account to replace with the live one.
