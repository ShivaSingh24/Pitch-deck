import { Upload, Brain, Share } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload your file",
      description: "Simply drag and drop your PDF or image file to get started.",
    },
    {
      icon: Brain,
      title: "AI reads the content",
      description: "Our AI analyzes your content and understands the key information.",
    },
    {
      icon: Share,
      title: "Get post + image ready to share",
      description: "Receive a complete marketing post with engaging text and visuals.",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your content into engaging marketing posts in just three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="bg-[#f4d9f8] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-[#c54dd8]" />
                </div>
                <div className="bg-[#c54dd8] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
