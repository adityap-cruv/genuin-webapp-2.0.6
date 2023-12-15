/**
 * Add only <li></li> elements in it.
 * @param param0
 * @returns
 */

// TODO: Work on this component make it fully separated.
export default function CustomDecorativeList({ children }: any) {
  return (
    <div>
      <style>
        {`          
                ul li.has-child::before {
                  display: none;
                }
                
                ul li::before {
                  content: '';
                  width: 2em;
                  height: 10px;
                  border-bottom-left-radius: 10px;
                  border-color: red;
                  border-bottom: 2px solid #e7e7e7;
                  border-left: 2px solid #e7e7e7;
                  position: absolute;
                  left: -2.1em;
                  top: 50%;
                  transform: translateY(-100%);
                }
              `}
      </style>
      <ul
        style={{
          borderLeft: '2px solid',
          paddingLeft: '2em',
          marginLeft: '22px',
          height: 'fit-content',
          borderImage: 'linear-gradient(to bottom, #e7e7e7 76%, transparent 50%) 1',
        }}>
        {children}
      </ul>
    </div>
  )
}
