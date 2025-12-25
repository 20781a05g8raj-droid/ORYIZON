import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import { PRODUCTS as DEFAULT_PRODUCTS, BLOG_POSTS as DEFAULT_BLOGS } from './constants';
import { Product, CartItem, PageView, Review, BlogPost, ContactInfo, Order } from './types';
import { ShoppingBag, Star, ArrowRight, Sparkles, Leaf, ChevronDown, X, Plus, Minus } from './components/Icons';
import { supabase } from './lib/supabaseClient';
import AdminDashboard from './components/AdminDashboard';

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

const BlogSection = ({ blogs, onRead }: { blogs: BlogPost[], onRead: (p: BlogPost) => void }) => (
  <section className="py-24 bg-white">
    <div className="container mx-auto px-6 max-w-7xl">
      <Reveal className="text-center mb-24">
        <h2 className="text-5xl md:text-7xl font-serif font-bold text-oryzon-dark mb-8 tracking-tight">Wellness Journal</h2>
        <p className="text-gray-500 text-xl max-w-3xl mx-auto leading-relaxed">
          Deep insights on <span className="text-oryzon-green font-semibold italic">Organic Moringa Powder</span>, 
          ancient ayurvedic moringa wisdom, and <span className="font-medium text-oryzon-dark underline decoration-oryzon-accent underline-offset-4">superfood powder</span> nutrition for your soul.
        </p>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        {blogs.map((post) => (
          <Reveal key={post.id} className="group cursor-pointer">
            <div className="relative aspect-[16/11] rounded-[3rem] overflow-hidden mb-10 shadow-2xl transition-all duration-500 group-hover:shadow-oryzon-green/10" onClick={() => onRead(post)}>
              <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-oryzon-dark/5 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-oryzon-green uppercase tracking-[0.25em] mb-6">
              <span>{post.date}</span>
              <span className="w-1.5 h-1.5 bg-oryzon-accent rounded-full"></span>
              <span className="text-gray-400">{post.readTime}</span>
            </div>
            <h3 className="text-3xl font-serif font-bold text-oryzon-dark mb-6 group-hover:text-oryzon-green transition-colors leading-tight" onClick={() => onRead(post)}>{post.title}</h3>
            <p className="text-gray-500 text-base leading-relaxed mb-10 line-clamp-2">{post.excerpt}</p>
            <button 
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                onRead(post); 
              }}
              className="flex items-center gap-3 text-sm font-bold text-oryzon-dark border-b-2 border-oryzon-accent pb-2 group-hover:gap-6 group-hover:text-oryzon-green group-hover:border-oryzon-green transition-all uppercase tracking-widest"
            >
              Read Full Journal <ArrowRight className="w-4 h-4" />
            </button>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const TrackOrderSection = () => {
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
      if (error) throw error;
      setOrderStatus(data);
    } catch (e) {
      alert("Order not found or invalid ID. Please verify your wellness receipt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-64 pb-32 bg-oryzon-light min-h-screen">
      <div className="container mx-auto px-6 max-w-xl">
        <Reveal className="bg-white p-14 rounded-[4rem] shadow-2xl border border-white/50 text-center backdrop-blur-md">
          <h1 className="text-5xl font-serif font-bold text-oryzon-dark mb-6">Track Your Order</h1>
          <p className="text-gray-500 mb-12 text-sm leading-relaxed max-w-xs mx-auto uppercase tracking-widest font-bold opacity-70">
            Real-time tracking for your <span className="text-oryzon-green italic">natural energy powder</span> shipment.
          </p>
          <form onSubmit={handleTrack} className="space-y-8 mb-12">
            <input
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Order ID (e.g. 550e8400...)"
              className="w-full bg-oryzon-light/50 border border-gray-100 p-6 rounded-2xl outline-none focus:ring-4 focus:ring-oryzon-green/10 focus:border-oryzon-green transition-all text-center font-mono text-lg shadow-inner"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-oryzon-dark text-white font-bold py-6 rounded-full uppercase tracking-[0.2em] hover:bg-oryzon-green transition-all shadow-xl active:scale-95 text-sm"
            >
              {loading ? 'Finding Your Wellness...' : 'Locate Shipment'}
            </button>
          </form>

          {orderStatus && (
            <div className="text-left bg-oryzon-light/60 p-10 rounded-[2.5rem] border border-white shadow-sm animate-fade-in">
              <div className="flex justify-between items-center mb-8 border-b border-white/50 pb-6">
                <span className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Current Status</span>
                <span className="bg-oryzon-dark text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{orderStatus.status}</span>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Customer</p>
                  <p className="font-bold text-oryzon-dark">{orderStatus.customer_name}</p>
                </div>
                <div className="flex justify-between items-baseline pt-4 border-t border-white/40">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Value</p>
                  <p className="font-serif font-bold text-3xl text-oryzon-green">₹{orderStatus.total_amount}</p>
                </div>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
};

// -- Content Components -- //

const ProfessionalNutrition = () => (
  <section className="py-32 bg-oryzon-dark text-white overflow-hidden">
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
            {[
              { l: "Energy Boost", v: "235 kcal" },
              { l: "Pure Protein", v: "28.6 g" },
              { l: "Total Fat", v: "4.2 g" },
              { l: "Carbohydrates", v: "29.6 g" },
              { l: "Fiber Support", v: "9.4 g" },
              { l: "Organic Iron", v: "11.3 mg" },
              { l: "Vitamin A", v: "910 µg" },
              { l: "Vitamin C", v: "9.2 mg" },
              { l: "Vitamin E", v: "44 mg" },
            ].map((n, i) => (
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
        {[
          "moringa powder", "organic moringa powder", "pure moringa powder", "moringa leaf powder", "natural moringa powder",
          "immunity booster powder", "superfood powder", "weight management powder", "digestion support powder", 
          "skin hair wellness powder", "ayurvedic moringa powder", "herbal health powder", "organic health supplement", 
          "daily wellness powder", "natural energy powder"
        ].map((kw, i) => (
          <span key={i} className="text-[10px] uppercase font-black text-oryzon-dark bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm hover:border-oryzon-green transition-colors cursor-default">{kw}</span>
        ))}
      </div>
    </div>
  </section>
);

// -- Main App Component -- //

const App: React.FC = () => {
  const [view, setView] = useState<PageView>('HOME');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string>('');
  const [activeProductImage, setActiveProductImage] = useState<string>('');
  
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(DEFAULT_BLOGS);

  const fetchData = async () => {
    try {
      const { data: pData } = await supabase.from('products').select('*');
      if (pData) setProducts(pData);
      const { data: bData } = await supabase.from('blogs').select('*');
      if (bData) setBlogPosts(bData.map((b: any) => ({ ...b, readTime: b.read_time })));
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
            <SEOKeywords />
          </div>
        );
      case 'BENEFITS':
        return (
          <div className="pt-64 bg-white">
            <ProfessionalNutrition />
            <div className="py-20 text-center bg-oryzon-light">
               <h2 className="text-4xl font-serif font-bold text-oryzon-dark mb-6">Herbal Health Benefits</h2>
               <p className="text-gray-500 max-w-2xl mx-auto italic px-6 leading-relaxed">
                 From weight management powder properties to digestion support, our pure moringa leaf powder is your daily wellness powder partner.
               </p>
            </div>
            <SEOKeywords />
          </div>
        );
      case 'BLOG':
        return (
          <div className="pt-64 bg-white min-h-screen">
            <BlogSection blogs={blogPosts} onRead={(p) => { setActiveBlogPost(p); setView('ARTICLE'); }} />
            <SEOKeywords />
          </div>
        );
      case 'TRACK_ORDER': return <TrackOrderSection />;
      case 'PRODUCT':
        if (!activeProduct) return null;
        return (
          <div className="pt-64 pb-32 bg-white min-h-screen">
            <div className="container mx-auto px-6 max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start mb-24">
                <div className="lg:col-span-7 bg-oryzon-light rounded-[4rem] overflow-hidden aspect-[4/5] shadow-3xl">
                    <img src={activeProductImage} alt={activeProduct.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
                </div>
                <div className="lg:col-span-5 pt-12">
                  <span className="text-oryzon-green font-black tracking-[0.3em] uppercase text-[11px] mb-8 block">{activeProduct.category}</span>
                  <h1 className="text-6xl md:text-7xl font-serif font-bold text-oryzon-dark mb-10 leading-[0.9] tracking-tighter">{activeProduct.name}</h1>
                  <div className="text-5xl font-serif font-bold text-oryzon-green mb-14">₹{activeProduct.discount_price || activeProduct.price}</div>
                  <p className="text-gray-600 text-xl leading-relaxed mb-16 font-light">{activeProduct.description}</p>
                  <button onClick={() => addToCart(activeProduct)} className="w-full bg-oryzon-dark text-white py-7 rounded-full font-bold uppercase tracking-[0.25em] hover:bg-oryzon-green transition-all shadow-3xl active:scale-95 text-sm">Add to Wellness Bag</button>
                  <div className="mt-12 flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                     <Sparkles className="w-5 h-5 text-oryzon-accent" />
                     <span>Sustainably Sourced Pure Moringa Powder</span>
                  </div>
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
            <div className="prose prose-2xl max-w-none text-gray-700 leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: activeBlogPost.content }} />
            <button onClick={() => setView('BLOG')} className="mt-32 flex items-center gap-6 font-bold text-oryzon-green hover:gap-8 transition-all uppercase tracking-[0.3em] text-xs">
              <ArrowRight className="rotate-180" /> Back to Wellness Journal
            </button>
          </div>
        </div>
      ) : null;
      case 'CHECKOUT': return <CheckoutView cart={cart} onCancel={() => setView('SHOP')} onDone={(id) => { setLastOrderId(id); setIsOrderPlaced(true); setCart([]); }} />;
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
      <div className="absolute inset-0 z-0">
        {images.map((img, idx) => (
          <div key={idx} className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${idx === currentIndex ? 'opacity-70' : 'opacity-0'}`}>
            <img src={img} alt="Pure Moringa Powder" className={`w-full h-full object-cover ${idx === currentIndex ? 'animate-zoom-slow' : ''}`} />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-oryzon-dark/95 via-oryzon-dark/50 to-transparent z-10" />
      </div>
      <div className="container mx-auto px-6 relative z-20 pt-24 max-w-5xl">
          <Reveal>
            <span className="inline-block backdrop-blur-xl bg-white/10 border border-white/20 text-white/90 text-[11px] font-black tracking-[0.4em] px-8 py-4 rounded-full uppercase mb-12 shadow-2xl">Earth's Premium Superfood Powder</span>
            <h1 className="text-8xl md:text-[10rem] font-serif font-bold text-white leading-[0.85] mb-12 tracking-tighter">Nature's <br/><span className="text-oryzon-accent italic">Miracle Leaf.</span></h1>
            <p className="text-2xl md:text-3xl text-gray-200 mb-16 leading-relaxed font-light max-w-3xl">
              Experience the ultimate <span className="text-oryzon-accent font-semibold italic underline underline-offset-8 decoration-oryzon-accent/30">immunity booster powder</span>. 
              Pure, sun-dried <span className="font-medium text-white">organic moringa leaf powder</span> for your daily ritual.
            </p>
            <div className="flex flex-col sm:flex-row gap-8">
              <button onClick={onShopNow} className="group bg-white text-oryzon-dark px-14 py-7 rounded-full font-bold hover:bg-oryzon-accent transition-all flex items-center justify-center gap-5 shadow-3xl active:scale-95 uppercase tracking-widest text-sm">
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
            className={`h-1.5 rounded-full transition-all duration-700 ${idx === currentIndex ? 'w-16 bg-oryzon-accent' : 'w-4 bg-white/20 hover:bg-white/40'}`}
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
    <p className="text-3xl font-serif font-bold text-oryzon-green">₹{product.price}</p>
  </div>
);

const CheckoutView = ({ cart, onCancel, onDone }: any) => {
  const subtotal = cart.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0);
  return (
    <div className="pt-64 pb-32 bg-oryzon-light min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl text-center">
        <span className="text-oryzon-green font-black tracking-[0.3em] uppercase text-[11px] mb-8 block">Final Steps</span>
        <h1 className="text-6xl font-serif font-bold mb-16 tracking-tighter">Secure <span className="italic">Checkout</span></h1>
        <div className="bg-white p-16 rounded-[4rem] shadow-3xl space-y-12 border border-white">
           <div className="flex justify-between text-3xl font-serif font-bold border-b border-gray-100 pb-12 items-baseline">
              <span className="text-gray-400 text-lg uppercase tracking-widest font-black font-sans">Total Wellness Commitment</span>
              <span className="text-oryzon-green text-5xl">₹{subtotal}</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left py-6">
              <div className="bg-oryzon-light/50 p-8 rounded-3xl border border-gray-50">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Payment Method</p>
                <p className="font-bold text-oryzon-dark flex items-center gap-3"><Sparkles className="w-5 h-5 text-oryzon-green" /> Pay via UPI / Card</p>
              </div>
              <div className="bg-oryzon-light/50 p-8 rounded-3xl border border-gray-50">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Shipping Priority</p>
                <p className="font-bold text-oryzon-dark flex items-center gap-3"><Leaf className="w-5 h-5 text-oryzon-green" /> Express Wellness Delivery</p>
              </div>
           </div>
           <button 
             onClick={() => onDone('ORD-' + Math.random().toString(36).substr(2,9).toUpperCase())} 
             className="w-full bg-oryzon-green text-white py-8 rounded-full font-bold tracking-[0.3em] uppercase hover:bg-oryzon-dark transition-all shadow-3xl text-sm"
           >
             Confirm & Start Shipment
           </button>
           <button onClick={onCancel} className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] hover:text-oryzon-green transition-colors">Return to Wellness Collection</button>
        </div>
      </div>
    </div>
  );
};

export default App;