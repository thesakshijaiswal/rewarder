# 🪙 Rewarder

Rewarder is a full stack web app designed to engage content creators through a gamified experience. Users can manage their profiles, earn credits by staying active, and interact with a personalized content feed sourced from top platforms.

## 🚀 Features

### 🛡️ Authentication & Access Control

- JWT-based authentication.
- Role-based access (user/admin).
- Secure route protection using industry best practices.

### 📰 Feed Aggregator

- Aggregates content from **Reddit** and **Twitter**.
- Infinite scrolling and "Refresh" functionality.
- Filter by content source (Reddit / Twitter).

### 😎 Smart Twitter API Usage

- Caches tweets locally to minimize API calls and preserve quota

- Tracks monthly usage with auto-reset to avoid accidental overuse

- Falls back to realistic mock tweets when nearing rate limits

### 🙌 User Actions

- Save, Share, and Report posts.
- Earn credits for each action.

### 🛠️ Admin Actions

- Credit management (add/remove user credits).
- View user and feed analytics.
- Remove posts or clear reports.

### ✅ Testing & Validation

- Cross-browser compatibility.
- Responsive design tested across multiple devices.

## 🧰 Tech Stack

| Frontend | Backend   | Database | APIs                     |
| -------- | --------- | -------- | ------------------------ |
| React 19 | Express 5 | MongoDB  | Twitter API / Reddit API |
| Vite     | Node.js   | Mongoose |                          |

**Frontend:**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) ![React Router](https://img.shields.io/badge/React_Router-CA4245?logo=reactrouter&logoColor=white&style=for-the-badge) ![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white&style=for-the-badge) ![Recharts](https://img.shields.io/badge/Recharts-888888?style=for-the-badge&logo=react&logoColor=white)

**Backend:**  

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose-880000?logo=mongoose&logoColor=white&style=for-the-badge) ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens) ![BcryptJS](https://img.shields.io/badge/BcryptJS-003B6F?style=for-the-badge)![Cloudinary](https://img.shields.io/badge/Cloudinary-003B6F?style=for-the-badge&logo=cloudinary&logoColor=white)

---

## 📁 Folder Structure

```
Rewarder/
├── backend/
│ ├── src/
│ │ ├── controllers/
│ │ ├── lib/
│ │ ├── middleware/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── services/
│ │ └── server.js
│ ├── .env
│ ├── Dockerfile
│ ├── package.json
│ └── ...
├── frontend/
│ ├── src/
│ │ ├── assets/
│ │ ├── components/
│ │ ├── contexts/
│ │ ├── lib/
│ │ ├── pages/
│ │ ├── App.jsx
│ │ ├── index.css
│ │ └── main.jsx
│ ├── index.html
│ ├── vite.config.js
│ ├── package.json
│ └── ...
```

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/thesakshijaiswal/rewarder.git
cd rewarder
```

### 2. Set Up Environment Variables

Create a `.env` file in `/backend`:

```
MONGODB_URI=<your_mongo_uri>
JWT_SECRET=<your_jwt_secret>
TWITTER_BEARER_TOKEN=<your_token>
REDDIT_API_BASE_URL=https://www.reddit.com/
```

---

## 🔧 Run Locally

### 🖥 Backend

```bash
cd backend
npm install
npm run dev
```

### 🌐 Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📦 Scripts

### Frontend

- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview build
- `npm run lint` – lint code

### Backend

- `npm run dev` – start backend with watch and env
- `npm start` – start server

---

## ✨ Preview

<img width="1919" height="959" alt="rewarder-UI" src="https://github.com/user-attachments/assets/7b467ee8-24a8-43a1-8226-ef7cee1a838b" />

## 🛠 Developer

**Sakshi Jaiswal**

> Rewarder is built with love for content consumers and admins who want seamless interaction and moderation.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
