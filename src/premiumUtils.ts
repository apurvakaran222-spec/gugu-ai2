import { Item } from './types';
import { initialShayaris, initialPickupLines, initialPoems } from './data';

/**
 * Deterministic date-seeded randomizer
 * Returns a consistent value for a given date string, ensuring "Daily Discovery" rotates every 24 hours.
 */
export function getDailySeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Get daily discovery items based on calendar date
 */
export function getDailyDiscovery(dateStr: string): { shayari: Item; pickupLine: Item; poem: Item } {
  const seed = getDailySeed(dateStr);
  
  const shayari = initialShayaris[seed % initialShayaris.length] || initialShayaris[0];
  const pickupLine = initialPickupLines[(seed + 3) % initialPickupLines.length] || initialPickupLines[0];
  const poem = initialPoems[(seed + 7) % initialPoems.length] || initialPoems[0];

  return { shayari, pickupLine, poem };
}

/**
 * Curated Premium Collections
 */
export interface Collection {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tags: string[];
  categories: ('Shayari' | 'Pickup Lines' | 'Rizz Chats' | 'Poems' | 'Famous Poets')[];
  tagMatchOnly?: boolean; // If true, only match elements having these specific tags
}

export const PREMIUM_COLLECTIONS: Collection[] = [
  {
    id: 'col-first-date',
    name: 'Best First Date Lines',
    description: 'Smooth, witty conversation starters to melt the ice and ignite laughter.',
    emoji: '☕',
    tags: ['first date', 'smooth', 'cute', 'sweet', 'icebreaker', 'playful'],
    categories: ['Pickup Lines', 'Rizz Chats']
  },
  {
    id: 'col-timeless-shayari',
    name: 'Timeless Shayari',
    description: 'Classic Urdu verses of love, yearning, and soulful memories from master poets.',
    emoji: '🌹',
    tags: ['romantic', 'ghalib', 'sufi', 'classic', 'memory', 'love'],
    categories: ['Shayari', 'Famous Poets']
  },
  {
    id: 'col-heartbreak',
    name: 'Heartbreak Collection',
    description: 'Sorrowful laments and melancholy verses to accompany your heavy heart.',
    emoji: '💔',
    tags: ['sad', 'heartbreak', 'melancholic', 'poignant', 'memory', 'lonely'],
    categories: ['Shayari', 'Poems']
  },
  {
    id: 'col-midnight-poetry',
    name: 'Midnight Poetry',
    description: 'Introspective, atmospheric verses written for the quiet nocturnal hours.',
    emoji: '🌙',
    tags: ['midnight', 'evening', 'alone', 'silence', 'peaceful', 'nature'],
    categories: ['Poems', 'Shayari']
  },
  {
    id: 'col-flirty-vault',
    name: 'Flirty Vault',
    description: 'Banter and bold pickup items for when you are feeling adventurous.',
    emoji: '🔥',
    tags: ['flirty', 'rizz', 'bold', 'smooth', 'witty', 'smile'],
    categories: ['Pickup Lines', 'Rizz Chats']
  }
];

/**
 * Checks if an item belongs to a specific curated collection
 */
export function belongsToCollection(item: Item, collectionId: string): boolean {
  const collection = PREMIUM_COLLECTIONS.find(col => col.id === collectionId);
  if (!collection) return false;

  // Verify category match
  const matchesCategory = collection.categories.includes(item.category);
  if (!matchesCategory) return false;

  // Verify tag match
  const itemTagsLower = (item.tags || []).map(tag => tag.toLowerCase());
  const hasTagMatch = collection.tags.some(colTag => 
    itemTagsLower.includes(colTag) || 
    itemTagsLower.some(iTag => iTag.includes(colTag))
  );

  return hasTagMatch;
}

/**
 * Mood category definitions and emoji mappings
 */
export interface Mood {
  id: string;
  emoji: string;
  name: string;
  colorClass: string;
  borderColor: string;
  tags: string[];
}

