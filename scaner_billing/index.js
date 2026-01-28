import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

/**
 * 🔥 Sync shop profile → public_shops
 */
export const syncShopToPublic = onDocumentWritten(
  "users/{userId}/settings/shopProfile",
  async (event) => {
    const data = event.data?.after?.data();
    if (!data) return;

    const { lat, lng, name, address, logo } = data;
    if (!lat || !lng) return;

    const userId = event.params.userId;

    await db.collection("public_shops").doc(userId).set(
      {
        name: name || "Shop",
        address: address || "",
        lat,
        lng,
        logo: logo || "",
        updatedAt: new Date()
      },
      { merge: true }
    );

    console.log("✅ public_shops synced:", userId);
  }
);
