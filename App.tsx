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
      <Reveal className="text-center mb-20">
        <h2 className="text-5xl md:text-6xl font-serif font-bold text-oryzon-dark mb-6 tracking-tight">Wellness Journal</h2>
        <p className="text-gray-500 text-lg">Insights on <span className="text-oryzon-green font-medium italic">Organic Moringa Powder</span> and Superfood nutrition for a healthier life.</p>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {blogs.map((post) => (
          <Reveal key={post.id} className="group cursor-pointer">
            <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl" onClick={() => onRead(post)}>
              <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-oryzon-dark/10 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-oryzon-green uppercase tracking-[0.2em] mb-4">
              <span>{post.date}</span>
              <span className="w-1.5 h-1.5 bg-oryzon-accent rounded-full"></span>
              <span className="text-gray-400">{post.readTime}</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-oryzon-dark mb-4 group-hover:text-oryzon-green transition-colors" onClick={() => onRead(post)}>{post.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-2">{post.excerpt}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); onRead(post); }}
              className="flex items-center gap-2 text-sm font-bold text-oryzon-dark border-b-2 border-oryzon-accent pb-1 group-hover:gap-4 group-hover:text-oryzon-green group-hover:border-oryzon-green transition-all"
            >
              Read Full Article <ArrowRight className="w-4 h-4" />
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
      alert("Order not found or invalid ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-48 pb-24 bg-oryzon-light min-h-screen">
      <div className="container mx-auto px-6 max-w-xl">
        <Reveal className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-white/50 text-center backdrop-blur-sm">
          <h1 className="text-4xl font-serif font-bold text-oryzon-dark mb-4">Track Your Wellness</h1>
          <p className="text-gray-500 mb-10 text-sm">Enter your unique order ID to see the status of your <span className="italic">miracle shipment</span>.</p>
          <form onSubmit={handleTrack} className="space-y-6 mb-10">
            <input
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Order ID (e.g. 550e8400...)"
              className="w-full bg-oryzon-light/50 border border-gray-100 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-oryzon-green/20 focus:border-oryzon-green transition-all text-center font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-oryzon-dark text-white font-bold py-5 rounded-full uppercase tracking-widest hover:bg-oryzon-green transition-all shadow-lg active:scale-95"
            >
              {loading ? 'Finding Order...' : 'Check Status'}
            </button>
          </form>

          {orderStatus && (
            <div className="text-left bg-oryzon-light/40 p-8 rounded-[2rem] border border-white animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Shipment Status</span>
                <span className="bg-oryzon-green text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">{orderStatus.status}</span>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between border-b border-gray-100 pb-4">
                  <p className="text-xs text-gray-400 font-bold uppercase">Customer</p>
                  <p className="font-bold text-oryzon-dark">{orderStatus.customer_name}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-xs text-gray-400 font-bold uppercase">Total Order Value</p>
                  <p className="font-serif font-bold text-2xl text-oryzon-green">₹{orderStatus.total_amount}</p>
                </div>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
};

// -- Main Sections -- //

const ProfessionalNutrition = () => (
  <section className="py-32 bg-oryzon-dark text-white overflow-hidden">
    <div className="container mx-auto px-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <Reveal>
          <span className="text-oryzon-accent font-bold tracking-widest uppercase text-sm mb-6 block">Premium Superfood Powder</span>
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight">Pure <br/><span className="italic text-oryzon-accent">Moringa Leaf Powder</span></h2>
          <p className="text-xl text-gray-300 mb-12 font-light">Experience the best <span className="text-white font-medium">Organic Health Supplement</span>. Our natural moringa powder is a proven immunity booster powder and natural energy powder.</p>
          <div className="grid grid-cols-2 gap-8">
            <div className="border-l-2 border-oryzon-accent pl-6">
              <h4 className="text-3xl font-serif font-bold text-oryzon-accent mb-2">28.6g</h4>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Complete Protein</p>
            </div>
            <div className="border-l-2 border-oryzon-accent pl-6">
              <h4 className="text-3xl font-serif font-bold text-oryzon-accent mb-2">1019mg</h4>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Calcium (Bone Health)</p>
            </div>
          </div>
        </Reveal>

        <Reveal className="bg-white/5 backdrop-blur-md rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-2xl">
          <div className="space-y-4">
            {[
              { l: "Energy", v: "235 kcal" },
              { l: "Protein", v: "28.6 g" },
              { l: "Total Fat", v: "4.2 g" },
              { l: "Carbohydrates", v: "29.6 g" },
              { l: "Dietary Fibre", v: "9.4 g" },
              { l: "Iron", v: "11.3 mg" },
              { l: "Vitamin A", v: "910 µg" },
              { l: "Vitamin C", v: "9.2 mg" },
              { l: "Vitamin E", v: "44 mg" },
            ].map((n, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 group">
                <span className="text-gray-400 group-hover:text-white transition-colors uppercase text-xs tracking-widest font-bold">{n.l}</span>
                <span className="text-xl font-serif font-bold text-oryzon-accent">{n.v}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-gray-500 font-bold italic">Serving Size: 100g | Servings Per Container: 25</p>
        </Reveal>
      </div>
    </div>
  </section>
);

const MomsAndLifestyle = () => (
  <section className="py-32 bg-oryzon-light relative overflow-hidden">
    <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-96 h-96 bg-oryzon-green/5 rounded-full blur-3xl"></div>
    
    <div className="container mx-auto px-6 max-w-7xl relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <Reveal className="order-2 lg:order-1">
          <img src="https://images.unsplash.com/photo-1544126592-807daa2b567b?auto=format&fit=crop&q=80&w=1200" alt="Wellness Lifestyle" className="rounded-[3.5rem] shadow-2xl" />
        </Reveal>
        
        <Reveal className="order-1 lg:order-2">
          <span className="text-oryzon-green font-bold tracking-widest uppercase text-sm mb-6 block">Skin & Hair Wellness Powder</span>
          <h2 className="text-5xl font-serif font-bold text-oryzon-dark mb-10 leading-tight">Empowering <span className="italic text-oryzon-green">Busy Moms</span> <br/>with Herbal Health</h2>
          <div className="space-y-8">
            {[
              "Boosts Natural Energy for Daily Tasks",
              "Supports Immunity Booster for the Whole Family",
              "Quick & Easy to Use Superfood Powder",
              "Daily Wellness Powder for Holistic Health",
              "Reduces Fatigue with Weight Management support"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-6 group">
                <div className="w-8 h-8 rounded-full bg-oryzon-green/10 flex items-center justify-center text-oryzon-green group-hover:bg-oryzon-green group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-lg text-oryzon-dark font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

const SEOKeywords = () => (
  <section className="py-16 bg-oryzon-light text-center border-t border-gray-100">
    <div className="container mx-auto px-6 max-w-5xl">
      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8">World Class Standards for Moringa Oleifera</h4>
      <div className="flex flex-wrap justify-center gap-4 opacity-40 hover:opacity-100 transition-opacity duration-700">
        {[
          "moringa powder", "organic moringa powder", "pure moringa powder", "moringa leaf powder", "natural moringa powder",
          "immunity booster powder", "superfood powder", "weight management powder", "digestion support powder", 
          "skin hair wellness powder", "ayurvedic moringa powder", "herbal health powder", "organic health supplement", 
          "daily wellness powder", "natural energy powder"
        ].map((kw, i) => (
          <span key={i} className="text-[10px] uppercase font-bold text-oryzon-dark bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">{kw}</span>
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
  const [reviews, setReviews] = useState<Review[]>([]);

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
            {/* Hero has its own padding/centering logic */}
            <HeroSection onShopNow={() => setView('SHOP')} />
            <section className="py-32 bg-oryzon-light">
              <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                 {[ { title: "100% Organic", icon: Leaf }, { title: "Nutrient Dense", icon: Sparkles }, { title: "Ethically Grown", icon: Leaf } ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center text-center p-12 bg-white/60 backdrop-blur-md rounded-[3rem] border border-white hover:shadow-2xl hover:-translate-y-2 transition-all">
                       <div className="w-20 h-20 bg-oryzon-green/10 rounded-full flex items-center justify-center mb-8 text-oryzon-green"><item.icon className="w-10 h-10" /></div>
                       <h3 className="text-2xl font-serif font-bold text-oryzon-dark mb-4">{item.title}</h3>
                       <p className="text-gray-500 leading-relaxed">The purest <span className="font-medium text-oryzon-green">Moringa Leaf Powder</span> available globally.</p>
                    </div>
                 ))}
              </div>
            </section>
            <ProfessionalNutrition />
            <MomsAndLifestyle />
            <section className="py-32 bg-white text-center">
                <h2 className="text-5xl md:text-6xl font-serif font-bold text-oryzon-dark mb-24">Purest Collection</h2>
                <div className="container mx-auto px-6 flex justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 max-w-7xl w-full">
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
          <div className="pt-48 pb-24 bg-oryzon-light min-h-screen text-center">
            <h1 className="text-6xl font-serif font-bold text-oryzon-dark mb-24">Nature's Pharmacy</h1>
            <div className="container mx-auto px-6 flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 max-w-7xl w-full">
                    {products.map(p => <ProductCard key={p.id} product={p} onClick={() => navigateToProduct(p)} />)}
                </div>
            </div>
            <SEOKeywords />
          </div>
        );
      case 'BENEFITS':
        return (
          <div className="pt-24 bg-white">
            <MomsAndLifestyle />
            <ProfessionalNutrition />
            <SEOKeywords />
          </div>
        );
      case 'BLOG':
        return (
          <div className="pt-48 bg-white min-h-screen">
            <BlogSection blogs={blogPosts} onRead={(p) => { setActiveBlogPost(p); setView('ARTICLE'); }} />
            <SEOKeywords />
          </div>
        );
      case 'TRACK_ORDER': return <TrackOrderSection />;
      case 'PRODUCT':
        if (!activeProduct) return null;
        return (
          <div className="pt-48 pb-24 bg-white min-h-screen">
            <div className="container mx-auto px-6 max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-24">
                <div className="bg-oryzon-light rounded-[3.5rem] overflow-hidden aspect-[4/5] shadow-2xl">
                    <img src={activeProductImage} alt={activeProduct.name} className="w-full h-full object-cover" />
                </div>
                <div className="pt-8">
                  <h1 className="text-5xl md:text-6xl font-serif font-bold text-oryzon-dark mb-8 leading-tight">{activeProduct.name}</h1>
                  <div className="text-4xl font-serif font-bold text-oryzon-green mb-10">₹{activeProduct.discount_price || activeProduct.price}</div>
                  <p className="text-gray-600 text-lg leading-relaxed mb-12 font-light">{activeProduct.description}</p>
                  <button onClick={() => addToCart(activeProduct)} className="w-full bg-oryzon-dark text-white py-6 rounded-full font-bold uppercase tracking-widest hover:bg-oryzon-green transition-all shadow-xl active:scale-95">Add to Shopping Bag</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'ARTICLE': return activeBlogPost ? (
        <div className="pt-48 pb-24 bg-white min-h-screen">
          <div className="container mx-auto px-6 max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-12 leading-tight">{activeBlogPost.title}</h1>
            <img src={activeBlogPost.image} className="w-full rounded-[3.5rem] shadow-2xl mb-16" />
            <div className="prose prose-xl max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: activeBlogPost.content }} />
            <button onClick={() => setView('BLOG')} className="mt-20 flex items-center gap-4 font-bold text-oryzon-green hover:gap-6 transition-all uppercase tracking-widest text-sm">
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
    const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % images.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-oryzon-dark">
      <div className="absolute inset-0 z-0">
        {images.map((img, idx) => (
          <div key={idx} className={`absolute inset-0 transition-opacity duration-[2000ms] ${idx === currentIndex ? 'opacity-60' : 'opacity-0'}`}>
            <img src={img} alt="Pure Moringa Powder" className={`w-full h-full object-cover ${idx === currentIndex ? 'animate-zoom-slow' : ''}`} />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-oryzon-dark/95 via-oryzon-dark/40 to-transparent z-10" />
      </div>
      <div className="container mx-auto px-6 relative z-20 pt-20 max-w-4xl">
          <Reveal>
            <span className="inline-block backdrop-blur-md bg-white/10 border border-white/20 text-white/90 text-sm font-bold tracking-[0.3em] px-6 py-3 rounded-full uppercase mb-10">Earth's Purest Superfood Powder</span>
            <h1 className="text-7xl md:text-9xl font-serif font-bold text-white leading-[1.05] mb-10">Nature's <br/><span className="text-oryzon-accent italic">Miracle Leaf.</span></h1>
            <p className="text-2xl text-gray-200 mb-14 leading-relaxed font-light max-w-2xl">The ultimate <span className="text-oryzon-accent font-medium">Immunity Booster Powder</span>. Sustainably sourced, 100% Organic Moringa Leaf Powder for your daily wellness ritual.</p>
            <button onClick={onShopNow} className="group bg-white text-oryzon-dark px-12 py-6 rounded-full font-bold hover:bg-oryzon-accent transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95">
              Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </Reveal>
      </div>
    </section>
  );
};

// Fix: Explicitly define ProductCard as a React.FC component to allow React-specific props like 'key' during list mappings and resolve TypeScript errors on lines 316 and 330.
const ProductCard: React.FC<{ product: Product; onClick: () => void }> = ({ product, onClick }) => (
  <div onClick={onClick} className="group cursor-pointer flex flex-col items-center text-center">
    <div className="relative w-full aspect-[4/5] overflow-hidden rounded-[2.5rem] mb-10 shadow-2xl">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
    </div>
    <h3 className="text-3xl font-serif font-bold text-oryzon-dark group-hover:text-oryzon-green transition-colors mb-4">{product.name}</h3>
    <p className="text-2xl font-serif font-medium text-oryzon-green">₹{product.price}</p>
  </div>
);

const CheckoutView = ({ cart, onCancel, onDone }: any) => {
  const subtotal = cart.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0);
  return (
    <div className="pt-48 pb-24 bg-oryzon-light min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <h1 className="text-5xl font-serif font-bold mb-12">Secure Checkout</h1>
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl space-y-8">
           <div className="flex justify-between text-2xl font-serif font-bold border-b border-gray-100 pb-8">
              <span>Total Commitment</span>
              <span className="text-oryzon-green">₹{subtotal}</span>
           </div>
           <button onClick={() => onDone('ORD-' + Math.random().toString(36).substr(2,9).toUpperCase())} className="w-full bg-oryzon-green text-white py-6 rounded-full font-bold tracking-widest uppercase hover:bg-oryzon-dark transition-all shadow-xl">Confirm Order</button>
           <button onClick={onCancel} className="text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-oryzon-green">Continue Exploring</button>
        </div>
      </div>
    </div>
  );
};

export default App;