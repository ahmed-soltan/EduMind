import { Brain, Clock, Star, Target } from "lucide-react";
import { Card, CardDescription, CardTitle } from "../../../components/ui/card";

export const BenefitsSection = () => {
  return (
    <section className="py-20 px-4 bg-gray-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Why Students Love It
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join thousands of students who have transformed their learning
            experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-800 text-center p-6">
            <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-purple-400" />
            </div>
            <CardTitle className="text-xl text-white mb-2">Save Time</CardTitle>
            <CardDescription className="text-gray-400">
              Cut study prep time by 70% with AI-generated content
            </CardDescription>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 text-center p-6">
            <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-blue-400" />
            </div>
            <CardTitle className="text-xl text-white mb-2">
              Learn Smarter
            </CardTitle>
            <CardDescription className="text-gray-400">
              Personalized learning paths adapted to your pace
            </CardDescription>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 text-center p-6">
            <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-green-400" />
            </div>
            <CardTitle className="text-xl text-white mb-2">
              Stay Motivated
            </CardTitle>
            <CardDescription className="text-gray-400">
              Track progress and celebrate achievements daily
            </CardDescription>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 text-center p-6">
            <div className="mx-auto w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-orange-400" />
            </div>
            <CardTitle className="text-xl text-white mb-2">
              Better Results
            </CardTitle>
            <CardDescription className="text-gray-400">
              Students see 40% improvement in test scores
            </CardDescription>
          </Card>
        </div>
      </div>
    </section>
  );
};
