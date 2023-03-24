import { useEffect } from "react";
import axios from "axios";
import { Error } from "../../components/error";

const Record = ({
  owner = {}
}) => {
  const {
    nickname
  } = owner;

  useEffect(() => {
    if(nickname){
      window.history.replaceState(null, "", `../p/${nickname}`)
      window.location.reload()
    }
  }, [])

  return !Boolean(nickname) ? (
    <Error />
  ) : (
    <>
    </>
  );
};
Record.getInitialProps = async ({ query: { qr_code } }) => {
  return new Promise(function (resolve, reject) {
    var url_to_use = `${process.env.apiurl}/api/v3/public/qr?qr_code=${qr_code}`;

    axios
      .get(url_to_use)
      .then((response) => {
        if (
          response.data.data.owner.nickname !== undefined &&
          response.data.data.owner.nickname !== null &&
          response.data.data.owner.nickname !== ""
        ) {
          resolve({
            owner: response.data.data.owner
          });
        } else {
          resolve({});
        }
      })
      .catch((err) => {
        resolve({});
      });
  });
};
export default Record;
