# Grove Smart IR Gesture (PAG7661QN) – micro:bit MakeCode extension

**Adres I²C:** `0x63`  
Ustaw przełącznik DIP modułu na **I²C**, podłącz do grove shielda micro:bit (SDA/SCL, 3.3V).

## Bloki
- **initialize gesture sensor** – inicjalizacja trybu Gesture/Combined.
- **thumb up?**, **thumb down?** – proste flagi.
- **cursor X**, **cursor Y** – pozycja kursora (11 bit).
- **rotation angle (acc)** – skumulowany kąt obrotu (int16).
- **demo show icons (polling)** – prosty pokaz na LED.

## Import
W MakeCode (micro:bit) → **Extensions** → wklej URL repo GitHub.

## Rozszerzanie
Układ PAG7661QN udostępnia więcej gestów (Swipe/Push/Tap/Grab/Pinch/Static 1–5 palców).
Dodaj funkcje czytające odpowiednie rejestry i opatrz je dekoratorem `//% block`.
