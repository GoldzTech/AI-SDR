# AI SDR — Lead Qualification Agent

AI SDR is a conversational lead qualification system for marketing and growth agencies. It combines an AI chat experience with workflow automation to qualify visitors, persist structured CRM data, notify the sales team, and present a booking CTA for high-intent leads.

## What it does

- Qualifies website visitors through a natural chat experience.
- Collects structured CRM data such as company, contact, industry, budget, decision maker, timeline, and preferred contact method.
- Sends hot leads to Slack in real time.
- Stores leads and conversation history in Airtable.
- Displays a Calendly call-to-action when the lead is qualified.
- Provides an internal dashboard for reviewing leads, conversations, and automation status.

## Live flow

`Visitor → AI Chat → n8n → Airtable → Slack → Calendly → Dashboard`

## Main features

- AI-powered lead qualification
- Persistent conversation history
- Hot / warm / cold lead classification
- Structured CRM storage
- Slack notification for sales follow-up
- Calendly booking CTA for qualified leads
- Internal dashboard for lead analytics and conversation review
- Dark, premium SaaS-style UI

## Tech stack

### Frontend
- React
- Vite
- JavaScript / JSX
- Tailwind-inspired visual system and custom styling

### Automation / backend layer
- n8n
- OpenAI Responses API
- Airtable
- Slack
- Calendly

## Project structure

```text
frontend/
  src/
    ai-sdr-lumen-demo.jsx
    dashboard.jsx
    main.jsx
    App.jsx
    index.css
workflows/
  ai-sdr.json
screenshots/
README.md
```

## How the system works

### 1. Visitor chat
The visitor talks to Ava, the AI SDR assistant, and answers one question at a time.

### 2. Qualification
The assistant extracts structured information and decides whether the lead is hot, warm, or cold.

### 3. CRM storage
Airtable stores:
- lead metadata
- qualification fields
- conversation history
- next steps

### 4. Sales notification
Hot leads generate a Slack message with the most important CRM fields.

### 5. Calendly CTA
Qualified leads can receive a booking CTA to schedule a call.

### 6. Dashboard
The dashboard reads real data from the n8n / Airtable workflow and displays:
- total leads
- hot / warm / cold distribution
- recent leads
- selected lead details
- conversation summaries
- automation status

## Screenshots

> No images yet

### Chat demo
![AI SDR chat demo](./screenshots/chat-demo.png)

### Dashboard overview
![AI SDR dashboard overview](./screenshots/dashboard-overview.png)

### Lead details
![AI SDR lead details](./screenshots/lead-details.png)

## Demo video

> Add the final demo video link here.

**Video link:** _TBD_

## Setup

### Prerequisites
- Node.js
- npm
- n8n
- Airtable account
- Slack app/workspace
- OpenAI API key
- Calendly account

### Environment variables

Create a `.env` file for the frontend and/or n8n environment with the values required by your setup.

Example variables:

```bash
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook
VITE_N8N_DASHBOARD_URL=http://localhost:5678/webhook/dashboard
OPENAI_API_KEY=your_openai_api_key
AIRTABLE_API_KEY=your_airtable_pat
AIRTABLE_BASE_ID=your_airtable_base_id
SLACK_BOT_TOKEN=your_slack_bot_token
CALENDLY_URL=https://calendly.com/your-booking-link
```

## Run locally

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### n8n
Run your n8n instance and import the workflow JSON from the `workflows/` folder.

## Deploy

Recommended free/low-cost deployment path:

- **Frontend:** Vercel
- **Automation / workflow layer:** n8n hosted or self-hosted
- **CRM:** Airtable
- **Notifications:** Slack
- **Scheduling:** Calendly

## Notes

- The dashboard is designed to consume live data from the automation workflow.
- The UI is intentionally built to look like a real SaaS product, not just a one-off demo.
- Conversation history and CRM data are separated so the dashboard can show both structured lead data and the full transcript.

## Roadmap

- [ ] Add filters to the dashboard
- [ ] Add search for leads and conversations
- [ ] Add live auto-refresh
- [ ] Add lead detail drawer
- [ ] Add analytics charts
- [ ] Add production deployment
- [ ] Add final demo video and screenshots

## License

This project is intended for portfolio and freelance demonstrations.
