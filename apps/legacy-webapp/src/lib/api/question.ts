import axios from 'axios'

export async function fetchQuestionDetails(questionId: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + `/api/v3/public/qt?question_id=${questionId}`)
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      throw new Error('Something went wrong with question details api.')
    })
}
