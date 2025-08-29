import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../../../components/ui/dialog";

export const CTASection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-900/20 via-gray-900/40 to-blue-900/20 rounded-2xl p-12 border border-gray-800">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Study Smarter?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join over 50,000 students who are already learning more efficiently
            with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Get Started Free
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg bg-transparent"
                >
                  Watch Demo
                </Button>
              </DialogTrigger>
              <DialogContent>Demo Video</DialogContent>
            </Dialog>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • 14-day free trial
          </p>
        </div>
      </div>
    </section>
  );
};
