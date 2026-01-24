const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.syncInventory = functions.firestore
  .document("users/{uid}/inventory/{itemId}")
  .onWrite(async (change, context) => {

    const uid = context.params.uid;
    const itemId = context.params.itemId;

    const shopSnap = await db
      .doc(`users/${uid}/settings/shopProfile`)
      .get();

    if (!shopSnap.exists) return null;

    const shop = shopSnap.data();

    // 🔥 Create / update public shop (ADDRESS ADDED)
    await db.doc(`public_shops/${uid}`).set({
      name: shop.name || "Shop",
      lat: shop.lat,
      lng: shop.lng,
      address: shop.address || ""   // ✅ FIX HERE
    }, { merge: true });

    // 🔥 Sync products
    if (change.after.exists) {
      await db
        .doc(`public_shops/${uid}/products/${itemId}`)
        .set(change.after.data());
    } else {
      await db
        .doc(`public_shops/${uid}/products/${itemId}`)
        .delete();
    }

    return null;
  });
