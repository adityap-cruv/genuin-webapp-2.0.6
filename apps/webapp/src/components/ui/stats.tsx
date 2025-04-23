type Props = {
  /**
   * Here statsData accept array of object in which you pass key the statTitle, and
   * value which accepts value of stat
   */
  statsData: Array<{ key: string; value: number }>
}

export function Stats({ statsData }: Props) {
  return (
    <div className="m-1 ml-0 flex justify-evenly p-1 pl-0">
      {statsData.map((obj, index) => {
        return (
          <div key={index}>
            <p className="text-title-2-bold">{obj.value}</p>
            <p className="text-cap-1-demi">{obj.key}</p>
          </div>
        )
      })}
    </div>
  )
}
