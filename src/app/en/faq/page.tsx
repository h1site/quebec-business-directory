import type { Metadata } from 'next'
import HeaderEN from '@/components/HeaderEN'
import FooterEN from '@/components/FooterEN'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description: 'Find answers to the most frequently asked questions about the Quebec Business Registry.',
}

const faqs = [
  {
    question: 'What is the Quebec Business Registry?',
    answer: 'The Quebec Business Registry is a free online directory that lists over 600,000 Quebec businesses. Our mission is to make it easy to find local businesses by providing complete and up-to-date information.'
  },
  {
    question: 'How do I add my business to the registry?',
    answer: 'To add your business, create a free account and click on "Add a Business". Fill out the form with your business information (name, address, contact details, description, etc.) and submit your request. Your listing will be published after verification.'
  },
  {
    question: 'How do I claim my existing business listing?',
    answer: 'If your business is already listed, log in to your account and search for your business. Click on "Claim this listing" and follow the verification process. Once verified, you\'ll be able to edit your business information.'
  },
  {
    question: 'Is it free to list my business?',
    answer: 'Yes, the basic listing is completely free. You can add your business, manage your information, and respond to reviews at no cost.'
  },
  {
    question: 'Where does the business data come from?',
    answer: 'The data comes from several sources, including the Registraire des entreprises du Québec (government public data), Google Places API, and information submitted directly by business owners.'
  },
  {
    question: 'How do I update my business information?',
    answer: 'Log in to your account, go to your dashboard, and select the business you want to edit. You can update all information: contact details, description, business hours, photos, etc.'
  },
  {
    question: 'How do I remove my business listing?',
    answer: 'To remove your listing, contact us at info@h1site.com with your business details. We will process your request as soon as possible.'
  },
  {
    question: 'How do I report incorrect information?',
    answer: 'If you notice incorrect information on a listing, you can contact us at info@h1site.com specifying the corrections needed. We will verify and update the information.'
  },
  {
    question: 'What is the NEQ?',
    answer: 'The NEQ (Numéro d\'Entreprise du Québec / Quebec Business Number) is a unique identifier assigned to each business registered in Quebec. It consists of 10 digits and officially identifies a business with the government.'
  },
  {
    question: 'How do I contact support?',
    answer: 'For any questions or assistance, send us an email at info@h1site.com. We typically respond within 24 to 48 business hours.'
  }
]

export default function FAQPageEN() {
  return (
    <>
      <HeaderEN />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600">
              Find answers to your questions about the Quebec Business Registry
            </p>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 group"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h2 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h2>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-6 pt-0">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Didn&apos;t find your answer?
            </h2>
            <p className="text-gray-600 mb-6">
              Our team is here to help. Contact us and we&apos;ll get back to you as soon as possible.
            </p>
            <a
              href="mailto:info@h1site.com"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>

      <FooterEN />
    </>
  )
}
