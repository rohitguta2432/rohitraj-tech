// Site is English-only. The locale routing layer (/en, /hi, …) was removed to
// consolidate SEO signals on one URL per page; dictionaries remain as the
// content source so copy stays separated from components.
export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export type Dictionary = {
    common: CommonDictionary;
    home: HomeDictionary;
    pages: PagesDictionary;
    meta: MetaDictionary;
};

export interface CommonDictionary {
    nav: {
        home: string;
        projects: string;
        repos: string;
        notes: string;
        about: string;
        contact: string;
        viewCurrentWork: string;
        hireMe?: string;
    };
    footer: {
        brand: string;
    };
    buttons: {
        viewProjects: string;
        engineeringNotes: string;
        github: string;
        viewRepository: string;
    };
    language: {
        switchLanguage: string;
    };
    subscribe?: {
        title: string;
        placeholder: string;
        button: string;
        success: string;
        error: string;
    };
}

export interface HomeDictionary {
    hero: {
        subtitle: string;
        titleLine1: string;
        titleLine2: string;
        deck?: string;
        bookCallCta?: string;
        trustPills?: string[];
        approach: {
            title: string;
            items: {
                problemFirst: { title: string; description: string };
                aiTool: { title: string; description: string };
                productionReady: { title: string; description: string };
                openEngineering: { title: string; description: string };
            };
        };
    };
    aiProjects: {
        sectionTitle: string;
        sectionHeading: string;
        sectionDescription: string;
        labels: {
            problem: string;
            solution: string;
            aiApproach: string;
            techStack: string;
        };
        readNotes: string;
    };
    reliability?: {
        sectionTitle: string;
        sectionHeading: string;
        cards: {
            observability: ReliabilityCard;
            loadTesting: ReliabilityCard;
            apiTesting: ReliabilityCard;
            kafkaTesting: ReliabilityCard;
        };
    };
    process?: {
        eyebrow: string;
        heading: string;
        subtitle: string;
        weeks: { label: string; title: string; items: string[] }[];
    };
    faq?: {
        eyebrow: string;
        heading: string;
        items: { q: string; a: string }[];
    };
    hire?: {
        eyebrow: string;
        heading: string;
        intro: string;
        points: string[];
        cta: string;
    };
}

export interface ReliabilityCard {
    title: string;
    subtitle: string;
    description: string;
    bullets: string[];
    linkText: string;
}

export interface PagesDictionary {
    about: {
        title: string;
        bio1: string;
        bio2: string;
        bio3?: string;
        bio4?: string;
    };
    contact: {
        title: string;
        description: string;
    };
    projects: {
        title: string;
        description: string;
        active: string;
        activeDescription: string;
        iterating: string;
        iteratingDescription: string;
        paused: string;
        pausedDescription: string;
    };
    repos: {
        title: string;
        description: string;
    };
    notes: {
        title: string;
        description: string;
        contributionFeed: string;
        repositorySummary: string;
        projectNotes: string;
        viewAllRepos: string;
        noContributions: string;
        noNotes: string;
        whyExists: string;
        coreChallenge: string;
        architecture: string;
        tradeoffs: string;
    };
    reliability: {
        title: string;
        description: string;
        dashboard: {
            title: string;
            cpu: string;
            memory: string;
            requests: string;
            latency: string;
        };
    };
}

export interface MetaDictionary {
    home: {
        title: string;
        description: string;
    };
    about: {
        title: string;
        description: string;
    };
    contact: {
        title: string;
        description: string;
    };
    projects: {
        title: string;
        description: string;
    };
    repos: {
        title: string;
        description: string;
    };
    notes: {
        title: string;
        description: string;
    };
}

// Module-level cache: the dictionary is loaded once per server process
let cachedDictionary: Dictionary | null = null;

export async function getDictionary(): Promise<Dictionary> {
    if (cachedDictionary) return cachedDictionary;

    const [common, home, pages, meta] = await Promise.all([
        import('../../content/en/common.json').then((m) => m.default),
        import('../../content/en/home.json').then((m) => m.default),
        import('../../content/en/pages.json').then((m) => m.default),
        import('../../content/en/meta.json').then((m) => m.default),
    ]);
    cachedDictionary = { common, home, pages, meta };
    return cachedDictionary;
}
