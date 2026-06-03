import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Heart, 
  Copy, 
  Check, 
  Sparkles, 
  BookOpen, 
  Flame, 
  MessageSquare, 
  Crown, 
  X, 
  Bookmark,
  Share2,
  ChevronRight,
  Quote,
  Feather,
  Info,
  ArrowLeft,
  History,
  Eye,
  EyeOff,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { Item } from './types';

import {
  getDailyDiscovery,
  PREMIUM_COLLECTIONS,
  Collection,
  MOODS,
  Mood,
  belongsToMood,
  belongsToCollection,
  downloadQuoteWallpaper
} from './premiumUtils';

import {
  initialShayaris,
  initialPickupLines,
  initialRizzChats,
  initialPoems,
  initialPoets,
  ALL_LIBRARY_ITEMS
} from './data';

// Placeholders for search bar rotating every few seconds
const ROTATING_PLACEHOLDERS = [
  "Search romantic shayari...",
  "Search funny pickup lines...",
  "Search Urdu poetry...",
  "Search first date texts...",
  "Search heartbreak quotes..."
];

// Trending Search Chips
const TRENDING_CHIPS = [
  "Romantic Shayari",
  "Funny Pickup Lines",
  "First Date",
  "Urdu Poetry",
  "Heartbreak",
  "Friendship",
  "Flirty Texts",
  "Motivational Poetry"
];

