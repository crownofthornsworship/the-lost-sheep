# GitHub Pages migration

The original standalone game is served at index.html. Gameplay, narration, wraparound, fourteen lands and device-local progress are preserved. GitHub Pages cannot execute the Cloudflare D1 scoreboard API at /api/scores. Shared high-score reads and submissions need a separate backend deployment and cross-origin access before they work here. The original route is preserved at backend/scores-route.ts. The old hosted game remains available and has not been modified.
