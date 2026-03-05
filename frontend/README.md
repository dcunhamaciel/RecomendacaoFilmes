🎬 Movie Recommendation System

A web application that displays user profiles and movie listings, allowing users to rate movies and receive personalized recommendations.
The system is structured using a modular architecture (View, Controller, Service) and integrates with a backend API for ratings and recommendations.

📁 Project Structure

index.html – Main HTML file for the application

index.js – Application entry point

view/ – DOM manipulation and UI rendering (MovieView, UserView)

controller/ – Controllers that coordinate views, services, and events

service/ – API communication and business logic

data/ – JSON mock data (if applicable)

backend/ – API for movies, users, and ratings (if separated)

🚀 Setup and Run
1️⃣ Install dependencies
npm install
2️⃣ Start the application
npm start
3️⃣ Open in browser
http://localhost:8080

If using a backend API, make sure it is running before starting the frontend.

✨ Features

User selection with profile details

Movie catalog displayed in responsive grid layout (4 per row on desktop)

Movie rating (1–5 stars)

Visual indication of movies already rated by the selected user

Average movie rating display

Recommendation trigger based on selected user

Clean MVC-inspired architecture with event-based communication

🧠 Architecture Overview

The project follows a modular pattern:

Views handle rendering and DOM interaction

Controllers coordinate user actions and application flow

Services communicate with APIs and handle data operations

Events system decouples modules for better maintainability

This structure makes the application easier to scale and extend.

🔮 Future Enhancements

TensorFlow.js recommendation engine integration

Collaborative filtering (user similarity)

Content-based filtering (genre preference analysis)

Rating analytics dashboard

UI enhancement (interactive star rating component)