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
    metaTitle: 'About BuildForgeTools | Community Talent Planner',
    description: 'Learn how BuildForgeTools maintains its WoW Forever Paladin talent planner, reviews community data, and labels information that still needs verification.',
    eyebrow: 'Independent Community Project',
    intro: 'BuildForgeTools is an independently maintained planning tool for players who want to inspect, compare, and share WoW Forever Paladin talent builds.',
    updated: 'September 17, 2026',
    sections: [
      {
        heading: 'Why BuildForgeTools Exists',
        paragraphs: [
          'Talent information for a new or changing game can be difficult to compare. Screenshots, beta client records, community notes, and older reference material often arrive at different times. BuildForgeTools organizes that information into a usable planner so a player can test an allocation, understand which details are still uncertain, and send the same setup to another player.',
          'The site is built around a small set of practical actions: inspect a talent tree, load a complete example, change ranks, and copy the resulting build link. Build pages explain why an allocation exists and which playstyle it represents. They are planning references rather than promises that one setup is mathematically best for every encounter.',
        ],
      },
      {
        heading: 'How Talent Data Is Reviewed',
        paragraphs: [
          'The working dataset is compared with official WoW Forever announcements, publicly available beta client information, demonstrated game material, community research, and Classic references where they help identify inherited talents. A Classic match does not automatically prove that the WoW Forever value, rank, position, or prerequisite is unchanged.',
          'Every talent can carry a verification state. Verified information has strong direct evidence. Community verified information has consistent public support but may still need an official or in-game confirmation. Needs review identifies names, ranks, tooltips, or tree positions that should not yet be treated as final. New beta data enters a comparison process before it replaces the public planner.',
        ],
        links: [
          { href: '/wow-forever-paladin-beta-talent-changes', label: 'View the Paladin Beta data tracker' },
          { href: '/wow-forever-paladin-talents', label: 'Read the Paladin talent guide' },
        ],
      },
      {
        heading: 'Corrections and Maintenance',
        paragraphs: [
          'The planner is maintained as an active community project. When a tooltip, rank, prerequisite, or build explanation appears wrong, visitors can use the Feedback button to identify the talent and describe the evidence. Reports are reviewed before production data changes so one unverified message cannot silently rewrite the tree.',
          'Talent pages identify the current Beta client build, while build pages label recommended allocations as community examples. Update dates and source notes help readers judge freshness. The goal is a transparent build tool that separates verified client fields from recommendations that still need player testing.',
        ],
        links: [{ href: '/contact', label: 'Report a correction or request a feature' }],
      },
      {
        heading: 'Independent Fan Tool',
        paragraphs: [
          'BuildForgeTools is not affiliated with, endorsed by, or sponsored by Blizzard Entertainment. World of Warcraft, WoW, Blizzard, and related names and marks belong to their respective owners. They are used here only to identify the game and the community information the tool helps players organize.',
        ],
      },
    ],
  },
  {
    id: 'contact',
    slug: 'contact',
    title: 'Contact BuildForgeTools',
    metaTitle: 'Contact BuildForgeTools | Feedback & Corrections',
    description: 'Contact BuildForgeTools to report incorrect WoW Forever talent data, broken planner behavior, or a feature request through the private feedback form.',
    eyebrow: 'Feedback and Corrections',
    intro: 'Use the site feedback form to report incorrect talent data, a broken interaction, or a feature that would make the planner more useful.',
    updated: 'September 17, 2026',
    sections: [
      {
        heading: 'Send a Report',
        paragraphs: [
          'Select the Feedback button in the lower-right corner of any page. Choose Talent data, Feature request, Bug, or Other, then describe what you found. An email address is optional. If you include one, it is used only when a reply is needed to understand or resolve the report.',
          'For a talent correction, include the talent name, specialization, rank, and the field that appears wrong. A public source link, screenshot description, client build number, or exact in-game tooltip makes the report easier to verify. Please do not submit account credentials, private game files, or other sensitive personal information.',
        ],
      },
      {
        heading: 'What Happens Next',
        paragraphs: [
          'Feedback is stored privately and reviewed as maintenance time allows. A report may lead to a data comparison, wording correction, interface fix, or a note in the beta change tracker. Submitting a request does not guarantee that it will be published, and uncertain data remains marked for review until the available evidence is strong enough.',
          'BuildForgeTools does not publish a personal operator email address. The feedback form is the official contact channel because it keeps talent corrections, bug reports, and feature requests organized without exposing private contact details.',
        ],
      },
      {
        heading: 'Useful Starting Points',
        paragraphs: ['Before reporting a missing build, check the current planner, specialization pages, and beta tracker. They show which allocations are complete and which talent details are still waiting for verification.'],
        links: [
          { href: '/paladin', label: 'Open the Paladin Talent Calculator' },
          { href: '/wow-forever-paladin-builds', label: 'Browse Paladin builds' },
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
    intro: 'This policy explains what information BuildForgeTools processes when you use the talent planner, visit a content page, or submit feedback.',
    updated: 'September 17, 2026',
    sections: [
      {
        heading: 'Analytics',
        paragraphs: [
          'BuildForgeTools uses Google Analytics 4 to understand how the site is found and which features are useful. Analytics can collect information such as the page visited, approximate location, device and browser characteristics, referrer, session activity, and interactions including talent clicks, completed builds, copied build links, and navigation to build pages.',
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
          'The calculator stores the most recent talent allocation in local browser storage so the build can be restored on a later visit. This information remains on the device and can be removed by starting a new build or clearing browser storage.',
          'When you copy a build link, the selected talent identifiers and ranks are encoded in the URL. The link does not require an account and is not intended to contain a name, email address, or other personal information. Anyone who receives the URL can open the shared allocation, so do not add sensitive information when sharing it elsewhere.',
        ],
      },
      {
        heading: 'Feedback Data',
        paragraphs: [
          'The feedback form collects a category, message, originating page, submission time, and an optional email address. Submissions are saved in private Vercel Blob storage and are used to investigate talent corrections, bugs, and feature requests. An optional email address is used only if a reply is needed.',
          'Feedback is not sold or displayed publicly. Access is limited to site maintenance. Submissions are retained only for as long as reasonably needed to review the report, maintain a record of the resulting change, and protect the form against abuse. Avoid placing sensitive personal information in a feedback message.',
        ],
      },
      {
        heading: 'Advertising and Cookies',
        paragraphs: [
          'BuildForgeTools does not currently display third-party advertising. If advertising is introduced, this policy will be updated before activation to describe the providers, advertising cookies, personalization choices, and opt-out controls that apply.',
          'If Google AdSense is introduced, Google and its partners may use cookies to serve and measure ads based on visits to this and other websites. Required consent controls, including a Google-certified consent platform for visitors in the European Economic Area, the United Kingdom, and Switzerland, will be configured before personalized ads are served in those regions.',
        ],
        links: [{ href: 'https://policies.google.com/technologies/ads', label: 'How Google uses information for advertising' }],
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
