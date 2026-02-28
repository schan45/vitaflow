# VitaFlow – Bridging the gap between health data and daily consistency

VitaFlow egy prevention-first egészségügyi lifestyle platform, amely onboarding kérdőív + AI elemzés alapján személyre szabott challenge-eket ad, és végigköveti a felhasználó haladását. (mobilapp elrendezés, így webes felüleről mobilon is megnyitható)

## Fő funkciók röviden

- Regisztráció és bejelentkezés Supabase Auth alapon
- Többlépcsős onboarding kérdőív (orvosi háttér, baseline, lifestyle, motiváció, praktikus adatok)
- AI chatbot tünetösszegzéssel és rizikóbecsléssel
- Orvos ajánlás specialty-alapon (ha releváns) (egy előre megírt adatbázis alapján, ez később módosulna arra a featurre, hogy bizonyos magánkinikák példa kedvéért itt a MediCover, szerződésbe lépnek a VitaFlow fejlesztőivel, támogatják az alkalmazást, orvosi szakembereik ajánlása ellenében, ami az AI featur-rel kerül megvalósításra. Bizonyos egészségügyi problémák esetén személyre szabott ajánlást kaphatnak a leendő páciensek, milyen szakembert kell meglátogatniuk, és a jövőben ez egy GPS tracker beépítésével tenné gördülékenyebbé az ajánlást. )
- Automatikus, személyre szabott challenge-generálás onboarding után
- Tracker dashboard progresszív overload fókuszú heti tervvel
- Profil és chat/onboarding/goals per-user perzisztencia
- A jövőbeli fejlesztések bevzetésével már megkapott lelet értelmezés (vérvételi eredmények, MRI stb.., felhasználóbarát, könnyen érthető magyarázat. Orvos szakember és páciens közötti kommunikációs/megértésbeli gap kitöltése)

---

## 1) AI Chatbot – részletes képességek

### Mit csinál?

- A felhasználó szöveges vagy hangalapú inputját feldolgozza
- Rövid, támogató összegzést ad az állapotról
- Kockázati szintet becsül (`low` / `moderate` / `high`)
- Magasabb kockázatnál javasolt szakorvost keres specialty alapon
- Fallback logikával akkor is működik, ha AI szolgáltatás átmenetileg nem elérhető

### Kiemelt viselkedések

- Többnyelvű tünet kulcsszavas fallback (HU/EN)
- Kontextusos válaszok (nem statikus sablon)
- Hangbevitel támogatás EN/HU váltóval
- Chat history automatikus mentés és visszatöltés felhasználónként

### Miért hasznos a demo-ban?

- Látható AI érték (nem csak UI): döntés-előkészítés + ajánlás
- Valós felhasználói élmény: beszélgetés, rizikó, ajánlás, következő lépés

---

## 2) Tracker – részletes képességek

### Mit követ?

- Goal completion állapotot
- Progress százalékot (kördiagram + line/bar chart)
- Streaket
- Goal eloszlást (completed vs remaining)

### Zero-state és személyre szabás

- Új felhasználó 0-ról indul (`0 goal`, `0%`, `0 streak`)
- Onboarding utáni AI challenge-ek automatikusan feltöltik a goal listát
- Minden adat per-user mentődik (`goals-data` API)

### Progressive plan (challenge fókusz)

- `Week 1/2/3/...` jelölésű feladatok külön blokkban jelennek meg
- „Current focus: Week X” kiemelés a következő aktív hétre
- Progressive overload logika (fokozatos nehezítés)

---

## 3) Profil rész – részletes képességek

### Mit mutat?

- Felhasználó profil azonosító adatai
- Onboarding kérdőívből származó baseline/medical/lifestyle/motiváció/praktikus adatok
- Aktív goal lista állapottal

### Adatforrás

- Profil init API (`/api/profile/init`) kezeli a profil rekord inicializálást
- Profil adatok Supabase-ben tárolódnak
- Legacy fallback tárolás is támogatott kompatibilitás miatt

### Felhasználói élmény

- Frissítés/relogin után is ugyanazok az adatok töltődnek vissza
- Nem lokális demo state, hanem accounthoz kötött állapot

---

## 4) Onboarding alapú challenge generálás

### Folyamat

1. Felhasználó kitölti az 5 lépéses kérdőívet
2. „Complete” után a kliens meghívja a challenge-generáló API-t
3. API AI-val (Azure OpenAI) challenge listát készít
4. Ha AI hiba van, szabályalapú fallback challenge lista készül
5. Challenge-ek automatikusan bekerülnek a goal rendszerbe

### Kimenet jellemzői

- 4-6 konkrét challenge
- `Daily`/`Weekly` frekvencia
- Progressive week-labeled feladatok (pl. Week 1 → Week 2 → Week 3)

---

## 5) Leletelemző (Medical Report Analyzer) – implementációs terv 

Jelenlegi állapot:

- A feltöltési UI már létezik (drag & drop / file picker)
- A rendszer már jelzi, hogy van feltöltött lelet (`hasUploadedReport` user-scoped flag)
- Van AI service függvény szöveges lelet összegzésre

Teljes, production-közeli implementáció javasolt lépései (Jövőbeli fejlesztések):

### A) Fájlfeltöltés backendre

### B) Szövegkinyerés (OCR / parsing)

### C) AI összegzés és strukturálás

- Meghívás az AI summary service-re
- Strukturált JSON kimenet:
	- kulcsleletek
	- eltérések
	- figyelmeztetések
	- javasolt kontrollpontok
- Fontos: „nem diagnózis” disclaimer

### D) Chat + Tracker integráció

- Chat használja a legfrissebb lelet összegzést kontextusként
- Tracker challenge-ek módosítása lelet alapján (pl. intenzitás korrekció)
- Orvosajánló specialty prioritás a lelet alapján

### E) Biztonság és compliance minimum

- Csak autentikált user férjen hozzá saját reporthoz
- Service role kulcs kizárólag szerver oldalon
- PII/PHI minimalizálás logokban
- Törlés/retention policy definiálása




