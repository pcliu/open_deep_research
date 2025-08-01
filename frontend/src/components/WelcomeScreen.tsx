import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputForm } from "@/components/InputForm";
import { FileSearch, Users, Brain, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  handleSubmit: (query: string, complexity: string, model: string) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function WelcomeScreen({ handleSubmit, isLoading, onCancel }: WelcomeScreenProps) {
  const features = [
    {
      icon: <FileSearch className="h-8 w-8 text-blue-400" />,
      title: "Multi-Source Research",
      description: "Searches across web, academic papers, and specialized databases"
    },
    {
      icon: <Users className="h-8 w-8 text-purple-400" />,
      title: "Concurrent Processing",
      description: "Multiple research agents work simultaneously for faster results"
    },
    {
      icon: <Brain className="h-8 w-8 text-cyan-400" />,
      title: "Intelligent Synthesis",
      description: "Advanced AI models synthesize findings into comprehensive reports"
    },
    {
      icon: <Sparkles className="h-8 w-8 text-yellow-400" />,
      title: "Quality Focused",
      description: "Built-in evaluation ensures accurate and well-structured reports"
    }
  ];

  const exampleQueries = [
    "What are the latest developments in quantum computing for 2024?",
    "Analyze the impact of AI on healthcare diagnostics",
    "Compare renewable energy adoption rates across major economies",
    "What are the key challenges in autonomous vehicle deployment?"
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-neutral-800">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Open Deep Research
          </h1>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            Comprehensive AI-powered research agent that generates detailed reports with proper citations
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="bg-neutral-700 border-neutral-600 text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-3">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Input Form */}
        <Card className="bg-neutral-700 border-neutral-600">
          <CardHeader>
            <CardTitle className="text-white">Start Your Research</CardTitle>
          </CardHeader>
          <CardContent>
            <InputForm
              onSubmit={handleSubmit}
              onCancel={onCancel}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Example Queries */}
        <Card className="bg-neutral-700 border-neutral-600">
          <CardHeader>
            <CardTitle className="text-white text-lg">Example Research Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exampleQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSubmit(query, "medium", "openai:gpt-4")}
                  disabled={isLoading}
                  className="text-left p-3 rounded-lg bg-neutral-800 border border-neutral-600 hover:border-neutral-500 transition-colors text-neutral-200 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="text-sm">"{query}"</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-neutral-400 text-sm">
          <p>
            Powered by LangGraph • Open Source • 
            <a 
              href="https://github.com/langchain-ai/open_deep_research" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 ml-1"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}