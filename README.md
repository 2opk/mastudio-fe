# MA Studio FrontEnd

This project is the frontend for the **Musical Agent Studio**, a multi-agent system for visualizing and interpreting music.

## Reproducibility & Data Disclaimer

> [!IMPORTANT]
> **Data Privacy & Hardcoded Paths**
> Major data directories (`dist/audio`, `dist/output_*`, `public/audio`, `public/output_*`) are excluded from this repository via `.gitignore` and are **not shared publicly**.
>
> - As a result, users cloning this repo **will not be able to fully reproduce the visualization** without these assets.
> - Some paths in `src/` are hardcoded to match the specific directory structure of the generated experiments.
> - If you require access to the dataset or wish to adapt this frontend for your own data, please **contact the author directly**. The application logic expects a specific JSON format which can be provided upon request.

## Local Development

Even without the full dataset, you can still run the application interface locally.

To install dependencies:
```bash
npm install
```

To run the development server:
```bash
npm run dev
```

The application will launch, but you may see errors or empty states where experiment data is missing.

---
Built with React + TypeScript + Vite.
