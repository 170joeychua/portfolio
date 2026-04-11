export interface GalleryImage {
  src: string;
  caption: string;
}

export interface Project {
  id: string;
  title: string;
  byline: string;
  year: string;
  summary: string;
  context: string;
  heroImage: string;
  accentImage: string;
  tags: string[];
  gallery: GalleryImage[];
}

export const PROJECTS: Project[] = [
  {
    id: '01',
    title: 'Marlboro Racing Legacy',
    byline: 'Formula Heritage • Immersive film campaign',
    year: '2026',
    summary:
      'A cinematic portrait of motorsport heritage shot for the Marlboro Racing archive. The film travels from the pits out to the open road, pairing bold typography with the heat of a racetrack to keep the story anchored in speed.',
    context:
      'We built a split-screen experience that alternates between archival hero shots and live-action sequences. The project explores tension between analog craftsmanship and rapid digital storytelling, outlining a modular system that can flex across print, motion, and installation.',
    heroImage:
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1600&q=80',
    accentImage:
      'https://images.unsplash.com/photo-1503736334956-b61d8d3b45b2?auto=format&fit=crop&w=600&q=80',
    tags: ['Film direction', 'Experiential', 'Editorial'],
    gallery: [
      {
        src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=900&q=60',
        caption: 'Stage set with reflective chrome',
      },
      {
        src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=60',
        caption: 'Motion study for hero car',
      },
      {
        src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=60',
        caption: 'Mot for hero car',
      },
    ],
  },
  {
    id: '02',
    title: 'Signal Field Studies',
    byline: 'Research installation • Urban Signal Lab',
    year: '2025',
    summary:
      'Signal Field Studies maps invisible networks within the city and translates them into tactile gestures—light, reflection, and controlled fog. The installation pairs sensors with generative visuals to show how data can be made physical.',
    context:
      'The concept was to treat the gallery as a living organism that breathes in data. Textures stack in gradients of warmth, while the soundscape responds to motion so the walls feel alive. This framework later became the foundation of an ongoing residency program.',
    heroImage:
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1600&q=80',
    accentImage:
      'https://images.unsplash.com/photo-1503736334956-b61d8d3b45b2?auto=format&fit=crop&w=600&q=80',
    tags: ['Interactive', 'Spatial design', 'Data storytelling'],
    gallery: [
      {
        src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=900&q=60',
        caption: 'Stage set with reflective chrome',
      },
      {
        src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=60',
        caption: 'Motion study for hero car',
      },
      {
        src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=60',
        caption: 'Mot for hero car',
      },
    ],
  },
  {
    id: '03',
    title: 'Post-Industrial Halo',
    byline: 'Cultural research & editorial identity',
    year: '2024',
    summary:
      'Post-Industrial Halo reimagines the periphery of manufacturing hubs as galleries for craft and care. The identity blends monochrome geometry with bespoke typography, anchoring each story in the people who keep the factories running.',
    context:
      'We documented artisans across the city, layering portraits with neon gradients and tactility studies. The visual system uses a modular grid so each narrative can expand from a poster to a multi-channel installation without losing rhythm.',
    heroImage:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    accentImage:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    tags: ['Identity', 'Editorial', 'Storytelling'],
    gallery: [
      {
        src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=60',
        caption: 'Editorial stack for release',
      },
      {
        src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=60',
        caption: 'Portrait detail study',
      },
      {
        src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=60',
        caption: 'Case study layouts',
      },
    ],
  },
];
