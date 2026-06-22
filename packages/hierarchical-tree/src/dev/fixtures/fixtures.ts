import { article } from './article';
import { artitechArticle } from './artitech-article';
import { artitechAutomobile } from './artitech-automobile';
import { artitechFitness } from './artitech-fitness';
import { ewArticle } from './ew-article';
import { figmaWebsitev5 } from './figma-websitev5';
import { peopleArticle } from './people-article';
import { thrArticle } from './thr-article';
import type { Fixture } from './types';

/**
 * Explicit fixture registry — no barrel re-exports. Add new fixtures
 * by importing them here and listing them in the object literal so
 * the dev app's `?fixture=<name>` query can look them up.
 *
 * Keys are the lookup names exposed to the URL.
 */
export const FIXTURES: Record<string, Fixture> = {
  article,
  'artitech-article': artitechArticle,
  'artitech-automobile': artitechAutomobile,
  'artitech-fitness': artitechFitness,
  'figma-websitev5': figmaWebsitev5,
  'people-article': peopleArticle,
  'ew-article': ewArticle,
  'thr-article': thrArticle,
};

/** Default fixture rendered when no `?fixture=` query is present. */
export const DEFAULT_FIXTURE_NAME = 'article';
