# AirSense Dashboard

Create a modern, production-quality frontend for my AQI Predictor application.

When the application loads, it should immediately call my backend API. While waiting for the response, display a beautiful animated loading screen with skeleton cards and loading indicators. Once the API responds, replace the loading screen with the dashboard.

The API response is:

{

  "based_on_timestamp": "2026-07-28 23:00:00+00:00",

  "predictions": [

    [

      158.63,

      152.85,

      ...

      125.46

    ]

  ]

}

Notes:

based_on_timestamp is the timestamp on which the prediction is based.

The prediction array contains exactly 72 hourly AQI predictions.

predictions[0][0] corresponds to based_on_timestamp + 1 hour.

predictions[0][71] corresponds to based_on_timestamp + 72 hours.

Do not assume predictions begin at the timestamp itself.

The dashboard should automatically calculate the correct date and time for every prediction.

Dashboard Requirements

Hero Section

Display:

Prediction generated at (formatted timestamp)

Forecast period

Next hour AQI

AQI category

Overall air quality summary

AQI Scale

The AQI values are based on my custom US AQI model.

The maximum possible AQI is 550.

Use the following ranges consistently across the application:

AQICategory0–50Good51–100Moderate101–150Unhealthy for Sensitive Groups151–200Unhealthy201–300Very Unhealthy301–550Hazardous

Use intuitive colors for each category throughout the UI.

Daily Forecast

Convert the 72 hourly predictions into calendar days.

Example:

If

Based timestamp

2026-07-28 23:00

then predictions begin at

2026-07-29 00:00

Group predictions according to their actual calendar dates, not fixed 24-hour blocks.

For every day calculate:

Average AQI

Minimum AQI

Maximum AQI

AQI category based on average

Display each day as a forecast card.

Hourly Forecast

Display all 72 predictions in chronological order.

Each row should contain:

Date

Time

AQI value (rounded to nearest integer)

AQI category

Colored status badge

Charts

Include interactive charts:

Line chart showing all 72 hourly AQI predictions.

Bar chart showing the average AQI for each day.

Area chart showing the AQI trend over the forecast period.

Tooltips should display the exact date, time, AQI value, and category.

Alerts

Automatically detect unhealthy conditions.

Generate alert cards for:

Unhealthy

Very Unhealthy

Hazardous

Examples:

"⚠️ Hazardous air quality expected on July 30 at 3:00 PM (AQI 325)."

If no dangerous values are present, display:

"No severe air quality alerts during the forecast period."

Health Recommendations

Generate recommendations based on the highest AQI expected.

Examples include limiting outdoor activity, wearing a mask, or avoiding prolonged exposure when AQI is high.

Statistics

Display summary cards for:

Next hour AQI

Highest predicted AQI

Lowest predicted AQI

Average AQI across all 72 hours

Number of Hazardous hours

Number of Very Unhealthy hours

User Experience

Include:

Beautiful dashboard layout

Smooth animations

Responsive design for desktop, tablet, and mobile

Loading skeletons

Error screen if API request fails

Refresh button to fetch predictions again

Export hourly forecast to CSV

The design should feel like a polished commercial dashboard with a clean, modern aesthetic. Use clear visual hierarchy, elegant cards, attractive charts, and thoughtful spacing. The application should look professional and intuitive rather than like a simple student project. also add the lahore hsitorc places in bg and make the theme like air and foggy for the aqis. also there is an hour wise shap explanations for each hour so accumudat ethem as well use charts graphs bars etc

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4aa7c10d-3b29-4c0d-90f0-ea5275c96c34).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
