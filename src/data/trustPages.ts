export type TrustPageId = 'about' | 'contact' | 'privacy'

export interface TrustSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
  links?: { href: string; label: string }[]
}

export interface TrustPageConfig {
  id: TrustPageId
  slug: string
  title: string
  metaTitle: string
  description: string
  eyebrow: string
  intro: string
  updated: string
  sections: TrustSection[]
}

export const TRUST_PAGES: TrustPageConfig[] = [
  {
    id: 'about',
    slug: 'about',
    title: 'About BuildForgeTools',
    metaTitle: 'About BuildForgeTools | Game Build Planners & Data',
    description: 'Learn how BuildForgeTools creates interactive build planners and reviews verified mechanics for WoW Forever, Emberville, and other evolving games.',
    eyebrow: 'Independent Community Project',
    intro: 'BuildForgeTools is an independent game build-planning site focused on interactive planners, talent tools, and verified mechanics for new and evolving games.',
    updated: 'September 23, 2026',
    sections: [
      {
        heading: 'Why BuildForgeTools Exists',
        paragraphs: [
          'Build information for a new or changing game can be difficult to compare. Official announcements, client records, demonstrated gameplay, and community testing often arrive at different times. BuildForgeTools organizes that evidence into usable planners so players can explore a setup while seeing which details are confirmed and which remain under review.',
          'We prioritize tools and reproducible build data over generic “best build” claims. A useful page should let a player inspect real mechanics, reproduce a configuration, understand its source and version, or prepare a build that can be completed when verified data becomes available.',
        ],
      },
      {
        heading: 'Current Games',
        paragraphs: [
          'WoW Forever tools cover Paladin, Warrior, Mage, Hunter, Rogue, Priest, Warlock, Shaman, and Druid. Published calculators and build pages let players inspect talent ranks, follow point-by-point progression, compare example allocations, and open supported setups in a calculator. Available tools differ by class. Publication gates check each page’s declared data dependencies, and known source conflicts or missing recommendations remain visible.',
          'Emberville is represented by a pre-Early Access build planner, build-direction hub, class-system overview, and skill-inheritance guide. Confirmed systems are available now; exact class, weapon, skill, and compatibility records remain locked until reliable source data supports them.',
        ],
        links: [
          { href: '/wow-forever-classes', label: 'Explore WoW Forever tools' },
          { href: '/wow-forever-builds', label: 'Find builds by playstyle' },
          { href: '/emberville', label: 'Explore the Emberville planner' },
        ],
      },
      {
        heading: 'How Game Data Is Reviewed',
        paragraphs: [
          'Game datasets are compared with official announcements, public client information, demonstrated gameplay, and consistent community research. Similarity to an older game or preview does not automatically prove that a name, value, position, requirement, or interaction is unchanged.',
          'Records distinguish official information, client datamines, client-verified fields, community verification, and derived assumptions. The data pipeline preserves client build numbers, talent and spell identifiers, ranks, tooltips, prerequisites, and source references. Candidate data is validated and compared with the published version before a planner is updated. Page dates, source links, and version labels show what was reviewed; they are not a promise that every mechanic has been tested in game.',
        ],
        links: [{ href: '/wow-forever-paladin-beta-talent-changes', label: 'View a versioned data change tracker' }],
      },
      {
        heading: 'How Build Recommendations Differ from Game Data',
        paragraphs: [
          'A client record can establish a talent name, rank, position, or tooltip. It does not establish the best way to spend points for every encounter. Our editorial and community build examples are labeled separately from the records used to validate them.',
          'Progression tools identify whether a point order is editorial or derived from a legal allocation. Comparisons show which talent ranks differ; they do not simulate damage or prove that one build performs better. Reused allocations are not presented as independent player builds or popularity statistics. If required data is missing, the tool explains the limitation instead of inventing a result.',
        ],
      },
      {
        heading: 'Corrections and Maintenance',
        paragraphs: [
          'When a class, skill, talent, prerequisite, tooltip, or build explanation appears wrong, visitors can use the Feedback button to identify the affected game and provide evidence. Reports are reviewed before production data changes so one unverified message cannot silently rewrite a planner.',
          'Build pages label recommendations and preview assumptions separately from verified game records. The goal is a transparent set of tools that can evolve quickly without presenting incomplete information as settled fact.',
        ],
        links: [{ href: '/contact', label: 'Report a correction or request a feature' }],
      },
      {
        heading: 'Independent Game Tools',
        paragraphs: [
          'BuildForgeTools is not affiliated with, endorsed by, or sponsored by Blizzard Entertainment, Cygnus Cross, or the developers and publishers of the games covered here. Game names, marks, and related material belong to their respective owners and are used only to identify the games and mechanics the tools help players organize.',
        ],
      },
    ],
  },
  {
    id: 'contact',
    slug: 'contact',
    title: 'Contact BuildForgeTools',
    metaTitle: 'Contact BuildForgeTools | Feedback & Corrections',
    description: 'Contact BuildForgeTools to report incorrect game data, broken planner behavior, or a feature request through the private feedback form.',
    eyebrow: 'Feedback and Corrections',
    intro: 'BuildForgeTools is independently operated and maintained as a community game-tools project. Use the site feedback form to report incorrect game data, a broken interaction, or a feature that would make a BuildForgeTools planner more useful.',
    updated: 'September 23, 2026',
    sections: [
      {
        heading: 'Send a Report',
        paragraphs: [
          'Select the Feedback button in the lower-right corner of any supported page. Choose Game data, Feature request, Bug, or Other, then describe what you found. An email address is optional and is used only when a reply is needed to understand or resolve the report.',
          'For a correction, include the game, affected system, class, build, skill, or talent, and the field that appears wrong. A public source link, screenshot description, data version, client build number, or exact in-game text makes the report easier to verify. Please do not submit account credentials, private game files, or other sensitive personal information.',
        ],
      },
      {
        heading: 'What Happens Next',
        paragraphs: [
          'Feedback is stored privately and reviewed as maintenance time allows. A report may lead to a data comparison, wording correction, interface fix, or a note in the beta change tracker. Submitting a request does not guarantee that it will be published, and uncertain data remains marked for review until the available evidence is strong enough.',
          'BuildForgeTools does not publish a personal operator email address. The feedback form is the official contact channel because it keeps data corrections, bug reports, and feature requests organized without exposing private contact details.',
        ],
      },
      {
        heading: 'Useful Starting Points',
        paragraphs: ['Before reporting missing information, check the relevant planner and data-status sections. They show which records are available, which are preview-only, and which details are still waiting for verification.'],
        links: [
          { href: '/wow-forever-classes', label: 'Find a WoW Forever class calculator' },
          { href: '/emberville', label: 'Open the Emberville Build Planner' },
          { href: '/wow-forever-paladin-beta-talent-changes', label: 'Check the Beta data tracker' },
        ],
      },
    ],
  },
  {
    id: 'privacy',
    slug: 'privacy',
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy | BuildForgeTools',
    description: 'Read how BuildForgeTools uses Google Analytics, local browser storage, share links, and privately submitted feedback.',
    eyebrow: 'BuildForgeTools',
    intro: 'This policy explains what information BuildForgeTools processes when you use its build planners and game tools, visit a content page, or submit feedback.',
    updated: 'September 26, 2026',
    sections: [
      {
        heading: 'Analytics',
        paragraphs: [
          'BuildForgeTools uses Google Analytics 4 to understand how the site is found and which features are useful. Analytics can collect information such as the page visited, approximate location, device and browser characteristics, referrer, session activity, and interactions including build selections, talent or skill interactions, completed builds, copied build links, locally saved planning actions, and navigation to game pages.',
          'BuildForgeTools uses aggregated reporting to improve navigation, content, and planner behavior. It does not use analytics reports to identify individual visitors. Google may process technical information according to its own policies, and visitors can use browser controls or Google privacy controls to limit analytics and advertising cookies.',
        ],
        links: [
          { href: 'https://policies.google.com/privacy', label: 'Google Privacy Policy' },
          { href: 'https://tools.google.com/dlpage/gaoptout', label: 'Google Analytics opt-out browser add-on' },
        ],
      },
      {
        heading: 'Planner Storage and Share Links',
        paragraphs: [
          'Build planners may store recent selections or notes in local browser storage so work can be restored on a later visit. WoW Forever stores a recent talent allocation; the Emberville preview planner can store build notes. This information remains on the device and can be removed through the tool or by clearing browser storage.',
          'When a tool supports copied build links, selected game identifiers and ranks may be encoded in the URL. A share link does not require an account and is not intended to contain a name, email address, or other personal information. Anyone who receives the URL can open the shared setup, so do not include sensitive information in notes or links shared elsewhere.',
          'After a WoW Forever build link is successfully copied, BuildForgeTools stores the normalized talent allocation, point total, dominant specialization, an anonymous per-session identifier, and submission time in private storage. Repeated copies of the same build in the same browser session on the same day overwrite the same record. These records are collected to measure shared build patterns and are not displayed as popularity statistics until the sample is large enough to be meaningful.',
        ],
      },
      {
        heading: 'Feedback Data',
        paragraphs: [
          'The feedback form collects a category, message, originating page, submission time, and an optional email address. Submissions are saved in private Vercel Blob storage and are used to investigate game-data corrections, bugs, and feature requests. An optional email address is used only if a reply is needed.',
          'Feedback is not sold or displayed publicly. Access is limited to site maintenance. Submissions are retained only for as long as reasonably needed to review the report, maintain a record of the resulting change, and protect the form against abuse. Avoid placing sensitive personal information in a feedback message.',
        ],
      },
      {
        heading: 'Advertising and Cookies',
        paragraphs: [
          'BuildForgeTools does not currently display third-party advertising. If advertising is introduced, this policy will be updated before activation to describe the providers, advertising cookies, personalization choices, and opt-out controls that apply.',
          'If advertising is activated, third-party vendors, including Google, may use cookies to serve ads based on prior visits to BuildForgeTools or other websites. Google advertising cookies enable Google and its partners to personalize ads based on visits to this site and other sites. Visitors can opt out of personalized ads through Google Ads Settings or manage participating third-party vendors through the industry opt-out page. We will identify any additional active ad networks here before ads are served.',
          'If Google AdSense is introduced, required consent controls, including a Google-certified consent platform for visitors in the European Economic Area, the United Kingdom, and Switzerland, will be configured before personalized ads are served in those regions.',
        ],
        links: [
          { href: 'https://policies.google.com/technologies/ads', label: 'How Google uses information for advertising' },
          { href: 'https://www.google.com/settings/ads', label: 'Google Ads Settings' },
          { href: 'https://www.aboutads.info/choices/', label: 'Industry advertising opt-out' },
        ],
      },
      {
        heading: 'External Links and Service Providers',
        paragraphs: [
          'Pages may link to official game announcements, public community references, and other websites. Their privacy practices are controlled by their respective operators. BuildForgeTools is hosted through Vercel, which processes the technical requests needed to deliver the site and feedback endpoint.',
        ],
      },
      {
        heading: 'Questions and Policy Changes',
        paragraphs: [
          'Use the Feedback button and choose Other for a question about this policy or a request concerning feedback you previously submitted. Include enough non-sensitive detail to locate the submission. This policy may change when site features, analytics, hosting, or advertising practices change. The updated date at the top of this page shows the current version.',
        ],
        links: [{ href: '/contact', label: 'Open contact instructions' }],
      },
    ],
  },
]

export function trustPageById(id: TrustPageId) {
  return TRUST_PAGES.find((page) => page.id === id) ?? TRUST_PAGES[0]
}
