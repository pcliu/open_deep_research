import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import { useState, useEffect, useRef, useCallback } from "react";
import { ResearchEvent } from "@/components/ResearchTimeline";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ChatMessagesView } from "@/components/ChatMessagesView";
import { Button } from "@/components/ui/button";

// Model configuration mapping for different complexities
const getModelConfiguration = (complexity: string) => {
  switch (complexity) {
    case "low":
      return {
        max_concurrent_research_units: 2,
        max_researcher_iterations: 2,
        max_react_tool_calls: 3,
      };
    case "medium":
      return {
        max_concurrent_research_units: 3,
        max_researcher_iterations: 3,
        max_react_tool_calls: 5,
      };
    case "high":
      return {
        max_concurrent_research_units: 5,
        max_researcher_iterations: 5,
        max_react_tool_calls: 10,
      };
    default:
      return {
        max_concurrent_research_units: 3,
        max_researcher_iterations: 3,
        max_react_tool_calls: 5,
      };
  }
};

export default function App() {
  const [processedEventsTimeline, setProcessedEventsTimeline] = useState<ResearchEvent[]>([]);
  const [historicalActivities, setHistoricalActivities] = useState<Record<string, ResearchEvent[]>>({});
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const hasFinalReportEventOccurredRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const thread = useStream<{
    messages: Message[];
    research_brief?: string;
    notes?: string[];
    final_report?: string;
  }>({
    apiUrl: import.meta.env.DEV
      ? "http://localhost:2024"
      : "http://localhost:8123",
    assistantId: "agent",
    messagesKey: "messages",
    onUpdateEvent: (event: any) => {
      console.log("📡 Received event:", event);
      let processedEvent: ResearchEvent | null = null;
      const timestamp = new Date().toLocaleTimeString();

      // Main graph events
      if (event.clarify_with_user) {
        processedEvent = {
          title: "Clarifying Research Question",
          data: event.clarify_with_user.question || "Analyzing user input",
          timestamp,
          nodeType: "clarify_with_user",
        };
      } else if (event.write_research_brief) {
        processedEvent = {
          title: "Writing Research Brief",
          data: event.write_research_brief.research_brief || "Defining research scope and objectives",
          timestamp,
          nodeType: "write_research_brief",
        };
      } else if (event.research_supervisor) {
        processedEvent = {
          title: "Research Supervisor Active",
          data: "Coordinating research activities and managing sub-agents",
          timestamp,
          nodeType: "research_supervisor",
        };
      } else if (event.final_report_generation) {
        processedEvent = {
          title: "Generating Final Report",
          data: "Synthesizing all research findings into comprehensive report",
          timestamp,
          nodeType: "final_report_generation",
        };
        hasFinalReportEventOccurredRef.current = true;
      }

      // Research supervisor subgraph events
      else if (event.supervisor) {
        processedEvent = {
          title: "Research Planning",
          data: "Planning research topics and coordinating agents",
          timestamp,
          nodeType: "supervisor",
          subGraph: "research_supervisor",
        };
      } else if (event.supervisor_tools) {
        const researchTopics = event.supervisor_tools?.research_topics || [];
        processedEvent = {
          title: "Deploying Research Units",
          data: `Launching ${researchTopics.length} concurrent research units`,
          timestamp,
          nodeType: "supervisor_tools",
          concurrent: researchTopics.length > 1,
        };
      }

      // Researcher subgraph events
      else if (event.researcher) {
        processedEvent = {
          title: "Researcher Active",
          data: event.researcher?.research_topic || "Conducting focused research",
          timestamp,
          nodeType: "researcher",
          subGraph: "researcher_subgraph",
        };
      } else if (event.researcher_tools) {
        const toolCalls = event.researcher_tools?.tool_calls || [];
        processedEvent = {
          title: "Research Tools Executing",
          data: `Using ${toolCalls.length} research tools concurrently`,
          timestamp,
          nodeType: "researcher_tools",
          concurrent: toolCalls.length > 1,
        };
      } else if (event.compress_research) {
        processedEvent = {
          title: "Compressing Research",
          data: "Synthesizing and compressing research findings",
          timestamp,
          nodeType: "compress_research",
        };
      }

      // Generic event handling for unknown events
      else if (typeof event === 'object' && event !== null) {
        const eventKeys = Object.keys(event);
        if (eventKeys.length > 0) {
          const eventType = eventKeys[0];
          processedEvent = {
            title: `Processing: ${eventType}`,
            data: JSON.stringify(event[eventType]),
            timestamp,
            nodeType: eventType,
          };
        }
      }

      if (processedEvent) {
        setProcessedEventsTimeline((prevEvents) => [
          ...prevEvents,
          processedEvent!,
        ]);
      }
    },
    onError: (error: any) => {
      console.error("❌ Stream error:", error);
      setError(error.message || String(error));
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [thread.messages]);

  useEffect(() => {
    if (
      hasFinalReportEventOccurredRef.current &&
      !thread.isLoading &&
      thread.messages.length > 0
    ) {
      const lastMessage = thread.messages[thread.messages.length - 1];
      if (lastMessage && lastMessage.type === "ai" && lastMessage.id) {
        setHistoricalActivities((prev) => ({
          ...prev,
          [lastMessage.id!]: [...processedEventsTimeline],
        }));
      }
      hasFinalReportEventOccurredRef.current = false;
    }
  }, [thread.messages, thread.isLoading, processedEventsTimeline]);

  const handleSubmit = useCallback(
    (submittedInputValue: string, complexity: string, _model: string) => {
      if (!submittedInputValue.trim()) return;
      
      console.log("🚀 Starting research submission:", {
        query: submittedInputValue,
        complexity,
        apiUrl: import.meta.env.DEV ? "http://localhost:2024" : "http://localhost:8123",
        assistantId: "agent"
      });
      
      setProcessedEventsTimeline([]);
      hasFinalReportEventOccurredRef.current = false;
      setError(null);

      const modelConfig = getModelConfiguration(complexity);
      console.log("📊 Model configuration:", modelConfig);

      const newMessages: Message[] = [
        ...(thread.messages || []),
        {
          type: "human",
          content: submittedInputValue,
          id: Date.now().toString(),
        },
      ];

      console.log("📤 Submitting to thread:", {
        messages: newMessages,
        ...modelConfig,
      });

      try {
        thread.submit({
          messages: newMessages,
          ...modelConfig,
        });
        console.log("✅ Thread submission successful");
      } catch (error) {
        console.error("❌ Thread submission failed:", error);
        setError(String(error));
      }
    },
    [thread]
  );

  const handleCancel = useCallback(() => {
    thread.stop();
    window.location.reload();
  }, [thread]);

  return (
    <div className="flex h-screen bg-neutral-800 text-neutral-100 font-sans antialiased">
      <main className="h-full w-full max-w-7xl mx-auto">
        {thread.messages.length === 0 ? (
          <WelcomeScreen
            handleSubmit={handleSubmit}
            isLoading={thread.isLoading}
            onCancel={handleCancel}
          />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center justify-center gap-4 max-w-md text-center">
              <h1 className="text-2xl text-red-400 font-bold">Research Error</h1>
              <p className="text-red-400 text-sm">{error}</p>
              <Button
                variant="destructive"
                onClick={() => window.location.reload()}
              >
                Start Over
              </Button>
            </div>
          </div>
        ) : (
          <ChatMessagesView
            messages={thread.messages}
            isLoading={thread.isLoading}
            scrollAreaRef={scrollAreaRef}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            liveActivityEvents={processedEventsTimeline}
            historicalActivities={historicalActivities}
          />
        )}
      </main>
    </div>
  );
}