export const MOODS: Mood[] = [
  { id: 'mood-romantic', emoji: '❤️', name: 'Romantic', colorClass: 'bg-rose-50 hover:bg-rose-100 text-rose-750', borderColor: 'border-rose-200', tags: ['romantic', 'love', 'sweet', 'devotion', 'intense', 'classic', 'voice'] },
  { id: 'mood-heartbreak', emoji: '💔', name: 'Heartbreak', colorClass: 'bg-stone-50 hover:bg-stone-100 text-stone-750', borderColor: 'border-stone-200', tags: ['sad', 'heartbreak', 'melancholic', 'poignant', 'destiny', 'sorrow'] },
  { id: 'mood-lonely', emoji: '🌙', name: 'Lonely', colorClass: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-750', borderColor: 'border-indigo-200', tags: ['alone', 'lonely', 'silence', 'midnight', 'sad', 'seeking'] },
  { id: 'mood-funny', emoji: '😂', name: 'Funny', colorClass: 'bg-amber-50 hover:bg-amber-100 text-amber-750', borderColor: 'border-amber-200', tags: ['funny', 'humorous', 'witty', 'puns', 'cheesy', 'playful'] },
  { id: 'mood-motivational', emoji: '✨', name: 'Motivational', colorClass: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-750', borderColor: 'border-emerald-200', tags: ['motivational', 'inspiring', 'inspirational', 'strength', 'resilience', 'wisdom', 'life'] },
  { id: 'mood-friendship', emoji: '🤝', name: 'Friendship', colorClass: 'bg-orange-50 hover:bg-orange-100 text-orange-750', borderColor: 'border-orange-200', tags: ['friendship', 'warm', 'trust', 'life'] },
  { id: 'mood-flirty', emoji: '🔥', name: 'Flirty', colorClass: 'bg-red-50 hover:bg-red-100 text-red-750', borderColor: 'border-red-200', tags: ['flirty', 'rizz', 'bold', 'smooth', 'clever', 'sweet'] }
];

/**
 * Filter items matching a specific mood category
 */
export function belongsToMood(item: Item, moodName: string): boolean {
  const mood = MOODS.find(m => m.name.toLowerCase() === moodName.toLowerCase());
  if (!mood) return false;

  // Check category-specific overrides or tags compatibility
  const itemTagsLower = (item.tags || []).map(tag => tag.toLowerCase());
  
  // Specific category rules to make moods highly accurate
  if (moodName === 'Flirty' && (item.category === 'Pickup Lines' || item.category === 'Rizz Chats')) {
    return true;
  }
  if (moodName === 'Romantic' && (item.category === 'Shayari' || item.category === 'Poems') && itemTagsLower.some(t => t.includes('love') || t.includes('romantic'))) {
    return true;
  }

  // General tag matching
  const hasTagMatch = mood.tags.some(moodTag => 
    itemTagsLower.includes(moodTag) || 
    itemTagsLower.some(iTag => iTag.includes(moodTag))
  );

  return hasTagMatch;
}

/**
 * Renders the content on an HTML5 canvas and triggers download
 * Support standard mobile wallpaper aspect ratio 1080x1920
 */
export function downloadQuoteWallpaper(item: Item, callback?: (success: boolean) => void) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      if (callback) callback(false);
      return;
    }

    // 1. Draw solid canvas background (Warm cream / GUGU card #FFF8F0)
    ctx.fillStyle = '#FFF8F0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw subtle warm radial gradient in the center
    const radialGrad = ctx.createRadialGradient(540, 960, 100, 540, 960, 800);
    radialGrad.addColorStop(0, '#FFFDF9');
    radialGrad.addColorStop(1, '#F3E5D5');
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Draw dual thin border frame outlining the postcard (#EBD9C4 and #D8A7B1)
    ctx.strokeStyle = '#D8A7B1';
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    ctx.strokeStyle = '#EBD9C4';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // 4. Draw large watermark Quote icon in the upper center
    ctx.font = '220px "Playfair Display", Georgia, "Times New Roman", serif';
    ctx.fillStyle = 'rgba(216, 167, 177, 0.25)'; // Accent at 25% opacity
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('“', 540, 420);

    // 5. Draw Header Label
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.fillStyle = '#7E6361'; // gugu-muted
    ctx.letterSpacing = '12px';
    ctx.fillText('GUGU WRITTEN WORDS', 540, 200);

    // 6. Draw Category label
    ctx.font = 'bold italic 22px "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#D8A7B1'; // gugu-accent
    ctx.letterSpacing = '2px';
    ctx.fillText(`— curated from the ${item.category} vault —`, 540, 250);

    // 7. Render Poetry Lines beautifully wrapped in the center area
    const content = item.content;
    const maxTextWidth = canvas.width - 240; // 120px margins on both sides
    
    // Split on explicit linebreaks first
    const originalLines = content.split('\n');
    const wrappedLines: string[] = [];

    // Simple word wrapping function
    ctx.font = 'italic 44px "Playfair Display", Georgia, "Times New Roman", serif';
    originalLines.forEach(line => {
      const words = line.split(' ');
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth) {
          wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) {
        wrappedLines.push(currentLine);
      }
    });

    // Draw wrapped lines centered
    const lineSpacing = 72;
    const totalBlockHeight = wrappedLines.length * lineSpacing;
    const startY = 960 - (totalBlockHeight / 2) + 60; // Offset a bit downwards from absolute center

    ctx.fillStyle = '#4A2C2A'; // gugu-text
    ctx.textAlign = 'center';

    wrappedLines.forEach((textLine, idx) => {
      ctx.fillText(textLine.trim(), 540, startY + (idx * lineSpacing));
    });

    // 8. Draw Author Name or Signature lines
    const authorName = item.author || 'Anonymous';
    ctx.font = 'bold 30px "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#7E6361'; // gugu-muted
    ctx.fillText(`— ${authorName}`, 540, startY + totalBlockHeight + 100);

    // 9. Draw Hashtags list
    if (item.tags && item.tags.length > 0) {
      const tagStr = item.tags.map(t => `#${t.toUpperCase()}`).join('   ');
      ctx.font = 'bold 18px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(126, 99, 97, 0.6)';
      ctx.letterSpacing = '4px';
      ctx.fillText(tagStr, 540, startY + totalBlockHeight + 190);
    }

    // 10. Draw Watermark/Logo styling at the bottom
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.fillStyle = '#4A2C2A';
    ctx.letterSpacing = '6px';
    ctx.fillText('GUGU • FOR THOSE WHO FEEL', 540, 1680);

    ctx.font = '18px "Inter", sans-serif';
    ctx.fillStyle = '#7E6361';
    ctx.letterSpacing = '2px';
    ctx.fillText('COZY SENTIMENTS FOR YOUR ESSENCE', 540, 1720);

    // Draw little accent separator dot
    ctx.beginPath();
    ctx.arc(540, 1610, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#D8A7B1';
    ctx.fill();

    // Trigger save trigger
    const imageURI = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `GUGU-${item.category}-${item.id}.png`;
    link.href = imageURI;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (callback) callback(true);
  } catch (error) {
    console.error('Failed to export wallpaper image: ', error);
    if (callback) callback(false);
  }
}
