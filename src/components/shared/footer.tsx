'use client'

import { ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { APP_NAME } from '@/lib/constants'
import { useState, useEffect, useRef } from 'react'

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When footer comes into view
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the footer is visible
    );
    
    if (footerRef.current) {
      observer.observe(footerRef.current);
    }
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const backToTopButton = document.getElementById('back-to-top');
      if (backToTopButton) {
        if (scrollTop > 300) {
          backToTopButton.classList.add('opacity-100');
          backToTopButton.classList.remove('opacity-0');
        } else {
          backToTopButton.classList.add('opacity-0');
          backToTopButton.classList.remove('opacity-100');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <footer ref={footerRef} className="bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-black to-blue-900 opacity-80"></div>
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-700 to-blue-400"></div>
        <div className={`absolute -bottom-10 -left-10 w-1/3 h-1/3 bg-blue-700 rounded-full filter blur-3xl opacity-0 transition-opacity duration-1000 ${isVisible ? 'opacity-20 animate-pulse' : ''}`}></div>
        <div className={`absolute -top-10 -right-10 w-1/3 h-1/3 bg-blue-600 rounded-full filter blur-3xl opacity-0 transition-opacity duration-1000 ${isVisible ? 'opacity-10 animate-pulse' : ''}`} style={{animationDelay: '2s'}}></div>
      </div>

      {/* Back to Top Button */}
      <div className="w-full relative z-10">
        <Button
          id="back-to-top"
          variant="ghost"
          className="bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 w-full rounded-none py-4 transition-all duration-500 transform hover:-translate-y-1 opacity-0 group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="flex items-center justify-center">
            <div className="relative">
              <ChevronUp className="h-5 w-5 text-white transition-transform duration-500 group-hover:-translate-y-1" />
              <div className="absolute -inset-1 rounded-full bg-white/20 animate-ping opacity-0 group-hover:opacity-100"></div>
            </div>
            <span className="ml-2 font-medium tracking-wide">BACK TO TOP</span>
          </div>
        </Button>
      </div>
      
      {/* Main Footer Content */}
      <div className={`relative z-10 max-w-7xl mx-auto px-4 pt-16 pb-12 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {/* Company Info with Animation */}
          <div className={`space-y-6 transition-all duration-700 ${isVisible ? 'translate-x-0' : 'translate-x-10 opacity-0'}`}>
            <div className="relative inline-block">
              <h2 className="text-2xl font-bold tracking-tight">{APP_NAME}</h2>
              <div className={`absolute h-1 w-0 bg-gradient-to-r from-blue-500 to-blue-300 bottom-0 left-0 transform translate-y-2 transition-all duration-1000 ${isVisible ? 'w-20' : ''}`}></div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Leading the industry with innovative solutions since 2000.
              Our mission is to provide excellence through creativity and technology.
            </p>
            <div className="pt-2">
              <p className="text-sm text-gray-400">
                © 2000-2024, {APP_NAME}, Inc. or its affiliates
              </p>
            </div>
          </div>
          
          {/* Quick Links with Hover Effect */}
          <div className={`space-y-6 transition-all duration-700 delay-100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative inline-block">
              <h3 className="text-xl font-bold tracking-tight">Quick Links</h3>
              <div className={`absolute h-1 w-0 bg-gradient-to-r from-blue-500 to-blue-300 bottom-0 left-0 transform translate-y-2 transition-all duration-1000 ${isVisible ? 'w-16' : ''}`}></div>
            </div>
            <ul className="space-y-3">
              {[
                { href: '/page/conditions-of-use', text: 'Conditions of Use' },
                { href: '/page/privacy-policy', text: 'Privacy Notice' },
                { href: '/page/help', text: 'Help Center' },
                { href: '/page/careers', text: 'Careers' }
              ].map((link, index) => (
                <li key={index} className="overflow-hidden">
                  <Link 
                    href={link.href} 
                    className="group flex items-center text-gray-300 hover:text-blue-300 transition-all duration-300"
                  >
                    <span className="w-0 group-hover:w-6 overflow-hidden transition-all duration-300 h-5 flex items-center">
                      <span className="transform translate-x-2">→</span>
                    </span>
                    <span className="group-hover:border-b group-hover:border-blue-500 pb-1 transition-all duration-300">{link.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Newsletter Signup */}
          <div className={`space-y-6 transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative inline-block">
              <h3 className="text-xl font-bold tracking-tight">Stay Updated</h3>
              <div className={`absolute h-1 w-0 bg-gradient-to-r from-blue-500 to-blue-300 bottom-0 left-0 transform translate-y-2 transition-all duration-1000 ${isVisible ? 'w-16' : ''}`}></div>
            </div>
            <p className="text-gray-300 text-sm">Subscribe to our newsletter for the latest updates and offers.</p>
            <div className="relative mt-2 group">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-gray-900 border-0 border-b-2 border-gray-700 group-hover:border-blue-500 focus:border-blue-400 transition-colors duration-300 p-2 text-sm outline-none text-white placeholder-gray-500"
              />
              <button className="absolute right-0 top-0 p-2 text-gray-400 hover:text-blue-500 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="pt-4">
              <p className="text-xs text-gray-500">We respect your privacy. Unsubscribe at any time.</p>
            </div>
          </div>
          
          {/* Contact with Animated Icons */}
          <div className={`space-y-6 transition-all duration-700 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative inline-block">
              <h3 className="text-xl font-bold tracking-tight">Get in Touch</h3>
              <div className={`absolute h-1 w-0 bg-gradient-to-r from-blue-500 to-blue-300 bottom-0 left-0 transform translate-y-2 transition-all duration-1000 ${isVisible ? 'w-16' : ''}`}></div>
            </div>
            <address className="not-italic text-sm text-gray-300 space-y-4">
              <div className="flex items-center group">
                <div className="w-8 h-8 rounded-full bg-gray-800 group-hover:bg-blue-900 flex items-center justify-center mr-3 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="group-hover:text-blue-400 transition-colors duration-300">123, Main Street, Anytown, CA, 12345</span>
              </div>
              
              <div className="flex items-center group">
                <div className="w-8 h-8 rounded-full bg-gray-800 group-hover:bg-blue-900 flex items-center justify-center mr-3 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="group-hover:text-blue-400 transition-colors duration-300">+1 (123) 456-7890</span>
              </div>
              
              <div className="flex items-center group">
                <div className="w-8 h-8 rounded-full bg-gray-800 group-hover:bg-blue-900 flex items-center justify-center mr-3 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="group-hover:text-blue-400 transition-colors duration-300">contact@{APP_NAME.toLowerCase()}.com</span>
              </div>
            </address>
          </div>
        </div>
        
        {/* Social Media & Final Note */}
        <div className={`mt-16 pt-8 border-t border-gray-800 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-wrap justify-center gap-6">
            {/* Social Media Icons with Hover Animations */}
            {[
              { name: 'Facebook', icon: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' },
              { name: 'Instagram', icon: 'M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z' },
              { name: 'Twitter', icon: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' },
              { name: 'GitHub', icon: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' },
              { name: 'LinkedIn', icon: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' }
            ].map((social, index) => (
              <a 
                key={index}
                href="#" 
                className={`group transition-all duration-700 delay-${700 + (index * 100)} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                aria-label={social.name}
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-500 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d={social.icon} clipRule="evenodd" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
          
          <div className={`mt-8 text-center transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center space-x-2">
              <span className="text-xs text-gray-500">Made with</span>
              <div className="relative w-6 h-6 flex items-center justify-center">
                <span className="absolute animate-ping opacity-75 text-blue-500">♥</span>
                <span className="relative text-blue-500">♥</span>
              </div>
              <span className="text-xs text-gray-500">by the {APP_NAME} team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}