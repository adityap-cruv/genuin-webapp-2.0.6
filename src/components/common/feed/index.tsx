'use client'
import { Desktop, SinglePlayer as InnerSinglePlayer } from './desktop'
import { Mobile } from './mobile'

export const Feed = { desktop: Desktop, mobile: Mobile }

export const SinglePlayer = InnerSinglePlayer
