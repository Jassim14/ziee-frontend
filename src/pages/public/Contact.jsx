import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Contact us</h1>
        <p className="text-gray-500 mt-3">Questions about ZIEE? We'd love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Mail size={22} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Email</h3>
          <a href="mailto:info@ziee.org" className="text-sm text-blue-600 hover:text-blue-700">info@ziee.org</a>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Phone size={22} className="text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Phone</h3>
          <p className="text-sm text-gray-600">+255 700 000 000</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-11 h-11 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <MapPin size={22} className="text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Office</h3>
          <p className="text-sm text-gray-600">Stone Town, Zanzibar</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a message</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('Thank you for your message. We will get back to you soon.');
            e.currentTarget.reset();
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input type="text" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
            <textarea required rows={5} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="How can we help?" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}
