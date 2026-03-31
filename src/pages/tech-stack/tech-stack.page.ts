import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';

type GsapModule = typeof import('gsap');
type ScrollTriggerModule = typeof import('gsap/ScrollTrigger');
type ScrollTriggerClass = ScrollTriggerModule['ScrollTrigger'];

export interface TechBadge {
  label: string;
  icon: string;
  color: string;
  textColor: string;
}

export interface TechCard {
  category: string;
  terminalPrefix: string;
  badges: TechBadge[];
}

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

  @ViewChild('stackGrid') stackGrid!: ElementRef<HTMLDivElement>;

  private observer?: IntersectionObserver;
  private gsapInstance?: GsapModule['gsap'];
  private scrollTriggerInstance?: ScrollTriggerClass;

  techCards: TechCard[] = [
    {
      category: 'Programming Languages',
      terminalPrefix: 'lang',
      badges: [
        {
          label: 'TypeScript',
          icon: 'devicon-typescript-plain',
          color: '#3178C6',
          textColor: '#fff',
        },
        {
          label: 'JavaScript',
          icon: 'devicon-javascript-plain',
          color: '#F7DF1E',
          textColor: '#000',
        },
        { label: 'HTML', icon: 'devicon-html5-plain', color: '#E34F26', textColor: '#fff' },
        { label: 'CSS', icon: 'devicon-css3-plain', color: '#1572B6', textColor: '#fff' },
        { label: 'SCSS', icon: 'devicon-sass-original', color: '#CC6699', textColor: '#fff' },
        { label: 'C#', icon: 'devicon-csharp-plain', color: '#239120', textColor: '#fff' },
        { label: 'C', icon: 'devicon-c-plain', color: '#A8B9CC', textColor: '#000' },
        {
          label: 'SQL',
          icon: 'devicon-azuresqldatabase-plain',
          color: '#CC2927',
          textColor: '#fff',
        },
        { label: 'Go', icon: 'devicon-go-original-wordmark', color: '#00ADD8', textColor: '#fff' },
        { label: 'Python', icon: 'devicon-python-plain', color: '#3776AB', textColor: '#fff' },
        { label: 'Kotlin', icon: 'devicon-kotlin-plain', color: '#7F52FF', textColor: '#fff' },
      ],
    },
    {
      category: 'AI / ML',
      terminalPrefix: 'ai_ml',
      badges: [
        { label: 'PyTorch', icon: 'devicon-pytorch-original', color: '#EE4C2C', textColor: '#fff' },
        {
          label: 'TensorFlow',
          icon: 'devicon-tensorflow-original',
          color: '#FF6F00',
          textColor: '#fff',
        },
        { label: 'JupyterLab', icon: 'devicon-jupyter-plain', color: '#F37626', textColor: '#fff' },
      ],
    },
    {
      category: 'Frontend',
      terminalPrefix: 'frontend',
      badges: [
        { label: 'Angular', icon: 'devicon-angular-plain', color: '#DD0031', textColor: '#fff' },
        {
          label: 'Tailwind CSS',
          icon: 'devicon-tailwindcss-original',
          color: '#06B6D4',
          textColor: '#fff',
        },
        { label: 'React', icon: 'devicon-react-original', color: '#61DAFB', textColor: '#000' },
        { label: 'Next.js', icon: 'devicon-nextjs-plain', color: '#000000', textColor: '#fff' },
        {
          label: 'Storybook',
          icon: 'devicon-storybook-plain',
          color: '#FF4785',
          textColor: '#fff',
        },
        {
          label: 'Bootstrap',
          icon: 'devicon-bootstrap-plain',
          color: '#7952B3',
          textColor: '#fff',
        },
        { label: 'RxJS', icon: 'devicon-rxjs-original', color: '#B7178C', textColor: '#fff' },
        { label: 'GSAP', icon: '', color: '#88CE02', textColor: '#000' },
        {
          label: 'Angular Material',
          icon: 'devicon-angularmaterial-plain',
          color: '#DD0031',
          textColor: '#fff',
        },
      ],
    },
    {
      category: 'Backend',
      terminalPrefix: 'backend',
      badges: [
        {
          label: '.NET Core',
          icon: 'devicon-dotnetcore-plain',
          color: '#512BD4',
          textColor: '#fff',
        },
        { label: 'Node.js', icon: 'devicon-nodejs-plain', color: '#339933', textColor: '#fff' },
        { label: 'Express', icon: 'devicon-express-original', color: '#444', textColor: '#fff' },
        { label: 'GraphQL', icon: 'devicon-graphql-plain', color: '#E10098', textColor: '#fff' },
        { label: 'Flask', icon: 'devicon-flask-original', color: '#444', textColor: '#fff' },
      ],
    },
    {
      category: 'Database',
      terminalPrefix: 'db',
      badges: [
        { label: 'MongoDB', icon: 'devicon-mongodb-plain', color: '#47A248', textColor: '#fff' },
        { label: 'MySQL', icon: 'devicon-mysql-original', color: '#4479A1', textColor: '#fff' },
        { label: 'Firebase', icon: 'devicon-firebase-plain', color: '#FFCA28', textColor: '#000' },
      ],
    },
    {
      category: 'Infra / DevOps',
      terminalPrefix: 'devops',
      badges: [
        {
          label: 'AWS',
          icon: 'devicon-amazonwebservices-plain-wordmark',
          color: '#FF9900',
          textColor: '#000',
        },
        { label: 'Docker', icon: 'devicon-docker-plain', color: '#2496ED', textColor: '#fff' },
        {
          label: 'Kafka',
          icon: 'devicon-apachekafka-original',
          color: '#231F20',
          textColor: '#fff',
        },
        {
          label: 'RabbitMQ',
          icon: 'devicon-rabbitmq-original',
          color: '#FF6600',
          textColor: '#fff',
        },
        { label: 'Vercel', icon: 'devicon-vercel-original', color: '#000000', textColor: '#fff' },
        { label: 'Git', icon: 'devicon-git-plain', color: '#F05032', textColor: '#fff' },
        {
          label: 'Azure DevOps',
          icon: 'devicon-azuredevops-plain',
          color: '#0078D7',
          textColor: '#fff',
        },
        { label: 'Nginx', icon: 'devicon-nginx-original', color: '#009639', textColor: '#fff' },
        { label: 'Netlify', icon: 'devicon-netlify-plain', color: '#00C7B7', textColor: '#fff' },
        {
          label: 'Google Cloud',
          icon: 'devicon-googlecloud-plain',
          color: '#4285F4',
          textColor: '#fff',
        },
      ],
    },
    {
      category: 'Tools',
      terminalPrefix: 'tools',
      badges: [
        { label: 'GitHub', icon: 'devicon-github-original', color: '#181717', textColor: '#fff' },
        { label: 'GitLab', icon: 'devicon-gitlab-plain', color: '#FC6D26', textColor: '#fff' },
        {
          label: 'SonarQube',
          icon: 'devicon-sonarqube-plain',
          color: '#4E9BCD',
          textColor: '#fff',
        },
        { label: 'Fortify', icon: '', color: '#6B7280', textColor: '#fff' },
        {
          label: 'Selenium',
          icon: 'devicon-selenium-original',
          color: '#43B02A',
          textColor: '#fff',
        },
        { label: 'Karma', icon: 'devicon-karma-plain', color: '#56C8DA', textColor: '#000' },
        { label: 'Jasmine', icon: 'devicon-jasmine-wordmark', color: '#8A4182', textColor: '#fff' },
        { label: 'Jest', icon: 'devicon-jest-plain', color: '#C21325', textColor: '#fff' },
        { label: 'Figma', icon: 'devicon-figma-plain', color: '#F24E1E', textColor: '#fff' },
        {
          label: 'Sketch',
          icon: 'devicon-sketch-line-wordmark',
          color: '#F7B500',
          textColor: '#000',
        },
        { label: 'Dev Tools', icon: '', color: '#6B7280', textColor: '#fff' },
        {
          label: 'Cloudinary',
          icon: 'devicon-cloudinary-plain',
          color: '#3448C5',
          textColor: '#fff',
        },
      ],
    },
    {
      category: 'AI Tools',
      terminalPrefix: 'ai_tools',
      badges: [
        { label: 'ChatGPT', icon: '', color: '#10A37F', textColor: '#fff' },
        { label: 'Codex', icon: '', color: '#412991', textColor: '#fff' },
        { label: 'Claude', icon: '', color: '#D97706', textColor: '#fff' },
        { label: 'Gemini', icon: '', color: '#4285F4', textColor: '#fff' },
        { label: 'Antigravity', icon: '', color: '#6366F1', textColor: '#fff' },
        { label: 'GitHub Copilot', icon: '', color: '#181717', textColor: '#fff' },
        { label: 'OpenCode', icon: '', color: '#6B7280', textColor: '#fff' },
        { label: 'DeepSeek', icon: '', color: '#4A6CF7', textColor: '#fff' },
        { label: 'Qwen', icon: '', color: '#6B7280', textColor: '#fff' },
      ],
    },
  ];

  typedLines: string[] = [];
  private allLines: string[] = [
    '$ init tech-stack --mode=full',
    '> Scanning installed packages...',
    '> 8 categories | 65 technologies detected.',
    '> Rendering grid. Hold tight.',
  ];
  private lineIndex = 0;
  private charIndex = 0;
  private typingTimer?: ReturnType<typeof setTimeout>;

  private initFallback(): void {
    const grid = this.stackGrid?.nativeElement;
    if (!grid) return;
    grid.classList.add('tilt-initial');
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          grid.classList.remove('tilt-initial');
          grid.classList.add('tilt-flat');
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(grid);
    this.observer = obs;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startTypewriter();
    }
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    await new Promise((r) => setTimeout(r, 100));
    try {
      const gsapMod = await import('gsap');
      const stMod = await import('gsap/ScrollTrigger');
      const gsapInstance = gsapMod.gsap;
      const scrollTrigger = stMod.ScrollTrigger;
      gsapInstance.registerPlugin(scrollTrigger);
      this.gsapInstance = gsapInstance;
      this.scrollTriggerInstance = scrollTrigger;
      this.initGSAP();
    } catch {
      this.initFallback();
    }
  }

  private initGSAP(): void {
    const grid = this.stackGrid?.nativeElement;
    const gsap = this.gsapInstance;
    if (!grid || !gsap) return;

    gsap.set(grid, {
      rotateX: 28,
      rotateY: -6,
      transformPerspective: 1400,
      transformOrigin: 'center top',
      opacity: 0.25,
      y: 80,
      scale: 0.97,
    });

    gsap.to(grid, {
      rotateX: 0,
      rotateY: 0,
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: grid,
        start: 'top 82%',
        end: 'top 25%',
        scrub: 1.2,
      },
    });

    const cards = grid.querySelectorAll('.tech-card');
    gsap.from(cards, {
      opacity: 0,
      y: 32,
      scale: 0.93,
      duration: 0.55,
      stagger: { each: 0.07, from: 'start' },
      ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: grid,
        start: 'top 78%',
      },
    });
  }

  private startTypewriter(): void {
    if (this.lineIndex >= this.allLines.length) return;
    const line = this.allLines[this.lineIndex];
    if (this.charIndex === 0) this.typedLines.push('');
    if (this.charIndex < line.length) {
      this.typedLines[this.lineIndex] = line.substring(0, ++this.charIndex);
      this.cdr.markForCheck();
      this.typingTimer = setTimeout(() => this.startTypewriter(), 30);
    } else {
      this.lineIndex++;
      this.charIndex = 0;
      this.cdr.markForCheck();
      this.typingTimer = setTimeout(() => this.startTypewriter(), 480);
    }
  }

  hasIcon(badge: TechBadge): boolean {
    return !!badge.icon;
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.scrollTriggerInstance?.getAll().forEach((t) => t.kill());
  }
}
