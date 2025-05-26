import { useState } from 'react';
import { toast } from 'react-toastify';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Simulate API call
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Thanks for subscribing to our newsletter!');
      setEmail('');
      setSubmitting(false);
    }, 1000);
  };

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
      <div className="absolute left-0 top-1/4 w-40 h-40 bg-primary opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute right-0 bottom-1/4 w-40 h-40 bg-secondary opacity-5 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left content - text info */}
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
              {/* Decorative badge */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-blue-50 border border-blue-100">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-1.5"></span>
                  <span className="text-xs font-medium tracking-wide text-primary uppercase">Stay Connected</span>
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-prata text-secondary mb-3">Join Our Newsletter</h2>
              
              {/* Divider */}
              <div className="w-16 h-0.5 bg-primary mb-6"></div>
              
              <p className="text-gray-600 mb-6 max-w-md">
                Be the first to know about new collections, special events, and exclusive offers. 
                Subscribe now and enjoy <span className="font-semibold text-primary">10% off</span> your first order.
              </p>
              
              {/* Benefits list */}
              <div className="mb-8 space-y-3">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-600">Early access to new arrivals</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-600">Exclusive subscriber-only discounts</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-600">Style tips and outfit inspiration</span>
                </div>
              </div>
              
              <p className="text-gray-500 text-xs mt-auto">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
            
            {/* Right content - subscription form */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-primary/10 to-secondary/5 p-8 md:p-10 flex flex-col justify-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/50">
                <h3 className="text-xl font-medium text-secondary mb-4">Subscribe Today</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center ${
                      submitting ? 'opacity-70 cursor-wait' : ''
                    }`}
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <span>Subscribe Now</span>
                        <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
                
                {/* Social proof */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Join over 5,000 subscribers</p>
                  <div className="flex -space-x-2">
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://randomuser.me/api/portraits/women/34.jpg" alt="" />
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://randomuser.me/api/portraits/men/42.jpg" alt="" />
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://randomuser.me/api/portraits/women/55.jpg" alt="" />
                    <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://randomuser.me/api/portraits/men/23.jpg" alt="" />
                    <div className="inline-flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-white bg-gray-100 text-xs font-medium text-gray-500">+</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter; 