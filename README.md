# ReviewTube

A simple full-stack app for searching YouTube videos and posting reviews.  
Frontend built with React, backend with Node.js/Express.

---

## 📦 Dependencies

- nodejs
- npm

---

## ⚙️ Environment Variables

Create an environment variable:

```
YT_API_KEY=<your_youtube_api_key>
```

You must obtain a YouTube Data API Key from the Google Cloud Console. Store the variable in a .env file in the root directory or the project for a production build or in the server directory for running development.

---

## 🔧 Installation

```sh
git clone <repo-url>
cd ReviewTube

cd server
npm install

cd ../client
npm install
```

---

## ▶️ Running (Development)

### Backend:
```sh
cd server
npm start
```

### Frontend:
```sh
cd client
npm start
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000

---

## 🚀 Running (Production)

```sh
./build.sh
./run_prod.sh
```

http://localhost:5000
