"use client";

import { useState } from "react";
import TransitionLink from "@/components/transition/TransitionLink";
import { 
  Zap, 
  Code, 
  MessageSquare, 
  Brain, 
  ChevronRight,
  ArrowRight,
  Check,
  Star,
  Users,
  Globe,
  Cpu,
  Palette,
  FileText,
  Play,
  Sparkles,
  Menu,
  X
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <span className="text-lg sm:text-xl text-white">
              <span className="font-normal">nezar</span><span className="font-bold">ai</span>
            </span>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors underline-animate">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors underline-animate">How it Works</a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors underline-animate">Pricing</a>
              <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors underline-animate">FAQ</a>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <TransitionLink 
                href="/chat" 
                className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors"
              >
                Login
              </TransitionLink>
              <TransitionLink
                href="/chat"
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black text-xs sm:text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
              >
                Get Started
              </TransitionLink>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-gray-400 hover:text-white transition-colors py-2"
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-gray-400 hover:text-white transition-colors py-2"
              >
                How it Works
              </a>
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-gray-400 hover:text-white transition-colors py-2"
              >
                Pricing
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-gray-400 hover:text-white transition-colors py-2"
              >
                FAQ
              </a>
              <TransitionLink 
                href="/chat" 
                className="block text-sm text-gray-400 hover:text-white transition-colors py-2"
              >
                Login
              </TransitionLink>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex flex-col justify-center px-4">
        {/* Background Effects - monochrome */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-0 sm:left-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-white/5 rounded-full blur-3xl animate-blobMorph" />
          <div className="absolute top-1/3 right-0 sm:right-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-1/4 sm:left-1/3 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-white/3 rounded-full blur-3xl animate-blobMorph delay-500" />
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center pt-16 sm:pt-20">
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 sm:mb-6 animate-fadeInUp">
            <span className="text-white">
              AI Chatbot untuk
            </span>
            <br />
            <span className="text-gray-400">
              Produktivitas Maksimal
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-sm sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-10 px-2 animate-fadeInUp delay-200">
            6 AI Persona berbeda, Code Playground interaktif, dan fitur pintar lainnya. 
            Semua dalam satu platform yang elegan dan powerful.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-16 animate-fadeInUp delay-300">
            <TransitionLink
              href="/chat"
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all flex items-center justify-center gap-2 hover-lift animate-pulseGlow text-sm sm:text-base"
            >
              Mulai Gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </TransitionLink>
            <a
              href="#features"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-white/20 rounded-full hover:bg-white/5 transition-colors flex items-center justify-center gap-2 hover-scale text-sm sm:text-base"
            >
              <Play className="w-4 h-4" />
              Lihat Demo
            </a>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 md:gap-16 stagger-children">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold">6+</div>
              <div className="text-xs sm:text-sm text-gray-500">AI Personas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold">16+</div>
              <div className="text-xs sm:text-sm text-gray-500">Prompt Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold">100%</div>
              <div className="text-xs sm:text-sm text-gray-500">Gratis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold">&lt;1s</div>
              <div className="text-xs sm:text-sm text-gray-500">Response Time</div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:flex flex-col items-center gap-2">
          <span className="text-xs text-gray-500">Scroll untuk explore</span>
          <ChevronRight className="w-5 h-5 text-gray-500 rotate-90" />
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-10 sm:py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">DIPERCAYA OLEH DEVELOPER DI SELURUH INDONESIA</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-16 opacity-50 stagger-children">
            <Globe className="w-6 h-6 sm:w-8 sm:h-8 hover-scale cursor-pointer" />
            <Code className="w-6 h-6 sm:w-8 sm:h-8 hover-scale cursor-pointer" />
            <Cpu className="w-6 h-6 sm:w-8 sm:h-8 hover-scale cursor-pointer" />
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 hover-scale cursor-pointer" />
            <Palette className="w-6 h-6 sm:w-8 sm:h-8 hover-scale cursor-pointer" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-gray-400 text-xs sm:text-sm mb-4">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              FEATURES
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-2">
              Fitur yang Membuat <br className="hidden sm:block" />
              <span className="text-gray-400">
                Kamu Lebih Produktif
              </span>
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto px-2">
              Didesain untuk developer, writer, dan siapa saja yang butuh AI assistant yang powerful.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 stagger-children">
            {/* Feature 1 */}
            <div className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all hover-lift">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:border-white/30 transition-colors">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">6 AI Personas</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Pilih persona sesuai kebutuhan: Senior Developer, Tutor Sabar, Code Reviewer, Partner Kreatif, dan lainnya.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all hover-lift">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:border-white/30 transition-colors">
                <Code className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Code Playground</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Jalankan kode JavaScript, HTML, CSS langsung di browser. Edit, test, dan lihat hasilnya secara real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all hover-lift">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:border-white/30 transition-colors">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">16+ Prompt Templates</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Template siap pakai untuk coding, learning, writing, dan productivity. Hemat waktu, hasil maksimal.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all hover-lift">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:border-white/30 transition-colors">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Streaming Response</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Lihat respons AI secara real-time dengan efek typewriter yang smooth. Tidak perlu menunggu lama.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all hover-lift">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:border-white/30 transition-colors">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Context Pinning</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Pin konteks penting yang akan selalu diingat AI. Tidak perlu mengulang informasi yang sama.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all hover-lift">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:border-white/30 transition-colors">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Follow-up Suggestions</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                AI memberikan saran pertanyaan lanjutan untuk eksplorasi lebih dalam. Conversation yang natural.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-gray-400 text-xs sm:text-sm mb-4">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              HOW IT WORKS
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 px-2">
              Mulai dalam <span className="text-gray-400">3 Langkah</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 stagger-children">
            <div className="relative text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 sm:mb-6 text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform text-white">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Pilih Persona</h3>
              <p className="text-gray-400 text-sm">Pilih AI persona yang sesuai dengan kebutuhan kamu.</p>
              <div className="hidden sm:block absolute top-6 sm:top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
            </div>

            <div className="relative text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 sm:mb-6 text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform text-white">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Tanyakan atau Gunakan Template</h3>
              <p className="text-gray-400 text-sm">Ketik pertanyaan atau pilih dari 16+ template yang tersedia.</p>
              <div className="hidden sm:block absolute top-6 sm:top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 sm:mb-6 text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform text-white">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Dapatkan Jawaban</h3>
              <p className="text-gray-400 text-sm">Terima respons cerdas dengan markdown formatting yang rapi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-gray-400 text-xs sm:text-sm mb-4">
              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
              PRICING
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Pilih Plan yang <span className="text-gray-400">Cocok</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">Mulai gratis, upgrade kapan saja.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto stagger-children">
            {/* Noob Plan */}
            <div className="p-5 sm:p-8 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] hover-lift">
              <div className="text-xs sm:text-sm text-gray-400 mb-2">NOOB</div>
              <div className="text-xl sm:text-2xl font-bold mb-1">Hubungi Admin</div>
              <div className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Untuk yang baru mulai</div>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                  5 request / menit
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                  Semua AI Personas
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                  Code Playground
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                  Prompt Templates
                </li>
              </ul>
              <TransitionLink
                href="/chat"
                className="block w-full py-2.5 sm:py-3 text-center rounded-full border border-white/20 hover:bg-white/5 transition-colors text-sm"
              >
                Mulai Sekarang
              </TransitionLink>
            </div>

            {/* Pro Plan */}
            <div className="p-5 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-white/30 bg-white/5 relative hover-lift sm:col-span-2 lg:col-span-1">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black rounded-full text-[10px] sm:text-xs font-medium">
                POPULAR
              </div>
              <div className="text-xs sm:text-sm text-gray-400 mb-2">PRO</div>
              <div className="text-xl sm:text-2xl font-bold mb-1">Hubungi Admin</div>
              <div className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Untuk produktivitas maksimal</div>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white shrink-0" />
                  30 request / menit
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white shrink-0" />
                  Semua fitur Noob
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white shrink-0" />
                  Priority response
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white shrink-0" />
                  Chat history sync
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white shrink-0" />
                  Image analysis
                </li>
              </ul>
              <TransitionLink
                href="/chat"
                className="block w-full py-2.5 sm:py-3 text-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Upgrade ke Pro
              </TransitionLink>
            </div>

            {/* Hacker Plan */}
            <div className="p-5 sm:p-8 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] hover-lift">
              <div className="text-xs sm:text-sm text-gray-400 mb-2">HACKER</div>
              <div className="text-xl sm:text-2xl font-bold mb-1">Hubungi Admin</div>
              <div className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Untuk yang serius</div>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                  Unlimited requests
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                  Semua fitur Pro
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                  Custom AI training
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                  Dedicated support
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                  API access
                </li>
              </ul>
              <a
                href="mailto:contact@nezarai.com"
                className="block w-full py-2.5 sm:py-3 text-center rounded-full border border-white/20 hover:bg-white/5 transition-colors text-sm"
              >
                Hubungi Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-24 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-gray-400 text-xs sm:text-sm mb-4">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
              FAQ
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
              Pertanyaan <span className="text-gray-400">Umum</span>
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {[
              {
                q: "Apakah NezarAI gratis?",
                a: "Ya! Plan Free sepenuhnya gratis dengan 5 request per menit. Cukup untuk penggunaan personal sehari-hari."
              },
              {
                q: "AI model apa yang digunakan?",
                a: "NezarAI menggunakan Google Gemini 2.5 Flash, salah satu model AI paling canggih dan cepat saat ini."
              },
              {
                q: "Apakah data percakapan saya aman?",
                a: "Ya, keamanan data adalah prioritas kami. Percakapan disimpan secara lokal di browser atau di Firebase dengan enkripsi."
              },
              {
                q: "Bisakah saya menggunakan untuk coding?",
                a: "Tentu! Dengan persona Senior Developer dan Code Reviewer, plus Code Playground untuk test kode langsung."
              },
              {
                q: "Bagaimana cara upgrade ke Pro?",
                a: "Klik tombol Settings di aplikasi, lalu pilih plan Pro. Pembayaran bisa via transfer atau e-wallet."
              },
            ].map((faq, i) => (
              <details key={i} className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none gap-2">
                  <span className="font-medium text-sm sm:text-base">{faq.q}</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-open:rotate-90 group-hover:text-white transition-all shrink-0" />
                </summary>
                <p className="mt-3 sm:mt-4 text-gray-400 text-xs sm:text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Siap Meningkatkan <br />
            <span className="text-gray-400">
              Produktivitas Kamu?
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-xl mx-auto px-2">
            Bergabung dengan ribuan developer dan profesional yang sudah menggunakan NezarAI setiap hari.
          </p>
          <TransitionLink
            href="/chat"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors hover-lift animate-pulseGlow text-sm sm:text-base"
          >
            Mulai Sekarang - Gratis
            <ArrowRight className="w-4 h-4" />
          </TransitionLink>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <span className="text-lg sm:text-xl text-white">
              <span className="font-normal">nezar</span><span className="font-bold">ai</span>
            </span>
            
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors underline-animate">Privacy</a>
              <a href="#" className="hover:text-white transition-colors underline-animate">Terms</a>
              <a href="#" className="hover:text-white transition-colors underline-animate">Contact</a>
            </div>
            
            <div className="text-xs sm:text-sm text-gray-500">
              2025 nezarai. Made with passion.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
