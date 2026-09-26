# Winietki weselne – generator PDF

Aplikacja w przeglądarce: wklejasz listę gości, wybierasz czcionkę (21 ozdobnych krojów z pełną obsługą polskich znaków), kolory tła i tekstu, ozdoby, ramkę, rozmiar winietki – i pobierasz PDF gotowy do druku.

- winietki płaskie lub składane (stojące, imię po obu stronach)
- druga linijka po znaku `|`, np. `Anna Nowak | Stół 3`
- automatyczne dopasowanie wielkości imienia, opcjonalnie jedna wielkość dla wszystkich
- A4 / A3 / A5 / Letter, automatyczna orientacja, znaczniki cięcia i zgięcia
- tekst w PDF jest wektorowy (ostry w każdym rozmiarze)
- wszystko działa lokalnie w przeglądarce, lista gości nigdzie nie jest wysyłana

## Uruchomienie lokalne

```
cd /ścieżka/do/winietki && python3 -m http.server 8000
```
i otwórz http://localhost:8000

## Hosting na GitHub Pages

GitHub → repozytorium → Settings → Pages → Source: „Deploy from a branch” → Branch: `main`, folder `/ (root)` → Save.

## Licencje

Czcionki: Google Fonts, SIL Open Font License 1.1. Biblioteki: pdf-lib (MIT), @pdf-lib/fontkit (MIT).
