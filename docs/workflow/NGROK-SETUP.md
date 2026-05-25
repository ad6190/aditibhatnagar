# ngrok Setup for Slack Integration

Here's the complete step-by-step guide to get your Slack integration working locally via ngrok.

---

## Part 1: Install ngrok

```bash
# Install ngrok via Homebrew
brew install ngrok

# Sign up for free account (optional but recommended for longer tunnels)
# Go to https://dashboard.ngrok.com/signup
# Then authenticate locally:
ngrok config add-authtoken <your-auth-token>
```

If you don't authenticate, ngrok will work but sessions will be limited to 2 hours and you'll get a random subdomain each time. With auth, you get longer sessions and consistent subdomains.

---

## Part 2: Create Relay Server

You need a small server that receives Slack commands and forwards them to Claude Code.

**Option A: Python Relay (Recommended)**

Create `relay_server.py`:

```python
from flask import Flask, request
import json
import subprocess
import os

app = Flask(__name__)

# Store Slack webhook URL from environment
SLACK_WEBHOOK = os.getenv("SLACK_WEBHOOK_URL")

@app.route('/webhook/slack', methods=['POST'])
def slack_webhook():
    try:
        payload = request.form
        command = payload.get('command')
        text = payload.get('text')
        user_id = payload.get('user_id')
        user_name = payload.get('user_name')
        channel_id = payload.get('channel_id')
        
        # Parse the request
        if command == '/start-feature':
            # Invoke Claude Code orchestrator
            # This is a subprocess call that runs the Orchestrator agent prompt
            result = subprocess.run([
                'claude',
                'orchestrator',
                f'Feature request from {user_name}: {text}'
            ], capture_output=True, text=True)
            
            # Send immediate acknowledgment back to Slack
            if SLACK_WEBHOOK:
                import requests
                requests.post(SLACK_WEBHOOK, json={
                    "text": f"✅ Feature request received: {text}\nStarting workflow..."
                })
            
            return {"response_type": "in_channel", "text": "Workflow started..."}
        
        return {"error": "Unknown command"}, 400
    
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == '__main__':
    app.run(port=3000, debug=False)
```

Install Flask:
```bash
pip install flask requests
```

Run the relay:
```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
python relay_server.py
```

**Option B: Simple Node.js Relay**

Create `relay_server.js`:

```javascript
const express = require('express');
const axios = require('axios');
const { exec } = require('child_process');
const app = express();

app.use(express.urlencoded({ extended: true }));

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

app.post('/webhook/slack', async (req, res) => {
  try {
    const { command, text, user_id, user_name, channel_id } = req.body;
    
    if (command === '/start-feature') {
      // Invoke Claude Code orchestrator
      exec(`claude orchestrator 'Feature request from ${user_name}: ${text}'`, 
        async (error, stdout, stderr) => {
          if (SLACK_WEBHOOK) {
            await axios.post(SLACK_WEBHOOK, {
              text: `✅ Feature request received: ${text}\nStarting workflow...`
            });
          }
        });
      
      return res.json({ response_type: 'in_channel', text: 'Workflow started...' });
    }
    
    res.status(400).json({ error: 'Unknown command' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Relay server running on :3000'));
```

Install dependencies:
```bash
npm init -y
npm install express axios
```

Run:
```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
node relay_server.js
```

---

## Part 3: Start ngrok Tunnel

In a separate terminal:

```bash
# Create tunnel pointing to your relay server
ngrok http 3000

# Output will show:
# Forwarding    https://abc123def456.ngrok.io -> http://localhost:3000
# Copy the https URL for the next step
```

Keep this terminal open. The URL `https://abc123def456.ngrok.io` is what you'll give to Slack.

---

## Part 4: Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name: "Claude Code AI"
4. Choose your workspace
5. Click "Create App"

---

## Part 5: Configure Slash Command

In your Slack app settings:

1. Go to **Features** → **Slash Commands**
2. Click **Create New Command**
3. Fill in:
   - **Command:** `/start-feature`
   - **Request URL:** `https://abc123def456.ngrok.io/webhook/slack` (your ngrok URL)
   - **Short Description:** "Start AI-assisted feature development"
   - **Usage Hint:** `[feature description]`
