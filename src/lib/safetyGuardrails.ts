/**
 * Check Sky Light - Acceptable Use & Scientific Integrity Policy Guardrails
 * Prevents misuse, pornographic media/links, and human/animal harm.
 */

// Adult / Pornographic domain signatures (direct domains and subdomains)
const PROHIBITED_DOMAINS = [
  'pornhub.com', 'xvideos.com', 'xnxx.com', 'redtube.com', 'youporn.com',
  'chaturbate.com', 'onlyfans.com', 'cam4.com', 'stripchat.com', 'livejasmin.com',
  'xhamster.com', 'eporner.com', 'tube8.com', 'spankbang.com', 'brazzers.com',
  'naughtyamerica.com', 'bangbros.com', 'adultfriendfinder.com', 'fetlife.com',
  'beeg.com', 'heavy-r.com', 'bestgore.com', 'kaotic.com', 'crazyshit.com',
  'goregrish.com', 'liveleak.com', 'theync.com', 'motherless.com', 'bitchute.com/porn',
  'reddit.com/r/nsfw', 'reddit.com/r/gonewild', 'reddit.com/r/porn', '4chan.org/b', '4chan.org/pol',
  'x.xxx', 'tnaflix.com', 'thumbzilla.com', 'fapello.com', 'daftsex.com', 'rule34.xxx',
  'gelbooru.com', 'e621.net', 'efukt.com', 'leakedporn.me', 'cams.com', 'myfreecams.com'
];

// Content violation patterns (regexes testing against normalized lowercase input)
const PORNOGRAPHIC_PATTERNS = [
  /\b(porn|porno|pornography|xxx|nsfw|hentai|erotic|erotica)\b/i,
  /\b(blowjob|handjob|cumshot|creampie|gangbang|deepthroat)\b/i,
  /\b(masturbat(e|ing|ion)|orgasm|ejaculat(e|ion)|vagina|penis|dildo|clitoris)\b/i,
  /\b(onlyfans\.com|fansly\.com|camgirl|camsite|camwhore)\b/i,
  /\b(hardcore\s+sex|nude\s+video|naked\s+girls?|naked\s+women|striptease|explicit\s+sex)\b/i,
  /\b(p[\s._-]*o[\s._-]*r[\s._-]*n)\b/i
];

const HARM_AND_CRUELTY_PATTERNS = [
  /\b(animal\s+abuse|animal\s+cruelty|crush\s+video|dog\s+fight(ing)?|cockfight(ing)?)\b/i,
  /\b(kill(ing)?\s+(a\s+)?(dog|cat|puppy|kitten|horse|pet|animal))\b/i,
  /\b(tortur(e|ing)|behead(ing)?|decapitat(e|ion)|dismember(ment)?|snuff\s+film)\b/i,
  /\b(suicide\s+video|hang(ing)?\s+myself|self[\s-]harm|slitting\s+wrists)\b/i,
  /\b(mass\s+shooting|school\s+shooting|terrorist\s+execution|gore\s+video)\b/i,
  /\b(crushing\s+(animals?|puppies|kittens)|animal\s+torture)\b/i
];

export interface SafetyCheckResult {
  isSafe: boolean;
  violationType?: 'PORNOGRAPHY_OR_EXPLICIT' | 'HUMAN_OR_ANIMAL_HARM' | 'BLOCKED_DOMAIN';
  reason?: string;
}

export interface UserBlockStatus {
  isBlocked: boolean;
  remainingMinutes?: number;
  strikeCount: number;
  reason?: string;
}

const STORAGE_KEY_STRIKES = 'csl_safety_strikes_v1';
const STORAGE_KEY_BLOCKED_UNTIL = 'csl_blocked_until_v1';
const STORAGE_KEY_BLOCK_REASON = 'csl_block_reason_v1';

// 24-hour lockout window on repeated safety violation
const LOCKOUT_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Validates text content, URLs, and filenames against scientific integrity policies
 */
