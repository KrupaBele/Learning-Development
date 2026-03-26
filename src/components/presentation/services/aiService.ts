import { AIAction } from '../types';
import { 
  Wand2, 
  FileText, 
  Check, 
  ShrinkIcon, 
  Image, 
  BarChart, 
  Table,
  Video,
  AudioLines,
  Palette
} from 'lucide-react';

// Mock AI service - in a real app, this would connect to an AI API
const mockAIResponse = async (text: string, operation: string): Promise<string> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  switch (operation) {
    case 'summarize':
      return `Summary: ${text.split(' ').slice(0, text.split(' ').length / 2).join(' ')}...`;
    case 'explain':
      return `Explanation: ${text}\n\nThis means that the content is providing information about a specific topic.`;
    case 'grammar':
      return `Corrected: ${text.replace(/\bi\b/g, 'I').replace(/\s{2,}/g, ' ')}`;
    case 'shorten':
      return text.split(' ').slice(0, text.split(' ').length / 3).join(' ') + '...';
    case 'image':
      // In a real app, this would call an image generation API
      return `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop`;
    case 'graph':
      return `[AI would generate a graph visualizing: "${text}"]`;
    case 'table':
      return `[AI would generate a table organizing: "${text}"]`;
    case 'video':
      return `https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
    case 'audio':
      return `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`;
    case 'design':
      return `#${Math.floor(Math.random()*16777215).toString(16)}`;
    default:
      return text;
  }
};

export const aiActions: AIAction[] = [
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Create a concise summary of the selected text',
    action: (text) => mockAIResponse(text, 'summarize'),
    icon: 'Wand2'
  },
  {
    id: 'explain',
    name: 'Explain',
    description: 'Provide a detailed explanation of the selected text',
    action: (text) => mockAIResponse(text, 'explain'),
    icon: 'FileText'
  },
  {
    id: 'grammar',
    name: 'Check Grammar',
    description: 'Check and correct grammar in the selected text',
    action: (text) => mockAIResponse(text, 'grammar'),
    icon: 'Check'
  },
  {
    id: 'shorten',
    name: 'Shorten',
    description: 'Create a shorter version of the selected text',
    action: (text) => mockAIResponse(text, 'shorten'),
    icon: 'ShrinkIcon'
  },
  {
    id: 'image',
    name: 'Generate Image',
    description: 'Generate an image based on the prompt',
    action: (text) => mockAIResponse(text, 'image'),
    icon: 'Image'
  },
  {
    id: 'graph',
    name: 'Create Graph',
    description: 'Generate a graph based on the selected text',
    action: (text) => mockAIResponse(text, 'graph'),
    icon: 'BarChart'
  },
  {
    id: 'table',
    name: 'Create Table',
    description: 'Generate a table based on the selected text',
    action: (text) => mockAIResponse(text, 'table'),
    icon: 'Table'
  },
  {
    id: 'video',
    name: 'Generate Video',
    description: 'Find a relevant video based on the text',
    action: (text) => mockAIResponse(text, 'video'),
    icon: 'Video'
  },
  {
    id: 'audio',
    name: 'Convert to Audio',
    description: 'Convert text to speech audio',
    action: (text) => mockAIResponse(text, 'audio'),
    icon: 'AudioLines'
  },
  {
    id: 'design',
    name: 'Suggest Color',
    description: 'Generate a color palette based on the text',
    action: (text) => mockAIResponse(text, 'design'),
    icon: 'Palette'
  }
];

export const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Wand2': return Wand2;
    case 'FileText': return FileText;
    case 'Check': return Check;
    case 'ShrinkIcon': return ShrinkIcon;
    case 'Image': return Image;
    case 'BarChart': return BarChart;
    case 'Table': return Table;
    case 'Video': return Video;
    case 'AudioLines': return AudioLines;
    case 'Palette': return Palette;
    default: return Wand2;
  }
};