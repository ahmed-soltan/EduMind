"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Target,
  Award,
  ArrowRight,
  Lightbulb,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import dynamic from "next/dynamic";
import { GetStartedButton } from "@/features/home/components/get-started-button";

const UserButton = dynamic(
  () => import("@/components/user-button").then((mod) => mod.UserButton),
  {
    ssr: false,
  }
);

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Hero Section */}
      <section className="px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Logo size={65} fontSize={4} />
          </div>
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-200 mb-6">
            Revolutionizing Education with Artificial Intelligence
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            We're on a mission to make learning more personalized, engaging, and
            effective through the power of AI. Join thousands of students who
            are already transforming their educational journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              <Link href="/#features">
                Explore Features <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <GetStartedButton
              asChild
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 bg-transparent"
            >
              Get Started
            </GetStartedButton>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-6 py-16 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-100 mb-4">
              Our Mission
            </h3>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              To democratize quality education by leveraging AI technology that
              adapts to every student's unique learning style and pace.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-100 mb-3">
                  Personalized Learning
                </h4>
                <p className="text-gray-400">
                  AI-driven content that adapts to your learning style, pace,
                  and preferences for maximum effectiveness.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-100 mb-3">
                  Accessible Education
                </h4>
                <p className="text-gray-400">
                  Breaking down barriers to quality education, making advanced
                  learning tools available to everyone.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-100 mb-3">
                  Proven Results
                </h4>
                <p className="text-gray-400">
                  Data-driven insights and continuous improvement to ensure
                  measurable learning outcomes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-16 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-100 mb-4">
              Our Values
            </h3>
            <p className="text-lg text-gray-400">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-600/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-100 mb-2">
                Innovation
              </h4>
              <p className="text-gray-400 text-sm">
                Constantly pushing the boundaries of what's possible in
                education technology.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-100 mb-2">
                Accessibility
              </h4>
              <p className="text-gray-400 text-sm">
                Making quality education available to learners from all
                backgrounds.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-100 mb-2">
                Excellence
              </h4>
              <p className="text-gray-400 text-sm">
                Delivering the highest quality learning experiences and
                outcomes.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-600/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-yellow-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-100 mb-2">
                Community
              </h4>
              <p className="text-gray-400 text-sm">
                Building a supportive ecosystem where learners can thrive
                together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-100 mb-4">
            Ready to Transform Your Learning?
          </h3>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already experiencing the future
            of education with EduAI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GetStartedButton
              asChild
              className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white px-8 py-3"
            >
              Start Learning Now <ArrowRight className="ml-2 h-4 w-4" />
            </GetStartedButton>
            <Button
              asChild
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 bg-transparent"
            >
              <Link href="/#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
