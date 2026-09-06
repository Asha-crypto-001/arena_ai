import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail, Award, CheckCircle } from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top trust highlights */}
      <div className="border-b border-slate-800 bg-slate-950/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-100 text-sm">Vetted & Verified Educators</div>
              <div className="text-slate-400 mt-1">National ID validation, practical trade background checks & workshop inspection.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-100 text-sm">Escrow Payment Protection</div>
              <div className="text-slate-400 mt-1">Funds held securely via MTN & Airtel MoMo until training milestone is marked complete.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-100 text-sm">Hands-On Practical Learning</div>
              <div className="text-slate-400 mt-1">Real equipment, direct mentor guidance, workshop benches, and production projects.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-100 text-sm">Headquartered in Mbarara</div>
              <div className="text-slate-400 mt-1">Serving Mbarara, Greater Ankole, Western Region, Kampala, and across Uganda.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                iS
              </div>
              <div>
                <div className="text-xl font-bold text-white tracking-tight">
                  iSkillLink
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold">
                  Founder: Ashabahebwa Hassan
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              iSkillLink connects learners seeking practical, vocational, technical, and creative skills with verified Ugandan practitioners, master artisans, and professionals.
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Headquarters: Mbarara City, Western Region, Uganda</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>WhatsApp: +256 744 024 529 / +256 772 233 621</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>ashabahebwahassan665@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100 mb-4">
              Explore Skills
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => setCurrentView('find-skill')} className="hover:text-emerald-400 transition">
                  Fashion & Tailoring
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('find-skill')} className="hover:text-emerald-400 transition">
                  Web Dev & Programming
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('find-skill')} className="hover:text-emerald-400 transition">
                  Electronics & Phone Repair
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('find-skill')} className="hover:text-emerald-400 transition">
                  Solar & Electrical Wiring
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('find-skill')} className="hover:text-emerald-400 transition">
                  Commercial Baking & Pastry
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('find-skill')} className="hover:text-emerald-400 transition">
                  Dairy Farming & Agribusiness
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100 mb-4">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => setCurrentView('how-it-works')} className="hover:text-emerald-400 transition">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('become-educator')} className="hover:text-emerald-400 transition">
                  Become an Educator
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('about')} className="hover:text-emerald-400 transition">
                  About iSkillLink
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-emerald-400 transition">
                  Help & Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('find-skill')} className="hover:text-emerald-400 transition">
                  Verified Educators Directory
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100 mb-4">
              Trust & Standards
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Ugandan DIT / ERA Aligned
              </li>
              <li className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Escrow Payment Protection
              </li>
              <li className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Educator Code of Conduct
              </li>
              <li className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Safe Workshop Guidelines
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © {new Date().getFullYear()} iSkillLink Uganda • Founded by Ashabahebwa Hassan. “Where Skills Meet Opportunity.”
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Mbarara • Greater Ankole • Kampala • Entebbe • Jinja</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
