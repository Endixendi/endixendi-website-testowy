# 🖥️ endixendi.pl — Oficjalna Strona Internetowa

Witaj w oficjalnym repozytorium strony **[endixendi.pl](https://endixendi.pl)**. To moje osobiste miejsce w sieci, w którym gromadzę swoją twórczość, autorskie gry przeglądarkowe, poradniki oraz informacje o sprzęcie i projektach związanych z grami i technologią.

---

## 👨‍💻 O mnie
Tworzę treści wideo od 2014 roku, zaczynając od kultowej serii z MTA na YouTube. Moja pasja do gamingu oraz technologii łączy się z wykształceniem informatycznym, co pozwala mi samodzielnie rozwijać ten projekt i dzielić się wiedzą z odbiorcami. Chcę tworzyć miejsce, w którym pasja do gier łączy ludzi z Polski i ze świata.

---

## 🕹️ Zawartość strony

Strona używa czystego JavaScriptu do dynamicznego wstrzykiwania powtarzalnych elementów (menu i stopka), co ułatwia zarządzanie projektem.

### 🎮 Gry przeglądarkowe
* **Dino Game (`dino.html`)** — zręcznościowa gra inspirowana klasykiem z Chrome. Skacz i kucaj kwadratowym dinozaurem, kontroluj głośność, bij rekordy (zapisywane w przeglądarce). Pełne sterowanie dotykowe.
* **Tetris (`tetris.html`)** — neonowa wersja klasyka z Hold/Next, poziomami, rekordem oraz sterowaniem klawiaturą i dotykiem (z auto-powtarzaniem ruchu).
* **Shooter Game (`shooter.html`)** — kosmiczna strzelanka z systemem przegrzewania dział, paskiem zdrowia i zapisywanym rekordem.
* **Statki — Bitwa Morska (`battleship.html`)** — gra planszowa z komputerem na trzech poziomach: *Łatwy*, *Trudny* i *Cheater*. Wykrywa zatopienia, oznacza pola wokół zatopionych statków i pokazuje liczbę jednostek we flocie.
* **PC Mode (`pc-mode.html`)** — symulator systemu operacyjnego: okna z przeciąganiem, menu Start, Notatnik z zapisem, konsola poleceń, przeglądarka z mini-grą, mikser głośności i kalendarz.

> **Wspólne moduły gier:** przycisk pełnego ekranu i jego style współdzielone są przez `assets/css/games.css` (Dino, Tetris, Shooter), a obsługa trybu pełnoekranowego (Fullscreen API + fallback dla iOS) przez `assets/js/fullscreen.js` (wszystkie gry z przyciskiem pełnego ekranu, w tym Statki).

### 📱 Informacje i multimedia
* **Strona główna (`index.html`)** — sekcja „O mnie”, pełna specyfikacja PC i peryferiów, odnośniki do social mediów, najnowsze filmy z YouTube, skróty do partnerów.
* **Media (`media.html`)** — widget profilu Instagram (Behold) oraz playlista Spotify.
* **Narzędzia (`tools-all.html` / `tools-rec.html`)** — zestawienie programów do montażu, streamowania i grafiki (OBS, DaVinci Resolve, Photopea, Vectorpea) z wyszukiwarką, filtrami kategorii i osadzoną playlistą poradników.
* **Linux vs Windows (`linux.html`)** — porównanie systemów i polecane dystrybucje dla graczy.
* **Galeria (`gallery.html`)** — dynamicznie ładowana siatka zdjęć, podgląd kinowy z miniaturami i lightbox (strzałki, Escape).
* **Dokumenty prawne** — `polityka.html` (polityka prywatności) i `regulamin.html`.

---

## 🛠️ Architektura i technologie

Projekt stawia na szybkość i lekkość, bez frameworków (Vanilla Tech Stack):

* **HTML5** — semantyczna struktura, atrybuty ARIA, `lang="pl"`.
* **CSS3** — responsywny design z klasami pomocniczymi (`.mt-12`, `.muted`, …) i komponentami. Kolory sterowane zmiennymi CSS (`--accent`, `--accent-2`, `--danger`, `--on-accent`), dzięki czemu motywy (czerwony, zielony, niebieski, sezonowe) działają w całym serwisie. Wyjątek: symulator PC Mode ma własną, stałą paletę.
* **JavaScript (ES6+)** — gry na `<canvas>` (Dino, Tetris, Shooter) i w DOM (Statki), ładowanie menu i stopki przez `fetch()`, wspólny moduł pełnego ekranu, Audio API oraz bezpieczny wrapper `localStorage`.
* **Dostępność** — `aria-expanded` w menu, obsługa klawiatury, `:focus-visible`, `prefers-reduced-motion`.

---

## ▶️ Uruchomienie lokalnie

Menu i stopka są ładowane przez `fetch()`, więc strony nie da się otworzyć dwuklikiem (`file://`). Uruchom prosty serwer w katalogu projektu:

```bash
python -m http.server 8000
# potem otwórz http://localhost:8000
```

(albo użyj rozszerzenia „Live Server” w VS Code). Ścieżki do menu i stopki są absolutne (`/menu.html`), więc projekt musi być serwowany z korzenia domeny.

---

## ➕ Jak dodać…

* **Zdjęcie do galerii** — wrzuć plik do `assets/images/gallery/` i dopisz jego nazwę do tablicy `imageFiles` w `assets/js/gallery.js`. Używaj nazw bez polskich znaków (np. `zniwa-pelna-para.webp`), żeby uniknąć problemów z kodowaniem na serwerze.
* **Narzędzie** — skopiuj istniejący blok `.tool-card` w `tools-all.html` do odpowiedniej sekcji `.tool-category`.
* **Nową grę** — skopiuj układ istniejącej strony gry, dodaj link do `menu.html` i do `sitemap.xml`; wspólne style i pełny ekran są w `games.css` i `fullscreen.js`.
* **Nową stronę** — dodaj ją do `sitemap.xml` i, jeśli ma być w nawigacji, do `menu.html`.

---

## 💾 Dane zapisywane w przeglądarce (LocalStorage)

Wszystko zostaje wyłącznie na urządzeniu użytkownika (szczegóły w `polityka.html`):

| Klucz | Zawartość |
|---|---|
| `theme-cycle-index` | wybrany motyw kolorystyczny |
| `effects-disabled` | wyłączenie efektów sezonowych |
| `highScore` | rekord w Dino |
| `endixendi:tetris:highscore` | rekord w Tetrisie |
| `endixendi:shooter:highscore` | rekord w Shooterze |
| `gamingOS_note` | treść Notatnika w PC Mode |

---

## 📂 Struktura projektu

```text
├── assets/
│   ├── css/
│   │   ├── battleship.css    # Style gry Statki
│   │   ├── dino.css          # Style gry Dino
│   │   ├── gallery.css       # Style galerii zdjęć
│   │   ├── games.css         # Wspólne style gier (przycisk pełnego ekranu)
│   │   ├── linux.css         # Style strony Linux vs Windows
│   │   ├── pc-mode.css       # Style symulatora PC Mode
│   │   ├── shooter.css       # Style gry Shooter
│   │   ├── style.css         # Główny arkusz (zmienne, motywy, menu, stopka)
│   │   ├── tetris.css        # Style gry Tetris
│   │   └── tools.css         # Style stron narzędzi (tools-all, tools-rec)
│   ├── images/
│   │   ├── gallery/          # Zdjęcia galerii
│   │   ├── game/             # Ikony gier w PC Mode
│   │   ├── promos/           # Banery partnerów (strona główna)
│   │   ├── logo.png          # Awatar
│   │   ├── logo-dc.png       # Logo serwera Discord
│   │   ├── logo-kolo.png     # Awatar (wersja koło, favicon i loader)
│   │   └── qr-mobile.webp    # Kod QR dla urządzeń mobilnych
│   ├── js/
│   │   ├── battleship.js     # Logika gry i AI bota (Statki)
│   │   ├── dino.js           # Silnik gry Dino
│   │   ├── fullscreen.js     # Wspólna obsługa pełnego ekranu w grach
│   │   ├── gallery.js        # Siatka zdjęć, podgląd kinowy, lightbox
│   │   ├── pc-mode.js        # Silnik symulatora PC Mode
│   │   ├── script.js         # Wspólna logika: ładowanie menu/stopki, nawigacja, motywy, efekty sezonowe, panele
│   │   ├── shooter.js        # Silnik gry Shooter
│   │   ├── storage.js        # Bezpieczny wrapper localStorage (ładować jako pierwszy)
│   │   ├── tetris.js         # Silnik gry Tetris
│   │   └── tools.js          # Wyszukiwarka, filtr kategorii i licznik narzędzi
│   └── sounds/               # Efekty dźwiękowe i muzyka gier
│       ├── dino/ , global/ , shooter/ , statki/ , system/ , tetris/
│
├── 404.html                  # Własna strona błędu (GitHub Pages serwuje ją automatycznie)
├── battleship.html           # Gra Statki
├── CNAME                     # Własna domena dla GitHub Pages
├── dino.html                 # Gra Dino
├── footer.html               # Wspólna stopka (ładowana dynamicznie)
├── gallery.html              # Galeria
├── index.html                # Strona główna
├── LICENSE                   # Licencja (wszystkie prawa zastrzeżone)
├── linux.html                # Linux vs Windows
├── media.html                # Instagram i Spotify
├── menu.html                 # Wspólne menu (ładowane dynamicznie)
├── pc-mode.html              # Symulator systemu operacyjnego
├── polityka.html             # Polityka prywatności
├── regulamin.html            # Regulamin
├── robots.txt                # Reguły dla robotów (bez menu.html i footer.html)
├── shooter.html              # Gra Shooter
├── sitemap.xml               # Mapa strony dla wyszukiwarek
├── tetris.html               # Gra Tetris
├── tools-all.html            # Przydatne narzędzia
└── tools-rec.html            # Narzędzia do wideo i grafiki + poradniki YT
```

---

## ⚖️ Licencja i źródła zasobów

Kod, grafiki i teksty są własnością autora (patrz `LICENSE`). Zasoby zewnętrzne należą do ich twórców: muzyka i efekty z *Pixabay* oraz *YouTube Audio Library* (źródła podane na stronach gier), efekty systemowe PC Mode z *MyInstants*, ikony dystrybucji Linuksa z *Wikimedia Commons*.

---

## 📺 Wspieraj moją twórczość!

Jeśli podoba Ci się to, co robię, zostaw suba na moim kanale YouTube!

👉 **[Kliknij tutaj, aby zasubskrybować kanał Endixendi](https://www.youtube.com/c/Endixendi?sub_confirmation=1)** 🚀
