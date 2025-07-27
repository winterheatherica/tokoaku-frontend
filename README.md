# 🛍️ Tokoaku Frontend

Tokoaku Frontend is the web interface for the Tokoaku e-commerce platform, built using [Next.js](https://nextjs.org/) with the App Router architecture. It connects seamlessly with the backend REST API and Firebase Authentication, while integrating with third-party services like Google Maps, Cloudinary, and more.

---

## 🚀 Features

- Firebase Authentication (Email/Password & Google Login)
- Product browsing with variants, cart, and checkout
- Order management and invoice preview
- Image upload via Cloudinary
- Address selector using Google Maps API
- Dashboard for both Customers and Sellers

---

## 🧱 Tech Stack

| Category           | Technology                  |
|--------------------|-----------------------------|
| Frontend Framework | Next.js (App Router)        |
| Language           | JavaScript / React          |
| Auth               | Firebase Authentication     |
| Styling            | Custom CSS (no Tailwind)    |
| API Integration    | REST API (from Go Fiber)    |
| Address Mapping    | Google Maps API             |

---

## ⚙️ Environment Variables

Rename the .env.example file to .env, then manually fill in all the required values.

---

## 🚀 Running the Project

1. **Clone the repository**

```bash
git clone https://github.com/winterheatherica/tokoaku-frontend.git
cd tokoaku-frontend
```

2. **Copy the .env.example file and rename it:**

```bash
cp .env.example .env
```

3. **Install dependencies**

```bash
npm install
# or
yarn
```

4. **Start the server**

```bash
npm run dev
# or
yarn dev
``` 
