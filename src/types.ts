export interface Item {
  id: string;
  title?: string;
  name?: string;
  content: string;
  author?: string;
  period?: string;
  signatureWork?: string;
  category: 'Shayari' | 'Pickup Lines' | 'Rizz Chats' | 'Poems' | 'Famous Poets';
  tags: string[];
}