4. Click **Save**

---

## Part 6: Configure Incoming Webhook (for Claude to post back to Slack)

1. Go to **Features** → **Incoming Webhooks**
2. Click **Add New Webhook to Workspace**
3. Select channel (e.g., `#ai-features` or create one)
4. Click **Allow**
5. Copy the webhook URL (looks like `https://hooks.slack.com/services/...`)
6. Save it as environment variable:
   ```bash
   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
   ```

---

## Part 7: Add OAuth Scopes

In your Slack app settings:

1. Go to **Features** → **OAuth & Permissions**
2. Under **Bot Token Scopes**, add:
   - `chat:write` (post messages)
   - `commands` (slash commands)
   - `users:read` (identify users)
3. Install app to workspace if not already done

---

## Part 8: Test the Integration

1. In your Slack workspace, go to `#ai-features` (or whichever channel you chose)
2. Type: `/start-feature Add a dark mode toggle`
3. Should see immediate response: "Workflow started..."
4. Your relay server receives the request
5. Claude Code Orchestrator is invoked
6. Within minutes, you should see status updates in Slack

Check your relay server terminal to see the requests coming in:
```
127.0.0.1 - - [25/May/2026 10:30:45] "POST /webhook/slack HTTP/1.1" 200
```

---

## Part 9: Wire Claude Code to Respond

The relay server needs to call the Claude Code Orchestrator. You have two options:

**Option A: Shell Command (Simplest)**

In your relay server, replace the subprocess call with:
```bash
claude orchestrator "Feature request from john.doe: Add dark mode toggle"
```

This assumes `claude` CLI is in your PATH and Orchestrator agent exists.

**Option B: Direct API Call (More Robust)**

If using Claude Code agent SDK, call the agent directly in your relay script instead of subprocess.

---

## Part 10: Transition from ngrok to Production

Once you've tested locally with ngrok, move to production:

**Option A: AWS Lambda + API Gateway**
- Deploy relay_server.py as Lambda function
- Configure API Gateway with `/webhook/slack` endpoint
- Update Slack slash command URL to your API Gateway URL
- Use AWS Secrets Manager for webhook URLs

**Option B: Heroku**
```bash
heroku create your-app-name
heroku config:set SLACK_WEBHOOK_URL="..."
git push heroku main
# Update Slack Command URL to your Heroku app URL
```

**Option C: Railway, Fly.io, or other PaaS**
- Similar to Heroku
- Deploy relay_server.py or relay_server.js
- Set environment variables for webhook URL
- Point Slack to your deployment URL

---

## Troubleshooting

**"Request URL failed" when testing slash command in Slack:**
- Check ngrok is running: `ngrok http 3000`
- Check relay server is running: `python relay_server.py` or `node relay_server.js`
- Verify Slack Command URL matches ngrok URL exactly
- Check relay server logs for incoming requests

**Claude Code not invoked:**
- Verify `claude orchestrator` command works locally
- Check relay server subprocess call includes correct agent name
- Add logging to relay server to confirm it's being called

**Status updates not showing in Slack:**
- Verify `SLACK_WEBHOOK_URL` environment variable is set
- Check that incoming webhook was configured correctly
- Confirm bot has `chat:write` scope

**ngrok URL changed (if not authenticated):**
- Re-run `ngrok http 3000` for new URL
- Update Slack slash command URL with new ngrok URL
- With auth token, URL stays consistent

---

## Team Instructions (After Setup)

Once ngrok and relay are running:

```
To start a feature workflow:

1. In Slack, go to #ai-features
2. Type: /start-feature [feature description]
3. Example: /start-feature Add dark mode toggle so users can use the blog at night
4. Slack responds with confirmation
5. Orchestrator agent starts workflow (runs in background)
6. Status updates appear in Slack every 5 minutes
7. When complete, PR link appears in Slack
8. Team reviews PR on GitHub and merges when ready
```

---

**Last updated:** 2026-05-25
