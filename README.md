# OMDB Movie Search App

## Overview

The **OMDb Movie Search App** is an Angular 16+ standalone component project that allows users to search for movies and TV titles using the OMDb API. The app provides a **responsive interface**, displays results in **table and grid layouts**, supports **lightbox viewing**, and persists data in **local storage**.

**Key Features:**

- Fetch movies from OMDb API by title and optionally by year.
- Display results in table or poster grid layouts.
- Click posters to open a detailed lightbox view.
- Responsive design for mobile and desktop.
- Local storage persistence to retain movie data across reloads.
- Random movie generation if no data exists in local storage.

---

## Technologies Used

- Angular 19+ (Standalone Components)
- TypeScript
- RxJS (BehaviorSubject, Observables)
- HTML, SCSS/CSS
- OMDb API
- Local Storage
- HttpClient

---

## Installation & Setup

Clone the repository

git clone https://github.com/yourusername/omdb-angular-app.git
cd omdb-angular-app

Install dependencies

npm install

Add OMDb API key

Open src/environments/environment.ts and set your API key:

export const environment = {
production: false,
key: "&apikey=YOUR_OMDB_API_KEY"
};

Run the app

ng serve

Navigate to http://localhost:4200 in your browser.
