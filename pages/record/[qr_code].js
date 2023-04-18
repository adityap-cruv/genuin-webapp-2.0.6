import React, { useEffect } from 'react'
import axios from 'axios'
import { Error } from '../../components/basic/error'

const Record = ({
  owner = {}
}) => {
  const {
    nickname
  } = owner

  useEffect(() => {
    if (nickname) {
      window.history.replaceState(null, '', `../p/${nickname}`)
      window.location.reload()
    }
  }, [])

  return !nickname ? (
    <Error />
  ) : (
    <>
    </>
  )
}
Record.getInitialProps = async ({ query: { qr_code } }) => {
  return new Promise(function (resolve, reject) {
    const url_to_use = `${process.env.apiurl}/api/v3/public/qr?qr_code=${qr_code}`

    axios
      .get(url_to_use)
      .then((response) => {
        if (
          response.data.data.owner.nickname !== undefined &&
          response.data.data.owner.nickname !== null &&
          response.data.data.owner.nickname !== ''
        ) {
          resolve({
            owner: response.data.data.owner
          })
        } else {
          resolve({})
        }
      })
      .catch((_err) => {
        resolve({})
      })
  })
}
export default Record
