import React from 'react'
import { Home, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PageNotFound = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b  flex items-center justify-center px-4">
            <div className="max-w-3xl w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                {/* Left side with illustration */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <div className="relative">
                        <div className="text-9xl font-bold text-indigo-600 opacity-10 absolute -top-12 -left-8 select-none">
                            404
                        </div>
                        <svg
                            viewBox="0 0 200 200"
                            className="w-64 h-64 md:w-80 md:h-80"
                        >
                            <path
                                fill="#6366f1"
                                d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.6,42.4C65.8,55.5,55.9,67.3,43.7,75.6C31.4,83.9,15.7,88.7,0.4,88.1C-14.9,87.4,-29.8,81.2,-43.3,73.4C-56.8,65.5,-68.9,55.9,-75.8,43.5C-82.8,31,-84.5,15.5,-83.2,0.8C-81.8,-14,-77.3,-28,-70.7,-41.6C-64.2,-55.3,-55.6,-68.5,-43.7,-76.7C-31.8,-85,-15.9,-88.2,-0.2,-87.8C15.4,-87.5,30.7,-83.6,44.7,-76.4Z"
                                transform="translate(100 100)"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-7xl font-bold text-white">404</span>
                        </div>
                    </div>
                </div>

                {/* Right side with content */}
                <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
                    <h1 className="text-4xl font-bold ">Page Not Found</h1>
                    <p className="text-lg ">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Button className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                            <Home size={18} />
                            <span>Go Home</span>
                        </Button>
                        <Button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 font-medium rounded-lg transition-colors">
                            <span>Contact Support</span>
                            <ArrowRight size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PageNotFound