export function evaluateContentSafety(text: string, url?: string): SafetyCheckResult {
  const combined = `${url || ''} ${text || ''}`.toLowerCase().trim();

  // 1. Prohibited Domain Check
  if (url) {
    const cleanUrl = url.toLowerCase();
    for (const domain of PROHIBITED_DOMAINS) {
      if (cleanUrl.includes(domain)) {
        return {
          isSafe: false,
          violationType: 'BLOCKED_DOMAIN',
          reason: `Access to prohibited external domain detected (${domain}). Check Sky Light strictly rejects adult and shock sites.`
        };
      }
    }
  }

  // 2. Adult / Pornographic Content Check
  for (const pattern of PORNOGRAPHIC_PATTERNS) {
    if (pattern.test(combined)) {
      return {
        isSafe: false,
        violationType: 'PORNOGRAPHY_OR_EXPLICIT',
        reason: 'Explicit sexual or pornographic material detected. Check Sky Light is an empirical scientific aerospace platform.'
      };
    }
  }

  // 3. Human or Animal Harm / Cruelty Check
  for (const pattern of HARM_AND_CRUELTY_PATTERNS) {
    if (pattern.test(combined)) {
      return {
        isSafe: false,
        violationType: 'HUMAN_OR_ANIMAL_HARM',
        reason: 'Violent harm, animal cruelty, or gore detected. Violations of this nature are strictly prohibited and result in immediate access revocation.'
      };
    }
  }

  return { isSafe: true };
}

/**
 * Checks if the current browser/device is blocked due to safety violations
 */
export function checkUserBlockStatus(): UserBlockStatus {
  if (typeof window === 'undefined') {
    return { isBlocked: false, strikeCount: 0 };
  }

  try {
    const rawStrikes = localStorage.getItem(STORAGE_KEY_STRIKES);
    const strikeCount = rawStrikes ? parseInt(rawStrikes, 10) : 0;

    const blockedUntilStr = localStorage.getItem(STORAGE_KEY_BLOCKED_UNTIL);
    const blockReason = localStorage.getItem(STORAGE_KEY_BLOCK_REASON) || 'Repeated acceptable use policy violations';

    if (blockedUntilStr) {
      const blockedUntil = parseInt(blockedUntilStr, 10);
      const now = Date.now();
      if (now < blockedUntil) {
        const remainingMinutes = Math.ceil((blockedUntil - now) / (60 * 1000));
        return {
          isBlocked: true,
          remainingMinutes,
          strikeCount,
          reason: blockReason
        };
      } else {
        // Lockout expired: remove lock but keep strike history
        localStorage.removeItem(STORAGE_KEY_BLOCKED_UNTIL);
        localStorage.removeItem(STORAGE_KEY_BLOCK_REASON);
      }
    }

    return { isBlocked: false, strikeCount };
  } catch {
    return { isBlocked: false, strikeCount: 0 };
  }
}

/**
 * Records a safety strike against the client.
 * Triggers 24-hour block on 2 strikes (or immediate block on animal/human harm).
 */
export function recordSafetyStrike(reason: string, isSevere: boolean = false): UserBlockStatus {
  if (typeof window === 'undefined') {
    return { isBlocked: false, strikeCount: 1 };
  }

  try {
    const rawStrikes = localStorage.getItem(STORAGE_KEY_STRIKES);
    const currentStrikes = rawStrikes ? parseInt(rawStrikes, 10) : 0;
    const newStrikes = currentStrikes + 1;
    localStorage.setItem(STORAGE_KEY_STRIKES, newStrikes.toString());

    // Block immediately if severe (harm) or on 2nd strike
    if (isSevere || newStrikes >= 2) {
      const blockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(STORAGE_KEY_BLOCKED_UNTIL, blockedUntil.toString());
      localStorage.setItem(STORAGE_KEY_BLOCK_REASON, reason);

      return {
        isBlocked: true,
        remainingMinutes: 24 * 60,
        strikeCount: newStrikes,
        reason
      };
    }

    return {
      isBlocked: false,
      strikeCount: newStrikes,
      reason
    };
  } catch {
    return { isBlocked: false, strikeCount: 1 };
  }
}

/**
 * Resets safety strikes for clean testing or authorized administrative reset
 */
export function resetSafetyStrikes(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_STRIKES);
    localStorage.removeItem(STORAGE_KEY_BLOCKED_UNTIL);
    localStorage.removeItem(STORAGE_KEY_BLOCK_REASON);
  } catch (err) {
    console.warn('Failed to reset safety strikes:', err);
  }
}

/**
 * Convenience check if client is currently under safety lockout
 */
export function isDeviceBlocked(): boolean {
  return checkUserBlockStatus().isBlocked;
}

/**
 * Convenience alias for pre-flight content safety check
 */
export function validateSafetyPreFlight(text: string, url?: string): SafetyCheckResult {
  return evaluateContentSafety(text, url);
}