export default function App() {
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'Shayari' | 'Pickup Lines' | 'Rizz Chats' | 'Poems' | 'Famous Poets' | null>(null);
  
  // Search history state
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gugu_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Search input focus state
  const [searchFocused, setSearchFocused] = useState(false);

  // Poet of the day - chosen once on mount / refresh
  const [poetOfTheDay] = useState(() => {
    const randomIndex = Math.floor(Math.random() * initialPoets.length);
    return initialPoets[randomIndex] || initialPoets[0];
  });

  // Distraction-free reading mode state
  const [isReadingMode, setIsReadingMode] = useState(false);

  // Filter saved favorites by category
  const [favCategoryFilter, setFavCategoryFilter] = useState<'All' | 'Shayari' | 'Pickup Lines' | 'Rizz Chats' | 'Poems' | 'Famous Poets'>('All');

  // Rotating search placeholder index
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Featured Cards state - indices in the respective arrays initialized to random content
  const [featuredShayariIdx, setFeaturedShayariIdx] = useState(() => Math.floor(Math.random() * initialShayaris.length));
  const [featuredPickupIdx, setFeaturedPickupIdx] = useState(() => Math.floor(Math.random() * initialPickupLines.length));
  const [featuredRizzIdx, setFeaturedRizzIdx] = useState(() => Math.floor(Math.random() * initialRizzChats.length));
  const [featuredPoemIdx, setFeaturedPoemIdx] = useState(() => Math.floor(Math.random() * initialPoems.length));

  // Transitions flags for rotation
  const [fadeShayari, setFadeShayari] = useState(true);
  const [fadePickup, setFadePickup] = useState(true);
  const [fadeRizz, setFadeRizz] = useState(true);
  const [fadePoem, setFadePoem] = useState(true);

  // User Favorites saved in Local Storage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gugu_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track the item currently being read in detail modal
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Copy-to-clipboard feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState("");

  // Favorites sidebar drawer state
  const [showFavoritesDrawer, setShowFavoritesDrawer] = useState(false);

  // PREMIUM EXPERIENCES HOOKS
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  // Track explored items count
  const [exploredItems, setExploredItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gugu_explored_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track recently viewed items to hold modern shelf and continue reading
  const [recentViewed, setRecentViewed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gugu_recent_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // GUGU Hidden Easter Egg
  const [isGuguEggActive, setIsGuguEggActive] = useState(false);

  // Surprise Me animation triggers
  const [surpriseMeAnimating, setSurpriseMeAnimating] = useState(false);
  const [surpriseMeItem, setSurpriseMeItem] = useState<Item | null>(null);

  // FAQ Accordion index tracker
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Ref for the search results target
  const resultsSectionRef = useRef<HTMLDivElement | null>(null);
  const [resultsHighlight, setResultsHighlight] = useState(false);

  // Helper to scroll smoothly to search results
  const performScrollToResults = () => {
    setTimeout(() => {
      if (resultsSectionRef.current) {
        const yOffset = -100; // Offset by 100px so results header is beautifully framed
        const element = resultsSectionRef.current;
        const yCoord = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
          top: yCoord,
          behavior: 'smooth'
        });

        // Highlight the results section briefly with transition
        setResultsHighlight(true);
        setTimeout(() => {
          setResultsHighlight(false);
        }, 1500);
      }
    }, 150);
  };

  // Save favorites to storage
  useEffect(() => {
    localStorage.setItem('gugu_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // ROTATING SEARCH PLACEHOLDER EFFECT
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // AUTOMATIC FEATURED CONTENT ROTATION EFFECT
  // Every 7 seconds, rotate with a sweet CSS fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Rotate Shayari
      setFadeShayari(false);
      setTimeout(() => {
        setFeaturedShayariIdx((prev) => (prev + 1) % initialShayaris.length);
        setFadeShayari(true);
      }, 300);

      // 2. Rotate Pickup lines (offset slightly for a staggered organic flow)
      setTimeout(() => {
        setFadePickup(false);
        setTimeout(() => {
          setFeaturedPickupIdx((prev) => (prev + 1) % initialPickupLines.length);
          setFadePickup(true);
        }, 300);
      }, 1000);

      // 3. Rotate Rizz Chats
      setTimeout(() => {
        setFadeRizz(false);
        setTimeout(() => {
          setFeaturedRizzIdx((prev) => (prev + 1) % initialRizzChats.length);
          setFadeRizz(true);
        }, 300);
      }, 2000);

      // 4. Rotate Poems
      setTimeout(() => {
        setFadePoem(false);
        setTimeout(() => {
          setFeaturedPoemIdx((prev) => (prev + 1) % initialPoems.length);
          setFadePoem(true);
        }, 300);
      }, 3000);

    }, 8500);

    return () => clearInterval(interval);
  }, []);

  // Check URL query parameters for direct item sharing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idVal = params.get('id');
    if (idVal) {
      const matchedItem = ALL_LIBRARY_ITEMS.find((item) => item.id === idVal);
      if (matchedItem) {
        setSelectedItem(matchedItem);
        triggerToast(`Welcome to GUGU! Opening shared words...`);
      }
    }
  }, []);

  // Update URL query parameters based on active selection (to support real-time sharing links)
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedItem) {
      url.searchParams.set('id', selectedItem.id);
    } else {
      url.searchParams.delete('id');
    }
    window.history.replaceState({}, '', url.toString());
  }, [selectedItem]);

  // Effect to register reading progress (explored items) and recently viewed queue
  useEffect(() => {
    if (selectedItem && selectedItem.id) {
      // 1. Explored items count tracking
      setExploredItems((prev) => {
        if (prev.includes(selectedItem.id)) return prev;
        const updated = [...prev, selectedItem.id];
        localStorage.setItem('gugu_explored_items', JSON.stringify(updated));
        return updated;
      });

      // 2. Recently viewed items list tracking
      setRecentViewed((prev) => {
        const filtered = prev.filter((id) => id !== selectedItem.id);
        const updated = [selectedItem.id, ...filtered].slice(0, 5);
        localStorage.setItem('gugu_recent_viewed', JSON.stringify(updated));
        return updated;
      });
    }
  }, [selectedItem]);

  // Easter egg listener for "gugu" query
  useEffect(() => {
    if (searchQuery.trim().toLowerCase() === 'gugu') {
      setIsGuguEggActive(true);
      triggerToast("✨ You found GUGU's secret cozy sanctuary! ✨");
    }
  }, [searchQuery]);

  // Add search query to history logs
  const addToHistory = (query: string) => {
    const cleaned = query.trim();
    if (!cleaned) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== cleaned.toLowerCase());
      const updated = [cleaned, ...filtered].slice(0, 5);
      localStorage.setItem('gugu_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Get autocomplete list for search suggestion dropdown
  const getSuggestions = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const suggestionsList: { type: 'category' | 'tag' | 'author' | 'item'; value: string; itemId?: string }[] = [];

    // 1. Categories
    const categories = ['Shayari', 'Pickup Lines', 'Rizz Chats', 'Poems', 'Famous Poets'];
    categories.forEach((cat) => {
      if (cat.toLowerCase().includes(query) && suggestionsList.length < 3) {
        suggestionsList.push({ type: 'category', value: cat });
      }
    });

    // 2. Tags
    const allUniqueTags = Array.from(new Set(ALL_LIBRARY_ITEMS.flatMap((item) => item.tags || [])));
    allUniqueTags.forEach((tag) => {
      if (tag.toLowerCase().includes(query) && suggestionsList.length < 5) {
        suggestionsList.push({ type: 'tag', value: `#${tag}` });
      }
    });

    // 3. Authors/Poets
    const allUniqueAuthors = Array.from(new Set(ALL_LIBRARY_ITEMS.map((item) => item.author || item.name).filter(Boolean)));
    allUniqueAuthors.forEach((author) => {
      if (author!.toLowerCase().includes(query) && suggestionsList.length < 6) {
        suggestionsList.push({ type: 'author', value: author! });
      }
    });

    // 4. Item matches (Titles/Snippet clues)
    ALL_LIBRARY_ITEMS.forEach((item) => {
      const titleOrName = item.name || item.title;
      if (titleOrName && titleOrName.toLowerCase().includes(query) && suggestionsList.length < 8) {
        suggestionsList.push({ type: 'item', value: titleOrName, itemId: item.id });
      }
    });

    return suggestionsList.slice(0, 8);
  };

  // Related Content Engine based on matching tags & same category index
  const getRelatedItems = (currentItem: Item): Item[] => {
    if (!currentItem) return [];
    const currentTags = currentItem.tags || [];
    
    const matchedList = ALL_LIBRARY_ITEMS
      .filter((item) => item.id !== currentItem.id)
      .map((item) => {
        let score = 0;
        if (item.category === currentItem.category) {
          score += 3;
        }
        const commonTags = (item.tags || []).filter((tag) => currentTags.includes(tag));
        score += commonTags.length * 2;
        return { item, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);

    // Padding if less than 4 matches found
    if (matchedList.length < 4) {
      const extraItems = ALL_LIBRARY_ITEMS.filter(
        (item) => item.id !== currentItem.id && item.category === currentItem.category && !matchedList.some((m) => m.id === item.id)
      );
      return [...matchedList, ...extraItems].slice(0, 4);
    }

    return matchedList.slice(0, 4);
  };

  // Add/Remove favorite toggler
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const isFav = prev.includes(id);
      if (isFav) {
        triggerToast("Removed from your cozy vault.");
        return prev.filter((favId) => favId !== id);
      } else {
        triggerToast("Saved to your cozy vault!");
        return [...prev, id];
      }
    });
  };

  // Toast feedback helper
  const triggerToast = (message: string) => {
    setShowToast(message);
    setTimeout(() => {
      setShowToast("");
    }, 3000);
  };

  // Surprise Me Handler
  const handleSurpriseMe = () => {
    // Filter to card content items (exclude famous poets for pure reading surprise)
    const validPool = ALL_LIBRARY_ITEMS.filter(
      (item) => item.category !== 'Famous Poets'
    );
    if (validPool.length === 0) return;

    setSurpriseMeAnimating(true);
    triggerToast("🎲 Wandering into the cozy vaults of surprise...");

    // Pick random item
    const randomItem = validPool[Math.floor(Math.random() * validPool.length)];
    setSurpriseMeItem(randomItem);

    // Staged timeout to play a beautiful sparkling flash
    setTimeout(() => {
      setSelectedItem(randomItem);
      setSurpriseMeAnimating(false);
      setSurpriseMeItem(null);
      triggerToast(`🎲 Opened a surprise ${randomItem.category}!`);
    }, 1200);
  };

  // Copy to clipboard helper
  const copyToClipboard = (item: Item, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    let textToCopy = '';
    if (item.category === 'Famous Poets') {
      textToCopy = `${item.name || item.title} - ${item.title}\n\n${item.content}\n\nRepresentative Work: ${item.signatureWork || 'None'}`;
    } else {
      textToCopy = `"${item.content}"\n\n— ${item.author || 'Anonymous'} (Category: ${item.category})`;
    }

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopiedId(item.id);
        triggerToast("Perfect words copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        triggerToast("Failed to copy. Try selecting text manually.");
      });
  };

  // Get recently viewed Item models from stored IDs
  const getRecentItems = (): Item[] => {
    return recentViewed
      .map(id => ALL_LIBRARY_ITEMS.find(item => item.id === id))
      .filter(Boolean) as Item[];
  };

  // Search filter core logic
  const getFilteredItems = () => {
    // Determine query
    const query = searchQuery.trim().toLowerCase();

    let results = ALL_LIBRARY_ITEMS.filter((item) => {
      // 1. Filter by category if selected
      if (activeCategory && item.category !== activeCategory) {
        return false;
      }

      // 1.1 Filter by premium mood explorer if active
      if (activeMood && !belongsToMood(item, activeMood)) {
        return false;
      }

      // 1.2 Filter by curated collection if active
      if (activeCollection && !belongsToCollection(item, activeCollection)) {
        return false;
      }

      // 2. Filter by search text
      if (query !== '') {
        // Special mappings for specific trending searches to return beautiful, targeted content
        if (query === 'romantic shayari') {
          return item.category === 'Shayari' && (
            item.tags.some(tag => tag.toLowerCase() === 'romantic') ||
            item.content.toLowerCase().includes('romantic') ||
            (item.title || '').toLowerCase().includes('romantic')
          );
        }
        if (query === 'funny pickup lines') {
          return item.category === 'Pickup Lines' && (
            item.tags.some(tag => ['funny', 'humorous', 'playful', 'silly', 'puns', 'cheesy'].includes(tag.toLowerCase())) ||
            item.content.toLowerCase().includes('funny') ||
            (item.title || '').toLowerCase().includes('funny')
          );
        }
        if (query === 'first date') {
          return item.tags.some(tag => tag.toLowerCase().includes('first date') || tag.toLowerCase() === 'date') ||
                 item.content.toLowerCase().includes('first date') ||
                 (item.title || '').toLowerCase().includes('first date');
        }
        if (query === 'urdu poetry') {
          return (item.category === 'Shayari' || item.category === 'Poems' || item.category === 'Famous Poets') && (
            item.tags.some(tag => tag.toLowerCase() === 'urdu') ||
            item.content.toLowerCase().includes('urdu') ||
            (item.name || '').toLowerCase().includes('urdu') ||
            (item.author || '').toLowerCase().includes('urdu')
          );
        }
        if (query === 'heartbreak') {
          return item.tags.some(tag => ['heartbreak', 'sad', 'sorrow', 'lament', 'melancholy', 'melancholic'].includes(tag.toLowerCase())) ||
                 item.content.toLowerCase().includes('heartbreak') ||
                 item.content.toLowerCase().includes('broken heart') ||
                 (item.title || '').toLowerCase().includes('heartbreak');
        }
        if (query === 'friendship') {
          return item.tags.some(tag => tag.toLowerCase().includes('friend')) ||
                 item.content.toLowerCase().includes('friend') ||
                 (item.title || '').toLowerCase().includes('friend');
        }
        if (query === 'flirty texts') {
          return (item.category === 'Pickup Lines' || item.category === 'Rizz Chats') && (
            item.tags.some(tag => ['flirty', 'rizz', 'smooth', 'bold', 'flirt'].includes(tag.toLowerCase())) ||
            item.content.toLowerCase().includes('flirty') ||
            item.content.toLowerCase().includes('rizz')
          );
        }
        if (query === 'motivational poetry') {
          return (item.category === 'Poems' || item.category === 'Shayari') && (
            item.tags.some(tag => ['motivational', 'inspiring', 'inspirational', 'strength', 'resilience', 'success', 'wisdom', 'courage'].includes(tag.toLowerCase())) ||
            item.content.toLowerCase().includes('motivation') ||
            item.content.toLowerCase().includes('inspire') ||
            (item.title || '').toLowerCase().includes('motivation') ||
            (item.title || '').toLowerCase().includes('inspire')
          );
        }

        // Generic fallback search: Check if ALL words in the query are matched somewhere in the item fields
        const words = query.split(/\s+/).filter(w => w.length > 0);
        if (words.length === 0) return true;

        return words.every(word => {
          const matchesTitle = (item.title || '').toLowerCase().includes(word);
          const matchesName = (item.name || '').toLowerCase().includes(word);
          const matchesContent = item.content.toLowerCase().includes(word);
          const matchesAuthor = (item.author || item.period || '').toLowerCase().includes(word);
          const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(word));
          const matchesCategory = item.category.toLowerCase().includes(word);

          return matchesTitle || matchesName || matchesContent || matchesAuthor || matchesTags || matchesCategory;
        });
      }

      return true;
    });

    if (results.length === 0 && query !== '') {
      // Automatically generate beautiful matching sample entries!
      const capitalized = query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      results = [
        {
          id: `gen-1-${query.replace(/\s+/g, '-')}`,
          title: `Whispers of ${capitalized}`,
          content: `Even in the deepest silences, the essence of ${query} lingers like a sweet fragrance, turning ordinary moments into poetry and memory.`,
          author: "Curator of GUGU",
          category: "Poems",
          tags: ["Cozy", "Discovery", capitalized]
        },
        {
          id: `gen-2-${query.replace(/\s+/g, '-')}`,
          title: `The ${capitalized} Equation`,
          content: `Me: Do you have a map?\nHer: Why?\nMe: Because I keep getting lost in this beautiful feeling of ${query} with you.`,
          author: "GUGU Pen",
          category: "Rizz Chats",
          tags: ["Smooth", "Rizz", capitalized]
        }
      ];
    }

    return results;
  };

  const filteredItems = getFilteredItems();

  // Selected rotating items
  const currentFeaturedShayari = initialShayaris[featuredShayariIdx] || initialShayaris[0];
  const currentFeaturedPickup = initialPickupLines[featuredPickupIdx] || initialPickupLines[0];
  const currentFeaturedRizz = initialRizzChats[featuredRizzIdx] || initialRizzChats[0];
  const currentFeaturedPoem = initialPoems[featuredPoemIdx] || initialPoems[0];

  // Map category to icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Shayari': return <span className="mr-1">❤️</span>;
      case 'Pickup Lines': return <span className="mr-1">🔥</span>;
      case 'Rizz Chats': return <span className="mr-1">💬</span>;
      case 'Poems': return <span className="mr-1">📖</span>;
      case 'Famous Poets': return <span className="mr-1">👑</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gugu-bg text-gugu-text font-serif antialiased selection:bg-gugu-accent/30 selection:text-gugu-text flex flex-col relative overflow-x-hidden">
      
      {/* Decorative Background Elements from Editorial Theme */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#D8A7B1] opacity-10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#FFF8F0] opacity-40 rounded-full blur-[100px] pointer-events-none" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-gugu-bg/90 backdrop-blur-md border-b border-[#4A2C2A]/10 transition-all duration-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setSearchQuery(''); setActiveCategory(null); }}>
            <div className="w-8 h-8 rounded-full bg-gugu-accent flex items-center justify-center">
              <Feather className="w-4.5 h-4.5 text-gugu-card" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tighter uppercase text-gugu-text">GUGU</span>
          </div>

          {/* Editorial Navigation Menu */}
          <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest font-sans font-semibold opacity-70">
            <button onClick={() => { setSearchQuery(''); setActiveCategory(null); }} className="hover:text-gugu-accent transition-colors cursor-pointer">Library</button>
            <button onClick={() => { setActiveCategory('Famous Poets'); setSearchQuery(''); }} className="hover:text-gugu-accent transition-colors cursor-pointer">Poets</button>
            <button onClick={() => { setSearchQuery('Romantic'); setActiveCategory(null); }} className="hover:text-gugu-accent transition-colors cursor-pointer">Collections</button>
            <button onClick={() => { triggerToast("Submission page is under shelf storage. Coming soon!"); }} className="hover:text-gugu-accent transition-colors cursor-pointer">Submit</button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Reset Filter Button */}
            {(searchQuery || activeCategory || activeMood || activeCollection) && (
              <button 
                onClick={() => { 
                  setSearchQuery(''); 
                  setActiveCategory(null); 
                  setActiveMood(null); 
                  setActiveCollection(null); 
                }}
                className="text-xs uppercase tracking-wider font-sans font-semibold text-gugu-muted hover:text-gugu-accent transition-all hidden sm:inline cursor-pointer"
              >
                Clear
              </button>
            )}

            {/* Premium Saved Vault Button */}
            <button
              onClick={() => setShowFavoritesDrawer(true)}
              className="flex items-center space-x-2 bg-gugu-card hover:bg-[#FFF] px-4 py-2 rounded-full border border-[#4A2C2A]/15 text-xs font-semibold uppercase tracking-wider font-sans transition-all shadow-xs group"
              title="Your saved sweet words"
            >
              <Heart className={`w-3.5 h-3.5 text-gugu-accent group-hover:scale-110 transition-transform ${favorites.length > 0 ? 'fill-gugu-accent' : ''}`} />
              <span>Saved Vault</span>
              <span className="bg-gugu-accent/20 text-gugu-text text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-5 text-center">
                {favorites.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* DETAILED NOTIFICATION TOAST */}
      {showToast && (
        <div id="toast" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gugu-text text-gugu-card px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 text-sm animate-fade-in border border-[#5c3c39]">
          <Sparkles className="w-4 h-4 text-[#EBD9C4]" />
          <span>{showToast}</span>
        </div>
      )}

      {/* CORE HERO SECTION */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 mt-16 sm:mt-24 text-center">
        <h1 className="font-serif text-7xl sm:text-9xl font-extrabold tracking-tighter leading-none mb-2 text-gugu-text select-none animate-fade-in">
          GUGU
        </h1>
        <p className="font-sans text-xs sm:text-sm uppercase tracking-[0.3em] font-bold text-gugu-muted/80 mt-4 animate-fade-in">
          Find the Perfect Words
        </p>

        {/* CATEGORY NAVIGATION PILLS */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {[
            { display: "❤️ Shayari", val: "Shayari" },
            { display: "🔥 Pickup Lines", val: "Pickup Lines" },
            { display: "💬 Rizz Chats", val: "Rizz Chats" },
            { display: "📖 Poems", val: "Poems" },
            { display: "👑 Famous Poets", val: "Famous Poets" }
          ].map((cat) => {
            const isSelected = activeCategory === cat.val;
            return (
              <button
                key={cat.val}
                onClick={() => {
                  const targetCategory = isSelected ? null : (cat.val as any);
                  setActiveCategory(targetCategory);
                  if (targetCategory) {
                    performScrollToResults();
                  }
                }}
                className={`px-5 py-3 rounded-full text-xs uppercase tracking-wider font-sans font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-gugu-accent text-gugu-card border border-gugu-accent shadow-md scale-102' 
                    : 'bg-gugu-card/60 hover:bg-gugu-card text-gugu-text border border-[#4A2C2A]/15 shadow-xs'
                }`}
              >
                {cat.display}
              </button>
            );
          })}
        </div>

        {/* CATEGORY STATISTICS COMPENDIUM */}
        <div className="mt-5 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[10px] text-gugu-muted font-sans font-bold uppercase tracking-widest bg-gugu-card/30 backdrop-blur-xs py-2 px-5 rounded-2xl border border-[#4A2C2A]/10 max-w-xl mx-auto shadow-3xs select-none">
          <span className="text-gugu-accent/80 text-[11px]">📜 Compendium:</span>
          <div className="flex items-center gap-1.5">
            <span>Shayaris:</span>
            <span className="bg-white px-2 py-0.5 rounded border border-[#4A2C2A]/10 text-gugu-text font-semibold">{initialShayaris.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Pickup Lines:</span>
            <span className="bg-white px-2 py-0.5 rounded border border-[#4A2C2A]/10 text-gugu-text font-semibold">{initialPickupLines.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Rizz Chats:</span>
            <span className="bg-white px-2 py-0.5 rounded border border-[#4A2C2A]/10 text-gugu-text font-semibold">{initialRizzChats.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Poems:</span>
            <span className="bg-white px-2 py-0.5 rounded border border-[#4A2C2A]/10 text-gugu-text font-semibold">{initialPoems.length}</span>
          </div>
        </div>

        {/* MODERN COZY SEARCH ENGINE BAR */}
        <div className="mt-10 max-w-2xl mx-auto relative group">
          <div className="absolute inset-0 bg-gugu-accent/15 rounded-3xl blur-2xl transition-all duration-300 opacity-40 group-focus-within:opacity-80" />
          <div className="relative bg-gugu-card border border-[#4A2C2A]/10 shadow-lg shadow-black/5 focus-within:shadow-xl focus-within:shadow-black/5 rounded-2xl flex items-center p-2.5 transition-all focus-within:border-gugu-accent focus-within:ring-2 focus-within:ring-gugu-accent/20">
            <div className="pl-4 pr-2 text-gugu-text/60">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addToHistory(searchQuery);
                  setSearchFocused(false);
                  performScrollToResults();
                }
              }}
              placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
              className="w-full bg-transparent border-none py-3 px-1 text-gugu-text font-sans placeholder-gugu-text/40 focus:outline-hidden text-base sm:text-lg focus:ring-0"
              aria-label="Search perfect words database"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSearchFocused(false);
                }}
                className="p-2.5 mr-1 hover:bg-[#FBF3ED] rounded-xl text-gugu-muted hover:text-gugu-text transition-colors cursor-pointer"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* INSTANT SEARCH SUGGESTIONS & HISTORY PANEL */}
          {searchFocused && (
            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-gugu-card border border-[#4A2C2A]/20 shadow-2xl rounded-2xl p-4 z-50 text-left animate-fade-in max-h-96 overflow-y-auto">
              {searchQuery.trim() !== "" ? (
                <div>
                  <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-gugu-accent mb-2">Instant Suggestions</h4>
                  <div className="space-y-1">
                    {getSuggestions().map((sug, idx) => (
                      <button
                        key={`${sug.type}-${idx}`}
                        onMouseDown={() => {
                          if (sug.itemId) {
                            const matched = ALL_LIBRARY_ITEMS.find(i => i.id === sug.itemId);
                            if (matched) setSelectedItem(matched);
                          } else {
                            // Strip leading '#' if it's a tag select
                            const queryVal = sug.value.startsWith('#') ? sug.value.substring(1) : sug.value;
                            setSearchQuery(queryVal);
                            addToHistory(queryVal);
                            performScrollToResults();
                          }
                          setSearchFocused(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-gugu-bg flex items-center justify-between text-xs transition-colors cursor-pointer"
                      >
                        <span className="font-serif text-gugu-text">{sug.value}</span>
                        <span className="text-[9px] font-sans uppercase font-bold text-gugu-muted bg-gugu-bg/70 px-2 py-0.5 rounded border border-[#4A2C2A]/5">
                          {sug.type}
                        </span>
                      </button>
                    ))}
                    {getSuggestions().length === 0 && (
                      <p className="text-xs text-gugu-muted italic px-3 py-2">No matching suggestions. Press enter to search.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recent search history */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-gugu-accent flex items-center gap-1">
                        <History className="w-3 h-3 text-gugu-accent/80" /> Recent Searches
                      </h4>
                      {searchHistory.length > 0 && (
                        <button
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setSearchHistory([]);
                            localStorage.removeItem('gugu_search_history');
                            triggerToast("Cleared search logs.");
                          }}
                          className="text-[9px] uppercase tracking-widest font-sans font-bold text-red-500 hover:underline cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {searchHistory.length === 0 ? (
                      <p className="text-xs text-gugu-muted italic py-3">Your recent searches will reside here.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {searchHistory.map((queryText, idx) => (
                          <button
                            key={idx}
                            onMouseDown={() => {
                              setSearchQuery(queryText);
                              addToHistory(queryText);
                              setSearchFocused(false);
                              performScrollToResults();
                            }}
                            className="text-xs bg-[#FAF5F0] hover:bg-[#F2E5D9] px-3 py-1.5 rounded-lg border border-[#4A2C2A]/10 text-gugu-text hover:text-gugu-accent transition-all font-serif cursor-pointer"
                          >
                            {queryText}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Popular Curation chips */}
                  <div>
                    <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#D37825] flex items-center gap-1 mb-2">
                      <Flame className="w-3 h-3 text-[#D37825]/80" /> Popular Curations
                    </h4>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {["Romantic Shayari", "Urdu Poetry", "Funny Pickup Lines", "First Date", "Motivational Poetry", "Friendship"].map((popularName) => (
                        <button
                          key={popularName}
                          onMouseDown={() => {
                            setSearchQuery(popularName);
                            addToHistory(popularName);
                            setSearchFocused(false);
                            performScrollToResults();
                          }}
                          className="text-[10px] bg-[#FFFBF7] hover:bg-[#FBEBE2] px-3 py-1.5 rounded-lg border border-[#F0D5C3] text-gugu-text hover:text-gugu-accent transition-all font-sans font-bold uppercase tracking-wider cursor-pointer"
                        >
                          {popularName}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TRENDING SEARCHES CHIPS */}
        <div className="mt-6 max-w-2xl mx-auto text-center flex flex-wrap items-center justify-center gap-2 px-3">
          <span className="text-[10px] font-bold text-gugu-muted/90 uppercase tracking-widest mr-2 font-sans">Trending:</span>
          {TRENDING_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setSearchQuery(chip);
                setActiveCategory(null);
                setActiveMood(null);
                setActiveCollection(null);
                addToHistory(chip);
                triggerToast(`Searching for "${chip}"`);
                performScrollToResults();
              }}
              className="text-[10px] font-sans uppercase tracking-wider font-bold bg-white/40 hover:bg-white px-3.5 py-1.5 rounded-lg border border-[#4A2C2A]/15 text-gugu-text hover:text-gugu-accent transition-all cursor-pointer shadow-3xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* PREMIUM EXPERIENCE: MOOD EXPLORER */}
        <div className="mt-10 max-w-3xl mx-auto text-center border-t border-[#4A2C2A]/10 pt-8">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#9C5A3C] block mb-4">
            🎨 MOOD EXPLORER • INSTANT COZY FEELING FILTER
          </span>
          <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto px-4 select-none">
            {MOODS.map((mood) => {
              const isActive = activeMood === mood.name;
              return (
                <button
                  key={mood.id}
                  onClick={() => {
                    const nextMood = isActive ? null : mood.name;
                    setActiveMood(nextMood);
                    setActiveCollection(null); // Clear selected collection
                    setSearchQuery(''); // Clear search query
                    setActiveCategory(null); // Clear category filter
                    addToHistory(`Feeling: ${mood.name}`);
                    triggerToast(isActive ? "Reset mood wandering." : `Feeling ${mood.name} ${mood.emoji}`);
                    if (nextMood) {
                      performScrollToResults();
                    }
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#4A2C2A] text-gugu-card border-[#4A2C2A] shadow-md scale-102 font-extrabold'
                      : `${mood.colorClass} ${mood.borderColor} shadow-3xs hover:-translate-y-0.5`
                  }`}
                >
                  <span className="text-sm">{mood.emoji}</span>
                  <span>{mood.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Curated Collections Shelf on home */}
        <div className="mt-8 max-w-3xl mx-auto text-center">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#9C5A3C] block mb-4">
            📚 PREMIUM CURATED BOOKSHELVES
          </span>
          <div className="flex flex-wrap justify-center gap-2 px-4 select-none">
            {PREMIUM_COLLECTIONS.map((col) => {
              const isActive = activeCollection === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => {
                    const nextCol = isActive ? null : col.id;
                    setActiveCollection(nextCol);
                    setActiveMood(null); // Clear active mood
                    setSearchQuery(''); // Clear search
                    setActiveCategory(null); // Clear category
                    addToHistory(`Shelf: ${col.name}`);
                    triggerToast(isActive ? "Left curated bookshelf." : `Opened "${col.name}" bookshelf`);
                    if (nextCol) {
                      performScrollToResults();
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10.5px] font-semibold tracking-wider font-sans uppercase transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#4A2C2A] text-gugu-card border-[#4A2C2A] shadow-md font-bold'
                      : 'bg-white hover:bg-[#FDF9F2] text-[#4A2C2A] border-gugu-borders shadow-3xs hover:-translate-y-0.5'
                  }`}
                  title={col.description}
                >
                  <span className="text-sm">{col.emoji}</span>
                  <span>{col.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CORE BODY WRAPPER */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 relative z-10">
        
        {/* IF NOT FILTERING/SEARCHING -> SHOW COZY AUTOMATIC ROTATING FEATURED CARDS */}
        {!(searchQuery || activeCategory || activeMood || activeCollection) ? (
          <div>
            {/* FEATURE 2 & 5: DAILY DISCOVERY & EXPLORATION SUMMARY PROGRESS */}
            {(() => {
              const todayString = new Date().toISOString().slice(0, 10);
              const { shayari: dailyShayari, pickupLine: dailyPickup, poem: dailyPoem } = getDailyDiscovery(todayString);
              
              return (
                <div className="mb-12 bg-gradient-to-br from-[#FCF7ED] to-[#FAF1E3] rounded-3xl p-6 sm:p-8 border border-[#E9DEC9] shadow-xs select-none">
                  
                  {/* Header section with Reading Progress info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#E9DEC9] pb-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#4A2C2A] flex items-center gap-2">
                        <span>✨</span> Today's Discovery
                      </h3>
                      <p className="text-xs text-gugu-muted font-sans font-medium mt-1">
                        A fresh, hand-picked selection of words that rotate every 24 hours. Click to read in focus mode.
                      </p>
                    </div>
                    <div className="bg-[#FFFDF9]/90 border border-[#E9DEC9] py-2.5 px-4 rounded-xl flex items-center gap-3 self-start sm:self-center shadow-3xs">
                      <div className="p-1 px-2.5 text-xs bg-[#4A2C2A]/5 text-[#4A2C2A] rounded-lg font-bold font-mono">
                        📚 {exploredItems.length}
                      </div>
                      <div className="text-left">
                        <span className="block text-[8px] uppercase tracking-widest font-bold text-gugu-muted">Reading Journey</span>
                        <span className="block text-[11px] font-semibold text-gugu-text">
                          You've explored <span className="font-bold text-gugu-accent">{exploredItems.length}</span> pieces of content.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Discovery grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                      { item: dailyShayari, label: "Beautiful Shayari", icon: "❤️" },
                      { item: dailyPickup, label: "Witty Pickup Line", icon: "🔥" },
                      { item: dailyPoem, label: "Soulful Poem", icon: "📖" }
                    ].map(({ item, label, icon }) => (
                      <div 
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item);
                          triggerToast(`Discovering today's choice: "${item.title || 'Untitled'}"`);
                        }}
                        className="bg-[#FFFDF9] hover:bg-white p-5 rounded-2.5xl border border-gugu-borders shadow-3xs hover:border-gugu-accent/40 hover:shadow-2xs transition-all cursor-pointer flex flex-col justify-between group h-full min-h-[175px]"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-sans uppercase font-bold text-gugu-accent tracking-widest flex items-center gap-1 bg-[#FAF3EA] py-0.5 px-2 rounded-md">
                              <span>{icon}</span> {label}
                            </span>
                            <span className="text-[8px] font-sans font-bold text-gugu-muted px-2 py-0.5 border border-gugu-borders/30 rounded">DAILY PICK</span>
                          </div>
                          
                          <p className="font-serif text-xs leading-relaxed text-gugu-text group-hover:text-gugu-accent italic line-clamp-4 mt-2">
                            "{item.content}"
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#4A2C2A]/5 flex items-center justify-between text-[9px] uppercase tracking-wider font-bold text-gugu-muted">
                          <span>— {item.author || "Anonymous"}</span>
                          <span className="group-hover:text-gugu-accent transition-colors">Read →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* FEATURE 8 & 9: RECENTLY VIEWED & CONTINUE READING SHELF */}
            {recentViewed.length > 0 && (
              <div className="mb-10 bg-gugu-card/40 rounded-2xl p-5 border border-gugu-borders shadow-3xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-1">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-gugu-muted" />
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#4A2C2A] block">
                      Recently Viewed Shelf
                    </span>
                  </div>
                  {/* Continue Reading Button to quickly re-open the single most recent item */}
                  {getRecentItems().length > 0 && (
                    <button
                      onClick={() => {
                        const mostRecent = getRecentItems()[0];
                        if (mostRecent) {
                          setSelectedItem(mostRecent);
                          triggerToast(`Resuming reading: "${mostRecent.title || mostRecent.name}"`);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4A2C2A] hover:bg-[#341e1d] text-gugu-card text-[9px] font-sans font-bold uppercase tracking-wider rounded-lg shadow-3xs transition-all cursor-pointer"
                    >
                      📖 Continue Reading last words
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 select-none">
                  {getRecentItems().map((recentItem) => (
                    <div
                      key={recentItem.id}
                      onClick={() => {
                        setSelectedItem(recentItem);
                        triggerToast(`Opening: "${recentItem.title || 'Untitled'}"`);
                      }}
                      className="bg-[#FFFDF9] hover:bg-white p-3 rounded-xl border border-gugu-borders/60 hover:border-gugu-accent/30 shadow-3xs cursor-pointer hover:shadow-2xs transition-all text-left flex flex-col justify-between group min-h-[100px]"
                    >
                      <div>
                        <span className="text-[7.5px] font-sans tracking-wider text-gugu-accent/95 uppercase font-bold block mb-1">
                          {recentItem.category}
                        </span>
                        <p className="font-serif text-[10px] text-[#4A2C2A] group-hover:text-gugu-accent italic line-clamp-2 leading-normal">
                          "{recentItem.content}"
                        </p>
                      </div>
                      <span className="text-[7.5px] font-sans block text-gugu-muted text-right mt-1.5 font-bold group-hover:text-gugu-accent">
                        Open →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gugu-borders/30">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-gugu-accent" />
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-gugu-text tracking-tight">Today's Cozy Rotations</h2>
              </div>
              <span className="text-xs font-serif italic text-gugu-muted text-center flex items-center gap-1.5 select-none bg-gugu-card/80 py-1 px-2.5 rounded-full border border-gugu-borders/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gugu-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gugu-accent"></span>
                </span>
                fading to next random matches automatically...
              </span>
            </div>

            {/* FEATURED CARDS BENTO-STYLE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* CARD 1: SHAYARI */}
              <div 
                onClick={() => setSelectedItem(currentFeaturedShayari)}
                className="bg-gugu-card rounded-3xl p-6 border border-white hover:border-[#4A2C2A]/15 shadow-sm hover:shadow-md cursor-pointer transition-all duration-350 transform hover:-translate-y-1 relative overflow-hidden group flex flex-col justify-between min-h-[250px]"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-3.5 text-xl select-none opacity-15 group-hover:opacity-35 group-hover:scale-110 transition-all">❤️</div>
                
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-[9px] font-bold font-sans uppercase tracking-widest text-[#C06072] block">
                        ❤️ Shayari
                      </span>
                      <button 
                        onClick={(e) => toggleFavorite(currentFeaturedShayari.id, e)}
                        className="p-1.5 hover:bg-gugu-bg/60 rounded-full text-gugu-muted hover:text-gugu-accent transition-colors cursor-pointer"
                        title="Save to vault"
                      >
                        <Heart className={`w-3.5 h-3.5 ${favorites.includes(currentFeaturedShayari.id) ? 'fill-gugu-accent text-gugu-accent' : ''}`} />
                      </button>
                    </div>

                    {/* Transition content wrapper */}
                    <div className={`transition-opacity duration-300 ${fadeShayari ? 'opacity-100' : 'opacity-0'}`}>
                      <h3 className="font-serif text-base font-bold text-gugu-text group-hover:text-gugu-accent transition-colors flex items-center leading-tight">
                        {currentFeaturedShayari.title}
                      </h3>
                      <p className="font-serif text-xs text-gugu-text italic leading-relaxed mt-2.5 bg-[#FAF1E6] p-2.5 rounded-lg border border-[#4A2C2A]/5">
                        "{currentFeaturedShayari.content}"
                      </p>
                    </div>
                  </div>

                  <div className={`transition-opacity duration-300 ${fadeShayari ? 'opacity-100' : 'opacity-0'}`}>
                    {currentFeaturedShayari.author && (
                      <p className="text-right text-[10px] text-gugu-muted/80 mt-2 font-serif font-semibold">
                        — {currentFeaturedShayari.author}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#4A2C2A]/5 flex items-center justify-between">
                  <div className="flex gap-1">
                    {currentFeaturedShayari.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="text-[9px] font-sans font-bold uppercase bg-gugu-bg text-gugu-muted/95 px-2 py-0.5 rounded border border-[#4A2C2A]/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-gugu-text uppercase tracking-wider group-hover:text-gugu-accent transition-colors flex items-center gap-1 font-sans">
                    View More <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>

              {/* CARD 2: PICKUP LINES */}
              <div 
                onClick={() => setSelectedItem(currentFeaturedPickup)}
                className="bg-gugu-card rounded-3xl p-6 border border-white hover:border-[#4A2C2A]/15 shadow-sm hover:shadow-md cursor-pointer transition-all duration-350 transform hover:-translate-y-1 relative overflow-hidden group flex flex-col justify-between min-h-[250px]"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-3.5 text-xl select-none opacity-15 group-hover:opacity-35 group-hover:scale-110 transition-all">🔥</div>
                
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-[9px] font-bold font-sans uppercase tracking-widest text-[#D87027] block">
                        🔥 Pickup Lines
                      </span>
                      <button 
                        onClick={(e) => toggleFavorite(currentFeaturedPickup.id, e)}
                        className="p-1.5 hover:bg-gugu-bg/60 rounded-full text-gugu-muted hover:text-gugu-accent transition-colors cursor-pointer"
                        title="Save to vault"
                      >
                        <Heart className={`w-3.5 h-3.5 ${favorites.includes(currentFeaturedPickup.id) ? 'fill-gugu-accent text-gugu-accent' : ''}`} />
                      </button>
                    </div>

                    {/* Transition content wrapper */}
                    <div className={`transition-opacity duration-300 ${fadePickup ? 'opacity-100' : 'opacity-0'}`}>
                      <h3 className="font-serif text-base font-bold text-gugu-text group-hover:text-gugu-accent transition-colors flex items-center leading-tight">
                        {currentFeaturedPickup.title}
                      </h3>
                      <p className="font-sans text-xs text-gugu-text/95 font-medium mt-2.5 leading-relaxed bg-[#FCF8F2] p-2.5 rounded-lg border border-[#4A2C2A]/5">
                        "{currentFeaturedPickup.content}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#4A2C2A]/5 flex items-center justify-between">
                  <div className="flex gap-1">
                    {currentFeaturedPickup.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="text-[9px] font-sans font-bold uppercase bg-gugu-bg text-gugu-muted/95 px-2 py-0.5 rounded border border-[#4A2C2A]/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-gugu-text uppercase tracking-wider group-hover:text-gugu-accent transition-colors flex items-center gap-1 font-sans">
                    View More <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>

              {/* CARD 3: RIZZ CHATS */}
              <div 
                onClick={() => setSelectedItem(currentFeaturedRizz)}
                className="bg-gugu-card rounded-3xl p-6 border border-white hover:border-[#4A2C2A]/15 shadow-sm hover:shadow-md cursor-pointer transition-all duration-350 transform hover:-translate-y-1 relative overflow-hidden group flex flex-col justify-between min-h-[250px]"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-3.5 text-xl select-none opacity-15 group-hover:opacity-35 group-hover:scale-110 transition-all">💬</div>
                
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-[9px] font-bold font-sans uppercase tracking-widest text-[#345DB3] block">
                        💬 Rizz Chats
                      </span>
                      <button 
                        onClick={(e) => toggleFavorite(currentFeaturedRizz.id, e)}
                        className="p-1.5 hover:bg-gugu-bg/60 rounded-full text-gugu-muted hover:text-gugu-accent transition-colors cursor-pointer"
                        title="Save to vault"
                      >
                        <Heart className={`w-3.5 h-3.5 ${favorites.includes(currentFeaturedRizz.id) ? 'fill-gugu-accent text-gugu-accent' : ''}`} />
                      </button>
                    </div>

                    {/* Transition content wrapper */}
                    <div className={`transition-opacity duration-300 ${fadeRizz ? 'opacity-100' : 'opacity-0'}`}>
                      <h3 className="font-serif text-base font-bold text-gugu-text group-hover:text-gugu-accent transition-colors flex items-center leading-tight">
                        {currentFeaturedRizz.title}
                      </h3>
                      
                      {/* Render elegant, space-efficient chat balloon preview */}
                      <div className="space-y-1 mt-2.5 text-[11px]">
                        {currentFeaturedRizz.content.split('\n').slice(0, 2).map((line, i) => {
                          const isMe = line.trim().startsWith('Me:');
                          const messageBody = line.replace(/^(Me:|Her:)/, '').trim();

                          return (
                            <div key={i} className="bg-gugu-bg/40 p-1.5 rounded-lg border border-[#4A2C2A]/5">
                              <span className="font-sans font-bold text-[8px] uppercase tracking-wider text-gugu-accent block">{isMe ? 'Send' : 'Reply'}</span>
                              <p className="line-clamp-1 text-[10.5px] font-sans">{messageBody}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#4A2C2A]/5 flex items-center justify-between">
                  <div className="flex gap-1">
                    {currentFeaturedRizz.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="text-[9px] font-sans font-bold uppercase bg-gugu-bg text-gugu-muted/95 px-2 py-0.5 rounded border border-[#4A2C2A]/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-gugu-text uppercase tracking-wider group-hover:text-gugu-accent transition-colors flex items-center gap-1 font-sans">
                    View More <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>

              {/* CARD 4: POEMS */}
              <div 
                onClick={() => setSelectedItem(currentFeaturedPoem)}
                className="bg-gugu-card rounded-3xl p-6 border border-white hover:border-[#4A2C2A]/15 shadow-sm hover:shadow-md cursor-pointer transition-all duration-350 transform hover:-translate-y-1 relative overflow-hidden group flex flex-col justify-between min-h-[250px]"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-3.5 text-xl select-none opacity-15 group-hover:opacity-35 group-hover:scale-110 transition-all">📖</div>
                
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-[9px] font-bold font-sans uppercase tracking-widest text-[#298342] block">
                        📖 Poems
                      </span>
                      <button 
                        onClick={(e) => toggleFavorite(currentFeaturedPoem.id, e)}
                        className="p-1.5 hover:bg-gugu-bg/60 rounded-full text-gugu-muted hover:text-gugu-accent transition-colors cursor-pointer"
                        title="Save to vault"
                      >
                        <Heart className={`w-3.5 h-3.5 ${favorites.includes(currentFeaturedPoem.id) ? 'fill-gugu-accent text-gugu-accent' : ''}`} />
                      </button>
                    </div>

                    {/* Transition content wrapper */}
                    <div className={`transition-opacity duration-300 ${fadePoem ? 'opacity-100' : 'opacity-0'}`}>
                      <h3 className="font-serif text-base font-bold text-gugu-text group-hover:text-gugu-accent transition-colors flex items-center leading-tight">
                        {currentFeaturedPoem.title}
                      </h3>
                      <p className="font-serif italic text-xs text-gugu-text/90 leading-relaxed mt-2.5 pl-2 border-l-1.5 border-[#D8A7B1] line-clamp-2">
                        {currentFeaturedPoem.content.split('\n').slice(0, 1).join('\n')}
                      </p>
                    </div>
                  </div>

                  <div className={`transition-opacity duration-300 ${fadePoem ? 'opacity-100' : 'opacity-0'}`}>
                    {currentFeaturedPoem.author && (
                      <p className="text-right text-[10px] text-gugu-muted/80 mt-2 font-serif font-semibold">
                        — {currentFeaturedPoem.author}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#4A2C2A]/5 flex items-center justify-between">
                  <div className="flex gap-1">
                    {currentFeaturedPoem.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="text-[9px] font-sans font-bold uppercase bg-gugu-bg text-gugu-muted/95 px-2 py-0.5 rounded border border-[#4A2C2A]/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-gugu-text uppercase tracking-wider group-hover:text-gugu-accent transition-colors flex items-center gap-1 font-sans">
                    View More <ChevronRight className="w-3" />
                  </span>
                </div>
              </div>

            </div>

            {/* CURATED FEATURED POET OF THE DAY */}
            <div className="mt-12 bg-gradient-to-br from-[#FFFDF9] to-[#FAF3E8] rounded-3xl p-6 sm:p-8 border border-[#4A2C2A]/10 shadow-3xs flex flex-col md:flex-row items-center gap-6 group hover:shadow-sm transition-all animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-gugu-accent/15 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform select-none">
                👑
              </div>
              <div className="flex-grow text-center md:text-left">
                <div className="text-[10px] uppercase font-sans font-bold tracking-widest text-[#9C5A3C] mb-1 flex items-center justify-center md:justify-start gap-1">
                  <Sparkles className="w-3 h-3 text-gugu-accent animate-pulse" /> Poet of the Day
                </div>
                <h3 className="font-serif text-2xl font-bold text-gugu-text mb-1 group-hover:text-gugu-accent transition-colors">{poetOfTheDay.name}</h3>
                <p className="text-xs text-gugu-muted font-mono mb-3">{poetOfTheDay.period} • Signature: "{poetOfTheDay.signatureWork}"</p>
                <p className="font-serif text-xs text-gugu-text/90 italic leading-relaxed line-clamp-2 pl-3 border-l border-[#4A2C2A]/15 md:max-w-2xl">
                  {poetOfTheDay.content}
                </p>
              </div>
              <button 
                onClick={() => setSelectedItem(poetOfTheDay)}
                className="shrink-0 text-xs bg-gugu-card hover:bg-white text-gugu-text px-5 py-3.5 rounded-xl border border-[#4A2C2A]/15 font-sans font-bold uppercase tracking-wider transition-all shadow-3xs cursor-pointer hover:border-gugu-accent flex items-center gap-1.5"
              >
                <span>Explore Profile</span> <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ) : null}

        {/* RESULTS SECTION (Drawn when user is active in search or filter) */}
        {(searchQuery || activeCategory || activeMood || activeCollection) && (
          <div 
            ref={resultsSectionRef}
            className={`transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) rounded-3xl ${
              resultsHighlight 
                ? 'ring-4 ring-amber-100 bg-amber-50/40 p-4 sm:p-6 -mx-4 sm:-mx-6 shadow-xl shadow-amber-900/5 animate-scale-up' 
                : 'bg-transparent ring-0'
            }`}
          >
            {/* Header / Sub-status bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-3 border-b border-gugu-borders/30 gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gugu-text tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gugu-accent" />
                  {activeCategory ? `Category: ${activeCategory}` : activeMood ? `Mood: ${activeMood}` : activeCollection ? `Bookshelf: ${PREMIUM_COLLECTIONS.find(c => c.id === activeCollection)?.name}` : "Search Results"}
                </h2>
                <p className="text-xs text-gugu-muted mt-1 font-sans">
                  Found {filteredItems.length} match{filteredItems.length === 1 ? '' : 'es'} 
                  {searchQuery ? ` for "${searchQuery}"` : ''} 
                  {activeCategory ? ` inside category ${activeCategory}` : ''}
                  {activeMood ? ` matching mood feeling "${activeMood}"` : ''}
                  {activeCollection ? ` inside curated shelf "${PREMIUM_COLLECTIONS.find(c => c.id === activeCollection)?.name}"` : ''}
                </p>
              </div>

              {/* Instant dynamic badges toggles */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-sans font-semibold text-gugu-muted">Sort: Default</span>
                <span className="text-gugu-borders">|</span>
                <button 
                  onClick={() => { 
                    setSearchQuery(''); 
                    setActiveCategory(null); 
                    setActiveMood(null); 
                    setActiveCollection(null); 
                  }}
                  className="text-xs bg-gugu-card text-gugu-text hover:bg-gugu-hover px-3.5 py-1.5 rounded-full border border-gugu-borders text-center font-bold font-sans transition-all cursor-pointer"
                >
                  Reset View
                </button>
              </div>
            </div>

            {/* IF NO RESULTS FOUND */}
            {filteredItems.length === 0 ? (
              <div className="bg-gugu-card rounded-2xl p-12 text-center border border-gugu-borders max-w-lg mx-auto">
                <div className="w-16 h-16 bg-[#FFF2F4] rounded-full flex items-center justify-center mx-auto text-3xl">📭</div>
                <h3 className="font-serif text-xl font-bold text-gugu-text mt-5">Silence in the library...</h3>
                <p className="text-sm text-gugu-muted mt-2">
                  "No perfect words match your wanderings tonight. Try searching for something else or browse our categories."
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button 
                    onClick={() => { setSearchQuery('Romantic Shayari'); }}
                    className="text-xs bg-gugu-bg hover:bg-gugu-borders/40 px-4 py-2 rounded-lg border border-gugu-borders/50 text-gugu-text"
                  >
                    Romantic Shayari
                  </button>
                  <button 
                    onClick={() => { setSearchQuery(''); setActiveCategory(null); }}
                    className="text-xs bg-gugu-accent text-gugu-card px-4 py-2 rounded-lg"
                  >
                    Browse All Content
                  </button>
                </div>
              </div>
            ) : (
              /* RESULTS GRID */
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredItems.map((item) => (
                   <div
                     key={item.id}
                     onClick={() => setSelectedItem(item)}
                     className="bg-gugu-card rounded-3xl p-6 border border-white hover:border-[#4A2C2A]/15 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between group h-[260px] relative overflow-hidden"
                   >
                     {/* Tiny corner designator */}
                     <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-gugu-bg/2 pointer-events-none" />
 
                     <div>
                       {/* Top Bar inside card */}
                       <div className="flex items-center justify-between mb-3.5 text-xs">
                         <span className="font-sans text-[9px] uppercase tracking-widest font-bold text-gugu-accent flex items-center">
                           {getCategoryIcon(item.category)}
                           <span className="ml-1">{item.category}</span>
                         </span>
                         
                         <div className="flex items-center space-x-1.5 relative z-10">
                           {/* Favorite button */}
                           <button
                             onClick={(e) => toggleFavorite(item.id, e)}
                             className="p-1 px-1.5 hover:bg-gugu-bg rounded-md text-gugu-muted hover:text-gugu-accent transition-colors cursor-pointer"
                             title="Save to vault"
                           >
                             <Heart className={`w-3.5 h-3.5 ${favorites.includes(item.id) ? 'fill-gugu-accent text-gugu-accent' : ''}`} />
                           </button>
                           {/* Copy button */}
                           <button
                             onClick={(e) => copyToClipboard(item, e)}
                             className="p-1 px-1.5 hover:bg-gugu-bg rounded-md text-gugu-muted hover:text-gugu-text transition-colors cursor-pointer"
                             title="Copy to clipboard"
                           >
                             {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                           </button>
                         </div>
                       </div>
 
                       {/* Header title */}
                       <h3 className="font-serif text-base font-bold text-gugu-text group-hover:text-gugu-accent transition-colors line-clamp-1">
                         {item.name || item.title}
                       </h3>

                      {/* Render text differently based on category for maximum aesthetic value */}
                      {item.category === 'Rizz Chats' ? (
                        <div className="space-y-1 mt-2.5">
                          {item.content.split('\n').slice(0, 3).map((line, ix) => {
                            const isMe = line.trim().startsWith('Me:');
                            const val = line.replace(/^(Me:|Her:)/, '').trim();
                            return (
                              <div key={ix} className={`text-[11px] font-sans font-medium line-clamp-1 ${isMe ? 'text-gugu-accent text-right' : 'text-gugu-muted'}`}>
                                <span className="opacity-75 font-semibold text-[9px] mr-1 uppercase">{isMe ? 'Me' : 'Her'}:</span>
                                {val}
                              </div>
                            );
                          })}
                          {item.content.split('\n').length > 3 && (
                            <div className="text-[10px] text-gugu-muted italic">...continuing</div>
                          )}
                        </div>
                      ) : item.category === 'Famous Poets' ? (
                        <p className="text-xs text-gugu-muted mt-2 leading-relaxed line-clamp-4">
                          {item.content}
                        </p>
                      ) : (
                        <p className="font-serif italic text-sm text-gugu-text leading-relaxed mt-2.5 line-clamp-4 pl-2 border-l border-gugu-accent/30">
                          "{item.content}"
                        </p>
                      )}
                    </div>

                    {/* Footer tags & pointer */}
                    <div className="mt-4 pt-3 border-t border-gugu-borders/30 flex items-center justify-between text-[11px]">
                      {item.category === 'Famous Poets' ? (
                        <span className="font-sans font-medium text-gugu-muted opacity-80">
                          {item.period}
                        </span>
                      ) : (
                        <span className="font-serif italic text-gugu-muted opacity-80">
                          {item.author ? `— ${item.author}` : "— Anonymous"}
                        </span>
                      )}

                      <span className="text-[11px] font-medium text-gugu-accent group-hover:text-gugu-accent-dark transition-colors flex items-center gap-1 font-mono">
                        Read <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PREMIUM EXPERIENCE: FREQUENTLY ASKED QUESTIONS SECTION */}
        <section className="mt-20 max-w-4xl mx-auto border-t border-[#4A2C2A]/10 pt-16 pb-8">
          <div className="text-center mb-10 select-none">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-gugu-accent bg-[#FAF3EA] py-1 px-3.5 rounded-full border border-gugu-borders/40 inline-block mb-3.5 shadow-3xs">
              ❓ FAQ DIRECTORY
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#4A2C2A] tracking-tight">
              ❓ Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-gugu-muted mt-2 font-sans font-medium">
              Everything you need to know about GUGU. Cozy words, solved simply.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 px-2">
            {[
              {
                question: "What is GUGU?",
                answer: (
                  <p className="text-xs sm:text-[13px] leading-relaxed text-[#4A2C2A]/90">
                    GUGU is a digital library of words where you can discover <em className="font-serif">shayari</em>, <em className="font-serif">pickup lines</em>, <em className="font-serif">rizz chats</em>, <em className="font-serif">poems</em>, and <em className="font-serif">famous poets</em>. It acts as an artistic corridor for those looking to explore romantic, humorous, or soulful sentiments.
                  </p>
                ),
                icon: <HelpCircle className="w-4 h-4 text-gugu-accent shrink-0" />
              },
              {
                question: "Is GUGU free to use?",
                answer: (
                  <p className="text-xs sm:text-[13px] leading-relaxed text-[#4A2C2A]/90">
                    Yes. GUGU is completely free to explore and enjoy. Feel free to browse, read in focus mode, download handcrafted typographic quote wallpapers, or save your favorite pieces to your local offline library vault.
                  </p>
                ),
                icon: <Sparkles className="w-4 h-4 text-[#D8A7B1] shrink-0" />
              },
              {
                question: "What kind of content can I find on GUGU?",
                answer: (
                  <div className="space-y-2.5">
                    <p className="text-xs sm:text-[13px] leading-relaxed text-[#4A2C2A]/95 font-medium">
                      You can discover a deeply curated collection of expressions:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-[12.5px] text-[#4A2C2A]/90 pl-1 font-serif italic">
                      <li className="flex items-center gap-2 bg-[#FAF3EA]/40 px-3 py-1.5 rounded-lg border border-gugu-borders/30">
                        <span className="text-base select-none">❤️</span>
                        <span><strong>Shayari:</strong> Soulful Urdu dual-verses</span>
                      </li>
                      <li className="flex items-center gap-2 bg-[#FAF3EA]/40 px-3 py-1.5 rounded-lg border border-gugu-borders/30 block">
                        <span className="text-base select-none">🔥</span>
                        <span><strong>Pickup Lines:</strong> Playful modern openers</span>
                      </li>
                      <li className="flex items-center gap-2 bg-[#FAF3EA]/40 px-3 py-1.5 rounded-lg border border-gugu-borders/30">
                        <span className="text-base select-none">💬</span>
                        <span><strong>Rizz Chats:</strong> Witty banter flow logs</span>
                      </li>
                      <li className="flex items-center gap-2 bg-[#FAF3EA]/40 px-3 py-1.5 rounded-lg border border-gugu-borders/30">
                        <span className="text-base select-none">📖</span>
                        <span><strong>Poems:</strong> Elegant long-form verses</span>
                      </li>
                      <li className="flex items-center gap-2 sm:col-span-2 bg-[#FAF3EA]/40 px-3 py-1.5 rounded-lg border border-gugu-borders/30">
                        <span className="text-base select-none">👑</span>
                        <span><strong>Famous Poets:</strong> Historical & modern bards biography</span>
                      </li>
                    </ul>
                  </div>
                ),
                icon: <BookOpen className="w-4 h-4 text-gugu-accent shrink-0" />
              },
              {
                question: "Can I save my favorite content?",
                answer: (
                  <p className="text-xs sm:text-[13px] leading-relaxed text-[#4A2C2A]/90">
                    Yes. Use the <strong className="font-sans font-bold">Saved Vault</strong> feature to keep your favorite words in one place. Simply click the heart or bookmark button on any piece to instantly save it. You can access them anytime via the bottom drawer—even without reloading!
                  </p>
                ),
                icon: <Heart className="w-4 h-4 text-gugu-accent shrink-0" />
              },
              {
                question: "How does search work?",
                answer: (
                  <div className="space-y-2.5">
                    <p className="text-xs sm:text-[13px] text-[#4A2C2A]/90 leading-relaxed">
                      Simply search for keywords in the top bar. You can look up content by specifying queries such as:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Romantic Shayari", "Funny Pickup Lines", "Urdu Poetry", "First Date Ideas", "Heartbreak Quotes"].map((keyword) => (
                        <button
                          key={keyword}
                          onClick={() => {
                            setSearchQuery(keyword);
                            setActiveCategory(null);
                            setActiveMood(null);
                            setActiveCollection(null);
                            addToHistory(keyword);
                            triggerToast(`Searching directory for "${keyword}"`);
                            performScrollToResults();
                          }}
                          className="bg-white hover:bg-[#FAF3EA] border border-gugu-borders/60 text-gugu-text text-[10px] uppercase font-sans font-bold tracking-wider px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                ),
                icon: <Search className="w-4 h-4 text-gugu-accent shrink-0" />
              },
              {
                question: "Why is the website called GUGU?",
                answer: (
                  <p className="text-xs sm:text-[13px] leading-relaxed text-[#4A2C2A]/90">
                    Because every meaningful project starts with a name that matters to its creator. <strong className="font-sans font-bold text-gugu-accent">GUGU</strong> is an elegant space built for people searching for the perfect combination of words.
                  </p>
                ),
                icon: <Quote className="w-4 h-4 text-[#D8A7B1] shrink-0" />
              },
              {
                question: "Is new content added regularly?",
                answer: (
                  <p className="text-xs sm:text-[13px] leading-relaxed text-[#4A2C2A]/90">
                    Yes. The GUGU sanctuary is continuously expanding with fresh curated items, sparks of inspiration, and contemporary feelings. There is always a new poem, a witty chat, or a heart-melting shayari waiting for you.
                  </p>
                ),
                icon: <Flame className="w-4 h-4 text-gugu-accent shrink-0" />
              },
              {
                question: "Who created GUGU?",
                answer: (
                  <p className="text-xs sm:text-[13px] leading-relaxed text-[#4A2C2A]/90 font-medium">
                    GUGU was crafted with deep thought and ❤️ by <strong className="font-serif italic font-bold text-gugu-accent">Apurv</strong>.
                  </p>
                ),
                icon: <Feather className="w-4 h-4 text-gugu-accent shrink-0" />
              }
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border transition-all duration-300 shadow-3xs overflow-hidden ${
                    isOpen 
                      ? "border-[#EAC2A3] bg-gradient-to-tr from-white to-[#FFFDF9] shadow-2xs" 
                      : "border-gugu-borders hover:border-[#E9DEC9] hover:bg-[#FFFDF9]/60"
                  }`}
                >
                  {/* Summary/Button Panel */}
                  <button
                    onClick={() => {
                      setOpenFaqIndex(isOpen ? null : idx);
                      triggerToast(isOpen ? "Collapsed FAQ item" : `Viewing Question ${idx + 1}`);
                    }}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-sans select-none cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center gap-3.5 pr-2">
                      <div className={`p-2 rounded-xl transition-all ${isOpen ? "bg-[#FAF1E4]" : "bg-gugu-bg/30"}`}>
                        {faq.icon}
                      </div>
                      <span className="font-serif text-[14.5px] sm:text-base font-bold text-[#4A2C2A] leading-tight">
                        {faq.question}
                      </span>
                    </div>

                    <div className={`p-1.5 rounded-full transition-all ${isOpen ? "bg-[#4A2C2A] text-white" : "bg-gugu-bg/50 text-[#7E6361]"}`}>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`} />
                    </div>
                  </button>

                  {/* Body/Answer Panel */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[500px] opacity-100 memo-content" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-5 pb-5 pt-1.5 pl-14 sm:pl-16 border-t border-[#FAF1E4] bg-white/40">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* PERSISTENT WEB AUDIO / AMBIENT POET LANE       {/* EXQUISITE VISUAL DETAIL MODAL (BOOK SHELF READING DIALOG) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 text-left animate-fade-in">
          
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#251514]/85 backdrop-blur-xs transition-opacity" 
            onClick={() => {
              setSelectedItem(null);
              setIsReadingMode(false);
            }}
          />

          {isReadingMode ? (
            /* DISTRACTION-FREE READING MODE SCREEN */
            <div className="absolute inset-0 z-20 bg-[#FFFBF4] text-[#4A2C2A] flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto select-none transition-all duration-500">
              <div className="max-w-3xl w-full text-center flex flex-col justify-between min-h-[70vh] relative animate-fade-in">
                
                {/* Top Control Bar in Reading Mode */}
                <div className="flex items-center justify-between pb-6 border-b border-[#4A2C2A]/10">
                  <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-gugu-accent flex items-center gap-1.5">
                    {getCategoryIcon(selectedItem.category)} GUGU Reader • {selectedItem.category}
                  </span>
                  <button
                    onClick={() => setIsReadingMode(false)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4A2C2A]/5 hover:bg-[#4A2C2A]/10 text-[#4A2C2A] text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5" /> Normal View
                  </button>
                </div>

                {/* Central Centered Poetry / Quote Focus */}
                <div className="my-auto py-12 flex flex-col justify-center items-center">
                  <Quote className="w-12 h-12 text-gugu-accent/25 opacity-70 mb-6" />
                  
                  {selectedItem.title && (
                    <h2 className="font-serif text-3xl sm:text-5xl font-extrabold mb-8 tracking-tight text-[#4A2C2A] text-center select-text">
                      {selectedItem.title || selectedItem.name}
                    </h2>
                  )}

                  <div className="max-w-2xl text-center select-text">
                    <p className="font-serif text-2xl sm:text-4xl text-[#4A2C2A] italic leading-relaxed whitespace-pre-line text-center poetry-content select-text">
                      {selectedItem.content}
                    </p>
                  </div>

                  {selectedItem.author && (
                    <p className="font-serif italic text-lg sm:text-xl text-gugu-muted mt-8 font-bold select-text">
                      — {selectedItem.author}
                    </p>
                  )}
                  {selectedItem.category === 'Famous Poets' && selectedItem.signatureWork && (
                    <p className="font-sans font-bold text-xs uppercase tracking-wider text-gugu-accent/80 mt-2 select-text">
                      Representative Masterpiece: "{selectedItem.signatureWork}"
                    </p>
                  )}

                  <Quote className="w-12 h-12 text-gugu-accent/25 opacity-70 mt-8 transform rotate-180" />
                </div>

                {/* Bottom navigation helper in Reading Mode */}
                <div className="pt-6 border-t border-[#4A2C2A]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex gap-2">
                    {selectedItem.tags.map(tag => (
                      <span className="text-[10px] font-sans font-bold uppercase bg-[#4A2C2A]/5 text-[#4A2C2A]/80 px-2.5 py-1 rounded" key={tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Feature: Download Wallpaper in reading mode */}
                    {(selectedItem.category === 'Shayari' || selectedItem.category === 'Poems') && (
                      <button
                        onClick={() => {
                          triggerToast("🎨 Creating customized quote card... Please wait");
                          downloadQuoteWallpaper(selectedItem, (success) => {
                            if (success) {
                              triggerToast("✨ Wallpaper generated successfully! Check your downloads.");
                            } else {
                              triggerToast("Failed to render canvas wallpaper. Try standard Copy instead.");
                            }
                          });
                        }}
                        className="px-4 py-2 bg-gradient-to-tr from-amber-100 to-amber-50 hover:from-amber-200 text-amber-950 text-xs font-sans font-bold uppercase tracking-wider rounded-xl transition-all border border-amber-200 cursor-pointer"
                        title="Download elegant wallpaper card"
                      >
                        🎨 Wallpaper
                      </button>
                    )}

                    <button
                      onClick={() => toggleFavorite(selectedItem.id)}
                      className="px-4 py-2 bg-[#4A2C2A] text-gugu-card text-xs font-sans font-bold uppercase tracking-wider rounded-xl transition-all hover:bg-gugu-accent cursor-pointer"
                    >
                      {favorites.includes(selectedItem.id) ? 'Saved' : 'Save Words'}
                    </button>
                    <button
                      onClick={() => {
                        const shareLink = `${window.location.origin}${window.location.pathname}?id=${selectedItem.id}`;
                        navigator.clipboard.writeText(shareLink);
                        triggerToast("Direct share link copied to clipboard!");
                      }}
                      className="px-4 py-2 bg-gugu-card hover:bg-white text-gugu-text text-xs font-sans font-bold uppercase tracking-wider rounded-xl border border-[#4A2C2A]/15 transition-all cursor-pointer"
                    >
                      Share Link
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* DETAILED PORTFOLIO CONTENT PAGE WINDOW */
            <div className="bg-gugu-card rounded-3xl max-w-2xl w-full border border-[#D5C2AD] shadow-2xl relative z-10 overflow-hidden transform transition-all flex flex-col max-h-[92vh]">
              
              {/* Header color accent */}
              <div className="h-2 bg-gugu-accent/90" />

              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setIsReadingMode(false);
                }}
                className="absolute top-4 right-4 p-2.5 hover:bg-gugu-bg rounded-full text-gugu-muted hover:text-gugu-text transition-colors z-20 cursor-pointer"
                title="Return to library"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable details view */}
              <div className="p-6 sm:p-8 overflow-y-auto flex-grow space-y-6">
                
                {/* Header indicators */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center space-x-1.5 bg-[#FBF3ED] text-gugu-text text-xs font-semibold px-3.5 py-1.5 rounded-full border border-gugu-borders">
                    {getCategoryIcon(selectedItem.category)}
                    <span>{selectedItem.category}</span>
                  </div>
                  
                  {/* Enter Reading Mode button */}
                  <button
                    onClick={() => {
                      setIsReadingMode(true);
                      triggerToast("Entering distraction-free reading mode.");
                    }}
                    className="inline-flex items-center space-x-1.5 bg-[#FAF3EA] hover:bg-white text-gugu-text hover:text-gugu-accent text-xs font-bold font-sans uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-gugu-borders transition-all cursor-pointer"
                    title="Enable large typography reading mode"
                  >
                    <Eye className="w-3.5 h-3.5 text-gugu-accent" />
                    <span>Focus Reading</span>
                  </button>
                </div>

                {/* Main dynamic view by types */}
                {selectedItem.category === 'Famous Poets' ? (
                  <div>
                    <h2 className="font-serif text-3xl font-extrabold text-gugu-text tracking-tight mb-1">
                      {selectedItem.name}
                    </h2>
                    <p className="font-serif italic text-sm text-gugu-accent font-medium mb-4">
                      {selectedItem.title}
                    </p>

                    <div className="bg-gugu-bg/30 rounded-2xl p-5 border border-gugu-borders/60 text-sm leading-relaxed text-gugu-text font-serif italic mb-6">
                      {selectedItem.content}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#FAF3EA] p-3.5 rounded-xl text-center border border-gugu-borders/40">
                        <span className="block text-[9px] uppercase font-bold text-gugu-muted mb-0.5">Active Period</span>
                        <span className="font-serif text-xs text-gugu-text font-semibold">{selectedItem.period}</span>
                      </div>
                      {selectedItem.signatureWork && (
                        <div className="bg-[#FAF3EA] p-3.5 rounded-xl text-center border border-gugu-borders/40">
                          <span className="block text-[9px] uppercase font-bold text-gugu-muted mb-0.5">Representative Masterpiece</span>
                          <span className="font-serif italic text-xs text-gugu-text font-semibold">"{selectedItem.signatureWork}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : selectedItem.category === 'Rizz Chats' ? (
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-gugu-text tracking-tight mb-4">
                      {selectedItem.title}
                    </h2>
                    
                    <div className="bg-[#FAF3EA] rounded-2xl p-5 border border-gugu-borders flex flex-col space-y-4 mb-6">
                      {selectedItem.content.split('\n').map((line, index) => {
                        const isMe = line.trim().startsWith('Me:');
                        const cleanText = line.replace(/^(Me:|Her:|Him:|Them:)/, '').trim();

                        return (
                          <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-3xs text-sm font-sans font-medium ${
                              isMe 
                                ? 'bg-gugu-accent text-gugu-card rounded-tr-none' 
                                : 'bg-gugu-bg/80 text-gugu-text rounded-tl-none border border-gugu-borders/30'
                            }`}>
                              <span className="block text-[8px] opacity-75 uppercase font-bold tracking-wider mb-1">
                                {isMe ? 'Sent' : 'Received'}
                              </span>
                              {cleanText}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Shayari and Poems Content */
                  <div className="text-center py-4 bg-[#FFFDF9] rounded-2xl border border-[#F0D5C3]/40 p-6 relative">
                    {selectedItem.title && (
                      <h2 className="font-serif text-2xl font-bold text-gugu-text tracking-tight mb-5 underline decoration-gugu-accent/30 underline-offset-8">
                        {selectedItem.title}
                      </h2>
                    )}

                    <div className="max-w-md mx-auto my-4 relative px-8 py-2">
                      <Quote className="absolute -top-3 left-0 w-8 h-8 text-gugu-accent/15 opacity-50" />
                      
                      <p className="font-serif text-lg sm:text-xl text-gugu-text italic leading-loose whitespace-pre-line text-center poetry-content">
                        {selectedItem.content}
                      </p>

                      <Quote className="absolute -bottom-3 right-0 w-8 h-8 text-gugu-accent/15 opacity-50 transform rotate-180" />
                    </div>

                    {selectedItem.author && (
                      <p className="font-serif italic text-xs text-gugu-muted mt-6 font-semibold">
                        — {selectedItem.author}
                      </p>
                    )}
                  </div>
                )}

                {/* Tags mapping */}
                <div className="pt-4 border-t border-gugu-borders/40">
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {selectedItem.tags.map((tag) => (
                      <button 
                        key={tag} 
                        onClick={() => {
                          setSearchQuery(tag);
                          setActiveCategory(null);
                          setSelectedItem(null);
                          triggerToast(`Searching hashtag: #${tag}`);
                          performScrollToResults();
                        }}
                        className="text-[10px] uppercase font-sans font-bold bg-gugu-bg text-gugu-text px-3 py-1.5 rounded-full border border-gugu-borders hover:bg-gugu-accent hover:text-gugu-card transition-colors select-none cursor-pointer"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RELATED ENGINE SUGGESTIONS */}
                <div className="pt-6 border-t border-[#4A2C2A]/10">
                  <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#9C5A3C] mb-4 text-center">
                    📖 Related Cozy Words (Tags & Category Matches)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {getRelatedItems(selectedItem).map((relItem) => (
                      <div
                        key={relItem.id}
                        onClick={() => {
                          setSelectedItem(relItem);
                          setIsReadingMode(false);
                          triggerToast(`Viewing "${relItem.title || relItem.name}"`);
                        }}
                        className="bg-[#FFFDF9] hover:bg-white p-3.5 rounded-xl border border-gugu-borders hover:border-gugu-accent/40 shadow-3xs cursor-pointer hover:shadow-2xs transition-all flex flex-col justify-between text-left group min-h-[110px]"
                      >
                        <div>
                          <span className="text-[8px] font-sans uppercase font-bold text-gugu-accent block mb-1">
                            {relItem.category}
                          </span>
                          <h5 className="font-serif text-xs font-bold text-gugu-text group-hover:text-gugu-accent transition-colors line-clamp-1 mb-1">
                            {relItem.name || relItem.title}
                          </h5>
                          <p className="text-[10px] font-serif text-gugu-muted/90 italic line-clamp-2">
                            {relItem.content}
                          </p>
                        </div>
                        <span className="text-[8px] font-sans uppercase font-bold text-gugu-muted mt-2 text-right block group-hover:text-gugu-accent transition-colors">
                          Explore →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Detail Footer controls */}
              <div className="bg-[#FAF1E4] px-6 py-4 border-t border-[#DFD1BE] flex items-center justify-between">
                <button
                  onClick={(e) => toggleFavorite(selectedItem.id, e)}
                  className="flex items-center space-x-2 bg-gugu-card hover:bg-white px-4 py-2.5 rounded-xl border border-[#4A2C2A]/15 shadow-2xs font-bold text-xs text-gugu-text transition-all group cursor-pointer"
                >
                  <Heart className={`w-4 h-4 text-gugu-accent group-hover:scale-110 transition-transform ${favorites.includes(selectedItem.id) ? 'fill-gugu-accent' : ''}`} />
                  <span>{favorites.includes(selectedItem.id) ? 'Saved' : 'Add to Vault'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  {/* Share button with direct share link copy */}
                  <button
                    onClick={() => {
                      const shareLink = `${window.location.origin}${window.location.pathname}?id=${selectedItem.id}`;
                      navigator.clipboard.writeText(shareLink);
                      triggerToast("Share link copied! Send it in your texts.");
                      
                      if (navigator.share) {
                        navigator.share({
                          title: selectedItem.title || selectedItem.name || 'GUGU Words',
                          text: `Explore this piece on GUGU:\n"${selectedItem.content}"`,
                          url: shareLink,
                        }).catch(() => {});
                      }
                    }}
                    className="p-2.5 bg-gugu-card hover:bg-white rounded-xl border border-[#4A2C2A]/15 shadow-2xs text-gugu-muted hover:text-gugu-accent transition-colors cursor-pointer"
                    title="Copy direct share link to paste in texts"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {/* Feature: Download Wallpaper for Shayari & Poems */}
                  {(selectedItem.category === 'Shayari' || selectedItem.category === 'Poems') && (
                    <button
                      onClick={() => {
                        triggerToast("🎨 Creating customized quote card... Please wait");
                        downloadQuoteWallpaper(selectedItem, (success) => {
                          if (success) {
                            triggerToast("✨ Wallpaper generated successfully! Check your downloads.");
                          } else {
                            triggerToast("Failed to render canvas wallpaper. Try standard Copy instead.");
                          }
                        });
                      }}
                      className="inline-flex items-center space-x-1.5 bg-gradient-to-tr from-orange-100 to-amber-50 hover:from-orange-200 hover:to-amber-100 text-amber-900 border border-amber-250 px-4 py-2.5 rounded-xl shadow-2xs font-bold font-sans text-xs uppercase tracking-wider transition-all cursor-pointer"
                      title="Download beautiful typographic quote card wallpaper"
                    >
                      <span>🎨</span>
                      <span>Wallpaper</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => copyToClipboard(selectedItem, e)}
                    className="flex items-center space-x-1.5 bg-[#4A2C2A] hover:bg-gugu-text text-gugu-card px-4 py-2.5 rounded-xl shadow-2xs font-bold font-sans text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {copiedId === selectedItem.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Words</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* COZY PERSISTENT FAVORITES SLIDE-OUT DRAWER */}
      {showFavoritesDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#251514]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowFavoritesDrawer(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-gugu-card border-l border-gugu-borders shadow-2xl flex flex-col z-15 animate-fade-in h-full">
            
            {/* Header */}
            <div className="p-6 border-b border-gugu-borders/85 bg-gugu-bg flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Heart className="w-5 h-5 text-gugu-accent fill-gugu-accent" />
                <h2 className="font-serif text-xl font-bold text-gugu-text tracking-tight">Your Saved Vault</h2>
              </div>
              <button
                onClick={() => setShowFavoritesDrawer(false)}
                className="p-1 px-2 hover:bg-gugu-borders/40 rounded-lg text-gugu-muted hover:text-gugu-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter for Favorites list in Vault */}
            {favorites.length > 0 && (
              <div className="px-6 py-2.5 bg-[#FAF1E4] border-b border-[#DFD1BE]/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none">
                {(['All', 'Shayari', 'Pickup Lines', 'Rizz Chats', 'Poems', 'Famous Poets'] as const).map((cat) => {
                  const isActive = favCategoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setFavCategoryFilter(cat)}
                      className={`text-[10px] sm:text-[10.5px] font-sans font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#4A2C2A] text-gugu-card border-[#4A2C2A] shadow-3xs'
                          : 'bg-white text-gugu-muted border-gugu-borders hover:text-gugu-text hover:bg-[#FAF1E4]/50'
                      }`}
                    >
                      {cat === 'Famous Poets' ? 'Poets' : cat}
                    </button>
                  );
                })}
              </div>
            )}

            {/* List Body */}
            <div className="p-6 overflow-y-auto flex-grow space-y-4">
              {favorites.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="text-4xl text-neutral-400 mb-4 select-none">🤎</div>
                  <h4 className="font-serif text-base font-bold text-gugu-text">Vault is currently empty</h4>
                  <p className="text-xs text-gugu-muted mt-2 leading-relaxed">
                    "When you read something that moves your soul, click the heart icon. It will be kept safe here forever."
                  </p>
                  <button
                    onClick={() => {
                      setShowFavoritesDrawer(false);
                      setSearchQuery('');
                      setActiveCategory(null);
                    }}
                    className="mt-6 text-xs bg-gugu-accent text-gugu-card px-4 py-2.5 rounded-lg font-medium shadow-xs"
                  >
                    Go Explore GUGU
                  </button>
                </div>
              ) : (
                (() => {
                  const filteredFavs = ALL_LIBRARY_ITEMS.filter(item => 
                    favorites.includes(item.id) && 
                    (favCategoryFilter === 'All' || item.category === favCategoryFilter)
                  );

                  if (filteredFavs.length === 0) {
                    return (
                      <div className="text-center py-16 px-4">
                        <div className="text-3xl mb-3 select-none">🍃</div>
                        <h4 className="font-serif text-sm font-bold text-gugu-text">Empty Cozy Shelf</h4>
                        <p className="text-xs text-gugu-muted mt-1.5 leading-relaxed">
                          You haven't saved any words under "{favCategoryFilter === 'Famous Poets' ? 'Poets' : favCategoryFilter}" yet.
                        </p>
                        <button
                          onClick={() => setFavCategoryFilter('All')}
                          className="mt-4 text-[10.5px] font-sans font-bold uppercase tracking-wider bg-white text-gugu-text px-3.5 py-1.5 rounded-lg border border-gugu-borders cursor-pointer hover:bg-gugu-bg/30 transition-all"
                        >
                          Show All Saved
                        </button>
                      </div>
                    );
                  }

                  return filteredFavs.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        setShowFavoritesDrawer(false);
                      }}
                      className="p-4 bg-[#FFFDF9] rounded-xl border border-gugu-borders hover:border-gugu-accent transition-all cursor-pointer group flex flex-col justify-between hover:shadow-2xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-gugu-accent/90 block mb-1">
                            {getCategoryIcon(item.category)} {item.category}
                          </span>
                          <h5 className="font-serif text-sm font-bold text-gugu-text group-hover:text-gugu-accent transition-colors line-clamp-1">
                            {item.name || item.title}
                          </h5>
                        </div>
                        
                        {/* Delete item from vault */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          className="p-1 text-gugu-muted hover:text-red-500 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete from favorites"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="font-serif italic text-xs text-[#4A2C2A] mt-2 line-clamp-2">
                        "{item.content}"
                      </p>

                      <div className="mt-3.5 pt-2 border-t border-gugu-borders/35 flex items-center justify-between text-[10px] text-gugu-muted">
                        <span>{item.author || item.period || 'Anonymous'}</span>
                        <span className="text-gugu-accent group-hover:underline text-[10px] font-mono font-medium">Read Words →</span>
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>

            {/* Bottom aggregate indicator */}
            {favorites.length > 0 && (
              <div className="p-4 bg-gugu-bg border-t border-gugu-borders/85 text-center text-xs text-gugu-muted font-mono leading-relaxed">
                Vault offline state secured inside local storage.
              </div>
            )}

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-gugu-card border-t border-gugu-borders/70 py-12 relative z-10 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          
          <div className="flex items-center justify-center space-x-2.5 mb-5 select-none">
            <div className="h-0.5 w-10 bg-gugu-borders" />
            <span className="font-serif text-xl font-bold Tracking-widest text-gugu-text">GUGU</span>
            <div className="h-0.5 w-10 bg-gugu-borders" />
          </div>

          <p className="text-xs text-gugu-muted leading-relaxed max-w-sm mx-auto mb-4">
            A cozy reading corridor and search discovery engine for deep Shayari, Pickup Lines, Rizz Chats, Poems, and famous poets. Keep finding the perfect words.
          </p>

          <p className="text-xs font-serif font-semibold text-gugu-muted">
            Made with <span className="text-gugu-accent">❤️</span> by GUGU
          </p>
          
          <p className="text-[10px] text-gugu-muted/70 font-mono mt-2">
            &copy; 1800 - 2026 GUGU Library Inc. All spirits reserved.
          </p>

        </div>
      </footer>

      {/* FEATURE 1: FLOATING ACTION BUTTON - SURPRISE ME */}
      <button
        onClick={handleSurpriseMe}
        disabled={surpriseMeAnimating}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-[#4A2C2A] to-[#2B1716] text-[#FFFBF4] hover:from-gugu-text hover:to-[#1C0E0D] px-5 py-3.5 rounded-full border border-gugu-borders shadow-xl flex items-center gap-2 group hover:shadow-2xl active:scale-95 transition-all text-xs font-sans font-bold uppercase tracking-wider select-none cursor-pointer disabled:opacity-50"
        title="Show me a randomly chosen perfect quote card"
      >
        <span className="text-sm group-hover:rotate-12 transition-transform">🎲</span>
        <span>Surprise Me</span>
      </button>

      {/* FEATURE 1: SURPRISE ME BEAUTIFUL ANIMATION OVERLAY */}
      {surpriseMeAnimating && (
        <div className="fixed inset-0 z-50 bg-[#251514]/90 backdrop-blur-md flex flex-col items-center justify-center text-center animate-fade-in select-none">
          <div className="max-w-md p-8 bg-gugu-card rounded-3xl border border-gugu-borders shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden animate-wiggle">
            
            {/* Decorative sparkles */}
            <div className="absolute top-3 left-4 text-xs opacity-40">✨</div>
            <div className="absolute bottom-4 right-5 text-sm opacity-40">✨</div>
            <div className="absolute top-10 right-8 text-xs opacity-20">⭐️</div>
            
            {/* Rotating visual spinner */}
            <div className="w-16 h-16 bg-[#FFF2EA] rounded-full flex items-center justify-center text-3xl animate-spin shadow-3xs border border-[#F0D5C3]">
              🎲
            </div>
            
            <div className="space-y-2">
              <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-gugu-text tracking-tight animate-pulse">
                Consulting the library of cozy words...
              </h3>
              <p className="text-xs text-gugu-muted max-w-xs font-sans font-semibold uppercase tracking-wider">
                Rolling a secret selection from Shayari, Pickup Lines & Poetry!
              </p>
            </div>

            {/* Sparkle divider */}
            <div className="flex items-center gap-1.5 w-full justify-center">
              <span className="h-0.5 w-8 bg-gugu-borders" />
              <span className="text-gugu-accent">✦</span>
              <span className="h-0.5 w-8 bg-gugu-borders" />
            </div>

            {surpriseMeItem && (
              <div className="bg-[#FFFDF9]/60 p-4 rounded-xl border border-gugu-borders/30 text-left max-w-sm">
                <span className="text-[8px] font-mono uppercase tracking-widest font-bold text-gugu-accent mb-1 block">
                  Chosen Category: {surpriseMeItem.category}
                </span>
                <p className="font-serif text-xs italic text-gugu-text line-clamp-2">
                  "{surpriseMeItem.content}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FEATURE 10: HIDDEN EASTER EGG OVERLAY (Revealed on typing "gugu" in search) */}
      {isGuguEggActive && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#1C0E0D] to-[#251514] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          
          {/* Falling Cozy Hearts & Letters background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 select-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute text-lg text-gugu-accent animate-float-slow"
                style={{
                  left: `${(i * 7) % 100}%`,
                  top: `${(i * 13) % 100}%`,
                  animationDelay: `${i * 0.4}s`,
                  fontSize: `1.2rem`
                }}
              >
                {i % 4 === 0 ? '✨' : i % 4 === 1 ? '🤎' : i % 4 === 2 ? '📜' : '🌸'}
              </div>
            ))}
          </div>

          <div className="max-w-xl w-full bg-gugu-card rounded-3xl p-8 sm:p-12 border border-[#EAC2A3] shadow-2xl relative z-20 space-y-8 animate-scale-up select-none">
            
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-gugu-accent block">
              ✨ GUGU'S HIDDEN SANCTUARY DETECTED ✨
            </span>
            
            <div className="w-20 h-20 bg-[#FFF5EE] border border-gugu-borders rounded-full flex items-center justify-center text-4xl mx-auto shadow-sm animate-bounce">
              🦉
            </div>

            {/* Secret Quote Card */}
            <div className="bg-[#FFFDF9] border border-[#F0D5C3] p-6 sm:p-8 rounded-2xl relative">
              <Quote className="absolute top-3 left-4 w-10 h-10 text-gugu-accent/15 opacity-60" />
              
              <h4 className="font-serif text-lg font-bold text-gugu-accent uppercase tracking-widest mb-4">
                The Cozy Library Oracle
              </h4>
              
              <p className="font-serif text-lg sm:text-2xl text-gugu-text italic leading-relaxed text-center poetry-content select-text">
                "For those who feel deeply in a shallow world, your heart is a sanctuary. In the infinite library of life, love is the only book that truly matters."
              </p>
              
              <p className="font-serif italic text-[#7E6361] mt-6 font-bold select-text">
                — The Scribbled Quill of GUGU
              </p>

              <Quote className="absolute bottom-3 right-4 w-10 h-10 text-gugu-accent/15 opacity-60 transform rotate-180" />
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gugu-muted leading-relaxed max-w-md mx-auto">
                You typing <strong>"gugu"</strong> into the corridor opened this secret door. It is a tiny reminder that words hold power, and poetry handles our heaviest feelings.
              </p>
              
              <button
                onClick={() => {
                  setIsGuguEggActive(false);
                  setSearchQuery(''); // Clear gugu search query
                  triggerToast("Returned from GUGU's hidden cozy sanctuary!");
                }}
                className="px-6 py-3 bg-[#4A2C2A] hover:bg-[#3d2321] text-gugu-card hover:text-white rounded-xl shadow-md text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Close Secret Sanctuary
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
