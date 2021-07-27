import styles from './styles.module.scss'

export function Watermark(){
    return(
        <a href="https://github.com/LuisHenriqueDaSilv" rel="noreferrer" target="_blank" className={styles.container}>
            <h1>developed by: LuisSilva</h1>
        </a>
    )
}