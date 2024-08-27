import { useInfiniteQuery } from '@tanstack/react-query'
import { axiosInstance } from './instance'

export async function getBalanceAPI({ isCurrentBalance }: { isCurrentBalance: boolean }) {
  return await axiosInstance
    .get('/goservices/wallets/getbalance', {
      params: {
        is_current_balance: isCurrentBalance,
      },
    })
    .then((res) => {
      return { wallet: res.data.data.wallet }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('error:;', e)
      throw new Error('Something went wrong::')
    })
}

export async function updateBalanceAPI({
  action,
  amount,
  metadata,
}: {
  action: string
  amount: number
  metadata: object
}) {
  return await axiosInstance
    .put('/goservices/wallets/transactions/create', { action, amount, metadata })
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('error:;', e)
      throw new Error('Something went wrong::')
    })
}

async function fetchTransactionsList({
  page,
  pagesize,
  type,
}: {
  page: number
  pagesize: number
  type: 'POINT' | 'CASH'
}) {
  return await axiosInstance
    .get('/goservices/wallets/transactions', {
      params: {
        page,
        pagesize,
        type,
      },
    })
    .then((res) => res.data.data)
    .catch(() => {
      throw new Error('Something went wrong with transactions api.')
    })
}

export function getTransactionsList({ pageSize, type }: { pageSize: number; type: 'POINT' | 'CASH' }) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam = 0 }) => {
      const page = pageParam
      const response = await fetchTransactionsList({
        page,
        pagesize: pageSize,
        type,
      })

      return {
        transactions: response.transactions,
        end_of_transactions: response.end_of_transactions,
        nextPage: page + 1,
      }
    },
    queryKey: ['transactions', type],
    getNextPageParam: (lastPage) => {
      // If end_of_transactions is true, don't fetch more pages
      return lastPage.end_of_transactions ? undefined : lastPage.nextPage
    },
  })
}

export async function redeemCouponAPI() {
  return await axiosInstance
    .post('/goservices/wallets/coupon/redeem ')
    .then((res) => {
      return res
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('error:;', e)
      return { data: { code: Number(e.response.data.code), message: e.response.data.message } }
      // throw new Error('Something went wrong::')
    })
}
