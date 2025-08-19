// memory.js - per-user memory via Firestore (Anonymous Auth)
(function(){
  const tg = window.Telegram?.WebApp;
  async function ensureAuth(){
    if (!firebase?.auth) return null;
    if (!firebase.auth().currentUser){
      await firebase.auth().signInAnonymously();
    }
    return firebase.auth().currentUser;
  }
  async function initUserProfile(){
    const user = await ensureAuth();
    if (!user) return;
    const db = firebase.firestore();
    const userRef = db.collection("users").doc(user.uid);
    const tgUser = tg?.initDataUnsafe?.user ?? null;
    const name = tgUser ? [tgUser.first_name||"", tgUser.last_name||""].join(" ").trim() || tgUser.username || null : null;
    await userRef.set({
      tgId: tgUser?.id ?? null,
      name,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    const snap = await userRef.get();
    const d = snap.data()||{};
    const patch = {};
    if (typeof d.cycleLength !== "number") patch.cycleLength = 28;
    if (typeof d.periodLength !== "number") patch.periodLength = 5;
    if (Object.keys(patch).length) await userRef.set(patch, { merge: true });
    window.$user = { uid: user.uid, ref: userRef, db };
    console.log("User memory ready:", window.$user);
  }
  window.Memory = {
    async savePeriodStart(isoDate){
      if (!window.$user) await initUserProfile();
      const { uid, db } = window.$user;
      const cycles = db.collection("users").doc(uid).collection("cycles");
      const doc = cycles.doc();
      await doc.set({ startDate: isoDate, endDate: null, notes: null, predictedOvulation: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      return doc.id;
    }
  };
  document.addEventListener("DOMContentLoaded", initUserProfile);
})();