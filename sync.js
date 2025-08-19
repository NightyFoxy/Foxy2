// sync.js — синхронизация localStorage -> Firestore
(function(){
  const SKEY = 'foxy.v12.state'; // тут лежат ответы теста
  const DKEY = 'foxy.v12.days';  // тут календарь/симптомы

  const origSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, value){
    origSetItem(key, value);
    trySync(key, value).catch(console.warn);
  };

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      [SKEY, DKEY].forEach(k => {
        const v = localStorage.getItem(k);
        if (v) trySync(k, v).catch(console.warn);
      });
    }, 800);
  });

  async function trySync(key, value){
    if (!window.$user || !window.$user.uid) return;
    const db = window.$user.db || firebase.firestore();
    const uid = window.$user.uid;

    if (key === SKEY) {
      let st = {};
      try { st = JSON.parse(value || '{}'); } catch {}
      const answers = st.answers || {};
      const profilePatch = {
        cycleLength: answers.cycleLen ?? 28,
        periodLength: answers.periodLen ?? 5,
        lastPeriodStart: answers.lastStart ?? null,
        questionnaire: answers, // <-- ВСЕ ОТВЕТЫ ТЕСТА
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
      };
      await db.collection('users').doc(uid).set(profilePatch, { merge: true });
    }

    if (key === DKEY) {
      let days = {};
      try { days = JSON.parse(value || '{}'); } catch {}
      const userRef = db.collection('users').doc(uid);
      for (const [date, info] of Object.entries(days)) {
        const ref = userRef.collection('symptoms').doc(date);
        await ref.set({
          ...info,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }
    }
  }
})();
