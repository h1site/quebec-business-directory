import type { Metadata } from 'next'
import Link from 'next/link'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'

export const metadata: Metadata = {
  title: 'Blog | Quebec Registry',
  description: 'Discover our videos and tips for Quebec businesses. Tutorials, guides and resources.',
}

const videos = [
  {
    id: 'video-1',
    title: 'How to create a business listing on Quebec Registry',
    description: 'Learn step by step how to register your business on our platform and maximize your visibility.',
    youtubeId: 'dQw4w9WgXcQ', // To be replaced with real ID
    date: '2024-11-15',
  },
  {
    id: 'video-2',
    title: 'Optimize your online presence in Quebec',
    description: 'Tips and tricks to improve your Quebec business SEO and online visibility.',
    youtubeId: 'dQw4w9WgXcQ', // To be replaced with real ID
    date: '2024-11-10',
  },
  {
    id: 'video-3',
    title: 'Benefits of being listed on Quebec Registry',
    description: 'Discover why thousands of businesses trust our directory.',
    youtubeId: 'dQw4w9WgXcQ', // To be replaced with real ID
    date: '2024-11-05',
  },
]

export default function BlogPageEN() {
  return (
    <>
      <HeaderEN />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
            <p className="text-xl text-gray-600">
              Videos and tips for Quebec businesses
            </p>
          </div>

          {/* Videos Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {videos.map((video) => (
              <article key={video.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* YouTube Embed */}
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <time className="text-sm text-gray-500 mb-2 block">
                    {new Date(video.date).toLocaleDateString('en-CA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {video.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* YouTube Channel CTA */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-center text-white">
            <div className="text-5xl mb-4">▶️</div>
            <h3 className="text-2xl font-bold mb-2">
              Subscribe to our YouTube Channel
            </h3>
            <p className="text-red-100 mb-6 max-w-md mx-auto">
              Don&apos;t miss any of our new videos and tutorials to grow your business.
            </p>
            <a
              href="https://www.youtube.com/@H1SiteOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Subscribe to the Channel
            </a>
          </div>

          {/* Facebook Group */}
          <div className="mt-8 bg-blue-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Join our Community
            </h3>
            <p className="text-gray-600 mb-4">
              Connect with other Quebec entrepreneurs on our Facebook group.
            </p>
            <a
              href="https://www.facebook.com/groups/registreduquebec"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1877f2] text-white font-semibold rounded-lg hover:bg-[#166fe5] transition-colors"
            >
              <span className="w-5 h-5 bg-white text-[#1877f2] rounded-full flex items-center justify-center text-xs font-bold">f</span>
              Join the Group
            </a>
          </div>
        </div>
      </main>

      <FooterEN />
    </>
  )
}
