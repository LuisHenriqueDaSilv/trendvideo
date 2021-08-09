import Bounce from 'react-reveal/Bounce'

import styles from './styles.module.scss'

export function EndListMessage({type}:{type:'initial'|'end'}){

    return (
        <div
            className={styles.container}
        >
            <Bounce 
                top={type==="initial"}
                bottom={type==="end"}
            >
                {
                    type==="initial"? (
                        <h1>
                            This is the beginning of everything
                        </h1>
                    ): (
                        <h1>
                            This is the end! try reload page to get latests videos or come back
                        </h1>
                    )
                }
            </Bounce>
        </div>
    )
}