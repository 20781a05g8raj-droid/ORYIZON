
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product, BlogPost, ContactInfo, Order, ContactMessage } from '../types';
import { Leaf, Plus, X, Minus } from './Icons';

// --- Rich Text Editor Component ---
const RichTextEditor = ({ value, onChange }: { value: string, onChange: (html: string) => void }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const selectionRef = useRef<Range | null>(null);

  // Initialize editor content once
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, []); // Only runs once on mount to set initial value

  // Save selection when leaving editor area to ensure we can restore it for image/link insertion
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      selectionRef.current = sel.getRangeAt(0);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      saveSelection();
    }
  };

  const handleKeyUp = () => saveSelection();
  const handleMouseUp = () => saveSelection();

  const execCmd = (command: string, value: string | undefined = undefined) => {
    // Restore selection if we have one saved and the editor isn't currently focused
    if (document.activeElement !== editorRef.current) {
        if(selectionRef.current) {
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(selectionRef.current);
            }
        } else {
            editorRef.current?.focus();
        }
    }
    document.execCommand(command, false, value);
    editorRef.current?.focus(); 
    saveSelection(); // Save new selection after command
    handleInput(); // Trigger change
  };

  const handleEditorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Check if we have a valid selection to insert at, if not, focus editor
    if (!selectionRef.current) {
        editorRef.current?.focus();
        saveSelection();
    }

    setIsUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `blog-content-${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      
      // Use insertHTML to add responsive styling classes
      const imgHtml = `<img src="${data.publicUrl}" alt="Inserted Image" class="rounded-xl shadow-lg my-6 max-w-full border border-gray-100" />`;
      execCmd('insertHTML', imgHtml);
      
    } catch (error: any) {
      console.error('Upload Error:', error);
      alert('Error uploading image: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const promptLink = () => {
    const url = prompt('Enter the link URL:');
    if (url) execCmd('createLink', url);
  };

  // Button Component for consistency
  const ToolbarBtn = ({ cmd, arg, icon, title, active = false }: any) => (
    <button 
      onClick={(e) => { e.preventDefault(); execCmd(cmd, arg); }} 
      title={title} 
      className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${active ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-gray-600'}`}
    >
      {icon}
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col h-[600px]">
       {/* Toolbar */}
       <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
          
          {/* Headings */}
          <select 
            onChange={(e) => { execCmd('formatBlock', e.target.value); e.target.value = ''; }} 
            className="h-8 px-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded cursor-pointer outline-none hover:border-oryzon-green transition-colors mr-2"
          >
            <option value="">Paragraph</option>
            <option value="H1">Heading 1</option>
            <option value="H2">Heading 2</option>
            <option value="H3">Heading 3</option>
            <option value="BLOCKQUOTE">Quote</option>
          </select>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Formatting */}
          <ToolbarBtn cmd="bold" title="Bold (Ctrl+B)" icon={<span className="font-serif font-bold">B</span>} />
          <ToolbarBtn cmd="italic" title="Italic (Ctrl+I)" icon={<span className="font-serif italic">I</span>} />
          <ToolbarBtn cmd="underline" title="Underline (Ctrl+U)" icon={<span className="underline">U</span>} />
          <ToolbarBtn cmd="strikeThrough" title="Strikethrough" icon={<span className="line-through">S</span>} />

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Alignment */}
          <ToolbarBtn cmd="justifyLeft" title="Align Left" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zm0-4h12v-2H3v2zm0-4h18v-2H3v2zm0-4h12V7H3v2zm0-6v2h18V3H3z"/></svg>} />
          <ToolbarBtn cmd="justifyCenter" title="Align Center" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 21h10v-2H7v2zM3 17h18v-2H3v2zm4-4h10v-2H7v2zM3 9h18V7H3v2zm4-4h10V3H7v2z"/></svg>} />
          <ToolbarBtn cmd="justifyRight" title="Align Right" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zm-6-6v2h18V3H3z"/></svg>} />

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Lists */}
          <ToolbarBtn cmd="insertUnorderedList" title="Bullet List" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>} />
          <ToolbarBtn cmd="insertOrderedList" title="Numbered List" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>} />

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Insert */}
          <button onClick={promptLink} title="Insert Link" className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded text-gray-600">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
          </button>
          
          <label 
            title="Upload Image" 
            className={`w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded text-gray-600 cursor-pointer ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
            onMouseDown={(e) => {
               // Prevent focus loss when clicking label
               e.preventDefault(); 
            }}
          >
             {isUploading ? (
                 <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
             ) : (
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
             )}
             <input type="file" hidden accept="image/*" onChange={handleEditorImageUpload} disabled={isUploading} />
          </label>
       </div>
       
       {/* Editor Area */}
       <div 
         ref={editorRef}
         contentEditable 
         className="flex-1 p-8 overflow-y-auto outline-none prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-oryzon-dark prose-p:text-gray-600 prose-img:rounded-xl prose-img:shadow-lg prose-a:text-oryzon-green prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-oryzon-green prose-blockquote:pl-4 prose-blockquote:italic"
         onInput={handleInput}
         onKeyUp={handleKeyUp}
         onMouseUp={handleMouseUp}
         onBlur={saveSelection}
         data-placeholder="Start writing your article here..."
       />
    </div>
  )
}

interface AdminDashboardProps {
  products: Product[];
  blogs: BlogPost[];
  contactInfo: ContactInfo;
  onUpdate: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, blogs, contactInfo, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'BLOGS' | 'SETTINGS' | 'ORDERS' | 'MESSAGES'>('PRODUCTS');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Editor States
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [currentBlog, setCurrentBlog] = useState<Partial<BlogPost>>({});
  
  // Settings State
  const [settingsForm, setSettingsForm] = useState<ContactInfo>({ email: '', address: '', phone: '' });

  // Orders & Messages State
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load initial settings
  useEffect(() => {
    if (contactInfo) {
      setSettingsForm(contactInfo);
    }
  }, [contactInfo]);

  // Load orders/messages when tab changes
  useEffect(() => {
    if (!isAuthenticated) return;
    
    if (activeTab === 'ORDERS') {
        fetchOrders();
    } else if (activeTab === 'MESSAGES') {
        fetchMessages();
    }
  }, [activeTab, isAuthenticated]);

  const fetchOrders = async () => {
     const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
     
     if (error) {
         console.error('Error fetching orders:', error);
     } else if (data) {
         setOrders(data);
     }
  };

  const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
          console.error('Error fetching messages:', error);
      } else if (data) {
          setMessages(data);
      }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
     const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
     if (!error) {
         setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
     } else {
         alert('Failed to update status');
     }
  };

  // -- Login Handler --
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '@admin8905') { 
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  // -- Image Upload Handler --
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'blog') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    
    // Create a unique file name using timestamp to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // Use 'product-images' bucket
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
      
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      if (type === 'product') {
        // For products, append to the images array
        const currentImages = currentProduct.images || (currentProduct.image ? [currentProduct.image] : []);
        const updatedImages = [...currentImages, publicUrl];
        
        setCurrentProduct(prev => ({ 
            ...prev, 
            images: updatedImages,
            image: updatedImages[0] // Ensure primary image is always the first one
        }));
      } else {
        // For blogs, keep single image behavior
        setCurrentBlog(prev => ({ ...prev, image: publicUrl }));
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + (error.message || JSON.stringify(error)));
    } finally {
      setUploading(false);
      // Reset the input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const removeProductImage = (indexToRemove: number) => {
      const currentImages = currentProduct.images || [];
      const updatedImages = currentImages.filter((_, index) => index !== indexToRemove);
      
      setCurrentProduct(prev => ({
          ...prev,
          images: updatedImages,
          image: updatedImages.length > 0 ? updatedImages[0] : '' // Update primary image
      }));
  };

  // -- Nutrition Handlers --
  const handleAddNutrition = () => {
    const currentNutrition = currentProduct.nutrition || [];
    setCurrentProduct({ ...currentProduct, nutrition: [...currentNutrition, { label: '', value: '' }] });
  };

  const handleRemoveNutrition = (index: number) => {
    const newNutrition = [...(currentProduct.nutrition || [])];
    newNutrition.splice(index, 1);
    setCurrentProduct({ ...currentProduct, nutrition: newNutrition });
  };

  const handleNutritionChange = (index: number, field: 'label' | 'value', value: string) => {
    const newNutrition = [...(currentProduct.nutrition || [])];
    newNutrition[index] = { ...newNutrition[index], [field]: value };
    setCurrentProduct({ ...currentProduct, nutrition: newNutrition });
  };

  // -- Product Actions --
  const saveProduct = async () => {
    setSaving(true);
    
    // Prepare data
    const productData: any = {
        name: currentProduct.name,
        price: currentProduct.price,
        discount_price: currentProduct.discount_price || null, // Include discount_price
        category: currentProduct.category,
        description: currentProduct.description,
        image: currentProduct.image, 
        benefits: currentProduct.benefits, 
        nutrition: currentProduct.nutrition, 
        ingredients: currentProduct.ingredients,
        rating: currentProduct.rating || 5,
        reviews: currentProduct.reviews || 0
    };

    if (currentProduct.id) {
        productData.id = currentProduct.id;
    }

    try {
        const payloadWithImages = { ...productData, images: currentProduct.images };
        const { error } = await supabase.from('products').upsert([payloadWithImages]);
        
        if (error) {
            // Check for missing columns and retry without specific fields if necessary
            const { error: retryError } = await supabase.from('products').upsert([productData]);
            if (retryError) throw retryError;
        }
        
        await onUpdate();
        setIsEditing(false);
        setCurrentProduct({});
    } catch (error: any) {
        console.error(error);
        alert('Failed to save product: ' + (error.message || JSON.stringify(error)));
    } finally {
        setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    if (id === 'p1') {
        alert("Cannot delete default data from here.");
        return;
    }
    await supabase.from('products').delete().eq('id', id);
    onUpdate();
  };

  // -- Blog Actions --
  const saveBlog = async () => {
    setSaving(true);
    try {
        const blogData = {
            title: currentBlog.title,
            excerpt: currentBlog.excerpt,
            content: currentBlog.content,
            image: currentBlog.image,
            read_time: currentBlog.readTime,
            date: currentBlog.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        if (currentBlog.id) {
             const { error } = await supabase.from('blogs').upsert([{ ...blogData, id: currentBlog.id }]);
             if (error) throw error;
        } else {
             const { error } = await supabase.from('blogs').insert([blogData]);
             if (error) throw error;
        }

        await onUpdate();
        setIsEditing(false);
        setCurrentBlog({});
    } catch (error: any) {
        console.error(error);
        alert('Failed to save blog: ' + (error.message || JSON.stringify(error)));
    } finally {
        setSaving(false);
    }
  };

  const deleteBlog = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    if (id === 'b1' || id === 'b2') {
        alert("Cannot delete default data.");
        return;
    }
    await supabase.from('blogs').delete().eq('id', id);
    onUpdate();
  };

  // -- Settings Actions --
  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('contact_info')
        .upsert({ id: 1, ...settingsForm });

      if (error) throw error;
      await onUpdate();
      alert('Settings updated successfully!');
    } catch (error: any) {
      console.error(error);
      alert('Failed to update settings: ' + (error.message || JSON.stringify(error)));
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-oryzon-light flex items-center justify-center">
        <div className="bg-white p-12 rounded-[2rem] shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-oryzon-dark rounded-full flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-oryzon-dark mb-2">Admin Portal</h2>
          <p className="text-gray-500 mb-8">Access restricted to authorized personnel.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter Access Key" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-oryzon-light border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-oryzon-green"
            />
            <button type="submit" className="w-full bg-oryzon-green text-white font-bold py-3 rounded-full hover:bg-oryzon-dark transition-colors">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-oryzon-light">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-oryzon-dark">Dashboard</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-sm font-bold text-gray-500 hover:text-red-500">Sign Out</button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
           <button 
             onClick={() => { setActiveTab('PRODUCTS'); setIsEditing(false); }}
             className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'PRODUCTS' ? 'bg-oryzon-dark text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
           >
             Products
           </button>
           <button 
             onClick={() => { setActiveTab('BLOGS'); setIsEditing(false); }}
             className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'BLOGS' ? 'bg-oryzon-dark text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
           >
             Journal
           </button>
           <button 
             onClick={() => { setActiveTab('ORDERS'); setIsEditing(false); }}
             className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'ORDERS' ? 'bg-oryzon-dark text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
           >
             Orders
           </button>
           <button 
             onClick={() => { setActiveTab('MESSAGES'); setIsEditing(false); }}
             className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'MESSAGES' ? 'bg-oryzon-dark text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
           >
             Messages
           </button>
           <button 
             onClick={() => { setActiveTab('SETTINGS'); setIsEditing(false); }}
             className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'SETTINGS' ? 'bg-oryzon-dark text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
           >
             Settings
           </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm min-h-[500px]">
          
          {/* Header Action */}
          {!isEditing && activeTab === 'PRODUCTS' && (
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-bold text-oryzon-dark">Product Inventory</h2>
               <button 
                 onClick={() => {
                   setIsEditing(true);
                   setCurrentProduct({ benefits: [], nutrition: [], images: [] });
                 }}
                 className="flex items-center gap-2 bg-oryzon-green text-white px-6 py-3 rounded-full font-bold hover:bg-oryzon-dark transition-colors"
               >
                 <Plus className="w-5 h-5" /> Add New
               </button>
            </div>
          )}

          {!isEditing && activeTab === 'BLOGS' && (
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-bold text-oryzon-dark">Blog Posts</h2>
               <button 
                 onClick={() => {
                   setIsEditing(true);
                   setCurrentBlog({});
                 }}
                 className="flex items-center gap-2 bg-oryzon-green text-white px-6 py-3 rounded-full font-bold hover:bg-oryzon-dark transition-colors"
               >
                 <Plus className="w-5 h-5" /> Add New
               </button>
            </div>
          )}

          {/* === SETTINGS TAB === */}
          {activeTab === 'SETTINGS' && (
             <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-oryzon-dark mb-8">Edit Contact Information</h2>
                <div className="space-y-6">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Public Email</label>
                      <input 
                        className="w-full bg-oryzon-light border border-gray-200 p-3 rounded-lg" 
                        value={settingsForm.email} 
                        onChange={e => setSettingsForm({...settingsForm, email: e.target.value})} 
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone Number</label>
                      <input 
                        className="w-full bg-oryzon-light border border-gray-200 p-3 rounded-lg" 
                        value={settingsForm.phone} 
                        onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})} 
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Office Address</label>
                      <textarea 
                        rows={3}
                        className="w-full bg-oryzon-light border border-gray-200 p-3 rounded-lg" 
                        value={settingsForm.address} 
                        onChange={e => setSettingsForm({...settingsForm, address: e.target.value})} 
                      />
                   </div>
                   <button 
                     onClick={saveSettings} 
                     disabled={saving}
                     className="w-full bg-oryzon-green text-white font-bold py-4 rounded-full mt-4 hover:bg-oryzon-dark transition-colors shadow-lg disabled:opacity-50"
                   >
                      {saving ? 'Saving...' : 'Save Changes'}
                   </button>
                </div>
             </div>
          )}

          {/* === ORDERS TAB === */}
          {activeTab === 'ORDERS' && (
             <div>
                <h2 className="text-2xl font-bold text-oryzon-dark mb-8">Recent Orders</h2>
                {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-20 italic">No orders found.</p>
                ) : (
                    <div className="space-y-6">
                       {orders.map(order => (
                          <div key={order.id} className="border border-gray-100 p-6 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                             <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                                 <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-xl text-oryzon-dark">{order.customer_name}</h3>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                            order.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">{order.customer_email} • {order.customer_phone}</p>
                                    <p className="text-xs text-gray-400 mt-1 font-mono">ID: {order.id.split('-')[0]}</p>
                                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                                 </div>
                                 <div className="text-right w-full md:w-auto">
                                    <p className="font-serif font-bold text-2xl text-oryzon-green">₹{order.total_amount}</p>
                                    <select 
                                       value={order.status} 
                                       onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                       className="mt-2 text-xs border border-gray-300 rounded p-2 bg-white w-full font-bold uppercase tracking-wider focus:border-oryzon-green focus:outline-none"
                                    >
                                       <option value="pending">Pending</option>
                                       <option value="processing">Processing</option>
                                       <option value="shipped">Shipped</option>
                                       <option value="delivered">Delivered</option>
                                       <option value="cancelled">Cancelled</option>
                                    </select>
                                 </div>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                                 <div>
                                    <p className="font-bold text-xs uppercase text-gray-400 mb-2 tracking-widest">Shipping Address</p>
                                    <div className="text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-100">
                                        <p className="font-medium text-oryzon-dark mb-1">{order.shipping_address.address}</p>
                                        <p>{order.shipping_address.area}, {order.shipping_address.city}</p>
                                        <p>{order.shipping_address.state} - {order.shipping_address.pincode}</p>
                                        <p className="font-bold mt-1 text-gray-400">{order.shipping_address.country}</p>
                                    </div>
                                 </div>
                                 <div>
                                    <p className="font-bold text-xs uppercase text-gray-400 mb-2 tracking-widest">Ordered Items</p>
                                    <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-100">
                                       {order.order_items.map((item: any, idx: number) => (
                                          <div key={idx} className="flex justify-between text-sm items-center border-b border-gray-50 last:border-0 pb-2 last:pb-0 mb-2 last:mb-0">
                                             <span className="font-medium text-gray-700">{item.quantity}x {item.name}</span>
                                             <span className="font-bold text-gray-400">₹{item.price * item.quantity}</span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                             </div>
                          </div>
                       ))}
                    </div>
                )}
             </div>
          )}

          {/* === MESSAGES TAB === */}
          {activeTab === 'MESSAGES' && (
             <div>
                <h2 className="text-2xl font-bold text-oryzon-dark mb-8">Messages Inbox</h2>
                {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-20 italic">No messages found.</p>
                ) : (
                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className="border border-gray-100 p-6 rounded-2xl bg-white hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-oryzon-dark">{msg.name}</h3>
                                        <p className="text-sm text-gray-500">{msg.email}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="bg-oryzon-light/30 p-4 rounded-xl">
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
          )}

          {/* === EDIT FORMS === */}
          {isEditing ? (
             <div className="max-w-4xl mx-auto">
               <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-oryzon-dark">{activeTab === 'PRODUCTS' ? (currentProduct.id ? 'Edit Product' : 'New Product') : (currentBlog.id ? 'Edit Article' : 'New Article')}</h3>
                  <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
               </div>

               {activeTab === 'PRODUCTS' ? (
                  /* PRODUCT FORM */
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Name</label>
                          <input className="w-full bg-oryzon-light border border-gray-200 p-3 rounded-lg" value={currentProduct.name || ''} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} placeholder="Product Name" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                          <input className="w-full bg-oryzon-light border border-gray-200 p-3 rounded-lg" value={currentProduct.category || ''} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})} placeholder="e.g. Powder" />
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Original Price (₹)</label>
                          <input type="number" className="w-full bg-oryzon-light border border-gray-200 p-3 rounded-lg" value={currentProduct.price || ''} onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 text-green-600">Discount Price (₹)</label>
                          <input type="number" className="w-full bg-green-50 border border-green-200 p-3 rounded-lg text-green-700 font-bold" value={currentProduct.discount_price || ''} onChange={e => setCurrentProduct({...currentProduct, discount_price: e.target.value ? Number(e.target.value) : undefined})} placeholder="Leave blank for no discount" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ingredients</label>
                          <input className="w-full bg-oryzon-light border border-gray-200 p-3 rounded-lg" value={currentProduct.ingredients || ''} onChange={e => setCurrentProduct({...currentProduct, ingredients: e.target.value})} />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                        <textarea className="w-full bg-oryzon-light border border-gray-200 p-3 rounded-lg" rows={4} value={currentProduct.description || ''} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} />
                     </div>
                     
                     {/* Image Upload Gallery */}
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Product Images (Upload multiple)</label>
                        <div className="flex flex-wrap gap-4 mb-4">
                            {(currentProduct.images && currentProduct.images.length > 0) ? (
                                currentProduct.images.map((img, idx) => (
                                    <div key={idx} className="relative group w-24 h-24">
                                        <img src={img} className="w-full h-full rounded-lg object-cover border border-gray-200" />
                                        <button 
                                            onClick={() => removeProductImage(idx)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                            type="button"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-1 rounded-b-lg">Primary</span>}
                                    </div>
                                ))
                            ) : null}

                            <label className={`cursor-pointer bg-white border border-dashed border-gray-300 hover:border-oryzon-green w-24 h-24 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-oryzon-green transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                             {uploading ? (
                                 <span className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                             ) : (
                                 <>
                                    <Plus className="w-6 h-6" />
                                    <span className="text-[9px] font-bold uppercase">Add</span>
                                 </>
                             )}
                             <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'product')} accept="image/*" disabled={uploading} />
                           </label>
                        </div>
                     </div>

                     {/* Benefits */}
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Benefits (comma separated)</label>
                        <input 
                           className="w-full bg-oryzon-light border border-gray-200 p-3 rounded-lg" 
                           value={currentProduct.benefits?.join(', ') || ''} 
                           onChange={e => setCurrentProduct({...currentProduct, benefits: e.target.value.split(',').map(s => s.trim())})} 
                           placeholder="Energy, Digestion, Immunity"
                        />
                     </div>

                     {/* Nutritional Profile Editor */}
                     <div className="bg-oryzon-light/50 p-6 rounded-2xl border border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Nutritional Profile</label>
                        <div className="space-y-3">
                           {currentProduct.nutrition?.map((nut, idx) => (
                              <div key={idx} className="flex gap-4 items-center">
                                 <input 
                                   placeholder="Label" 
                                   value={nut.label} 
                                   onChange={(e) => handleNutritionChange(idx, 'label', e.target.value)}
                                   className="flex-1 bg-white border border-gray-200 p-2 rounded-lg text-sm"
                                 />
                                 <input 
                                   placeholder="Value" 
                                   value={nut.value} 
                                   onChange={(e) => handleNutritionChange(idx, 'value', e.target.value)}
                                   className="flex-1 bg-white border border-gray-200 p-2 rounded-lg text-sm"
                                 />
                                 <button onClick={() => handleRemoveNutrition(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                                    <Minus className="w-4 h-4" />
                                 </button>
                              </div>
                           ))}
                           <button 
                             onClick={handleAddNutrition}
                             className="text-sm font-bold text-oryzon-green flex items-center gap-2 hover:text-oryzon-dark mt-2"
                           >
                             <Plus className="w-4 h-4" /> Add Nutrient
                           </button>
                        </div>
                     </div>

                     <button 
                       onClick={saveProduct} 
                       disabled={uploading || saving}
                       className="w-full bg-oryzon-green text-white font-bold py-4 rounded-full mt-4 hover:bg-oryzon-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {saving ? 'Saving...' : 'Save Product'}
                     </button>
                  </div>
               ) : (
                  /* BLOG FORM */
                  <div className="space-y-6">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Title</label>
                        <input className="w-full bg-oryzon-light border border-gray-200 p-3 rounded-lg" value={currentBlog.title || ''} onChange={e => setCurrentBlog({...currentBlog, title: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Excerpt</label>
                        <textarea className="w-full bg-oryzon-light border border-gray-200 p-3 rounded-lg" rows={2} value={currentBlog.excerpt || ''} onChange={e => setCurrentBlog({...currentBlog, excerpt: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Content</label>
                        <RichTextEditor value={currentBlog.content || ''} onChange={(html) => setCurrentBlog({ ...currentBlog, content: html })} />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Read Time</label>
                          <input className="w-full bg-oryzon-light border border-gray-200 p-3 rounded-lg" value={currentBlog.readTime || ''} onChange={e => setCurrentBlog({...currentBlog, readTime: e.target.value})} placeholder="5 min read" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Cover Image</label>
                            <label className={`cursor-pointer bg-white border border-gray-300 hover:border-oryzon-green px-4 py-3 rounded-lg font-bold text-sm block text-center flex items-center justify-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                             {uploading && <span className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>}
                             {uploading ? 'Uploading...' : 'Upload Image'}
                             <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'blog')} accept="image/*" disabled={uploading} />
                           </label>
                           {currentBlog.image && (
                              <div className="mt-4 text-center">
                                 <img src={currentBlog.image} className="h-24 mx-auto rounded-lg object-cover" />
                              </div>
                           )}
                        </div>
                     </div>
                     <button 
                       onClick={saveBlog} 
                       disabled={uploading || saving}
                       className="w-full bg-oryzon-green text-white font-bold py-4 rounded-full mt-4 hover:bg-oryzon-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {saving ? 'Saving...' : 'Publish Article'}
                     </button>
                  </div>
               )}
             </div>
          ) : (
             /* LIST VIEW */
             activeTab !== 'SETTINGS' && activeTab !== 'ORDERS' && activeTab !== 'MESSAGES' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'PRODUCTS' 
                  ? products.map(p => (
                      <div key={p.id} className="border border-gray-100 rounded-2xl p-6 flex flex-col hover:shadow-lg transition-shadow">
                         <div className="h-40 bg-gray-50 rounded-xl mb-4 overflow-hidden relative">
                            <img src={p.images && p.images.length > 0 ? p.images[0] : p.image} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                <div className="bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold">₹{p.discount_price || p.price}</div>
                                {p.discount_price && (
                                    <div className="bg-red-500 text-white px-2 py-0.5 rounded text-[8px] font-bold">OFFER</div>
                                )}
                            </div>
                         </div>
                         <h3 className="font-bold text-oryzon-dark mb-1">{p.name}</h3>
                         <p className="text-xs text-gray-400 mb-4">{p.category}</p>
                         <div className="mt-auto flex gap-2">
                            <button onClick={() => { setCurrentProduct(p); setIsEditing(true); }} className="flex-1 bg-oryzon-light text-oryzon-dark py-2 rounded-lg text-sm font-bold hover:bg-gray-200">Edit</button>
                            <button onClick={() => deleteProduct(p.id)} className="flex-1 bg-red-50 text-red-500 py-2 rounded-lg text-sm font-bold hover:bg-red-100">Delete</button>
                         </div>
                      </div>
                    ))
                  : blogs.map(b => (
                      <div key={b.id} className="border border-gray-100 rounded-2xl p-6 flex flex-col hover:shadow-lg transition-shadow">
                         <div className="h-40 bg-gray-50 rounded-xl mb-4 overflow-hidden">
                            <img src={b.image} className="w-full h-full object-cover" />
                         </div>
                         <h3 className="font-bold text-oryzon-dark mb-1">{b.title}</h3>
                         <p className="text-xs text-gray-400 mb-4">{b.date}</p>
                         <div className="mt-auto flex gap-2">
                            <button onClick={() => { setCurrentBlog(b); setIsEditing(true); }} className="flex-1 bg-oryzon-light text-oryzon-dark py-2 rounded-lg text-sm font-bold hover:bg-gray-200">Edit</button>
                            <button onClick={() => deleteBlog(b.id)} className="flex-1 bg-red-50 text-red-500 py-2 rounded-lg text-sm font-bold hover:bg-red-100">Delete</button>
                         </div>
                      </div>
                  ))
                }
             </div>
             )
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
