# Meeting Minutes Extractor

A Node.js backend service that processes meeting notes using Google's Gemini AI to extract summaries, key decisions, and action items.

Current node version

```bash
node --version
v22.14.0
```

## Setup

1. Install dependencies:

```bash
npm install
```

The .env file is provided for this submission only.
Follow the below steps if you want to use your own gemini api key.

2. Create a `.env` file:

```
APIKEY=your_google_genai_api_key
port=3000
```

3. Start the server:

```bash
npm run dev
```

## API Usage

**POST /process-meeting**

- Accepts either file upload (.txt) OR raw text in request body
- Extracts: 2-3 sentence summary, key decisions, structured action items
- Returns clean JSON format

## Testing with curl

Sample files are availale under /test folder 

### Option 1: File Upload

```bash
curl -F "file=@test\file_1.txt" -X POST http://localhost:3000/process-meeting
```

### Expected Response Format:

```json
{
  "summary": "The team confirmed the product launch on June 10, assigned onboarding preparation and logistics follow-up, and discussed user feedback on mobile design.",
  "decisions": [
    "Launch set for June 10",
    "Need mobile-first dashboard for beta users"
  ],
  "actionItems": [
    {
      "task": "Prepare onboarding docs",
      "owner": "Ravi",
      "due": "June 5"
    },
    {
      "task": "Follow up with logistics team",
      "owner": "Priya",
      "due": null
    }
  ]
}
```

## Testing with Postman

### File Upload Method:

1. Set method to `POST`
2. URL: `http://localhost:3000/process-meeting`
3. Go to Body → form-data
4. Enter Key: `file`
5. Select file type
6. Value: Upload your `.txt` file
7. Send request

### Raw Text Method:

1. Set method to `POST`
2. URL: `http://localhost:3000/process-meeting`
3. Go to Body → raw → JSON
4. Enter: `{"file": "Team Sync – May 26 We’ll launch the new product on June 10.Ravi to prepare onboarding docs by June 5.Priya ill follow up with logistics team on packaging delay.- Beta users requested a mobile-first dashboard."}`
5. Send request

## Sample Files

Use the provided sample files, under test folder:

- `file_1.txt` 
- `file_2.txt`

## Sample Outputs

- Input 
```
Team Sync – June 9

 The team is set to launch the new product on June 10, with preparations actively underway. Ravi is responsible for preparing onboarding documentation by June 5, while Priya will follow up with the logistics team regarding a packaging delay. Beta users have requested a mobile-first dashboard, prompting Sarah to coordinate with the design team to develop mobile mockups. The marketing team requires final assets by June 8 to support launch activities. A decision was made to postpone feature X to the next release. Additionally, an all-hands meeting is scheduled for June 12 to celebrate the successful launch.
 ```
- Ouptut
```Json
{
    "summary": "Team is preparing for the new product launch on June 10. Onboarding documentation is underway, logistics are being checked, mobile mockups are being developed, and marketing assets are required. Feature X is postponed, and a celebration is planned for June 12.",
    "decisions": [
        "Postpone feature X to the next release"
    ],
    "actionItems": [
        {
            "task": "Prepare onboarding documentation",
            "owner": "Ravi",
            "due": "June 5"
        },
        {
            "task": "Follow up with the logistics team regarding a packaging delay",
            "owner": "Priya",
            "due": "NULL"
        },
        {
            "task": "Coordinate with the design team to develop mobile mockups",
            "owner": "Sarah",
            "due": "NULL"
        },
        {
            "task": "Provide final assets to the marketing team",
            "owner": "NULL",
            "due": "June 8"
        }
    ]
}
```
-Input
```
Team Sync – June 2

The Q2 Project Review Meeting held on June 1, 2024, confirmed successful completion of Q1 goals and approval of the Q2 budget. Key priorities include addressing performance issues in module B and hiring two developers by July. The team decided to allocate 40% of the budget to performance optimization and implement a new testing framework next sprint. Weekly client check-ins will start immediately, with specific action items assigned to each team member to support these initiatives.
```
- Output
  ```Json
  {
    "summary": "Q2 Project Review confirmed Q1 goals completion and approved the Q2 budget. Key priorities include addressing module B performance and hiring two developers. Budget allocation of 40% to performance optimization and implementing a new testing framework. Weekly client check-ins to start immediately.",
    "decisions": [
        "Confirmed successful completion of Q1 goals.",
        "Approved Q2 budget.",
        "Allocate 40% of budget to performance optimization.",
        "Implement new testing framework next sprint.",
        "Start weekly client check-ins immediately."
    ],
    "actionItems": [
        {
            "task": "Address performance issues in module B",
            "owner": "Team",
            "due": "NULL"
        },
        {
            "task": "Hire two developers",
            "owner": "Team",
            "due": "July"
        },
        {
            "task": "Support initiatives",
            "owner": "Each team member",
            "due": "NULL"
        }
    ]
}
  ```

## Features

- File upload validation (txt files only)
- Token limit checking (max 1M tokens)
- Request timeout protection (150s)
- Structured JSON output with summary, decisions, and action items
