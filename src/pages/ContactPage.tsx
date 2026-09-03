import React, { useState } from 'react';
import {
  Mail,
  MessageSquare,
  Clock,
  MapPin,
  CheckCircle2,
  Send,
  ArrowLeft,
  ShieldCheck,
  Building,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { ToolId } from '../types';

interface ContactPageProps {
  onBackToHome: () => void;
  onSelectTool?: (toolId: ToolId) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBackToHome }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    setLoading(true);
    // Simulate sending message
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <button
        onClick={onBackToHome}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Tools</span>
      </button>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
          <MessageSquare className="w-3.5 h-3.5 text-red-600" />
          <span>Support &amp; Direct Communication</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact PDFMaster Tools
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Have questions about document security, feature requests, or enterprise inquiries? Our dedicated support and developer team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Official Contact & Ownership Details */}
        <div className="space-y-6">
          {/* Support Channels Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-red-600" />
              <span>Ownership &amp; Support</span>
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Direct Support Email</p>
                  <a
                    href="mailto:beraagency085@gmail.com"
                    className="text-red-600 hover:underline break-all"
                  >
                    beraagency085@gmail.com
                  </a>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Official domain: www.pdftools.2bd.net
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Response SLA</p>
                  <p className="text-slate-600">Typically within 12–24 hours</p>
                  <p className="text-[11px] text-slate-400">Available Monday – Saturday</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Operating Entity</p>
                  <p className="text-slate-700 font-medium">Bera Agency / 2BD Network</p>
                  <p className="text-[11px] text-slate-500">
                    Digital Utilities &amp; Web Software Division
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Guarantee Info Card */}
          <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-3xl p-6 border border-emerald-200/80 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacy Assurance</span>
            </div>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              Please note: When contacting support, <strong>never attach sensitive files</strong>. All PDF processing happens on your local device—our team has no technical access to inspect or recover your documents.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Message Sent Successfully!
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to PDFMaster Tools. Our team at Bera Agency will review your message and reply to <span className="font-semibold text-slate-800">{formData.email}</span> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      subject: 'General Inquiry',
                      message: '',
                    });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    Send Us a Message
                  </h2>
                  <p className="text-xs text-slate-500">
                    Fill out the form below and we will respond as soon as possible.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="contact-name">
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="contact-email">
                      Your Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="contact-subject">
                    Subject / Topic
                  </label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition-all bg-white"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Bug Report or Issue">Bug Report / Tool Issue</option>
                    <option value="Feature Request">Suggest a New PDF Tool</option>
                    <option value="Privacy & Security Question">Privacy &amp; Security Question</option>
                    <option value="Partnership & Advertising">Partnership &amp; Advertising</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="contact-message">
                    Your Message *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    placeholder="Describe how we can help you or what feature you'd like to see..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition-all resize-y"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <p className="text-[11px] text-slate-400">
                    🔒 We respect your privacy. No marketing spam guaranteed.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-70"
                  >
                    {loading ? (
                      <span>Sending message...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
