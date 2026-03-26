export interface Slide {
  id: string;
  layout: SlideLayout;
  title: string;
  content: SlideContent[];
  background?: string;
  transition?: SlideTransition;
}

export type SlideLayout = 
  | 'title'
  | 'title-content'
  | 'title-two-columns'
  | 'title-image'
  | 'image-only'
  | 'title-image-text'
  | 'comparison'
  | 'quote'
  | 'video'
  | 'title-video';

export type SlideTransition =
  | 'none'
  | 'fade'
  | 'slide'
  | 'zoom'
  | 'flip';

export interface SlideContent {
  id: string;
  type: ContentType;
  value: string;
  position?: 'left' | 'right' | 'center' | 'full';
  style?: ContentStyle;
}

export interface ContentStyle {
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export type ContentType = 
  | 'text'
  | 'image'
  | 'graph'
  | 'table'
  | 'quote'
  | 'video'
  | 'audio';

export interface AIAction {
  id: string;
  name: string;
  description: string;
  action: (text: string) => Promise<string>;
  icon: string;
}

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  theme?: PresentationTheme;
  mediaLibrary?: MediaItem[];
}

export interface PresentationTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  darkMode: boolean;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
  thumbnail?: string;
  dateAdded: string;
}