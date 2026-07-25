import os

# URL onde o frontend está servindo (docker compose ou `npm run dev`).
BASE_URL = os.environ.get("E2E_BASE_URL", "http://localhost:5173")
