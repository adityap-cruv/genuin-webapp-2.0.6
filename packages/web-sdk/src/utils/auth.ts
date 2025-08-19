import { ksCbRequestStatusType } from '@genuin/components/types/roles'

export const getKsCbRequestStatus = (status: number): ksCbRequestStatusType => {
  switch (status) {
    case 1:
      return 'Pending'
    case 2:
      return 'Requested'
    default:
      return 'Accepted'
  }
}
