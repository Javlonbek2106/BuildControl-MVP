# BuildControl — MVP (demo)

Qurilish jarayonlarini raqamlashtirish platformasining ishlaydigan MVP versiyasi.
Sof **HTML + CSS + JavaScript**, hech qanday kutubxona va internet talab qilinmaydi.

Taqdimot qiluvchi uchun batafsil qo'llanma (tayyorgarlik, demo ssenariy, savol-javob) alohida PDF faylda beriladi: **BuildControl_taqdimotchi_qollanmasi.pdf**.

## Ishga tushirish

`index.html` faylini brauzerda (Chrome, Edge, Firefox) ikki marta bosib oching.

## Fayllar

| Fayl | Vazifasi |
| --- | --- |
| `index.html` | Sahifa tuzilmasi |
| `style.css` | Dizayn (kompyuter va telefon uchun) |
| `app.js` | Butun mantiq: rollar, obyektlar, kamchiliklar, materiallar, dalolatnomalar |

Ma'lumotlar brauzerning `localStorage` xotirasida saqlanadi. Boshlang'ich holatga qaytarish uchun chap menyudagi **«Demo ma'lumotlarni tiklash»** tugmasini bosing.

## Rollar

Har bir rol o'z bosh sahifasi, menyusi va rangini ko'radi. Rol yuqori paneldagi **«Rol»** ro'yxatidan almashtiriladi.

| Rol | Rang | Nima qila oladi |
| --- | --- | --- |
| Rahbar | ko'k | Barcha obyektlar paneli, obyekt qo'shish, bajarilish foizi, dalolatnoma va hisobotlar |
| Texnik nazorat | yashil | Kamchilik qayd etish (foto bilan), tasdiqlash yoki qaytarish, dalolatnoma |
| Pudratchi | to'q sariq | Vazifalar paneli, ishni boshlash, bartaraf etilganini belgilash, material kirim/sarfi |
| Administrator | binafsha | Hammasi, qo'shimcha: foydalanuvchilar va brauzer xotirasi holati |

Pudratchi menyusida «Dalolatnomalar», texnik nazorat menyusida «Materiallar» bo'limi yo'q.

## 5 daqiqalik demo ssenariy

1. **Rahbar** sifatida kiring: jadvaldan ortda qolgan obyekt (G'ijduvon maktabi), ochiq kamchiliklar va materiallar bo'yicha ogohlantirishni ko'rsating.
2. Rolni **Texnik nazorat**ga almashtiring (interfeys yashil bo'ladi) → «Kamchilik qayd etish» → rasm qo'shing → saqlang.
3. Rolni **Pudratchi**ga almashtiring → «Sizning vazifalaringiz»dan yangi kamchilikni oching → «Ishni boshlash» → «Bartaraf etildi».
4. **Texnik nazorat**ga qayting → kamchilikni oching → «Tasdiqlash». Harakatlar tarixini ko'rsating.
5. **Rahbar**ga qayting → «Dalolatnomalar» → «Dalolatnoma tuzish» (yoki «Haftalik holat hisoboti») → «PDF yuklab olish».
6. Dashboardga qayting: raqamlar va «So'nggi harakatlar» yangilangan; obyektning «Tarix» bo'limida butun jarayon ko'rinadi.
