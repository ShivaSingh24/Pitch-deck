import { Github, Twitter, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Creaco<span style={{ color: '#c54dd8' }}>AI</span>
            </h3>
            <p className="text-gray-400 mb-4">
              Transform your content into engaging marketing posts with the power of AI.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-2">
              <a
                href="mailto:hello@aimarketing.com"
                className="flex items-center text-gray-400 hover:text-[#c54dd8] transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                shivasinghjadon9927@gmail.com
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                className="text-gray-400 hover:text-[#c54dd8] transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com"
                className="text-gray-400 hover:text-[#c54dd8] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="https://linkedin.com"
                className="text-gray-400 hover:text-[#c54dd8] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2024 AI Marketing Assistant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
