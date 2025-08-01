import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Send, Square } from "lucide-react";

interface InputFormProps {
  onSubmit: (query: string, complexity: string, model: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function InputForm({ onSubmit, onCancel, isLoading }: InputFormProps) {
  const [query, setQuery] = useState("");
  const [complexity, setComplexity] = useState("medium");
  const [model, setModel] = useState("openai:gpt-4");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim(), complexity, model);
    }
  };

  const handleCancel = () => {
    if (isLoading) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-200">
          Research Question
        </label>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your research question or topic..."
          className="min-h-[100px] bg-neutral-800 border-neutral-600 text-neutral-100 placeholder:text-neutral-400 resize-none"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-200">
            Research Complexity
          </label>
          <Select 
            value={complexity} 
            onValueChange={setComplexity}
            disabled={isLoading}
          >
            <SelectTrigger className="bg-neutral-800 border-neutral-600 text-neutral-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-600">
              <SelectItem value="low" className="text-neutral-100">
                Low - Quick overview (1-2 research units)
              </SelectItem>
              <SelectItem value="medium" className="text-neutral-100">
                Medium - Balanced research (3-5 research units)
              </SelectItem>
              <SelectItem value="high" className="text-neutral-100">
                High - Comprehensive analysis (5+ research units)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-200">
            Research Model
          </label>
          <Select 
            value={model} 
            onValueChange={setModel}
            disabled={isLoading}
          >
            <SelectTrigger className="bg-neutral-800 border-neutral-600 text-neutral-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-600">
              <SelectItem value="openai:gpt-4" className="text-neutral-100">
                OpenAI GPT-4
              </SelectItem>
              <SelectItem value="openai:gpt-4-turbo" className="text-neutral-100">
                OpenAI GPT-4 Turbo
              </SelectItem>
              <SelectItem value="anthropic:claude-3-5-sonnet-20241022" className="text-neutral-100">
                Claude 3.5 Sonnet
              </SelectItem>
              <SelectItem value="anthropic:claude-3-5-haiku-20241022" className="text-neutral-100">
                Claude 3.5 Haiku
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              Researching...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Start Research
            </>
          )}
        </Button>
        
        {isLoading && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            className="px-6"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        )}
      </div>
    </form>
  );
}