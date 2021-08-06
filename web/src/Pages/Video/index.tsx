import { FormEvent, useState } from 'react'
import styles from './styles.module.scss'

//http://localhost:3000/videos?current_video=15&sort_by=latest

export function VideoPage(){

    const [muteVideos, setMuteVideos] = useState<boolean>(true)

    const autoResizeTextarea = (event:any) => {
        event.target.style.height = 'inherit'
        event.target.style.height = `${event.target.scrollHeight}px`
    }

    const handleSubmitSendComment = (event:FormEvent) => {
        event.preventDefault()
        alert('teste')
    }

    return (
        <div className={styles.container}>

            <div className={styles.accountAndOptionsContainer}>

                <header>
                    <div>
                        <img 
                            src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                        />
                        <div className={styles.videoOwnerInfos}>
                            <h1>LuisSilva</h1>
                            <h2>875k followers</h2>
                            <h2>Created 19/07/2020</h2>
                        </div>
                    </div>
                    <button>Follow</button>
                </header>

                <div className={styles.optionsContainer}>
                    <button>
                        <img
                            src="/Like.png"
                        />
                        <label>Like</label>
                    </button>
                    <button onClick={() => {setMuteVideos(!muteVideos)}}>
                        <img
                            src="/unmute.png"
                            id={styles.soundImage}
                        />
                        <label>Unmute</label>
                    </button>
                </div>
            </div>

            <div className={styles.videoContainer}>
                <button className={styles.previousButton}>
                    <img src="/Caret.svg"/>
                </button>
                
                <video
                    autoPlay
                    loop={true}
                    muted={muteVideos}
                >
                    <source 
                        src="http://127.0.0.1:5000/video/89f2ec467113496ca9c39cde389579bf-2021-08-06.ogv"
                        type="video/ogg"
                    />
                    Your browser does not support the video tag.
                </video>

                <button className={styles.nextButton}>
                    <img src="/Caret.svg"/>
                </button>
            </div>

            <div className={styles.comentsArea}>
                <div className={styles.videoDescriptionContainer}>
                    <img 
                            src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                    />
                    <div className={styles.videoDescriptionAndInfosContainer}>
                        <h1>Luis silva</h1>
                        <p>
                            A Microsoft revelou nesta semana, durante a Build 2014, imagens
                            do que deve ser a sua versão do Windows para carros.
                        </p>

                        <div className={styles.videoInfosContainer}>
                            <div>
                                <label>12k</label>
                                <img
                                    alt="Comments"
                                    src="/Comments.png"
                                />
                            </div>
                            <div>
                                <label>136k</label>
                                <img
                                    alt="Likes"
                                    src="/Like.png"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.commentsContainer}>
                    <div className={styles.comment}>
                        <img 
                            src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                        />
                        <div>
                            <h1>Usuario</h1>
                            <p>
                                Creio que windows consiga evoluir a um ponto de estabilidade para 
                                se tornar seguro o suficiente para controlar carros
                            </p>
                        </div>
                    </div>
                    <div className={styles.comment}>
                        <img 
                            src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                        />
                        <div>
                            <h1>Usuario</h1>
                            <p>
                                Creio que windows consiga evoluir a um ponto de estabilidade para 
                                se tornar seguro o suficiente para controlar carros
                            </p>
                        </div>
                    </div>
                    <div className={styles.comment}>
                        <img 
                            src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                        />
                        <div>
                            <h1>Usuario</h1>
                            <p>
                                Creio que windows consiga evoluir a um ponto de estabilidade para 
                                se tornar seguro o suficiente para controlar carros
                            </p>
                        </div>
                    </div>
                    <div className={styles.comment}>
                        <img 
                            src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                        />
                        <div>
                            <h1>Usuario</h1>
                            <p>
                                Creio que windows consiga evoluir a um ponto de estabilidade para 
                                se tornar seguro o suficiente para controlar carros
                            </p>
                        </div>
                    </div>
                    <div className={styles.comment}>
                        <img 
                            src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                        />
                        <div>
                            <h1>Usuario</h1>
                            <p>
                                Creio que windows consiga evoluir a um ponto de estabilidade para 
                                se tornar seguro o suficiente para controlar carros
                            </p>
                        </div>
                    </div>
                    <div className={styles.comment}>
                        <img 
                            src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                        />
                        <div>
                            <h1>Usuario</h1>
                            <p>
                                Creio que windows consiga evoluir a um ponto de estabilidade para 
                                se tornar seguro o suficiente para controlar carros
                            </p>
                        </div>
                    </div>
                    <div className={styles.comment}>
                        <img 
                            src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                        />
                        <div>
                            <h1>Usuario</h1>
                            <p>
                                Creio que windows consiga evoluir a um ponto de estabilidade para 
                                se tornar seguro o suficiente para controlar carros
                            </p>
                        </div>
                    </div>
                    <div className={styles.comment}>
                        <img 
                            src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                        />
                        <div>
                            <h1>Usuario</h1>
                            <p>
                                Creio que windows consiga evoluir a um ponto de estabilidade para 
                                se tornar seguro o suficiente para controlar carros
                            </p>
                        </div>
                    </div>
                    <div className={styles.comment}>
                        <img 
                            src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                        />
                        <div>
                            <h1>Usuario</h1>
                            <p>
                                Creio que windows consiga evoluir a um ponto de estabilidade para 
                                se tornar seguro o suficiente para controlar carros
                            </p>
                        </div>
                    </div>
                    <div className={styles.comment}>
                        <img 
                            src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                        />
                        <div>
                            <h1>Usuario</h1>
                            <p>
                                Creio que windows consiga evoluir a um ponto de estabilidade para 
                                se tornar seguro o suficiente para controlar carros
                            </p>
                        </div>
                    </div>
                    <div className={styles.comment}>
                        <img 
                            src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                        />
                        <div>
                            <h1>Usuario</h1>
                            <p>
                                Creio que windows consiga evoluir a um ponto de estabilidade para 
                                se tornar seguro o suficiente para controlar carros
                            </p>
                        </div>
                    </div>
                    <div className={styles.comment}>
                        <img 
                            src="https://i.pinimg.com/236x/c5/16/bb/c516bb6c5d3e2b608977bc5b721b7e75.jpg"
                        />
                        <div>
                            <h1>Ultimo</h1>
                            <p>
                                Creio que windows consiga evoluir a um ponto de estabilidade para 
                                se tornar seguro o suficiente para controlar carros
                            </p>
                        </div>
                    </div> 
                </div>
                
                <form className={styles.createCommentContainer}>
                    <textarea onChange={autoResizeTextarea} rows={1}/>
                    <button type="submit">
                        Comentar
                    </button>
                </form>
            </div>

        </div>
    )
}