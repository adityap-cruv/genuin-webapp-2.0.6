import { hireLink, investLink } from '../config'

export const handleLink = (link, target) => {
  window.open(link, target)
}

export const handleHireLinkClick = () => window.open(hireLink)

export const handleInvestClick = () => window.open(investLink)
