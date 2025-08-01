# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Open Deep Research is a fully open-source deep research agent that automates comprehensive research and generates detailed reports. The system uses LangGraph architecture with hierarchical multi-agent coordination and concurrent processing.

## Development Commands

### Environment Setup
```bash
# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -r pyproject.toml
```

### Development Server
```bash
# Start LangGraph development server with Studio UI
uvx --refresh --from "langgraph-cli[inmem]" --with-editable . --python 3.11 langgraph dev --allow-blocking

# Access points:
# - API: http://127.0.0.1:2024
# - Studio UI: https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024
# - API Docs: http://127.0.0.1:2024/docs
```

### Testing and Quality
```bash
# Run quality tests on report generation
python tests/run_test.py --agent multi_agent  # Test multi-agent implementation
python tests/run_test.py --agent graph        # Test graph-based implementation

# Run comprehensive batch evaluation
python tests/run_evaluate.py

# Code quality (from pyproject.toml)
ruff check                    # Lint code
ruff format                   # Format code
mypy src/                     # Type checking
pytest                        # Run tests
```

## Core Architecture

### Main Components

**Primary Graph (`deep_researcher.py`):**
- `clarify_with_user`: Determines if clarification is needed before research
- `write_research_brief`: Generates research summary and scope
- `research_supervisor`: Multi-level concurrent research coordination (subgraph)
- `final_report_generation`: Synthesizes all research into comprehensive report

**Research Supervisor Subgraph:**
- `supervisor`: Plans research topics and coordinates researcher agents
- `supervisor_tools`: Concurrently invokes multiple `researcher_subgraph` instances
- Supports configurable max concurrent research units (default: 5)

**Researcher Subgraph:**  
- `researcher`: Agent with all available tools for research execution
- `researcher_tools`: Concurrent tool execution (search APIs, MCP servers, etc.)
- `compress_research`: Synthesizes research findings into structured notes

### Concurrency Model

The system implements three-level concurrency:
1. **Research Topic Level**: Multiple researcher subgraphs run in parallel
2. **Tool Level**: Within each researcher, multiple tools execute concurrently  
3. **Tool Internal**: Individual tools may perform concurrent operations

## Key Configuration Files

- `langgraph.json`: LangGraph server configuration, graph definitions, auth
- `pyproject.toml`: Dependencies, dev tools (ruff, mypy), package configuration
- `.env`: Model configurations, API keys, search tool settings

## State Management

**Core State Fields:**
- `messages`: User input and conversation history
- `research_brief`: Generated research scope and objectives
- `supervisor_messages`: Research coordination messages
- `notes`: Compressed research findings from all agents
- `final_report`: Synthesized comprehensive report

## Model Requirements

All models must support:
- Structured outputs (Pydantic models)
- Tool calling functionality
- Search API compatibility (Tavily works with all models; native search requires matching provider)

**Specialized Model Roles:**
- Summarization Model: Processes search results
- Research Model: Conducts research and analysis
- Compression Model: Synthesizes findings from sub-agents  
- Final Report Model: Writes comprehensive reports

## Search and Tool Integration

**Built-in Search APIs:** Tavily, OpenAI Native Web Search, Anthropic Native Web Search, ArXiv, PubMed, DuckDuckGo, Exa

**MCP Server Support:** Filesystem operations, remote servers with JWT authentication, custom tool integration

## Legacy Implementations

`src/legacy/` contains two alternative implementations:
- **Graph-based Workflow** (`graph.py`): Plan-and-execute with human-in-the-loop
- **Multi-Agent** (`multi_agent.py`): Supervisor-researcher architecture with parallel processing

## Frontend Development

**Technology Stack:**
- React 19 + TypeScript + Vite
- Tailwind CSS + Radix UI components
- LangGraph SDK for streaming connections
- React Markdown for report rendering

**Development Commands:**
```bash
cd frontend
npm install           # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Lint code
```

**Frontend Architecture:**
- `App.tsx`: Main application with streaming integration
- `ResearchTimeline.tsx`: Specialized progress tracking for Open Deep Research graph structure
- `ChatMessagesView.tsx`: Message display with markdown rendering
- `WelcomeScreen.tsx`: Landing page with feature overview
- `InputForm.tsx`: Research query input with complexity/model selection

**Progress Tracking Adaptation:**
The frontend includes a specialized timeline component that tracks Open Deep Research's complex graph structure:
- Main graph nodes: clarify_with_user → write_research_brief → research_supervisor → final_report_generation
- Supervisor subgraph: supervisor ↔ supervisor_tools (with concurrent research unit deployment)
- Researcher subgraph: researcher ↔ researcher_tools → compress_research (with concurrent tool execution)
- Visual indicators for concurrent operations and subgraph context

## Evaluation System

The system includes comprehensive quality evaluation across 9 criteria:
- Topic relevance, structure, citations, section quality
- Results tracked in LangSmith for analysis
- Both manual testing and batch evaluation support