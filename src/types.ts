export type CharviEmotion = 
  | 'idle' 
  | 'happy' 
  | 'bored' 
  | 'sad' 
  | 'angry' 
  | 'excited' 
  | 'thinking' 
  | 'celebrating'
  | 'surprised'
  | 'sleepy'
  | 'proud'
  | 'giggle'
  | 'confused' 
  | 'encouraging' 
  | 'listening' 
  | 'talking' 
  | 'point'
  | 'annoyed' 
  | 'pouty'
  | 'shy';

export type OutfitThemeId = 0 | 1 | 2 | 3;

export type SkyThemeId = 'sunset' | 'morning' | 'night';

export interface ChildProfile {
  name: string;
  fase: 'A' | 'B' | 'C';
  favoriteSubject: string;
  age?: number;
  learningGoals?: string[];
  playDuration?: string;
  skills?: string[];
  gender?: 'boy' | 'girl';
  birthDate?: { day: number; month: number; year: number };
  stickers?: string[];
  memberId?: string;
  hasOwnDevice?: boolean;
  voiceInteractionEnabled?: boolean;
  parentEmail?: string;
  isRegistered?: boolean;
  createdAt?: string;
}
