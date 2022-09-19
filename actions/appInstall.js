import { appStoreLink, hireLink, investLink } from '../config';

export const handleAndroidInstallClick = () => {
  window.open(appStoreLink);
};
export const handleIosInstallClick = () => {
  window.open(appStoreLink);
};

export const handleHireLinkClick = () => window.open(hireLink);

export const handleInvestClick = () => window.open(investLink);
