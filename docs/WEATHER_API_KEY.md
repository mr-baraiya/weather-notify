# OpenWeather Setup

This guide explains how to create an OpenWeather account, generate an API key, and add it to the project.

## Prerequisites

- An OpenWeather account: https://openweathermap.org/

## Get Your API Key

1. Go to the [OpenWeather API page](https://openweathermap.org/api).
2. Create an account or sign in.
3. Open your profile menu and choose **My API keys**.
4. Create a new key if you do not already have one.
5. Copy the key exactly as shown.

## Add the Key to `.env.local`

```env
OPENWEATHER_API_KEY=your_openweather_api_key
```

## What the App Uses It For

- Fetching live weather data for the home page and dashboard
- Looking up weather by city or by geolocation coordinates

## Notes

- New keys can take a few minutes to activate.
- Use the Current Weather Data API for this project.
- Never commit your API key to source control.
