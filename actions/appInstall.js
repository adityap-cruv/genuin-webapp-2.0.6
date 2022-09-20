import { appStoreLink, hireLink, investLink } from '../config';

export const handleLink = (link, target) => () => {
  window.open(link, target);
};

export const handleAndroidInstallClick = handleLink(appStoreLink);

export const handleIosInstallClick = handleLink(appStoreLink);

export const handleHireLinkClick = () => window.open(hireLink);

export const handleInvestClick = () => window.open(investLink);
