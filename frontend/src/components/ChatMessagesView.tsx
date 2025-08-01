import type { Message } from "@langchain/langgraph-sdk";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { InputForm } from "@/components/InputForm";
import { ResearchTimeline, ResearchEvent } from "@/components/ResearchTimeline";
import ReactMarkdown from "react-markdown";
import { User, Bot } from "lucide-react";

interface ChatMessagesViewProps {
  messages: Message[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: (query: string, complexity: string, model: string) => void;
  onCancel: () => void;
  liveActivityEvents: ResearchEvent[];
  historicalActivities: Record<string, ResearchEvent[]>;
}

export function ChatMessagesView({
  messages,
  isLoading,
  scrollAreaRef,
  onSubmit,
  onCancel,
  liveActivityEvents,
  historicalActivities,
}: ChatMessagesViewProps) {
  const renderMessage = (message: Message, index: number) => {
    const isUser = message.type === "human";
    const isAI = message.type === "ai";
    
    if (!isUser && !isAI) return null;

    return (
      <div key={`${message.id || index}`} className="space-y-4">
        <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
          {!isUser && (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="h-4 w-4 text-white" />
            </div>
          )}
          
          <div className={`max-w-[85%] ${isUser ? "order-first" : ""}`}>
            <Card className={`${
              isUser 
                ? "bg-blue-600 text-white border-blue-600" 
                : "bg-neutral-700 text-neutral-100 border-neutral-600"
            }`}>
              <CardContent className="p-4">
                {isUser ? (
                  <p className="whitespace-pre-wrap">{String(message.content)}</p>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-xl font-bold text-neutral-100 mb-3 mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-semibold text-neutral-100 mb-2 mt-4">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-medium text-neutral-200 mb-2 mt-3">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-neutral-200 mb-3 leading-relaxed">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-6 mb-3 text-neutral-200">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-6 mb-3 text-neutral-200">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="mb-1">{children}</li>
                        ),
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            {children}
                          </a>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-neutral-500 pl-4 italic text-neutral-300 my-3">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-sm">
                              {children}
                            </code>
                          ) : (
                            <pre className="bg-neutral-800 text-neutral-200 p-3 rounded-lg overflow-x-auto text-sm">
                              <code>{children}</code>
                            </pre>
                          );
                        },
                      }}
                    >
                      {String(message.content)}
                    </ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {isUser && (
            <div className="w-8 h-8 rounded-full bg-neutral-600 flex items-center justify-center flex-shrink-0 mt-1">
              <User className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        {/* Show historical activities for completed AI messages */}
        {!isUser && message.id && historicalActivities[message.id] && (
          <div className="ml-11">
            <ResearchTimeline
              processedEvents={historicalActivities[message.id]}
              isLoading={false}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((message, index) => renderMessage(message, index))}
          
          {/* Show live activity timeline when loading */}
          {isLoading && liveActivityEvents.length > 0 && (
            <div className="ml-11">
              <ResearchTimeline
                processedEvents={liveActivityEvents}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-neutral-700 p-4">
        <div className="max-w-4xl mx-auto">
          <InputForm
            onSubmit={onSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}