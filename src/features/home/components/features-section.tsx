import { Brain, FileText, TrendingUp, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

export const FeaturesSection = () => {
  return (
    <section className="py-20 px-4" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Powerful Features for Modern Learning
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to transform your study experience with AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* AI Quiz Generator */}
          <Card className="bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <Brain className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-2xl text-white">
                  AI Quiz Generator
                </CardTitle>
              </div>
              <CardDescription className="text-gray-400 text-lg">
                Turn your notes or topics into quizzes in seconds.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
                    <span className="text-sm text-gray-300">
                      Question 1 of 5
                    </span>
                    <Badge
                      variant="outline"
                      className="text-purple-300 border-purple-500/30"
                    >
                      Multiple Choice
                    </Badge>
                  </div>
                  <div className="p-3 bg-gray-700/30 rounded">
                    <p className="text-white font-medium mb-2">
                      What is the primary function of mitochondria?
                    </p>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div>(A) Protein synthesis</div>
                      <div className="text-green-400">
                        (B) Energy production ✓
                      </div>
                      <div>(C) DNA storage</div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-400">
                Generate unlimited practice quizzes from any study material
              </p>
            </CardContent>
          </Card>

          {/* Study Assistant */}
          <Card className="bg-gray-900/50 border-gray-800 hover:border-blue-500/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-2xl text-white">
                  Study Assistant
                </CardTitle>
              </div>
              <CardDescription className="text-gray-400 text-lg">
                Ask questions, get instant summaries, and understand complex
                topics easily.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  <div className="flex gap-3 justify-end">
                    <div className="bg-blue-600 rounded-lg p-3 max-w-xs">
                      <p className="text-white text-sm">
                        Explain photosynthesis simply
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      AI
                    </div>
                    <div className="flex-1 bg-gray-700/50 rounded-lg p-3">
                      <p className="text-white text-sm">
                        Photosynthesis is the process by which plants convert
                        light energy into chemical energy...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-400">
                Get personalized explanations for any topic
              </p>
            </CardContent>
          </Card>

          {/* Flashcard Creator */}
          <Card className="bg-gray-900/50 border-gray-800 hover:border-green-500/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <Zap className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-2xl text-white">
                  Flashcard Creator
                </CardTitle>
              </div>
              <CardDescription className="text-gray-400 text-lg">
                Convert study material into smart flashcards for quick revision.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-6 text-center">
                  <div className="text-white font-semibold mb-2">Front</div>
                  <p className="text-lg text-white">
                    What is the capital of France?
                  </p>
                  <div className="mt-4 text-xs text-gray-400">
                    Click to reveal answer
                  </div>
                </div>
              </div>
              <p className="text-gray-400">
                Auto-generate flashcards from your notes and textbooks
              </p>
            </CardContent>
          </Card>

          {/* Progress Tracker */}
          <Card className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-orange-400" />
                </div>
                <CardTitle className="text-2xl text-white">
                  Progress Tracker
                </CardTitle>
              </div>
              <CardDescription className="text-gray-400 text-lg">
                Visualize your study journey with insights and completion stats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Weekly Goal</span>
                    <span className="text-orange-400">85%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">12</div>
                      <div className="text-xs text-gray-400">Quizzes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">4.2h</div>
                      <div className="text-xs text-gray-400">Study Time</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">89%</div>
                      <div className="text-xs text-gray-400">Accuracy</div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-400">
                Track your learning progress and identify improvement areas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
