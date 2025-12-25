
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, Leaf, Minus, Plus, Instagram, Facebook, Twitter, Sparkles } from './Icons';
import { CartItem, PageView } from '../types';
import { generateWellnessAdvice } from '../services/geminiService';

interface LayoutProps {
  children: React.ReactNode;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  currentView: PageView;
  onChangeView: (view: PageView) => void;
}

const BrandLogo = ({ isFooter = false }: { isFooter?: boolean }) => (
  <div className="flex flex-col group cursor-pointer">
    <img 
      src="https://rwfnqhixvryzkjnzpmij.supabase.co/storage/v1/object/public/product-images/logo.png" 
      alt="ORYIZON" 
      className={`h-12 md:h-16 w-auto object-contain transition-all duration-300 ${isFooter ? 'brightness-0 invert opacity-90' : ''}`}
    />
  </div>
);

const WellnessAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setMessage('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const advice = await generateWellnessAdvice(userMsg);
    setChat(prev => [...prev, { role: 'ai', text: advice }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60]">
      {isOpen ? (
        <div className="bg-white w-[350px] md:w-[400px] h-[500px] rounded-[2.5rem] shadow-3xl border border-oryzon-accent/30 flex flex-col overflow-hidden animate-slide-up">
          <div className="bg-oryzon-dark p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-oryzon-green rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold">Wellness AI</h4>
                <p className="text-[10px] uppercase tracking-widest text-oryzon-accent/70">Oryizon Specialist</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><X className="w-5 h-5" /></button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar bg-oryzon-light/30">
            {chat.length === 0 && (
              <div className="text-center py-10">
                <Leaf className="w-12 h-12 text-oryzon-green/20 mx-auto mb-4" />
                <p className="text-oryzon-dark/60 font-serif italic text-lg px-4">"How can I help you harness the power of Moringa today?"</p>
              </div>
            )}
            {chat.map((c, i) => (
              <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${c.role === 'user' ? 'bg-oryzon-green text-white rounded-tr-none' : 'bg-white text-oryzon-dark shadow-sm border border-gray-100 rounded-tl-none'}`}>
                  {c.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 rounded-tl-none flex gap-1">
                  <span className="w-1.5 h-1.5 bg-oryzon-green/40 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-oryzon-green/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-oryzon-green/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2 bg-oryzon-light rounded-full px-4 py-1 border border-gray-200">
              <input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about Moringa benefits..." 
                className="flex-1 bg-transparent py-3 outline-none text-sm"
              />
              <button onClick={handleSend} className="text-oryzon-green hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-oryzon-dark text-white rounded-full flex items-center justify-center shadow-3xl hover:bg-oryzon-green hover:scale-110 transition-all group"
        >
          <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-oryzon-accent rounded-full animate-ping"></div>
        </button>
      )}
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, cart, setCart, currentView, onChangeView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => {
    const finalPrice = (item.discount_price && item.discount_price < item.price) ? item.discount_price : item.price;
    return acc + (finalPrice * item.quantity);
  }, 0);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const NavLink = ({ view, label }: { view: PageView, label: string }) => (
    <button
      onClick={() => { onChangeView(view); setIsMobileMenuOpen(false); }}
      className={`relative text-sm uppercase tracking-widest font-medium transition-all duration-300 hover:text-oryzon-green
        ${currentView === view ? 'text-oryzon-green font-bold' : 'text-gray-600'}
        after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-0.5 after:bg-oryzon-green after:transition-all after:duration-300 hover:after:w-full
        ${currentView === view ? 'after:w-full' : ''}
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-oryzon-light selection:bg-oryzon-green selection:text-white">
      {/* Floating Navbar */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-500 ease-in-out px-6
          ${scrolled ? 'py-4' : 'py-8'}
        `}
      >
        <div 
          className={`container mx-auto max-w-7xl px-8 py-4 rounded-full flex justify-between items-center transition-all duration-500
            ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg border border-white/40' : 'bg-transparent'}
          `}
        >
          <div onClick={() => onChangeView('HOME')}>
            <BrandLogo />
          </div>

          <div className="hidden md:flex items-center gap-10">
            <NavLink view="HOME" label="Home" />
            <NavLink view="SHOP" label="Shop" />
            <NavLink view="BENEFITS" label="Benefits" />
            <NavLink view="BLOG" label="Journal" />
            <NavLink view="TRACK_ORDER" label="Track Order" />
          </div>

          <div className="flex items-center gap-6">
            <button 
              className="relative p-3 rounded-full hover:bg-black/5 transition-colors group" 
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-6 h-6 text-oryzon-dark group-hover:scale-110 transition-transform duration-300" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-oryzon-green text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>
            <button className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-8 h-8 text-oryzon-dark" />
            </button>
          </div>
        </div>
      </nav>

      <WellnessAssistant />

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 bg-white/95 backdrop-blur-xl transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-12">
             <BrandLogo />
             <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100"><X className="w-8 h-8" /></button>
          </div>
          <div className="flex flex-col gap-8 items-center justify-center flex-1">
            <NavLink view="HOME" label="Home" />
            <NavLink view="SHOP" label="Shop" />
            <NavLink view="BENEFITS" label="Benefits" />
            <NavLink view="BLOG" label="Journal" />
            <NavLink view="TRACK_ORDER" label="Track Order" />
            <NavLink view="ABOUT" label="Our Story" />
            <NavLink view="CONTACT" label="Contact" />
          </div>
        </div>
      </div>

      {/* Elegant Cart Drawer */}
      <div className={`fixed inset-0 z-50 overflow-hidden ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div 
          className={`absolute inset-0 bg-oryzon-dark/40 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsCartOpen(false)}
        ></div>
        
        <div 
          className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white z-10">
            <h2 className="text-3xl font-serif text-oryzon-dark font-bold">Your Selection</h2>
            <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform duration-300"><X className="w-6 h-6 text-oryzon-dark" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 hide-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-oryzon-accent/30 rounded-full flex items-center justify-center animate-pulse">
                  <Leaf className="w-10 h-10 text-oryzon-green opacity-50" />
                </div>
                <p className="text-xl font-serif text-gray-500">Your bag awaits your choices.</p>
                <button 
                  onClick={() => { setIsCartOpen(false); onChangeView('SHOP'); }} 
                  className="px-8 py-3 bg-oryzon-green text-white rounded-full font-bold hover:bg-oryzon-dark transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {cart.map(item => {
                  const finalPrice = (item.discount_price && item.discount_price < item.price) ? item.discount_price : item.price;
                  return (
                    <div key={item.id} className="flex gap-6 animate-fade-in">
                      <div className="w-24 h-32 rounded-lg overflow-hidden relative flex-shrink-0">
                        <img 
                          src={item.images && item.images.length > 0 ? item.images[0] : item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-serif font-bold text-lg text-oryzon-dark leading-tight">{item.name}</h3>
                            <div className="text-right">
                                <p className="font-bold text-oryzon-green">₹{(finalPrice * item.quantity).toFixed(2)}</p>
                                {finalPrice < item.price && (
                                    <p className="text-[10px] text-gray-400 line-through">₹{(item.price * item.quantity).toFixed(2)}</p>
                                )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">{item.category}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-gray-50 rounded-full w-max px-2 py-1 border border-gray-100">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-oryzon-green transition-colors"><Minus className="w-4 h-4" /></button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-oryzon-green transition-colors"><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-8 bg-oryzon-light/50 border-t border-gray-100">
              <div className="flex justify-between text-2xl font-serif font-bold mb-8 text-oryzon-dark">
                <span>Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => { setIsCartOpen(false); onChangeView('CHECKOUT'); }}
                className="w-full bg-oryzon-dark text-white py-5 rounded-full font-bold tracking-widest uppercase hover:bg-oryzon-green transition-colors duration-300 shadow-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Cinematic Footer */}
      <footer className="bg-oryzon-dark text-white py-24 relative overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between gap-16 mb-20">
            <div className="md:w-1/3">
              <div className="mb-8 scale-110 origin-left">
                <BrandLogo isFooter />
              </div>
              <p className="text-white/60 text-lg leading-relaxed font-light mb-8">
                Harvesting the power of nature to bring you the purest Moringa Oleifera. Ethically sourced, scientifically backed, and designed for your modern wellness journey.
              </p>
              <div className="flex gap-4">
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white">
                  <Instagram className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white">
                  <Facebook className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white">
                  <Twitter className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:w-2/3">
              <div>
                <h4 className="font-serif font-bold mb-8 text-xl text-oryzon-accent">Explore</h4>
                <ul className="space-y-4 text-white/70">
                  <li><button onClick={() => onChangeView('SHOP')} className="hover:text-white hover:translate-x-1 transition-all">Shop All</button></li>
                  <li><button onClick={() => onChangeView('BENEFITS')} className="hover:text-white hover:translate-x-1 transition-all">Benefits</button></li>
                  <li><button onClick={() => onChangeView('ABOUT')} className="hover:text-white hover:translate-x-1 transition-all">Our Origins</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-serif font-bold mb-8 text-xl text-oryzon-accent">Support</h4>
                <ul className="space-y-4 text-white/70">
                  <li><button onClick={() => onChangeView('TRACK_ORDER')} className="hover:text-white hover:translate-x-1 transition-all">Track Order</button></li>
                  <li><button onClick={() => onChangeView('CONTACT')} className="hover:text-white hover:translate-x-1 transition-all">Contact Us</button></li>
                  <li><button onClick={() => onChangeView('FAQ')} className="hover:text-white hover:translate-x-1 transition-all">FAQ</button></li>
                  <li><button onClick={() => onChangeView('ADMIN')} className="hover:text-white hover:translate-x-1 transition-all text-oryzon-accent">Archive</button></li>
                </ul>
              </div>
              <div className="col-span-2 md:col-span-1">
                <h4 className="font-serif font-bold mb-8 text-xl text-oryzon-accent">Newsletter</h4>
                <p className="text-white/60 text-sm mb-6">Join our community for wellness tips.</p>
                <div className="relative">
                  <input type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:border-oryzon-accent transition-colors" />
                  <button className="absolute right-2 top-2 bg-oryzon-accent text-oryzon-dark w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center text-white/40 text-sm">
            <span>© 2024 ORYIZON Wellness. All rights reserved.</span>
            <div className="flex gap-8 mt-4 md:mt-0">
              <button onClick={() => onChangeView('PRIVACY')} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => onChangeView('TERMS')} className="hover:text-white transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
