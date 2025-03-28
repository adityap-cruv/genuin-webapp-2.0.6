import { Desktop } from './desktop'
import { Mobile } from './mobile'

// TODO: Merge both desktop and mobile components into a single component. So we can produce different flavours for each.
export const ControlLayer = { desktop: Desktop, mobile: Mobile }
