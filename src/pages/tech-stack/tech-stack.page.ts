import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';

type GsapModule = typeof import('gsap');
type ScrollTriggerModule = typeof import('gsap/ScrollTrigger');
type ScrollTriggerClass = ScrollTriggerModule['ScrollTrigger'];

export interface TechBadge {
  label: string;
  iconSlug: string;
  iconUrl?: string;
  color: string;
  textColor: string;
  variant?: string;
  iconError?: boolean;
}

export interface TechCard {
  category: string;
  terminalPrefix: string;
  asciiHeader: string;
  badges: TechBadge[];
}

const DEVICON = (slug: string, variant = 'original') =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-${variant}.svg`;
@Component({
  selector: 'app-tech-stack.page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tech-stack.page.html',
  styleUrl: './tech-stack.page.scss',
})
export class TechStackPage implements OnInit, AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  private observer?: IntersectionObserver;
  private gsapInstance?: GsapModule['gsap'];
  private scrollTriggerInstance?: ScrollTriggerClass;

  techCards: TechCard[] = [
    {
      category: 'Programming Languages',
      terminalPrefix: 'lang',
      asciiHeader: `  ___                                    _             _                                         
 | _ \\_ _ ___  __ _ _ _ __ _ _ __  _ __ (_)_ _  __ _  | |   __ _ _ _  __ _ _  _ __ _ __ _ ___ ___
 |  _/ '_/ _ \\/ _\` | '_/ _\` | '  \\| '  \\| | ' \\/ _\` | | |__/ _\` | ' \\/ _\` | || / _\` / _\` / -_|_-<
 |_| |_| \\___/\\__, |_| \\__,_|_|_|_|_|_|_|_|_||_\\__, | |____\\__,_|_||_\\__, |\\_,_\\__,_\\__, \\___/__/
              |___/                            |___/                 |___/          |___/        `,
      badges: [
        { label: 'TypeScript', iconSlug: 'typescript', color: '#3178C6', textColor: '#fff' },
        { label: 'JavaScript', iconSlug: 'javascript', color: '#F7DF1E', textColor: '#000' },
        { label: 'HTML', iconSlug: 'html5', color: '#E34F26', textColor: '#fff' },
        { label: 'CSS', iconSlug: 'css3', color: '#1572B6', textColor: '#fff' },
        { label: 'SCSS', iconSlug: 'sass', color: '#CC6699', textColor: '#fff' },
        { label: 'C#', iconSlug: 'csharp', color: '#239120', textColor: '#fff' },
        { label: 'C', iconSlug: 'c', color: '#A8B9CC', textColor: '#000' },
        { label: 'SQL', iconSlug: 'azuresqldatabase', color: '#CC2927', textColor: '#fff' },
        {
          label: 'Go',
          iconSlug: 'go',
          variant: 'original-wordmark',
          color: '#00ADD8',
          textColor: '#fff',
        },
        { label: 'Python', iconSlug: 'python', color: '#3776AB', textColor: '#fff' },
        { label: 'Kotlin', iconSlug: 'kotlin', color: '#7F52FF', textColor: '#fff' },
      ] as any,
    },
    {
      category: 'AI / ML',
      terminalPrefix: 'ai_ml',
      asciiHeader:
        '   _   ___   ____  __ _    \n' +
        '  /_\\ |_ _| / /  \\/  | |   \n' +
        ' / _ \\ | | / /| |\\/| | |__ \n' +
        '/_/ \\_\\___/_/ |_|  |_|____|',
      badges: [
        { label: 'PyTorch', iconSlug: 'pytorch', color: '#EE4C2C', textColor: '#fff' },
        { label: 'TensorFlow', iconSlug: 'tensorflow', color: '#FF6F00', textColor: '#fff' },
        { label: 'JupyterLab', iconSlug: 'jupyter', color: '#F37626', textColor: '#fff' },
      ],
    },
    {
      category: 'Frontend',
      terminalPrefix: 'frontend',
      asciiHeader:
        '  ___            _               _ \n' +
        ' | __| _ ___ _ _| |_ ___ _ _  __| |\n' +
        " | _| '_/ _ \\ ' \\  _/ -_) ' \\/ _` |\n" +
        ' |_||_| \\___/_||_\\__\\___|_||_\\__,_|\n' +
        '                                   ',
      badges: [
        { label: 'Angular', iconSlug: 'angular', color: '#DD0031', textColor: '#fff' },
        { label: 'Tailwind CSS', iconSlug: 'tailwindcss', color: '#06B6D4', textColor: '#fff' },
        { label: 'React', iconSlug: 'react', color: '#61DAFB', textColor: '#000' },
        { label: 'Next.js', iconSlug: 'nextjs', color: '#ffffff', textColor: '#000' },
        { label: 'Storybook', iconSlug: 'storybook', color: '#FF4785', textColor: '#fff' },
        { label: 'Bootstrap', iconSlug: 'bootstrap', color: '#7952B3', textColor: '#fff' },
        { label: 'RxJS', iconSlug: 'rxjs', color: '#B7178C', textColor: '#fff' },
        { label: 'GSAP', iconSlug: '', color: '#88CE02', textColor: '#000' },
        {
          label: 'Angular Material',
          iconSlug: 'angularmaterial',
          color: '#DD0031',
          textColor: '#fff',
        },
      ] as any,
    },
    {
      category: 'Backend',
      terminalPrefix: 'backend',
      asciiHeader:
        '  ___          _               _ \n' +
        ' | _ ) __ _ __| |_____ _ _  __| |\n' +
        " | _ \\/ _` / _| / / -_) ' \\/ _` |\n" +
        ' |___/\\__,_\\__|_\\_\\___|_||_\\__,_|\n' +
        '                                 ',
      badges: [
        { label: '.NET Core', iconSlug: 'dotnetcore', color: '#512BD4', textColor: '#fff' },
        { label: 'Node.js', iconSlug: 'nodejs', color: '#339933', textColor: '#fff' },
        { label: 'Express', iconSlug: 'express', color: '#2496ED', textColor: '#fff' },
        { label: 'GraphQL', iconSlug: 'graphql', color: '#E10098', textColor: '#fff' },
        { label: 'Flask', iconSlug: 'flask', color: '#ff7f50', textColor: '#fff' },
      ],
    },
    {
      category: 'Database',
      terminalPrefix: 'db',
      asciiHeader:
        ' ___       _        _                  \n' +
        '|   \\ __ _| |_ __ _| |__  __ _ ___ ___\n' +
        "| |) / _` |  _/ _` | '_ \\/ _` (_-</ -_)\n" +
        '|___/\\__,_|\\__\\__,_|_.__/\\__,_/__/\\___|\n' +
        '                                       ',
      badges: [
        { label: 'MongoDB', iconSlug: 'mongodb', color: '#47A248', textColor: '#fff' },
        { label: 'MySQL', iconSlug: 'mysql', color: '#4479A1', textColor: '#fff' },
        { label: 'Firebase', iconSlug: 'firebase', color: '#FFCA28', textColor: '#000' },
      ],
    },
    {
      category: 'Infra / DevOps',
      terminalPrefix: 'devops',
      asciiHeader:
        ' ___       __            _____           ___          \n' +
        '|_ _|_ _  / _|_ _ __ _  / /   \\ _____ __/ _ \\ _ __ ___\n' +
        " | || ' \\|  _| '_/ _` |/ /| |) / -_) V / (_) | '_ (_-<\n" +
        '|___|_||_|_| |_| \\__,_/_/ |___/\\___|\\_/ \\___/| .__/__/\n' +
        '                                             |_|      ',
      badges: [
        {
          label: 'AWS',
          iconSlug: 'amazonwebservices',
          variant: 'plain-wordmark',
          color: '#FF9900',
          textColor: '#000',
        },
        { label: 'Docker', iconSlug: 'docker', color: '#2496ED', textColor: '#fff' },
        { label: 'Kafka', iconSlug: 'apachekafka', color: '#f05a28', textColor: '#fff' },
        { label: 'RabbitMQ', iconSlug: 'rabbitmq', color: '#FF6600', textColor: '#fff' },
        { label: 'Vercel', iconSlug: 'vercel', color: '#ffffff', textColor: '#000' },
        { label: 'Git', iconSlug: 'git', color: '#F05032', textColor: '#fff' },
        { label: 'Azure DevOps', iconSlug: 'azuredevops', color: '#0078D7', textColor: '#fff' },
        { label: 'Nginx', iconSlug: 'nginx', color: '#009639', textColor: '#fff' },
        { label: 'Netlify', iconSlug: 'netlify', color: '#00C7B7', textColor: '#fff' },
        { label: 'Google Cloud', iconSlug: 'googlecloud', color: '#4285F4', textColor: '#fff' },
      ] as any,
    },
    {
      category: 'Tools',
      terminalPrefix: 'tools',
      asciiHeader:
        '  _____           _     \n' +
        ' |_   _|___  ___ | | ___\n' +
        '   | | / _ \\/ _ \\| |(_-<\n' +
        '   |_| \\___/\\___/|_|/__/\n' +
        '                        ',
      badges: [
        { label: 'GitHub', iconSlug: 'github', color: '#f0f6fc', textColor: '#000' },
        { label: 'GitLab', iconSlug: 'gitlab', color: '#FC6D26', textColor: '#fff' },
        { label: 'SonarQube', iconSlug: 'sonarqube', color: '#4E9BCD', textColor: '#fff' },
        { label: 'Fortify', iconSlug: '', color: '#6B7280', textColor: '#fff' },
        { label: 'Selenium', iconSlug: 'selenium', color: '#43B02A', textColor: '#fff' },
        { label: 'Karma', iconSlug: 'karma', color: '#56C8DA', textColor: '#000' },
        {
          label: 'Jasmine',
          iconSlug: 'jasmine',
          variant: 'wordmark',
          color: '#8A4182',
          textColor: '#fff',
        },
        { label: 'Jest', iconSlug: 'jest', color: '#C21325', textColor: '#fff' },
        { label: 'Figma', iconSlug: 'figma', color: '#F24E1E', textColor: '#fff' },
        { label: 'Sketch', iconSlug: 'sketch', color: '#F7B500', textColor: '#000' },
        { label: 'Developer Tools', iconSlug: '', color: '#6B7280', textColor: '#fff' },
        { label: 'Cloudinary', iconSlug: 'cloudinary', color: '#3448C5', textColor: '#fff' },
      ] as any,
    },
    {
      category: 'AI Tools',
      terminalPrefix: 'ai_tools',
      asciiHeader:
        '    _    ___   _____           _     \n' +
        '   /_\\  |_ _| |_   _|___  ___ | | ___\n' +
        '  / _ \\  | |    | | / _ \\/ _ \\| |(_-<\n' +
        ' /_/ \\_\\|___|   |_| \\___/\\___/|_|/__/\n' +
        '                                     ',
      badges: [
        { label: 'ChatGPT', iconSlug: '', color: '#10A37F', textColor: '#fff' },
        { label: 'Codex', iconSlug: '', color: '#8c1aff', textColor: '#fff' },
        { label: 'Claude', iconSlug: '', color: '#D97706', textColor: '#fff' },
        { label: 'Gemini', iconSlug: '', color: '#4285F4', textColor: '#fff' },
        { label: 'Antigravity', iconSlug: '', color: '#6366F1', textColor: '#fff' },
        { label: 'GitHub Copilot', iconSlug: 'githubcopilot', color: '#f0f6fc', textColor: '#000' },
        { label: 'OpenCode', iconSlug: '', color: '#C21325', textColor: '#fff' },
        { label: 'DeepSeek', iconSlug: '', color: '#4A6CF7', textColor: '#fff' },
        { label: 'Qwen', iconSlug: '', color: '#6B7280', textColor: '#fff' },
      ],
    },
  ];

  typedLines: string[] = [];
  typewriterDone = false;
  visibleCards = 0;

  private allLines: string[] = [
    '$ init tech-stack --mode=full',
    '> Scanning installed packages...',
    '> 8 categories | 65 technologies detected.',
    '> Rendering grid. Hold tight.',
  ];
  private infoLines = this.allLines.slice(1);
  private infoRevealIndex = 0;
  private charIndex = 0;
  private typingTimer?: ReturnType<typeof setTimeout>;
  private cardRevealTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    // Resolve icon URLs
    this.techCards.forEach((card) => {
      card.badges.forEach((badge: any) => {
        if (badge.iconSlug) {
          const variant = badge.variant ?? 'original';
          badge.iconUrl = DEVICON(badge.iconSlug, variant);
        }
      });
    });
    if (isPlatformBrowser(this.platformId)) {
      this.startTypewriter();
    }
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    await new Promise((r) => setTimeout(r, 100));
    const gsapMod = await import('gsap');
    const stMod = await import('gsap/ScrollTrigger');
    const gsapInstance = gsapMod.gsap;
    const scrollTrigger = stMod.ScrollTrigger;
    gsapInstance.registerPlugin(scrollTrigger);
    this.gsapInstance = gsapInstance;
    this.scrollTriggerInstance = scrollTrigger;
  }

  private startTypewriter(): void {
    if (this.typewriterDone) return;
    const line = this.allLines[0];
    if (this.charIndex === 0) {
      this.typedLines = [''];
    }

    if (this.charIndex < line.length) {
      this.typedLines[0] = line.substring(0, ++this.charIndex);
      this.cdr.markForCheck();
      this.typingTimer = setTimeout(() => this.startTypewriter(), 30);
    } else {
      this.typewriterDone = true;
      this.charIndex = 0;
      this.cdr.markForCheck();
      this.revealNextInfoLine();
    }
  }

  private revealNextInfoLine(): void {
    if (this.infoRevealIndex >= this.infoLines.length) {
      return;
    }
    this.typedLines.push(this.infoLines[this.infoRevealIndex]);
    this.infoRevealIndex++;
    this.cdr.markForCheck();
    if (this.infoRevealIndex < this.infoLines.length) {
      this.typingTimer = setTimeout(() => this.revealNextInfoLine(), 480);
    } else {
      this.cardRevealTimer = setTimeout(() => this.startCardReveal(), 480);
    }
  }

  private startCardReveal(): void {
    if (this.visibleCards >= this.techCards.length) {
      return;
    }
    this.visibleCards++;
    this.cdr.markForCheck();
    this.cardRevealTimer = setTimeout(() => this.startCardReveal(), 220);
  }

  hasIcon(badge: TechBadge): boolean {
    return !!badge.iconUrl;
  }

  handleIconError(badge: TechBadge): void {
    badge.iconUrl = undefined;
    badge.iconError = true;
  }

  exitToRoot(): void {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.typingTimer) clearTimeout(this.typingTimer);
    if (this.cardRevealTimer) clearTimeout(this.cardRevealTimer);
    this.scrollTriggerInstance?.getAll().forEach((t) => t.kill());
  }
}
