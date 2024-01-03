# Poemotion

## About
Poemotion is a simple project that generates poems from a prompt and then analyses the emotions in the poem. This project aims to combine the creativity of poetry with the analytical power of emotion analysis.

## Installation

To run Poemotion, you need Docker installed on your machine. Once Docker is set up, you can start the application using the following command:

```bash
docker-compose --env-file .env-shared up --build
```

## Usage
After starting the application, navigate to http://localhost:3000 in your web browser to interact with Poemotion. Enter a prompt, and the application will generate a poem based on your input, followed by an analysis of the underlying emotions.

## Features
Poem Generation: Enter a creative prompt and get a unique poem as a response.
Emotion Analysis: Discover the emotional tone of each generated poem.