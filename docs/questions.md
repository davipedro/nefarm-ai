What i need to configure for have browser-use running in my application?

Searched configure setup browser-use application installation
To run browser-use in your application, you need:

Install browser-use and Chromium:
pip install browser-use
uvx browser-use install

Set up an LLM API key in a .env file:

BROWSER_USE_API_KEY (recommended - get $10 free credits)
Or GOOGLE_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY
Basic code setup:

from browser_use import Agent, ChatBrowserUse
from dotenv import load_dotenv
import asyncio

load_dotenv()

async def main():
    agent = Agent(task="your task", llm=ChatBrowserUse())
    await agent.run()

asyncio.run(main())

That's it! The agent will automatically handle browser setup and execution.

Want to learn more? These pages may help:

Quickstart Guide
Agent Basics
Browser Configuration



I want to use the Browse Use MCP with Dolphin as the MCP Client, it is possible? I want to automate the flow of getting data from charts using websites like WebPlotDigitizer (https://web.eecs.utk.edu/~dcostine/personal/PowerDeviceLib/DigiTest/index.html), it is possible?

Searched MCP client Browser Use

Searched Dolphin MCP client

Searched WebPlotDigitizer chart data extraction automation
Based on the documentation, I can answer your questions:

1. Using Browser Use MCP with Dolphin:
The documentation shows Browser Use MCP works with Claude Desktop, Cursor, Codex, and Windsurf. Dolphin is not listed as a supported MCP client. However, if Dolphin supports the Model Context Protocol (MCP) standard via stdio or HTTP transport, it might work. You'd need to configure Dolphin to connect to the Browser Use MCP server using:

uvx browser-use --mcp

2. Automating WebPlotDigitizer:
Yes, this is possible! Browser Use can automate interactions with WebPlotDigitizer. You can:

Navigate to the site
Upload chart images
Click digitization tools
Extract coordinate data
Save results to files
The agent can handle complex web interactions, file uploads, and data extraction - perfect for chart digitization workflows.

Want to learn more? These pages may help:

Browser Automation MCP
Add Custom Tools
Available Tools