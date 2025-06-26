# F1 PaaS Application 🚗🏁

A cloud-based Platform as a Service (PaaS) app for managing and comparing Formula 1 driver and team statistics. Inspired by Wikipedia, this project enables user-generated content with secure login and access control.

## 🔧 Tech Stack

**Frontend**
- Jinja2 (HTML Templating)
- Bootstrap & Tailwind CSS
- JavaScript
- Firebase SDK

**Backend**
- FastAPI (REST API)
- Uvicorn (ASGI Server)
- Pydantic (Data Validation)

**Database & Cloud**
- Google Firestore (NoSQL Database)
- Firebase Authentication (User Login)
- Google Cloud Storage (Optional Media Assets)
- Google App Engine (Hosting & Deployment)

## ✨ Features

- 🔐 **Firebase Authentication:** Secure login/logout flow
- 🧑‍✈️ **Driver Management:** Add, update, delete, and query F1 drivers
- 🏎️ **Team Management:** CRUD for F1 teams with key stats
- 🔍 **Advanced Querying:** Filter by various metrics (e.g., wins, age, etc.)
- ⚖️ **Comparison Tool:** Compare two drivers or teams side-by-side
- 📱 **Responsive UI:** Designed using Bootstrap + Tailwind
- ☁️ **Deployed on Google Cloud Platform**

## 📁 Project Structure

ASSIGNMENT_F1_PAAS/
├── routes/ # API routes for auth, drivers, teams, comparison
├── static/ # JS and CSS assets
├── templates/ # Jinja2 HTML templates
├── .env # Environment variables
├── app.yaml # App Engine config
├── main.py # FastAPI entry point
├── models.py # Pydantic data models
├── config.py # App config
└── requirements.txt # Python dependencies


## 🚀 Deployment

1. **Create Google Cloud Project**
2. **Enable Firestore, Cloud Storage, App Engine**
3. **Add Firebase credentials (serviceAccountKey.json)**
4. **Deploy with:**
   ```bash
   gcloud app deploy
   gcloud app browse

🌐 Live Demo: https://f1-paas-project.uc.r.appspot.com

🔮 Future Improvements
Role-based admin controls

Real-time Firestore updates

Advanced filtering capabilities
