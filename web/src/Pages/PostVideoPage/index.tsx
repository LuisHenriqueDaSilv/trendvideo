import styles from './styles.module.scss'

export function PostVideoPage(){

    const handleChangeTextArea = (event:any) => {

        event.target.style.height = 'inherit'
        event.target.style.height = `${event.target.scrollHeight}px`
    }

    return (
        <div
            className={styles.overlay}
        > 
            <div className={styles.container}>

                <section className={styles.videoInfosSection}>

                    <div className={styles.descriptionArea}>
                        <label>Video Description</label>
                        <textarea
                            onChange={handleChangeTextArea} 
                        />
                    </div>

                    <div className={styles.thumbnailArea}>
                        <header>
                            <h1>Video Thumbnail</h1>
                        </header>

                        <div>
                            <div className={styles.thumbnailTextImage}>
                                <p>
                                    Drop video Thumbnail here or click to search file
                                </p>
                                <button>
                                    Remove thumbnail
                                </button>
                            </div>
                            <div 
                                className={styles.thumbnailImage}
                                style={{
                                    backgroundImage: `url(http://127.0.0.1:5000//videos/thumbnail/6b6bd74a110b4cbda5b6881b4012075d-2021-08-19.png)`
                                }}
                            />
                        </div>

                    </div>

                    <button className={styles.postVideoButton}>
                        Post Video
                    </button>

                </section>

                <section>

                    <div>
                        <p>
                            Drop Video Here or click to search video
                        </p>
                    </div>

                    <button>
                        Remove Video
                    </button>

                </section>

            </div>
        </div>
    )
}