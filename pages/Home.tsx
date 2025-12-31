
import React from 'react';
import { View } from '../App';

interface HomeProps {
  onNavigate: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-[2.5rem] overflow-hidden min-h-[500px] flex items-center bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1596760411126-af948542121c?auto=format&fit=crop&q=80&w=2000" 
          alt="Bengaluru Vidhana Soudha" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10 px-8 md:px-16 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-indigo-300 text-sm font-bold border border-white/10">
            <i className="fas fa-map-marker-alt"></i> Bengaluru Community First
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
            For a Better <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Bengaluru.</span>
          </h1>
          <p className="text-xl text-slate-200">
            Your direct link to your Ward Councillor. Report potholes, street lights, or waste issues in seconds and see the change happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => onNavigate('signup')}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-2xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
            >
              Join the Community
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-white/20 transition-all"
            >
              Member Login
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid with Images */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-slate-900">How "Fix My Ward" Works</h2>
          <p className="text-slate-500 max-w-2xl mx-auto italic">Bridging the gap between citizens and administration using AI.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { 
              img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800', 
              icon: 'fa-bullhorn', 
              title: '1. Report an Issue', 
              desc: 'Spot an infrastructure problem? Take a photo and let our AI categorize and route it instantly.' 
            },
            { 
              img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800', 
              icon: 'fa-map-location-dot', 
              title: '2. Real-time Tracking', 
              desc: 'Stay updated as your councillor acknowledges and schedules the repair. Complete transparency.' 
            },
            { 
              img: 'https://images.unsplash.com/photo-1522071823991-b5182991e38f?auto=format&fit=crop&q=80&w=800', 
              icon: 'fa-check-double', 
              title: '3. Verified Resolution', 
              desc: 'Only marked as resolved once the work is inspected. Your feedback ensures quality.' 
            }
          ].map((feat, i) => (
            <div key={i} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="h-56 overflow-hidden relative">
                <img src={feat.img} alt={feat.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-indigo-600">
                  <i className={`fas ${feat.icon} text-lg`}></i>
                </div>
              </div>
              <div className="p-8 text-center space-y-3">
                <h3 className="text-xl font-bold text-slate-900">{feat.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Impact / Gallery */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-white grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-black">Join 10,000+ Citizens making Bengaluru better.</h2>
          <p className="text-slate-400 text-lg">
            Our platform has helped resolve over 5,000 infrastructure reports across Bengaluru wards in the last 6 months. Together, we can build a world-class city.
          </p>
          <div className="flex gap-4">
             <div className="text-center">
               <p className="text-3xl font-bold text-indigo-400">85%</p>
               <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Resolution Rate</p>
             </div>
             <div className="w-px h-10 bg-white/10 mx-4"></div>
             <div className="text-center">
               <p className="text-3xl font-bold text-emerald-400">24h</p>
               <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Avg Response</p>
             </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=400" className="rounded-2xl h-48 w-full object-cover shadow-2xl rotate-2" alt="Community" />
          <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=400" className="rounded-2xl h-48 w-full object-cover shadow-2xl -rotate-2 mt-8" alt="Meeting" />
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-12 md:p-16 space-y-8 bg-indigo-600 text-white">
            <h2 className="text-3xl font-black">Contact Fix My Ward</h2>
            <p className="text-indigo-100">Have questions about our platform or want to register as a government body? Reach out to our Bengaluru central team.</p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <p className="font-bold">Main Headquarters</p>
                  <p className="text-indigo-100 text-sm">Level 4, City Civic Hub, Residency Road,<br/>Bengaluru, KA 560001</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-phone-volume"></i>
                </div>
                <div>
                  <p className="font-bold">Helpline (9 AM - 6 PM)</p>
                  <p className="text-indigo-100 text-sm">+91 80 4567 8900</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-envelope-open-text"></i>
                </div>
                <div>
                  <p className="font-bold">Email Support</p>
                  <p className="text-indigo-100 text-sm">support@fixmyward.in</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-12 md:p-16 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="text" 
                placeholder="Your Name" 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <textarea 
                rows={4} 
                placeholder="How can we help you?" 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              ></textarea>
              <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg">
                Submit Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
