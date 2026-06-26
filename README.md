# TrustStamp AI - Explainable AI Document & Image Verification Platform

TrustStamp AI is a professional, production-ready document and image forensic verification platform. Designed for educational institutions, businesses, recruiters, banks, and government agencies, it evaluates whether documents (PDFs, certificates, invoices) have been altered, metadata-modified, or tampered with.

Rather than making binary "real" or "fake" claims, TrustStamp AI focuses on **explainability**—combining multi-stage AI signals into a transparent Trust Score (0–100) and teaching users what indicators contributed to the assessment.

---

## 🚀 Key Features & AI Forensics Pipeline

1. **OCR Content Extraction**: Scans visible text from scans/PDFs, parses names, IDs, dates, and institutions, and exposes extraction confidence.
2. **EXIF/PDF Metadata Audit**: Scans metadata headers for suspicious software footprints (e.g. Adobe Photoshop, Canva) and chronological inconsistencies.
3. **Error Level Analysis (ELA)**: Re-saves image slices at 95% JPEG quality and computes pixel delta differences to highlight localized editing/copy-paste regions.
4. **Baseline Character Alignment**: Inspects text boxes from OCR to flag vertical baseline offsets (+/- pixels) indicating spliced characters.
5. **Secure QR Validation**: Decodes embedded QR verification tags and cross-references values (recipient, date, ID) with OCR visible text to find mismatches.
6. **Explainable Risk Engine**: Tallies risk deductibles, maps categories, and compiles natural language summaries and human-review recommendation guides.

---

## 🛠️ System Architecture

```
                                  +-----------------------+
                                  |   React SPA (Vite)    |
                                  |   (Port 3000)         |
                                  +-----------+-----------+
                                              |
                                              | JSON / Multipart
                                              v
                                  +-----------------------+
                                  |  FastAPI (Python)     |
                                  |  (Port 8000)          |
                                  +-----+-----+-----+-----+
                                        |     |     |
            +---------------------------+     |     +---------------------------+
            |                                 |                                 |
            v                                 v                                 v
+-----------+-----------+         +-----------+-----------+         +-----------+-----------+
|  SQLAlchemy Database  |         |  OpenCV Forensic ELA  |         |   Tesseract OCR       |
|  (SQLite / PostgreSQL)|         |  & Layout Engine      |         |   (pytesseract)       |
+-----------------------+         +-----------------------+         +-----------------------+
```

*   **Frontend**: React (Vite, JavaScript), Lucide Icons, Canvas-Confetti, pure SVG dynamic gauges, and glassmorphic CSS styling.
*   **Backend**: FastAPI, SQLAlchemy (relational database abstraction), Uvicorn.
*   **Libraries**: OpenCV-headless (image operations), Pillow (ELA filters), pdfplumber (PDF metadata/text), PyJWT (token auth).
*   **Database**: SQLite (default for zero-config local runs), PostgreSQL (fully supported via environment config).

---

## 📦 Quick Start Guides

### Option A: Running with Docker Compose (Recommended)
This runs the entire stack inside containers, automatically installing Tesseract OCR, system OpenCV libraries, and mapping directories.

1. Make sure you have **Docker** and **Docker Compose** installed.
2. From the project root, build and run the services:
   ```bash
   docker-compose up --build
   ```
3. Once running, access the services:
   *   **Frontend Interface**: [http://localhost:3000](http://localhost:3000)
   *   **Backend API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   *   **SQLite DB File**: Created automatically inside `./backend_data/db/` on the host.

---

### Option B: Running Locally (Manual Setup)

#### 1. Start the Backend
1. Make sure Python 3.10+ is installed.
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   *(Note: Ensure you are in the parent directory `/Truststamp AI` or that your `PYTHONPATH` includes the project root).*

#### 2. Start the Frontend
1. Make sure Node.js (v18+) is installed.
2. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
3. Install package dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 API Endpoint Documentation

FastAPI serves full Swagger docs at `/docs` (or Redoc at `/redoc`). Summary of main endpoints:

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| **POST** | `/api/v1/auth/register` | Open | Create new account credentials |
| **POST** | `/api/v1/auth/login` | Open | Authenticate session and get JWT bearer token |
| **GET** | `/api/v1/auth/me` | JWT | Get active user profile parameters |
| **POST** | `/api/v1/verify/upload` | JWT | Upload document file, run forensics, return report |
| **GET** | `/api/v1/reports` | JWT | List upload history with search and risk filters |
| **GET** | `/api/v1/reports/{id}` | JWT | Fetch full diagnostic details for a report |
| **DELETE**| `/api/v1/reports/{id}` | JWT | Delete a report, document registry, and files |

---

## 📊 Database Schema Details

The application maps four main entities:
*   **User**: Security accounts (email, hashed password, activation status).
*   **Document**: User file registry (size, MIME type, storage path).
*   **AnalysisReport**: Comprehensive report logs. Stores sub-pipeline parameters as native JSON objects (`ocr_results`, `metadata_results`, `forensics_results`, `qr_results`, `scoring_factors`).
*   **AuditLog**: Platform event audit logs (register, login, verify actions, IP address).

---

## 🎯 B.Tech Hackathon Demonstration Flow
To demonstrate TrustStamp AI's features, three pre-configured templates have been generated inside the `sample_data/` folder:

1. **`doc_authentic.png` (Pass Case)**:
   *   *Visuals*: A clean academic certificate award.
   *   *Scan result*: Trust score **98** (Low Risk). Confetti celebration triggers. Clear metadata, uniform compression grid, matches QR content perfectly.
2. **`doc_tampered.png` (Fail Case - Copy Paste)**:
   *   *Visuals*: The date has been altered to "June 28" (originally June 15).
   *   *Scan result*: Trust score **18** (High Risk). ELA overlay shows a bright white/cyan hot-spot glowing around the edited date text area. Alignment check flags a +3px shift. Metadata flags Adobe Photoshop edits. Date mismatch registered against decoded QR.
3. **`qr_mismatch.png` (Fail Case - QR spoofing)**:
   *   *Visuals*: The visible Certificate ID on the page was rewritten.
   *   *Scan result*: Trust score **42** (Moderate Risk). ELA passes, but QR comparison flags that the ID "GTU-88772-B" displayed on the document page does not match the actual ID "GTU-99281-A" embedded in the secure QR code.
