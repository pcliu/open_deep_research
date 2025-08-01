# Open Deep Research Frontend

A React-based frontend for the Open Deep Research system, featuring real-time progress tracking and comprehensive research report display.

## Features

- **Real-time Progress Tracking**: Specialized timeline component that visualizes the complex LangGraph structure
- **Multi-level Visualization**: Shows main graph, supervisor subgraph, and researcher subgraph activities
- **Concurrent Operation Indicators**: Visual cues for parallel research units and tool executions
- **Research Configuration**: Adjustable complexity levels and model selection
- **Markdown Report Rendering**: Full-featured markdown display for research reports
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Ensure Backend is Running**
   The frontend expects the LangGraph server to be running on `http://localhost:2024`. Start it with:
   ```bash
   # From the root directory
   uvx --refresh --from "langgraph-cli[inmem]" --with-editable . --python 3.11 langgraph dev --allow-blocking
   ```

## Architecture

### Components

- **`App.tsx`**: Main application with streaming integration using LangGraph SDK
- **`ResearchTimeline.tsx`**: Specialized timeline for Open Deep Research's complex graph structure
- **`ChatMessagesView.tsx`**: Message display with markdown rendering and timeline integration
- **`WelcomeScreen.tsx`**: Landing page with feature overview and example queries
- **`InputForm.tsx`**: Research query input with complexity and model selection

### Progress Tracking

The frontend is specifically adapted for Open Deep Research's multi-level graph structure:

**Main Graph Events:**
- `clarify_with_user`: Analyzing and clarifying research questions
- `write_research_brief`: Creating research scope and objectives
- `research_supervisor`: Coordinating research activities
- `final_report_generation`: Synthesizing final comprehensive report

**Supervisor Subgraph Events:**
- `supervisor`: Planning research topics and coordination
- `supervisor_tools`: Deploying concurrent research units

**Researcher Subgraph Events:**
- `researcher`: Active research execution
- `researcher_tools`: Concurrent tool usage (search APIs, MCP servers)
- `compress_research`: Synthesizing and compressing findings

### Complexity Levels

- **Low**: 2 concurrent units, 2 iterations, 3 tool calls max
- **Medium**: 3 concurrent units, 3 iterations, 5 tool calls max  
- **High**: 5 concurrent units, 5 iterations, 10 tool calls max

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Lint code
npm run preview      # Preview production build
```

## Configuration

The frontend automatically detects development vs production environments:
- Development: Connects to `http://localhost:2024`
- Production: Connects to `http://localhost:8123`

## Technology Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **LangGraph SDK** for streaming connections
- **React Markdown** for report rendering
- **Lucide React** for icons