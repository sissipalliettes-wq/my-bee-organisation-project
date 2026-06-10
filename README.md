# Bee Organisation

A static beige-and-green productivity dashboard with a daily honey-jar streak widget and a weekly beehive streak-freeze reward page.

## Run locally

Serve the repository root with any static file server, for example:

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Streak feature

- The dashboard shows a bottom-right daily streak widget.
- The widget displays seven honey jars, one for each day of the week.
- Jars start grey and become honey-colored when the day is logged.
- Clicking the widget opens the streak-freeze page.
- Users can open the beehive once each week to claim one streak freeze.
