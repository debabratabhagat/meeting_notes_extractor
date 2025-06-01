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

## Features

- File upload validation (txt files only)
- Token limit checking (max 1M tokens)
- Request timeout protection (150s)
- Structured JSON output with summary, decisions, and action items
