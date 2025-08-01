import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  MessageSquare,
  FileSearch,
  Users,
  Sparkles,
  PenTool,
  ChevronDown,
  ChevronUp,
  Search,
  Brain,
  Archive,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";

export interface ResearchEvent {
  title: string;
  data: any;
  timestamp?: string;
  nodeType?: string;
  subGraph?: string;
  concurrent?: boolean;
}

interface ResearchTimelineProps {
  processedEvents: ResearchEvent[];
  isLoading: boolean;
}

export function ResearchTimeline({
  processedEvents,
  isLoading,
}: ResearchTimelineProps) {
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState<boolean>(false);

  const getEventIcon = (event: ResearchEvent, index: number) => {
    if (index === 0 && isLoading && processedEvents.length === 0) {
      return <Loader2 className="h-4 w-4 text-neutral-400 animate-spin" />;
    }

    const title = event.title.toLowerCase();
    const nodeType = event.nodeType?.toLowerCase();

    // Main graph nodes
    if (nodeType === 'clarify_with_user' || title.includes('clarify')) {
      return <MessageSquare className="h-4 w-4 text-blue-400" />;
    }
    if (nodeType === 'write_research_brief' || title.includes('brief')) {
      return <FileSearch className="h-4 w-4 text-green-400" />;
    }
    if (nodeType === 'research_supervisor' || title.includes('supervisor')) {
      return <Users className="h-4 w-4 text-purple-400" />;
    }
    if (nodeType === 'final_report_generation' || title.includes('final')) {
      return <PenTool className="h-4 w-4 text-orange-400" />;
    }

    // Research supervisor subgraph
    if (nodeType === 'supervisor' && event.subGraph === 'research_supervisor') {
      return <Users className="h-4 w-4 text-purple-400" />;
    }
    if (nodeType === 'supervisor_tools') {
      return <Sparkles className="h-4 w-4 text-purple-400" />;
    }

    // Researcher subgraph
    if (nodeType === 'researcher' && event.subGraph === 'researcher_subgraph') {
      return <Search className="h-4 w-4 text-cyan-400" />;
    }
    if (nodeType === 'researcher_tools') {
      return <Brain className="h-4 w-4 text-cyan-400" />;
    }
    if (nodeType === 'compress_research') {
      return <Archive className="h-4 w-4 text-yellow-400" />;
    }

    // Generic fallbacks based on content
    if (title.includes('research') || title.includes('search')) {
      return <Search className="h-4 w-4 text-cyan-400" />;
    }
    if (title.includes('generating') || title.includes('writing')) {
      return <FileText className="h-4 w-4 text-green-400" />;
    }
    if (title.includes('thinking') || title.includes('processing')) {
      return <Loader2 className="h-4 w-4 text-neutral-400 animate-spin" />;
    }

    return <FileText className="h-4 w-4 text-neutral-400" />;
  };

  const getEventColor = (event: ResearchEvent) => {
    const nodeType = event.nodeType?.toLowerCase();
    
    if (nodeType === 'clarify_with_user') return 'border-l-blue-400';
    if (nodeType === 'write_research_brief') return 'border-l-green-400';
    if (nodeType === 'research_supervisor') return 'border-l-purple-400';
    if (nodeType === 'final_report_generation') return 'border-l-orange-400';
    if (nodeType === 'supervisor' || nodeType === 'supervisor_tools') return 'border-l-purple-400';
    if (nodeType === 'researcher' || nodeType === 'researcher_tools') return 'border-l-cyan-400';
    if (nodeType === 'compress_research') return 'border-l-yellow-400';
    
    return 'border-l-neutral-600';
  };

  const formatEventData = (data: any): string => {
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data.join(", ");
    if (typeof data === "object" && data !== null) {
      // Handle specific data structures from Open Deep Research
      if (data.research_topic) return `Research Topic: ${data.research_topic}`;
      if (data.compressed_research) return `Research completed`;
      if (data.notes) return `Notes: ${Array.isArray(data.notes) ? data.notes.length : 1} items`;
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  useEffect(() => {
    if (!isLoading && processedEvents.length !== 0) {
      setIsTimelineCollapsed(true);
    }
  }, [isLoading, processedEvents]);

  return (
    <Card className="border-none rounded-lg bg-neutral-700 max-h-96 w-full">
      <CardHeader>
        <CardDescription className="flex items-center justify-between">
          <div
            className="flex items-center justify-start text-sm w-full cursor-pointer gap-2 text-neutral-100"
            onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
          >
            Deep Research Progress
            {isTimelineCollapsed ? (
              <ChevronDown className="h-4 w-4 mr-2" />
            ) : (
              <ChevronUp className="h-4 w-4 mr-2" />
            )}
          </div>
        </CardDescription>
      </CardHeader>
      {!isTimelineCollapsed && (
        <ScrollArea className="max-h-96 overflow-y-auto">
          <CardContent>
            {isLoading && processedEvents.length === 0 && (
              <div className="relative pl-8 pb-4">
                <div className="absolute left-3 top-3.5 h-full w-0.5 bg-neutral-600" />
                <div className="absolute left-0.5 top-2 h-5 w-5 rounded-full bg-neutral-600 flex items-center justify-center ring-4 ring-neutral-700">
                  <Loader2 className="h-3 w-3 text-neutral-400 animate-spin" />
                </div>
                <div>
                  <p className="text-sm text-neutral-300 font-medium">
                    Initializing research...
                  </p>
                </div>
              </div>
            )}
            {processedEvents.length > 0 ? (
              <div className="space-y-0">
                {processedEvents.map((eventItem, index) => (
                  <div 
                    key={`${eventItem.timestamp || index}-${eventItem.title}`} 
                    className={`relative pl-8 pb-4 border-l-2 ${getEventColor(eventItem)} ml-2`}
                  >
                    {index < processedEvents.length - 1 ||
                    (isLoading && index === processedEvents.length - 1) ? (
                      <div className="absolute left-3 top-3.5 h-full w-0.5 bg-neutral-600" />
                    ) : null}
                    <div className="absolute left-0.5 top-2 h-6 w-6 rounded-full bg-neutral-600 flex items-center justify-center ring-4 ring-neutral-700">
                      {getEventIcon(eventItem, index)}
                    </div>
                    <div className="pl-2">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-neutral-200 font-medium">
                          {eventItem.title}
                        </p>
                        {eventItem.concurrent && (
                          <span className="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded">
                            Concurrent
                          </span>
                        )}
                        {eventItem.subGraph && (
                          <span className="text-xs bg-neutral-500 text-white px-1.5 py-0.5 rounded">
                            {eventItem.subGraph}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {formatEventData(eventItem.data)}
                      </p>
                      {eventItem.timestamp && (
                        <p className="text-xs text-neutral-500 mt-1">
                          {eventItem.timestamp}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && processedEvents.length > 0 && (
                  <div className="relative pl-8 pb-4 border-l-2 border-l-neutral-600 ml-2">
                    <div className="absolute left-0.5 top-2 h-5 w-5 rounded-full bg-neutral-600 flex items-center justify-center ring-4 ring-neutral-700">
                      <Loader2 className="h-3 w-3 text-neutral-400 animate-spin" />
                    </div>
                    <div className="pl-2">
                      <p className="text-sm text-neutral-300 font-medium">
                        Processing...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500 pt-10">
                <FileSearch className="h-6 w-6 mb-3" />
                <p className="text-sm">No research activity yet.</p>
                <p className="text-xs text-neutral-600 mt-1">
                  Timeline will update during research process.
                </p>
              </div>
            ) : null}
          </CardContent>
        </ScrollArea>
      )}
    </Card>
  );
}