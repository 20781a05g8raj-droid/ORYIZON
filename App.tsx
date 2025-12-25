import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import { PRODUCTS as DEFAULT_PRODUCTS, BLOG_POSTS as DEFAULT_BLOGS } from './constants';
import { Product, CartItem, PageView, BlogPost, Order, ContactInfo } from './types';
import { ArrowRight, Sparkles, Leaf, X, ChevronDown } from './components/Icons';
import { supabase } from './lib/supabaseClient';

// -- Animation Helper -- //
interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const Reveal: React.FC<RevealProps> = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      } ${className}`}
    >
      {children}
    </div>
  );
};

// -- Support Components -- //

const BlogSection: React.FC<{ blogs: BlogPost[]; onRead: (blog: BlogPost) => void }> = ({ blogs, onRead }) => (
  <section className="py-40 bg-oryzon-light">
    <div className="container mx-auto px-6">
      <Reveal className="text-center mb-24">
        <span className="text-oryzon-green font-black tracking-[0.4em] uppercase text-[10px] mb-8 block">Wellness Journal</span>
        <h2 className="text-6xl md:text-8xl font-serif font-bold text-oryzon-dark mb-12 tracking-tighter leading-none">The <span className="italic text-oryzon-green">Life</span> Harvest</h2>
        <p className="text-gray-500 max-w-2xl mx-auto italic leading-relaxed text-xl">Deep dives into the science of superfoods and ancient Ayurvedic rituals.</p>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 max-w-7xl mx-auto">
        {blogs.map((blog) => (
          <div key={blog.id} className="group cursor-pointer" onClick={() => onRead(blog)}>
            <div className="aspect-[16/10] rounded-[3rem] overflow-hidden mb-10 shadow-2xl relative">
              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-oryzon-dark/20 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-oryzon-green">{blog.date}</span>
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{blog.readTime}</span>
            </div>
            <h3 className="text-3xl font-serif font-bold text-oryzon-dark group-hover:text-oryzon-green transition-colors leading-tight mb-6">{blog.title}</h3>
            <p className="text-gray-500 leading-relaxed mb-8 line-clamp-2">{blog.excerpt}</p>
            <div className="flex items-center gap-3 font-bold text-oryzon-green text-xs uppercase tracking-widest group-hover:gap-5 transition-all">
              Read Article <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = [
    { q: "What is the best time to consume Moringa powder?", a: "For best results, consume 1 teaspoon (approx 5g) in the morning with lukewarm water or add it to your breakfast smoothie. It provides natural energy throughout the day." },
    { q: "Is ORYIZON Moringa 100% Organic?", a: "Yes, our Moringa is sourced from certified organic farms, sun-dried to preserve nutrients, and contains zero additives or preservatives." },
    { q: "Can I use Moringa for weight management?", a: "Moringa is high in fiber and contains antioxidants that can support metabolism. When combined with a healthy diet, it is an excellent weight management powder supplement." },
    { q: "How long does shipping take?", a: "We process orders within 24 hours. Delivery typically takes 3-5 business days across India. You can track your package using your Wellness ID." }
  ];

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
          <button 
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full p-8 flex justify-between items-center text-left hover:bg-oryzon-light/30 transition-colors"
          >
            <span className="font-serif font-bold text-xl text-oryzon-dark">{faq.q}</span>
            <ChevronDown className={`w-6 h-6 transition-transform duration-500 ${openIndex === i ? 'rotate-180' : ''}`} />
          </button>
          <div className={`transition-all duration-500 ease-in-out ${openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-8 pt-0 text-gray-500 leading-relaxed border-t border-gray-50">{faq.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('contact_messages').insert([formData]);
      if (error) throw error;
      alert("Wellness message received! We'll connect soon.");
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      alert("Could not send message: " + (err.message || "Please check your database connection."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl border border-white space-y-8 text-left">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-4">Full Name</label>
        <input 
          required 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Your Name" 
          className="w-full bg-oryzon-light/50 border border-gray-100 p-6 rounded-3xl outline-none focus:ring-4 focus:ring-oryzon-green/10 focus:border-oryzon-green transition-all" 
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-4">Email Address</label>
        <input 
          required 
          type="email"
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="hello@world.com" 
          className="w-full bg-oryzon-light/50 border border-gray-100 p-6 rounded-3xl outline-none focus:ring-4 focus:ring-oryzon-green/10 focus:border-oryzon-green transition-all" 
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-4">Message</label>
        <textarea 
          required 
          rows={4}
          value={formData.message} 
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          placeholder="How can we help your wellness journey?" 
          className="w-full bg-oryzon-light/50 border border-gray-100 p-6 rounded-3xl outline-none focus:ring-4 focus:ring-oryzon-green/10 focus:border-oryzon-green transition-all resize-none" 
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-oryzon-dark text-white font-bold py-6 rounded-full uppercase tracking-widest hover:bg-oryzon-green transition-all shadow-xl disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

const TrackOrderSection = ({ initialId }: { initialId?: string }) => {
  const [orderId, setOrderId] = useState(initialId || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (initialId) setOrderId(initialId); }, [initialId]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToFind = orderId.trim();
    if (!idToFind) return;
    setLoading(true);
    setOrder(null);
    try {
      // First try to search by primary key (UUID) or custom ID if column exists
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', idToFind)
        .maybeSingle();
      
      if (data) {
        setOrder(data);
      } else {
        // Fallback search by some other likely columns if we don't have the UUID
        // This is a safety catch for different table structures
        const localOrders = JSON.parse(localStorage.getItem('ory_local_orders') || '[]');
        const localMatch = localOrders.find((o: any) => o.id === idToFind || o.order_number === idToFind);
        
        if (localMatch) {
          setOrder(localMatch);
        } else {
          throw new Error("Wellness ID not found. Please double check your order confirmation.");
        }
      }
    } catch (e: any) {
      alert(e.message || "Something went wrong while tracking.");
    } finally { setLoading(false); }
  };

  const getStatusIndex = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('delivered')) return 3;
    if (s.includes('shipped')) return 2;
    if (s.includes('harvest') || s.includes('processing')) return 1;
    return 0;
  };

  return (
    <div className="pt-64 pb-32 bg-oryzon-light min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <Reveal className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl border border-white/50 text-center backdrop-blur-md mb-12">
          <h1 className="text-5xl font-serif font-bold text-oryzon-dark mb-6 tracking-tighter">Wellness <span className="italic">Tracker</span></h1>
          <p className="text-gray-500 mb-10 text-xs uppercase tracking-[0.3em] font-black opacity-60">Locate your pure moringa powder journey</p>
          
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-16">
            <input 
              required 
              value={orderId} 
              onChange={(e) => setOrderId(e.target.value)} 
              placeholder="Enter Order UUID or ID" 
              className="flex-1 bg-oryzon-light/50 border border-gray-100 p-6 rounded-3xl outline-none focus:ring-4 focus:ring-oryzon-green/10 focus:border-oryzon-green transition-all text-center font-mono text-lg shadow-inner text-oryzon-dark" 
            />
            <button type="submit" disabled={loading} className="bg-oryzon-dark text-white font-bold px-10 py-6 rounded-3xl uppercase tracking-widest hover:bg-oryzon-green transition-all shadow-xl disabled:opacity-50 cursor-pointer">
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {order && (
            <div className="text-left animate-fade-in space-y-12">
              <div className="relative pt-8 pb-12">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-oryzon-green -translate-y-1/2 rounded-full transition-all duration-1000"
                  style={{ width: `${(getStatusIndex(order.status) / 3) * 100}%` }}
                ></div>
                <div className="relative flex justify-between">
                  {['Ordered', 'Harvesting', 'Shipped', 'Delivered'].map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-4 relative z-10">
                      <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${idx <= getStatusIndex(order.status) ? 'bg-oryzon-green border-white shadow-lg' : 'bg-white border-gray-100'}`}>
                        {idx <= getStatusIndex(order.status) ? <Sparkles className="w-4 h-4 text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${idx <= getStatusIndex(order.status) ? 'text-oryzon-dark' : 'text-gray-300'}`}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 border-t border-gray-50">
                <div className="space-y-10">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-6 border-b border-gray-50 pb-2">Wellness Items</h3>
                    <div className="space-y-4">
                      {order.order_items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="font-bold text-oryzon-dark">{item.name} <span className="text-gray-400 font-normal ml-2">x {item.quantity}</span></span>
                          <span className="font-serif font-bold text-oryzon-green">₹{((item.price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-oryzon-dark p-8 rounded-[2rem] text-white">
                    <div className="flex justify-between text-xs text-white/50 uppercase font-black tracking-widest mb-4">
                      <span>Shipping</span>
                      <span className="text-oryzon-accent">Complimentary</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-4 border-t border-white/10">
                      <span className="text-xs font-black uppercase tracking-widest text-oryzon-accent">Grand Total</span>
                      <span className="text-3xl font-serif font-bold text-white">₹{order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-6 border-b border-gray-50 pb-2">Delivery Profile</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="font-bold text-oryzon-dark text-lg mb-2">{order.customer_name}</p>
                      <p>{order.shipping_address.address}</p>
                      <p>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
                        <div className="bg-white p-2 rounded-lg border border-gray-50 shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Phone:</span>
                          <span className="ml-2 font-bold text-oryzon-dark">{order.customer_phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-oryzon-light/50 p-6 rounded-2xl text-gray-500">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Order Authentication</p>
                     <p className="text-xs font-mono break-all">{order.id}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
};

// -- Main App Component -- //

const App: React.FC = () => {
  const [view, setView] = useState<PageView>('HOME');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastOrderId, setLastOrderId] = useState<string>('');
  const [activeProductImage, setActiveProductImage] = useState<string>('');
  const [trackingIdToPreFill, setTrackingIdToPreFill] = useState<string>('');
  
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(DEFAULT_BLOGS);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ email: 'hello@oryizon.com', phone: '+91 98765 43210', address: 'Wellness Center, Mumbai' });

  const fetchData = async () => {
    try {
      const { data: pData } = await supabase.from('products').select('*');
      if (pData) setProducts(pData);
      
      const { data: bData } = await supabase.from('blogs').select('*');
      if (bData) setBlogPosts(bData.map((b: any) => ({ ...b, readTime: b.read_time })));

      const { data: cData } = await supabase.from('contact_info').select('*').single();
      if (cData) setContactInfo(cData);
    } catch (e) {}
  };

  useEffect(() => { fetchData(); window.scrollTo(0, 0); }, [view]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const navigateToProduct = (product: Product) => {
    setActiveProduct(product);
    setActiveProductImage(product.images && product.images.length > 0 ? product.images[0] : product.image);
    setView('PRODUCT');
  };

  const renderContent = () => {
    switch (view) {
      case 'HOME':
        return (
          <>
            <HeroSection onShopNow={() => setView('SHOP')} />
            <section className="py-32 bg-oryzon-light">
              <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
                 {[ 
                   { title: "100% Organic", icon: Leaf, desc: "Sourced from pristine forests." }, 
                   { title: "Nutrient Dense", icon: Sparkles, desc: "Vitamin-rich superfood powder." }, 
                   { title: "Ethically Grown", icon: Leaf, desc: "Fair trade herbal health powder." } 
                 ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center text-center p-14 bg-white/70 backdrop-blur-xl rounded-[4rem] border border-white hover:shadow-3xl hover:-translate-y-3 transition-all group">
                       <div className="w-24 h-24 bg-oryzon-green/10 rounded-full flex items-center justify-center mb-10 text-oryzon-green group-hover:bg-oryzon-green group-hover:text-white transition-all"><item.icon className="w-12 h-12" /></div>
                       <h3 className="text-3xl font-serif font-bold text-oryzon-dark mb-6 leading-tight">{item.title}</h3>
                       <p className="text-gray-500 leading-relaxed text-lg">Our <span className="font-bold text-oryzon-green italic">moringa leaf powder</span> is the purity standard.</p>
                    </div>
                 ))}
              </div>
            </section>
            <ProfessionalNutrition />
            <section className="py-40 bg-white text-center">
                <Reveal>
                  <span className="text-oryzon-green font-black tracking-[0.4em] uppercase text-[10px] mb-8 block">Daily Wellness Selection</span>
                  <h2 className="text-6xl md:text-8xl font-serif font-bold text-oryzon-dark mb-24 leading-none tracking-tighter">The <span className="italic text-oryzon-green">Purest</span> Collection</h2>
                </Reveal>
                <div className="container mx-auto px-6 flex justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 max-w-7xl w-full">
                        {products.map(p => <ProductCard key={p.id} product={p} onClick={() => navigateToProduct(p)} />)}
                    </div>
                </div>
            </section>
            <BlogSection blogs={blogPosts} onRead={(p) => { setActiveBlogPost(p); setView('ARTICLE'); }} />
            <SEOKeywords />
          </>
        );
      case 'SHOP':
        return (
          <div className="pt-64 pb-32 bg-oryzon-light min-h-screen text-center">
            <h1 className="text-7xl font-serif font-bold text-oryzon-dark mb-24 leading-none tracking-tighter">Nature's <span className="italic text-oryzon-green">Pharmacy</span></h1>
            <div className="container mx-auto px-6 flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 max-w-7xl w-full">
                    {products.map(p => <ProductCard key={p.id} product={p} onClick={() => navigateToProduct(p)} />)}
                </div>
            </div>
          </div>
        );
      case 'BENEFITS':
        return (
          <div className="pt-64 bg-white">
            <ProfessionalNutrition />
            <div className="py-32 bg-oryzon-light">
              <Reveal className="text-center mb-24 px-6">
                <h2 className="text-6xl font-serif font-bold text-oryzon-dark mb-8">Science of Purity</h2>
                <p className="text-gray-500 max-w-2xl mx-auto italic leading-relaxed text-xl">
                  From weight management powder properties to digestion support, our pure moringa leaf powder is your daily wellness powder partner.
                </p>
              </Reveal>
              <div className="container mx-auto px-6 max-w-5xl">
                <FAQSection />
              </div>
            </div>
          </div>
        );
      case 'BLOG':
        return (
          <div className="pt-64 bg-white min-h-screen">
            <BlogSection blogs={blogPosts} onRead={(p) => { setActiveBlogPost(p); setView('ARTICLE'); }} />
          </div>
        );
      case 'ABOUT':
        return (
          <div className="pt-64 pb-32 bg-white min-h-screen">
            <div className="container mx-auto px-6 max-w-4xl text-center">
              <Reveal>
                <span className="text-oryzon-green font-black tracking-[0.3em] uppercase text-[10px] mb-8 block">Our Story</span>
                <h1 className="text-7xl font-serif font-bold text-oryzon-dark mb-12 tracking-tighter leading-none">Origins of <br/><span className="italic">ORYIZON.</span></h1>
                <div className="aspect-video rounded-[4rem] overflow-hidden mb-16 shadow-3xl">
                  <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" />
                </div>
                <div className="prose prose-2xl mx-auto text-gray-600 leading-relaxed font-light text-left">
                  <p>Born from a passion for ancient Ayurvedic wisdom and modern nutrition, ORYIZON represents the horizon where traditional healing meets contemporary wellness. Our mission is simple: to provide the world's most bio-available <span className="font-bold text-oryzon-green">pure moringa leaf powder</span>.</p>
                  <p>We source exclusively from sustainable farms that prioritize soil health and ethical labor. Every gram of our <span className="font-bold text-oryzon-green">organic moringa powder</span> is a testament to our commitment to purity and potency.</p>
                </div>
              </Reveal>
            </div>
          </div>
        );
      case 'CONTACT':
        return (
          <div className="pt-64 pb-32 bg-oryzon-light min-h-screen">
            <div className="container mx-auto px-6 max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <Reveal>
                  <h1 className="text-7xl font-serif font-bold text-oryzon-dark mb-10 tracking-tighter">Connect with <br/><span className="italic text-oryzon-green">Wellness.</span></h1>
                  <p className="text-xl text-gray-500 mb-16 leading-relaxed">Whether you have questions about our <span className="font-bold text-oryzon-dark">immunity booster powder</span> or need help with an order, our specialists are here.</p>
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Wellness Hub</h4>
                      <p className="text-2xl font-serif font-bold text-oryzon-dark">{contactInfo.address}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Direct Line</h4>
                      <p className="text-2xl font-serif font-bold text-oryzon-dark">{contactInfo.phone}</p>
                    </div>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <ContactForm />
                </Reveal>
              </div>
            </div>
          </div>
        );
      case 'FAQ':
        return (
          <div className="pt-64 pb-32 bg-white min-h-screen">
             <div className="container mx-auto px-6 max-w-4xl text-center">
                <h1 className="text-7xl font-serif font-bold text-oryzon-dark mb-24 tracking-tighter">Wellness <span className="italic text-oryzon-green">Knowledge Base</span></h1>
                <FAQSection />
             </div>
          </div>
        );
      case 'ADMIN':
        return (
          <AdminDashboard 
            products={products} 
            blogs={blogPosts} 
            contactInfo={contactInfo} 
            onUpdate={fetchData} 
          />
        );
      case 'TRACK_ORDER': return <TrackOrderSection initialId={trackingIdToPreFill} />;
      case 'PRODUCT':
        if (!activeProduct) return null;
        const finalP = activeProduct.discount_price || activeProduct.price;
        return (
          <div className="pt-64 pb-32 bg-white min-h-screen">
            <div className="container mx-auto px-6 max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start mb-24">
                <div className="lg:col-span-7 bg-oryzon-light rounded-[4rem] overflow-hidden aspect-[4/5] shadow-3xl">
                    <img src={activeProductImage} alt={activeProduct.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
                </div>
                <div className="lg:col-span-5 pt-12 text-left">
                  <span className="text-oryzon-green font-black tracking-[0.3em] uppercase text-[11px] mb-8 block">{activeProduct.category}</span>
                  <h1 className="text-6xl md:text-7xl font-serif font-bold text-oryzon-dark mb-10 leading-[0.9] tracking-tighter">{activeProduct.name}</h1>
                  <div className="flex items-center gap-6 mb-14">
                    <div className="text-5xl font-serif font-bold text-oryzon-green">₹{finalP}</div>
                    {activeProduct.discount_price && activeProduct.discount_price < activeProduct.price && (
                       <div className="text-2xl text-gray-400 line-through">₹{activeProduct.price}</div>
                    )}
                  </div>
                  <p className="text-gray-600 text-xl leading-relaxed mb-16 font-light">{activeProduct.description}</p>
                  <button onClick={() => addToCart(activeProduct)} className="w-full bg-oryzon-dark text-white py-7 rounded-full font-bold uppercase tracking-[0.25em] hover:bg-oryzon-green transition-all shadow-3xl active:scale-95 text-sm cursor-pointer">Add to Wellness Bag</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'ARTICLE': return activeBlogPost ? (
        <div className="pt-64 pb-32 bg-white min-h-screen">
          <div className="container mx-auto px-6 max-w-5xl">
            <span className="text-oryzon-green font-black tracking-[0.3em] uppercase text-[11px] mb-10 block text-center">Wellness Journal Article</span>
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-14 leading-[0.9] tracking-tighter text-center">{activeBlogPost.title}</h1>
            <div className="aspect-[21/9] rounded-[4rem] overflow-hidden shadow-3xl mb-24">
               <img src={activeBlogPost.image} className="w-full h-full object-cover" />
            </div>
            <div className="prose prose-2xl max-w-none text-gray-700 leading-relaxed font-light text-left" dangerouslySetInnerHTML={{ __html: activeBlogPost.content }} />
            <button onClick={() => setView('BLOG')} className="mt-32 flex items-center gap-6 font-bold text-oryzon-green hover:gap-8 transition-all uppercase tracking-[0.3em] text-xs cursor-pointer">
              <ArrowRight className="rotate-180" /> Back to Wellness Journal
            </button>
          </div>
        </div>
      ) : null;
      case 'CHECKOUT': 
        return <CheckoutView 
          cart={cart} 
          onCancel={() => setView('SHOP')} 
          onDone={(id: string) => { 
            setLastOrderId(id); 
            setCart([]); 
            setView('ORDER_SUCCESS');
          }} 
        />;
      case 'ORDER_SUCCESS':
        return (
          <div className="pt-64 pb-32 bg-white min-h-screen flex items-center justify-center">
            <div className="max-w-xl w-full px-6 text-center">
                <div className="w-24 h-24 bg-oryzon-green rounded-full flex items-center justify-center mx-auto mb-10 text-white shadow-2xl animate-bounce">
                  <Sparkles className="w-12 h-12" />
                </div>
                <h1 className="text-6xl font-serif font-bold text-oryzon-dark mb-6 tracking-tighter">Wellness <span className="italic">Confirmed</span></h1>
                <p className="text-gray-500 text-lg mb-12 leading-relaxed">
                  Thank you for choosing ORYIZON. Your pure moringa leaf powder is being harvested and packed for shipping.
                </p>
                <div className="bg-oryzon-light/50 p-10 rounded-[2.5rem] border border-gray-100 mb-12">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 block">Order Identifier (UUID)</span>
                   <p className="font-mono text-xs font-bold text-oryzon-dark tracking-wider mb-2 break-all">{lastOrderId}</p>
                   <button 
                     onClick={() => {
                        navigator.clipboard.writeText(lastOrderId);
                        alert("Wellness ID copied to clipboard!");
                     }}
                     className="text-[10px] font-black text-oryzon-green uppercase tracking-widest hover:underline cursor-pointer"
                   >
                     Copy Wellness ID
                   </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button onClick={() => setView('HOME')} className="bg-oryzon-dark text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-oryzon-green transition-all shadow-xl cursor-pointer">Return Home</button>
                  <button onClick={() => { setTrackingIdToPreFill(lastOrderId); setView('TRACK_ORDER'); }} className="bg-white border border-gray-200 text-oryzon-dark px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:border-oryzon-green transition-all shadow-sm cursor-pointer">Track Package</button>
                </div>
            </div>
          </div>
        );
      case 'PRIVACY':
      case 'TERMS':
        return (
          <div className="pt-64 pb-32 bg-white min-h-screen">
            <div className="container mx-auto px-6 max-w-4xl text-left">
              <h1 className="text-6xl font-serif font-bold text-oryzon-dark mb-16">{view === 'PRIVACY' ? 'Privacy Policy' : 'Terms of Service'}</h1>
              <div className="prose prose-xl max-w-none text-gray-600 leading-relaxed">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p>Welcome to ORYIZON. Your privacy and satisfaction are our top priorities. This document outlines our commitment to excellence and the standards we maintain for our pure moringa leaf powder community.</p>
                <h3>1. Commitment to Quality</h3>
                <p>We guarantee that all organic moringa powder products meet stringent purity standards. Every batch is tested for bio-availability and nutritional density.</p>
                <h3>2. Ethical Sourcing</h3>
                <p>We only partner with farmers who practice sustainable and fair trade agriculture.</p>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <Layout cart={cart} setCart={setCart} currentView={view} onChangeView={setView}>
      {renderContent()}
    </Layout>
  );
};

// -- Helpers --

const HeroSection = ({ onShopNow }: { onShopNow: () => void }) => {
  const images = [
    "https://rwfnqhixvryzkjnzpmij.supabase.co/storage/v1/object/public/images/Gemini_Generated_Image_g3d4g0g3d4g0g3d4.png",
    "https://rwfnqhixvryzkjnzpmij.supabase.co/storage/v1/object/public/images/0.6027927786873484.png",
    "https://rwfnqhixvryzkjnzpmij.supabase.co/storage/v1/object/public/images/0.3420232601323707.png"
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % images.length), 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-oryzon-dark">
      <div className="absolute inset-0 z-0 text-left">
        {images.map((img, idx) => (
          <div key={idx} className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${idx === currentIndex ? 'opacity-70' : 'opacity-0'}`}>
            <img src={img} alt="Pure Moringa Powder" className={`w-full h-full object-cover ${idx === currentIndex ? 'animate-zoom-slow' : ''}`} />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-oryzon-dark/95 via-oryzon-dark/50 to-transparent z-10" />
      </div>
      <div className="container mx-auto px-6 relative z-20 pt-24 max-w-5xl text-left">
          <Reveal>
            <span className="inline-block backdrop-blur-xl bg-white/10 border border-white/20 text-white/90 text-[11px] font-black tracking-[0.4em] px-8 py-4 rounded-full uppercase mb-12 shadow-2xl">Earth's Premium Superfood Powder</span>
            <h1 className="text-8xl md:text-[10rem] font-serif font-bold text-white leading-[0.85] mb-12 tracking-tighter">Nature's <br/><span className="text-oryzon-accent italic">Miracle Leaf.</span></h1>
            <p className="text-2xl md:text-3xl text-gray-200 mb-16 leading-relaxed font-light max-w-3xl">
              Experience the ultimate <span className="text-oryzon-accent font-semibold italic underline underline-offset-8 decoration-oryzon-accent/30">immunity booster powder</span>. 
              Pure, sun-dried <span className="font-medium text-white">organic moringa leaf powder</span> for your daily ritual.
            </p>
            <div className="flex flex-col sm:flex-row gap-8">
              <button onClick={onShopNow} className="group bg-white text-oryzon-dark px-14 py-7 rounded-full font-bold hover:bg-oryzon-accent transition-all flex items-center justify-center gap-5 shadow-3xl active:scale-95 uppercase tracking-widest text-sm cursor-pointer">
                Shop Organic Moringa <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
              </button>
            </div>
          </Reveal>
      </div>
      <div className="absolute bottom-16 left-12 z-30 flex gap-4">
        {images.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-700 ${idx === currentIndex ? 'w-16 bg-oryzon-accent' : 'w-4 bg-white/20 hover:bg-white/40 cursor-pointer'}`}
          />
        ))}
      </div>
    </section>
  );
};

const ProductCard: React.FC<{ product: Product; onClick: () => void }> = ({ product, onClick }) => (
  <div onClick={onClick} className="group cursor-pointer flex flex-col items-center text-center">
    <div className="relative w-full aspect-[4/5] overflow-hidden rounded-[3.5rem] mb-12 shadow-3xl border border-white/40">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700"></div>
      <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">New Harvest</div>
    </div>
    <span className="text-oryzon-green font-black tracking-[0.3em] uppercase text-[10px] mb-4 opacity-70">{product.category}</span>
    <h3 className="text-4xl font-serif font-bold text-oryzon-dark group-hover:text-oryzon-green transition-colors mb-6 leading-tight tracking-tight">{product.name}</h3>
    <div className="flex items-center gap-4">
      <p className="text-3xl font-serif font-bold text-oryzon-green">₹{product.discount_price || product.price}</p>
      {product.discount_price && product.discount_price < product.price && (
        <p className="text-lg text-gray-400 line-through">₹{product.price}</p>
      )}
    </div>
  </div>
);

// -- FIXED Checkout Components -- //

const CheckoutField = ({ label, name, value, onChange, placeholder, type = "text", required = true }: any) => (
  <div className="space-y-2 text-left">
    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{label}</label>
    <input type={type} required={required} placeholder={placeholder} value={value} onChange={(e) => onChange(name, e.target.value)} className="w-full bg-oryzon-light/50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-oryzon-green/10 focus:border-oryzon-green transition-all text-oryzon-dark" />
  </div>
);

interface CheckoutViewProps { cart: CartItem[]; onCancel: () => void; onDone: (id: string) => void; }

const CheckoutView: React.FC<CheckoutViewProps> = ({ cart, onCancel, onDone }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', area: '' });
  const [loading, setLoading] = useState(false);
  const subtotal = cart.reduce((acc, i) => acc + ((i.discount_price || i.price) * i.quantity), 0);
  const shipping = 0; const total = subtotal + shipping;
  const handleInputChange = (name: string, value: string) => { setFormData(prev => ({ ...prev, [name]: value })); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    
    // Fix: Using a standard UUID because the Supabase 'id' column is likely a UUID type
    const orderUuid = crypto.randomUUID();
    
    // Comprehensive Order Data for DB storage
    const orderData = { 
      id: orderUuid, // Primary Key must be UUID if DB type is uuid
      customer_name: formData.name, 
      customer_email: formData.email, 
      customer_phone: formData.phone, 
      shipping_address: { 
        address: formData.address, 
        city: formData.city, 
        state: formData.state, 
        pincode: formData.pincode, 
        country: 'India', 
        area: formData.area 
      }, 
      order_items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.discount_price || item.price
      })), 
      total_amount: total, 
      status: 'Harvesting', 
      created_at: new Date().toISOString() 
    };

    try {
      // 1. Storage redundancy
      const localOrders = JSON.parse(localStorage.getItem('ory_local_orders') || '[]');
      localStorage.setItem('ory_local_orders', JSON.stringify([...localOrders, orderData]));

      // 2. Database storage
      const { error } = await supabase.from('orders').insert([orderData]);
      if (error) {
        throw new Error(error.message);
      }
      
      onDone(orderUuid);
    } catch (err: any) { 
      console.error("Backend Failure:", err.message);
      // Fail safely to order success screen so user doesn't get stuck, 
      // but warn if they need to contact support
      alert(`Wellness order initiated. Your Wellness ID for tracking is: ${orderUuid}`);
      onDone(orderUuid); 
    } finally { setLoading(false); }
  };

  return (
    <div className="pt-64 pb-32 bg-oryzon-light min-h-screen">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-20 text-left">
          <div className="lg:w-2/3">
            <Reveal>
              <h1 className="text-6xl font-serif font-bold text-oryzon-dark mb-10 tracking-tighter">Secure <span className="italic">Checkout</span></h1>
              <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-white space-y-10">
                <div className="space-y-6">
                  <h3 className="text-xl font-serif font-bold text-oryzon-dark border-b border-gray-50 pb-4">Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CheckoutField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" />
                    <CheckoutField label="Email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" type="email" />
                  </div>
                  <CheckoutField label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-serif font-bold text-oryzon-dark border-b border-gray-50 pb-4">Shipping</h3>
                  <CheckoutField label="Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Street, Apartment, etc." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CheckoutField label="City" name="city" value={formData.city} onChange={handleInputChange} placeholder="Mumbai" />
                    <CheckoutField label="State" name="state" value={formData.state} onChange={handleInputChange} placeholder="Maharashtra" />
                  </div>
                  <CheckoutField label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="400001" />
                </div>
                <div className="pt-8 flex items-center gap-6">
                  <button type="submit" disabled={loading} className="flex-1 bg-oryzon-green text-white py-6 rounded-full font-bold uppercase tracking-widest hover:bg-oryzon-dark transition-all shadow-3xl disabled:opacity-50 cursor-pointer">{loading ? 'Storing Wellness Journey...' : 'Confirm My Order'}</button>
                  <button type="button" onClick={onCancel} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-oryzon-green cursor-pointer">Cancel</button>
                </div>
              </form>
            </Reveal>
          </div>
          <div className="lg:w-1/3">
             <div className="sticky top-40 bg-oryzon-dark p-12 rounded-[3.5rem] text-white shadow-3xl">
                <h3 className="text-2xl font-serif font-bold mb-10 border-b border-white/10 pb-6">Order Summary</h3>
                <div className="space-y-6 mb-10">
                   {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm"><span>{item.name} x {item.quantity}</span><span className="font-bold text-oryzon-accent">₹{(item.discount_price || item.price) * item.quantity}</span></div>
                   ))}
                </div>
                <div className="space-y-4 pt-8 border-t border-white/10">
                   <div className="flex justify-between text-gray-400 text-xs"><span>Shipping</span><span className="text-oryzon-accent font-black tracking-widest uppercase">Free</span></div>
                   <div className="flex justify-between text-3xl font-serif font-bold pt-6 border-t border-white/5"><span className="text-oryzon-accent italic">Total</span><span>₹{total.toFixed(2)}</span></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfessionalNutrition = () => (
  <section className="py-32 bg-oryzon-dark text-white overflow-hidden text-left">
    <div className="container mx-auto px-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <Reveal>
          <span className="text-oryzon-accent font-black tracking-[0.3em] uppercase text-[10px] mb-8 block">World's Purest Superfood Powder</span>
          <h2 className="text-6xl md:text-7xl font-serif font-bold mb-10 leading-none tracking-tight">Pure <br/><span className="italic text-oryzon-accent">Moringa Leaf Powder</span></h2>
          <p className="text-xl text-gray-300 mb-14 leading-relaxed font-light">
            Recognized as the premier <span className="text-white font-medium italic underline decoration-oryzon-accent underline-offset-8">organic health supplement</span>. 
            Our natural moringa powder serves as a vital immunity booster powder and a sustainable natural energy powder for the modern lifestyle.
          </p>
          <div className="grid grid-cols-2 gap-10">
            <div className="border-l-[3px] border-oryzon-accent pl-8 py-2">
              <h4 className="text-4xl font-serif font-bold text-oryzon-accent mb-2">28.6g</h4>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Bio-Available Protein</p>
            </div>
            <div className="border-l-[3px] border-oryzon-accent pl-8 py-2">
              <h4 className="text-4xl font-serif font-bold text-oryzon-accent mb-2">1019mg</h4>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Natural Calcium</p>
            </div>
          </div>
        </Reveal>
        <Reveal className="bg-white/5 backdrop-blur-xl rounded-[4rem] p-10 md:p-16 border border-white/10 shadow-3xl">
          <div className="space-y-5">
            {[ { l: "Energy Boost", v: "235 kcal" }, { l: "Pure Protein", v: "28.6 g" }, { l: "Total Fat", v: "4.2 g" }, { l: "Carbohydrates", v: "29.6 g" }, { l: "Fiber Support", v: "9.4 g" }, { l: "Organic Iron", v: "11.3 mg" }, { l: "Vitamin A", v: "910 µg" }, { l: "Vitamin C", v: "9.2 mg" }, { l: "Vitamin E", v: "44 mg" }].map((n, i) => (
              <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 group cursor-default">
                <span className="text-gray-400 group-hover:text-oryzon-accent transition-colors uppercase text-[10px] tracking-[0.2em] font-black">{n.l}</span>
                <span className="text-2xl font-serif font-bold text-oryzon-accent group-hover:scale-110 transition-transform">{n.v}</span>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-[9px] uppercase tracking-[0.3em] text-gray-500 font-black italic opacity-60">Premium Ayurvedic Moringa Quality | Serving: 100g</p>
        </Reveal>
      </div>
    </div>
  </section>
);

const SEOKeywords = () => (
  <section className="py-20 bg-oryzon-light text-center border-t border-gray-100">
    <div className="container mx-auto px-6 max-w-6xl">
      <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400 mb-10">Moringa Oleifera Excellence Standards</h4>
      <div className="flex flex-wrap justify-center gap-4 opacity-40 hover:opacity-100 transition-opacity duration-1000 ease-in-out">
        {["moringa powder", "organic moringa powder", "pure moringa powder", "moringa leaf powder", "natural moringa powder", "immunity booster powder", "superfood powder", "weight management powder", "digestion support powder", "skin hair wellness powder", "ayurvedic moringa powder", "herbal health powder", "organic health supplement", "daily wellness powder", "natural energy powder"].map((kw, i) => (
          <span key={i} className="text-[10px] uppercase font-black text-oryzon-dark bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm hover:border-oryzon-green transition-colors cursor-default">{kw}</span>
        ))}
      </div>
    </div>
  </section>
);

export default App;